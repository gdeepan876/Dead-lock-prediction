"use client";

import React from "react";
import { Vector, ProcessResourceCheck } from "@/types/banker";
import { Check, X, ArrowUpRight, Cpu } from "lucide-react";
import StatusBadge from "./StatusBadge";

interface ProcessCardProps {
  processId: string;
  processIndex: number;
  allocation: Vector;
  max: Vector;
  need: Vector;
  resourceNames: string[];
  isFinished: boolean;
  isEvaluating: boolean;
  comparisons?: ProcessResourceCheck[] | null;
  canAllocate?: boolean | null;
}

export default function ProcessCard({
  processId,
  processIndex,
  allocation,
  max,
  need,
  resourceNames,
  isFinished,
  isEvaluating,
  comparisons,
  canAllocate
}: ProcessCardProps) {
  let cardBorder = "border-slate-800 bg-slate-900/50";
  let statusBadge = <StatusBadge status="WAITING" text="Waiting" size="sm" />;

  if (isFinished) {
    cardBorder = "border-emerald-500/40 bg-emerald-950/20";
    statusBadge = <StatusBadge status="COMPLETED" text="Completed" size="sm" />;
  } else if (isEvaluating) {
    if (canAllocate === true) {
      cardBorder = "border-emerald-400 bg-cyan-950/40 shadow-lg shadow-cyan-500/10";
      statusBadge = <StatusBadge status="RUNNING" text="Can Finish" size="sm" />;
    } else if (canAllocate === false) {
      cardBorder = "border-rose-500/60 bg-rose-950/20";
      statusBadge = <StatusBadge status="BLOCKED" text="Need > Work" size="sm" />;
    } else {
      cardBorder = "border-cyan-400 bg-cyan-950/30";
      statusBadge = <StatusBadge status="RUNNING" text="Checking Need ≤ Work" size="sm" />;
    }
  }

  return (
    <div
      className={`rounded-xl border p-4 transition-all duration-300 relative overflow-hidden ${cardBorder}`}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
        <div className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-sm ${
              isFinished
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : isEvaluating
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                : "bg-slate-800 text-slate-300"
            }`}
          >
            {processId}
          </div>
          <div>
            <h4 className="font-semibold text-slate-100 text-sm">
              Process {processId}
            </h4>
            <p className="text-[11px] text-slate-400">Process #{processIndex}</p>
          </div>
        </div>

        <div>{statusBadge}</div>
      </div>

      {/* Vectors Table */}
      <div className="grid grid-cols-3 gap-2 text-xs mb-3">
        <div className="p-2 rounded bg-slate-950/60 border border-slate-800/80 text-center">
          <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
            Allocated
          </span>
          <span className="font-mono text-cyan-300 font-medium">
            [{allocation.join(", ")}]
          </span>
        </div>

        <div className="p-2 rounded bg-slate-950/60 border border-slate-800/80 text-center">
          <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
            Max Claim
          </span>
          <span className="font-mono text-slate-200 font-medium">
            [{max.join(", ")}]
          </span>
        </div>

        <div className="p-2 rounded bg-slate-950/60 border border-slate-800/80 text-center">
          <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
            Need
          </span>
          <span className="font-mono text-amber-400 font-semibold">
            [{need.join(", ")}]
          </span>
        </div>
      </div>

      {/* Active Evaluation comparison breakdown */}
      {isEvaluating && comparisons && comparisons.length > 0 && (
        <div className="mt-2 pt-2 border-t border-slate-800">
          <div className="text-[11px] font-semibold text-slate-400 mb-1.5 flex items-center justify-between">
            <span>Resource Check (Need ≤ Work):</span>
            <span
              className={`font-semibold ${
                canAllocate ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {canAllocate ? "All Conditions Satisfied" : "Unsatisfied"}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {comparisons.map((c) => (
              <div
                key={c.resource}
                className={`p-1.5 rounded text-center text-[10px] font-mono border ${
                  c.satisfied
                    ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                    : "bg-rose-950/40 border-rose-500/40 text-rose-300"
                }`}
              >
                <div className="flex items-center justify-center gap-1 font-bold">
                  {c.resource}
                  {c.satisfied ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <X className="w-3 h-3 text-rose-400" />
                  )}
                </div>
                <div>
                  {c.need} &le; {c.work}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
