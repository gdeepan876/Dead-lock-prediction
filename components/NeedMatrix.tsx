"use client";

import React from "react";
import { Calculator } from "lucide-react";

interface NeedMatrixProps {
  needMatrix: (number | null)[][];
  processNames: string[];
  resourceNames: string[];
  activeProcessIndex?: number | null;
  finishedProcesses?: boolean[];
}

export default function NeedMatrix({
  needMatrix,
  processNames,
  resourceNames,
  activeProcessIndex = null,
  finishedProcesses = []
}: NeedMatrixProps) {
  // Check if any cell is pending/null
  const isPending = needMatrix.some(row => row.some(val => val === null));

  return (
    <div className="rounded-xl border border-cyan-800/40 bg-slate-900/60 p-4 shadow-sm backdrop-blur-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header with formula badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-3 border-b border-slate-800 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-cyan-400" />
            <h3 className="font-semibold text-slate-100 text-sm sm:text-base">
              Calculated Need Matrix
            </h3>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/40">
              Read-Only &bull; Auto Calculated
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {isPending
              ? "Calculated as Need[i][j] = Maximum[i][j] − Allocation[i][j] (Enter Maximum to view values)"
              : "Remaining resources each process may still request to complete"}
          </p>
        </div>

        {/* Formula Card */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950/80 border border-cyan-500/30 text-xs font-mono text-cyan-300">
          <span className="text-slate-400 font-sans">Formula:</span>
          <span className="font-semibold text-cyan-400">Need[i][j] = Max[i][j] − Allocation[i][j]</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400">
              <th className="py-2 px-3 min-w-[70px]">Process</th>
              {resourceNames.map((res) => (
                <th key={res} className="py-2 px-3 text-center min-w-[65px] font-mono text-cyan-400">
                  {res}
                </th>
              ))}
              <th className="py-2 px-3 text-center text-xs text-slate-400">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {processNames.map((proc, i) => {
              const isActive = activeProcessIndex === i;
              const isFinished = finishedProcesses[i] || false;

              let rowClass = "hover:bg-slate-800/30 transition-colors";
              if (isActive) {
                rowClass = "bg-cyan-950/40 border-l-2 border-cyan-400";
              } else if (isFinished) {
                rowClass = "bg-emerald-950/20 opacity-70";
              }

              return (
                <tr key={proc} className={rowClass}>
                  <td className="py-2 px-3 text-xs font-semibold text-slate-300 font-mono">
                    <span className="flex items-center gap-1.5">
                      {proc}
                      {isActive && (
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                      )}
                    </span>
                  </td>
                  {resourceNames.map((res, j) => {
                    const val = needMatrix[i]?.[j] ?? null;
                    return (
                      <td key={res} className="py-2 px-2 text-center">
                        <div
                          className={`w-14 sm:w-16 mx-auto text-center font-mono py-1 px-1 rounded text-sm font-semibold border ${
                            val === null
                              ? "bg-slate-950/40 text-slate-500 border-slate-800 border-dashed"
                              : val === 0
                              ? "bg-slate-900/80 text-slate-400 border-slate-800"
                              : isActive
                              ? "bg-cyan-900/40 text-cyan-200 border-cyan-600/50 shadow-sm"
                              : "bg-slate-950/70 text-cyan-300 border-slate-800/80"
                          }`}
                        >
                          {val === null ? "—" : val}
                        </div>
                      </td>
                    );
                  })}
                  <td className="py-2 px-3 text-center text-xs">
                    {isFinished ? (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        Finished
                      </span>
                    ) : isActive ? (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold animate-pulse">
                        Evaluating
                      </span>
                    ) : (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                        Unfinished
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
