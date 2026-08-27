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
import { BarChart3, PieChart as PieIcon, Building2, Tag, Layers, CheckCircle2, Clock, ShieldCheck } from "lucide-react";

/**
 * Modern Minimalist AdminAnalyticsView Component
 * 
 * Premium Monochrome + Signature Orange (#FF6B00) Accent
 */
export default function AdminAnalyticsView({ complaints = [] }) {
  // Category Definitions
  const CATEGORY_DEFINITIONS = [
    { key: "pothole", label: "Pothole", color: "#FF6B00" },       // Signature Orange
    { key: "garbage", label: "Garbage", color: "#111111" },       // Deep Black
    { key: "streetlight", label: "Streetlight", color: "#FF9E4D" }, // Warm Accent
    { key: "water", label: "Water Leak", color: "#6B6B6B" },      // Medium Grey
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

  // Status Definitions
  const STATUS_DEFINITIONS = [
    { name: "Pending", color: "#6B6B6B" },               // Medium Grey
    { name: "In Progress", color: "#FF6B00" },           // Signature Orange
    { name: "Pending Verification", color: "#111111" },   // Deep Black
    { name: "Resolved", color: "#10B981" },              // Green
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
  const resolutionRate = totalComplaintsCount > 0
    ? ((complaints.filter(c => c.status === "Resolved").length / totalComplaintsCount) * 100).toFixed(0)
    : 0;

  // Department Workload Definitions
  const DEPARTMENT_LIST = [
    { name: "Public Works", color: "#FF6B00" },
    { name: "Sanitation", color: "#111111" },
    { name: "Electrical", color: "#FF9E4D" },
    { name: "Water Supply", color: "#6B6B6B" },
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

  // Modern Clean Tooltip Component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const dataItem = payload[0];
      return (
        <div className="bg-white p-3 rounded-xl shadow-lg border border-[#E5E5E5] text-xs">
          <p className="font-extrabold text-[#111111]">{label || dataItem.name}</p>
          <p className="text-[#6B6B6B] mt-0.5">
            Total Issues: <span className="font-bold text-[#111111]">{dataItem.value}</span>
            {totalComplaintsCount > 0 && dataItem.value !== undefined && (
              <span className="text-[#6B6B6B] ml-1">
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
    <div className="space-y-6">
      
      {/* Top SaaS Insights Card */}
      <div className="bg-white rounded-2xl p-6 border border-[#E5E5E5] shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FFF1E6] text-[#FF6B00] border border-[#FF6B00]/30">
                <Layers className="w-3.5 h-3.5" /> Municipal Operational Insights
              </span>
            </div>
            <h3 className="text-lg font-extrabold text-[#111111]">Executive Analytics & Workload Balance</h3>
            <p className="text-xs text-[#6B6B6B] mt-1 max-w-2xl">
              Real-time aggregation of {totalComplaintsCount} municipal reports across city sectors, category classifications, and operational status lifecycles.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-[#F5F5F5] p-2.5 rounded-xl border border-[#E5E5E5] self-start md:self-auto">
            <div className="text-center px-3">
              <p className="text-[10px] text-[#6B6B6B] font-bold uppercase">Total Issues</p>
              <p className="text-base font-extrabold text-[#111111]">{totalComplaintsCount}</p>
            </div>
            <div className="h-6 w-px bg-[#E5E5E5]"></div>
            <div className="text-center px-3">
              <p className="text-[10px] text-[#6B6B6B] font-bold uppercase">Resolution Rate</p>
              <p className="text-base font-extrabold text-[#111111]">{resolutionRate}%</p>
            </div>
            <div className="h-6 w-px bg-[#E5E5E5]"></div>
            <div className="text-center px-3">
              <p className="text-[10px] text-[#6B6B6B] font-bold uppercase">Active Depts</p>
              <p className="text-base font-extrabold text-[#FF6B00]">{DEPARTMENT_LIST.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid for Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* CHART 1: Category Distribution Bar Chart */}
        <div className="bg-white p-6 rounded-2xl border border-[#E5E5E5] shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#FFF1E6] text-[#FF6B00] flex items-center justify-center border border-[#FF6B00]/20">
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-[#111111]">Complaints by Category</h4>
                  <p className="text-[11px] text-[#6B6B6B]">Distribution across municipal issue types</p>
                </div>
              </div>
            </div>

            <div className="h-64 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={categoryChartData}
                  margin={{ top: 15, right: 15, left: -15, bottom: 15 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F5F5F5" />
                  <XAxis
                    dataKey="category"
                    tick={{ fill: "#6B6B6B", fontSize: 11, fontWeight: 600 }}
                    axisLine={{ stroke: "#E5E5E5" }}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fill: "#6B6B6B", fontSize: 11 }}
                    axisLine={{ stroke: "#E5E5E5" }}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="count"
                    name="Complaints"
                    radius={[6, 6, 0, 0]}
                    barSize={36}
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Mini Category Chips */}
          <div className="pt-3 border-t border-[#E5E5E5] grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {categoryChartData.map((cat) => (
              <div key={cat.category} className="bg-[#F5F5F5] p-2 rounded-xl border border-[#E5E5E5] flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-bold text-[#111111] text-[11px]">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.fill }}></span>
                  {cat.category}
                </span>
                <span className="font-extrabold text-[#111111] text-xs">{cat.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CHART 2: Status Breakdown Donut Chart */}
        <div className="bg-white p-6 rounded-2xl border border-[#E5E5E5] shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#111111] text-white flex items-center justify-center">
                  <PieIcon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-[#111111]">Complaints by Status</h4>
                  <p className="text-[11px] text-[#6B6B6B]">Proportion of Pending, In Progress, and Resolved</p>
                </div>
              </div>
            </div>

            <div className="h-64 w-full mt-4 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
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
                    height={32}
                    iconType="circle"
                    formatter={(value) => <span className="text-[11px] font-bold text-[#111111] px-1">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Donut Center Number */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                <span className="text-xl font-extrabold text-[#111111]">{totalComplaintsCount}</span>
                <span className="text-[9px] uppercase font-bold text-[#6B6B6B] tracking-wider">Total</span>
              </div>
            </div>
          </div>

          {/* Status Breakdown Legend Detail */}
          <div className="pt-3 border-t border-[#E5E5E5] grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="bg-[#F5F5F5] p-2 rounded-xl border border-[#E5E5E5]">
              <span className="text-[10px] text-[#6B6B6B] font-bold block">Pending</span>
              <p className="text-base font-extrabold text-[#111111]">
                {statusChartData.find(s => s.name === "Pending")?.value || 0}
              </p>
            </div>

            <div className="bg-[#FFF1E6] p-2 rounded-xl border border-[#FF6B00]/30">
              <span className="text-[10px] text-[#FF6B00] font-bold block">In Progress</span>
              <p className="text-base font-extrabold text-[#111111]">
                {statusChartData.find(s => s.name === "In Progress")?.value || 0}
              </p>
            </div>

            <div className="bg-[#111111] p-2 rounded-xl text-white">
              <span className="text-[10px] text-[#E5E5E5] font-bold block">Verification</span>
              <p className="text-base font-extrabold text-white">
                {statusChartData.find(s => s.name === "Pending Verification")?.value || 0}
              </p>
            </div>

            <div className="bg-[#F5F5F5] p-2 rounded-xl border border-[#E5E5E5]">
              <span className="text-[10px] text-[#6B6B6B] font-bold block">Resolved</span>
              <p className="text-base font-extrabold text-[#111111]">
                {statusChartData.find(s => s.name === "Resolved")?.value || 0}
              </p>
            </div>
          </div>
        </div>

        {/* CHART 3: Department Workload Bar Chart */}
        <div className="bg-white p-6 rounded-2xl border border-[#E5E5E5] shadow-2xs lg:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#F5F5F5] text-[#111111] flex items-center justify-center border border-[#E5E5E5]">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-[#111111]">Department Workload Distribution</h4>
                <p className="text-[11px] text-[#6B6B6B]">Active municipal task assignments and department capacities</p>
              </div>
            </div>
          </div>

          <div className="h-64 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={departmentChartData}
                margin={{ top: 15, right: 20, left: -10, bottom: 15 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F5F5F5" />
                <XAxis
                  dataKey="department"
                  tick={{ fill: "#6B6B6B", fontSize: 11, fontWeight: 600 }}
                  axisLine={{ stroke: "#E5E5E5" }}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: "#6B6B6B", fontSize: 11 }}
                  axisLine={{ stroke: "#E5E5E5" }}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="count"
                  name="Assigned Complaints"
                  radius={[6, 6, 0, 0]}
                  barSize={40}
                >
                  {departmentChartData.map((entry, index) => (
                    <Cell key={`dept-cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Department Breakdown Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 pt-3 border-t border-[#E5E5E5]">
            {departmentChartData.map((dept) => (
              <div key={dept.department} className="bg-[#F5F5F5] p-2.5 rounded-xl border border-[#E5E5E5] flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-[#111111] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: dept.fill }}></span>
                    {dept.department}
                  </p>
                  <p className="text-[10px] text-[#6B6B6B]">Assigned Tasks</p>
                </div>
                <span className="text-base font-extrabold text-[#111111]">{dept.count}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
