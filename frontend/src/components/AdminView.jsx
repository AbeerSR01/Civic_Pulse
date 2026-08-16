import React, { useState } from "react";
import { ShieldCheck, Search, Filter, AlertCircle, Clock, CheckCircle2, Building2, MapPin, Map, Table, BarChart3, User, ArrowRight } from "lucide-react";
import { CATEGORY_LABELS } from "../utils/departmentAssigner";
import { calculatePriority, isSLAOverdue } from "../utils/priorityCalculator";
import AdminMapView from "./AdminMapView";
import AdminAnalyticsView from "./AdminAnalyticsView";

/**
 * AdminView Component
 * 
 * Features:
 * 1. Executive metric cards.
 * 2. View mode switcher: Table Directory vs Interactive Map & Priority Heatmap View.
 * 3. Multi-dropdown filters (Status, Category, Department).
 * 4. Priority Score calculation and SLA timer badges.
 * 
 * Props:
 * - complaints: Array of all complaints from App.jsx shared state
 */
export default function AdminView({ complaints, userName, setUserName }) {
  // Input state for the login form field
  const [loginInput, setLoginInput] = useState("");

  // Admin View Mode ('table' | 'map' | 'analytics')
  const [viewMode, setViewMode] = useState("table");

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");

  if (!userName) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 text-center space-y-6">
          <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto border border-indigo-100">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Admin Dashboard Sign-In</h2>
            <p className="text-xs text-slate-500 mt-1">
              Enter your administrator name to access city analytics and sector oversight.
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
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Administrator Name
              </label>
              <input
                type="text"
                required
                value={loginInput}
                onChange={(e) => setLoginInput(e.target.value)}
                placeholder="e.g. Director Verma"
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl shadow-md shadow-indigo-600/20 transition text-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Continue to Admin Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Summary metrics dynamically calculated from complaints master array
  const totalCount = complaints.length;
  const pendingCount = complaints.filter((c) => c.status === "Pending").length;
  const inProgressCount = complaints.filter((c) => c.status === "In Progress").length;
  const resolvedCount = complaints.filter((c) => c.status === "Resolved").length;

  /**
   * Filter complaints dynamically without mutating state
   */
  const filteredComplaints = complaints.filter((item) => {
    const matchesSearch =
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    const matchesDepartment = departmentFilter === "all" || item.department === departmentFilter;

    return matchesSearch && matchesStatus && matchesCategory && matchesDepartment;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* View Header & View Mode Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-indigo-600" />
            City Administration Dashboard
          </h2>
          <p className="text-sm text-slate-600">
            Real-time analytics, geospatial priority heatmap (Ranchi), SLA monitoring, and sector oversight.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex items-center justify-between gap-3 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-600">
              Welcome, <strong className="text-slate-900 font-semibold">{userName}</strong>
            </span>
            <button
              onClick={() => {
                setUserName("");
                setLoginInput("");
              }}
              className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-2.5 py-1 rounded-lg transition cursor-pointer"
            >
              Switch User
            </button>
          </div>

          {/* FEATURE: TABLE vs MAP vs ANALYTICS VIEW SWITCHER */}
          <div className="bg-slate-200 p-1.5 rounded-2xl flex items-center gap-1 border border-slate-300 self-start md:self-auto flex-wrap sm:flex-nowrap">
          <button
            onClick={() => setViewMode("table")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              viewMode === "table"
                ? "bg-white text-slate-900 shadow-md"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Table className="w-4 h-4" /> Table Directory
          </button>

          <button
            onClick={() => setViewMode("map")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              viewMode === "map"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Map className="w-4 h-4" /> Map & Heatmap View
          </button>

          <button
            onClick={() => setViewMode("analytics")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              viewMode === "analytics"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <BarChart3 className="w-4 h-4" /> Analytics View
          </button>
        </div>
      </div>
    </div>

      {/* METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Reported</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{totalCount}</h3>
          </div>
          <div className="p-3 bg-slate-100 rounded-xl text-slate-700">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-amber-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Pending Action</p>
            <h3 className="text-2xl font-bold text-amber-900 mt-1">{pendingCount}</h3>
          </div>
          <div className="p-3 bg-amber-50 rounded-xl text-amber-600 border border-amber-100">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-blue-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider">In Progress</p>
            <h3 className="text-2xl font-bold text-blue-900 mt-1">{inProgressCount}</h3>
          </div>
          <div className="p-3 bg-blue-50 rounded-xl text-blue-600 border border-blue-100">
            <Clock className="w-6 h-6 animate-pulse" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-emerald-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Resolved</p>
            <h3 className="text-2xl font-bold text-emerald-900 mt-1">{resolvedCount}</h3>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 border border-emerald-100">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* CONDITIONAL RENDERING: MAP VIEW vs ANALYTICS VIEW vs TABLE VIEW */}
      {viewMode === "map" ? (
        <AdminMapView complaints={complaints} />
      ) : viewMode === "analytics" ? (
        <AdminAnalyticsView complaints={complaints} />
      ) : (
        <>
          {/* MULTI-FILTER DROPDOWNS BAR */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mb-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-800 font-semibold text-sm">
                <Filter className="w-4 h-4 text-blue-600" />
                <span>Filter Complaints ({filteredComplaints.length} shown)</span>
              </div>

              {(statusFilter !== "all" || categoryFilter !== "all" || departmentFilter !== "all" || searchTerm !== "") && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                    setCategoryFilter("all");
                    setDepartmentFilter("all");
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium underline"
                >
                  Reset Filters
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="Search ID, location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl pl-9 pr-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                >
                  <option value="all">All Statuses</option>
                  <option value="Pending">Pending Only</option>
                  <option value="In Progress">In Progress Only</option>
                  <option value="Resolved">Resolved Only</option>
                </select>
              </div>

              <div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                >
                  <option value="all">All Categories</option>
                  <option value="pothole">Potholes</option>
                  <option value="garbage">Garbage</option>
                  <option value="streetlight">Streetlights</option>
                  <option value="water">Water Leakage</option>
                </select>
              </div>

              <div>
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                >
                  <option value="all">All Departments</option>
                  <option value="Public Works">Public Works</option>
                  <option value="Sanitation">Sanitation</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Water Supply">Water Supply</option>
                </select>
              </div>
            </div>
          </div>

          {/* COMPLAINTS TABLE */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4">ID</th>
                    <th className="py-3.5 px-4">Priority Score</th>
                    <th className="py-3.5 px-4">Category & Details</th>
                    <th className="py-3.5 px-4">Department</th>
                    <th className="py-3.5 px-4">Status & SLA</th>
                    <th className="py-3.5 px-4 text-right">Upvotes & Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredComplaints.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-slate-500">
                        No complaints match your active filter selection.
                      </td>
                    </tr>
                  ) : (
                    filteredComplaints.map((item) => {
                      const priority = calculatePriority(item);
                      const overdue = isSLAOverdue(item);

                      return (
                        <tr key={item.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-4 px-4 font-mono text-xs font-medium text-slate-500">
                            {item.id}
                          </td>

                          <td className="py-4 px-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border ${priority.colorClass}`}>
                              <span className={`w-2 h-2 rounded-full ${priority.dotColor}`}></span>
                              {priority.label} ({priority.score} pts)
                            </span>
                          </td>

                          <td className="py-4 px-4 max-w-xs sm:max-w-sm">
                            <span className="font-semibold text-slate-900 block capitalize">
                              {CATEGORY_LABELS[item.category] || item.category}
                            </span>
                            <p className="font-medium text-slate-700 text-xs line-clamp-2 mt-0.5">
                              {item.description}
                            </p>
                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              {item.location}
                            </p>
                          </td>

                          <td className="py-4 px-4">
                            <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-800 text-xs font-medium px-2.5 py-1 rounded-lg border border-slate-200">
                              <Building2 className="w-3.5 h-3.5 text-slate-500" />
                              {item.department}
                            </span>
                          </td>

                          <td className="py-4 px-4">
                            <div className="flex flex-col gap-1 items-start">
                              {item.status === "Pending" && (
                                <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-amber-200">
                                  Pending
                                </span>
                              )}
                              {item.status === "In Progress" && (
                                <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-blue-200">
                                  In Progress
                                </span>
                              )}
                              {item.status === "Resolved" && (
                                <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-emerald-200">
                                  Resolved
                                </span>
                              )}

                              {overdue && (
                                <span className="inline-flex items-center gap-1 bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm animate-pulse">
                                  SLA Overdue (&gt;3d)
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="py-4 px-4 text-right text-xs text-slate-500">
                            <div className="font-semibold text-slate-900">
                              👍 {item.upvotes || 0} upvotes
                            </div>
                            <div className="text-slate-400 mt-1">{item.createdAt}</div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

    </div>
  );
}
