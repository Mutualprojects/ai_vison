"use client";

import { motion, Variants } from "framer-motion";
import { ArrowRight, ScanLine, Database, Zap, ShieldCheck, ChevronRight, BarChart3, Users } from "lucide-react";
import Link from "next/link";

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" }
  }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-fuchsia-500/30 overflow-hidden">

      {/* BACKGROUND ELEMENTS */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-fuchsia-600/20 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
      </div>

      {/* NAVBAR */}
      <nav className="relative z-10 border-b border-white/5 bg-slate-950/50 backdrop-blur-md sticky top-0">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <ScanLine className="w-6 h-6 text-fuchsia-500" />
            <span>LeadScanner <span className="text-fuchsia-400">Pro</span></span>
          </div>
          <Link
            href="/admin"
            className="px-6 py-2.5 rounded-full bg-white text-slate-950 font-bold text-sm hover:bg-fuchsia-50 transition-colors shadow-lg shadow-white/5"
          >
            Admin Login
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <main className="relative z-10 pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="px-4 py-1.5 rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-300 font-medium text-sm mb-8 flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              The Future of Event Networking
            </motion.div>

            <motion.h1
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              className="text-6xl md:text-8xl font-black tracking-tighter mb-8 bg-clip-text text-transparent bg-gradient-to-br from-white via-slate-200 to-slate-500 leading-tight"
            >
              NO More <br /> Manual Entry.
            </motion.h1>

            <motion.p
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              className="text-xl md:text-2xl text-slate-400 mb-12 max-w-2xl leading-relaxed"
            >
              Transform physical business cards into highly organized CRM data instantly.
              Powered by Edge AI and Deep Cloud OCR.
            </motion.p>

            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              className="flex flex-col sm:flex-row gap-4 w-full justify-center"
            >
              <Link
                href="/admin"
                className="px-8 py-4 rounded-full bg-fuchsia-600 text-white font-bold text-lg hover:bg-fuchsia-500 transition-all shadow-[0_0_40px_-10px_rgba(217,70,239,0.5)] hover:shadow-[0_0_60px_-10px_rgba(217,70,239,0.7)] hover:-translate-y-1 flex items-center justify-center gap-2"
              >
                Launch Scanner <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </div>

          {/* FEATURES GRID */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-40"
          >
            {/* Feature 1 */}
            <motion.div variants={fadeIn} className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-fuchsia-500/30 transition-colors group">
              <div className="w-14 h-14 rounded-2xl bg-fuchsia-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ScanLine className="w-7 h-7 text-fuchsia-400" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Lightning Fast AI</h3>
              <p className="text-slate-400 leading-relaxed">
                Uses local TensorFlow models to detect cards and Pro OCR to extract emails, phones, and names with 99% accuracy.
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div variants={fadeIn} className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-blue-500/30 transition-colors group">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Database className="w-7 h-7 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Zero-Friction CRM</h3>
              <p className="text-slate-400 leading-relaxed">
                Connects directly to your Google Sheets. No clunky software to install. Leads populate your master sheet instantly.
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div variants={fadeIn} className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-emerald-500/30 transition-colors group">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-7 h-7 text-emerald-400" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Smart Deduplication</h3>
              <p className="text-slate-400 leading-relaxed">
                Automatically checks your live database before saving to prevent salespeople from scanning duplicate cards.
              </p>
            </motion.div>
          </motion.div>

          {/* DASHBOARD PREVIEW SECTION */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
            className="mt-40 mb-20 relative rounded-[3rem] overflow-hidden border border-white/10 bg-slate-900/50 p-8 md:p-16 text-center"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-fuchsia-500/5 to-transparent pointer-events-none" />
            <BarChart3 className="w-16 h-16 text-fuchsia-400 mx-auto mb-8" />
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Beautiful Analytics Built-In</h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10">
              Every admin gets an automatic, secure dashboard. Track your capture velocity, view lead profiles, and export CSVs in real-time.
            </p>
            <div className="flex justify-center">
              <div className="flex items-center gap-4 bg-slate-950 p-4 rounded-full border border-slate-800 shadow-2xl">
                <div className="flex -space-x-4">
                  <div className="w-12 h-12 rounded-full border-2 border-slate-950 bg-fuchsia-500 flex items-center justify-center"><Users className="w-5 h-5" /></div>
                  <div className="w-12 h-12 rounded-full border-2 border-slate-950 bg-blue-500 flex items-center justify-center"><Users className="w-5 h-5" /></div>
                  <div className="w-12 h-12 rounded-full border-2 border-slate-950 bg-emerald-500 flex items-center justify-center"><Users className="w-5 h-5" /></div>
                </div>
                <div className="pl-4 pr-6 text-left">
                  <div className="text-sm text-slate-400 font-medium">Total Leads Captured</div>
                  <div className="text-2xl font-bold text-white">4,289+</div>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/5 py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-slate-500 text-sm font-medium">
          <div className="flex items-center gap-2">
            <ScanLine className="w-5 h-5 text-slate-400" />
            LeadScanner Pro
          </div>
          <div>© {new Date().getFullYear()} All rights reserved. Built with Edge AI.</div>
        </div>
      </footer>
    </div>
  );
}
