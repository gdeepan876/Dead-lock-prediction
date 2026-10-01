export type ProcessId = string;
export type ResourceId = string;

export type Vector = number[];
export type Matrix = number[][];
export type NullableMatrix = (number | null)[][];

export interface ProcessResourceCheck {
  resource: string;
  resourceIndex: number;
  need: number;
  work: number;
  satisfied: boolean;
}

export type StepType = 
  | 'INITIAL'
  | 'EVALUATING'
  | 'APPROVED_ALLOCATION'
  | 'CANNOT_ALLOCATE'
  | 'ALL_COMPLETED'
  | 'UNSAFE_HALT';

export interface AlgorithmStep {
  stepNumber: number;
  type: StepType;
  processIndex: number | null;
  processId: string | null;
  workBefore: Vector;
  workAfter: Vector;
  need: Vector | null;
  allocation: Vector | null;
  canAllocate: boolean | null;
  comparisons: ProcessResourceCheck[] | null;
  description: string;
  safeSequenceSoFar: string[];
  finished: boolean[];
}

export interface WorkProgressionRecord {
  step: number;
  processId: string;
  processIndex: number;
  workBefore: Vector;
  allocationReturned: Vector;
  workAfter: Vector;
}

export interface SafetyCheckResult {
  isSafe: boolean;
  deadlockRisk: 'NO' | 'YES';
  safeSequence: string[];
  steps: AlgorithmStep[];
  workProgression: WorkProgressionRecord[];
  blockedProcesses: string[];
  finalWork: Vector;
  explanation: string;
  failedReason?: string;
}

export type RequestStatus = 
  | 'APPROVED'
  | 'REJECTED_EXCEEDS_NEED'
  | 'WAIT_EXCEEDS_AVAILABLE'
  | 'REJECTED_UNSAFE';

export interface ResourceRequest {
  processIndex: number;
  processId: string;
  request: Vector;
}

export interface RequestEvaluationResult {
  status: RequestStatus;
  title: string;
  message: string;
  condition: string;
  explanation: string;
  tentativeResult?: SafetyCheckResult;
  newAllocation?: Matrix;
  newAvailable?: Vector;
  newNeed?: Matrix;
}

export interface BankerSystemState {
  numProcesses: number;
  numResources: number;
  processNames: string[];
  resourceNames: string[];
  allocation: Matrix;
  max: Matrix;
  available: Vector;
  need: Matrix;
}

export interface DeadlockSystemState {
  numProcesses: number;
  numResources: number;
  processNames: string[];
  resourceNames: string[];
  allocation: Matrix;
  request: Matrix;
  available: Vector;
}

export interface TransferredState {
  numProcesses: number;
  numResources: number;
  allocation: Matrix;
  available: Vector;
  processNames?: string[];
  resourceNames?: string[];
  fromSimulator: boolean;
  timestamp?: number;
}

export interface DeadlockResourceCheck {
  resource: string;
  resourceIndex: number;
  request: number;
  available: number;
  satisfied: boolean;
}

export interface DeadlockStep {
  stepNumber: number;
  processIndex: number | null;
  processId: string | null;
  type: 'INITIAL' | 'PROCESS_COMPLETED' | 'PROCESS_BLOCKED' | 'DEADLOCK_CONFIRMED' | 'ALL_FINISHED';
  workBefore: Vector;
  workAfter: Vector;
  allocation: Vector | null;
  request: Vector | null;
  comparisons: DeadlockResourceCheck[] | null;
  canComplete: boolean | null;
  description: string;
  finished: boolean[];
  completedSoFar: string[];
}

export interface DeadlockDetectionResult {
  isDeadlocked: boolean;
  isSafe: boolean;
  deadlockedProcesses: string[];
  completedProcesses: string[];
  safeSequence: string[];
  finalAvailable: Vector;
  steps: DeadlockStep[];
  explanation: string;
  deadlockReason?: string;
}

export interface ValidationIssue {
  field: 'allocation' | 'max' | 'request' | 'available' | 'config';
  processIndex?: number;
  resourceIndex?: number;
  message: string;
}

export interface SimulationHistoryEntry {
  id: string;
  timestamp: number;
  title: string;
  numProcesses: number;
  numResources: number;
  isSafe: boolean;
  deadlockRisk: 'NO' | 'YES';
  safeSequence: string[];
  summary: string;
}
