"use client";

import React, { useState } from "react";
import { 
  Matrix, 
  Vector, 
  ResourceRequest, 
  RequestEvaluationResult 
} from "@/types/banker";
import { evaluateResourceRequest } from "@/lib/bankersAlgorithm";
import { 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Zap, 
  ArrowRight, 
  ShieldCheck, 
  ShieldAlert,
  HelpCircle
} from "lucide-react";

interface ResourceRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  allocation: Matrix;
  max: Matrix;
  available: Vector;
  need: Matrix;
  processNames: string[];
  resourceNames: string[];
  onApplyRequest: (
    newAlloc: Matrix,
    newAvail: Vector,
    newNeed: Matrix,
    result: RequestEvaluationResult
  ) => void;
}

export default function ResourceRequestModal({
  isOpen,
  onClose,
  allocation,
  max,
  available,
  need,
  processNames,
  resourceNames,
  onApplyRequest
}: ResourceRequestModalProps) {
  const [selectedProcessIndex, setSelectedProcessIndex] = useState<number>(1);
  const [requestValues, setRequestValues] = useState<number[]>(
    resourceNames.map(() => 0)
  );
  const [evaluationResult, setEvaluationResult] = useState<RequestEvaluationResult | null>(null);

  if (!isOpen) return null;

  const currentProcessName = processNames[selectedProcessIndex] || `P${selectedProcessIndex}`;
  const currentNeed = need[selectedProcessIndex] || [];
  const currentAlloc = allocation[selectedProcessIndex] || [];

  const handleEvaluate = () => {
    const req: ResourceRequest = {
      processIndex: selectedProcessIndex,
      processId: currentProcessName,
      request: requestValues
    };

    const res = evaluateResourceRequest(
      allocation,
      max,
      available,
      req,
      processNames,
      resourceNames
    );
    setEvaluationResult(res);
  };

  // Quick preset helpers
  const handleQuickPreset = (type: 'safe' | 'exceed_need' | 'exceed_avail') => {
    if (type === 'safe') {
      setSelectedProcessIndex(1); // P1
      // e.g., P1 requests [1, 0, 2] in classic Silberschatz
      const presetReq = resourceNames.map((_, idx) => {
        if (idx === 0) return 1;
        if (idx === 1) return 0;
        if (idx === 2) return 2;
        return 0;
      });
      setRequestValues(presetReq);
    } else if (type === 'exceed_need') {
      const pNeed = need[selectedProcessIndex] || [];
      const overReq = resourceNames.map((_, idx) => (pNeed[idx] ?? 0) + 2);
      setRequestValues(overReq);
    } else if (type === 'exceed_avail') {
      const overAvail = resourceNames.map((_, idx) => (available[idx] ?? 0) + 5);
      setRequestValues(overAvail);
    }
    setEvaluationResult(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Zap className="w-5 h-5 fill-cyan-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">
                Resource-Request Algorithm (Deadlock Prevention)
              </h3>
              <p className="text-xs text-slate-400">
                Simulate whether granting an immediate request preserves safety or induces deadlock risk
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Presets */}
        <div className="mt-4 p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs text-slate-400 font-medium">Quick Viva Presets:</span>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => handleQuickPreset('safe')}
              className="px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20"
            >
              P1 Request [1, 0, 2] (Safe)
            </button>
            <button
              onClick={() => handleQuickPreset('exceed_need')}
              className="px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20"
            >
              Exceed Need (&gt; Need)
            </button>
            <button
              onClick={() => handleQuickPreset('exceed_avail')}
              className="px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20"
            >
              Exceed Avail (&gt; Avail)
            </button>
          </div>
        </div>

        {/* Inputs */}
        <div className="mt-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Process selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Select Requesting Process:
              </label>
              <select
                value={selectedProcessIndex}
                onChange={(e) => {
                  setSelectedProcessIndex(Number(e.target.value));
                  setEvaluationResult(null);
                }}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 font-semibold focus:outline-none focus:border-cyan-500"
              >
                {processNames.map((name, idx) => (
                  <option key={name} value={idx}>
                    {name} (Alloc: [{allocation[idx]?.join(", ")}], Need: [{need[idx]?.join(", ")}])
                  </option>
                ))}
              </select>
            </div>

            {/* Current Available reference */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Current System Available:
              </label>
              <div className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2 text-sm text-cyan-400 font-mono font-bold">
                [{available.join(", ")}]
              </div>
            </div>
          </div>

          {/* Requested Resources Vector Inputs */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Requested Resources for {currentProcessName}:
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {resourceNames.map((res, j) => (
                <div key={res} className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-center">
                  <div className="text-[11px] font-mono text-cyan-400 font-semibold mb-1">
                    Resource {res}
                  </div>
                  <input
                    type="number"
                    min="0"
                    value={requestValues[j] ?? 0}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      const next = [...requestValues];
                      next[j] = isNaN(val) ? 0 : Math.max(0, val);
                      setRequestValues(next);
                      setEvaluationResult(null);
                    }}
                    className="w-full text-center bg-slate-900 border border-slate-700 rounded py-1 px-1 text-sm font-bold font-mono text-white focus:outline-none focus:border-cyan-400"
                  />
                  <div className="text-[10px] text-slate-400 mt-1">
                    Need: {currentNeed[j] ?? 0}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Evaluate Button */}
          <button
            onClick={handleEvaluate}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4 fill-slate-950" />
            Evaluate Request via Banker&apos;s Algorithm
          </button>
        </div>

        {/* Evaluation Result View */}
        {evaluationResult && (
          <div
            className={`mt-5 p-4 rounded-xl border text-sm transition-all ${
              evaluationResult.status === "APPROVED"
                ? "bg-emerald-950/30 border-emerald-500/50 text-emerald-200"
                : evaluationResult.status === "WAIT_EXCEEDS_AVAILABLE"
                ? "bg-amber-950/30 border-amber-500/50 text-amber-200"
                : "bg-rose-950/30 border-rose-500/50 text-rose-200"
            }`}
          >
            <div className="flex items-start gap-3">
              {evaluationResult.status === "APPROVED" ? (
                <ShieldCheck className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-0.5" />
              ) : evaluationResult.status === "WAIT_EXCEEDS_AVAILABLE" ? (
                <Clock className="w-6 h-6 text-amber-400 flex-shrink-0 mt-0.5" />
              ) : (
                <ShieldAlert className="w-6 h-6 text-rose-400 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-bold text-base text-white">
                    {evaluationResult.title}
                  </h4>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-black/40 border border-current">
                    {evaluationResult.condition}
                  </span>
                </div>
                <p className="text-xs leading-relaxed font-sans mb-2">
                  {evaluationResult.message}
                </p>
                <p className="text-xs text-slate-300 italic mb-3">
                  {evaluationResult.explanation}
                </p>

                {/* If approved, option to apply state permanently */}
                {evaluationResult.status === "APPROVED" &&
                  evaluationResult.newAllocation &&
                  evaluationResult.newAvailable &&
                  evaluationResult.newNeed && (
                    <div className="mt-3 pt-3 border-t border-emerald-500/30 flex items-center justify-between">
                      <span className="text-xs text-emerald-300 font-medium">
                        Safe Sequence: {evaluationResult.tentativeResult?.safeSequence.join(" → ")}
                      </span>
                      <button
                        onClick={() => {
                          onApplyRequest(
                            evaluationResult.newAllocation!,
                            evaluationResult.newAvailable!,
                            evaluationResult.newNeed!,
                            evaluationResult
                          );
                          onClose();
                        }}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-colors shadow-sm"
                      >
                        Apply to Simulation
                      </button>
                    </div>
                  )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
