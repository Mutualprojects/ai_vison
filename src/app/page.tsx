"use client";

import { useState, useEffect, useRef } from "react";
import {
  ScanLine, Database, Zap, ShieldCheck, BarChart3, Users, ArrowRight,
  CheckCircle2, Star, Quote, ChevronDown, Globe, Cpu, CloudUpload,
  FileDown, MailCheck, Lock, TrendingUp, Layers, Play, X, Menu,
  PhoneCall, Fingerprint, Repeat2, Timer, Award, Building2, Target
} from "lucide-react";

const useInView = (threshold = 0.15): [React.RefObject<HTMLDivElement | null>, boolean] => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);
  return [ref, inView];
};

const AnimatedSection = ({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) => {
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(36px)",
        transition: `opacity 0.75s ease ${delay}ms, transform 0.75s ease ${delay}ms`
      }}
    >
      {children}
    </div>
  );
};

const Counter = ({ end, suffix = "", duration = 2000 }: { end: number, suffix?: string, duration?: number }) => {
  const [count, setCount] = useState(0);
  const [ref, inView] = useInView(0.5);
  const started = useRef(false);
  useEffect(() => {
    if (!inView || started.current) return;
    started.current = true;
    const steps = 60;
    const increment = end / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(current));
    }, duration / steps);
    return () => clearInterval(timer);
  }, [inView, end, duration]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
};

const STEPS = [
  {
    num: "01",
    icon: <PhoneCall className="w-6 h-6" />,
    title: "Point & Capture",
    desc: "Your team opens LeadScanner Pro on any smartphone. Point the camera at any business card — portrait or landscape — and tap capture. Our edge AI handles the rest."
  },
  {
    num: "02",
    icon: <Cpu className="w-6 h-6" />,
    title: "AI Extracts Every Detail",
    desc: "Our dual-engine pipeline uses on-device TensorFlow for card detection, then routes to our cloud OCR stack to extract name, title, company, email, phone, website, and LinkedIn."
  },
  {
    num: "03",
    icon: <Fingerprint className="w-6 h-6" />,
    title: "Deduplicate & Validate",
    desc: "Before saving, we fingerprint the lead against your live CRM. Duplicate email or phone? Flagged instantly. Invalid format? Auto-corrected or flagged for review."
  },
  {
    num: "04",
    icon: <CloudUpload className="w-6 h-6" />,
    title: "Syncs to Your CRM",
    desc: "Verified data pushes straight to your Google Sheet or connected CRM in under 2 seconds. Your sales team sees the fresh lead before you've even put your phone away."
  }
];

const FEATURES = [
  {
    icon: <ScanLine className="w-6 h-6" />,
    color: "fuchsia",
    title: "Edge AI Card Detection",
    desc: "A lightweight TensorFlow Lite model runs entirely on-device to isolate cards from backgrounds in real time — no server round-trip needed for detection."
  },
  {
    icon: <Layers className="w-6 h-6" />,
    color: "violet",
    title: "Multi-Language OCR",
    desc: "Extract text accurately from cards printed in English, Spanish, French, German, Japanese, Chinese, Arabic, and 40+ other languages out of the box."
  },
  {
    icon: <Database className="w-6 h-6" />,
    color: "blue",
    title: "Zero-Friction CRM Sync",
    desc: "Leads populate your master Google Sheet or Salesforce/HubSpot instance in real time. No CSV imports, no manual copy-paste — ever."
  },
  {
    icon: <ShieldCheck className="w-6 h-6" />,
    color: "emerald",
    title: "Smart Deduplication",
    desc: "Fuzzy-match algorithms catch duplicates even when a contact changes company or phone. Protect your CRM hygiene across every event."
  },
  {
    icon: <Repeat2 className="w-6 h-6" />,
    color: "amber",
    title: "Offline-First Architecture",
    desc: "Network dropped at the conference? Cards queue locally and sync the moment connectivity returns. No lead is ever lost."
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    color: "rose",
    title: "Real-Time Admin Dashboard",
    desc: "Live heatmaps, per-rep capture velocity, top sources, and one-click CSV exports. Understand your pipeline while the event is still happening."
  },
  {
    icon: <Lock className="w-6 h-6" />,
    color: "indigo",
    title: "SOC 2 & GDPR Ready",
    desc: "AES-256 encryption in transit and at rest. Role-based access controls, audit logs, data-residency options, and a one-click data-deletion API."
  },
  {
    icon: <Globe className="w-6 h-6" />,
    color: "cyan",
    title: "Works on Any Device",
    desc: "Progressive web app — no App Store install required. Open a URL on iPhone, Android, or tablet and get the full scanning experience instantly."
  },
  {
    icon: <MailCheck className="w-6 h-6" />,
    color: "teal",
    title: "Instant Follow-Up Emails",
    desc: "Trigger a personalized thank-you email the moment a card is scanned. Connect to SendGrid or Mailchimp to warm leads while the conversation is still fresh."
  }
];

