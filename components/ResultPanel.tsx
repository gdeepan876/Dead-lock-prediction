"use client";

import React from "react";
import Link from "next/link";
import { SafetyCheckResult, DeadlockDetectionResult, Vector, Matrix } from "@/types/banker";
import { 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  RotateCcw, 
  Zap, 
  Ban, 
  Info,
  ShieldCheck,
  ShieldAlert,
  Cpu
} from "lucide-react";
import { useRouter } from "next/navigation";

interface ResultPanelProps {
  // Can be either a DeadlockDetectionResult or a SafetyCheckResult
  deadlockResult?: DeadlockDetectionResult | null;
  bankerResult?: SafetyCheckResult | null;
  resourceNames: string[];
  currentAvailable?: Vector;
  numProcesses?: number;
  numResources?: number;
  allocation?: Matrix;
  available?: Vector;
  onReset?: () => void;
  onRequestSimulation?: () => void;
  onRunBankers?: () => void;
  onContinueToBanker?: () => void;
}

export default function ResultPanel({
  deadlockResult,
  bankerResult,
  resourceNames,
  currentAvailable,
  numProcesses,
  numResources,
  allocation,
  available,
  onReset,
  onRequestSimulation,
  onRunBankers,
  onContinueToBanker
}: ResultPanelProps) {
  const router = useRouter();

  const handleContinueToBanker = () => {
    if (onContinueToBanker) {
      onContinueToBanker();
      return;
    }
    if (allocation && available) {
      const payload = {
        numProcesses: numProcesses || allocation.length,
        numResources: numResources || available.length,
        allocation,
        available,
        fromSimulator: true,
        timestamp: Date.now()
      };
      try {
        sessionStorage.setItem("banker_transferred_state", JSON.stringify(payload));
      } catch (e) {
        console.error("Failed to save to sessionStorage", e);
      }
    }
    router.push("/banker?from=simulator&carried=true");
  };

  // If deadlockResult is provided, render Deadlock Detection Result UI (PDF Section 5)
  if (deadlockResult) {
    const isSafe = !deadlockResult.isDeadlocked;
    const availableToShow = deadlockResult.finalAvailable || currentAvailable || [];

    return (
      <div
        className={`rounded-2xl p-6 sm:p-8 transition-all border ${
          isSafe
            ? "border-emerald-500/50 bg-emerald-950/20 shadow-xl shadow-emerald-950/30"
            : "border-rose-500/50 bg-rose-950/20 shadow-xl shadow-rose-950/30"
        }`}
      >
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div className="flex items-start gap-4">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg ${
                isSafe
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                  : "bg-rose-500/20 text-rose-400 border border-rose-500/40"
              }`}
            >
              {isSafe ? (
                <ShieldCheck className="w-8 h-8 text-emerald-400" />
              ) : (
                <ShieldAlert className="w-8 h-8 text-rose-400" />
              )}
            </div>

            <div>
              {/* Requirement Section 5: Exact text states */}
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={`text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2 ${
                    isSafe ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {isSafe ? (
                    <>
                      <CheckCircle2 className="w-7 h-7 inline-block text-emerald-400" />
                      NO DEADLOCK DETECTED
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-7 h-7 inline-block text-rose-400" />
                      DEADLOCK DETECTED
                    </>
                  )}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                    isSafe
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                      : "bg-rose-500/20 text-rose-300 border-rose-500/40"
                  }`}
                >
                  {isSafe ? "SYSTEM IS SAFE" : "SYSTEM IS UNSAFE"}
                </span>
              </div>

              <p className="text-slate-200 text-sm mt-2 max-w-2xl leading-relaxed">
                {deadlockResult.explanation}
              </p>
            </div>
          </div>

          {/* Action Buttons: Continue to Banker's Algorithm with state preservation */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            <button
              type="button"
              onClick={handleContinueToBanker}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-cyan-500/25 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <span>Continue to Banker&apos;s Algorithm</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {onReset && (
              <button
                onClick={onReset}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold border border-slate-700 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset Matrix</span>
              </button>
            )}
          </div>
        </div>

        {/* Available Resources Display (Required by Section 5 for both Safe & Unsafe) */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>Current Available Resources</span>
            </h4>
            <div className="flex flex-wrap items-center gap-2">
              {resourceNames.map((res, idx) => (
                <div
                  key={res}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono font-semibold"
                >
                  <span className="text-slate-400">{res}: </span>
                  <span className="text-emerald-400 text-sm font-bold">
                    {availableToShow[idx] ?? 0}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Vector: [{availableToShow.join(", ")}]
            </p>
          </div>

          {/* Safe vs Unsafe details */}
          {isSafe ? (
            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300 mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Completed Processes / Safe Sequence</span>
              </h4>
              <div className="flex flex-wrap items-center gap-2">
                {deadlockResult.safeSequence.map((p, idx) => (
                  <React.Fragment key={p}>
                    <span className="px-3 py-1 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono font-bold text-xs">
                      {p}
                    </span>
                    {idx < deadlockResult.safeSequence.length - 1 && (
                      <ArrowRight className="w-3.5 h-3.5 text-emerald-400/80" />
                    )}
                  </React.Fragment>
                ))}
              </div>
              <p className="text-[11px] text-emerald-300/90 mt-2.5">
                &bull; All processes were able to complete with available resources. No process is starved.
              </p>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/40">
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-300 mb-2 flex items-center gap-1.5">
                <Ban className="w-4 h-4 text-rose-400" />
                <span>Deadlocked Processes</span>
              </h4>
              <div className="flex flex-wrap items-center gap-2">
                {deadlockResult.deadlockedProcesses.map((p) => (
                  <span
                    key={p}
                    className="px-3 py-1 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/50 font-mono font-bold text-xs"
                  >
                    {p}
                  </span>
                ))}
              </div>
              <p className="text-[11px] text-rose-300/90 mt-2.5">
                &bull; These processes cannot proceed because required resources are currently held by other processes or unavailable.
              </p>
            </div>
          )}
        </div>

        {/* Detailed Reason why processes cannot obtain required resources (Required by Section 5) */}
        {!isSafe && deadlockResult.deadlockReason && (
          <div className="mt-4 p-4 rounded-xl bg-slate-950/80 border border-rose-500/30 text-xs">
            <span className="text-rose-300 font-bold block mb-1">
              Detailed Resource Bottleneck &amp; Cause of Deadlock:
            </span>
            <p className="text-slate-300 leading-relaxed font-sans">
              {deadlockResult.deadlockReason}
            </p>
          </div>
        )}
      </div>
    );
  }

  // Otherwise, render Banker's Safety Algorithm Result
  const result = bankerResult;
  if (!result) return null;

  const isSafe = result.isSafe;

  return (
    <div
      className={`rounded-2xl p-6 sm:p-8 transition-all border ${
        isSafe
          ? "border-emerald-500/50 bg-emerald-950/20 shadow-xl shadow-emerald-950/30"
          : "border-rose-500/50 bg-rose-950/20 shadow-xl shadow-rose-950/30"
      }`}
    >
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-slate-700/60">
        <div className="flex items-start gap-4">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg ${
              isSafe
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                : "bg-rose-500/20 text-rose-400 border border-rose-500/40"
            }`}
          >
            {isSafe ? (
              <ShieldCheck className="w-8 h-8 text-emerald-400" />
            ) : (
              <ShieldAlert className="w-8 h-8 text-rose-400" />
            )}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`text-2xl sm:text-3xl font-black tracking-tight ${
                  isSafe ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                DEADLOCK RISK: {result.deadlockRisk}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                  isSafe
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                    : "bg-rose-500/20 text-rose-300 border-rose-500/40"
                }`}
              >
                {isSafe ? "SYSTEM IS IN A SAFE STATE" : "SYSTEM IS IN AN UNSAFE STATE"}
              </span>
            </div>

            <p className="text-slate-300 text-sm mt-2 max-w-2xl leading-relaxed">
              {result.explanation}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 w-full lg:w-auto">
          {onRequestSimulation && (
            <button
              onClick={onRequestSimulation}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-semibold text-xs sm:text-sm shadow-md shadow-cyan-500/20 transition-all hover:scale-[1.02]"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>Test Resource Request</span>
            </button>
          )}
          {onReset && (
            <button
              onClick={onReset}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold border border-slate-700 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset Scenario</span>
            </button>
          )}
        </div>
      </div>

      {/* Safe State Content */}
      {isSafe ? (
        <div className="mt-6 space-y-6">
          {/* Safe Sequence Display */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-emerald-500/30">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-2">
              Valid Safe Execution Sequence
            </h4>
            <div className="flex flex-wrap items-center gap-2">
              {result.safeSequence.map((processId, idx) => (
                <React.Fragment key={processId}>
                  <div className="px-3.5 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-sm font-bold font-mono shadow-sm">
                    {processId}
                  </div>
                  {idx < result.safeSequence.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-emerald-400/70" />
                  )}
                </React.Fragment>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-3">
              &ldquo;A process can complete whenever its remaining Need is within the currently available Work resources. As each process finishes, it releases all allocated resources back to Work.&rdquo;
            </p>
          </div>

          {/* Work Progression Table */}
          {result.workProgression && result.workProgression.length > 0 && (
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
                <span>Work Vector Progression Table</span>
                <span className="text-[10px] text-slate-400 font-normal">
                  (How available resources expanded after each process completed)
                </span>
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                      <th className="py-2 px-3">Step</th>
                      <th className="py-2 px-3">Finished Process</th>
                      <th className="py-2 px-3">Work Before</th>
                      <th className="py-2 px-3">Allocation Returned</th>
                      <th className="py-2 px-3 text-cyan-400">Work After</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {result.workProgression.map((rec) => (
                      <tr key={rec.step} className="hover:bg-slate-900/50">
                        <td className="py-2 px-3 text-slate-400 font-sans">
                          Step {rec.step}
                        </td>
                        <td className="py-2 px-3 font-bold text-emerald-400">
                          {rec.processId}
                        </td>
                        <td className="py-2 px-3 text-slate-300">
                          [{rec.workBefore.join(", ")}]
                        </td>
                        <td className="py-2 px-3 text-emerald-300">
                          +[{rec.allocationReturned.join(", ")}]
                        </td>
                        <td className="py-2 px-3 font-bold text-cyan-300">
                          [{rec.workAfter.join(", ")}]
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Unsafe State Content */
        <div className="mt-6 space-y-6">
          <div className="p-4 rounded-xl bg-slate-950/70 border border-rose-500/30">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-rose-400 mb-2 flex items-center gap-1.5">
              <Ban className="w-4 h-4" />
              Deadlock Risk Reason &amp; Failed Condition
            </h4>
            <p className="text-sm text-rose-200 leading-relaxed font-sans mb-3">
              {result.failedReason}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-3 border-t border-rose-900/40 text-xs">
              <div>
                <span className="text-slate-400 block mb-1">
                  Processes Blocked / Unable to Proceed:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {result.blockedProcesses.map((p) => (
                    <span
                      key={p}
                      className="px-2.5 py-1 rounded bg-rose-950/80 text-rose-300 border border-rose-500/50 font-mono font-bold"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-slate-400 block mb-1">
                  Work Vector at Stalled Point:
                </span>
                <span className="font-mono font-bold text-rose-300 text-sm">
                  [{result.finalWork.join(", ")}]
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 space-y-2">
            <div className="flex items-center gap-1.5 text-cyan-400 font-semibold">
              <Info className="w-4 h-4" />
              <span>OS Deadlock Avoidance Interpretation (for Viva / Demonstration):</span>
            </div>
            <p className="leading-relaxed text-slate-400">
              An unsafe state does not guarantee that a deadlock has already occurred at this exact moment. However, it means the operating system can no longer guarantee avoidance of a deadlock if all unfinished processes immediately demand their declared maximum resource claims. Therefore, any resource allocation request that transitions the system into an unsafe state must be rejected.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
