import React, { useState } from "react";
import {
  Building2,
  CheckCircle2,
  Clock,
  Image as ImageIcon,
  MapPin,
  Upload,
  ShieldCheck,
  Check,
  X,
  ThumbsUp,
  User,
  ArrowRight,
  RotateCcw,
  Eye
} from "lucide-react";
import { CATEGORY_LABELS } from "../utils/departmentAssigner";
import { calculatePriority, isSLAOverdue } from "../utils/priorityCalculator";

/**
 * Modern Minimalist DepartmentView Component
 * 
 * Premium Monochrome + Signature Orange (#FF6B00) Accent
 */
export default function DepartmentView({
  complaints,
  onStatusChange,
  userName,
  setUserName,
}) {
  // Input state for sign-in
  const [loginInput, setLoginInput] = useState("");

  const [selectedDepartment, setSelectedDepartment] = useState("Public Works");

  // State for resolution proof modal
  const [resolvingComplaintId, setResolvingComplaintId] = useState(null);
  const [resolutionFile, setResolutionFile] = useState(null);
  const [resolutionPreview, setResolutionPreview] = useState(null);

  // Lightbox modal state
  const [lightboxImage, setLightboxImage] = useState(null);

  const DEPARTMENTS = ["Public Works", "Sanitation", "Electrical", "Water Supply"];

  // Sign-in Screen
  if (!userName) {
    const demoOfficers = [
      { name: "Officer Anita Roy", dept: "Public Works", role: "Field Engineer" },
      { name: "Officer Rajesh Kumar", dept: "Sanitation", role: "Zone Inspector" },
      { name: "Officer Vikram Sen", dept: "Electrical", role: "Grid Supervisor" },
      { name: "Officer Meera Rao", dept: "Water Supply", role: "Pipeline Manager" },
    ];

    return (
      <div className="max-w-lg mx-auto px-4 py-16">
        <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-xs border border-[#E5E5E5] text-center space-y-6">
          <div className="w-12 h-12 bg-[#111111] text-[#FF6B00] rounded-xl flex items-center justify-center mx-auto border border-[#111111]">
            <Building2 className="w-6 h-6" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-[#111111] tracking-tight">Department Portal Sign-In</h2>
            <p className="text-xs text-[#6B6B6B] mt-1.5 leading-relaxed">
              Enter your officer name or ID to manage assigned municipal tickets and upload mandatory resolution proof.
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
                Officer Name / Badge ID
              </label>
              <input
                type="text"
                required
                value={loginInput}
                onChange={(e) => setLoginInput(e.target.value)}
                placeholder="e.g. Officer Anita Roy"
                className="w-full bg-[#F5F5F5] border border-[#E5E5E5] text-[#111111] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] transition-all placeholder:text-[#6B6B6B]/60"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#111111] hover:bg-black text-white font-bold py-2.5 rounded-xl shadow-xs hover:shadow transition-all text-sm flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
            >
              <span>Continue to Department Portal</span>
              <ArrowRight className="w-4 h-4 text-[#FF6B00]" />
            </button>
          </form>

          {/* Quick Demo Officer Profiles */}
          <div className="pt-4 border-t border-[#E5E5E5] text-left">
            <p className="text-[11px] font-bold text-[#6B6B6B] uppercase tracking-wider mb-2.5">
              Or select an officer profile:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {demoOfficers.map((profile) => (
                <button
                  key={profile.name}
                  type="button"
                  onClick={() => {
                    setUserName(profile.name);
                    setSelectedDepartment(profile.dept);
                  }}
                  className="flex flex-col p-2.5 rounded-xl border border-[#E5E5E5] hover:border-[#FF6B00] hover:bg-[#FFF1E6]/40 text-left transition group cursor-pointer bg-[#F5F5F5]/60"
                >
                  <p className="text-xs font-bold text-[#111111] group-hover:text-[#FF6B00] transition">
                    {profile.name}
                  </p>
                  <p className="text-[11px] text-[#FF6B00] font-bold">{profile.dept}</p>
                  <p className="text-[10px] text-[#6B6B6B]">{profile.role}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const departmentComplaints = complaints.filter(
    (c) => c.department === selectedDepartment
  );

  const deptPending = departmentComplaints.filter((c) => c.status === "Pending").length;
  const deptInProgress = departmentComplaints.filter((c) => c.status === "In Progress").length;
  const deptPendingVerify = departmentComplaints.filter((c) => c.status === "Pending Verification").length;
  const deptResolved = departmentComplaints.filter((c) => c.status === "Resolved").length;

  const handleInitiateStatusChange = (item, newStatus) => {
    if (newStatus === "Resolved") {
      setResolvingComplaintId(item.id);
      setResolutionFile(null);
      setResolutionPreview(null);
    } else {
      onStatusChange(item.id, newStatus);
    }
  };

  const handleResolutionPhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setResolutionFile(file);
      const objectUrl = URL.createObjectURL(file);
      setResolutionPreview(objectUrl);
    }
  };

  const handleConfirmResolution = (complaintId) => {
    if (!resolutionPreview) {
      alert("Please upload a resolution proof photo to confirm completion of work.");
      return;
    }

    onStatusChange(complaintId, "Pending Verification", resolutionPreview);

    setResolvingComplaintId(null);
    setResolutionFile(null);
    setResolutionPreview(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Banner / Department Switcher */}
      <div className="bg-white rounded-2xl p-6 border border-[#E5E5E5] shadow-2xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FFF1E6] text-[#FF6B00] border border-[#FF6B00]/30">
                <Building2 className="w-3.5 h-3.5" /> Department Action Center
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-[#111111] tracking-tight">
              Viewing Queue: <span className="text-[#FF6B00]">{selectedDepartment}</span>
            </h2>
            <p className="text-xs text-[#6B6B6B] mt-1">
              Tickets sorted by priority score. Resolution photo proof is required when resolving municipal tickets.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <div className="flex items-center gap-2.5 bg-[#F5F5F5] px-3.5 py-2 rounded-xl border border-[#E5E5E5]">
              <div className="w-6 h-6 rounded-lg bg-[#111111] text-white flex items-center justify-center font-bold text-xs">
                {userName[0]}
              </div>
              <span className="text-xs text-[#6B6B6B]">
                Officer: <strong className="text-[#111111] font-bold">{userName}</strong>
              </span>
              <button
                onClick={() => {
                  setUserName("");
                  setLoginInput("");
                }}
                className="text-[11px] font-bold text-[#111111] hover:text-[#FF6B00] bg-white hover:bg-[#FFF1E6] px-2 py-0.5 rounded-md border border-[#E5E5E5] transition cursor-pointer"
              >
                Switch
              </button>
            </div>
          </div>
        </div>

        {/* Department Switcher Tabs & Quick Queue Stats */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-3 border-t border-[#E5E5E5]">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
            {DEPARTMENTS.map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDepartment(dept)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  selectedDepartment === dept
                    ? "bg-[#111111] text-white shadow-2xs"
                    : "bg-[#F5F5F5] text-[#6B6B6B] hover:text-[#111111] hover:bg-[#E5E5E5]"
                }`}
              >
                {dept}
              </button>
            ))}
          </div>

          {/* Mini department queue stats */}
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2.5 py-1 bg-[#F5F5F5] text-[#111111] rounded-lg font-bold border border-[#E5E5E5] text-[11px]">
              {deptPending} Pending
            </span>
            <span className="px-2.5 py-1 bg-[#FFF1E6] text-[#FF6B00] rounded-lg font-bold border border-[#FF6B00]/30 text-[11px]">
              {deptInProgress} In Progress
            </span>
            <span className="px-2.5 py-1 bg-[#111111] text-white rounded-lg font-bold text-[11px]">
              {deptPendingVerify} Verification
            </span>
            <span className="px-2.5 py-1 bg-[#F5F5F5] text-[#6B6B6B] rounded-lg font-bold border border-[#E5E5E5] text-[11px]">
              {deptResolved} Resolved
            </span>
          </div>
        </div>
      </div>

      {/* DEPARTMENT COMPLAINTS QUEUE */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-[#111111] flex items-center gap-2">
            <span>Assigned Tickets</span>
            <span className="bg-[#F5F5F5] text-[#111111] text-xs px-2 py-0.5 rounded-full font-mono font-bold border border-[#E5E5E5]">
              {departmentComplaints.length}
            </span>
          </h3>
          <span className="text-xs text-[#6B6B6B]">
            Priority = (Upvotes × 3) + (Days Open × 2) + (Reopen × 5)
          </span>
        </div>

        {departmentComplaints.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-[#E5E5E5] text-center text-[#6B6B6B] shadow-2xs space-y-2">
            <CheckCircle2 className="w-10 h-10 mx-auto text-[#111111] mb-1" />
            <h4 className="text-sm font-bold text-[#111111]">All Clear in {selectedDepartment}</h4>
            <p className="text-xs text-[#6B6B6B]">
              No tickets are currently assigned or pending resolution in this department.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {departmentComplaints.map((item) => {
              const priority = calculatePriority(item);
              const overdue = isSLAOverdue(item);

              return (
                <div
                  key={item.id}
                  className="bg-white p-5 rounded-2xl border border-[#E5E5E5] shadow-2xs hover:shadow-xs transition flex flex-col lg:flex-row gap-5 items-start lg:items-center justify-between"
                >
                  {/* Left Side: Photos + Information */}
                  <div className="flex flex-col sm:flex-row gap-4 items-start flex-1">
                    
                    {/* Original Issue Photo Thumbnail */}
                    <div className="space-y-1 flex-shrink-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B6B6B] block">
                        Original Photo
                      </span>
                      {item.photoUrl ? (
                        <div
                          onClick={() => setLightboxImage(item.photoUrl)}
                          className="w-full sm:w-24 h-24 rounded-xl overflow-hidden bg-[#F5F5F5] border border-[#E5E5E5] cursor-pointer relative group"
                        >
                          <img
                            src={item.photoUrl}
                            alt="Issue"
                            className="w-full h-full object-cover group-hover:scale-105 transition"
                            onError={(e) => {
                              e.target.src =
                                "https://images.unsplash.com/photo-1590059306054-94a28f7ff282?auto=format&fit=crop&w=300&q=80";
                            }}
                          />
                          <div className="absolute inset-0 bg-[#111111]/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Eye className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      ) : (
                        <div className="w-full sm:w-24 h-24 rounded-xl bg-[#F5F5F5] flex flex-col items-center justify-center text-[#6B6B6B] border border-[#E5E5E5]">
                          <ImageIcon className="w-5 h-5 mb-0.5 text-[#6B6B6B]" />
                          <span className="text-[10px]">No Photo</span>
                        </div>
                      )}
                    </div>

                    {/* Resolution Proof Photo if available */}
                    {item.resolutionPhotoUrl && (
                      <div className="space-y-1 flex-shrink-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF6B00] block">
                          Resolution Proof
                        </span>
                        <div
                          onClick={() => setLightboxImage(item.resolutionPhotoUrl)}
                          className="w-full sm:w-24 h-24 rounded-xl overflow-hidden bg-[#FFF1E6] border border-[#FF6B00]/30 cursor-pointer relative group"
                        >
                          <img
                            src={item.resolutionPhotoUrl}
                            alt="Resolution Proof"
                            className="w-full h-full object-cover group-hover:scale-105 transition"
                          />
                          <div className="absolute inset-0 bg-[#111111]/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Eye className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Ticket Details */}
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold bg-[#F5F5F5] text-[#111111] px-2 py-0.5 rounded border border-[#E5E5E5]">
                          {item.id}
                        </span>

                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${priority.colorClass}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${priority.dotColor}`}></span>
                          Priority: {priority.label} ({priority.score} pts)
                        </span>

                        {item.reopenCount > 0 && (
                          <span className="inline-flex items-center gap-1 bg-[#FFF1E6] text-[#FF6B00] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#FF6B00]/30">
                            <RotateCcw className="w-3 h-3 text-[#FF6B00]" /> Reopened ({item.reopenCount}x)
                          </span>
                        )}

                        {overdue && (
                          <span className="inline-flex items-center gap-1 bg-[#111111] text-[#FF6B00] text-[10px] font-bold px-2 py-0.5 rounded-md border border-[#111111] animate-pulse">
                            SLA Overdue (&gt;3d)
                          </span>
                        )}

                        <span className="text-xs text-[#6B6B6B] flex items-center gap-1 ml-auto font-bold">
                          <ThumbsUp className="w-3.5 h-3.5 text-[#FF6B00]" />
                          {item.upvotes || 0} Upvotes
                        </span>
                      </div>

                      <p className="text-xs font-bold text-[#111111]">
                        {item.description}
                      </p>

                      <p className="text-[11px] text-[#6B6B6B] flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#FF6B00]" />
                        <span>{item.location}</span>
                      </p>
                    </div>

                  </div>

                  {/* Right Side: Status Control Buttons */}
                  <div className="w-full lg:w-auto bg-[#F5F5F5] p-3.5 rounded-xl border border-[#E5E5E5] flex flex-col gap-2.5">
                    <div>
                      <label className="block text-[10px] font-bold text-[#6B6B6B] uppercase tracking-wider mb-1.5">
                        Set Workflow Status:
                      </label>
                      
                      <div className="flex items-center gap-1">
                        {["Pending", "In Progress", "Resolved"].map((statusOption) => {
                          const isCurrent =
                            item.status === statusOption ||
                            (statusOption === "Resolved" && item.status === "Pending Verification");

                          let activeStyle = "";
                          if (statusOption === "Pending") activeStyle = "bg-[#6B6B6B] text-white border-[#6B6B6B]";
                          if (statusOption === "In Progress") activeStyle = "bg-[#FF6B00] text-white border-[#FF6B00]";
                          if (statusOption === "Resolved") activeStyle = "bg-[#111111] text-white border-[#111111]";

                          return (
                            <button
                              key={statusOption}
                              type="button"
                              onClick={() => handleInitiateStatusChange(item, statusOption)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border cursor-pointer ${
                                isCurrent
                                  ? `${activeStyle} shadow-2xs`
                                  : "bg-white text-[#111111] border-[#E5E5E5] hover:bg-[#E5E5E5]"
                              }`}
                            >
                              {statusOption}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="text-[11px] text-[#6B6B6B] flex items-center justify-between gap-2 pt-1 border-t border-[#E5E5E5]">
                      <span>Status:</span>
                      <div>
                        {item.status === "Pending Verification" ? (
                          <span className="bg-[#111111] text-[#FF6B00] font-bold px-2 py-0.5 rounded-full text-[10px]">
                            Pending Citizen Verification
                          </span>
                        ) : (
                          <strong className="text-[#111111] font-bold">{item.status}</strong>
                        )}
                      </div>
                    </div>

                    {/* RESOLUTION PROOF MODAL / INLINE FORM */}
                    {resolvingComplaintId === item.id && (
                      <div className="mt-2 bg-white p-3 rounded-xl border border-[#E5E5E5] text-xs space-y-2.5 animate-fade-in shadow-xs">
                        <div className="font-bold text-[#111111] flex items-center gap-1">
                          <ShieldCheck className="w-4 h-4 text-[#FF6B00]" />
                          <span>Attach Photo Proof of Resolution</span>
                        </div>
                        <p className="text-[11px] text-[#6B6B6B]">
                          Citizens inspect this photo in Stage 2 verification before closing the ticket.
                        </p>

                        <label className="cursor-pointer bg-[#F5F5F5] hover:bg-[#E5E5E5] border border-[#E5E5E5] text-[#111111] text-xs font-bold px-3 py-2 rounded-lg transition flex items-center justify-center gap-1.5 shadow-2xs">
                          <Upload className="w-3.5 h-3.5 text-[#FF6B00]" />
                          <span>Select Proof Photo</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleResolutionPhotoChange}
                            className="hidden"
                          />
                        </label>

                        {resolutionPreview && (
                          <div className="rounded-lg overflow-hidden border border-[#E5E5E5] h-24 bg-[#F5F5F5]">
                            <img
                              src={resolutionPreview}
                              alt="Proof preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}

                        <div className="flex gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => handleConfirmResolution(item.id)}
                            className="flex-1 bg-[#FF6B00] hover:bg-[#e55f00] text-white font-bold py-1.5 rounded-lg flex items-center justify-center gap-1 transition shadow-2xs cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" /> Confirm Fix
                          </button>
                          <button
                            type="button"
                            onClick={() => setResolvingComplaintId(null)}
                            className="bg-[#F5F5F5] hover:bg-[#E5E5E5] text-[#111111] px-2.5 py-1.5 rounded-lg transition cursor-pointer font-bold border border-[#E5E5E5]"
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

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-[#111111]/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setLightboxImage(null)}
        >
          <div
            className="bg-white rounded-2xl p-2 max-w-3xl w-full max-h-[85vh] overflow-hidden relative shadow-2xl border border-[#E5E5E5]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-3 border-b border-[#E5E5E5]">
              <span className="text-xs font-bold text-[#111111]">Photo Inspection</span>
              <button
                onClick={() => setLightboxImage(null)}
                className="p-1 rounded-lg text-[#6B6B6B] hover:text-[#111111] hover:bg-[#F5F5F5] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-2 max-h-[75vh] overflow-auto flex items-center justify-center">
              <img
                src={lightboxImage}
                alt="Enlarged inspection"
                className="max-h-[70vh] w-auto object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
