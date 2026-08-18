import React, { useState } from "react";
import { Building2, CheckCircle2, Clock, Image as ImageIcon, MapPin, Upload, ShieldCheck, Check, X, ThumbsUp, User, ArrowRight } from "lucide-react";
import { CATEGORY_LABELS } from "../utils/departmentAssigner";
import { calculatePriority } from "../utils/priorityCalculator";

/**
 * DepartmentView Component
 * 
 * Features:
 * 1. Filtered portal view for selected department.
 * 2. Calculated Priority Score badge on each ticket.
 * 3. Resolution Proof photo upload required when marking tickets as "Resolved".
 * 
 * Props:
 * - complaints: Array of all complaints from App.jsx state
 * - onStatusChange: Function passed from App.jsx to mutate complaint status in top-level state
 */
export default function DepartmentView({ complaints, onStatusChange, userName, setUserName }) {
  // Input state for the login form field
  const [loginInput, setLoginInput] = useState("");

  const [selectedDepartment, setSelectedDepartment] = useState("Public Works");

  // State to manage resolution proof modal for a specific complaint ID
  const [resolvingComplaintId, setResolvingComplaintId] = useState(null);
  const [resolutionFile, setResolutionFile] = useState(null);
  const [resolutionPreview, setResolutionPreview] = useState(null);

  const DEPARTMENTS = ["Public Works", "Sanitation", "Electrical", "Water Supply"];

  if (!userName) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 text-center space-y-6">
          <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mx-auto border border-purple-100">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Department Portal Sign-In</h2>
            <p className="text-xs text-slate-500 mt-1">
              Enter your officer name to manage assigned municipal tickets and upload resolution proof.
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
                Officer Name / ID
              </label>
              <input
                type="text"
                required
                value={loginInput}
                onChange={(e) => setLoginInput(e.target.value)}
                placeholder="e.g. Officer Anita Roy"
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl shadow-md shadow-purple-600/20 transition text-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Continue to Department Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  const departmentComplaints = complaints.filter(
    (c) => c.department === selectedDepartment
  );

  /**
   * Trigger Resolution Proof Workflow
   */
  const handleInitiateStatusChange = (item, newStatus) => {
    if (newStatus === "Resolved") {
      // Open resolution proof upload modal
      setResolvingComplaintId(item.id);
      setResolutionFile(null);
      setResolutionPreview(null);
    } else {
      // Direct status change for Pending or In Progress
      onStatusChange(item.id, newStatus);
    }
  };

  /**
   * Handle Resolution Photo Selection
   */
  const handleResolutionPhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setResolutionFile(file);
      const objectUrl = URL.createObjectURL(file);
      setResolutionPreview(objectUrl);
    }
  };

  /**
   * Confirm Resolution with Uploaded Proof Photo
   * Transitions status to intermediate state "Pending Verification" for Citizen verification
   */
  const handleConfirmResolution = (complaintId) => {
    if (!resolutionPreview) {
      alert("Please upload a resolution proof photo to confirm issue resolution.");
      return;
    }

    // Call top-level status updater with resolution photo URL and "Pending Verification" status
    onStatusChange(complaintId, "Pending Verification", resolutionPreview);

    // Reset resolution modal state
    setResolvingComplaintId(null);
    setResolutionFile(null);
    setResolutionPreview(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* View Header & Department Switcher */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-3xl shadow-lg mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Building2 className="w-4 h-4" /> Department Action Center
            </div>
            <h2 className="text-2xl font-bold">
              Viewing as: <span className="text-blue-300">{selectedDepartment}</span>
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Tickets sorted with Priority Scores. Resolution photo proof is required when resolving tickets.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* User Welcome Badge & Switch User Button */}
            <div className="bg-slate-800/90 px-4 py-2.5 rounded-2xl border border-slate-700/80 flex items-center justify-between gap-3 text-xs">
              <span className="text-slate-300">
                Welcome, <strong className="text-white font-semibold">{userName}</strong>
              </span>
              <button
                onClick={() => {
                  setUserName("");
                  setLoginInput("");
                }}
                className="text-[11px] font-semibold text-blue-300 hover:text-white bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-lg border border-white/20 transition cursor-pointer"
              >
                Switch User
              </button>
            </div>

            {/* Department Selection Dropdown */}
            <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700/80">
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Select Department Portal:
              </label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full bg-slate-900 text-white font-medium border border-slate-600 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept} Department
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* COMPLAINTS CARDS LIST FOR SELECTED DEPARTMENT */}
      <div className="space-y-4">
        
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">
            Assigned Department Tickets ({departmentComplaints.length})
          </h3>
          <span className="text-xs text-slate-500">
            Filtered by: {selectedDepartment}
          </span>
        </div>

        {departmentComplaints.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-500">
            <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-400 mb-3" />
            <h4 className="text-base font-semibold text-slate-800">All Clear!</h4>
            <p className="text-sm text-slate-500 mt-1">
              No tickets currently assigned to the {selectedDepartment} department.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5">
            {departmentComplaints.map((item) => {
              const priority = calculatePriority(item);

              return (
                <div
                  key={item.id}
                  className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between"
                >
                  {/* Left Side: Photos + Details */}
                  <div className="flex flex-col sm:flex-row gap-4 items-start flex-1">
                    
                    {/* Issue Photo Thumbnail */}
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">Issue Photo</span>
                      {item.photoUrl ? (
                        <div className="w-full sm:w-28 h-28 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                          <img
                            src={item.photoUrl}
                            alt="Issue"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = "https://images.unsplash.com/photo-1590059306054-94a28f7ff282?auto=format&fit=crop&w=300&q=80";
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-full sm:w-28 h-28 rounded-xl bg-slate-100 flex flex-col items-center justify-center text-slate-400 border border-slate-200">
                          <ImageIcon className="w-6 h-6 mb-1" />
                          <span className="text-[10px]">No Photo</span>
                        </div>
                      )}
                    </div>

                    {/* Resolution Proof Photo if available */}
                    {item.resolutionPhotoUrl && (
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-emerald-600">Resolution Proof</span>
                        <div className="w-full sm:w-28 h-28 rounded-xl overflow-hidden bg-emerald-50 border border-emerald-200">
                          <img
                            src={item.resolutionPhotoUrl}
                            alt="Resolution Proof"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    )}

                    {/* Ticket Details */}
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                          {item.id}
                        </span>

                        {/* FEATURE 3: PRIORITY SCORE BADGE */}
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs border ${priority.colorClass}`}>
                          <span className={`w-2 h-2 rounded-full ${priority.dotColor}`}></span>
                          Priority: {priority.label} ({priority.score} pts)
                        </span>

                        <span className="text-xs text-slate-500 flex items-center gap-1 ml-auto">
                          <ThumbsUp className="w-3.5 h-3.5 text-blue-500" />
                          {item.upvotes || 0} upvotes
                        </span>
                      </div>

                      <p className="text-base font-semibold text-slate-900">
                        {item.description}
                      </p>

                      <p className="text-xs text-slate-600 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <strong>Location:</strong> {item.location}
                      </p>
                    </div>

                  </div>

                  {/* Right Side: Status Action Control Buttons */}
                  <div className="w-full lg:w-auto bg-slate-50 p-4 rounded-xl border border-slate-200/80 flex flex-col gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                        Update Ticket Status:
                      </label>
                      
                      <div className="flex items-center gap-1.5">
                        {["Pending", "In Progress", "Resolved"].map((statusOption) => {
                          const isCurrent = item.status === statusOption;
                          
                          let activeStyle = "";
                          if (statusOption === "Pending") activeStyle = "bg-amber-600 text-white border-amber-600";
                          if (statusOption === "In Progress") activeStyle = "bg-blue-600 text-white border-blue-600";
                          if (statusOption === "Resolved") activeStyle = "bg-emerald-600 text-white border-emerald-600";

                          return (
                            <button
                              key={statusOption}
                              onClick={() => handleInitiateStatusChange(item, statusOption)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
                                isCurrent
                                  ? `${activeStyle} shadow-sm`
                                  : "bg-white text-slate-600 border-slate-300 hover:bg-slate-100"
                              }`}
                            >
                              {statusOption}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="text-xs text-slate-500 flex items-center justify-between gap-2">
                      <span>Current Status:</span>
                      <div className="flex items-center gap-1.5">
                        {item.reopenCount > 0 && (
                          <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                            Reopened ({item.reopenCount}x)
                          </span>
                        )}
                        {item.status === "Pending Verification" ? (
                          <span className="bg-purple-100 text-purple-800 border border-purple-200 font-semibold px-2 py-0.5 rounded-full text-[11px]">
                            Pending Verification
                          </span>
                        ) : (
                          <strong className="text-slate-900">{item.status}</strong>
                        )}
                      </div>
                    </div>

                    {/* FEATURE 5: RESOLUTION PROOF MODAL / INLINE FORM */}
                    {resolvingComplaintId === item.id && (
                      <div className="mt-2 bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-xs space-y-3 animate-fade-in">
                        <div className="font-semibold text-emerald-900 flex items-center gap-1">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          Attach Proof of Resolution
                        </div>

                        <label className="cursor-pointer bg-white hover:bg-slate-50 border border-emerald-300 text-emerald-800 text-xs font-medium px-3 py-2 rounded-lg transition flex items-center justify-center gap-2">
                          <Upload className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Select Proof Photo</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleResolutionPhotoChange}
                            className="hidden"
                          />
                        </label>

                        {resolutionPreview && (
                          <div className="rounded-lg overflow-hidden border border-emerald-300 h-24 bg-white">
                            <img
                              src={resolutionPreview}
                              alt="Proof preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleConfirmResolution(item.id)}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-1.5 rounded-lg flex items-center justify-center gap-1 transition"
                          >
                            <Check className="w-3.5 h-3.5" /> Confirm
                          </button>
                          <button
                            onClick={() => setResolvingComplaintId(null)}
                            className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-2.5 py-1.5 rounded-lg transition"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}

                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

    </div>
  );
}
