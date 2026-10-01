"use client";

import React from "react";
import { ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";

interface SafeSequenceProps {
  sequence: string[];
  title?: string;
  isSafe?: boolean;
}

export default function SafeSequence({
  sequence,
  title = "Safe Execution Sequence",
  isSafe = true
}: SafeSequenceProps) {
  if (sequence.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/20 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-emerald-300">
            {title}
          </h4>
        </div>
        <span className="text-[11px] text-emerald-400/80 font-mono">
          {sequence.length} Processes Resolved
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2 p-3 rounded-lg bg-slate-950/80 border border-slate-800">
        <span className="text-xs text-slate-400 font-mono mr-1">&lang;</span>
        {sequence.map((pId, idx) => (
          <React.Fragment key={pId}>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-sm font-mono font-bold text-xs sm:text-sm">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{pId}</span>
              <span className="text-[10px] text-emerald-400/70 font-normal">#{idx + 1}</span>
            </div>
            {idx < sequence.length - 1 && (
              <ArrowRight className="w-4 h-4 text-emerald-500/70 flex-shrink-0 animate-pulse" />
            )}
          </React.Fragment>
        ))}
        <span className="text-xs text-slate-400 font-mono ml-1">&rang;</span>
      </div>

      <p className="text-[11px] text-emerald-400/90 mt-2">
        &bull; Processes can execute in this order without resource starvation or circular wait.
      </p>
    </div>
  );
}
