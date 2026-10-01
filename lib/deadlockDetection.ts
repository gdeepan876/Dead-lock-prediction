import {
  Matrix,
  Vector,
  DeadlockDetectionResult,
  DeadlockStep,
  DeadlockResourceCheck,
  ValidationIssue,
  DeadlockSystemState
} from '@/types/banker';

/**
 * Validate input matrices and vectors for Deadlock Detection
 */
export function validateDeadlockInputs(
  allocation: Matrix,
  request: Matrix,
  available: Vector,
  processNames: string[],
  resourceNames: string[]
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // Check available vector
  available.forEach((val, j) => {
    if (isNaN(val) || val < 0) {
      issues.push({
        field: 'available',
        resourceIndex: j,
        message: `Available resource ${resourceNames[j] || `R${j}`} must be a non-negative integer.`
      });
    }
  });

  // Check allocation and request matrices
  for (let i = 0; i < allocation.length; i++) {
    for (let j = 0; j < (allocation[i]?.length || 0); j++) {
      const allocVal = allocation[i]?.[j];
      const reqVal = request[i]?.[j];

      if (isNaN(allocVal) || allocVal < 0) {
        issues.push({
          field: 'allocation',
          processIndex: i,
          resourceIndex: j,
          message: `Allocation for ${processNames[i] || `P${i}`}, resource ${resourceNames[j] || `R${j}`} must be non-negative.`
        });
      }

      if (isNaN(reqVal) || reqVal < 0) {
        issues.push({
          field: 'request',
          processIndex: i,
          resourceIndex: j,
          message: `Request for ${processNames[i] || `P${i}`}, resource ${resourceNames[j] || `R${j}`} must be non-negative.`
        });
      }
    }
  }

  return issues;
}

/**
 * Pure Deadlock Detection Algorithm (Silberschatz / Operating Systems Standard)
 *
 * Let Work = Available.
 * For i = 0, 1, ..., n-1:
 *   If Allocation[i] != 0, Finish[i] = false.
 *   Else Finish[i] = true (processes holding no resources cannot be part of deadlock).
 *
 * Find an index i such that:
 *   Finish[i] == false and Request[i] <= Work.
 * If found:
 *   Work = Work + Allocation[i]
 *   Finish[i] = true
 *   repeat
 *
 * If Finish[i] == false for some i, then process Pi is deadlocked!
 */
