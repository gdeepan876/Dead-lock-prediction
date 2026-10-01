import {
  Matrix,
  Vector,
  SafetyCheckResult,
  AlgorithmStep,
  WorkProgressionRecord,
  ProcessResourceCheck,
  ValidationIssue,
  ResourceRequest,
  RequestEvaluationResult,
  BankerSystemState
} from '@/types/banker';

/**
 * Calculates Need matrix: Need[i][j] = Max[i][j] - Allocation[i][j]
 * Returns null for any cell where Max has not yet been entered.
 */
export function calculateNeedMatrix(
  max: (number | null)[][],
  allocation: Matrix
): (number | null)[][] {
  return max.map((row, i) =>
    row.map((val, j) => {
      if (val === null || val === undefined || isNaN(val)) {
        return null;
      }
      const alloc = allocation[i]?.[j] ?? 0;
      return Math.max(0, val - alloc);
    })
  );
}

/**
 * Validates Maximum Matrix values before running Banker's Algorithm:
 * - Checks if any Maximum cell is missing (null/empty/NaN)
 * - Checks Maximum[i][j] >= Allocation[i][j]
 */
export function validateBankerMaximum(
  allocation: Matrix,
  max: (number | null)[][]
): { isValid: boolean; errorMessage?: string } {
  if (!max || max.length !== allocation.length) {
    return {
      isValid: false,
      errorMessage: "Please enter valid Maximum values. Maximum must be greater than or equal to Allocation."
    };
  }

  for (let i = 0; i < allocation.length; i++) {
    const allocRow = allocation[i] || [];
    const maxRow = max[i];
    if (!maxRow || maxRow.length !== allocRow.length) {
      return {
        isValid: false,
        errorMessage: "Please enter valid Maximum values. Maximum must be greater than or equal to Allocation."
      };
    }

    for (let j = 0; j < allocRow.length; j++) {
      const maxVal = maxRow[j];
      const allocVal = allocRow[j] ?? 0;

      if (maxVal === null || maxVal === undefined || isNaN(maxVal)) {
        return {
          isValid: false,
          errorMessage: "Please enter valid Maximum values. Maximum must be greater than or equal to Allocation."
        };
      }

      if (maxVal < allocVal) {
        return {
          isValid: false,
          errorMessage: "Please enter valid Maximum values. Maximum must be greater than or equal to Allocation."
        };
      }
    }
  }

  return { isValid: true };
}

/**
 * Validate input matrices and vectors
 */
export function validateInputs(
  allocation: Matrix,
  max: (number | null)[][],
  available: Vector,
  processNames: string[],
  resourceNames: string[]
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // Check available
  available.forEach((val, j) => {
    if (isNaN(val) || val < 0) {
      issues.push({
        field: 'available',
        resourceIndex: j,
        message: `Available resource ${resourceNames[j] || `R${j}`} must be a non-negative integer.`
      });
    }
  });

  // Check allocation and max
  for (let i = 0; i < allocation.length; i++) {
    for (let j = 0; j < (allocation[i]?.length || 0); j++) {
      const allocVal = allocation[i]?.[j];
      const maxVal = max[i]?.[j];

      if (isNaN(allocVal) || allocVal < 0) {
        issues.push({
          field: 'allocation',
          processIndex: i,
          resourceIndex: j,
          message: `Allocation for ${processNames[i] || `P${i}`}, resource ${resourceNames[j] || `R${j}`} must be non-negative.`
        });
      }

      if (maxVal === null || maxVal === undefined || isNaN(maxVal)) {
        issues.push({
          field: 'max',
          processIndex: i,
          resourceIndex: j,
          message: `Please enter valid Maximum values. Maximum must be greater than or equal to Allocation.`
        });
      } else if (maxVal < 0) {
        issues.push({
          field: 'max',
          processIndex: i,
          resourceIndex: j,
          message: `Max for ${processNames[i] || `P${i}`}, resource ${resourceNames[j] || `R${j}`} must be non-negative.`
        });
      } else if (allocVal !== undefined && allocVal > maxVal) {
        issues.push({
          field: 'max',
          processIndex: i,
          resourceIndex: j,
          message: `Please enter valid Maximum values. Maximum must be greater than or equal to Allocation.`
        });
      }
    }
  }

  return issues;
}

