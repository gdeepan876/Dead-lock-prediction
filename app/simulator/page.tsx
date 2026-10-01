"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Matrix,
  Vector,
  DeadlockDetectionResult,
  ValidationIssue
} from "@/types/banker";
import {
  detectDeadlock,
  validateDeadlockInputs,
  DEADLOCK_PRESETS
} from "@/lib/deadlockDetection";

import AllocationMatrix from "@/components/AllocationMatrix";
import RequestMatrix from "@/components/RequestMatrix";
import AvailableVector from "@/components/AvailableVector";
import ResultPanel from "@/components/ResultPanel";
import SafeSequence from "@/components/SafeSequence";

import {
  Cpu,
  Layers,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Play,
  Settings,
  ArrowRight,
  Info,
  ShieldCheck,
  FileText,
  Activity,
  History
} from "lucide-react";

function DeadlockSimulatorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const presetQuery = searchParams.get("preset");

  // System Configuration State
  const [numProcesses, setNumProcesses] = useState<number>(5);
  const [numResources, setNumResources] = useState<number>(3);

  // Matrices: Allocation, Request, Available
  const [allocation, setAllocation] = useState<Matrix>(
    DEADLOCK_PRESETS.safeSilberschatz.allocation
  );
  const [request, setRequest] = useState<Matrix>(
    DEADLOCK_PRESETS.safeSilberschatz.request
  );
  const [available, setAvailable] = useState<Vector>(
    DEADLOCK_PRESETS.safeSilberschatz.available
  );

  // Results State
  const [detectionResult, setDetectionResult] = useState<DeadlockDetectionResult | null>(null);
  const [showTrace, setShowTrace] = useState<boolean>(false);

  // Process and Resource Names
  const processNames = useMemo(() => {
    return Array.from({ length: numProcesses }, (_, i) => `P${i}`);
  }, [numProcesses]);

  const resourceNames = useMemo(() => {
    const letters = "ABCDEFGH";
    return Array.from({ length: numResources }, (_, i) => letters[i] || `R${i + 1}`);
  }, [numResources]);

  // Validation
  const validationIssues: ValidationIssue[] = useMemo(() => {
    return validateDeadlockInputs(
      allocation,
      request,
      available,
      processNames,
      resourceNames
    );
  }, [allocation, request, available, processNames, resourceNames]);

  const hasErrors = validationIssues.length > 0;

  // Handle URL preset loading
  useEffect(() => {
    if (presetQuery && DEADLOCK_PRESETS[presetQuery]) {
      loadPreset(presetQuery);
    }
  }, [presetQuery]);

  const loadPreset = (presetKey: string) => {
    const p = DEADLOCK_PRESETS[presetKey];
    if (!p) return;
    setNumProcesses(p.numProcesses);
    setNumResources(p.numResources);
    setAllocation(p.allocation);
    setRequest(p.request);
    setAvailable(p.available);
    setDetectionResult(null);
  };

  // Re-dimension matrices when user adjusts process or resource count
  const handleConfigChange = (newP: number, newR: number) => {
    const clampedP = Math.max(2, Math.min(8, newP));
    const clampedR = Math.max(2, Math.min(6, newR));

    setNumProcesses(clampedP);
    setNumResources(clampedR);

    const newAlloc: Matrix = Array.from({ length: clampedP }, (_, i) =>
      Array.from({ length: clampedR }, (_, j) => allocation[i]?.[j] ?? 0)
    );
    const newReq: Matrix = Array.from({ length: clampedP }, (_, i) =>
      Array.from({ length: clampedR }, (_, j) => request[i]?.[j] ?? 0)
    );
    const newAvail: Vector = Array.from({ length: clampedR }, (_, j) => available[j] ?? 0);

    setAllocation(newAlloc);
    setRequest(newReq);
    setAvailable(newAvail);
    setDetectionResult(null);
  };

  // Execute Deadlock Detection Algorithm (Section 4)
  const handleAnalyzeSystem = () => {
    if (hasErrors) return;
    const res = detectDeadlock(
      allocation,
      request,
      available,
      processNames,
      resourceNames
    );
    setDetectionResult(res);
  };

  // Transfer state to Banker's Algorithm
  const handleContinueToBanker = () => {
    const payload = {
      numProcesses,
      numResources,
      allocation,
      available,
      fromSimulator: true,
      timestamp: Date.now()
    };
    try {
      sessionStorage.setItem("banker_transferred_state", JSON.stringify(payload));
    } catch (e) {
      console.error("Failed to save state to sessionStorage", e);
    }
    router.push("/banker?from=simulator&carried=true");
  };

  // Reset to default safe scenario
  const handleReset = () => {
    loadPreset("safeSilberschatz");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 flex flex-col gap-6">
      {/* Top Banner / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-1">
            <Cpu className="w-4 h-4" />
            <span>Deadlock Simulator &bull; Section 3 &amp; 4</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Deadlock Detection System
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Analyze Allocation and Request matrices to detect circular wait and determine whether processes can complete with available resources.
          </p>
        </div>

        {/* Quick Demo Data Buttons (Section 13) */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-medium mr-1">Demo Data:</span>
          <button
            onClick={() => loadPreset("safeSilberschatz")}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 transition-colors"
          >
            Load Safe Example
          </button>
          <button
            onClick={() => loadPreset("unsafeDeadlock")}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 transition-colors"
          >
            Load Unsafe Example
          </button>
          <button
            onClick={() => loadPreset("classicTwoProcess")}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-colors"
            title="Load 2-Process P1/R1/R2/P2 circular deadlock"
          >
            2-Process Deadlock
          </button>
          <button
            onClick={handleReset}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* System Configuration Controls */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Settings className="w-4 h-4 text-cyan-400" />
              <span>Matrix Dimensions &amp; System Parameters</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Processes: {processNames.join(", ")} &bull; Resources: {resourceNames.join(", ")}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-slate-300">Number of Processes:</label>
              <input
                type="number"
                min="2"
                max="8"
                value={numProcesses}
                onChange={(e) => handleConfigChange(parseInt(e.target.value, 10), numResources)}
                className="w-14 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-center text-sm font-bold text-cyan-300 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-slate-300">Number of Resources:</label>
              <input
                type="number"
                min="2"
                max="6"
                value={numResources}
                onChange={(e) => handleConfigChange(numProcesses, parseInt(e.target.value, 10))}
                className="w-14 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-center text-sm font-bold text-cyan-300 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* Validation Errors banner */}
        {hasErrors && (
          <div className="mt-3 p-3 rounded-lg bg-rose-950/40 border border-rose-500/50 text-xs text-rose-200">
            <div className="flex items-center gap-1.5 font-bold mb-1">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Input Validation Error</span>
            </div>
            <ul className="list-disc list-inside space-y-0.5">
              {validationIssues.map((iss, idx) => (
                <li key={idx}>{iss.message}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Available Resources Vector Input (Section 3 & 4) */}
      <AvailableVector
        vector={available}
        resourceNames={resourceNames}
        onChangeVector={setAvailable}
        validationIssues={validationIssues}
        title="Available Vector"
        description="Free instances of each resource currently unallocated in the system (Available = resources currently free)"
      />

      {/* Editable Allocation Matrix and Editable Request Matrix (Section 3 & 4) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AllocationMatrix
          matrix={allocation}
          processNames={processNames}
          resourceNames={resourceNames}
          onChangeMatrix={setAllocation}
          validationIssues={validationIssues}
        />

        <RequestMatrix
          matrix={request}
          processNames={processNames}
          resourceNames={resourceNames}
          onChangeMatrix={setRequest}
          validationIssues={validationIssues}
        />
      </div>

      {/* Analyze System Action Bar (Section 3) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 shadow-xl">
        <div>
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>Analyze System for Deadlock</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Checks whether processes can complete with available resources using the pure detection algorithm.
          </p>
        </div>

        <button
          onClick={handleAnalyzeSystem}
          disabled={hasErrors}
          className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm shadow-xl transition-all ${
            hasErrors
              ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
              : "bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-slate-950 shadow-cyan-500/25 hover:scale-[1.02] active:scale-[0.98]"
          }`}
        >
          <Play className="w-4 h-4 fill-slate-950" />
          <span>Analyze System</span>
        </button>
      </div>

      {/* Detection Results (Section 5) */}
      {detectionResult && (
        <div className="space-y-6">
          <ResultPanel
            deadlockResult={detectionResult}
            resourceNames={resourceNames}
            currentAvailable={available}
            numProcesses={numProcesses}
            numResources={numResources}
            allocation={allocation}
            available={available}
            onReset={handleReset}
            onContinueToBanker={handleContinueToBanker}
          />

          {/* Stepper / Trace Inspection */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                <h4 className="text-sm font-bold text-slate-200">
                  Deadlock Detection Step-by-Step Execution Trace
                </h4>
              </div>
              <button
                onClick={() => setShowTrace(!showTrace)}
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300"
              >
                {showTrace ? "Hide Detailed Trace" : "Show Detailed Trace"}
              </button>
            </div>

            {showTrace && (
              <div className="mt-4 space-y-3">
                {detectionResult.steps.map((st) => (
                  <div
                    key={st.stepNumber}
                    className={`p-3.5 rounded-lg border text-xs font-mono ${
                      st.type === "PROCESS_COMPLETED"
                        ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-200"
                        : st.type === "DEADLOCK_CONFIRMED"
                        ? "bg-rose-950/30 border-rose-500/40 text-rose-200"
                        : st.type === "PROCESS_BLOCKED"
                        ? "bg-amber-950/20 border-amber-500/30 text-amber-200"
                        : "bg-slate-950/70 border-slate-800 text-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold mb-1">
                      <span>Step {st.stepNumber}: {st.type}</span>
                      {st.processId && <span>Target: {st.processId}</span>}
                    </div>
                    <p className="font-sans text-slate-300 mt-1">{st.description}</p>
                    <div className="mt-2 text-[11px] text-slate-400">
                      Work: [{st.workAfter.join(", ")}] &bull; Finished: [{st.finished.map(f => f ? "T" : "F").join(", ")}]
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function DeadlockSimulatorPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading Deadlock Simulator...</div>}>
      <DeadlockSimulatorContent />
    </Suspense>
  );
}
