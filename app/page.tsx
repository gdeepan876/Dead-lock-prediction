import Link from "next/link";
import { 
  ShieldCheck, 
  Cpu, 
  ArrowRight, 
  BookOpen, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  Zap, 
  Lock,
  GitBranch,
  Terminal,
  Activity,
  RotateCw
} from "lucide-react";

export default function Home() {
  return (
    <div className="flex-1 flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-14 sm:py-20 border-b border-slate-800/80 bg-gradient-to-b from-slate-950 via-[#0a0f1d] to-[#090d16]">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-cyan-500/15 via-emerald-500/10 to-violet-500/15 blur-[120px] pointer-events-none rounded-full" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Section 2: Display OPERATING SYSTEMS PROJECT */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-6 shadow-sm">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span className="tracking-wide">OPERATING SYSTEMS PROJECT</span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
          </div>

          {/* Section 2: Main title: Deadlock Detection & Prevention */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.15]">
            Deadlock Detection &amp; Prevention
          </h1>

          {/* Section 2: Subtitle: Using Banker's Algorithm */}
          <h2 className="mt-3 text-xl sm:text-2xl font-bold bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
            Using Banker&apos;s Algorithm
          </h2>

          {/* Section 2: Description: Detect deadlocks and prevent unsafe resource allocation using Banker's Algorithm */}
          <p className="mt-5 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Detect deadlocks and prevent unsafe resource allocation using Banker&apos;s Algorithm.
          </p>

          {/* Section 2: Buttons: Start Simulation and Learn How It Works */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/simulator"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-slate-950 font-bold text-sm sm:text-base shadow-xl shadow-cyan-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Start Simulation</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/how-it-works"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-semibold text-sm sm:text-base transition-all hover:border-slate-600"
            >
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>Learn How It Works</span>
            </Link>
          </div>

          {/* Section 2 Requirement: P1/R1/R2/P2 Deadlock Visual */}
          {/* "Show a simple P1/R1/R2/P2 deadlock visual. Show: P1 holds R1 and requests R2; P2 holds R2 and requests R1; RESULT: DEADLOCK." */}
          <div className="mt-12 max-w-3xl mx-auto rounded-2xl border border-rose-500/40 bg-slate-950/90 p-6 sm:p-8 shadow-2xl backdrop-blur-md relative overflow-hidden">
            <div className="absolute top-0 right-0 px-4 py-1 rounded-bl-xl bg-rose-500/20 border-l border-b border-rose-500/40 text-rose-300 text-xs font-mono font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>Classic Resource Allocation Graph (RAG)</span>
            </div>

            <div className="text-left mb-6">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                Deadlock Circular Wait Demonstration
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-white mt-1">
                Visualizing Coffman Circular Wait Condition
              </h3>
            </div>

            {/* Interactive Visual Graph of P1 -> R2 -> P2 -> R1 -> P1 */}
            <div className="py-6 px-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 items-center text-center font-mono">
                {/* P1 Node */}
                <div className="p-4 rounded-xl bg-cyan-950/60 border border-cyan-500/50 shadow-md">
                  <div className="w-10 h-10 mx-auto rounded-full bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300 font-black text-base mb-2">
                    P1
                  </div>
                  <div className="text-xs font-bold text-slate-200">Process 1</div>
                  <div className="text-[11px] text-emerald-400 mt-1">Holds: R1</div>
                  <div className="text-[11px] text-amber-400 font-semibold">Requests: R2</div>
                </div>

                {/* Arrow & R2 Node */}
                <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 shadow-md">
                  <div className="w-10 h-10 mx-auto rounded-lg bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-300 font-black text-base mb-2">
                    R2
                  </div>
                  <div className="text-xs font-bold text-slate-200">Resource 2</div>
                  <div className="text-[11px] text-slate-400 mt-1">Held by: P2</div>
                  <div className="text-[11px] text-cyan-400">Needed by: P1</div>
                </div>

                {/* P2 Node */}
                <div className="p-4 rounded-xl bg-cyan-950/60 border border-cyan-500/50 shadow-md">
                  <div className="w-10 h-10 mx-auto rounded-full bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300 font-black text-base mb-2">
                    P2
                  </div>
                  <div className="text-xs font-bold text-slate-200">Process 2</div>
                  <div className="text-[11px] text-emerald-400 mt-1">Holds: R2</div>
                  <div className="text-[11px] text-amber-400 font-semibold">Requests: R1</div>
                </div>

                {/* R1 Node */}
                <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 shadow-md">
                  <div className="w-10 h-10 mx-auto rounded-lg bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-300 font-black text-base mb-2">
                    R1
                  </div>
                  <div className="text-xs font-bold text-slate-200">Resource 1</div>
                  <div className="text-[11px] text-slate-400 mt-1">Held by: P1</div>
                  <div className="text-[11px] text-cyan-400">Needed by: P2</div>
                </div>
              </div>

              {/* Cycle Flow Representation */}
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-2 text-xs font-mono text-slate-300 bg-slate-950/90 p-3 rounded-lg border border-slate-800">
                <span className="text-cyan-400 font-bold">P1 holds R1</span>
                <span className="text-slate-500">&rarr;</span>
                <span className="text-amber-400 font-semibold">requests R2</span>
                <span className="text-slate-500">&bull;</span>
                <span className="text-cyan-400 font-bold">P2 holds R2</span>
                <span className="text-slate-500">&rarr;</span>
                <span className="text-amber-400 font-semibold">requests R1</span>
                <span className="text-slate-500">&bull;</span>
                <span className="text-rose-400 font-bold uppercase">Circular Wait</span>
              </div>
            </div>

            {/* Exact Required Prompt String: "P1 holds R1 and requests R2; P2 holds R2 and requests R1; RESULT: DEADLOCK." */}
            <div className="mt-5 p-4 rounded-xl bg-rose-950/60 border border-rose-500/70 text-center shadow-lg">
              <p className="text-sm sm:text-base font-mono text-rose-200">
                <strong className="text-white">P1 holds R1 and requests R2; P2 holds R2 and requests R1;</strong>{" "}
                <span className="px-2.5 py-1 rounded bg-rose-600 text-white font-extrabold text-sm sm:text-base ml-1 tracking-wider inline-block">
                  RESULT: DEADLOCK
                </span>
              </p>
            </div>

            {/* Quick Demo Button for this scenario */}
            <div className="mt-4 flex justify-center">
              <Link
                href="/simulator?preset=classicTwoProcess"
                className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-300 hover:text-cyan-200 hover:underline"
              >
                <span>&rarr; Test this exact 2-process scenario in the Deadlock Simulator</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Section 1: Main Flow Architecture */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/50 text-xs font-semibold uppercase tracking-wider mb-2">
            <GitBranch className="w-3.5 h-3.5" />
            <span>Workflow Pipeline</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            End-to-End Deadlock Analysis Flow
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-400">
            From entering system matrices to detecting deadlocks and preventing unsafe requests via Banker&apos;s Algorithm.
          </p>
        </div>

        {/* Workflow Steps Horizontal Pipeline (Section 1) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 relative">
            <span className="text-xs font-mono text-cyan-400 font-bold">STAGE 01</span>
            <h3 className="text-base font-bold text-white mt-1">Deadlock Simulator</h3>
            <p className="text-xs text-slate-400 mt-2">
              Enter number of processes, resources, editable Allocation Matrix, Request Matrix, and Available Vector.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 relative">
            <span className="text-xs font-mono text-cyan-400 font-bold">STAGE 02</span>
            <h3 className="text-base font-bold text-white mt-1">Calculate / Analyze</h3>
            <p className="text-xs text-slate-400 mt-2">
              The detection algorithm checks whether pending requests can be sequentially satisfied with free resources.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 relative">
            <span className="text-xs font-mono text-cyan-400 font-bold">STAGE 03</span>
            <h3 className="text-base font-bold text-white mt-1">Safe / Unsafe Result</h3>
            <p className="text-xs text-slate-400 mt-2">
              Outputs &ldquo;✓ NO DEADLOCK DETECTED (Safe)&rdquo; or &ldquo;⚠ DEADLOCK DETECTED (Unsafe)&rdquo; with exact bottleneck reasons.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 relative">
            <span className="text-xs font-mono text-cyan-400 font-bold">STAGE 04</span>
            <h3 className="text-base font-bold text-white mt-1">Banker&apos;s Prevention</h3>
            <p className="text-xs text-slate-400 mt-2">
              Computes Need = Max − Allocation, tests tentative requests, and rejects unsafe allocations before deadlock occurs.
            </p>
          </div>
        </div>

        {/* Demo Data Quick Action (Section 13) */}
        <div className="mt-12 rounded-2xl bg-gradient-to-r from-cyan-950/70 via-slate-900 to-emerald-950/70 border border-cyan-500/30 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Cpu className="w-4 h-4" />
              <span>Section 13 &bull; Demo Data Presets</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white">
              Instant College Demonstration Scenarios
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Quickly load classic Operating Systems textbook scenarios to showcase safe sequences and deadlock detection states to examiners.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/simulator?preset=safeSilberschatz"
              className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-md transition-all hover:scale-105"
            >
              Load Safe Example
            </Link>
            <Link
              href="/simulator?preset=unsafeDeadlock"
              className="px-5 py-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/50 font-bold text-sm transition-all"
            >
              Load Unsafe Example
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
