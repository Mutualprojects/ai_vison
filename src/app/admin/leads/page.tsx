"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  Loader2, Database, Users, Download, ShieldCheck, Zap,
  Mail, Phone, Building2, ScanLine, Clock,
  LayoutDashboard, Table as TableIcon, LayoutGrid, Calendar, Filter,
  TrendingUp, TrendingDown, Activity, ChevronRight, Search,
  Star, Globe, ArrowUpRight, RefreshCw, X, ChevronLeft,
  ChevronDown, Inbox, BarChart2, PieChart as PieIcon, Layers,
  Eye, EyeOff, MoreHorizontal, Tag, UserCheck, Sparkles, Sun, Moon,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, RadarChart,
  Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend,
} from "recharts";

/* ─────────────────────────────── TYPES ──────────────────────────────────── */
interface Lead { [key: string]: string; }
type TabType = "dashboard" | "cards" | "kanban" | "table";
type DateFilter = "all" | "today" | "week" | "month";

/* ─────────────────────────────── CONSTANTS ─────────────────────────────── */
const PALETTE = {
  navy: 'var(--navy)',
  navyMid: 'var(--navyMid)',
  ink: 'var(--ink)',
  steel: 'var(--steel)',
  ocean: 'var(--ocean)',
  sky: 'var(--sky)',
  ice: 'var(--ice)',
  mist: 'var(--mist)',
  foam: 'var(--foam)',
  gold: 'var(--gold)',
  emerald: 'var(--emerald)',
  coral: 'var(--coral)',
  violet: 'var(--violet)',
};

const CHART_COLORS = [PALETTE.sky, PALETTE.ice, PALETTE.gold, PALETTE.violet, PALETTE.coral, PALETTE.emerald];
const KANBAN_COLS = ["New", "Contacted", "Qualified", "Proposal", "Closed"];

/* ─────────────────────────────── GLOBAL CSS ────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Syne:wght@700;800;900&family=JetBrains+Mono:wght@400;600&display=swap');

:root {
  --navy: #f8fafc;
  --navyMid: #ffffff;
  --ink: #ffffff;
  --steel: #cbd5e1;
  --ocean: #0f172a;
  --sky: #0284c7;
  --ice: #0369a1;
  --mist: #bae6fd;
  --foam: #e0f2fe;
  --gold: #d97706;
  --emerald: #059669;
  --coral: #ea580c;
  --violet: #7c3aed;
  
  --textPri: #0f172a;
  --textMut: #64748b;
  --textSub: #94a3b8;
  --border: rgba(0,0,0,0.1);
  --surface: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
}
[data-theme='dark'] {
  --navy: #0a1628;
  --navyMid: #0f2040;
  --ink: #162035;
  --steel: #1e3a5f;
  --ocean: #1b4965;
  --sky: #5fa8d3;
  --ice: #62b6cb;
  --mist: #cae9ff;
  --foam: #bee9e8;
  --gold: #f0a500;
  --emerald: #10b981;
  --coral: #f97316;
  --violet: #8b5cf6;
  
  --textPri: #f1f5f9;
  --textMut: #94a3b8;
  --textSub: #64748b;
  --border: rgba(255,255,255,0.07);
  --surface: linear-gradient(135deg, #0f2040 0%, #162035 100%);
}

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
::-webkit-scrollbar{width:5px;height:5px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:rgba(95,168,211,0.2);border-radius:4px}
::-webkit-scrollbar-thumb:hover{background:rgba(95,168,211,0.4)}
@keyframes fadeUp{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes slideRight{from{opacity:0;transform:translateX(-18px)}to{opacity:1;transform:translateX(0)}}
@keyframes ping{75%,100%{transform:scale(2.2);opacity:0}}
@keyframes spinR{to{transform:rotate(360deg)}}
@keyframes shimmer{0%{background-position:-600px 0}100%{background-position:600px 0}}
@keyframes progressIn{from{width:0}to{width:var(--w)}}
@keyframes glowPulse{0%,100%{box-shadow:0 0 0 0 rgba(95,168,211,0.35)}50%{box-shadow:0 0 0 10px rgba(95,168,211,0)}}
@keyframes float{0%,100%{transform:translateY(0) rotate(0)}50%{transform:translateY(-8px) rotate(1deg)}}
@keyframes borderSpin{to{--angle:360deg}}
@keyframes countUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
.card-hover{transition:transform 0.28s cubic-bezier(.16,1,.3,1),box-shadow 0.28s cubic-bezier(.16,1,.3,1),border-color 0.22s}
.card-hover:hover{transform:translateY(-4px);border-color:rgba(95,168,211,0.4)!important}
.row-hover{transition:background 0.12s}
.row-hover:hover{background:var(--sky)!important;opacity:0.9}
.btn-press{transition:transform 0.1s,opacity 0.14s;cursor:pointer}
.btn-press:hover{opacity:.82}
.btn-press:active{transform:scale(.96)}
.kanban-item{transition:transform 0.22s cubic-bezier(.16,1,.3,1),box-shadow 0.22s,border-color 0.18s}
.kanban-item:hover{transform:translateY(-3px);border-color:rgba(95,168,211,0.45)!important}
`;

/* ─────────────────────────────── HELPERS ───────────────────────────────── */
const getLeadDate = (lead: Lead) => {
  const s = lead.Timestamp || lead["Date Captured"] || lead.Date || lead.time;
  return s ? new Date(s) : new Date(0);
};
const getField = (lead: Lead, ...keys: string[]) => {
  for (const k of keys) if (lead[k]) return lead[k];
  return "";
};
const avatar = (name: string) => name?.charAt(0)?.toUpperCase() || "?";
const hslRing = (i: number) => `hsl(${(i * 67) % 360},60%,55%)`;

