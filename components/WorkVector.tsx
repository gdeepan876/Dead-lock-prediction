"use client";

import React from "react";
import { Vector } from "@/types/banker";
import { Layers, ArrowRight } from "lucide-react";

interface WorkVectorProps {
  available: Vector;
  work: Vector;
  previousWork?: Vector | null;
  resourceNames: string[];
  lastAddedAllocation?: Vector | null;
  lastFinishedProcessId?: string | null;
}

export default function WorkVector({
  available,
  work,
  previousWork,
  resourceNames,
  lastAddedAllocation,
  lastFinishedProcessId
}: WorkVectorProps) {
  const hasWorkChanged =
    previousWork &&
    previousWork.some((val, idx) => val !== work[idx]);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-3 border-b border-slate-800 gap-2">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <div>
            <h3 className="font-semibold text-slate-100 text-sm sm:text-base">
              Work &amp; Available Resource Vectors
            </h3>
            <p className="text-xs text-slate-400">
              Work represents free resources available at each algorithm step
            </p>
          </div>
        </div>

        {lastFinishedProcessId && lastAddedAllocation && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-300">
            <span>Reclaimed from {lastFinishedProcessId}:</span>
            <span className="font-mono font-semibold">
              +[{lastAddedAllocation.join(", ")}]
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Initial Available */}
        <div className="p-3 rounded-lg bg-slate-950/50 border border-slate-800/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Initial Available Vector
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Work(0) = Available</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {resourceNames.map((res, idx) => (
              <div
                key={res}
                className="flex-1 min-w-[60px] text-center p-2 rounded-md bg-slate-900/90 border border-slate-800"
              >
                <div className="text-[11px] font-mono text-cyan-400 font-semibold mb-0.5">
                  {res}
                </div>
                <div className="text-base font-bold font-mono text-slate-200">
                  {available[idx] ?? 0}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Current Work Vector */}
        <div className={`p-3 rounded-lg border transition-all ${
          hasWorkChanged 
            ? "bg-cyan-950/30 border-cyan-500/50 shadow-md shadow-cyan-500/10" 
            : "bg-slate-950/50 border-slate-800/80"
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
              Current Work Vector
              {hasWorkChanged && (
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              )}
            </span>
            <span className="text-[10px] text-cyan-400/80 font-mono">
              Work = Work + Allocation[i]
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {resourceNames.map((res, idx) => {
              const currentVal = work[idx] ?? 0;
              const prevVal = previousWork ? previousWork[idx] : null;
              const changed = prevVal !== null && prevVal !== undefined && prevVal !== currentVal;

              return (
                <div
                  key={res}
                  className={`flex-1 min-w-[60px] text-center p-2 rounded-md border transition-all ${
                    changed
                      ? "bg-cyan-900/40 border-cyan-400 text-white shadow-sm"
                      : "bg-slate-900/90 border-slate-800 text-slate-200"
                  }`}
                >
                  <div className="text-[11px] font-mono text-cyan-400 font-semibold mb-0.5">
                    {res}
                  </div>
                  <div className="text-base font-bold font-mono flex items-center justify-center gap-1">
                    {changed && prevVal !== null && (
                      <span className="text-xs text-slate-400 line-through mr-0.5">
                        {prevVal}
                      </span>
                    )}
                    <span className={changed ? "text-cyan-300" : ""}>{currentVal}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
