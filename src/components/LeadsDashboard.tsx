"use client";

import { useState, useEffect } from "react";
import { Users, Building2, Phone, Mail, Globe, Calendar, Loader2, Download, TrendingUp, BarChart3, Database } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { format, parse, isValid } from 'date-fns';

export default function LeadsDashboard({ companySlug }: { companySlug: string }) {
  const [leads, setLeads] = useState<any[]>([]);
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    async function fetchLeads() {
      try {
        const response = await fetch(`/api/get-leads?companySlug=${companySlug}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch leads");
        }
        
        setLeads(data.leads || []);
        setCompanyName(data.companyName || companySlug);
        setError(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchLeads();
    
    // Auto-refresh every 10 seconds for real-time updates
    interval = setInterval(fetchLeads, 10000);
    return () => clearInterval(interval);
  }, [companySlug]);

  // Aggregate data for the chart
  const getChartData = () => {
    const countsByDate: Record<string, number> = {};
    
    leads.forEach(lead => {
      let dateStr = "Unknown";
      if (lead["Date Captured"]) {
        try {
          // Attempt to parse standard date strings or just take the first part
          dateStr = lead["Date Captured"].split(',')[0].trim();
        } catch(e) {}
      }
      countsByDate[dateStr] = (countsByDate[dateStr] || 0) + 1;
    });

    return Object.entries(countsByDate)
      .map(([date, count]) => ({ date, count }))
      .slice(0, 7) // Last 7 days/entries
      .reverse();
  };

  const exportToCSV = () => {
    if (leads.length === 0) return;
    
    const headers = Object.keys(leads[0]);
    const csvContent = [
      headers.join(","),
      ...leads.map(row => headers.map(header => `"${row[header] || ''}"`).join(","))
    ].join("\\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${companySlug}-leads-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center text-purple-950 gap-4">
        <div className="w-16 h-16 rounded-3xl bg-purple-50 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-fuchsia-600 animate-spin" />
        </div>
        <h2 className="text-xl font-bold">Syncing with Google Sheets...</h2>
      </div>
    );
  }

  if (error) {
    const isAuthError = error.includes("Unauthorized") || error.includes("authenticated");
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6 text-purple-950 font-sans">
        <div className="max-w-md w-full bg-red-50 border border-red-200 p-8 rounded-3xl text-center shadow-xl shadow-red-900/5">
          <Database className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-950 mb-3">{isAuthError ? "Access Denied" : "Connection Error"}</h2>
          <p className="text-red-700 font-medium mb-8">{error}</p>
          
          {isAuthError && (
            <a 
              href="/api/auth/google" 
              className="w-full h-12 bg-white border-2 border-red-200 text-red-700 hover:bg-red-100 rounded-xl font-bold shadow-sm flex items-center justify-center gap-3 transition-all"
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
              Sign in as Admin
            </a>
          )}
        </div>
      </div>
    );
  }

  const chartData = getChartData();
  const leadsToday = chartData.length > 0 ? chartData[chartData.length - 1].count : 0;

  return (
    <div className="min-h-screen bg-purple-50/30 p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2 text-fuchsia-600 font-bold">
              <BarChart3 className="w-5 h-5" /> Analytics Dashboard
            </div>
            <h1 className="text-4xl font-bold text-purple-950 tracking-tight">
              {companyName} <span className="text-purple-300">Leads</span>
            </h1>
          </div>
          <button 
            onClick={exportToCSV}
            className="h-12 px-6 bg-white border border-purple-200 text-purple-700 rounded-xl font-bold shadow-sm hover:shadow-md hover:border-purple-300 transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-purple-100 shadow-xl shadow-purple-900/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10"><Users className="w-16 h-16 text-fuchsia-600" /></div>
            <h3 className="text-sm font-bold text-purple-500 uppercase tracking-wider mb-2">Total Leads</h3>
            <p className="text-5xl font-black text-purple-950">{leads.length}</p>
          </div>
          
          <div className="bg-gradient-to-br from-fuchsia-600 to-purple-600 p-6 rounded-3xl shadow-xl shadow-purple-900/10 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-20"><TrendingUp className="w-16 h-16 text-white" /></div>
            <h3 className="text-sm font-bold text-fuchsia-200 uppercase tracking-wider mb-2">Leads Today</h3>
            <p className="text-5xl font-black text-white">{leadsToday}</p>
          </div>
          
          <div className="bg-white p-6 rounded-3xl border border-purple-100 shadow-xl shadow-purple-900/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10"><Database className="w-16 h-16 text-purple-600" /></div>
            <h3 className="text-sm font-bold text-purple-500 uppercase tracking-wider mb-2">Data Source</h3>
            <p className="text-xl font-bold text-purple-950 mt-2 flex items-center gap-2">
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" /> Google Sheets
            </p>
            <p className="text-xs text-purple-400 mt-2 font-mono">Live Sync Active</p>
          </div>
        </div>

        {/* Chart & Data Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Chart */}
          <div className="lg:col-span-1 bg-white rounded-3xl border border-purple-100 shadow-xl shadow-purple-900/5 p-6 flex flex-col">
            <h3 className="text-lg font-bold text-purple-950 mb-6">Capture Velocity</h3>
            <div className="flex-1 min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3e8ff" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#9333ea', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#9333ea', fontSize: 12}} allowDecimals={false} />
                  <Tooltip 
                    cursor={{fill: '#faf5ff'}}
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(88, 28, 135, 0.1)'}}
                  />
                  <Bar dataKey="count" fill="#d946ef" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Table */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-purple-100 shadow-xl shadow-purple-900/5 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-purple-50 flex items-center justify-between">
              <h3 className="text-lg font-bold text-purple-950">Recent Captures</h3>
              <div className="text-sm font-medium text-fuchsia-600 bg-fuchsia-50 px-3 py-1 rounded-full">
                {leads.length} Records
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-purple-50/50 text-purple-600 text-xs uppercase tracking-wider">
                    <th className="p-4 font-bold border-b border-purple-100">Contact Name</th>
                    <th className="p-4 font-bold border-b border-purple-100">Company</th>
                    <th className="p-4 font-bold border-b border-purple-100">Email</th>
                    <th className="p-4 font-bold border-b border-purple-100">Date</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-purple-950 divide-y divide-purple-50">
                  {leads.map((lead, idx) => (
                    <tr key={idx} className="hover:bg-purple-50/30 transition-colors">
                      <td className="p-4 font-medium flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-fuchsia-100 to-purple-100 flex items-center justify-center text-fuchsia-700 font-bold">
                          {lead["Name"]?.charAt(0) || "?"}
                        </div>
                        {lead["Name"] || "Unknown"}
                      </td>
                      <td className="p-4 text-purple-600">
                        {lead["Company"] ? (
                          <span className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" /> {lead["Company"]}</span>
                        ) : "-"}
                      </td>
                      <td className="p-4">
                        {lead["Email"] ? (
                          <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-purple-400" /> {lead["Email"]}</span>
                        ) : "-"}
                      </td>
                      <td className="p-4 text-purple-400 text-xs">
                        {lead["Date Captured"]?.split(',')[0] || "-"}
                      </td>
                    </tr>
                  ))}
                  {leads.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-purple-400">
                        No leads captured yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