/**
 * Pure TypeScript implementation of Banker's Safety Algorithm
 */
export function runBankersSafetyAlgorithm(
  allocation: Matrix,
  max: Matrix,
  available: Vector,
  processNames: string[],
  resourceNames: string[]
): SafetyCheckResult {
  const n = allocation.length;
  const m = available.length;
  const need: Matrix = max.map((row, i) =>
    row.map((val, j) => Math.max(0, val - (allocation[i]?.[j] ?? 0)))
  );

  const work: Vector = [...available];
  const finish: boolean[] = new Array(n).fill(false);
  const safeSequence: string[] = [];
  const steps: AlgorithmStep[] = [];
  const workProgression: WorkProgressionRecord[] = [];

  let stepNumber = 1;

  // Step 0: Initial state
  steps.push({
    stepNumber: stepNumber++,
    type: 'INITIAL',
    processIndex: null,
    processId: null,
    workBefore: [...work],
    workAfter: [...work],
    need: null,
    allocation: null,
    canAllocate: null,
    comparisons: null,
    description: `Initialized Banker's Safety Algorithm. Available / Work = [${work.map((w, idx) => `${resourceNames[idx]}:${w}`).join(', ')}]. All ${n} processes set to unfinished (Finish = false).`,
    safeSequenceSoFar: [],
    finished: [...finish]
  });

  let proceed = true;

  while (proceed) {
    let foundProcess = false;

    for (let i = 0; i < n; i++) {
      if (!finish[i]) {
        const pId = processNames[i] || `P${i}`;
        const pNeed = need[i];
        const pAlloc = allocation[i];

        // Check if Need[i] <= Work
        const comparisons: ProcessResourceCheck[] = [];
        let canSatisfy = true;

        for (let j = 0; j < m; j++) {
          const resNeed = pNeed[j] ?? 0;
          const resWork = work[j] ?? 0;
          const ok = resNeed <= resWork;
          comparisons.push({
            resource: resourceNames[j] || `R${j}`,
            resourceIndex: j,
            need: resNeed,
            work: resWork,
            satisfied: ok
          });
          if (!ok) {
            canSatisfy = false;
          }
        }

        if (canSatisfy) {
          const workBefore = [...work];
          for (let j = 0; j < m; j++) {
            work[j] += pAlloc[j] ?? 0;
          }
          finish[i] = true;
          safeSequence.push(pId);
          foundProcess = true;

          workProgression.push({
            step: safeSequence.length,
            processId: pId,
            processIndex: i,
            workBefore,
            allocationReturned: [...pAlloc],
            workAfter: [...work]
          });

          steps.push({
            stepNumber: stepNumber++,
            type: 'APPROVED_ALLOCATION',
            processIndex: i,
            processId: pId,
            workBefore,
            workAfter: [...work],
            need: [...pNeed],
            allocation: [...pAlloc],
            canAllocate: true,
            comparisons,
            description: `${pId} satisfied Need ≤ Work. Resources allocated and reclaimed upon simulated completion. Work updated: [${workBefore.join(', ')}] + [${pAlloc.join(', ')}] = [${work.join(', ')}].`,
            safeSequenceSoFar: [...safeSequence],
            finished: [...finish]
          });

          // Break to restart scanning from process 0 for standard deterministic sequence
          break;
        } else {
          // Record step that process i cannot finish right now
          steps.push({
            stepNumber: stepNumber++,
            type: 'CANNOT_ALLOCATE',
            processIndex: i,
            processId: pId,
            workBefore: [...work],
            workAfter: [...work],
            need: [...pNeed],
            allocation: [...pAlloc],
            canAllocate: false,
            comparisons,
            description: `${pId} cannot proceed currently: Need exceeds available Work (${comparisons
              .filter(c => !c.satisfied)
              .map(c => `${c.resource}: Need ${c.need} > Work ${c.work}`)
              .join(', ')}).`,
            safeSequenceSoFar: [...safeSequence],
            finished: [...finish]
          });
        }
      }
    }

    if (!foundProcess) {
      proceed = false;
    }
  }

  const isSafe = finish.every(Boolean);
  const blockedProcesses = finish
    .map((done, idx) => (!done ? (processNames[idx] || `P${idx}`) : null))
    .filter((id): id is string => id !== null);

  if (isSafe) {
    steps.push({
      stepNumber: stepNumber++,
      type: 'ALL_COMPLETED',
      processIndex: null,
      processId: null,
      workBefore: [...work],
      workAfter: [...work],
      need: null,
      allocation: null,
      canAllocate: true,
      comparisons: null,
      description: `All processes finished successfully! Complete safe sequence found: ${safeSequence.join(' → ')}. System is in a SAFE STATE with DEADLOCK RISK: NO.`,
      safeSequenceSoFar: [...safeSequence],
      finished: [...finish]
    });

    return {
      isSafe: true,
      deadlockRisk: 'NO',
      safeSequence,
      steps,
      workProgression,
      blockedProcesses: [],
      finalWork: work,
      explanation: `System is in a SAFE STATE. A valid safe execution sequence exists: ${safeSequence.join(' → ')}. Each process can finish without starving or causing circular wait.`
    };
  } else {
    const failedReason = `No remaining process could satisfy Need ≤ Work with the available resources [${work.map((w, idx) => `${resourceNames[idx]}:${w}`).join(', ')}]. Blocked processes: ${blockedProcesses.join(', ')}.`;

    steps.push({
      stepNumber: stepNumber++,
      type: 'UNSAFE_HALT',
      processIndex: null,
      processId: null,
      workBefore: [...work],
      workAfter: [...work],
      need: null,
      allocation: null,
      canAllocate: false,
      comparisons: null,
      description: `Deadlock Avoidance check halted: Unsafe state detected! ${failedReason}`,
      safeSequenceSoFar: [...safeSequence],
      finished: [...finish]
    });

    return {
      isSafe: false,
      deadlockRisk: 'YES',
      safeSequence,
      steps,
      workProgression,
      blockedProcesses,
      finalWork: work,
      explanation: `System is in an UNSAFE STATE (Deadlock Risk: YES). Banker's Algorithm could not find a complete safe sequence. If processes request maximum resources simultaneously, circular wait deadlock may occur.`,
      failedReason
    };
  }
}

