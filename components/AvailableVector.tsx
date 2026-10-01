"use client";

import React from "react";
import { Vector, ValidationIssue } from "@/types/banker";
import { AlertCircle, Cpu } from "lucide-react";

interface AvailableVectorProps {
  vector: Vector;
  resourceNames: string[];
  onChangeVector: (newVector: Vector) => void;
  validationIssues?: ValidationIssue[];
  title?: string;
  description?: string;
  readOnly?: boolean;
}

export default function AvailableVector({
  vector,
  resourceNames,
  onChangeVector,
  validationIssues = [],
  title = "Available Vector",
  description = "Resources currently free and available in the operating system",
  readOnly = false
}: AvailableVectorProps) {
  const handleCellChange = (colIndex: number, val: string) => {
    if (readOnly) return;
    const parsed = parseInt(val, 10);
    const next = [...vector];
    next[colIndex] = isNaN(parsed) ? 0 : Math.max(0, parsed);
    onChangeVector(next);
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-3 border-b border-slate-800/80 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-emerald-400" />
            <h3 className="font-semibold text-slate-100 text-sm sm:text-base">{title}</h3>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
              1 × {resourceNames.length}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{description}</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400">
              <th className="py-2 px-3">Resource Vector</th>
              {resourceNames.map((res) => (
                <th key={res} className="py-2 px-3 text-center min-w-[70px] text-emerald-400 font-mono">
                  {res}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="py-2.5 px-3 text-xs font-bold text-slate-200 bg-slate-950/40 rounded-l-lg border-l border-y border-slate-800 font-mono">
                Available
              </td>
              {resourceNames.map((res, j) => {
                const val = vector[j] ?? 0;
                const issue = validationIssues.find(
                  (iss) => iss.field === "available" && iss.resourceIndex === j
                );

                return (
                  <td
                    key={res}
                    className={`py-2 px-2 text-center border-y border-slate-800 ${
                      j === resourceNames.length - 1 ? "rounded-r-lg border-r" : ""
                    }`}
                  >
                    {readOnly ? (
                      <span className="font-mono text-base font-bold text-emerald-300">
                        {val}
                      </span>
                    ) : (
                      <input
                        type="number"
                        min="0"
                        value={val}
                        onChange={(e) => handleCellChange(j, e.target.value)}
                        className={`w-16 sm:w-20 text-center font-mono py-1.5 px-2 rounded-md text-sm font-semibold transition-colors focus:outline-none focus:ring-2 ${
                          issue
                            ? "bg-rose-950/50 border border-rose-500/80 text-rose-200 focus:ring-rose-500"
                            : "bg-slate-950/90 border border-slate-700/80 text-white hover:border-slate-600 focus:border-emerald-500 focus:ring-emerald-500/20"
                        }`}
                      />
                    )}
                    {issue && (
                      <p className="text-[10px] text-rose-400 mt-1 flex items-center justify-center gap-0.5">
                        <AlertCircle className="w-3 h-3" />
                        <span>Invalid</span>
                      </p>
                    )}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
