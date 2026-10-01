"use client";

import React from "react";
import { Matrix, Vector, ValidationIssue } from "@/types/banker";
import { AlertCircle, HelpCircle } from "lucide-react";

interface MatrixInputProps {
  title: string;
  description: string;
  type: "allocation" | "max" | "available";
  matrix?: Matrix;
  vector?: Vector;
  comparisonMatrix?: Matrix; // used to validate Allocation <= Max
  processNames: string[];
  resourceNames: string[];
  onChangeMatrix?: (newMatrix: Matrix) => void;
  onChangeVector?: (newVector: Vector) => void;
  validationIssues?: ValidationIssue[];
}

export default function MatrixInput({
  title,
  description,
  type,
  matrix,
  vector,
  comparisonMatrix,
  processNames,
  resourceNames,
  onChangeMatrix,
  onChangeVector,
  validationIssues = []
}: MatrixInputProps) {
  // Vector mode (e.g. Available Vector)
  if (type === "available" && vector && onChangeVector) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-3 border-b border-slate-800/80 gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-100 text-sm sm:text-base">{title}</h3>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-400 border border-cyan-800/40">
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
                <th className="py-2 px-3">Vector</th>
                {resourceNames.map((res) => (
                  <th key={res} className="py-2 px-3 text-center min-w-[70px] text-cyan-400 font-mono">
                    {res}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-2 px-3 text-xs font-medium text-slate-300 bg-slate-950/40 rounded-l-lg border-l border-y border-slate-800">
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
                      <input
                        type="number"
                        min="0"
                        value={val}
                        onChange={(e) => {
                          const parsed = parseInt(e.target.value, 10);
                          const next = [...vector];
                          next[j] = isNaN(parsed) ? 0 : Math.max(0, parsed);
                          onChangeVector(next);
                        }}
                        className={`w-16 sm:w-20 text-center font-mono py-1.5 px-2 rounded-md text-sm font-semibold transition-colors focus:outline-none focus:ring-2 ${
                          issue
                            ? "bg-rose-950/50 border border-rose-500/80 text-rose-200 focus:ring-rose-500"
                            : "bg-slate-950/90 border border-slate-700/80 text-white hover:border-slate-600 focus:border-cyan-500 focus:ring-cyan-500/20"
                        }`}
                      />
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

  // Matrix mode (Allocation or Max)
  if (!matrix || !onChangeMatrix) return null;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-3 border-b border-slate-800/80 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-100 text-sm sm:text-base">{title}</h3>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700/50">
              {processNames.length} × {resourceNames.length}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{description}</p>
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
                    const val = matrix[i]?.[j] ?? 0;
                    
                    // Check if allocation > max
                    let isExceeding = false;
                    if (type === "allocation" && comparisonMatrix) {
                      const maxVal = comparisonMatrix[i]?.[j] ?? 0;
                      if (val > maxVal) {
                        isExceeding = true;
                      }
                    }

                    const issue = validationIssues.find(
                      (iss) =>
                        iss.field === type &&
                        iss.processIndex === i &&
                        iss.resourceIndex === j
                    );

                    const hasError = isExceeding || !!issue;

                    return (
                      <td key={res} className="py-1.5 px-2 text-center">
                        <input
                          type="number"
                          min="0"
                          value={val}
                          onChange={(e) => {
                            const parsed = parseInt(e.target.value, 10);
                            const next = matrix.map((row, rIdx) =>
                              rIdx === i
                                ? row.map((cell, cIdx) =>
                                    cIdx === j
                                      ? isNaN(parsed)
                                        ? 0
                                        : Math.max(0, parsed)
                                      : cell
                                  )
                                : [...row]
                            );
                            onChangeMatrix(next);
                          }}
                          className={`w-14 sm:w-16 text-center font-mono py-1.5 px-1 rounded-md text-sm font-semibold transition-colors focus:outline-none focus:ring-2 ${
                            hasError
                              ? "bg-rose-950/50 border border-rose-500 text-rose-200 focus:ring-rose-500"
                              : "bg-slate-950/80 border border-slate-700/80 text-white hover:border-slate-600 focus:border-cyan-500 focus:ring-cyan-500/20"
                          }`}
                        />
                        {isExceeding && (
                          <div className="text-[10px] text-rose-400 mt-0.5 leading-none" title="Allocation > Max!">
                            &gt; Max
                          </div>
                        )}
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