const TESTIMONIALS = [
  {
    quote: "We captured 1,200 leads across three booths at CES without a single manual entry. LeadScanner Pro paid for itself before lunch on day one.",
    name: "Priya Nambiar",
    role: "VP of Sales, Nexlayer Inc.",
    rating: 5,
    avatar: "PN"
  },
  {
    quote: "The deduplication feature alone saved us countless hours of CRM cleanup after our annual summit. Accuracy is genuinely impressive.",
    name: "Marcus Holt",
    role: "Head of Growth, Stratos Labs",
    rating: 5,
    avatar: "MH"
  },
  {
    quote: "Our reps love it. Scanning a card takes four seconds and they can move on immediately. Follow-up emails go out automatically. It's like magic.",
    name: "Sofia Delacroix",
    role: "Director of Marketing, Orbix Group",
    rating: 5,
    avatar: "SD"
  }
];

const PLANS = [
  {
    name: "Starter",
    price: 49,
    period: "/month",
    desc: "Perfect for small teams and individual exhibitors.",
    features: [
      "Up to 3 scanner seats",
      "500 leads / month",
      "Google Sheets sync",
      "Basic analytics dashboard",
      "Email support"
    ],
    cta: "Start Free Trial",
    highlight: false
  },
  {
    name: "Growth",
    price: 149,
    period: "/month",
    desc: "The sweet spot for growing sales teams and frequent events.",
    features: [
      "Up to 15 scanner seats",
      "5,000 leads / month",
      "Google Sheets + Salesforce + HubSpot",
      "Multi-language OCR (50+ languages)",
      "Smart deduplication engine",
      "Advanced analytics & exports",
      "Priority email & chat support"
    ],
    cta: "Start Free Trial",
    highlight: true
  },
  {
    name: "Enterprise",
    price: null,
    period: "",
    desc: "Custom scale, compliance, and white-labelling for large organisations.",
    features: [
      "Unlimited scanner seats",
      "Unlimited leads",
      "Custom CRM integrations",
      "Offline-first with auto-sync",
      "SOC 2 & GDPR compliance pack",
      "Dedicated success manager",
      "99.9% uptime SLA"
    ],
    cta: "Contact Sales",
    highlight: false
  }
];