export function detectDeadlock(
  allocation: Matrix,
  request: Matrix,
  available: Vector,
  processNames: string[],
  resourceNames: string[]
): DeadlockDetectionResult {
  const n = allocation.length;
  const m = available.length;

  const work: Vector = [...available];
  const finish: boolean[] = new Array(n).fill(false);
  const completedProcesses: string[] = [];
  const steps: DeadlockStep[] = [];

  let stepNumber = 1;

  // Initial check: processes with Allocation == 0 already finished
  for (let i = 0; i < n; i++) {
    const isAllocZero = allocation[i].every(val => (val ?? 0) === 0);
    if (isAllocZero) {
      finish[i] = true;
    }
  }

  steps.push({
    stepNumber: stepNumber++,
    processIndex: null,
    processId: null,
    type: 'INITIAL',
    workBefore: [...work],
    workAfter: [...work],
    allocation: null,
    request: null,
    comparisons: null,
    canComplete: null,
    description: `Initialized Deadlock Detection. Available Vector = [${work.map((w, idx) => `${resourceNames[idx] || `R${idx}`}:${w}`).join(', ')}].`,
    finished: [...finish],
    completedSoFar: []
  });

  let proceed = true;

  while (proceed) {
    let foundProcess = false;

    for (let i = 0; i < n; i++) {
      if (!finish[i]) {
        const pId = processNames[i] || `P${i}`;
        const pReq = request[i] || [];
        const pAlloc = allocation[i] || [];

        // Check if Request[i] <= Work
        const comparisons: DeadlockResourceCheck[] = [];
        let canSatisfy = true;

        for (let j = 0; j < m; j++) {
          const reqVal = pReq[j] ?? 0;
          const workVal = work[j] ?? 0;
          const ok = reqVal <= workVal;
          comparisons.push({
            resource: resourceNames[j] || `R${j}`,
            resourceIndex: j,
            request: reqVal,
            available: workVal,
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
          completedProcesses.push(pId);
          foundProcess = true;

          steps.push({
            stepNumber: stepNumber++,
            processIndex: i,
            processId: pId,
            type: 'PROCESS_COMPLETED',
            workBefore,
            workAfter: [...work],
            allocation: [...pAlloc],
            request: [...pReq],
            comparisons,
            canComplete: true,
            description: `${pId} Request [${pReq.join(', ')}] ≤ Available [${workBefore.join(', ')}]. ${pId} completes and releases Allocation [${pAlloc.join(', ')}]. New Available: [${work.join(', ')}].`,
            finished: [...finish],
            completedSoFar: [...completedProcesses]
          });

          // Restart scan to find next candidate
          break;
        } else {
          steps.push({
            stepNumber: stepNumber++,
            processIndex: i,
            processId: pId,
            type: 'PROCESS_BLOCKED',
            workBefore: [...work],
            workAfter: [...work],
            allocation: [...pAlloc],
            request: [...pReq],
            comparisons,
            canComplete: false,
            description: `${pId} cannot complete right now: Request exceeds Available (${comparisons
              .filter(c => !c.satisfied)
              .map(c => `${c.resource}: Request ${c.request} > Available ${c.available}`)
              .join(', ')}).`,
            finished: [...finish],
            completedSoFar: [...completedProcesses]
          });
        }
      }
    }

    if (!foundProcess) {
      proceed = false;
    }
  }

  const deadlockedIndices = finish
    .map((isDone, idx) => (!isDone ? idx : -1))
    .filter(idx => idx !== -1);

  const deadlockedProcesses = deadlockedIndices.map(
    idx => processNames[idx] || `P${idx}`
  );

  const isDeadlocked = deadlockedProcesses.length > 0;

  if (!isDeadlocked) {
    steps.push({
      stepNumber: stepNumber++,
      processIndex: null,
      processId: null,
      type: 'ALL_FINISHED',
      workBefore: [...work],
      workAfter: [...work],
      allocation: null,
      request: null,
      comparisons: null,
      canComplete: true,
      description: `All processes were able to complete using available resources. Execution sequence: ${completedProcesses.join(' → ')}. System is safe and no deadlock is present.`,
      finished: [...finish],
      completedSoFar: [...completedProcesses]
    });

    return {
      isDeadlocked: false,
      isSafe: true,
      deadlockedProcesses: [],
      completedProcesses,
      safeSequence: completedProcesses,
      finalAvailable: work,
      steps,
      explanation: `All processes can complete with available resources. System was able to fulfill all pending requests sequentially without circular dependency. Safe execution order: ${completedProcesses.join(' → ')}.`
    };
  } else {
    // Generate clear reason why remaining processes cannot obtain required resources
    const blockedReasons = deadlockedIndices.map(idx => {
      const pId = processNames[idx] || `P${idx}`;
      const pReq = request[idx] || [];
      const lacking = [];
      for (let j = 0; j < m; j++) {
        const rName = resourceNames[j] || `R${j}`;
        if ((pReq[j] ?? 0) > (work[j] ?? 0)) {
          lacking.push(`${rName} (Needs ${(pReq[j] ?? 0)}, only ${(work[j] ?? 0)} free)`);
        }
      }
      return `${pId} needs ${lacking.join(', ')}`;
    });

    const deadlockReason = `The following process(es) cannot obtain their required resources: ${blockedReasons.join('; ')}. Because each holds allocated resources while waiting indefinitely for others to release resources, a circular wait / deadlock condition is formed.`;

    steps.push({
      stepNumber: stepNumber++,
      processIndex: null,
      processId: null,
      type: 'DEADLOCK_CONFIRMED',
      workBefore: [...work],
      workAfter: [...work],
      allocation: null,
      request: null,
      comparisons: null,
      canComplete: false,
      description: `Deadlock Detected! ${deadlockReason}`,
      finished: [...finish],
      completedSoFar: [...completedProcesses]
    });

    return {
      isDeadlocked: true,
      isSafe: false,
      deadlockedProcesses,
      completedProcesses,
      safeSequence: completedProcesses,
      finalAvailable: work,
      steps,
      explanation: `Deadlock detected in the system! The following processes are deadlocked: ${deadlockedProcesses.join(', ')}. They are waiting indefinitely for resources that are currently held by other processes or unavailable in the system.`,
      deadlockReason
    };
  }
}

/**
 * Standard Presets for Deadlock Detection Simulator
 */
export const DEADLOCK_PRESETS: { [key: string]: DeadlockSystemState } = {
  safeSilberschatz: {
    numProcesses: 5,
    numResources: 3,
    processNames: ['P0', 'P1', 'P2', 'P3', 'P4'],
    resourceNames: ['A', 'B', 'C'],
    allocation: [
      [0, 1, 0],
      [2, 0, 0],
      [3, 0, 3],
      [2, 1, 1],
      [0, 0, 2]
    ],
    request: [
      [0, 0, 0],
      [2, 0, 2],
      [0, 0, 0],
      [1, 0, 0],
      [0, 0, 2]
    ],
    available: [0, 0, 0]
  },
  unsafeDeadlock: {
    numProcesses: 5,
    numResources: 3,
    processNames: ['P0', 'P1', 'P2', 'P3', 'P4'],
    resourceNames: ['A', 'B', 'C'],
    allocation: [
      [0, 1, 0],
      [2, 0, 0],
      [3, 0, 3],
      [2, 1, 1],
      [0, 0, 2]
    ],
    request: [
      [0, 0, 0],
      [2, 0, 2],
      [0, 0, 1], // P2 requests 1 additional of C
      [1, 0, 0],
      [0, 0, 2]
    ],
    available: [0, 0, 0]
  },
  classicTwoProcess: {
    numProcesses: 2,
    numResources: 2,
    processNames: ['P1', 'P2'],
    resourceNames: ['R1', 'R2'],
    allocation: [
      [1, 0], // P1 holds R1
      [0, 1]  // P2 holds R2
    ],
    request: [
      [0, 1], // P1 requests R2
      [1, 0]  // P2 requests R1
    ],
    available: [0, 0]
  }
};
