import Link from "next/link";
import { 
  BookOpen, 
  ShieldCheck, 
  HelpCircle, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  FileText, 
  Cpu, 
  Terminal,
  Layers,
  Zap,
  RotateCcw
} from "lucide-react";

export default function HowItWorksPage() {
  const vivaQuestions = [
    {
      q: "What is Banker's Algorithm and why is it named 'Banker's'?",
      a: "Banker's Algorithm is a deadlock avoidance algorithm formulated by Edsger Dijkstra in 1965. It is analogous to a conservative town banker who never allocates cash to clients in such a way that the remaining bank funds cannot fulfill the maximum remaining borrowing limit of at least one client, thereby ensuring all loans are guaranteed to eventually be repaid and no deadlock occurs."
    },
    {
      q: "What is the difference between Deadlock Detection and Banker's Deadlock Avoidance?",
      a: "Deadlock Detection is an after-the-fact mechanism: given the current Allocation and pending Request matrices, it checks whether existing processes are already in a state of deadlock (unable to finish). Banker's Algorithm is an avoidance/prevention mechanism: before resources are handed over, it tests whether granting a resource request leaves the system in a Safe State. If unsafe, the request is rejected or delayed, thus preventing deadlocks from ever forming."
    },
    {
      q: "What is the formula for the Need Matrix in Banker's Algorithm?",
      a: "Need = Maximum − Allocation.\nFor each process Pi and resource Rj: Need[i][j] = Max[i][j] - Allocation[i][j]. It represents the additional resources that a process may request in the future to complete its execution."
    },
    {
      q: "Does an Unsafe State always mean a Deadlock has already occurred?",
      a: "No! All deadlocked states are unsafe, but not all unsafe states are deadlocked. An unsafe state simply means the operating system can no longer guarantee avoidance of a deadlock if all processes simultaneously demand their declared maximum claims."
    },
    {
      q: "What are the four necessary Coffman conditions for a Deadlock?",
      a: "1. Mutual Exclusion: At least one resource must be held in a non-shareable mode.\n2. Hold and Wait: A process holds resources while requesting additional ones.\n3. No Preemption: Resources cannot be forcibly taken; only released voluntarily.\n4. Circular Wait: A closed chain of processes exists where each process waits for a resource held by the next."
    },
    {
      q: "How does the Resource-Request Algorithm work?",
      a: "1. If Request[i] > Need[i], raise error: Process has exceeded its maximum claim.\n2. If Request[i] > Available, process Pi must wait (insufficient free resources).\n3. Tentatively simulate allocation: Available = Available − Request[i], Allocation[i] = Allocation[i] + Request[i], Need[i] = Need[i] − Request[i].\n4. Run Banker's Safety Algorithm on the tentative state: If Safe, approve request. If Unsafe, roll back and deny the request."
    },
    {
      q: "What are the steps of the Banker's Safety Algorithm?",
      a: "1. Let Work = Available, Finish[i] = false for all processes.\n2. Find an index i such that Finish[i] == false and Need[i] <= Work.\n3. If found: Work = Work + Allocation[i], Finish[i] = true, append Pi to safe sequence, and repeat step 2.\n4. If all processes finish (Finish[i] == true for all i), system is Safe. Otherwise, Unsafe."
    },
    {
      q: "What is the time complexity of Banker's Algorithm?",
      a: "The safety check algorithm runs in O(m * n^2) time, where n is the number of processes and m is the number of resource types."
    },
    {
      q: "What should the operating system do when Request <= Available, but the tentative state is Unsafe?",
      a: "The OS must deny or postpone granting the request, restore the original Available, Allocation, and Need states, and place the requesting process in a waiting state to avoid creating a deadlock."
    },
    {
      q: "Why is Banker's Algorithm rarely used in modern desktop/server OS kernels?",
      a: "Because processes rarely know or declare their maximum resource requirements up front, the set of active processes is constantly fluctuating, and executing an O(m * n^2) matrix check on every lock/malloc call creates prohibitive kernel overhead."
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-4">
          <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
          <span>Comprehensive Operating Systems Guide</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          How Deadlock Detection &amp; Prevention Works
        </h1>
        <p className="mt-3 text-slate-300 text-sm sm:text-base max-w-2xl mx-auto">
          Theoretical foundation, mathematical definitions, resource allocation graphs, Banker&apos;s safety checks, and viva examination preparation.
        </p>
      </div>

      {/* Navigation Quick Links */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 mb-10 flex flex-wrap items-center justify-around gap-2 text-xs font-medium text-cyan-400">
        <a href="#detection-vs-avoidance" className="hover:text-cyan-300 transition-colors">
          &bull; Detection vs Avoidance
        </a>
        <a href="#coffman" className="hover:text-cyan-300 transition-colors">
          &bull; 4 Coffman Conditions
        </a>
        <a href="#safety-algo" className="hover:text-cyan-300 transition-colors">
          &bull; Safety Algorithm Steps
        </a>
        <a href="#request-algo" className="hover:text-cyan-300 transition-colors">
          &bull; Resource-Request Algorithm
        </a>
        <a href="#viva" className="hover:text-cyan-300 transition-colors">
          &bull; Top 10 Viva Q&amp;A
        </a>
      </div>

      {/* Section 1: Deadlock Detection vs Avoidance */}
      <section id="detection-vs-avoidance" className="mb-12 space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
          <Layers className="w-6 h-6 text-cyan-400" />
          1. Deadlock Detection vs. Banker&apos;s Avoidance
        </h2>
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-4 text-sm text-slate-300 leading-relaxed">
          <p>
            Operating systems handle deadlocks through distinct strategies:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div className="p-4 rounded-xl bg-slate-950/80 border border-cyan-500/30 text-xs">
              <span className="font-bold text-cyan-300 text-sm block mb-1">
                Deadlock Detection (Simulator Page)
              </span>
              <p className="text-slate-300 leading-relaxed">
                Uses <strong>Allocation Matrix</strong>, <strong>Request Matrix</strong>, and <strong>Available Vector</strong>. It examines whether existing processes can complete their pending requests with free resources. If a subset of processes cannot complete due to cyclic dependency, a <em>Deadlock is Detected</em>.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-emerald-500/30 text-xs">
              <span className="font-bold text-emerald-300 text-sm block mb-1">
                Banker&apos;s Avoidance (Banker Page)
              </span>
              <p className="text-slate-300 leading-relaxed">
                Uses <strong>Allocation</strong>, <strong>Maximum</strong>, <strong>Need</strong> (<code className="text-cyan-300">Need = Max − Allocation</code>), and <strong>Available</strong>. Dynamically inspects resource requests before granting them, ensuring the OS never enters an unsafe state.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: 4 Coffman Conditions */}
      <section id="coffman" className="mb-12 space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
          <AlertTriangle className="w-6 h-6 text-amber-400" />
          2. The Four Necessary Coffman Conditions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="font-bold text-cyan-400 text-sm block mb-1">
              1. Mutual Exclusion
            </span>
            <p className="text-slate-300 leading-relaxed">
              At least one resource must be non-shareable. Only one process can utilize the resource at any given moment.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="font-bold text-cyan-400 text-sm block mb-1">
              2. Hold and Wait
            </span>
            <p className="text-slate-300 leading-relaxed">
              A process must be holding at least one allocated resource while simultaneously waiting to acquire additional resources held by others.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="font-bold text-cyan-400 text-sm block mb-1">
              3. No Preemption
            </span>
            <p className="text-slate-300 leading-relaxed">
              Resources cannot be forcibly confiscated from a process; they can only be released voluntarily after the process completes.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="font-bold text-rose-400 text-sm block mb-1">
              4. Circular Wait
            </span>
            <p className="text-slate-300 leading-relaxed">
              A closed chain exists where P1 waits for R2 (held by P2), and P2 waits for R1 (held by P1), causing infinite suspension.
            </p>
          </div>
        </div>
      </section>

      {/* Section 3: Banker's Safety Algorithm Mechanics */}
      <section id="safety-algo" className="mb-12 space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
          <ShieldCheck className="w-6 h-6 text-emerald-400" />
          3. Banker&apos;s Safety Algorithm Steps
        </h2>
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-4 text-xs sm:text-sm text-slate-300 font-mono">
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-cyan-400 font-bold block mb-1 font-sans">
              Need Calculation Formula
            </span>
            <code>Need[i][j] = Maximum[i][j] - Allocation[i][j]</code>
          </div>

          <div className="space-y-3 font-sans">
            <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
              <span className="font-bold text-white block mb-0.5">Step 1: Initialization</span>
              <p className="text-slate-400 text-xs">
                Let <code className="text-cyan-300 font-mono">Work = Available</code>.<br />
                Let <code className="text-cyan-300 font-mono">Finish[i] = false</code> for all processes i = 0, ..., n-1.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
              <span className="font-bold text-white block mb-0.5">Step 2: Candidate Process Selection</span>
              <p className="text-slate-400 text-xs">
                Find an index <code className="text-cyan-300 font-mono">i</code> such that: <code className="text-cyan-300 font-mono">Finish[i] == false</code> and for all resources j: <code className="text-cyan-300 font-mono">Need[i][j] &le; Work[j]</code>.<br />
                If no such <code className="text-cyan-300 font-mono">i</code> exists, proceed to Step 4.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
              <span className="font-bold text-white block mb-0.5">Step 3: Simulated Completion &amp; Reclaim</span>
              <p className="text-slate-400 text-xs">
                <code className="text-cyan-300 font-mono">Work = Work + Allocation[i]</code><br />
                <code className="text-cyan-300 font-mono">Finish[i] = true</code><br />
                Append <code className="text-cyan-300 font-mono">Pi</code> to Safe Sequence. Return to Step 2.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
              <span className="font-bold text-white block mb-0.5">Step 4: Safety Assessment</span>
              <p className="text-slate-400 text-xs">
                If <code className="text-cyan-300 font-mono">Finish[i] == true</code> for all i, system is in <strong>SAFE STATE</strong> (Deadlock Risk: NO).<br />
                Otherwise, system is in <strong>UNSAFE STATE</strong> (Deadlock Risk: YES).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Resource-Request Algorithm */}
      <section id="request-algo" className="mb-12 space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
          <Zap className="w-6 h-6 text-cyan-400" />
          4. Resource Request Algorithm (Deadlock Prevention)
        </h2>
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-4 text-xs sm:text-sm text-slate-300">
          <p className="leading-relaxed">
            When a process P<sub>i</sub> issues a resource request vector:
          </p>

          <ol className="list-decimal list-inside space-y-2 text-slate-300">
            <li>
              <strong>Check Need:</strong> If <code className="text-cyan-300 font-mono">Request &gt; Need</code>, reject immediately: <em>Process exceeded maximum claim.</em>
            </li>
            <li>
              <strong>Check Available:</strong> If <code className="text-cyan-300 font-mono">Request &gt; Available</code>, P<sub>i</sub> must wait (insufficient free resources).
            </li>
            <li>
              <strong>Tentative Allocation:</strong> Pretend to grant request by modifying vectors:
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-cyan-300 text-xs my-2">
                Available = Available − Request;<br />
                Allocation[i] = Allocation[i] + Request;<br />
                Need[i] = Need[i] − Request;
              </div>
            </li>
            <li>
              <strong>Safety Evaluation:</strong> Run safety check on tentative state. If safe &rarr; <strong>REQUEST APPROVED</strong>. If unsafe &rarr; <strong>REQUEST DENIED</strong> and state is rolled back.
            </li>
          </ol>
        </div>
      </section>

      {/* Section 5: Top 10 Viva Questions */}
      <section id="viva" className="mb-12 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
            <HelpCircle className="w-6 h-6 text-cyan-400" />
            5. Top 10 OS Viva Questions &amp; Answers
          </h2>
          <span className="text-xs px-2.5 py-1 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/40 font-mono">
            College OS Viva
          </span>
        </div>

        <div className="space-y-4">
          {vivaQuestions.map((item, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm"
            >
              <h3 className="font-bold text-sm text-cyan-300 mb-2 flex items-start gap-2">
                <span className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/40 text-xs font-mono">
                  Q{idx + 1}
                </span>
                <span>{item.q}</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 pl-8 leading-relaxed whitespace-pre-line">
                {item.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Footer */}
      <div className="text-center p-8 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800">
        <h3 className="text-xl font-bold text-white mb-2">Ready to test these algorithms?</h3>
        <p className="text-xs sm:text-sm text-slate-400 mb-5">
          Explore the Deadlock Simulator or trace Banker&apos;s Algorithm step-by-step.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/simulator"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/20 transition-all hover:scale-105"
          >
            <span>Open Deadlock Simulator</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/banker"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-sm transition-all"
          >
            <span>Banker&apos;s Algorithm Stepper</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