const COLOR_MAP: Record<string, { bg: string, text: string, border: string }> = {
  fuchsia: { bg: "bg-fuchsia-50", text: "text-fuchsia-600", border: "hover:border-fuchsia-300" },
  violet: { bg: "bg-violet-50", text: "text-violet-600", border: "hover:border-violet-300" },
  blue: { bg: "bg-blue-50", text: "text-blue-600", border: "hover:border-blue-300" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-600", border: "hover:border-emerald-300" },
  amber: { bg: "bg-amber-50", text: "text-amber-600", border: "hover:border-amber-300" },
  rose: { bg: "bg-rose-50", text: "text-rose-600", border: "hover:border-rose-300" },
  indigo: { bg: "bg-indigo-50", text: "text-indigo-600", border: "hover:border-indigo-300" },
  cyan: { bg: "bg-cyan-50", text: "text-cyan-600", border: "hover:border-cyan-300" },
  teal: { bg: "bg-teal-50", text: "text-teal-600", border: "hover:border-teal-300" }
};

const DASH_STATS: [string, string, number][] = [
  ["Alex T.", "312 leads", 82], 
  ["Sarah K.", "287 leads", 75], 
  ["Raj M.", "241 leads", 63]
];

const FOOTER_LINKS: [string, string[]][] = [
  ["Product", ["Features", "How It Works", "Analytics", "Integrations", "Security"]],
  ["Company", ["About Us", "Blog", "Careers", "Press Kit"]],
  ["Support", ["Documentation", "Status Page", "Contact Sales", "Privacy Policy", "Terms of Service"]]
];

export default function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileOpen(false);
  };

  const startAuth = () => {
    window.location.href = "/api/auth/google";
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 overflow-x-hidden" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>

      {/* ── GLOBAL STYLE ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Syne:wght@700;800&display=swap');
        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #f8fafc; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        .hero-title { font-family: 'Syne', sans-serif; }
        .glow-fuchsia { box-shadow: 0 0 50px -10px rgba(217,70,239,0.35); }
        .glow-fuchsia:hover { box-shadow: 0 0 70px -10px rgba(217,70,239,0.55); }
        .grid-bg {
          background-image: linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px);
          background-size: 60px 60px;
        }
        .plan-highlight { background: linear-gradient(145deg, #ffffff 0%, #f3e8ff 100%); }
        @keyframes floatY { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
        .float-anim { animation: floatY 6s ease-in-out infinite; }
        @keyframes pulse-ring { 0% { transform: scale(0.9); opacity: 0.6; } 100% { transform: scale(1.6); opacity: 0; } }
        .pulse-ring::after { content: ''; position: absolute; inset: 0; border-radius: 50%; border: 2px solid rgba(217,70,239,0.4); animation: pulse-ring 2.5s ease-out infinite; }
        @keyframes ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .ticker-wrap { overflow: hidden; white-space: nowrap; }
        .ticker-inner { display: inline-flex; animation: ticker 28s linear infinite; }
        .ticker-inner:hover { animation-play-state: paused; }
      `}</style>

      {/* ── AMBIENT BACKGROUND ── */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-15%] w-[55%] h-[55%] bg-fuchsia-300/20 blur-[140px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-15%] w-[55%] h-[55%] bg-indigo-300/20 blur-[140px] rounded-full" />
        <div className="absolute top-[40%] left-[40%] w-[30%] h-[30%] bg-violet-300/20 blur-[100px] rounded-full" />
        <div className="absolute inset-0 grid-bg opacity-100" />
      </div>

      {/* ══════════════ NAVBAR ══════════════ */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          borderBottom: scrolled ? "1px solid rgba(0,0,0,0.06)" : "1px solid transparent",
          background: scrolled ? "rgba(255,255,255,0.85)" : "transparent",
          backdropFilter: scrolled ? "blur(16px)" : "none"
        }}
      >
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5 font-black text-xl tracking-tight z-10 text-slate-900">
            <div className="relative w-9 h-9 rounded-xl bg-fuchsia-600 flex items-center justify-center">
              <ScanLine className="w-5 h-5 text-white" />
            </div>
            <span>LeadScanner <span className="text-fuchsia-600">Pro</span></span>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            {[["features", "Features"], ["how-it-works", "How It Works"], ["testimonials", "Testimonials"], ["pricing", "Pricing"]].map(([id, label]) => (
              <button key={id} onClick={() => scrollTo(id)} className="hover:text-fuchsia-600 transition-colors">{label}</button>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={startAuth}
              className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors px-4 py-2"
            >
              Sign In
            </button>
            <button
              onClick={startAuth}
              className="px-5 py-2.5 rounded-full bg-fuchsia-600 text-white font-bold text-sm hover:bg-fuchsia-500 transition-all glow-fuchsia shadow-md shadow-fuchsia-200"
            >
              Get Started Free
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-slate-600 hover:text-slate-900"
            onClick={() => setMobileOpen(v => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 px-6 py-6 flex flex-col gap-5 shadow-xl shadow-slate-200/50">
            {[["features", "Features"], ["how-it-works", "How It Works"], ["testimonials", "Testimonials"], ["pricing", "Pricing"]].map(([id, label]) => (
              <button key={id} onClick={() => scrollTo(id)} className="text-left text-slate-600 font-semibold hover:text-fuchsia-600 text-base">
                {label}
              </button>
            ))}
            <button
              onClick={startAuth}
              className="mt-2 px-6 py-3 rounded-full bg-fuchsia-600 text-white font-bold text-sm w-full shadow-md shadow-fuchsia-200"
            >
              Get Started Free
            </button>
          </div>
        )}
      </nav>

      {/* ══════════════ HERO ══════════════ */}
      <section className="relative z-10 pt-40 pb-28 px-6">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">

          {/* Badge */}
          <div
            style={{ opacity: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-fuchsia-200 bg-fuchsia-50 text-fuchsia-600 font-semibold text-xs uppercase tracking-widest mb-8 shadow-sm"
          >
            <Zap className="w-3.5 h-3.5" />
            Trusted at 2,400+ events worldwide
          </div>

          {/* Headline */}
          <h1 className="hero-title text-6xl sm:text-7xl md:text-[88px] font-black tracking-tighter leading-[1.0] mb-8 max-w-5xl">
            <span className="bg-clip-text text-transparent bg-gradient-to-br from-slate-900 via-slate-700 to-slate-500">
              Scan Business Cards.
            </span>
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-500 via-violet-500 to-indigo-500">
              Fill Your CRM Instantly.
            </span>
          </h1>

          {/* Sub */}
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl leading-relaxed mb-4">
            LeadScanner Pro turns physical business cards into structured CRM data in under 3 seconds — using on-device AI and cloud OCR with 99.2% field-level accuracy.
          </p>
          <p className="text-sm text-slate-500 mb-12 max-w-xl">
            No app install required. Works on any smartphone. Syncs live to Google Sheets, Salesforce, and HubSpot.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center mb-6">
            <button
              onClick={startAuth}
              className="group px-8 py-4 rounded-full bg-fuchsia-600 text-white font-bold text-base hover:bg-fuchsia-500 transition-all glow-fuchsia hover:-translate-y-0.5 flex items-center justify-center gap-2 shadow-lg shadow-fuchsia-200"
            >
              Start Free — No Card Required
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => scrollTo("how-it-works")}
              className="px-8 py-4 rounded-full border border-slate-200 bg-white text-slate-700 font-semibold text-base hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <Play className="w-4 h-4 text-fuchsia-500" />
              Watch It Work
            </button>
          </div>
          <p className="text-xs text-slate-500 font-medium">14-day free trial · No credit card needed · Cancel anytime</p>

          {/* Social proof avatars */}
          <div className="mt-12 flex items-center gap-4">
            <div className="flex -space-x-3">
              {["bg-fuchsia-600", "bg-violet-600", "bg-blue-600", "bg-emerald-600", "bg-amber-600"].map((c, i) => (
                <div key={i} className={`w-10 h-10 rounded-full border-2 border-white ${c} flex items-center justify-center text-xs font-bold text-white shadow-sm`}>
                  {["PK", "MH", "SD", "AR", "JT"][i]}
                </div>
              ))}
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1 mb-0.5">
                {[1, 2, 3, 4, 5].map(s => <Star key={s} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}
              </div>
              <p className="text-sm text-slate-500"><span className="text-slate-800 font-semibold">4.9/5</span> from 1,200+ sales teams</p>
            </div>
          </div>
        </div>

        {/* Hero mock card scanner UI */}
        <div className="max-w-5xl mx-auto mt-24 relative">
          <div className="float-anim relative mx-auto w-full max-w-lg rounded-3xl border border-slate-200 bg-white/80 backdrop-blur-md overflow-hidden shadow-2xl shadow-slate-200/50">
            {/* mock topbar */}
            <div className="flex items-center gap-2 px-5 pt-5 pb-3 border-b border-slate-100 bg-slate-50/50">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-emerald-400" />
              <span className="ml-3 text-xs text-slate-500 font-mono font-medium">LeadScanner Pro — Scanner</span>
            </div>
            {/* mock scanner body */}
            <div className="p-6">
              <div className="relative aspect-[1.6] rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center mb-5">
                {/* scan lines */}
                <div className="absolute inset-x-4 inset-y-4 border-2 border-fuchsia-400/40 rounded-xl" />
                <div className="absolute left-4 top-4 w-6 h-6 border-l-2 border-t-2 border-fuchsia-500 rounded-tl-lg" />
                <div className="absolute right-4 top-4 w-6 h-6 border-r-2 border-t-2 border-fuchsia-500 rounded-tr-lg" />
                <div className="absolute left-4 bottom-4 w-6 h-6 border-l-2 border-b-2 border-fuchsia-500 rounded-bl-lg" />
                <div className="absolute right-4 bottom-4 w-6 h-6 border-r-2 border-b-2 border-fuchsia-500 rounded-br-lg" />
                {/* mock card */}
                <div className="w-56 h-32 rounded-xl bg-white border border-slate-200 shadow-md p-4 flex flex-col justify-between">
                  <div>
                    <div className="w-20 h-2.5 bg-slate-800 rounded mb-1.5" />
                    <div className="w-28 h-1.5 bg-slate-400 rounded" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-fuchsia-200" /><div className="w-32 h-1.5 bg-slate-300 rounded" /></div>
                    <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-fuchsia-200" /><div className="w-24 h-1.5 bg-slate-300 rounded" /></div>
                  </div>
                </div>
                {/* scanning beam */}
                <div className="absolute inset-x-4 h-0.5 bg-gradient-to-r from-transparent via-fuchsia-500 to-transparent"
                  style={{ top: "45%", boxShadow: "0 0 12px rgba(217,70,239,0.4)", animation: "floatY 2s ease-in-out infinite alternate" }}
                />
              </div>
              {/* extracted fields */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  ["Name", "Alex Thornton"],
                  ["Title", "Head of Partnerships"],
                  ["Email", "alex@acmecorp.io"],
                  ["Phone", "+1 (415) 887-3290"]
                ].map(([label, value]) => (
                  <div key={label} className="bg-slate-50 rounded-xl px-3 py-2.5 border border-slate-100">
                    <p className="text-xs text-slate-500 font-medium mb-0.5">{label}</p>
                    <p className="text-sm text-slate-900 font-semibold truncate">{value}</p>
                  </div>
                ))}
              </div>
              {/* confirm bar */}
              <div className="mt-4 flex gap-3">
                <button className="flex-1 py-3 rounded-full bg-fuchsia-600 text-white font-bold text-sm hover:bg-fuchsia-500 transition-all shadow-md shadow-fuchsia-200">
                  ✓ Save Lead to CRM
                </button>
                <button className="px-4 py-3 rounded-full border border-slate-200 text-slate-600 font-medium text-sm hover:bg-slate-50 hover:text-slate-900 transition-all">
                  Rescan
                </button>
              </div>
            </div>
          </div>
          {/* Floating tags */}
          <div className="absolute top-6 -left-4 md:-left-16 hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold backdrop-blur-sm shadow-lg shadow-slate-200/50">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Duplicate detected & blocked
          </div>
          <div className="absolute bottom-10 -right-4 md:-right-12 hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold backdrop-blur-sm shadow-lg shadow-slate-200/50">
            <CloudUpload className="w-4 h-4 text-blue-500" /> Synced to Google Sheets
          </div>
        </div>
      </section>

      {/* ── LOGO TICKER ── */}
      <div className="relative z-10 py-12 border-y border-slate-200 bg-white/40">
        <p className="text-center text-xs text-slate-500 uppercase tracking-widest font-semibold mb-8">Trusted by teams at</p>
        <div className="ticker-wrap">
          <div className="ticker-inner gap-0">
            {[...Array(2)].map((_, outer) => (
              <div key={outer} className="flex items-center gap-16 px-8">
                {["TechCorp", "Nexlayer", "Stratos Labs", "Orbix Group", "Quantum IO", "Meridian AI", "Pulse Data", "Vertex Systems", "Nova Ventures", "ClearPath"].map(name => (
                  <span key={name} className="text-slate-400 font-bold text-sm tracking-wide whitespace-nowrap hover:text-slate-600 transition-colors">
                    {name}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════ STATS ══════════════ */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: 4289, suffix: "+", label: "Leads captured today", icon: <Target className="w-5 h-5" />, color: "text-fuchsia-500" },
            { value: 99, suffix: ".2%", label: "Field-level OCR accuracy", icon: <Award className="w-5 h-5" />, color: "text-emerald-500" },
            { value: 2400, suffix: "+", label: "Events powered globally", icon: <Building2 className="w-5 h-5" />, color: "text-blue-500" },
            { value: 3, suffix: "s", label: "Average scan-to-CRM time", icon: <Timer className="w-5 h-5" />, color: "text-amber-500" }
          ].map(({ value, suffix, label, icon, color }, i) => (
            <AnimatedSection key={i} delay={i * 100}>
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all text-center group">
                <div className={`${color} flex justify-center mb-3 opacity-80 group-hover:opacity-100 transition-opacity`}>{icon}</div>
                <div className={`text-4xl font-black mb-2 ${color}`}>
                  <Counter end={value} suffix={suffix} />
                </div>
                <p className="text-sm text-slate-500 font-medium">{label}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* ══════════════ FEATURES ══════════════ */}
      <section id="features" className="relative z-10 py-24 px-6 bg-slate-50/50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-200 bg-violet-50 text-violet-600 font-semibold text-xs uppercase tracking-widest mb-6 shadow-sm">
                <Layers className="w-3.5 h-3.5" />
                Platform Features
              </div>
              <h2 className="hero-title text-4xl md:text-5xl font-black tracking-tighter mb-5">
                Everything your sales team needs.<br />
                <span className="text-slate-400">Nothing they don't.</span>
              </h2>
              <p className="text-slate-500 text-lg max-w-2xl mx-auto">
                Built for speed, accuracy, and the chaos of real trade-show floors. Every feature has been stress-tested at events with 50,000+ attendees.
              </p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(({ icon, color, title, desc }, i) => {
              const c = COLOR_MAP[color];
              return (
                <AnimatedSection key={i} delay={(i % 3) * 80}>
                  <div className={`h-full p-7 rounded-2xl bg-white border border-slate-200 ${c.border} transition-all duration-300 group cursor-default shadow-sm hover:shadow-md`}>
                    <div className={`w-12 h-12 rounded-xl ${c.bg} flex items-center justify-center mb-5 ${c.text} group-hover:scale-110 transition-transform`}>
                      {icon}
                    </div>
                    <h3 className="text-lg font-bold mb-2 text-slate-900">{title}</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">{desc}</p>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════ HOW IT WORKS ══════════════ */}
      <section id="how-it-works" className="relative z-10 py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-200 bg-blue-50 text-blue-600 font-semibold text-xs uppercase tracking-widest mb-6 shadow-sm">
                <TrendingUp className="w-3.5 h-3.5" />
                How It Works
              </div>
              <h2 className="hero-title text-4xl md:text-5xl font-black tracking-tighter mb-5">
                From card in hand<br />
                <span className="text-slate-400">to CRM in 3 seconds.</span>
              </h2>
              <p className="text-slate-500 text-lg max-w-xl mx-auto">
                A four-step pipeline that runs invisibly in the background. Your reps just scan and move on.
              </p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 relative">
            {/* connector line */}
            <div className="hidden lg:block absolute top-12 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-fuchsia-300 to-transparent pointer-events-none" />
            {STEPS.map(({ num, icon, title, desc }, i) => (
              <AnimatedSection key={i} delay={i * 120}>
                <div className="relative p-7 rounded-2xl bg-white border border-slate-200 hover:border-fuchsia-300 transition-all h-full group shadow-sm hover:shadow-md">
                  <div className="absolute -top-3 left-6 px-3 py-1 rounded-full bg-fuchsia-600 text-white text-xs font-black shadow-md shadow-fuchsia-200">{num}</div>
                  <div className="w-12 h-12 rounded-xl bg-fuchsia-50 flex items-center justify-center mb-5 text-fuchsia-600 mt-3 group-hover:scale-110 transition-transform">
                    {icon}
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-slate-900">{title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ ANALYTICS HIGHLIGHT ══════════════ */}
      <section className="relative z-10 py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection>
            <div className="relative rounded-3xl overflow-hidden border border-slate-200 bg-white p-10 md:p-16 shadow-xl shadow-slate-200/50">
              <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-50/50 via-transparent to-indigo-50/50 pointer-events-none" />
              <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-600 font-semibold text-xs uppercase tracking-widest mb-6 shadow-sm">
                    <BarChart3 className="w-3.5 h-3.5" />
                    Analytics Dashboard
                  </div>
                  <h2 className="hero-title text-3xl md:text-4xl font-black tracking-tighter mb-5 text-slate-900">
                    Know your pipeline<br />while the event is<br />still happening.
                  </h2>
                  <p className="text-slate-600 leading-relaxed mb-8">
                    Your admin dashboard updates in real time. See capture velocity by rep, lead quality scores, top traffic sources, and geographic heatmaps — then export a clean CSV in one click.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      ["Live sync", "Updates every 5 seconds"],
                      ["CSV export", "One-click, anytime"],
                      ["Per-rep stats", "Individual dashboards"],
                      ["Custom fields", "Configurable per event"]
                    ].map(([title, sub]) => (
                      <div key={title} className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-slate-900 font-semibold text-sm">{title}</p>
                          <p className="text-slate-500 text-xs">{sub}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Mock dashboard */}
                <div className="rounded-2xl bg-slate-50 border border-slate-200 p-6 shadow-inner">
                  <div className="flex items-center justify-between mb-5">
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Leads Captured</p>
                    <span className="text-xs text-emerald-700 font-bold bg-emerald-100 px-2 py-1 rounded-full">↑ 23% vs last event</span>
                  </div>
                  <div className="text-4xl font-black text-slate-900 mb-6">1,284</div>
                  {/* Mini bar chart */}
                  <div className="flex items-end gap-1.5 h-24 mb-5">
                    {[40, 65, 55, 80, 70, 90, 75, 100, 85, 95, 78, 88].map((h, i) => (
                      <div key={i} className="flex-1 rounded-t-md" style={{ height: `${h}%`, background: i === 9 ? "rgba(217,70,239,0.8)" : "rgba(203,213,225,0.6)" }} />
                    ))}
                  </div>
                  <div className="space-y-3">
                    {DASH_STATS.map(([name, leads, pct]) => (
                      <div key={name} className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-fuchsia-100 flex items-center justify-center text-xs font-bold text-fuchsia-600">
                          {name[0]}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-700 font-medium">{name}</span>
                            <span className="text-slate-500">{leads}</span>
                          </div>
                          <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-fuchsia-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ══════════════ TESTIMONIALS ══════════════ */}
      <section id="testimonials" className="relative z-10 py-24 px-6 bg-slate-100/50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-200 bg-amber-50 text-amber-600 font-semibold text-xs uppercase tracking-widest mb-6 shadow-sm">
                <Star className="w-3.5 h-3.5" />
                Customer Stories
              </div>
              <h2 className="hero-title text-4xl md:text-5xl font-black tracking-tighter mb-5">
                Loved by 1,200+<br />
                <span className="text-slate-400">sales teams worldwide.</span>
              </h2>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(({ quote, name, role, rating, avatar }, i) => (
              <AnimatedSection key={i} delay={i * 100}>
                <div className="h-full flex flex-col p-8 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all group shadow-sm">
                  <Quote className="w-8 h-8 text-fuchsia-500/20 mb-4 group-hover:text-fuchsia-500/40 transition-colors" />
                  <p className="text-slate-700 leading-relaxed mb-8 flex-1 text-sm">{quote}</p>
                  <div className="flex items-center gap-3 pt-5 border-t border-slate-100">
                    <div className="w-11 h-11 rounded-full bg-fuchsia-50 flex items-center justify-center text-sm font-black text-fuchsia-600">
                      {avatar}
                    </div>
                    <div>
                      <p className="text-slate-900 font-bold text-sm">{name}</p>
                      <p className="text-slate-500 text-xs">{role}</p>
                    </div>
                    <div className="ml-auto flex gap-0.5">
                      {[...Array(rating)].map((_, s) => <Star key={s} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ INTEGRATIONS ══════════════ */}
      <section className="relative z-10 py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection>
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm px-10 py-12 text-center">
              <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-6">Integrates with your existing stack</p>
              <div className="flex flex-wrap justify-center gap-3">
                {["Google Sheets", "Salesforce", "HubSpot", "Mailchimp", "SendGrid", "Zapier", "Slack", "Notion", "Pipedrive", "Airtable"].map(name => (
                  <span key={name} className="px-4 py-2 rounded-full border border-slate-200 bg-slate-50 text-slate-600 text-sm font-semibold hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900 transition-all cursor-default shadow-sm">
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ══════════════ PRICING ══════════════ */}
      <section id="pricing" className="relative z-10 py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-fuchsia-200 bg-fuchsia-50 text-fuchsia-600 font-semibold text-xs uppercase tracking-widest mb-6 shadow-sm">
                <FileDown className="w-3.5 h-3.5" />
                Simple Pricing
              </div>
              <h2 className="hero-title text-4xl md:text-5xl font-black tracking-tighter mb-5">
                Pick your plan.<br />
                <span className="text-slate-400">Upgrade anytime.</span>
              </h2>
              <p className="text-slate-500 text-lg">All plans include a 14-day free trial. No credit card required.</p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {PLANS.map(({ name, price, period, desc, features, cta, highlight }, i) => (
              <AnimatedSection key={i} delay={i * 80}>
                <div className={`relative h-full flex flex-col rounded-2xl border p-8 transition-all shadow-sm ${highlight
                  ? "plan-highlight border-fuchsia-300 shadow-xl shadow-fuchsia-200/50"
                  : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-md"
                  }`}>
                  {highlight && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-5 py-1 rounded-full bg-fuchsia-600 text-white text-xs font-black uppercase tracking-wider whitespace-nowrap shadow-md shadow-fuchsia-200">
                      Most Popular
                    </div>
                  )}
                  <div className="mb-6">
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-3">{name}</p>
                    <div className="flex items-end gap-1 mb-3">
                      {price ? (
                        <>
                          <span className="text-5xl font-black text-slate-900">${price}</span>
                          <span className="text-slate-500 mb-2">{period}</span>
                        </>
                      ) : (
                        <span className="text-4xl font-black text-slate-900">Custom</span>
                      )}
                    </div>
                    <p className="text-slate-500 text-sm">{desc}</p>
                  </div>

                  <div className="flex-1 space-y-3 mb-8">
                    {features.map(f => (
                      <div key={f} className="flex items-start gap-2.5">
                        <CheckCircle2 className={`w-4.5 h-4.5 flex-shrink-0 mt-0.5 ${highlight ? "text-fuchsia-600" : "text-emerald-500"}`} style={{ width: "18px", height: "18px" }} />
                        <span className="text-slate-700 text-sm">{f}</span>
                      </div>
                    ))}
                  </div>

                  <button onClick={startAuth} className={`w-full py-3.5 rounded-full font-bold text-sm transition-all ${highlight
                    ? "bg-fuchsia-600 text-white hover:bg-fuchsia-500 glow-fuchsia shadow-lg shadow-fuchsia-200"
                    : "border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                    }`}>
                    {cta}
                  </button>
                </div>
              </AnimatedSection>
            ))}
          </div>

          {/* FAQ teaser */}
          <AnimatedSection delay={200}>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                ["Can I change plans later?", "Yes — upgrade or downgrade at any time. Changes take effect at the next billing cycle."],
                ["Is there a per-event pricing option?", "Absolutely. Contact our sales team for event-based or burst pricing that suits conference season."],
                ["What happens after my trial?", "You'll be prompted to choose a plan. Your data stays safe; no leads are deleted regardless of what you choose."]
              ].map(([q, a]) => (
                <div key={q} className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md shadow-sm transition-all">
                  <p className="text-slate-900 font-bold text-sm mb-2">{q}</p>
                  <p className="text-slate-500 text-sm leading-relaxed">{a}</p>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ══════════════ FINAL CTA ══════════════ */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <AnimatedSection>
            <div className="relative rounded-3xl overflow-hidden border border-slate-200 bg-white shadow-2xl shadow-slate-200/60 p-12 md:p-20">
              <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-50/50 via-white to-indigo-50/50 pointer-events-none" />
              <div className="relative z-10">
                <div className="relative w-20 h-20 rounded-3xl bg-fuchsia-600 flex items-center justify-center mx-auto mb-8 pulse-ring shadow-lg shadow-fuchsia-200">
                  <ScanLine className="w-10 h-10 text-white" />
                </div>
                <h2 className="hero-title text-4xl md:text-6xl font-black tracking-tighter mb-6 text-slate-900">
                  Stop losing leads<br />at the booth door.
                </h2>
                <p className="text-slate-600 text-lg max-w-xl mx-auto mb-10">
                  Join 1,200+ sales teams who capture every lead, sync in seconds, and follow up before the show floor closes.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={startAuth}
                    className="group px-10 py-4 rounded-full bg-fuchsia-600 text-white font-bold text-base hover:bg-fuchsia-500 transition-all glow-fuchsia hover:-translate-y-0.5 flex items-center justify-center gap-2 shadow-lg shadow-fuchsia-200"
                  >
                    Start Free Trial
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button className="px-10 py-4 rounded-full border border-slate-200 text-slate-700 bg-slate-50 font-semibold text-base hover:bg-slate-100 transition-all flex items-center justify-center gap-2 shadow-sm">
                    <PhoneCall className="w-4 h-4 text-slate-500" />
                    Talk to Sales
                  </button>
                </div>
                <p className="mt-6 text-xs text-slate-500">No credit card · 14-day free trial · Cancel anytime</p>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ══════════════ FOOTER ══════════════ */}
      <footer className="relative z-10 border-t border-slate-200 py-16 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-14">
            {/* Brand */}
            <div className="col-span-2">
              <div className="flex items-center gap-2.5 font-black text-xl tracking-tight mb-4 text-slate-900">
                <div className="w-9 h-9 rounded-xl bg-fuchsia-600 flex items-center justify-center shadow-sm shadow-fuchsia-200">
                  <ScanLine className="w-5 h-5 text-white" />
                </div>
                <span>LeadScanner <span className="text-fuchsia-600">Pro</span></span>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
                The fastest way to turn event business cards into structured CRM data. Built for modern sales teams.
              </p>
              <div className="flex gap-3 mt-6">
                {["twitter", "linkedin", "github"].map(s => (
                  <div key={s} className="w-9 h-9 rounded-full border border-slate-300 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:border-slate-400 bg-white transition-all cursor-pointer text-xs font-bold uppercase shadow-sm">
                    {s[0]}
                  </div>
                ))}
              </div>
            </div>

            {/* Links */}
            {FOOTER_LINKS.map(([title, links]) => (
              <div key={title}>
                <p className="text-slate-900 font-bold text-sm mb-5">{title}</p>
                <ul className="space-y-3">
                  {links.map(link => (
                    <li key={link}>
                      <a href="#" className="text-slate-500 text-sm hover:text-fuchsia-600 transition-colors">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-slate-500 text-xs font-medium">
            <span>© {new Date().getFullYear()} LeadScanner Pro. All rights reserved. Built with Edge AI.</span>
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-1.5"><Lock className="w-3 h-3 text-slate-400" /> SOC 2 Certified</span>
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-3 h-3 text-slate-400" /> GDPR Ready</span>
              <span className="flex items-center gap-1.5"><Globe className="w-3 h-3 text-slate-400" /> 99.9% Uptime SLA</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}