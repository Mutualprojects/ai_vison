"use client";

import { useState, useEffect } from "react";
import { Link, Loader2, Database, Users, Download, ShieldCheck, Zap, Mail, Phone, Building2, MapPin, ScanLine, Clock } from "lucide-react";

interface Lead {
  [key: string]: string;
}

export default function AdminLeadsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [companyName, setCompanyName] = useState("");
  const [slug, setSlug] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // 1. Check if authenticated
    fetch('/api/auth/google/check')
      .then(res => res.json())
      .then(data => {
        setIsAuthenticated(data.authenticated);
        if (data.authenticated) {
          fetchLeads();
        } else {
          setLoading(false);
        }
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
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch leads");
      }

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
    if (leads.length === 0) return;
    const headers = Object.keys(leads[0]);
    const csvRows = [headers.join(",")];
    
    for (const lead of leads) {
      const values = headers.map(header => {
        const val = (lead[header] || "").replace(/"/g, '""');
        return `"${val}"`;
      });
      csvRows.push(values.join(","));
    }

    const blob = new Blob([csvRows.join("\n")], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `${companyName}-leads.csv`);
    a.click();
  };

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
        <p className="text-[#1b4965]/70 text-center max-w-md mb-8">
          You must be signed in with your Google account to view this dashboard and access your CRM data.
        </p>
        <button
          onClick={() => window.location.href = "/api/auth/google"}
          className="px-8 py-3 rounded-xl bg-[#1b4965] text-white font-bold hover:bg-[#1b4965]/90 transition-all shadow-lg flex items-center gap-3"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
          Sign in with Google
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-[#1b4965] p-6">
        <div className="bg-white p-8 rounded-3xl border border-red-200 shadow-xl max-w-lg text-center">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Zap className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold mb-4 text-slate-900">Dashboard Unavailable</h2>
          <p className="text-slate-600 mb-8 leading-relaxed">{error}</p>
          <a href="/admin" className="inline-block px-6 py-3 bg-[#1b4965] text-white rounded-xl font-bold hover:bg-[#1b4965]/90 transition-all">
            Go to Setup
          </a>
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
            <button
              onClick={downloadCSV}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#1b4965] text-white font-bold text-sm rounded-lg hover:bg-[#1b4965]/90 transition-all shadow-md"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-12">
        {/* Analytics Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-2xl p-6 border border-[#bee9e8] shadow-sm flex items-center gap-5">
            <div className="w-14 h-14 rounded-full bg-[#cae9ff]/60 flex items-center justify-center">
              <Users className="w-7 h-7 text-[#5fa8d3]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#1b4965]/60 mb-1 uppercase tracking-wider">Total Leads</p>
              <p className="text-4xl font-black text-[#1b4965]">{leads.length}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-[#bee9e8] shadow-sm flex items-center gap-5">
            <div className="w-14 h-14 rounded-full bg-[#bee9e8]/60 flex items-center justify-center">
              <Database className="w-7 h-7 text-[#62b6cb]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#1b4965]/60 mb-1 uppercase tracking-wider">Live Sync Status</p>
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <p className="text-lg font-bold text-emerald-600">Connected</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-[#bee9e8] shadow-sm flex items-center gap-5">
            <div className="w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center">
              <Zap className="w-7 h-7 text-indigo-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#1b4965]/60 mb-1 uppercase tracking-wider">Last Capture</p>
              <p className="text-lg font-bold text-[#1b4965]">
                {leads.length > 0 ? (leads[0].Timestamp || leads[0].Date || "Recently") : "No data yet"}
              </p>
            </div>
          </div>
        </div>

        {/* Lead Feed */}
        <h2 className="text-2xl font-black mb-6 text-[#1b4965] flex items-center gap-3">
          <Database className="w-6 h-6 text-[#5fa8d3]" />
          Raw Captured Data
        </h2>

        {leads.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#bee9e8] p-16 text-center shadow-sm">
            <div className="w-20 h-20 bg-[#cae9ff]/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <ScanLine className="w-10 h-10 text-[#5fa8d3]" />
            </div>
            <h3 className="text-2xl font-bold mb-3">No Leads Yet</h3>
            <p className="text-[#1b4965]/70 max-w-md mx-auto mb-8">
              Open your scanner app and capture your first business card. It will appear here instantly.
            </p>
            {slug && (
              <a href={`/scan/${slug}`} target="_blank" rel="noreferrer" className="inline-flex px-8 py-4 rounded-xl bg-[#1b4965] text-white font-bold hover:bg-[#1b4965]/90 transition-all shadow-lg">
                Open Scanner App
              </a>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {leads.map((lead, i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#bee9e8] overflow-hidden shadow-sm hover:shadow-md transition-shadow group relative">
                {/* Header Strip */}
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
                  {/* Timestamp Badge */}
                  {(lead.Timestamp || lead.Date || lead.time) && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-[#bee9e8] rounded-full text-[10px] font-bold text-[#1b4965]/60 shadow-sm">
                      <Clock className="w-3 h-3 text-[#5fa8d3]" />
                      {lead.Timestamp || lead.Date || lead.time}
                    </div>
                  )}
                </div>

                {/* Body Fields */}
                <div className="p-5 space-y-4">
                  {/* Company */}
                  <div className="flex items-start gap-3">
                    <Building2 className="w-4 h-4 text-[#62b6cb] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] font-bold text-[#1b4965]/50 uppercase tracking-widest mb-0.5">Company</p>
                      <p className="text-sm font-semibold text-[#1b4965]">{lead.Company || lead.company || "—"}</p>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-start gap-3">
                    <Mail className="w-4 h-4 text-[#62b6cb] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] font-bold text-[#1b4965]/50 uppercase tracking-widest mb-0.5">Email</p>
                      <p className="text-sm font-semibold text-[#1b4965] truncate">{lead.Email || lead.email || "—"}</p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-start gap-3">
                    <Phone className="w-4 h-4 text-[#62b6cb] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] font-bold text-[#1b4965]/50 uppercase tracking-widest mb-0.5">Phone</p>
                      <p className="text-sm font-semibold text-[#1b4965]">{lead.Phone || lead.phone || "—"}</p>
                    </div>
                  </div>
                </div>

                {/* Footer Expand - Raw View for other fields */}
                <div className="bg-slate-50 border-t border-[#bee9e8] px-5 py-3">
                  <div className="flex flex-wrap gap-2">
                    {Object.keys(lead)
                      .filter(k => !["Name", "name", "Title", "title", "Company", "company", "Email", "email", "Phone", "phone", "Timestamp", "Date", "time"].includes(k))
                      .map(k => {
                        if (!lead[k]) return null;
                        return (
                          <div key={k} className="inline-flex flex-col bg-white border border-slate-200 rounded-md px-2 py-1 text-xs">
                            <span className="text-[9px] font-bold text-slate-400 uppercase">{k}</span>
                            <span className="font-medium text-slate-700 truncate max-w-[120px]">{lead[k]}</span>
                          </div>
                        );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
