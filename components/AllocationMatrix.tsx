"use client";

import React from "react";
import { Matrix, ValidationIssue } from "@/types/banker";
import { AlertCircle, Layers } from "lucide-react";

interface AllocationMatrixProps {
  matrix: Matrix;
  processNames: string[];
  resourceNames: string[];
  onChangeMatrix: (newMatrix: Matrix) => void;
  validationIssues?: ValidationIssue[];
  readOnly?: boolean;
}

export default function AllocationMatrix({
  matrix,
  processNames,
  resourceNames,
  onChangeMatrix,
  validationIssues = [],
  readOnly = false
}: AllocationMatrixProps) {
  const handleCellChange = (rowIndex: number, colIndex: number, val: string) => {
    if (readOnly) return;
    const parsed = parseInt(val, 10);
    const updated = matrix.map((row, r) =>
      r === rowIndex
        ? row.map((c, idx) => (idx === colIndex ? (isNaN(parsed) ? 0 : Math.max(0, parsed)) : c))
        : [...row]
    );
    onChangeMatrix(updated);
  };

  // Compute resource column totals (total allocated instances)
  const columnTotals = resourceNames.map((_, colIdx) =>
    matrix.reduce((sum, row) => sum + (row[colIdx] || 0), 0)
  );

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-3 border-b border-slate-800/80 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h3 className="font-semibold text-slate-100 text-sm sm:text-base">
              Allocation Matrix
            </h3>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-400 border border-cyan-800/40">
              {processNames.length} × {resourceNames.length}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Resources currently held/allocated to each process (What the process HAS)
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400">
              <th className="py-2 px-3">Process</th>
              {resourceNames.map((res) => (
                <th key={res} className="py-2 px-3 text-center min-w-[70px] text-cyan-400 font-mono">
                  {res}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {processNames.map((pName, i) => (
              <tr key={pName} className="hover:bg-slate-800/30 transition-colors">
                <td className="py-2 px-3 text-xs font-bold font-mono text-cyan-300 bg-slate-950/40 rounded-l-lg border-l border-slate-800">
                  {pName}
                </td>
                {resourceNames.map((res, j) => {
                  const val = matrix[i]?.[j] ?? 0;
                  const issue = validationIssues.find(
                    (iss) =>
                      iss.field === "allocation" &&
                      iss.processIndex === i &&
                      iss.resourceIndex === j
                  );

                  return (
                    <td
                      key={res}
                      className={`py-2 px-2 text-center ${
                        j === resourceNames.length - 1 ? "rounded-r-lg border-r border-slate-800" : ""
                      }`}
                    >
                      {readOnly ? (
                        <span className="font-mono text-sm font-semibold text-slate-200">
                          {val}
                        </span>
                      ) : (
                        <input
                          type="number"
                          min="0"
                          value={val}
                          onChange={(e) => handleCellChange(i, j, e.target.value)}
                          className={`w-16 sm:w-20 text-center font-mono py-1.5 px-2 rounded-md text-sm font-semibold transition-colors focus:outline-none focus:ring-2 ${
                            issue
                              ? "bg-rose-950/50 border border-rose-500/80 text-rose-200 focus:ring-rose-500"
                              : "bg-slate-950/90 border border-slate-700/80 text-white hover:border-slate-600 focus:border-cyan-500 focus:ring-cyan-500/20"
                          }`}
                        />
                      )}
                      {issue && (
                        <p className="text-[10px] text-rose-400 mt-0.5 flex items-center justify-center gap-0.5">
                          <AlertCircle className="w-3 h-3" />
                          <span>Invalid</span>
                        </p>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-slate-700/80 text-xs font-semibold text-slate-400 bg-slate-950/50">
              <td className="py-2 px-3 text-slate-400 font-mono">Total Held</td>
              {columnTotals.map((tot, j) => (
                <td key={j} className="py-2 px-3 text-center font-mono text-cyan-300">
                  {tot}
                </td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
