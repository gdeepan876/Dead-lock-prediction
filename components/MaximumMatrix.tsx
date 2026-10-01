"use client";

import React from "react";
import { Matrix, ValidationIssue } from "@/types/banker";
import { AlertCircle, HelpCircle, Layers } from "lucide-react";

interface MaximumMatrixProps {
  matrix: (number | null)[][];
  allocation: Matrix;
  processNames: string[];
  resourceNames: string[];
  onChangeMatrix: (newMatrix: (number | null)[][]) => void;
  validationIssues?: ValidationIssue[];
}

export default function MaximumMatrix({
  matrix,
  allocation,
  processNames,
  resourceNames,
  onChangeMatrix,
  validationIssues = []
}: MaximumMatrixProps) {
  const handleCellChange = (rowIndex: number, colIndex: number, rawVal: string) => {
    const trimmed = rawVal.trim();
    const parsed = trimmed === "" ? null : parseInt(trimmed, 10);
    const updated = matrix.map((row, r) =>
      r === rowIndex
        ? row.map((cell, c) => (c === colIndex ? (parsed === null || isNaN(parsed) ? null : Math.max(0, parsed)) : cell))
        : [...row]
    );
    onChangeMatrix(updated);
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-3 border-b border-slate-800/80 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-400" />
            <h3 className="font-semibold text-slate-100 text-sm sm:text-base">
              Maximum Claim Matrix (Max)
            </h3>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-800/40">
              {processNames.length} × {resourceNames.length}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Maximum resources each process may need. Each cell must satisfy:{" "}
            <span className="font-mono text-purple-300 font-bold">Max ≥ Allocation</span>
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400">
              <th className="py-2 px-3 min-w-[70px]">Process</th>
              {resourceNames.map((res) => (
                <th key={res} className="py-2 px-3 text-center min-w-[75px] font-mono text-purple-300">
                  {res}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {processNames.map((proc, i) => {
              return (
                <tr key={proc} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-2 px-3 text-xs font-semibold text-slate-300 font-mono">
                    {proc}
                  </td>
                  {resourceNames.map((res, j) => {
                    const val = matrix[i]?.[j] ?? null;
                    const allocVal = allocation[i]?.[j] ?? 0;
                    const isMissing = val === null;
                    const isLessThanAlloc = val !== null && val < allocVal;
                    const issue = validationIssues.find(
                      (iss) =>
                        iss.field === "max" &&
                        iss.processIndex === i &&
                        iss.resourceIndex === j
                    );

                    const hasError = isLessThanAlloc || (isMissing && issue !== undefined);

                    return (
                      <td key={res} className="py-2 px-2 text-center">
                        <div className="flex flex-col items-center">
                          <input
                            type="number"
                            min="0"
                            placeholder="Enter Max"
                            value={val === null ? "" : val}
                            onChange={(e) => handleCellChange(i, j, e.target.value)}
                            className={`w-16 sm:w-20 text-center font-mono py-1.5 px-1 rounded-md text-sm font-semibold transition-colors focus:outline-none focus:ring-2 placeholder:text-[11px] placeholder:font-normal ${
                              hasError
                                ? "bg-rose-950/60 border border-rose-500 text-rose-200 focus:ring-rose-500 placeholder:text-rose-400/50"
                                : val === null
                                ? "bg-slate-950/90 border border-purple-500/40 text-purple-200 focus:border-purple-400 focus:ring-purple-500/20 placeholder:text-slate-500"
                                : "bg-slate-950/80 border border-slate-700/80 text-white hover:border-slate-600 focus:border-cyan-500 focus:ring-cyan-500/20"
                            }`}
                          />
                          <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                            Alloc: {allocVal}
                          </span>
                          {isLessThanAlloc && (
                            <span className="text-[10px] text-rose-400 font-mono font-bold leading-tight">
                              &lt; {allocVal}
                            </span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
