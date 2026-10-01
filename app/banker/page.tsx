"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  SafetyCheckResult,
  ValidationIssue,
  Matrix,
  Vector,
  RequestEvaluationResult
} from "@/types/banker";
import {
  calculateNeedMatrix,
  validateInputs,
  validateBankerMaximum,
  runBankersSafetyAlgorithm,
  PRESETS
} from "@/lib/bankersAlgorithm";

import AllocationMatrix from "@/components/AllocationMatrix";
import MaximumMatrix from "@/components/MaximumMatrix";
import NeedMatrix from "@/components/NeedMatrix";
import AvailableVector from "@/components/AvailableVector";
import WorkVector from "@/components/WorkVector";
import ProcessCard from "@/components/ProcessCard";
import AlgorithmStepper from "@/components/AlgorithmStepper";
import ResultPanel from "@/components/ResultPanel";
import ResourceRequestModal from "@/components/ResourceRequestModal";

import {
  Cpu,
  Layers,
  Play,
  RotateCcw,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Settings,
  Calculator,
  ChevronRight,
  Info,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  BookOpen
} from "lucide-react";

function BankerContent() {
  const searchParams = useSearchParams();
  const presetQuery = searchParams.get("preset");
  const carriedQuery = searchParams.get("carried");

  // System Configuration State
  const [numProcesses, setNumProcesses] = useState<number>(5);
  const [numResources, setNumResources] = useState<number>(3);
  const [activeTab, setActiveTab] = useState<"matrices" | "stepper" | "request">("matrices");

  // Matrices: Allocation, Maximum, Available
  const [allocation, setAllocation] = useState<Matrix>(PRESETS.safeSilberschatz.allocation);
  const [max, setMax] = useState<(number | null)[][]>(PRESETS.safeSilberschatz.max);
  const [available, setAvailable] = useState<Vector>(PRESETS.safeSilberschatz.available);

  // Carried from Deadlock Detection State
  const [isCarriedFromSimulator, setIsCarriedFromSimulator] = useState<boolean>(false);
  const [maxValidationError, setMaxValidationError] = useState<string | null>(null);

  // Simulation execution state
  const [safetyResult, setSafetyResult] = useState<SafetyCheckResult | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState<boolean>(false);

  // Check and load transferred state from Deadlock Detection (sessionStorage)
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("banker_transferred_state");
      if (raw) {
        const data = JSON.parse(raw);
        if (data && data.fromSimulator && data.allocation && data.available) {
          const p = data.numProcesses || data.allocation.length;
          const r = data.numResources || data.available.length;

          setNumProcesses(p);
          setNumResources(r);
          setAllocation(data.allocation);
          setAvailable(data.available);

          // Requirement 4: Maximum Matrix must initially be empty or clearly marked as "Enter Maximum"
          // Requirement 8: Matrix size must always depend on numberOfProcesses x numberOfResources
          const emptyMax: (number | null)[][] = Array.from({ length: p }, () =>
            Array(r).fill(null)
          );
          setMax(emptyMax);
          setIsCarriedFromSimulator(true);
          setMaxValidationError(null);
          setSafetyResult(null);
          setCurrentStepIndex(0);
          setActiveTab("matrices");
          return;
        }
      }
    } catch (e) {
      console.error("Error reading transferred state:", e);
    }

    // Fallback: If no transferred state and preset is requested in URL
    if (presetQuery && PRESETS[presetQuery]) {
      loadPreset(presetQuery);
    }
  }, [presetQuery, carriedQuery]);

  // Generate process and resource names based on dimensions
  const processNames = useMemo(() => {
    return Array.from({ length: numProcesses }, (_, i) => `P${i}`);
  }, [numProcesses]);

  const resourceNames = useMemo(() => {
    const letters = ["R1", "R2", "R3", "R4", "R5", "R6"];
    return Array.from({ length: numResources }, (_, i) => letters[i] || `R${i + 1}`);
  }, [numResources]);

  // Derived Need matrix: Need = Maximum - Allocation (Requirement 5)
  const need = useMemo(() => {
    return calculateNeedMatrix(max, allocation);
  }, [max, allocation]);

  // Validation
  const validationIssues = useMemo(() => {
    return validateInputs(allocation, max, available, processNames, resourceNames);
  }, [allocation, max, available, processNames, resourceNames]);

  const loadPreset = (presetKey: string) => {
    const p = PRESETS[presetKey];
    if (!p) return;
    setNumProcesses(p.numProcesses);
    setNumResources(p.numResources);
    setAllocation(p.allocation);
    setMax(p.max);
    setAvailable(p.available);
    setIsCarriedFromSimulator(false);
    setMaxValidationError(null);
    setSafetyResult(null);
    setCurrentStepIndex(0);
    // Clear transferred state if user explicitly loads a preset
    try {
      sessionStorage.removeItem("banker_transferred_state");
    } catch {
      // ignore
    }
  };

  // Re-dimension matrices when user adjusts process or resource count (Requirement 8)
  const handleConfigChange = (newP: number, newR: number) => {
    const clampedP = Math.max(2, Math.min(8, newP));
    const clampedR = Math.max(2, Math.min(6, newR));

    setNumProcesses(clampedP);
    setNumResources(clampedR);

    const newAlloc: Matrix = Array.from({ length: clampedP }, (_, i) =>
      Array.from({ length: clampedR }, (_, j) => allocation[i]?.[j] ?? 0)
    );
    const newMax: (number | null)[][] = Array.from({ length: clampedP }, (_, i) =>
      Array.from({ length: clampedR }, (_, j) => max[i]?.[j] ?? null)
    );
    const newAvail: Vector = Array.from({ length: clampedR }, (_, j) => available[j] ?? 3);

    setAllocation(newAlloc);
    setMax(newMax);
    setAvailable(newAvail);
    setSafetyResult(null);
    setCurrentStepIndex(0);
    setMaxValidationError(null);
  };

  const handleMaxChange = (newMax: (number | null)[][]) => {
    setMax(newMax);
    const check = validateBankerMaximum(allocation, newMax);
    if (check.isValid) {
      setMaxValidationError(null);
    }
  };

  // Run Banker's Safety Algorithm (Requirement 6, 7 & 12)
  const handleRunSafetyCheck = () => {
    // Validate: Maximum[i][j] >= Allocation[i][j] and not missing
    const maxValidation = validateBankerMaximum(allocation, max);
    if (!maxValidation.isValid) {
      setMaxValidationError(
        maxValidation.errorMessage ||
          "Please enter valid Maximum values. Maximum must be greater than or equal to Allocation."
      );
      return;
    }

    setMaxValidationError(null);

    // Also check standard available vector issues
    const issues = validateInputs(allocation, max, available, processNames, resourceNames);
    const nonMaxIssues = issues.filter(iss => iss.field !== "max");
    if (nonMaxIssues.length > 0) {
      setMaxValidationError(nonMaxIssues[0].message);
      return;
    }

    // Execute algorithm
    const res = runBankersSafetyAlgorithm(
      allocation,
      max as Matrix,
      available,
      processNames,
      resourceNames
    );
    setSafetyResult(res);
    setCurrentStepIndex(0);
    setActiveTab("stepper");
  };

  const handleReset = () => {
    loadPreset("safeSilberschatz");
  };

  const handleApplyRequest = (
    newAlloc: Matrix,
    newAvail: Vector,
    newNeed: Matrix,
    evalRes: RequestEvaluationResult
  ) => {
    setAllocation(newAlloc);
    setAvailable(newAvail);
    if (evalRes.tentativeResult) {
      setSafetyResult(evalRes.tentativeResult);
      setCurrentStepIndex(0);
      setActiveTab("stepper");
    }
  };

  const currentStep = safetyResult ? safetyResult.steps[currentStepIndex] : null;
  const currentWork = currentStep ? currentStep.workAfter : available;
  const prevWork = currentStep ? currentStep.workBefore : null;
  const evaluatingProcessIndex = currentStep ? currentStep.processIndex : null;
  const finishedProcesses = currentStep ? currentStep.finished : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 flex flex-col gap-6">
      {/* Top Banner / Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Banker&apos;s Algorithm Module</span>
          </div>
          {/* Requirement 10: Visible Heading */}
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Banker’s Algorithm — Safe State Analysis
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Checks whether granting a resource request keeps the system in a safe state before resources are handed over.
          </p>
        </div>

        {/* Demo Presets */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-medium mr-1">Demonstration:</span>
          <button
            onClick={() => loadPreset("safeSilberschatz")}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 transition-colors cursor-pointer"
          >
            Safe Example (5P, 3R)
          </button>
          <button
            onClick={() => loadPreset("unsafeExample")}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 transition-colors cursor-pointer"
          >
            Unsafe Example
          </button>
          <button
            onClick={handleReset}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Requirement 11: Information Message when carried from Deadlock Detection */}
      {isCarriedFromSimulator && (
        <div className="p-4 rounded-xl bg-cyan-950/70 border border-cyan-500/60 text-cyan-200 text-xs sm:text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg backdrop-blur-sm">
          <div className="flex items-center gap-2.5">
            <Info className="w-5 h-5 text-cyan-400 flex-shrink-0" />
            <span className="font-medium">
              Allocation and Available values were carried from Deadlock Detection. Enter the Maximum Matrix to continue.
            </span>
          </div>
          <span className="text-[11px] px-2.5 py-1 rounded-md bg-cyan-900/80 text-cyan-300 font-mono font-bold border border-cyan-600/50 flex-shrink-0">
            {numProcesses}P × {numResources}R Carried
          </span>
        </div>
      )}

      {/* Requirement 7: Prominent Error Banner when Maximum is missing or invalid */}
      {maxValidationError && (
        <div className="p-4 rounded-xl bg-rose-950/70 border border-rose-500 text-rose-200 text-xs sm:text-sm font-semibold flex items-center gap-2.5 shadow-xl animate-shake">
          <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
          <span>{maxValidationError}</span>
        </div>
      )}

      {/* Section 6 Requirement Box: Theory, Formula, Example & Definitions */}
      <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-tr from-cyan-950/40 via-slate-900 to-slate-950 p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2.5 text-cyan-300 font-bold text-base">
          <BookOpen className="w-5 h-5 text-cyan-400" />
          <span>Section 6: Banker&apos;s Algorithm Principles &amp; Mathematical Model</span>
        </div>

        <p className="text-sm text-slate-200 leading-relaxed">
          Banker&apos;s Algorithm checks whether granting a resource request keeps the system in a safe state before resources are handed over.
        </p>

        {/* Mathematical Formula & Example */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1 font-mono text-xs">
          <div className="p-4 rounded-xl bg-slate-950/80 border border-cyan-500/30">
            <span className="text-cyan-400 font-bold block mb-1 font-sans text-xs">
              Formula:
            </span>
            <div className="text-base sm:text-lg font-bold text-white tracking-wide">
              Need = Maximum − Allocation
            </div>
            <p className="text-[11px] text-slate-400 font-sans mt-2">
              For every process P<sub>i</sub> and resource R<sub>j</sub>: <code className="text-cyan-300">Need[i][j] = Max[i][j] - Alloc[i][j]</code>
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-emerald-400 font-bold block mb-1 font-sans text-xs">
              Concrete Example:
            </span>
            <div className="text-xs sm:text-sm text-slate-200 space-y-1">
              <div><strong className="text-slate-400">Resources:</strong> R1, R2, R3</div>
              <div><strong className="text-slate-400">Maximum:</strong> [3, 2, 2]</div>
              <div><strong className="text-slate-400">Allocation:</strong> [1, 1, 0]</div>
              <div className="text-cyan-300 font-bold pt-1">
                &rarr; Need: [3-1, 2-1, 2-0] = [2, 1, 2]
              </div>
            </div>
          </div>
        </div>

        {/* 4 Key Concepts / Explanations (Required by Section 6) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs pt-2">
          <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800">
            <span className="font-bold text-cyan-300 block mb-0.5">Allocation</span>
            <span className="text-slate-300">What the process HAS</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800">
            <span className="font-bold text-purple-300 block mb-0.5">Maximum</span>
            <span className="text-slate-300">What the process MAY NEED</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800">
            <span className="font-bold text-emerald-300 block mb-0.5">Available</span>
            <span className="text-slate-300">Resources currently free</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800">
            <span className="font-bold text-amber-300 block mb-0.5">Need</span>
            <span className="text-slate-300">Additional resources required</span>
          </div>
        </div>

        {/* Section 7: Banker's Workflow Visual Chart */}
        <div className="pt-3 border-t border-slate-800">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2 font-mono">
            Banker&apos;s Safety Workflow:
          </span>
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            <span className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300">
              Input Allocation + Maximum + Available
            </span>
            <span className="text-slate-500">&rarr;</span>
            <span className="px-2.5 py-1 rounded bg-slate-950 border border-cyan-500/40 text-cyan-300">
              Calculate Need
            </span>
            <span className="text-slate-500">&rarr;</span>
            <span className="px-2.5 py-1 rounded bg-slate-950 border border-amber-500/40 text-amber-300">
              Need &le; Available ?
            </span>
            <span className="text-slate-500">&rarr;</span>
            <span className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300">
              Release &amp; Update Available
            </span>
            <span className="text-slate-500">&rarr;</span>
            <span className="px-2.5 py-1 rounded bg-slate-950 border border-emerald-500/40 text-emerald-300">
              Find Safe Sequence
            </span>
            <span className="text-slate-500">&rarr;</span>
            <span className="px-2.5 py-1 rounded bg-emerald-500/20 border border-emerald-500 text-emerald-300 font-bold">
              SAFE STATE
            </span>
            <span className="text-slate-500">|</span>
            <span className="px-2.5 py-1 rounded bg-rose-500/20 border border-rose-500 text-rose-300 font-bold">
              UNSAFE STATE (Risk of deadlock — request is denied)
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-3 gap-2 p-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs sm:text-sm font-semibold">
        <button
          onClick={() => setActiveTab("matrices")}
          className={`py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === "matrices"
              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>1. System Matrices &amp; Need</span>
        </button>

        <button
          onClick={() => {
            if (!safetyResult) {
              handleRunSafetyCheck();
            } else {
              setActiveTab("stepper");
            }
          }}
          className={`py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === "stepper"
              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Play className="w-4 h-4" />
          <span>2. Step-by-Step Stepper</span>
        </button>

        <button
          onClick={() => setIsRequestModalOpen(true)}
          className="py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-850 border border-slate-800 cursor-pointer"
        >
          <Zap className="w-4 h-4 text-amber-400" />
          <span>3. Resource Request Simulation</span>
        </button>
      </div>

      {/* TAB 1: Matrices & Configuration */}
      {activeTab === "matrices" && (
        <div className="space-y-6">
          {/* Dimension Controls */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Settings className="w-4 h-4 text-cyan-400" />
                  <span>Configure Processes &amp; Resources</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Processes: {processNames.join(", ")} &bull; Resources: {resourceNames.join(", ")}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-medium text-slate-300">Processes:</label>
                  <input
                    type="number"
                    min="2"
                    max="8"
                    value={numProcesses}
                    onChange={(e) => handleConfigChange(parseInt(e.target.value, 10), numResources)}
                    className="w-14 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-center text-sm font-bold text-cyan-300 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-xs font-medium text-slate-300">Resources:</label>
                  <input
                    type="number"
                    min="2"
                    max="6"
                    value={numResources}
                    onChange={(e) => handleConfigChange(numProcesses, parseInt(e.target.value, 10))}
                    className="w-14 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-center text-sm font-bold text-cyan-300 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Available Vector */}
          <AvailableVector
            vector={available}
            resourceNames={resourceNames}
            onChangeVector={setAvailable}
            validationIssues={validationIssues}
            title="Available Vector (Free Resources)"
            description="Resources currently unallocated in the system (Available = Resources currently free)"
          />

          {/* Allocation and Maximum Claim Matrices (Requirements 4, 6, 7 & 8) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AllocationMatrix
              matrix={allocation}
              processNames={processNames}
              resourceNames={resourceNames}
              onChangeMatrix={setAllocation}
              validationIssues={validationIssues}
            />

            <MaximumMatrix
              matrix={max}
              allocation={allocation}
              processNames={processNames}
              resourceNames={resourceNames}
              onChangeMatrix={handleMaxChange}
              validationIssues={validationIssues}
            />
          </div>

          {/* Need Matrix (Need = Maximum - Allocation) */}
          <NeedMatrix
            needMatrix={need}
            processNames={processNames}
            resourceNames={resourceNames}
          />

          {/* Run Safety Check CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 shadow-xl">
            <div>
              <h3 className="font-bold text-white text-base">
                Ready to evaluate system safety?
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Banker&apos;s Algorithm will execute step-by-step to determine if a safe execution sequence exists.
              </p>
            </div>

            <button
              onClick={handleRunSafetyCheck}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm shadow-xl transition-all bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-slate-950 shadow-cyan-500/25 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>Run Banker&apos;s Safety Check</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: Step-by-Step Stepper (Section 7) */}
      {activeTab === "stepper" && (
        <div className="space-y-6">
          {!safetyResult ? (
            <div className="text-center py-16 p-6 rounded-2xl border border-slate-800 bg-slate-900/40">
              <Cpu className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white mb-1">
                No Algorithm Execution in Progress
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Click Run Banker&apos;s Safety Check to trace process evaluations step-by-step.
              </p>
              <button
                onClick={handleRunSafetyCheck}
                className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm shadow-md cursor-pointer"
              >
                Start Safety Evaluation
              </button>
            </div>
          ) : (
            <>
              {/* Stepper with Next Step, Auto Run, Pause and Reset */}
              <AlgorithmStepper
                steps={safetyResult.steps}
                currentStepIndex={currentStepIndex}
                onStepChange={setCurrentStepIndex}
                onReset={() => setCurrentStepIndex(0)}
                safeSequence={safetyResult.safeSequence}
              />

              {/* Work Vector */}
              <WorkVector
                available={available}
                work={currentWork}
                previousWork={prevWork}
                resourceNames={resourceNames}
                lastAddedAllocation={
                  currentStep?.processIndex !== null && currentStep?.canAllocate
                    ? allocation[currentStep.processIndex!]
                    : null
                }
                lastFinishedProcessId={
                  currentStep?.processIndex !== null && currentStep?.canAllocate
                    ? currentStep.processId
                    : null
                }
              />

              {/* Process Cards Grid (Need <= Work Check) */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
                    Process State Matrix (Need &le; Available Evaluator)
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">
                    {finishedProcesses.filter(Boolean).length} / {numProcesses} completed
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {processNames.map((pId, idx) => {
                    const isEval = evaluatingProcessIndex === idx;
                    const isDone = finishedProcesses[idx] || false;

                    return (
                      <ProcessCard
                        key={pId}
                        processId={pId}
                        processIndex={idx}
                        allocation={allocation[idx] || []}
                        max={(max[idx] || []).map(m => m ?? 0)}
                        need={(need[idx] || []).map(n => n ?? 0)}
                        resourceNames={resourceNames}
                        isFinished={isDone}
                        isEvaluating={isEval}
                        comparisons={isEval ? currentStep?.comparisons : null}
                        canAllocate={isEval ? currentStep?.canAllocate : null}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Result Panel */}
              <ResultPanel
                bankerResult={safetyResult}
                resourceNames={resourceNames}
                onReset={handleReset}
                onRequestSimulation={() => setIsRequestModalOpen(true)}
              />
            </>
          )}
        </div>
      )}

      {/* Resource Request Modal (Section 8) */}
      <ResourceRequestModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        allocation={allocation}
        max={(max || []).map(row => row.map(cell => cell ?? 0))}
        available={available}
        need={(need || []).map(row => row.map(cell => cell ?? 0))}
        processNames={processNames}
        resourceNames={resourceNames}
        onApplyRequest={handleApplyRequest}
      />
    </div>
  );
}

export default function BankerPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading Banker&apos;s Algorithm...</div>}>
      <BankerContent />
    </Suspense>
  );
}
