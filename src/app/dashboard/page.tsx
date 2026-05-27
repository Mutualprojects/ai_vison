"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Building2,
  CheckCircle2,
  AlertCircle,
  PackageX,
  LayoutDashboard,
  Search,
  Filter,
} from "lucide-react";

const API_URL = "https://sheetdb.io/api/v1/tjm8beokmj84z";

const COLORS = ["#10b981", "#f59e0b", "#ef4444", "#3b82f6", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"];

interface SolarData {
  "S. No.": string;
  District: string;
  "KGBV Name": string;
  ADDRESS: string;
  "PIN CODE": string;
  "NAME OF THE PRINCIPAL": string;
  "CONTACT NUMBER": string;
  "No OF Systems ": string;
  "Phase -1 -200 Nos ": string;
  Tanks: string;
  "Collectors ": string;
  "MMS ": string;
  "Plumbing ": string;
  "System Installation Status": string;
  "Commissioning Date ": string;
  Status: string;
  "Remarks ": string;
}

export default function SolarDashboard() {
  const [data, setData] = useState<SolarData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(API_URL);
        const result = await response.json();
        // Filter out empty rows or header row re-declarations
        const validData = result.filter(
          (item: SolarData) =>
            item.District &&
            item.District !== "District" &&
            item.District.trim() !== ""
        );
        setData(validData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>
          <p className="text-lg font-medium text-slate-600">Loading Dashboard Data...</p>
        </div>
      </div>
    );
  }

  // --- Data Processing ---
  const filteredData = data.filter((item) =>
    item["KGBV Name"].toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.District.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalSites = data.length;
  
  let installedCount = 0;
  let materialPendingCount = 0;
  let installationPendingCount = 0;
  let otherStatusCount = 0;

  const districtCountMap: Record<string, number> = {};
  const statusCountMap: Record<string, number> = {};

  data.forEach((item) => {
    // Standardize status for better grouping
    const rawStatus = (item.Status || "").trim();
    let standardizedStatus = "Unknown";
    
    if (rawStatus.toLowerCase().includes("system installed") || item["System Installation Status"] === "1") {
      standardizedStatus = "Installed";
      installedCount++;
    } else if (rawStatus.toLowerCase().includes("material pending") || rawStatus === "") {
      standardizedStatus = "Material Pending";
      materialPendingCount++;
    } else if (rawStatus.toLowerCase().includes("installation pending")) {
      standardizedStatus = "Installation Pending";
      installationPendingCount++;
    } else {
      standardizedStatus = rawStatus || "Other";
      otherStatusCount++;
    }

    // Pie chart data
    statusCountMap[standardizedStatus] = (statusCountMap[standardizedStatus] || 0) + 1;

    // Bar chart data (by District)
    const district = item.District.trim().toUpperCase();
    if (district) {
      districtCountMap[district] = (districtCountMap[district] || 0) + 1;
    }
  });

  const districtChartData = Object.entries(districtCountMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  const statusChartData = Object.entries(statusCountMap).map(([name, value]) => ({
    name,
    value,
  }));

  // --- Components ---
  const StatCard = ({ title, value, icon, subtitle, colorClass }: any) => (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold tracking-wider text-slate-500 uppercase">{title}</p>
          <h3 className="mt-2 text-3xl font-bold text-slate-800">{value}</h3>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        </div>
        <div className={`rounded-xl p-3 ${colorClass}`}>{icon}</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/50 pb-12 font-sans text-slate-800">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 px-8 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
              <LayoutDashboard className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">Solar Project Dashboard</h1>
              <p className="text-xs font-medium text-slate-500">Live API Integration</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search district or KGBV..."
                className="w-64 rounded-full border border-slate-300 bg-slate-50 py-2 pl-9 pr-4 text-sm outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-8 pt-8">
        {/* KPI Cards */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total KGBV Sites"
            value={totalSites}
            subtitle="Registered in database"
            icon={<Building2 className="h-6 w-6" />}
            colorClass="bg-blue-100 text-blue-600"
          />
          <StatCard
            title="Systems Installed"
            value={installedCount}
            subtitle={`${Math.round((installedCount / totalSites) * 100) || 0}% completion`}
            icon={<CheckCircle2 className="h-6 w-6" />}
            colorClass="bg-emerald-100 text-emerald-600"
          />
          <StatCard
            title="Material Pending"
            value={materialPendingCount}
            subtitle="Awaiting delivery"
            icon={<PackageX className="h-6 w-6" />}
            colorClass="bg-amber-100 text-amber-600"
          />
          <StatCard
            title="Installation Pending"
            value={installationPendingCount}
            subtitle="Materials delivered, pending setup"
            icon={<AlertCircle className="h-6 w-6" />}
            colorClass="bg-purple-100 text-purple-600"
          />
        </div>

        {/* Charts Row */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Bar Chart */}
          <div className="col-span-1 lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-6 text-lg font-bold text-slate-800">Installations by District</h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={districtChartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 40 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fill: '#64748b' }} 
                    angle={-45} 
                    textAnchor="end"
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#64748b' }}
                  />
                  <Tooltip
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={50}>
                    {districtChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart */}
          <div className="col-span-1 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-6 text-lg font-bold text-slate-800">Overall Status</h3>
            <div className="h-80 w-full flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="45%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={
                          entry.name === "Installed" ? "#10b981" : 
                          entry.name === "Material Pending" ? "#f59e0b" : 
                          entry.name === "Installation Pending" ? "#8b5cf6" : 
                          "#94a3b8"
                        } 
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-200 bg-slate-50/80 px-6 py-4 flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-800">Site Directory</h3>
            <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
              <Filter className="h-4 w-4" />
              Showing {filteredData.length} entries
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="border-b border-slate-200 bg-white text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-4">S.No</th>
                  <th className="px-6 py-4">District</th>
                  <th className="px-6 py-4">KGBV Name</th>
                  <th className="px-6 py-4">Principal</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Hardware (T/C/M)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredData.slice(0, 50).map((row, i) => {
                  const rawStatus = (row.Status || "").trim();
                  let statusBadge = "bg-slate-100 text-slate-600";
                  
                  if (rawStatus.toLowerCase().includes("system installed") || row["System Installation Status"] === "1") {
                    statusBadge = "bg-emerald-100 text-emerald-700";
                  } else if (rawStatus.toLowerCase().includes("material pending") || rawStatus === "") {
                    statusBadge = "bg-amber-100 text-amber-700";
                  } else if (rawStatus.toLowerCase().includes("installation pending")) {
                    statusBadge = "bg-purple-100 text-purple-700";
                  }

                  return (
                    <tr key={i} className="transition-colors hover:bg-slate-50/80">
                      <td className="px-6 py-4 font-medium">{row["S. No."]}</td>
                      <td className="px-6 py-4 font-semibold text-slate-800">{row.District}</td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-blue-600">{row["KGBV Name"]}</div>
                        <div className="text-xs text-slate-400 max-w-[200px] truncate">{row.ADDRESS}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div>{row["NAME OF THE PRINCIPAL"] || "-"}</div>
                        <div className="text-xs text-slate-400">{row["CONTACT NUMBER"]}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusBadge}`}>
                          {rawStatus || "Unknown"}
                        </span>
                        {row["Remarks "] && <div className="mt-1 text-xs text-slate-400 max-w-[150px] truncate" title={row["Remarks "]}>{row["Remarks "]}</div>}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2 text-xs font-medium">
                          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-100 text-slate-600 tooltip" title="Tanks">
                            {row.Tanks || "0"}
                          </span>
                          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-100 text-slate-600 tooltip" title="Collectors">
                            {row["Collectors "] || "0"}
                          </span>
                          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-100 text-slate-600 tooltip" title="MMS">
                            {row["MMS "] || "0"}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredData.length > 50 && (
              <div className="bg-slate-50 py-3 text-center text-sm font-medium text-slate-500 border-t border-slate-100">
                Showing top 50 results. Use search to find more.
              </div>
            )}
            {filteredData.length === 0 && (
              <div className="py-12 text-center text-slate-500">
                No matching records found.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
