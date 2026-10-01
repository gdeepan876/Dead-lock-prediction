import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Deadlock Detection & Prevention — Using Banker's Algorithm",
  description:
    "Detect deadlocks and prevent unsafe resource allocation using Banker's Algorithm. Professional Operating Systems college project.",
  keywords: [
    "Deadlock Detection",
    "Deadlock Prevention",
    "Banker's Algorithm",
    "Operating Systems Project",
    "Safe State",
    "Unsafe State",
    "Allocation Matrix",
    "Request Matrix",
    "Need Matrix"
  ]
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#090d16] text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200">
        <Navbar />
        <main className="flex-1 flex flex-col">{children}</main>
        <footer className="border-t border-slate-800/80 bg-slate-950/60 py-6 text-center text-xs text-slate-400">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>
              Operating Systems Project &bull; Deadlock Detection &amp; Prevention using Banker&apos;s Algorithm
            </p>
            <p className="text-slate-500">
              Designed for College Viva, Academic Demonstration &amp; OS Concepts Exploration
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
