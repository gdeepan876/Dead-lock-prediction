"use client";

import React, { useEffect, useState } from "react";
import { AlgorithmStep } from "@/types/banker";
import { 
  Play, 
  Pause, 
  SkipForward, 
  RotateCcw, 
  FastForward, 
  CheckCircle, 
  AlertCircle,
  Clock,
  ArrowRight,
  Cpu,
  Layers,
  HelpCircle
} from "lucide-react";

interface AlgorithmStepperProps {
  steps: AlgorithmStep[];
  currentStepIndex: number;
  onStepChange: (index: number) => void;
  onReset: () => void;
  safeSequence: string[];
}

export default function AlgorithmStepper({
  steps,
  currentStepIndex,
  onStepChange,
  onReset,
  safeSequence
}: AlgorithmStepperProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<number>(1200); // ms per step

  // Auto-run effect
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isPlaying) {
      if (currentStepIndex < steps.length - 1) {
        timer = setTimeout(() => {
          onStepChange(currentStepIndex + 1);
        }, speed);
      } else {
        setIsPlaying(false);
      }
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isPlaying, currentStepIndex, steps.length, speed, onStepChange]);

  const currentStep = steps[currentStepIndex];
  const isFinished = currentStepIndex >= steps.length - 1;

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      onStepChange(currentStepIndex + 1);
    }
  };

  const handleResetStep = () => {
    setIsPlaying(false);
    onStepChange(0);
    onReset();
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 sm:p-5 shadow-sm backdrop-blur-sm space-y-4">
      {/* Controls Bar (Section 7: Next Step, Auto Run, Pause and Reset) */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
            Step-by-Step Execution:
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-800/50">
            Step {currentStepIndex + 1} of {steps.length}
          </span>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Reset */}
          <button
            onClick={handleResetStep}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition-colors"
            title="Reset step-by-step trace"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          {/* Auto Run / Pause */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            disabled={isFinished && !isPlaying}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm ${
              isPlaying
                ? "bg-amber-500 hover:bg-amber-400 text-slate-950"
                : isFinished
                ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                : "bg-cyan-500 hover:bg-cyan-400 text-slate-950"
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Auto Run</span>
              </>
            )}
          </button>

          {/* Next Step */}
          <button
            onClick={handleNext}
            disabled={isFinished || isPlaying}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              isFinished || isPlaying
                ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                : "bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 shadow-sm"
            }`}
          >
            <span>Next Step</span>
            <SkipForward className="w-3.5 h-3.5" />
          </button>

          {/* Speed selector */}
          <select
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="bg-slate-950 border border-slate-700 rounded-lg text-xs px-2 py-1.5 text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value={2000}>0.5x</option>
            <option value={1200}>1.0x</option>
            <option value={600}>2.0x</option>
          </select>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800">
        <div
          className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-1.5 rounded-full transition-all duration-300"
          style={{
            width: `${((currentStepIndex + 1) / Math.max(1, steps.length)) * 100}%`
          }}
        />
      </div>

      {/* Section 7 Breakdown Panel:
          "Show Work/Available, current process, Need, decision, updated Available and Safe Sequence." */}
      {currentStep && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
          {/* 1. Current Process */}
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-slate-400 text-[10px] uppercase font-mono block">Current Process</span>
            <span className="font-bold text-sm text-cyan-300 font-mono mt-0.5 block">
              {currentStep.processId || "None (Initialization)"}
            </span>
          </div>

          {/* 2. Need Vector */}
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-slate-400 text-[10px] uppercase font-mono block">Process Need</span>
            <span className="font-bold text-xs text-amber-300 font-mono mt-0.5 block">
              {currentStep.need ? `[${currentStep.need.join(", ")}]` : "N/A"}
            </span>
          </div>

          {/* 3. Work / Available Before */}
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-slate-400 text-[10px] uppercase font-mono block">Work / Available</span>
            <span className="font-bold text-xs text-slate-200 font-mono mt-0.5 block">
              [{currentStep.workBefore.join(", ")}]
            </span>
          </div>

          {/* 4. Decision */}
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-slate-400 text-[10px] uppercase font-mono block">Decision (Need ≤ Work?)</span>
            <span
              className={`font-bold text-xs mt-0.5 block ${
                currentStep.canAllocate === true
                  ? "text-emerald-400"
                  : currentStep.canAllocate === false
                  ? "text-rose-400"
                  : "text-slate-400"
              }`}
            >
              {currentStep.canAllocate === true
                ? "Satisfied (Release)"
                : currentStep.canAllocate === false
                ? "Blocked (Wait)"
                : "Evaluating"}
            </span>
          </div>

          {/* 5. Updated Available */}
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 col-span-2 sm:col-span-1">
            <span className="text-slate-400 text-[10px] uppercase font-mono block">Updated Available</span>
            <span className="font-bold text-xs text-emerald-300 font-mono mt-0.5 block">
              [{currentStep.workAfter.join(", ")}]
            </span>
          </div>
        </div>
      )}

      {/* Safe Sequence so Far */}
      <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-slate-400">
          Safe Sequence Resolved So Far:
        </span>
        {currentStep?.safeSequenceSoFar && currentStep.safeSequenceSoFar.length > 0 ? (
          <div className="flex flex-wrap items-center gap-1.5 font-mono">
            {currentStep.safeSequenceSoFar.map((p, idx) => (
              <React.Fragment key={`${p}-${idx}`}>
                <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold">
                  {p}
                </span>
                {idx < currentStep.safeSequenceSoFar.length - 1 && (
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                )}
              </React.Fragment>
            ))}
          </div>
        ) : (
          <span className="text-xs text-slate-500 italic">None yet</span>
        )}
      </div>

      {/* Step Description Card */}
      {currentStep && (
        <div
          className={`p-3.5 rounded-lg border text-xs sm:text-sm transition-all ${
            currentStep.type === "APPROVED_ALLOCATION"
              ? "bg-emerald-950/20 border-emerald-500/40 text-emerald-200"
              : currentStep.type === "CANNOT_ALLOCATE"
              ? "bg-amber-950/20 border-amber-500/40 text-amber-200"
              : currentStep.type === "UNSAFE_HALT"
              ? "bg-rose-950/25 border-rose-500/50 text-rose-200"
              : currentStep.type === "ALL_COMPLETED"
              ? "bg-emerald-900/30 border-emerald-400/60 text-emerald-100"
              : "bg-slate-950/60 border-slate-800 text-slate-300"
          }`}
        >
          <div className="flex items-start gap-2.5">
            {currentStep.type === "APPROVED_ALLOCATION" || currentStep.type === "ALL_COMPLETED" ? (
              <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            ) : currentStep.type === "UNSAFE_HALT" ? (
              <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
            ) : currentStep.type === "CANNOT_ALLOCATE" ? (
              <Clock className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            ) : (
              <div className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                i
              </div>
            )}
            <div>
              <div className="font-semibold text-xs uppercase tracking-wider mb-0.5">
                {currentStep.type.replace(/_/g, " ")}
              </div>
              <p className="leading-relaxed font-sans">{currentStep.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
