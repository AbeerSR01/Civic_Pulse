import React from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { BarChart3, PieChart as PieIcon, Building2, Tag, Layers, CheckCircle2, Clock } from "lucide-react";

/**
 * AdminAnalyticsView Component
 * 
 * Computes analytics dynamically from the shared complaints array:
 * 1. Category Bar Chart: Pothole, Garbage, Streetlight, Water Leakage
 * 2. Status Pie Chart: Pending, In Progress, Resolved
 * 3. Department Workload Bar Chart: Public Works, Sanitation, Electrical, Water Supply
 */
export default function AdminAnalyticsView({ complaints = [] }) {
  // 1. DATA TRANSFORMATION: Category Distribution
  const CATEGORY_DEFINITIONS = [
    { key: "pothole", label: "Pothole", color: "#4F46E5" },       // Indigo
    { key: "garbage", label: "Garbage", color: "#F59E0B" },       // Amber
    { key: "streetlight", label: "Streetlight", color: "#0284C7" }, // Sky Blue
    { key: "water", label: "Water Leakage", color: "#0D9488" },   // Teal
  ];

  const categoryChartData = CATEGORY_DEFINITIONS.map((cat) => {
    const count = complaints.filter(
      (c) => (c.category || "").toLowerCase() === cat.key.toLowerCase()
    ).length;
    return {
      category: cat.label,
      count: count,
      fill: cat.color,
    };
  });

  // 2. DATA TRANSFORMATION: Status Distribution (Pie Chart)
  const STATUS_DEFINITIONS = [
    { name: "Pending", color: "#F59E0B" },      // Amber
    { name: "In Progress", color: "#2563EB" },  // Royal Blue
    { name: "Resolved", color: "#10B981" },     // Emerald
  ];

  const statusChartData = STATUS_DEFINITIONS.map((st) => {
    const count = complaints.filter((c) => c.status === st.name).length;
    return {
      name: st.name,
      value: count,
      color: st.color,
    };
  });

  const totalComplaintsCount = complaints.length;

  // 3. DATA TRANSFORMATION: Department Workload (Bar Chart)
  const DEPARTMENT_LIST = [
    { name: "Public Works", color: "#4338CA" },  // Deep Indigo
    { name: "Sanitation", color: "#7C3AED" },    // Purple
    { name: "Electrical", color: "#1D4ED8" },    // Blue
    { name: "Water Supply", color: "#0891B2" },  // Cyan
  ];

  const departmentChartData = DEPARTMENT_LIST.map((dept) => {
    const count = complaints.filter((c) => {
      const deptName = (c.department || "").toLowerCase();
      if (dept.name === "Water Supply") {
        return deptName.includes("water");
      }
      return deptName === dept.name.toLowerCase();
    }).length;

    return {
      department: dept.name,
      count: count,
      fill: dept.color,
    };
  });

  // Custom Tooltip Component for styled popovers
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const dataItem = payload[0];
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs border border-slate-700">
          <p className="font-semibold">{label || dataItem.name}</p>
          <p className="text-slate-300 mt-1">
            Complaints: <span className="font-bold text-white">{dataItem.value}</span>
            {totalComplaintsCount > 0 && dataItem.name && (
              <span className="text-slate-400 ml-1">
                ({((dataItem.value / totalComplaintsCount) * 100).toFixed(1)}%)
              </span>
            )}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      {/* Top Banner / Summary */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-lg border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-2">
              <Layers className="w-3.5 h-3.5" /> Live Data Insights
            </span>
            <h3 className="text-xl font-bold">Executive Analytics Overview</h3>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Real-time aggregation of {totalComplaintsCount} municipal reports across city sectors, category classifications, and operational status lifecycles.
            </p>
          </div>
          
          <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md px-4 py-3 rounded-xl border border-white/10 self-start md:self-auto">
            <div className="text-center px-2">
              <p className="text-[10px] text-slate-400 font-semibold uppercase">Total Issues</p>
              <p className="text-lg font-extrabold text-white">{totalComplaintsCount}</p>
            </div>
            <div className="h-8 w-px bg-white/10"></div>
            <div className="text-center px-2">
              <p className="text-[10px] text-slate-400 font-semibold uppercase">Categories</p>
              <p className="text-lg font-extrabold text-indigo-300">{CATEGORY_DEFINITIONS.length}</p>
            </div>
            <div className="h-8 w-px bg-white/10"></div>
            <div className="text-center px-2">
              <p className="text-[10px] text-slate-400 font-semibold uppercase">Departments</p>
              <p className="text-lg font-extrabold text-cyan-300">{DEPARTMENT_LIST.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Layout for Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* CHART 1: Category Bar Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">Complaints by Category</h4>
                  <p className="text-xs text-slate-500">Distribution across civic issue types</p>
                </div>
              </div>
            </div>

            <div className="h-72 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={categoryChartData}
                  margin={{ top: 20, right: 20, left: -10, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis
                    dataKey="category"
                    tick={{ fill: "#64748B", fontSize: 12, fontWeight: 500 }}
                    axisLine={{ stroke: "#CBD5E1" }}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fill: "#64748B", fontSize: 12 }}
                    axisLine={{ stroke: "#CBD5E1" }}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="count"
                    name="Complaints"
                    radius={[8, 8, 0, 0]}
                    barSize={40}
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Mini Category Chips Footer */}
          <div className="pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {categoryChartData.map((cat) => (
              <div key={cat.category} className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-medium text-slate-700">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.fill }}></span>
                  {cat.category}
                </span>
                <span className="font-bold text-slate-900">{cat.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CHART 2: Status Breakdown Pie Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <PieIcon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">Complaints by Status</h4>
                  <p className="text-xs text-slate-500">Proportion of Pending, In Progress, and Resolved</p>
                </div>
              </div>
            </div>

            <div className="h-72 w-full mt-4 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="value"
                    nameKey="name"
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell key={`pie-cell-${index}`} fill={entry.color} stroke="#FFFFFF" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    formatter={(value) => <span className="text-xs font-semibold text-slate-700 px-1">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Donut Center Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                <span className="text-2xl font-extrabold text-slate-900">{totalComplaintsCount}</span>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total</span>
              </div>
            </div>
          </div>

          {/* Status Breakdown Legend Detail */}
          <div className="pt-4 border-t border-slate-100 grid grid-cols-3 gap-2 text-xs">
            <div className="bg-amber-50/60 p-2.5 rounded-xl border border-amber-100">
              <div className="flex items-center gap-1 text-amber-700 font-semibold mb-0.5">
                <Clock className="w-3.5 h-3.5" /> Pending
              </div>
              <p className="text-lg font-bold text-amber-900">
                {statusChartData.find(s => s.name === "Pending")?.value || 0}
              </p>
            </div>

            <div className="bg-blue-50/60 p-2.5 rounded-xl border border-blue-100">
              <div className="flex items-center gap-1 text-blue-700 font-semibold mb-0.5">
                <Clock className="w-3.5 h-3.5 animate-pulse" /> In Progress
              </div>
              <p className="text-lg font-bold text-blue-900">
                {statusChartData.find(s => s.name === "In Progress")?.value || 0}
              </p>
            </div>

            <div className="bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100">
              <div className="flex items-center gap-1 text-emerald-700 font-semibold mb-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
              </div>
              <p className="text-lg font-bold text-emerald-900">
                {statusChartData.find(s => s.name === "Resolved")?.value || 0}
              </p>
            </div>
          </div>
        </div>

        {/* CHART 3: Department Workload Bar Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">Department Workload Distribution</h4>
                <p className="text-xs text-slate-500">Active workload load-balancing across civic authorities</p>
              </div>
            </div>
          </div>

          <div className="h-72 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={departmentChartData}
                margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis
                  dataKey="department"
                  tick={{ fill: "#64748B", fontSize: 12, fontWeight: 500 }}
                  axisLine={{ stroke: "#CBD5E1" }}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: "#64748B", fontSize: 12 }}
                  axisLine={{ stroke: "#CBD5E1" }}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="count"
                  name="Assigned Complaints"
                  radius={[8, 8, 0, 0]}
                  barSize={48}
                >
                  {departmentChartData.map((entry, index) => (
                    <Cell key={`dept-cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Department Breakdown Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-slate-100">
            {departmentChartData.map((dept) => (
              <div key={dept.department} className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: dept.fill }}></span>
                    {dept.department}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">Assigned Tasks</p>
                </div>
                <span className="text-xl font-extrabold text-slate-900">{dept.count}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