/**
 * Resource Request Algorithm (Section 7 Prevention / Resolution Flow)
 */
export function evaluateResourceRequest(
  allocation: Matrix,
  max: Matrix,
  available: Vector,
  requestObj: ResourceRequest,
  processNames: string[],
  resourceNames: string[]
): RequestEvaluationResult {
  const { processIndex, processId, request } = requestObj;
  const need: Matrix = max.map((row, i) =>
    row.map((val, j) => Math.max(0, val - (allocation[i]?.[j] ?? 0)))
  );
  const pNeed = need[processIndex];

  if (!pNeed) {
    return {
      status: 'REJECTED_EXCEEDS_NEED',
      title: 'Invalid Process',
      message: `Process index ${processIndex} (${processId}) does not exist in system.`,
      condition: 'Invalid process identifier',
      explanation: 'Please select a valid process to request resources.'
    };
  }

  // 1. Check Request <= Need
  for (let j = 0; j < request.length; j++) {
    const reqVal = request[j] || 0;
    const needVal = pNeed[j] || 0;
    const resName = resourceNames[j] || `R${j}`;

    if (reqVal > needVal) {
      return {
        status: 'REJECTED_EXCEEDS_NEED',
        title: 'Invalid Request — Exceeds Declared Maximum Need',
        message: `Process ${processId} requested ${reqVal} of ${resName}, but only has declared remaining Need of ${needVal}.`,
        condition: 'Request ≤ Need failed',
        explanation: `Under Banker's Algorithm, a process cannot request more resources than its remaining maximum claim (Need = Max − Allocation). Request is rejected immediately.`
      };
    }
  }

  // 2. Check Request <= Available
  for (let j = 0; j < request.length; j++) {
    const reqVal = request[j] || 0;
    const availVal = available[j] || 0;
    const resName = resourceNames[j] || `R${j}`;

    if (reqVal > availVal) {
      return {
        status: 'WAIT_EXCEEDS_AVAILABLE',
        title: 'Resources Unavailable — Process Must Wait',
        message: `Process ${processId} requested ${reqVal} of ${resName}, but only ${availVal} is currently available in the system.`,
        condition: 'Request ≤ Available failed',
        explanation: `System currently does not have enough free resources to fulfill this request. Process ${processId} must wait until other running processes release resources.`
      };
    }
  }

  // 3. Pretend Allocation (Tentative State)
  const tentativeAllocation: Matrix = allocation.map((row, i) =>
    i === processIndex ? row.map((val, j) => val + (request[j] || 0)) : [...row]
  );

  const tentativeAvailable: Vector = available.map(
    (val, j) => val - (request[j] || 0)
  );

  const tentativeNeed: Matrix = max.map((row, i) =>
    row.map((val, j) => Math.max(0, val - (tentativeAllocation[i]?.[j] ?? 0)))
  );

  // Run safety algorithm on tentative state
  const tentativeSafety = runBankersSafetyAlgorithm(
    tentativeAllocation,
    max,
    tentativeAvailable,
    processNames,
    resourceNames
  );

  if (tentativeSafety.isSafe) {
    return {
      status: 'APPROVED',
      title: 'Request Approved — System Remains Safe',
      message: `The request by ${processId} was tentatively granted and the resulting state is safe (Safe sequence: ${tentativeSafety.safeSequence.join(' → ')}).`,
      condition: 'Request ≤ Need && Request ≤ Available && Tentative State is Safe',
      explanation: `Because a safe sequence exists following this allocation, granting these resources cannot lead to a deadlock. The request is safely approved.`,
      tentativeResult: tentativeSafety,
      newAllocation: tentativeAllocation,
      newAvailable: tentativeAvailable,
      newNeed: tentativeNeed
    };
  } else {
    return {
      status: 'REJECTED_UNSAFE',
      title: 'Request Rejected — Unsafe State Avoided',
      message: `Granting the request of ${processId} would leave the system in an UNSAFE STATE (Deadlock Risk: YES).`,
      condition: 'Tentative State is Unsafe (Safety check failed)',
      explanation: `To prevent deadlock, Banker's Algorithm rejects this request and retains the original system state. Process ${processId} must wait.`,
      tentativeResult: tentativeSafety
    };
  }
}

