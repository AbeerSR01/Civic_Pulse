import React, { useState } from "react";
import {
  ShieldCheck,
  Search,
  AlertCircle,
  Clock,
  CheckCircle2,
  Building2,
  MapPin,
  Map,
  Table,
  BarChart3,
  User,
  ArrowRight,
  RotateCcw,
  SlidersHorizontal,
  X
} from "lucide-react";
import { CATEGORY_LABELS } from "../utils/departmentAssigner";
import { calculatePriority, isSLAOverdue } from "../utils/priorityCalculator";
import AdminMapView from "./AdminMapView";
import AdminAnalyticsView from "./AdminAnalyticsView";

/**
 * Modern Minimalist AdminView Component
 * 
 * Premium Monochrome + Signature Orange (#FF6B00) Accent
 */
export default function AdminView({ complaints, userName, setUserName }) {
  // Input state for sign-in
  const [loginInput, setLoginInput] = useState("");

  // Admin View Mode ('table' | 'map' | 'analytics')
  const [viewMode, setViewMode] = useState("table");

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [onlyOverdue, setOnlyOverdue] = useState(false);

  // Sign-in Screen
  if (!userName) {
    const demoAdminProfiles = [
      { name: "Director S. Verma", role: "Municipal Commissioner", dept: "Urban Governance" },
      { name: "Chief Admin K. Patel", role: "City Operations Head", dept: "Central Command" },
    ];

    return (
      <div className="max-w-lg mx-auto px-4 py-16">
        <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-xs border border-[#E5E5E5] text-center space-y-6">
          <div className="w-12 h-12 bg-[#111111] text-[#FF6B00] rounded-xl flex items-center justify-center mx-auto border border-[#111111]">
            <ShieldCheck className="w-6 h-6" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-[#111111] tracking-tight">Admin Portal Sign-In</h2>
            <p className="text-xs text-[#6B6B6B] mt-1.5 leading-relaxed">
              Enter your administrator name to access citywide analytics, priority heatmaps, and municipal department oversight.
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (loginInput.trim()) {
                setUserName(loginInput.trim());
              }
            }}
            className="space-y-4 text-left"
          >
            <div>
              <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider mb-1.5">
                Administrator Name
              </label>
              <input
                type="text"
                required
                value={loginInput}
                onChange={(e) => setLoginInput(e.target.value)}
                placeholder="e.g. Director S. Verma"
                className="w-full bg-[#F5F5F5] border border-[#E5E5E5] text-[#111111] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] transition-all placeholder:text-[#6B6B6B]/60"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#111111] hover:bg-black text-white font-bold py-2.5 rounded-xl shadow-xs hover:shadow transition-all text-sm flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
            >
              <span>Continue to Admin Dashboard</span>
              <ArrowRight className="w-4 h-4 text-[#FF6B00]" />
            </button>
          </form>

          {/* Quick Demo Profiles */}
          <div className="pt-4 border-t border-[#E5E5E5] text-left">
            <p className="text-[11px] font-bold text-[#6B6B6B] uppercase tracking-wider mb-2.5">
              Or pick an administrator:
            </p>
            <div className="grid grid-cols-1 gap-2">
              {demoAdminProfiles.map((profile) => (
                <button
                  key={profile.name}
                  type="button"
                  onClick={() => setUserName(profile.name)}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-[#E5E5E5] hover:border-[#FF6B00] hover:bg-[#FFF1E6]/50 text-left transition group cursor-pointer bg-[#F5F5F5]/60"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-[#111111] text-white flex items-center justify-center font-bold text-xs">
                      {profile.name[0]}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#111111] group-hover:text-[#FF6B00] transition">
                        {profile.name}
                      </p>
                      <p className="text-[11px] text-[#6B6B6B]">{profile.role}</p>
                    </div>
                  </div>
                  <span className="text-[11px] text-[#6B6B6B] group-hover:text-[#FF6B00] font-semibold flex items-center gap-0.5">
                    Select <ArrowRight className="w-3 h-3" />
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Summary Metrics
  const totalCount = complaints.length;
  const pendingCount = complaints.filter((c) => c.status === "Pending").length;
  const inProgressCount = complaints.filter((c) => c.status === "In Progress").length;
  const pendingVerificationCount = complaints.filter((c) => c.status === "Pending Verification").length;
  const resolvedCount = complaints.filter((c) => c.status === "Resolved").length;

  // Filter complaints
  const filteredComplaints = complaints.filter((item) => {
    const matchesSearch =
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    const matchesDepartment = departmentFilter === "all" || item.department === departmentFilter;
    const matchesOverdue = !onlyOverdue || isSLAOverdue(item);

    return matchesSearch && matchesStatus && matchesCategory && matchesDepartment && matchesOverdue;
  });

  const hasActiveFilters =
    searchTerm !== "" ||
    statusFilter !== "all" ||
    categoryFilter !== "all" ||
    departmentFilter !== "all" ||
    onlyOverdue;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Header & View Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E5E5E5]">
        <div>
          <h2 className="text-2xl font-extrabold text-[#111111] tracking-tight flex items-center gap-2">
            <span>City Administration Dashboard</span>
          </h2>
          <p className="text-xs text-[#6B6B6B] mt-1">
            Real-time analytics, geospatial priority heatmap (Ranchi), SLA breach tracking, and sector performance.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Admin User Chip */}
          <div className="flex items-center justify-between gap-2.5 bg-white px-3.5 py-2 rounded-xl border border-[#E5E5E5] shadow-2xs">
            <div className="w-6 h-6 rounded-lg bg-[#111111] text-white flex items-center justify-center font-bold text-xs">
              {userName[0]}
            </div>
            <span className="text-xs text-[#6B6B6B]">
              Admin: <strong className="text-[#111111] font-bold">{userName}</strong>
            </span>
            <button
              onClick={() => {
                setUserName("");
                setLoginInput("");
              }}
              className="text-[11px] font-bold text-[#111111] hover:text-[#FF6B00] bg-[#F5F5F5] hover:bg-[#FFF1E6] px-2 py-0.5 rounded-md border border-[#E5E5E5] transition cursor-pointer"
            >
              Switch
            </button>
          </div>

          {/* Segmented View Switcher */}
          <div className="bg-[#F5F5F5] p-1 rounded-xl flex items-center gap-1 border border-[#E5E5E5]">
            <button
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                viewMode === "table"
                  ? "bg-white text-[#111111] shadow-2xs border border-[#E5E5E5]"
                  : "text-[#6B6B6B] hover:text-[#111111]"
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>

            <button
              onClick={() => setViewMode("map")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                viewMode === "map"
                  ? "bg-white text-[#111111] shadow-2xs border border-[#E5E5E5]"
                  : "text-[#6B6B6B] hover:text-[#111111]"
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              <span>Map & Heatmap</span>
            </button>

            <button
              onClick={() => setViewMode("analytics")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                viewMode === "analytics"
                  ? "bg-white text-[#111111] shadow-2xs border border-[#E5E5E5]"
                  : "text-[#6B6B6B] hover:text-[#111111]"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Analytics</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5 EXECUTIVE KPI METRIC CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        
        {/* 1. Total Reported */}
        <div className="bg-white p-4 rounded-2xl border border-[#E5E5E5] shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-[#6B6B6B] uppercase tracking-wider">Total Reports</p>
            <h3 className="text-xl font-extrabold text-[#111111] mt-0.5">{totalCount}</h3>
          </div>
          <div className="w-9 h-9 bg-[#F5F5F5] text-[#111111] rounded-xl flex items-center justify-center border border-[#E5E5E5]">
            <AlertCircle className="w-4 h-4" />
          </div>
        </div>

        {/* 2. Pending */}
        <div className="bg-white p-4 rounded-2xl border border-[#E5E5E5] shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-[#6B6B6B] uppercase tracking-wider">Pending</p>
            <h3 className="text-xl font-extrabold text-[#111111] mt-0.5">{pendingCount}</h3>
          </div>
          <div className="w-9 h-9 bg-[#F5F5F5] text-[#6B6B6B] rounded-xl flex items-center justify-center border border-[#E5E5E5]">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        {/* 3. In Progress */}
        <div className="bg-white p-4 rounded-2xl border border-[#FF6B00]/30 shadow-2xs flex items-center justify-between bg-gradient-to-b from-[#FFF1E6]/20 to-white">
          <div>
            <p className="text-[11px] font-bold text-[#FF6B00] uppercase tracking-wider">In Progress</p>
            <h3 className="text-xl font-extrabold text-[#111111] mt-0.5">{inProgressCount}</h3>
          </div>
          <div className="w-9 h-9 bg-[#FFF1E6] text-[#FF6B00] rounded-xl flex items-center justify-center border border-[#FF6B00]/20">
            <Clock className="w-4 h-4 animate-spin" />
          </div>
        </div>

        {/* 4. Pending Verification */}
        <div className="bg-white p-4 rounded-2xl border border-[#E5E5E5] shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-[#6B6B6B] uppercase tracking-wider">Verification</p>
            <h3 className="text-xl font-extrabold text-[#111111] mt-0.5">{pendingVerificationCount}</h3>
          </div>
          <div className="w-9 h-9 bg-[#111111] text-white rounded-xl flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-[#FF6B00] animate-pulse" />
          </div>
        </div>

        {/* 5. Resolved */}
        <div className="bg-white p-4 rounded-2xl border border-[#E5E5E5] shadow-2xs flex items-center justify-between col-span-2 sm:col-span-1">
          <div>
            <p className="text-[11px] font-bold text-[#6B6B6B] uppercase tracking-wider">Resolved</p>
            <h3 className="text-xl font-extrabold text-[#111111] mt-0.5">{resolvedCount}</h3>
          </div>
          <div className="w-9 h-9 bg-[#F5F5F5] text-[#111111] rounded-xl flex items-center justify-center border border-[#E5E5E5]">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

      </div>

      {/* VIEW MODE CONTAINER */}
      {viewMode === "map" ? (
        <AdminMapView complaints={complaints} />
      ) : viewMode === "analytics" ? (
        <AdminAnalyticsView complaints={complaints} />
      ) : (
        <div className="space-y-4">
          
          {/* MULTI-FILTER SEARCH BAR */}
          <div className="bg-white p-4 rounded-2xl border border-[#E5E5E5] shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#111111] font-bold text-xs">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#FF6B00]" />
                <span>Filter & Search Master Directory ({filteredComplaints.length} results)</span>
              </div>

              {hasActiveFilters && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                    setCategoryFilter("all");
                    setDepartmentFilter("all");
                    setOnlyOverdue(false);
                  }}
                  className="text-xs text-[#FF6B00] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Filters</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
              {/* Search */}
              <div className="relative lg:col-span-2">
                <Search className="w-3.5 h-3.5 text-[#6B6B6B] absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search ID, keyword, address..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#F5F5F5] border border-[#E5E5E5] text-[#111111] text-xs rounded-xl pl-8 pr-3 py-2 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] transition-all placeholder:text-[#6B6B6B]/60"
                />
              </div>

              {/* Status Select */}
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full bg-[#F5F5F5] border border-[#E5E5E5] text-[#111111] text-xs rounded-xl px-3 py-2 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] transition-all cursor-pointer font-medium"
                >
                  <option value="all">All Statuses</option>
                  <option value="Pending">Pending Only</option>
                  <option value="In Progress">In Progress Only</option>
                  <option value="Pending Verification">Pending Verification</option>
                  <option value="Resolved">Resolved Only</option>
                </select>
              </div>

              {/* Category Select */}
              <div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full bg-[#F5F5F5] border border-[#E5E5E5] text-[#111111] text-xs rounded-xl px-3 py-2 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] transition-all cursor-pointer font-medium"
                >
                  <option value="all">All Categories</option>
                  <option value="pothole">Roads / Potholes</option>
                  <option value="garbage">Sanitation / Garbage</option>
                  <option value="streetlight">Lighting / Streetlight</option>
                  <option value="water">Water Supply</option>
                </select>
              </div>

              {/* Department Select */}
              <div>
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="w-full bg-[#F5F5F5] border border-[#E5E5E5] text-[#111111] text-xs rounded-xl px-3 py-2 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] transition-all cursor-pointer font-medium"
                >
                  <option value="all">All Departments</option>
                  <option value="Public Works">Public Works</option>
                  <option value="Sanitation">Sanitation</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Water Supply">Water Supply</option>
                </select>
              </div>
            </div>

            {/* Overdue toggle chip */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setOnlyOverdue(!onlyOverdue)}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition flex items-center gap-1.5 cursor-pointer ${
                  onlyOverdue
                    ? "bg-[#FFF1E6] text-[#FF6B00] border-[#FF6B00]/40 ring-2 ring-[#FF6B00]/10"
                    : "bg-[#F5F5F5] text-[#6B6B6B] border-[#E5E5E5] hover:bg-[#E5E5E5]"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${onlyOverdue ? "bg-[#FF6B00] animate-pulse" : "bg-[#6B6B6B]"}`}></span>
                <span>Only Show SLA Breached Issues (&gt;3 Days)</span>
              </button>
            </div>
          </div>

          {/* SAAS DATA TABLE */}
          <div className="bg-white rounded-2xl border border-[#E5E5E5] shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#111111]">
                <thead className="bg-[#F5F5F5] text-[11px] font-bold text-[#6B6B6B] uppercase tracking-wider border-b border-[#E5E5E5]">
                  <tr>
                    <th className="py-3 px-4">Ticket ID</th>
                    <th className="py-3 px-4">Priority Score</th>
                    <th className="py-3 px-4">Category & Details</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Status & SLA</th>
                    <th className="py-3 px-4 text-right">Engagement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5E5]">
                  {filteredComplaints.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-12 text-center text-[#6B6B6B]">
                        No complaints match your active filter parameters.
                      </td>
                    </tr>
                  ) : (
                    filteredComplaints.map((item) => {
                      const priority = calculatePriority(item);
                      const overdue = isSLAOverdue(item);

                      return (
                        <tr key={item.id} className="hover:bg-[#F5F5F5]/70 transition-colors">
                          {/* Ticket ID */}
                          <td className="py-3.5 px-4 font-mono font-bold text-[#111111] whitespace-nowrap">
                            {item.id}
                          </td>

                          {/* Priority Score Badge */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-medium ${priority.colorClass}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${priority.dotColor}`}></span>
                              {priority.label} ({priority.score} pts)
                            </span>
                          </td>

                          {/* Category & Details */}
                          <td className="py-3.5 px-4 max-w-xs sm:max-w-sm">
                            <span className="font-extrabold text-[#111111] capitalize block">
                              {CATEGORY_LABELS[item.category] || item.category}
                            </span>
                            <p className="text-[#6B6B6B] text-xs line-clamp-1 mt-0.5">
                              {item.description}
                            </p>
                            <p className="text-[11px] text-[#6B6B6B] flex items-center gap-1 mt-1">
                              <MapPin className="w-3 h-3 text-[#FF6B00]" />
                              {item.location}
                            </p>
                          </td>

                          {/* Department Chip */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 bg-[#F5F5F5] text-[#111111] font-bold px-2 py-0.5 rounded-lg border border-[#E5E5E5]">
                              <Building2 className="w-3 h-3 text-[#6B6B6B]" />
                              {item.department}
                            </span>
                          </td>

                          {/* Status & SLA */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="flex flex-col gap-1 items-start">
                              {item.status === "Pending" && (
                                <span className="inline-flex items-center gap-1 bg-[#F5F5F5] text-[#111111] font-bold px-2 py-0.5 rounded-full border border-[#E5E5E5]">
                                  Pending
                                </span>
                              )}
                              {item.status === "In Progress" && (
                                <span className="inline-flex items-center gap-1 bg-[#FFF1E6] text-[#FF6B00] font-bold px-2 py-0.5 rounded-full border border-[#FF6B00]/30">
                                  In Progress
                                </span>
                              )}
                              {item.status === "Pending Verification" && (
                                <span className="inline-flex items-center gap-1 bg-[#111111] text-white font-bold px-2 py-0.5 rounded-full border border-[#111111]">
                                  Pending Verify
                                </span>
                              )}
                              {item.status === "Resolved" && (
                                <span className="inline-flex items-center gap-1 bg-[#F5F5F5] text-[#111111] font-bold px-2 py-0.5 rounded-full border border-[#E5E5E5]">
                                  Resolved
                                </span>
                              )}

                              {item.reopenCount > 0 && (
                                <span className="inline-flex items-center gap-1 bg-[#FFF1E6] text-[#FF6B00] text-[10px] font-bold px-1.5 py-0.5 rounded border border-[#FF6B00]/30">
                                  Reopened ({item.reopenCount}x)
                                </span>
                              )}

                              {overdue && (
                                <span className="inline-flex items-center gap-1 bg-[#111111] text-[#FF6B00] text-[10px] font-bold px-1.5 py-0.5 rounded border border-[#111111] animate-pulse">
                                  SLA Breach (&gt;3d)
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Engagement & Timestamp */}
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="font-bold text-[#111111]">
                              👍 {item.upvotes || 0} Upvotes
                            </div>
                            <div className="text-[#6B6B6B] text-[10px] mt-0.5">
                              {item.createdAt}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