/* ─────────────────────────────── ANIMATED COUNTER ─────────────────────── */
function Counter({ value, prefix = "" }: { value: number; prefix?: string }) {
  const [n, setN] = useState(0);
  const raf = useRef<number>(0);
  useEffect(() => {
    cancelAnimationFrame(raf.current);
    if (!value) { setN(0); return; }
    const t0 = performance.now();
    const dur = 1200;
    const tick = (now: number) => {
      const p = Math.min((now - t0) / dur, 1);
      setN(Math.round((1 - Math.pow(1 - p, 4)) * value));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [value]);
  return <span>{prefix}{n.toLocaleString()}</span>;
}

/* ─────────────────────────────── CUSTOM TOOLTIP ────────────────────────── */
function ChartTip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: PALETTE.ink, border: `1px solid rgba(95,168,211,0.25)`,
      borderRadius: 12, padding: "10px 14px", fontSize: 12,
      boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
    }}>
      <p style={{ color: textMut, marginBottom: 6, fontWeight: 600 }}>{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color || PALETTE.sky, fontWeight: 700 }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
}

/* ─────────────────────────────── KPI CARD ──────────────────────────────── */
function KpiCard({ title, value, sub, icon, accent, trend, delay = 0 }: {
  title: string; value: number | string; sub: string;
  icon: React.ReactNode; accent: string; trend?: number; delay?: number;
}) {
  const up = (trend ?? 0) >= 0;
  return (
    <div className="card-hover" style={{
      background: `linear-gradient(135deg, ${PALETTE.navyMid} 0%, ${PALETTE.ink} 100%)`,
      border: `1px solid rgba(255,255,255,0.06)`,
      borderTop: `2px solid ${accent}`,
      borderRadius: 20, padding: "22px 22px 18px",
      animation: `fadeUp 0.6s cubic-bezier(.16,1,.3,1) ${delay}ms both`,
      position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", top: -50, right: -50, width: 130, height: 130,
        borderRadius: "50%", background: `${accent}14`, filter: "blur(22px)", pointerEvents: "none",
      }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: textMut, letterSpacing: "0.12em", textTransform: "uppercase" }}>
          {title}
        </p>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: `${accent}1c`, border: `1px solid ${accent}30`,
          display: "flex", alignItems: "center", justifyContent: "center", color: accent,
        }}>
          {icon}
        </div>
      </div>
      <div style={{
        fontFamily: "'Syne', sans-serif", fontSize: 40, fontWeight: 900, lineHeight: 1,
        color: textPri, letterSpacing: "-2px", marginBottom: 14,
        animation: `countUp 0.5s ease ${delay + 200}ms both`,
      }}>
        {typeof value === "number" ? <Counter value={value} /> : value}
      </div>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 10,
      }}>
        <span style={{ fontSize: 11, color: textMut, fontWeight: 500 }}>{sub}</span>
        {trend !== undefined && (
          <span style={{
            fontSize: 11, fontWeight: 700, color: up ? PALETTE.emerald : PALETTE.coral,
            display: "flex", alignItems: "center", gap: 3
          }}>
            {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────── LOADING ───────────────────────────────── */
function Loading() {
  return (
    <div style={{ minHeight: "100vh", background: PALETTE.navy, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
        <div style={{ position: "relative", width: 64, height: 64 }}>
          <div style={{
            width: 64, height: 64, borderRadius: "50%",
            border: `3px solid rgba(95,168,211,0.15)`,
            borderTop: `3px solid ${PALETTE.sky}`,
            animation: "spinR 1s linear infinite",
          }} />
          <ScanLine size={24} style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", color: PALETTE.sky }} />
        </div>
        <p style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 800, color: textPri }}>
          Loading CRM…
        </p>
        <div style={{ display: "flex", gap: 6 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: 7, height: 7, borderRadius: "50%", background: PALETTE.sky,
              animation: `ping 1.4s ease-in-out ${i * 0.18}s infinite`,
            }} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────── MAIN ──────────────────────────────────── */
export default function AdminLeadsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [companyName, setCompanyName] = useState("Your Company");
  const [slug, setSlug] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [theme, setTheme] = useState("light");
  
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [kanbanLeads, setKanbanLeads] = useState<Record<string, Lead[]>>({});
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [tablePage, setTablePage] = useState(1);
  const TABLE_PAGE_SIZE = 8;

  /* ── Auth + Fetch ── */
  useEffect(() => {
    fetch("/api/auth/google/check")
      .then(r => r.json())
      .then(d => {
        setIsAuthenticated(d.authenticated);
        if (d.authenticated) fetchLeads();
        else setLoading(false);
      })
      .catch(() => { setIsAuthenticated(false); setLoading(false); });
  }, []);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/my-leads");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch leads");
      const ls = data.leads || [];
      setLeads(ls);
      setCompanyName(data.companyName || "Your Company");
      setSlug(data.slug || "");
      // Init kanban
      const kb: Record<string, Lead[]> = {};
      KANBAN_COLS.forEach(c => (kb[c] = []));
      ls.forEach((lead: Lead, i: number) => {
        const col = KANBAN_COLS[i % KANBAN_COLS.length];
        kb[col].push(lead);
      });
      setKanbanLeads(kb);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  /* ── CSV export ── */
  const downloadCSV = () => {
    if (!filteredLeads.length) return;
    const hdrs = Object.keys(filteredLeads[0]);
    const rows = [hdrs.join(","), ...filteredLeads.map(l =>
      hdrs.map(h => `"${(l[h] || "").replace(/"/g, '""')}"`).join(",")
    )];
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([rows.join("\n")], { type: "text/csv" }));
    a.download = `${companyName}-leads.csv`;
    a.click();
  };

  /* ── Filtered ── */
  const filteredLeads = useMemo(() => {
    const now = new Date();
    return leads.filter(lead => {
      const d = getLeadDate(lead);
      const diff = Math.ceil(Math.abs(now.getTime() - d.getTime()) / 86400000);
      if (dateFilter === "today" && diff > 1) return false;
      if (dateFilter === "week" && diff > 7) return false;
      if (dateFilter === "month" && diff > 30) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return Object.values(lead).some(v => v?.toLowerCase().includes(q));
      }
      return true;
    });
  }, [leads, dateFilter, searchQuery]);

  useEffect(() => { setTablePage(1); }, [filteredLeads]);

  /* ── Analytics ── */
  const analytics = useMemo(() => {
    const dateCounts: Record<string, number> = {};
    const companyCounts: Record<string, number> = {};
    const weekCounts: Record<string, number> = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
    const hourCounts: Record<string, number> = {};
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    filteredLeads.forEach(lead => {
      const d = getLeadDate(lead);
      if (d.getTime() > 0) {
        const ds = d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
        dateCounts[ds] = (dateCounts[ds] || 0) + 1;
        weekCounts[days[d.getDay()]] = (weekCounts[days[d.getDay()]] || 0) + 1;
        const hr = `${d.getHours()}:00`;
        hourCounts[hr] = (hourCounts[hr] || 0) + 1;
      }
      const co = lead.Company || lead.company || "Unknown";
      if (co !== "Unknown") companyCounts[co] = (companyCounts[co] || 0) + 1;
    });

    const chartData = Object.entries(dateCounts).map(([date, leads]) => ({ date, leads }));
    const pieData = Object.entries(companyCounts)
      .map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 6);
    const weekData = Object.entries(weekCounts).map(([day, count]) => ({ day, count }));
    const hourData = Object.entries(hourCounts)
      .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
      .map(([hour, count]) => ({ hour, count }));
    const areaData = chartData.map((d, i) => ({
      ...d,
      cumulative: chartData.slice(0, i + 1).reduce((s, x) => s + x.leads, 0),
    }));

    // conversion funnel mock
    const funnel = KANBAN_COLS.map((stage, i) => ({
      stage,
      count: Math.max(1, Math.round(filteredLeads.length / Math.pow(1.4, i))),
    }));

    return { chartData, pieData, weekData, hourData, areaData, funnel };
  }, [filteredLeads]);

  /* ── Prev period delta ── */
  const trendData = useMemo(() => {
    const now = new Date();
    const curr = leads.filter(l => {
      const d = getLeadDate(l);
      return (now.getTime() - d.getTime()) / 86400000 <= 7;
    });
    const prev = leads.filter(l => {
      const d = getLeadDate(l);
      const diff = (now.getTime() - d.getTime()) / 86400000;
      return diff > 7 && diff <= 14;
    });
    const delta = prev.length ? Math.round(((curr.length - prev.length) / prev.length) * 100) : 0;
    return { delta };
  }, [leads]);

  /* ── Drag-to-kanban ── */
  const onDragStart = (e: React.DragEvent, lead: Lead, fromCol: string) => {
    e.dataTransfer.setData("lead", JSON.stringify(lead));
    e.dataTransfer.setData("fromCol", fromCol);
  };
  const onDrop = (e: React.DragEvent, toCol: string) => {
    e.preventDefault();
    const lead = JSON.parse(e.dataTransfer.getData("lead")) as Lead;
    const fromCol = e.dataTransfer.getData("fromCol");
    if (fromCol === toCol) return;
    setKanbanLeads(prev => {
      const next = { ...prev };
      next[fromCol] = next[fromCol].filter(l => l !== lead);
      next[toCol] = [lead, ...next[toCol]];
      return next;
    });
  };
  const onDragOver = (e: React.DragEvent) => e.preventDefault();

  /* ── Table pagination ── */
  const tablePages = Math.ceil(filteredLeads.length / TABLE_PAGE_SIZE);
  const tableSlice = filteredLeads.slice((tablePage - 1) * TABLE_PAGE_SIZE, tablePage * TABLE_PAGE_SIZE);
  const tableFields = leads.length ? Object.keys(leads[0]) : [];

  // ─────────────────── AUTH GUARDS ────────────────────────────────────────
  if (loading) return <><style dangerouslySetInnerHTML={{ __html: CSS }} /><Loading /></>;

  if (isAuthenticated === false) return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div style={{ minHeight: "100vh", background: PALETTE.navy, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{
          background: PALETTE.navyMid, border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 24, padding: "48px 40px", textAlign: "center", maxWidth: 440,
          animation: "fadeUp 0.5s both",
        }}>
          <div style={{
            width: 72, height: 72, borderRadius: "50%", background: "rgba(239,68,68,0.12)",
            display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px",
          }}>
            <ShieldCheck size={32} style={{ color: "#ef4444" }} />
          </div>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 24, fontWeight: 800, color: textPri, marginBottom: 10 }}>
            Authentication Required
          </h1>
          <p style={{ color: textMut, fontSize: 14, lineHeight: 1.7, marginBottom: 28 }}>
            Sign in with Google to access your leads dashboard.
          </p>
          <button className="btn-press" onClick={() => window.location.href = "/api/auth/google"} style={{
            padding: "12px 32px", background: PALETTE.sky, color: "#fff", border: "none",
            borderRadius: 12, fontWeight: 700, fontSize: 14, fontFamily: "'DM Sans',sans-serif",
          }}>
            Sign in with Google
          </button>
        </div>
      </div>
    </>
  );

  if (error) return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div style={{ minHeight: "100vh", background: PALETTE.navy, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{
          background: PALETTE.navyMid, border: "1px solid rgba(239,68,68,0.2)",
          borderRadius: 24, padding: "40px", textAlign: "center", maxWidth: 420,
        }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(239,68,68,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <Zap size={28} style={{ color: "#ef4444" }} />
          </div>
          <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 800, color: textPri, marginBottom: 10 }}>
            Dashboard Unavailable
          </h2>
          <p style={{ color: textMut, fontSize: 13, lineHeight: 1.7, marginBottom: 24 }}>{error}</p>
          <a href="/admin" style={{
            display: "inline-block", padding: "11px 28px", background: PALETTE.sky,
            color: "#fff", borderRadius: 12, fontWeight: 700, fontSize: 14, textDecoration: "none",
          }}>
            Go to Setup
          </a>
        </div>
      </div>
    </>
  );

  // ─────────────────── TOKEN SHORTCUTS ────────────────────────────────────
  const border = "1px solid var(--border)";
  const surface = "var(--surface)";
  const textPri = "var(--textPri)";
  const textMut = "var(--textMut)";
  const textSub = "var(--textSub)";

  // ─────────────────── RENDER ─────────────────────────────────────────────
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div style={{ minHeight: "100vh", background: PALETTE.navy, fontFamily: "'DM Sans',sans-serif", color: textPri, position: "relative", overflowX: "hidden" }}>

        {/* Ambient decorative blobs */}
        <div style={{ position: "fixed", top: "5%", right: "4%", width: 380, height: 380, borderRadius: "50%", background: "radial-gradient(circle,rgba(95,168,211,0.06) 0%,transparent 70%)", pointerEvents: "none", animation: "float 16s ease-in-out infinite" }} />
        <div style={{ position: "fixed", bottom: "10%", left: "3%", width: 340, height: 340, borderRadius: "50%", background: "radial-gradient(circle,rgba(139,92,246,0.05) 0%,transparent 70%)", pointerEvents: "none", animation: "float 22s ease-in-out 4s infinite" }} />
        <div style={{ position: "fixed", top: "40%", left: "40%", width: 260, height: 260, borderRadius: "50%", background: "radial-gradient(circle,rgba(16,185,129,0.04) 0%,transparent 70%)", pointerEvents: "none" }} />

        {/* ══════════════════ NAVBAR ══════════════════ */}
        <nav style={{
          position: "sticky", top: 0, zIndex: 50,
          background: "rgba(10,22,40,0.88)", backdropFilter: "blur(20px)",
          borderBottom: border,
        }}>
          <div style={{ maxWidth: 1380, margin: "0 auto", padding: "0 28px", height: 68, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
            {/* Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                background: `linear-gradient(135deg,${PALETTE.sky},${PALETTE.ice})`,
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 0 0 0 rgba(95,168,211,0.4)",
                animation: "glowPulse 3s ease-in-out infinite",
              }}>
                <ScanLine size={18} style={{ color: "#fff" }} />
              </div>
              <div>
                <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 17, fontWeight: 800, color: textPri, lineHeight: 1.2, letterSpacing: "-0.3px" }}>
                  {companyName}
                </h1>
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 1 }}>
                  <span style={{ position: "relative", display: "inline-flex", width: 7, height: 7 }}>
                    <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: PALETTE.emerald, animation: "ping 2s cubic-bezier(0,0,0.2,1) infinite" }} />
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: PALETTE.emerald }} />
                  </span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: PALETTE.emerald }}>Live sync</span>
                  <span style={{ fontSize: 10, color: textMut }}>· {leads.length} total leads</span>
                </div>
              </div>
            </div>

            {/* Search bar */}
            <div style={{ flex: 1, maxWidth: 340, position: "relative" }}>
              <Search size={13} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: textMut }} />
              <input
                placeholder="Search leads…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: "100%", padding: "9px 36px 9px 34px",
                  background: "rgba(255,255,255,0.04)", border,
                  borderRadius: 12, fontSize: 13, color: textPri,
                  outline: "none", fontFamily: "'DM Sans',sans-serif",
                  transition: "border-color .2s,box-shadow .2s",
                }}
                onFocus={e => { e.target.style.borderColor = `${PALETTE.sky}55`; e.target.style.boxShadow = `0 0 0 3px ${PALETTE.sky}18`; }}
                onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.07)"; e.target.style.boxShadow = "none"; }}
              />
              {searchQuery && (
                <button className="btn-press" onClick={() => setSearchQuery("")} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: textMut }}>
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 9, alignItems: "center", flexShrink: 0 }}>
              <button className="btn-press" onClick={fetchLeads} title="Refresh" style={{
                width: 38, height: 38, borderRadius: 10, background: "transparent", border, color: textMut,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <RefreshCw size={14} />
              </button>
              <button className="btn-press" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} title="Toggle Theme" style={{
                width: 38, height: 38, borderRadius: 10, background: "transparent", border, color: textMut,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
              </button>
              {slug && (
                <a href={`/scan/${slug}`} target="_blank" rel="noreferrer" style={{
                  display: "flex", alignItems: "center", gap: 7, padding: "8px 14px",
                  background: "rgba(255,255,255,0.04)", border, borderRadius: 10, color: textSub, fontSize: 13, fontWeight: 600, textDecoration: "none",
                  transition: "border-color .2s, color .2s",
                }}>
                  <Globe size={13} />Scanner
                </a>
              )}
              <button className="btn-press" onClick={downloadCSV} style={{
                display: "flex", alignItems: "center", gap: 8, padding: "9px 18px",
                background: `linear-gradient(135deg,${PALETTE.sky},${PALETTE.ice})`,
                border: "none", borderRadius: 10, color: "#fff", fontSize: 13, fontWeight: 700,
                boxShadow: "0 4px 18px rgba(95,168,211,0.28)",
              }}>
                <Download size={13} />Export CSV
              </button>
            </div>
          </div>
        </nav>

        {/* ══════════════════ MAIN ══════════════════ */}
        <main style={{ maxWidth: 1380, margin: "0 auto", padding: "28px 28px 80px" }}>

          {/* ── KPI CARDS ── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 16, marginBottom: 24 }}>
            <KpiCard title="Total Leads" value={filteredLeads.length} icon={<Users size={15} />} accent={PALETTE.sky} trend={trendData.delta} delay={0} sub={`of ${leads.length} all-time`} />
            <KpiCard title="Companies" value={new Set(filteredLeads.map(l => l.Company || l.company).filter(Boolean)).size}
              icon={<Building2 size={15} />} accent={PALETTE.violet} delay={80} sub="unique organisations" />
            <KpiCard title="With Email" value={filteredLeads.filter(l => l.Email || l.email).length}
              icon={<Mail size={15} />} accent={PALETTE.emerald} delay={160} sub="contactable leads" />
            <KpiCard title="This Week" value={leads.filter(l => { const d = getLeadDate(l); return (Date.now() - d.getTime()) / 86400000 <= 7 }).length}
              icon={<Calendar size={15} />} accent={PALETTE.gold} delay={240} sub="last 7 days captures" />
          </div>

          {/* ── TAB + FILTER BAR ── */}
          <div style={{
            display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12,
            background: surface, border, borderRadius: 18, padding: "10px 14px", marginBottom: 22,
            animation: "fadeUp 0.5s cubic-bezier(.16,1,.3,1) 320ms both",
          }}>
            {/* Tabs */}
            <div style={{ display: "flex", gap: 4, background: "rgba(0,0,0,0.25)", borderRadius: 12, padding: 4 }}>
              {([
                { id: "dashboard", icon: <LayoutDashboard size={13} />, label: "Analytics" },
                { id: "cards", icon: <LayoutGrid size={13} />, label: "Cards" },
                { id: "kanban", icon: <Layers size={13} />, label: "Kanban" },
                { id: "table", icon: <TableIcon size={13} />, label: "Table" },
              ] as const).map(t => (
                <button key={t.id} className="btn-press" onClick={() => setActiveTab(t.id)} style={{
                  display: "flex", alignItems: "center", gap: 7, padding: "8px 14px",
                  borderRadius: 9, fontSize: 12, fontWeight: 700, border: "none",
                  background: activeTab === t.id ? PALETTE.sky : "transparent",
                  color: activeTab === t.id ? "#fff" : textMut,
                  boxShadow: activeTab === t.id ? "0 2px 12px rgba(95,168,211,0.3)" : "none",
                  transition: "all .18s",
                }}>
                  {t.icon}{t.label}
                </button>
              ))}
            </div>

            {/* Date filter */}
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <Filter size={12} style={{ color: PALETTE.sky }} />
              {(["all", "today", "week", "month"] as DateFilter[]).map(f => (
                <button key={f} className="btn-press" onClick={() => setDateFilter(f)} style={{
                  padding: "6px 12px", borderRadius: 8, fontSize: 11, fontWeight: 700, border,
                  background: dateFilter === f ? `${PALETTE.sky}22` : "transparent",
                  color: dateFilter === f ? PALETTE.sky : textMut,
                  borderColor: dateFilter === f ? `${PALETTE.sky}44` : "rgba(255,255,255,0.07)",
                  transition: "all .15s",
                }}>
                  {f === "all" ? "All Time" : f === "today" ? "Today" : f === "week" ? "7 Days" : "30 Days"}
                </button>
              ))}
              <span style={{ fontSize: 11, color: textMut, fontWeight: 600, marginLeft: 4 }}>
                {filteredLeads.length} results
              </span>
            </div>
          </div>

          {/* ══════════ DASHBOARD TAB ══════════ */}
          {activeTab === "dashboard" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20, animation: "fadeUp 0.45s cubic-bezier(.16,1,.3,1) both" }}>

              {/* Row 1: Area + Pie */}
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, minWidth: 0 }}>
                {/* Area chart */}
                <div style={{ background: surface, border, borderRadius: 20, padding: "22px 24px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                    <h3 style={{ fontSize: 12, fontWeight: 700, color: textMut, letterSpacing: "0.1em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 7 }}>
                      <Activity size={13} style={{ color: PALETTE.sky }} />Cumulative Growth
                    </h3>
                    <span style={{ fontSize: 11, color: textMut }}>All time</span>
                  </div>
                  <div style={{ height: 240 }}>
                    {analytics.areaData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={analytics.areaData}>
                          <defs>
                            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={PALETTE.sky} stopOpacity={0.35} />
                              <stop offset="100%" stopColor={PALETTE.sky} stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
                          <XAxis dataKey="date" tick={{ fill: textMut, fontSize: 10 }} axisLine={false} tickLine={false} />
                          <YAxis allowDecimals={false} tick={{ fill: textMut, fontSize: 10 }} axisLine={false} tickLine={false} />
                          <Tooltip content={<ChartTip />} />
                          <Area dataKey="cumulative" name="Total" stroke={PALETTE.sky} fill="url(#areaGrad)" strokeWidth={2} dot={false} />
                          <Area dataKey="leads" name="Daily" stroke={PALETTE.ice} fill="none" strokeWidth={1.5} strokeDasharray="4 3" dot={false} />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: textMut, fontSize: 13 }}>No data yet</div>
                    )}
                  </div>
                </div>

                {/* Donut pie */}
                <div style={{ background: surface, border, borderRadius: 20, padding: "22px 22px" }}>
                  <h3 style={{ fontSize: 12, fontWeight: 700, color: textMut, letterSpacing: "0.1em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 7, marginBottom: 18 }}>
                    <Building2 size={13} style={{ color: PALETTE.violet }} />Top Companies
                  </h3>
                  <div style={{ height: 190 }}>
                    {analytics.pieData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={analytics.pieData} innerRadius={52} outerRadius={78} paddingAngle={4} dataKey="value" stroke="none">
                            {analytics.pieData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                          </Pie>
                          <Tooltip content={<ChartTip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: textMut, fontSize: 13 }}>No data</div>
                    )}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 7, marginTop: 8 }}>
                    {analytics.pieData.map((d, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                          <div style={{ width: 9, height: 9, borderRadius: "50%", background: CHART_COLORS[i % CHART_COLORS.length], flexShrink: 0 }} />
                          <span style={{ color: textMut, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 130 }}>{d.name}</span>
                        </div>
                        <span style={{ fontWeight: 700, color: textPri }}>{d.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Row 2: Bar + Radar + Funnel */}
              <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr", gap: 20, minWidth: 0 }}>
                {/* Daily bar */}
                <div style={{ background: surface, border, borderRadius: 20, padding: "22px 24px" }}>
                  <h3 style={{ fontSize: 12, fontWeight: 700, color: textMut, letterSpacing: "0.1em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 7, marginBottom: 18 }}>
                    <BarChart2 size={13} style={{ color: PALETTE.gold }} />Daily Capture
                  </h3>
                  <div style={{ height: 200 }}>
                    {analytics.chartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analytics.chartData} barSize={18}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
                          <XAxis dataKey="date" tick={{ fill: textMut, fontSize: 10 }} axisLine={false} tickLine={false} />
                          <YAxis allowDecimals={false} tick={{ fill: textMut, fontSize: 10 }} axisLine={false} tickLine={false} />
                          <Tooltip content={<ChartTip />} />
                          <Bar dataKey="leads" name="Leads" radius={[5, 5, 0, 0]}>
                            {analytics.chartData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: textMut, fontSize: 13 }}>No data</div>
                    )}
                  </div>
                </div>

                {/* Weekly radar */}
                <div style={{ background: surface, border, borderRadius: 20, padding: "22px 20px" }}>
                  <h3 style={{ fontSize: 12, fontWeight: 700, color: textMut, letterSpacing: "0.1em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 7, marginBottom: 18 }}>
                    <Activity size={13} style={{ color: PALETTE.emerald }} />By Weekday
                  </h3>
                  <div style={{ height: 200 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={analytics.weekData}>
                        <PolarGrid stroke="rgba(255,255,255,0.06)" />
                        <PolarAngleAxis dataKey="day" tick={{ fill: textMut, fontSize: 10 }} />
                        <PolarRadiusAxis tick={false} axisLine={false} />
                        <Radar dataKey="count" name="Leads" stroke={PALETTE.emerald} fill={PALETTE.emerald} fillOpacity={0.18} strokeWidth={1.5} />
                        <Tooltip content={<ChartTip />} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Conversion funnel */}
                <div style={{ background: surface, border, borderRadius: 20, padding: "22px 20px" }}>
                  <h3 style={{ fontSize: 12, fontWeight: 700, color: textMut, letterSpacing: "0.1em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 7, marginBottom: 20 }}>
                    <TrendingUp size={13} style={{ color: PALETTE.coral }} />Pipeline Funnel
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {analytics.funnel.map((f, i) => {
                      const pct = analytics.funnel[0].count > 0
                        ? Math.round((f.count / analytics.funnel[0].count) * 100) : 0;
                      const clr = CHART_COLORS[i % CHART_COLORS.length];
                      return (
                        <div key={f.stage}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 5 }}>
                            <span style={{ color: textMut, fontWeight: 600 }}>{f.stage}</span>
                            <span style={{ color: clr, fontWeight: 700 }}>{f.count}</span>
                          </div>
                          <div style={{ height: 7, background: "rgba(255,255,255,0.05)", borderRadius: 6, overflow: "hidden" }}>
                            <div style={{
                              height: "100%", borderRadius: 6, background: clr,
                              width: `${pct}%`, transition: "width 1s cubic-bezier(.16,1,.3,1)",
                              boxShadow: `0 0 8px ${clr}55`,
                            }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══════════ CARDS TAB ══════════ */}
          {activeTab === "cards" && (
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 18,
              animation: "fadeUp 0.4s cubic-bezier(.16,1,.3,1) both",
            }}>
              {filteredLeads.map((lead, i) => {
                const name = getField(lead, "Name", "name") || "Unknown";
                const exp = expandedCard === i;
                const extra = Object.keys(lead).filter(k =>
                  !["Name", "name", "Title", "title", "Company", "company", "Email", "email", "Phone", "phone", "Timestamp", "Date Captured", "Date", "time"].includes(k)
                );
                return (
                  <div key={i} className="card-hover" style={{
                    background: surface, border,
                    borderRadius: 20, overflow: "hidden",
                    animation: `fadeUp 0.45s cubic-bezier(.16,1,.3,1) ${i * 22}ms both`,
                  }}>
                    {/* Card header */}
                    <div style={{
                      background: "rgba(95,168,211,0.06)", borderBottom: border,
                      padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                        <div style={{
                          width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
                          background: `linear-gradient(135deg,${hslRing(i)},${hslRing(i + 3)})`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 15, fontWeight: 800, color: "#fff",
                          boxShadow: "0 3px 12px rgba(0,0,0,0.3)",
                        }}>
                          {avatar(name)}
                        </div>
                        <div>
                          <p style={{ fontWeight: 700, color: textPri, fontSize: 14, lineHeight: 1.3 }}>{name}</p>
                          <p style={{ fontSize: 11, color: textMut }}>{getField(lead, "Title", "title") || "No title"}</p>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        {(lead.Timestamp || lead["Date Captured"] || lead.Date || lead.time) && (
                          <span style={{
                            display: "flex", alignItems: "center", gap: 5, fontSize: 10, fontWeight: 600,
                            color: textMut, background: "rgba(0,0,0,0.25)", border,
                            padding: "3px 9px", borderRadius: 20,
                          }}>
                            <Clock size={9} />
                            {(lead.Timestamp || lead["Date Captured"] || lead.Date || lead.time || "").split(",")[0]}
                          </span>
                        )}
                        <button className="btn-press" onClick={() => setExpandedCard(exp ? null : i)} style={{
                          width: 26, height: 26, borderRadius: 8, background: "rgba(255,255,255,0.05)", border,
                          display: "flex", alignItems: "center", justifyContent: "center", color: textMut,
                        }}>
                          {exp ? <EyeOff size={11} /> : <Eye size={11} />}
                        </button>
                      </div>
                    </div>

                    {/* Card body */}
                    <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 12 }}>
                      {[
                        { icon: <Building2 size={13} />, label: "Company", val: getField(lead, "Company", "company") },
                        { icon: <Mail size={13} />, label: "Email", val: getField(lead, "Email", "email") },
                        { icon: <Phone size={13} />, label: "Phone", val: getField(lead, "Phone", "phone") },
                      ].map(row => (
                        <div key={row.label} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                          <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(95,168,211,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: PALETTE.sky, flexShrink: 0, marginTop: 1 }}>
                            {row.icon}
                          </div>
                          <div>
                            <p style={{ fontSize: 9, fontWeight: 700, color: textMut, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 2 }}>{row.label}</p>
                            <p style={{ fontSize: 13, fontWeight: 600, color: row.val ? textPri : textMut }}>
                              {row.val || "—"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Expanded extra fields */}
                    {exp && extra.length > 0 && (
                      <div style={{ borderTop: border, padding: "12px 18px", display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {extra.filter(k => lead[k]).map(k => (
                          <div key={k} style={{
                            background: "rgba(255,255,255,0.04)", border,
                            borderRadius: 8, padding: "5px 10px", fontSize: 11,
                          }}>
                            <p style={{ fontSize: 9, fontWeight: 700, color: textMut, textTransform: "uppercase", letterSpacing: "0.08em" }}>{k}</p>
                            <p style={{ fontWeight: 600, color: textMut }}>{lead[k]}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Card footer */}
                    <div style={{ borderTop: border, padding: "10px 18px", display: "flex", justifyContent: "flex-end", gap: 8 }}>
                      <a href={`mailto:${getField(lead, "Email", "email")}`} style={{
                        display: "flex", alignItems: "center", gap: 5, padding: "6px 14px",
                        background: `${PALETTE.sky}18`, color: PALETTE.sky, border: `1px solid ${PALETTE.sky}30`,
                        borderRadius: 8, fontSize: 11, fontWeight: 700, textDecoration: "none",
                        transition: "background .15s",
                      }}>
                        <Mail size={11} />Email
                      </a>
                    </div>
                  </div>
                );
              })}
              {filteredLeads.length === 0 && (
                <div style={{ gridColumn: "1/-1", padding: "60px 24px", textAlign: "center" }}>
                  <Inbox size={40} style={{ color: textMut, margin: "0 auto 14px" }} />
                  <p style={{ color: textMut, fontWeight: 700 }}>No leads match your filters</p>
                </div>
              )}
            </div>
          )}

          {/* ══════════ KANBAN TAB ══════════ */}
          {activeTab === "kanban" && (
            <div style={{
              display: "grid", gridTemplateColumns: `repeat(${KANBAN_COLS.length},minmax(220px,1fr))`, gap: 14,
              animation: "fadeUp 0.4s cubic-bezier(.16,1,.3,1) both", overflowX: "auto",
            }}>
              {KANBAN_COLS.map((col, ci) => {
                const cards = kanbanLeads[col] || [];
                const accent = CHART_COLORS[ci % CHART_COLORS.length];
                return (
                  <div key={col}
                    onDragOver={onDragOver}
                    onDrop={e => onDrop(e, col)}
                    style={{
                      background: surface, border,
                      borderTop: `3px solid ${accent}`, borderRadius: 18, overflow: "hidden",
                      minHeight: 200,
                    }}
                  >
                    <div style={{
                      padding: "13px 16px", borderBottom: border,
                      background: `${accent}12`, display: "flex", alignItems: "center", justifyContent: "space-between",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 7, color: accent, fontWeight: 800, fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                        <UserCheck size={12} />{col}
                      </div>
                      <span style={{
                        fontSize: 12, fontWeight: 800, padding: "2px 9px", borderRadius: 20,
                        background: `${accent}22`, color: accent, border: `1px solid ${accent}40`,
                      }}>{cards.length}</span>
                    </div>
                    <div style={{ padding: 10, display: "flex", flexDirection: "column", gap: 9, maxHeight: 560, overflowY: "auto" }}>
                      {cards.map((lead, i) => {
                        const name = getField(lead, "Name", "name") || "Unknown";
                        return (
                          <div key={i}
                            draggable
                            onDragStart={e => onDragStart(e, lead, col)}
                            className="kanban-item"
                            style={{
                              background: "rgba(255,255,255,0.03)", border,
                              borderRadius: 14, padding: 13, cursor: "grab",
                              animation: `fadeUp 0.35s cubic-bezier(.16,1,.3,1) ${i * 20}ms both`,
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 10 }}>
                              <div style={{
                                width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                                background: `linear-gradient(135deg,${hslRing(i + ci * 3)},${hslRing(i + ci * 3 + 4)})`,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 12, fontWeight: 800, color: "#fff",
                              }}>
                                {avatar(name)}
                              </div>
                              <div style={{ minWidth: 0 }}>
                                <p style={{ fontWeight: 700, color: textPri, fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</p>
                                <p style={{ fontSize: 10, color: textMut, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                  {getField(lead, "Company", "company") || getField(lead, "Title", "title") || "—"}
                                </p>
                              </div>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 6, borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 9 }}>
                              {getField(lead, "Email", "email") && (
                                <p style={{ fontSize: 10, color: PALETTE.sky, display: "flex", alignItems: "center", gap: 5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                  <Mail size={9} />{lead.Email || lead.email}
                                </p>
                              )}
                              {getField(lead, "Phone", "phone") && (
                                <p style={{ fontSize: 10, color: textMut, display: "flex", alignItems: "center", gap: 5 }}>
                                  <Phone size={9} />{lead.Phone || lead.phone}
                                </p>
                              )}
                              {(lead.Timestamp || lead["Date Captured"]) && (
                                <p style={{ fontSize: 10, color: textMut, display: "flex", alignItems: "center", gap: 5 }}>
                                  <Clock size={9} />{(lead.Timestamp || lead["Date Captured"] || "").split(",")[0]}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      {cards.length === 0 && (
                        <div style={{ padding: "22px 0", textAlign: "center", fontSize: 11, color: textMut, borderRadius: 10, border: "2px dashed rgba(255,255,255,0.06)", margin: 4 }}>
                          Drop cards here
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ══════════ TABLE TAB ══════════ */}
          {activeTab === "table" && (
            <div style={{
              background: surface, border, borderRadius: 20, overflow: "hidden",
              animation: "fadeUp 0.4s cubic-bezier(.16,1,.3,1) both",
            }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "rgba(0,0,0,0.28)" }}>
                      <th style={{ padding: "13px 20px", textAlign: "left", fontSize: 9, fontWeight: 800, color: textMut, letterSpacing: "0.13em", textTransform: "uppercase", borderBottom: border, whiteSpace: "nowrap" }}>Date</th>
                      <th style={{ padding: "13px 20px", textAlign: "left", fontSize: 9, fontWeight: 800, color: textMut, letterSpacing: "0.13em", textTransform: "uppercase", borderBottom: border }}>Name</th>
                      <th style={{ padding: "13px 20px", textAlign: "left", fontSize: 9, fontWeight: 800, color: textMut, letterSpacing: "0.13em", textTransform: "uppercase", borderBottom: border }}>Company</th>
                      <th style={{ padding: "13px 20px", textAlign: "left", fontSize: 9, fontWeight: 800, color: textMut, letterSpacing: "0.13em", textTransform: "uppercase", borderBottom: border }}>Email</th>
                      <th style={{ padding: "13px 20px", textAlign: "left", fontSize: 9, fontWeight: 800, color: textMut, letterSpacing: "0.13em", textTransform: "uppercase", borderBottom: border }}>Phone</th>
                      <th style={{ padding: "13px 20px", textAlign: "right", fontSize: 9, fontWeight: 800, color: textMut, letterSpacing: "0.13em", textTransform: "uppercase", borderBottom: border }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableSlice.map((lead, i) => (
                      <tr key={i} className="row-hover" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", animation: `slideRight 0.3s cubic-bezier(.16,1,.3,1) ${i * 30}ms both` }}>
                        <td style={{ padding: "13px 20px", color: textMut, fontSize: 11, fontFamily: "'JetBrains Mono',monospace", whiteSpace: "nowrap" }}>
                          {(getField(lead, "Timestamp", "Date Captured", "Date", "time") || "—").split(",")[0]}
                        </td>
                        <td style={{ padding: "13px 20px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{
                              width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
                              background: `linear-gradient(135deg,${hslRing(i)},${hslRing(i + 3)})`,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: 11, fontWeight: 800, color: "#fff",
                            }}>
                              {avatar(getField(lead, "Name", "name") || "?")}
                            </div>
                            <div>
                              <p style={{ fontWeight: 700, color: textPri, fontSize: 13 }}>{getField(lead, "Name", "name") || "Unknown"}</p>
                              <p style={{ fontSize: 10, color: textMut }}>{getField(lead, "Title", "title") || ""}</p>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "13px 20px", color: textMut, fontSize: 13 }}>{getField(lead, "Company", "company") || "—"}</td>
                        <td style={{ padding: "13px 20px" }}>
                          <a href={`mailto:${getField(lead, "Email", "email")}`} style={{ color: PALETTE.sky, textDecoration: "none", fontSize: 13, fontWeight: 600 }}>
                            {getField(lead, "Email", "email") || "—"}
                          </a>
                        </td>
                        <td style={{ padding: "13px 20px", color: textMut, fontSize: 13, fontFamily: "'JetBrains Mono',monospace" }}>{getField(lead, "Phone", "phone") || "—"}</td>
                        <td style={{ padding: "13px 20px", textAlign: "right" }}>
                          <a href={`mailto:${getField(lead, "Email", "email")}`} style={{
                            display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 13px",
                            background: `${PALETTE.sky}18`, color: PALETTE.sky, border: `1px solid ${PALETTE.sky}30`,
                            borderRadius: 8, fontSize: 11, fontWeight: 700, textDecoration: "none",
                            whiteSpace: "nowrap",
                          }}>
                            <Mail size={10} />Contact
                          </a>
                        </td>
                      </tr>
                    ))}
                    {tableSlice.length === 0 && (
                      <tr>
                        <td colSpan={6} style={{ padding: "52px 24px", textAlign: "center", color: textMut, fontSize: 13, fontWeight: 600 }}>
                          No leads match your filter criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {/* Table pagination */}
              {tablePages > 1 && (
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "13px 22px", borderTop: border,
                }}>
                  <span style={{ fontSize: 11, color: textMut }}>
                    Showing <strong style={{ color: textMut }}>{(tablePage - 1) * TABLE_PAGE_SIZE + 1}–{Math.min(tablePage * TABLE_PAGE_SIZE, filteredLeads.length)}</strong> of <strong style={{ color: textMut }}>{filteredLeads.length}</strong>
                  </span>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button className="btn-press" onClick={() => setTablePage(p => Math.max(1, p - 1))} disabled={tablePage === 1} style={{
                      width: 32, height: 32, borderRadius: 8, background: "transparent", border, color: textMut,
                      display: "flex", alignItems: "center", justifyContent: "center", opacity: tablePage === 1 ? 0.3 : 1,
                    }}>
                      <ChevronLeft size={14} />
                    </button>
                    {Array.from({ length: tablePages }, (_, i) => i + 1).map(p => (
                      <button key={p} className="btn-press" onClick={() => setTablePage(p)} style={{
                        width: 32, height: 32, borderRadius: 8, fontSize: 12, fontWeight: 700, border,
                        background: tablePage === p ? PALETTE.sky : "transparent",
                        color: tablePage === p ? "#fff" : textMut,
                      }}>{p}</button>
                    ))}
                    <button className="btn-press" onClick={() => setTablePage(p => Math.min(tablePages, p + 1))} disabled={tablePage === tablePages} style={{
                      width: 32, height: 32, borderRadius: 8, background: "transparent", border, color: textMut,
                      display: "flex", alignItems: "center", justifyContent: "center", opacity: tablePage === tablePages ? 0.3 : 1,
                    }}>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </>
  );
}