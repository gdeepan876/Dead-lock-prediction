import Link from "next/link";
import { 
  Info, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Cpu, 
  Terminal, 
  Layers, 
  GraduationCap, 
  Code2, 
  ArrowRight 
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-4">
          <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
          <span>College Operating Systems Project Documentation &bull; OS Viva</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Deadlock Detection &amp; Prevention
        </h1>
        <p className="mt-2 text-cyan-400 font-semibold text-lg">
          Using Banker&apos;s Algorithm
        </p>
        <p className="mt-3 text-slate-300 text-sm sm:text-base max-w-2xl mx-auto">
          A dedicated interactive Operating Systems project website designed to evaluate matrix resource allocations, detect deadlocks, and demonstrate avoidance with Banker&apos;s Algorithm for college demonstrations and viva examinations.
        </p>
      </div>

      <div className="space-y-8 text-sm text-slate-300 leading-relaxed">
        {/* Recommended Viva Narration */}
        <div className="p-6 rounded-2xl bg-gradient-to-tr from-cyan-950/40 via-slate-900 to-emerald-950/40 border border-cyan-500/40 shadow-lg">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm mb-2">
            <Terminal className="w-4 h-4" />
            <span>Recommended Viva Narration for Demonstration</span>
          </div>
          <blockquote className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 text-xs sm:text-sm font-medium italic leading-relaxed">
            &ldquo;In this project, our Deadlock Simulator first evaluates the Allocation Matrix, Request Matrix, and Available Vector to check whether any processes are deadlocked. For deadlock prevention, we implement Banker&apos;s Algorithm: the system calculates Need = Maximum − Allocation. When a process requests resources, the OS verifies Request &le; Need and Request &le; Available. It tentatively allocates resources and runs the safety algorithm. If every process can complete, the state is safe and the request is approved. If an unsafe state would result, the request is denied to prevent deadlock.&rdquo;
          </blockquote>
        </div>

        {/* Project Modules */}
        <section className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            Core Project Modules
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
              <span className="font-bold text-cyan-300 text-sm block">1. Deadlock Detection Simulator</span>
              <p className="text-slate-400 leading-relaxed">
                Inputs editable Allocation, Request, and Available vectors. Determines whether the system is SAFE (✓ No Deadlock Detected) or UNSAFE (⚠ Deadlock Detected) with exact explanations for blocked processes.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
              <span className="font-bold text-emerald-300 text-sm block">2. Banker&apos;s Algorithm Stepper</span>
              <p className="text-slate-400 leading-relaxed">
                Calculates Need Matrix (Need = Max − Allocation), runs step-by-step playback with Auto Run, Pause, Next Step, and Reset, and executes dynamic Resource Request simulations.
              </p>
            </div>
          </div>
        </section>

        {/* Technical Architecture */}
        <section className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Code2 className="w-5 h-5 text-cyan-400" />
            Technical Architecture &amp; Implementation
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
              <span className="font-bold text-cyan-400 block mb-1">Frontend Framework</span>
              <span className="text-slate-300">Next.js App Router, React 19, TypeScript</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
              <span className="font-bold text-cyan-400 block mb-1">Styling &amp; Theme</span>
              <span className="text-slate-300">Tailwind CSS with academic dark dashboard aesthetic</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
              <span className="font-bold text-cyan-400 block mb-1">Algorithms</span>
              <span className="text-slate-300">Pure TypeScript Deadlock Detection &amp; Banker&apos;s Safety</span>
            </div>
          </div>
        </section>

        {/* CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            href="/simulator"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-slate-950 font-bold text-sm shadow-xl shadow-cyan-500/20 transition-all hover:scale-105"
          >
            <span>Launch Deadlock Simulator</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/banker"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-sm transition-all"
          >
            <span>Explore Banker&apos;s Algorithm</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