/**
 * Standard Presets for Demonstration
 */
export const PRESETS: { [key: string]: BankerSystemState } = {
  safeSilberschatz: {
    numProcesses: 5,
    numResources: 3,
    processNames: ['P0', 'P1', 'P2', 'P3', 'P4'],
    resourceNames: ['A', 'B', 'C'],
    allocation: [
      [0, 1, 0],
      [2, 0, 0],
      [3, 0, 2],
      [2, 1, 1],
      [0, 0, 2]
    ],
    max: [
      [7, 5, 3],
      [3, 2, 2],
      [9, 0, 2],
      [2, 2, 2],
      [4, 3, 3]
    ],
    available: [3, 3, 2],
    need: [
      [7, 4, 3],
      [1, 2, 2],
      [6, 0, 0],
      [0, 1, 1],
      [4, 3, 1]
    ]
  },
  unsafeExample: {
    numProcesses: 5,
    numResources: 3,
    processNames: ['P0', 'P1', 'P2', 'P3', 'P4'],
    resourceNames: ['A', 'B', 'C'],
    allocation: [
      [0, 1, 0],
      [3, 0, 2],
      [3, 0, 2],
      [2, 1, 1],
      [0, 0, 2]
    ],
    max: [
      [7, 5, 3],
      [3, 2, 2],
      [9, 0, 2],
      [2, 2, 2],
      [4, 3, 3]
    ],
    available: [0, 2, 0],
    need: [
      [7, 4, 3],
      [0, 2, 0],
      [6, 0, 0],
      [0, 1, 1],
      [4, 3, 1]
    ]
  },
  safeExample4x4: {
    numProcesses: 4,
    numResources: 4,
    processNames: ['P0', 'P1', 'P2', 'P3'],
    resourceNames: ['A', 'B', 'C', 'D'],
    allocation: [
      [0, 0, 1, 2],
      [1, 0, 0, 0],
      [1, 3, 5, 4],
      [0, 6, 3, 2]
    ],
    max: [
      [0, 0, 1, 2],
      [1, 7, 5, 0],
      [2, 3, 5, 6],
      [0, 6, 5, 2]
    ],
    available: [1, 5, 2, 0],
    need: [
      [0, 0, 0, 0],
      [0, 7, 5, 0],
      [1, 0, 0, 2],
      [0, 0, 2, 0]
    ]
  }
};
