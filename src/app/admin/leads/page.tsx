"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  Loader2, Database, Users, Download, ShieldCheck, Zap, 
  Mail, Phone, Building2, ScanLine, Clock, 
  LayoutDashboard, Table as TableIcon, LayoutGrid, Calendar, Filter
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";

interface Lead {
  [key: string]: string;
}

const COLORS = ["#1b4965", "#5fa8d3", "#62b6cb", "#cae9ff", "#bee9e8"];

export default function AdminLeadsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [companyName, setCompanyName] = useState("");
  const [slug, setSlug] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // View States
  const [activeTab, setActiveTab] = useState<"dashboard" | "cards" | "table">("dashboard");
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "week" | "month">("all");

  useEffect(() => {
    fetch('/api/auth/google/check')
      .then(res => res.json())
      .then(data => {
        setIsAuthenticated(data.authenticated);
        if (data.authenticated) fetchLeads();
        else setLoading(false);
      })
      .catch(() => {
        setIsAuthenticated(false);
        setLoading(false);
      });
  }, []);

  const fetchLeads = async () => {
    try {
      const response = await fetch('/api/admin/my-leads');
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to fetch leads");

      setLeads(data.leads || []);
      setCompanyName(data.companyName || "Your Company");
      setSlug(data.slug || "");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    if (filteredLeads.length === 0) return;
    const headers = Object.keys(filteredLeads[0]);
    const csvRows = [headers.join(",")];
    for (const lead of filteredLeads) {
      const values = headers.map(header => `"${(lead[header] || "").replace(/"/g, '""')}"`);
      csvRows.push(values.join(","));
    }
    const blob = new Blob([csvRows.join("\n")], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `${companyName}-leads.csv`);
    a.click();
  };

  // Extract date helper
  const getLeadDate = (lead: Lead) => {
    const dString = lead.Timestamp || lead["Date Captured"] || lead.Date || lead.time;
    if (!dString) return new Date(0);
    return new Date(dString);
  };

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    const now = new Date();
    return leads.filter(lead => {
      const d = getLeadDate(lead);
      if (dateFilter === "all") return true;
      const diffTime = Math.abs(now.getTime() - d.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      if (dateFilter === "today") return diffDays <= 1;
      if (dateFilter === "week") return diffDays <= 7;
      if (dateFilter === "month") return diffDays <= 30;
      return true;
    });
  }, [leads, dateFilter]);

  // Analytics Data
  const { chartData, companyPieData } = useMemo(() => {
    const dateCounts: Record<string, number> = {};
    const companyCounts: Record<string, number> = {};

    filteredLeads.forEach(lead => {
      // Bar Chart - Group by Date
      const dateObj = getLeadDate(lead);
      const dateStr = dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      if (dateObj.getTime() > 0) {
        dateCounts[dateStr] = (dateCounts[dateStr] || 0) + 1;
      }

      // Pie Chart - Group by Company
      const comp = lead.Company || lead.company || "Unknown";
      if (comp !== "Unknown") {
        companyCounts[comp] = (companyCounts[comp] || 0) + 1;
      }
    });

    const chartData = Object.keys(dateCounts).map(k => ({ date: k, leads: dateCounts[k] }));
    const companyPieData = Object.keys(companyCounts)
      .map(k => ({ name: k, value: companyCounts[k] }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5 companies

    return { chartData, companyPieData };
  }, [filteredLeads]);


  // RENDER BLOCKS
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-[#1b4965]">
        <Loader2 className="w-10 h-10 animate-spin text-[#5fa8d3] mb-4" />
        <p className="font-semibold text-lg animate-pulse">Loading Analytics & CRM Data...</p>
      </div>
    );
  }

  if (isAuthenticated === false) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-[#1b4965] p-6">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6 shadow-sm">
          <ShieldCheck className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-3xl font-black mb-4 text-center">Authentication Required</h1>
        <button onClick={() => window.location.href = "/api/auth/google"} className="px-8 py-3 rounded-xl bg-[#1b4965] text-white font-bold hover:bg-[#1b4965]/90 transition-all shadow-lg flex items-center gap-3">
          Sign in with Google
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-[#1b4965] p-6">
        <div className="bg-white p-8 rounded-3xl border border-red-200 shadow-xl max-w-lg text-center">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6"><Zap className="w-8 h-8" /></div>
          <h2 className="text-2xl font-bold mb-4 text-slate-900">Dashboard Unavailable</h2>
          <p className="text-slate-600 mb-8 leading-relaxed">{error}</p>
          <a href="/admin" className="inline-block px-6 py-3 bg-[#1b4965] text-white rounded-xl font-bold hover:bg-[#1b4965]/90 transition-all">Go to Setup</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-[#1b4965] font-sans pb-24">
      {/* Navbar */}
      <nav className="bg-white border-b border-[#bee9e8] sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#1b4965] rounded-xl flex items-center justify-center shadow-md">
              <ScanLine className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-black text-xl tracking-tight leading-tight">{companyName}</h1>
              <p className="text-xs font-semibold text-[#62b6cb] uppercase tracking-widest">Analytics Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {slug && (
              <a href={`/scan/${slug}`} target="_blank" rel="noreferrer" className="hidden sm:flex items-center gap-2 px-4 py-2 border border-[#bee9e8] bg-[#cae9ff]/20 text-[#1b4965]/80 font-semibold text-sm rounded-lg hover:bg-[#cae9ff]/50 transition-all">
                Open Scanner URL
              </a>
            )}
            <button onClick={downloadCSV} className="flex items-center gap-2 px-5 py-2.5 bg-[#1b4965] text-white font-bold text-sm rounded-lg hover:bg-[#1b4965]/90 transition-all shadow-md">
              <Download className="w-4 h-4" /> Export CSV
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-12">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 border border-[#bee9e8] shadow-sm flex items-center gap-5">
            <div className="w-14 h-14 rounded-full bg-[#cae9ff]/60 flex items-center justify-center"><Users className="w-7 h-7 text-[#5fa8d3]" /></div>
            <div>
              <p className="text-sm font-semibold text-[#1b4965]/60 mb-1 uppercase tracking-wider">Filtered Leads</p>
              <p className="text-4xl font-black text-[#1b4965]">{filteredLeads.length}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-[#bee9e8] shadow-sm flex items-center gap-5">
            <div className="w-14 h-14 rounded-full bg-[#bee9e8]/60 flex items-center justify-center"><Database className="w-7 h-7 text-[#62b6cb]" /></div>
            <div>
              <p className="text-sm font-semibold text-[#1b4965]/60 mb-1 uppercase tracking-wider">Live Sync Status</p>
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span></span>
                <p className="text-lg font-bold text-emerald-600">Connected</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-[#bee9e8] shadow-sm flex items-center gap-5">
            <div className="w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center"><Zap className="w-7 h-7 text-indigo-500" /></div>
            <div>
              <p className="text-sm font-semibold text-[#1b4965]/60 mb-1 uppercase tracking-wider">Last Capture</p>
              <p className="text-lg font-bold text-[#1b4965] truncate max-w-[150px]">
                {leads.length > 0 ? (leads[leads.length-1].Timestamp || leads[leads.length-1]["Date Captured"] || "Recently") : "No data yet"}
              </p>
            </div>
          </div>
        </div>

        {/* Toolbar (Tabs + Filter) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-white p-2 rounded-xl border border-[#bee9e8] shadow-sm">
          <div className="flex items-center gap-1">
            <button onClick={() => setActiveTab("dashboard")} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'dashboard' ? 'bg-[#1b4965] text-white shadow-md' : 'text-[#1b4965]/70 hover:bg-[#cae9ff]/30'}`}>
              <LayoutDashboard className="w-4 h-4" /> Analytics
            </button>
            <button onClick={() => setActiveTab("cards")} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'cards' ? 'bg-[#1b4965] text-white shadow-md' : 'text-[#1b4965]/70 hover:bg-[#cae9ff]/30'}`}>
              <LayoutGrid className="w-4 h-4" /> Kanban Cards
            </button>
            <button onClick={() => setActiveTab("table")} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'table' ? 'bg-[#1b4965] text-white shadow-md' : 'text-[#1b4965]/70 hover:bg-[#cae9ff]/30'}`}>
              <TableIcon className="w-4 h-4" /> Data Table
            </button>
          </div>
          <div className="flex items-center gap-3 px-3">
            <Filter className="w-4 h-4 text-[#5fa8d3]" />
            <select 
              value={dateFilter} 
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="bg-transparent text-[#1b4965] font-bold text-sm outline-none cursor-pointer hover:text-[#5fa8d3] transition-colors"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
          </div>
        </div>

        {/* ================= DASHBOARD TAB ================= */}
        {activeTab === "dashboard" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4">
            {/* Bar Chart */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-[#bee9e8] shadow-sm">
              <h3 className="font-bold mb-6 flex items-center gap-2"><Calendar className="w-5 h-5 text-[#5fa8d3]" /> Capture Velocity</h3>
              <div className="h-72 w-full">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#bee9e8" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#1b4965', fontSize: 12}} />
                      <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{fill: '#1b4965', fontSize: 12}} />
                      <Tooltip cursor={{fill: '#cae9ff', opacity: 0.4}} contentStyle={{borderRadius: '12px', border: '1px solid #bee9e8', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}} />
                      <Bar dataKey="leads" fill="#5fa8d3" radius={[6, 6, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-[#1b4965]/50 font-medium">Not enough data to display chart.</div>
                )}
              </div>
            </div>
            
            {/* Pie Chart */}
            <div className="bg-white rounded-2xl p-6 border border-[#bee9e8] shadow-sm">
              <h3 className="font-bold mb-6 flex items-center gap-2"><Building2 className="w-5 h-5 text-[#5fa8d3]" /> Top Companies</h3>
              <div className="h-64 w-full">
                {companyPieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={companyPieData} innerRadius={60} outerRadius={85} paddingAngle={5} dataKey="value">
                        {companyPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{borderRadius: '12px', border: '1px solid #bee9e8'}} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-[#1b4965]/50 font-medium">No company data available.</div>
                )}
              </div>
              <div className="mt-2 space-y-2">
                {companyPieData.map((d, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[i%COLORS.length]}}></div><span className="font-medium truncate max-w-[150px]">{d.name}</span></div>
                    <span className="font-bold text-[#1b4965]">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= KANBAN CARDS TAB ================= */}
        {activeTab === "cards" && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4">
            {filteredLeads.map((lead, i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#bee9e8] overflow-hidden shadow-sm hover:shadow-md transition-shadow group relative flex flex-col">
                <div className="bg-[#cae9ff]/30 border-b border-[#bee9e8] px-5 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#1b4965] flex items-center justify-center text-white font-black text-sm shadow-sm">
                      {(lead.Name || lead.name || "?")[0]?.toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-[#1b4965] truncate max-w-[150px]">{lead.Name || lead.name || "Unknown"}</h3>
                      <p className="text-xs text-[#1b4965]/60 truncate max-w-[150px]">{lead.Title || lead.title || "No Title"}</p>
                    </div>
                  </div>
                  {(lead.Timestamp || lead["Date Captured"] || lead.Date || lead.time) && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-[#bee9e8] rounded-full text-[10px] font-bold text-[#1b4965]/60 shadow-sm">
                      <Clock className="w-3 h-3 text-[#5fa8d3]" />
                      {(lead.Timestamp || lead["Date Captured"] || lead.Date || lead.time).split(",")[0]}
                    </div>
                  )}
                </div>
                <div className="p-5 space-y-4 flex-1">
                  <div className="flex items-start gap-3">
                    <Building2 className="w-4 h-4 text-[#62b6cb] mt-0.5 flex-shrink-0" />
                    <div><p className="text-[10px] font-bold text-[#1b4965]/50 uppercase tracking-widest mb-0.5">Company</p><p className="text-sm font-semibold text-[#1b4965]">{lead.Company || lead.company || "—"}</p></div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="w-4 h-4 text-[#62b6cb] mt-0.5 flex-shrink-0" />
                    <div><p className="text-[10px] font-bold text-[#1b4965]/50 uppercase tracking-widest mb-0.5">Email</p><p className="text-sm font-semibold text-[#1b4965] truncate">{lead.Email || lead.email || "—"}</p></div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="w-4 h-4 text-[#62b6cb] mt-0.5 flex-shrink-0" />
                    <div><p className="text-[10px] font-bold text-[#1b4965]/50 uppercase tracking-widest mb-0.5">Phone</p><p className="text-sm font-semibold text-[#1b4965]">{lead.Phone || lead.phone || "—"}</p></div>
                  </div>
                </div>
                <div className="bg-slate-50 border-t border-[#bee9e8] px-5 py-3">
                  <div className="flex flex-wrap gap-2">
                    {Object.keys(lead)
                      .filter(k => !["Name", "name", "Title", "title", "Company", "company", "Email", "email", "Phone", "phone", "Timestamp", "Date Captured", "Date", "time"].includes(k))
                      .map(k => lead[k] && (
                        <div key={k} className="inline-flex flex-col bg-white border border-slate-200 rounded-md px-2 py-1 text-xs">
                          <span className="text-[9px] font-bold text-slate-400 uppercase">{k}</span>
                          <span className="font-medium text-slate-700 truncate max-w-[120px]">{lead[k]}</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ================= TABLE TAB ================= */}
        {activeTab === "table" && (
          <div className="bg-white rounded-2xl border border-[#bee9e8] shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-[#cae9ff]/30 text-[#1b4965] font-bold uppercase text-[10px] tracking-wider border-b border-[#bee9e8]">
                  <tr>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Company</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Phone</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#bee9e8]/50">
                  {filteredLeads.map((lead, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors text-[#1b4965] font-medium">
                      <td className="px-6 py-4 text-[#1b4965]/70">{(lead.Timestamp || lead["Date Captured"] || lead.Date || lead.time || "—").split(",")[0]}</td>
                      <td className="px-6 py-4 font-bold">{lead.Name || lead.name || "Unknown"}</td>
                      <td className="px-6 py-4">{lead.Company || lead.company || "—"}</td>
                      <td className="px-6 py-4 text-[#5fa8d3]">{lead.Email || lead.email || "—"}</td>
                      <td className="px-6 py-4">{lead.Phone || lead.phone || "—"}</td>
                      <td className="px-6 py-4 text-right">
                        <a href={`mailto:${lead.Email || lead.email}`} className="text-xs font-bold text-white bg-[#1b4965] px-3 py-1.5 rounded-lg hover:bg-[#5fa8d3] transition-colors">Email</a>
                      </td>
                    </tr>
                  ))}
                  {filteredLeads.length === 0 && (
                    <tr><td colSpan={6} className="px-6 py-12 text-center text-[#1b4965]/50 font-medium">No leads match your filter criteria.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
