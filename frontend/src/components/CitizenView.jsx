import React, { useState, useEffect } from "react";
import {
  PlusCircle,
  Upload,
  MapPin,
  Tag,
  CheckCircle2,
  Clock,
  Image as ImageIcon,
  ThumbsUp,
  Navigation,
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  User,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Check,
  Search,
  X,
  Eye,
  Flame
} from "lucide-react";
import { CATEGORY_LABELS } from "../utils/departmentAssigner";
import { calculatePriority, isSLAOverdue } from "../utils/priorityCalculator";

/**
 * Modern Minimalist CitizenView Component
 * 
 * Premium Monochrome + Signature Orange (#FF6B00) Accent
 */
export default function CitizenView({
  complaints,
  onAddComplaint,
  onUpvote,
  onVerifyResolution,
  userName,
  setUserName,
}) {
  // Input state for sign-in
  const [loginInput, setLoginInput] = useState("");

  // Duplicate match result state (Temporary UI State: null = normalMode, object = duplicateMode)
  const [duplicateResult, setDuplicateResult] = useState(null);

  // Form input fields
  const [category, setCategory] = useState("pothole");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");

  // Geolocation states
  const [coords, setCoords] = useState(null);
  const [geoStatus, setGeoStatus] = useState("idle");
  const [geoMessage, setGeoMessage] = useState("");

  // Photo file upload & preview
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  // Success message toast
  const [successMessage, setSuccessMessage] = useState("");

  // Stream Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all");

  // Lightbox modal state
  const [lightboxImage, setLightboxImage] = useState(null);

  // Track complaints already upvoted by this user
  const [votedIds, setVotedIds] = useState(() => {
    try {
      const saved = localStorage.getItem(`civic_upvotes_${userName || "default"}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (userName) {
      try {
        const saved = localStorage.getItem(`civic_upvotes_${userName}`);
        if (saved) setVotedIds(JSON.parse(saved));
      } catch {
        // ignore
      }
    }
  }, [userName]);

  const handleCitizenUpvote = async (complaintId) => {
    if (votedIds.includes(complaintId)) {
      setSuccessMessage("You have already upvoted this complaint.");
      setTimeout(() => setSuccessMessage(""), 4000);
      return;
    }

    const result = await onUpvote(complaintId);

    const updated = [...votedIds, complaintId];
    setVotedIds(updated);
    try {
      localStorage.setItem(`civic_upvotes_${userName || "default"}`, JSON.stringify(updated));
    } catch {
      // ignore
    }

    // If duplicateResult is currently active and matches this complaint, update its upvote count locally
    if (
      duplicateResult &&
      (duplicateResult.id === complaintId ||
        duplicateResult.ticketId === complaintId ||
        duplicateResult.dbId === complaintId)
    ) {
      setDuplicateResult((prev) =>
        prev
          ? {
              ...prev,
              upvotes: (prev.upvotes || prev.upvoteCount || 0) + 1,
              upvoteCount: (prev.upvoteCount || prev.upvotes || 0) + 1,
            }
          : prev
      );
    }

    if (result?.alreadyUpvoted) {
      setSuccessMessage("Your upvote was already recorded in the database.");
    } else {
      setSuccessMessage("Upvote recorded! Issue priority score increased.");
    }
    setTimeout(() => setSuccessMessage(""), 4000);
  };

  // Sign-in Screen
  if (!userName) {
    const demoProfiles = [
      { name: "Rahul Sharma", role: "Ward 4 Resident", area: "Downtown" },
      { name: "Priya Singh", role: "Sector 9 Community Lead", area: "North Sector" },
      { name: "Aarav Gupta", role: "Active Citizen", area: "West District" },
    ];

    return (
      <div className="max-w-lg mx-auto px-4 py-16">
        <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-xs border border-[#E5E5E5] text-center space-y-6">
          <div className="w-12 h-12 bg-[#FFF1E6] text-[#FF6B00] rounded-xl flex items-center justify-center mx-auto border border-[#FF6B00]/20">
            <User className="w-6 h-6" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-[#111111] tracking-tight">Citizen Portal Sign-In</h2>
            <p className="text-xs text-[#6B6B6B] mt-1.5 leading-relaxed">
              Enter your name to report neighborhood issues, track community fixes, and verify municipal work.
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
                Full Name
              </label>
              <input
                type="text"
                required
                value={loginInput}
                onChange={(e) => setLoginInput(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full bg-[#F5F5F5] border border-[#E5E5E5] text-[#111111] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] transition-all placeholder:text-[#6B6B6B]/60"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#FF6B00] hover:bg-[#e55f00] text-white font-bold py-2.5 rounded-xl shadow-xs hover:shadow transition-all text-sm flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
            >
              <span>Continue to Citizen Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Profiles */}
          <div className="pt-4 border-t border-[#E5E5E5] text-left">
            <p className="text-[11px] font-bold text-[#6B6B6B] uppercase tracking-wider mb-2.5">
              Or pick a demo profile:
            </p>
            <div className="grid grid-cols-1 gap-2">
              {demoProfiles.map((profile) => (
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

  // Geolocation Handler
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus("denied");
      setGeoMessage("Geolocation not supported by browser.");
      return;
    }

    setGeoStatus("loading");
    setGeoMessage("Detecting GPS position & fetching address...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ lat: latitude, lng: longitude });

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
            {
              headers: {
                Accept: "application/json",
              },
            }
          );

          if (!response.ok) throw new Error("Geocode lookup failed");

          const data = await response.json();

          if (data && data.display_name) {
            setLocation(data.display_name);
            setGeoStatus("captured");
            setGeoMessage("GPS location and address verified.");
          } else {
            setGeoStatus("geo_only");
            setGeoMessage("GPS captured. Please refine address manually.");
          }
        } catch (error) {
          console.warn("Reverse geocode error:", error);
          setGeoStatus("geo_only");
          setGeoMessage("GPS captured. Please refine address manually.");
        }
      },
      (error) => {
        console.warn("Geolocation permission error:", error.message);
        setGeoStatus("denied");
        setGeoMessage("Location permission denied. Enter address manually.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPhotoPreview(objectUrl);
    }
  };

  const clearPhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!description.trim() || !location.trim()) {
      alert("Please provide both a description and location for the issue.");
      return;
    }

    let finalLat = coords ? coords.lat : null;
    let finalLng = coords ? coords.lng : null;

    // If GPS was not clicked, resolve real coordinates from the typed address text
    if (!finalLat && location.trim()) {
      try {
        const geoRes = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location.trim())}&limit=1`,
          { headers: { Accept: "application/json" } }
        );
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          if (geoData && geoData[0]) {
            finalLat = Number(geoData[0].lat);
            finalLng = Number(geoData[0].lon);
          }
        }
      } catch {
        // network fallback
      }
    }

    const newComplaint = {
      category: category,
      description: description.trim(),
      location: location.trim(),
      photoUrl: photoPreview || null,
      lat: finalLat,
      lng: finalLng,
    };

    const result = await onAddComplaint(newComplaint);

    // If an active duplicate was detected in PostgreSQL database
    if (result && result.isDuplicate && result.duplicateComplaint) {
      setDuplicateResult(result.duplicateComplaint);
      return;
    }

    setSuccessMessage("Issue successfully reported! Routed to the respective city department.");
    setTimeout(() => setSuccessMessage(""), 5000);

    setDescription("");
    setLocation("");
    setPhotoFile(null);
    setPhotoPreview(null);
    setCategory("pothole");
    setCoords(null);
    setGeoStatus("idle");
    setGeoMessage("");
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Pending":
        return (
          <span className="inline-flex items-center gap-1.5 bg-[#F5F5F5] text-[#111111] text-xs font-semibold px-2.5 py-1 rounded-full border border-[#E5E5E5]">
            <Clock className="w-3.5 h-3.5 text-[#6B6B6B]" /> Pending Action
          </span>
        );
      case "In Progress":
        return (
          <span className="inline-flex items-center gap-1.5 bg-[#FFF1E6] text-[#FF6B00] text-xs font-bold px-2.5 py-1 rounded-full border border-[#FF6B00]/30">
            <Clock className="w-3.5 h-3.5 animate-spin text-[#FF6B00]" /> In Progress
          </span>
        );
      case "Pending Verification":
        return (
          <span className="inline-flex items-center gap-1.5 bg-[#111111] text-white text-xs font-bold px-2.5 py-1 rounded-full border border-[#111111]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#FF6B00] animate-pulse" /> Pending Verification
          </span>
        );
      case "Resolved":
        return (
          <span className="inline-flex items-center gap-1.5 bg-[#F5F5F5] text-[#111111] text-xs font-semibold px-2.5 py-1 rounded-full border border-[#E5E5E5]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#111111]" /> Resolved
          </span>
        );
      default:
        return null;
    }
  };

  const filteredComplaints = complaints.filter((item) => {
    const matchesSearch =
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategoryFilter === "all" || item.category === selectedCategoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Banner / User Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E5E5]">
        <div>
          <h2 className="text-2xl font-extrabold text-[#111111] tracking-tight">Citizen Portal</h2>
          <p className="text-xs text-[#6B6B6B] mt-1">
            Report civic issues in your neighborhood. Submissions are automatically routed to responsible authorities.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white px-3.5 py-2 rounded-xl border border-[#E5E5E5] shadow-2xs self-start sm:self-auto">
          <div className="w-7 h-7 rounded-lg bg-[#111111] text-white flex items-center justify-center font-bold text-xs">
            {userName[0]}
          </div>
          <div className="text-xs">
            <span className="text-[#6B6B6B]">Citizen: </span>
            <strong className="text-[#111111] font-bold">{userName}</strong>
          </div>
          <button
            onClick={() => {
              setUserName("");
              setLoginInput("");
            }}
            className="text-[11px] font-bold text-[#111111] hover:text-[#FF6B00] bg-[#F5F5F5] hover:bg-[#FFF1E6] border border-[#E5E5E5] px-2.5 py-1 rounded-lg transition cursor-pointer"
          >
            Switch
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {successMessage && (
        <div className="bg-[#FFF1E6] border border-[#FF6B00]/30 text-[#111111] px-4 py-3 rounded-xl flex items-center justify-between gap-2 shadow-2xs animate-fade-in">
          <div className="flex items-center gap-2 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-[#FF6B00] flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage("")}
            className="text-[#111111] hover:text-[#FF6B00] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Content Area: State 2 (Duplicate Mode) vs State 1 (Normal Mode) */}
      {duplicateResult ? (
        /* ================= STATE 2: DUPLICATE DETECTED ================= */
        <div className="max-w-3xl mx-auto space-y-6 animate-fade-in py-2">
          
          {/* Warning Banner */}
          <div className="bg-[#FFF1E6] border-2 border-[#FF6B00] rounded-2xl p-5 sm:p-6 shadow-xs space-y-3">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#FF6B00] text-white flex items-center justify-center font-bold flex-shrink-0 shadow-xs">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-extrabold text-[#111111] tracking-tight">
                  ⚠️ This complaint already exists
                </h3>
                <p className="text-xs text-[#6B6B6B] leading-relaxed">
                  A matching active civic issue has already been reported in this exact area. To avoid duplication and speed up municipal resolution, you can upvote this existing complaint to raise its priority score in the department resolution queue.
                </p>
              </div>
            </div>
          </div>

          {/* Single Matching Complaint Card */}
          {(() => {
            const priority = calculatePriority(duplicateResult);
            const overdue = isSLAOverdue(duplicateResult);
            const isAlreadyUpvoted =
              votedIds.includes(duplicateResult.id) ||
              votedIds.includes(duplicateResult.ticketId) ||
              votedIds.includes(duplicateResult.dbId);

            return (
              <div className="bg-white p-6 sm:p-7 rounded-2xl border border-[#E5E5E5] shadow-xs space-y-5">
                
                {/* Header Row: ID, Category, Priority, Status */}
                <div className="flex items-start justify-between gap-3 flex-wrap sm:flex-nowrap pb-3 border-b border-[#E5E5E5]">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-[#111111] bg-[#F5F5F5] px-2.5 py-1 rounded-md border border-[#E5E5E5]">
                      {duplicateResult.id || duplicateResult.ticketId}
                    </span>

                    <span className="text-sm font-extrabold text-[#111111] capitalize">
                      {CATEGORY_LABELS[duplicateResult.category] || duplicateResult.category}
                    </span>

                    {/* Priority Score Tag */}
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs border ${priority.colorClass}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${priority.dotColor}`}></span>
                      {priority.label} ({priority.score} pts)
                    </span>

                    {/* SLA Overdue Badge */}
                    {overdue && (
                      <span className="inline-flex items-center gap-1 bg-[#111111] text-[#FF6B00] text-[10px] font-bold px-2 py-0.5 rounded-md border border-[#111111]">
                        SLA Overdue (&gt;3d)
                      </span>
                    )}
                  </div>

                  <div>{getStatusBadge(duplicateResult.status)}</div>
                </div>

                {/* Content Row: Photo + Details */}
                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  {/* Photo Preview if available */}
                  {duplicateResult.photoUrl ? (
                    <div
                      onClick={() => setLightboxImage(duplicateResult.photoUrl)}
                      className="w-full sm:w-36 h-32 rounded-xl overflow-hidden bg-[#F5F5F5] flex-shrink-0 border border-[#E5E5E5] cursor-pointer relative group"
                      title="Click to view full photo"
                    >
                      <img
                        src={duplicateResult.photoUrl}
                        alt="Issue photo"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        onError={(e) => {
                          e.target.src =
                            "https://images.unsplash.com/photo-1590059306054-94a28f7ff282?auto=format&fit=crop&w=300&q=80";
                        }}
                      />
                      <div className="absolute inset-0 bg-[#111111]/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Eye className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  ) : (
                    <div className="w-full sm:w-36 h-32 rounded-xl bg-[#F5F5F5] flex flex-col items-center justify-center text-[#6B6B6B] flex-shrink-0 border border-[#E5E5E5]">
                      <ImageIcon className="w-6 h-6 mb-1 text-[#6B6B6B]" />
                      <span className="text-[11px]">No Photo</span>
                    </div>
                  )}

                  {/* Text details */}
                  <div className="flex-1 space-y-2.5">
                    <div>
                      <span className="text-[10px] font-bold text-[#6B6B6B] uppercase tracking-wider block mb-0.5">
                        Issue Description
                      </span>
                      <p className="text-xs sm:text-sm text-[#111111] font-medium leading-relaxed">
                        {duplicateResult.description}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-[#6B6B6B] pt-1">
                      <span className="flex items-center gap-1.5 font-medium text-[#111111]">
                        <MapPin className="w-3.5 h-3.5 text-[#FF6B00]" />
                        {duplicateResult.location || duplicateResult.address}
                      </span>
                      <span className="flex items-center gap-1 font-bold text-[#111111] bg-[#F5F5F5] px-2.5 py-0.5 rounded-md border border-[#E5E5E5]">
                        <Tag className="w-3 h-3 text-[#FF6B00]" />
                        {duplicateResult.department}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer / Action Controls */}
                <div className="pt-4 border-t border-[#E5E5E5] flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs text-[#6B6B6B]">
                    <span className="font-bold text-[#111111] bg-[#F5F5F5] border border-[#E5E5E5] px-2.5 py-1 rounded-lg">
                      👍 {duplicateResult.upvotes || duplicateResult.upvoteCount || 0} Upvotes
                    </span>
                    {duplicateResult.createdAt && (
                      <span>• Reported {duplicateResult.createdAt}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2.5 w-full sm:w-auto">
                    {/* Go Back Button */}
                    <button
                      type="button"
                      onClick={() => setDuplicateResult(null)}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 bg-[#F5F5F5] hover:bg-[#E5E5E5] text-[#111111] text-xs font-bold px-4 py-2.5 rounded-xl border border-[#E5E5E5] transition cursor-pointer active:scale-98"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>← Go Back</span>
                    </button>

                    {/* Upvote Existing Complaint Button */}
                    {isAlreadyUpvoted ? (
                      <div className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 bg-[#F5F5F5] text-[#111111] text-xs font-bold px-4 py-2.5 rounded-xl border border-[#E5E5E5] shadow-2xs">
                        <Check className="w-3.5 h-3.5 text-[#FF6B00]" />
                        <span>Upvoted ({duplicateResult.upvotes || duplicateResult.upvoteCount || 0})</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          handleCitizenUpvote(
                            duplicateResult.id || duplicateResult.ticketId || duplicateResult.dbId
                          )
                        }
                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 bg-[#FF6B00] hover:bg-[#e55f00] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs hover:shadow transition active:scale-98 cursor-pointer"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>👍 Upvote Existing Complaint</span>
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })()}

        </div>
      ) : (
        /* ================= STATE 1: NORMAL CITIZEN VIEW ================= */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Report Issue Card */}
        <div className="lg:col-span-5">
          <div className="bg-white p-6 rounded-2xl shadow-xs border border-[#E5E5E5] sticky top-20 space-y-5">
            
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E5]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#FFF1E6] text-[#FF6B00] flex items-center justify-center border border-[#FF6B00]/20 font-bold">
                  <PlusCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#111111]">Report a New Issue</h3>
                  <p className="text-[11px] text-[#6B6B6B]">Directly routed to the assigned department</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Category Selector */}
              <div>
                <label className="block text-[11px] font-bold text-[#111111] uppercase tracking-wider mb-1.5">
                  Issue Category
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "pothole", label: "Pothole / Road", dept: "Public Works", icon: "🚧" },
                    { id: "garbage", label: "Garbage Overflow", dept: "Sanitation", icon: "🗑️" },
                    { id: "streetlight", label: "Streetlight Fault", dept: "Electrical", icon: "💡" },
                    { id: "water", label: "Water Leakage", dept: "Water Supply", icon: "🚰" },
                  ].map((cat) => {
                    const isSelected = category === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id)}
                        className={`flex flex-col text-left p-2.5 rounded-xl border transition cursor-pointer ${
                          isSelected
                            ? "bg-[#FFF1E6] border-[#FF6B00] text-[#111111]"
                            : "bg-[#F5F5F5]/60 border-[#E5E5E5] hover:border-[#6B6B6B] text-[#111111]"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm">{cat.icon}</span>
                          {isSelected && (
                            <span className="w-2 h-2 rounded-full bg-[#FF6B00]"></span>
                          )}
                        </div>
                        <span className="text-xs font-bold mt-1 text-[#111111]">{cat.label}</span>
                        <span className="text-[10px] text-[#6B6B6B] mt-0.5">→ {cat.dept}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Location Input with Integrated Geolocation */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-bold text-[#111111] uppercase tracking-wider">
                    Location & Landmark
                  </label>
                  <button
                    type="button"
                    onClick={handleGetLocation}
                    disabled={geoStatus === "loading"}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#FF6B00] hover:text-[#e55f00] bg-[#FFF1E6] hover:bg-[#ffe5d0] border border-[#FF6B00]/30 px-2 py-0.5 rounded-lg transition disabled:opacity-50 cursor-pointer"
                  >
                    <Navigation className={`w-3 h-3 ${geoStatus === "loading" ? "animate-spin" : ""}`} />
                    <span>{geoStatus === "loading" ? "Locating..." : "Use My GPS"}</span>
                  </button>
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-4 w-4 text-[#6B6B6B]" />
                  </div>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. 142 Main Street, near City Center"
                    className="w-full bg-[#F5F5F5] border border-[#E5E5E5] text-[#111111] rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] transition-all placeholder:text-[#6B6B6B]/60"
                  />
                </div>

                {geoMessage && (
                  <p
                    className={`text-[11px] font-semibold mt-1.5 p-2 rounded-lg flex items-center gap-1.5 border ${
                      geoStatus === "captured"
                        ? "bg-[#F5F5F5] text-[#111111] border-[#E5E5E5]"
                        : "bg-[#FFF1E6] text-[#FF6B00] border-[#FF6B00]/30"
                    }`}
                  >
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{geoMessage}</span>
                  </p>
                )}
              </div>

              {/* Description Input */}
              <div>
                <label className="block text-[11px] font-bold text-[#111111] uppercase tracking-wider mb-1.5">
                  Detailed Description
                </label>
                <textarea
                  rows="3"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the severity, hazard level, or relevant landmarks..."
                  className="w-full bg-[#F5F5F5] border border-[#E5E5E5] text-[#111111] rounded-xl px-3 py-2 text-xs focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] transition-all placeholder:text-[#6B6B6B]/60 resize-none"
                />
              </div>

              {/* Photo Upload Dropzone */}
              <div>
                <label className="block text-[11px] font-bold text-[#111111] uppercase tracking-wider mb-1.5">
                  Attach Photo Proof (Optional)
                </label>

                {!photoPreview ? (
                  <label className="cursor-pointer border border-dashed border-[#E5E5E5] hover:border-[#FF6B00] rounded-xl p-4 flex flex-col items-center justify-center gap-1.5 bg-[#F5F5F5]/60 hover:bg-[#FFF1E6]/40 transition group">
                    <Upload className="w-5 h-5 text-[#6B6B6B] group-hover:text-[#FF6B00] transition" />
                    <span className="text-xs font-bold text-[#111111] group-hover:text-[#FF6B00] transition">
                      Click to upload photo
                    </span>
                    <span className="text-[10px] text-[#6B6B6B]">PNG, JPG, WEBP up to 10MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="relative rounded-xl overflow-hidden border border-[#E5E5E5] bg-[#F5F5F5] group">
                    <img
                      src={photoPreview}
                      alt="Upload Preview"
                      className="w-full h-32 object-cover"
                    />
                    <div className="absolute inset-0 bg-[#111111]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setLightboxImage(photoPreview)}
                        className="p-1.5 bg-white text-[#111111] rounded-lg text-xs font-bold shadow-sm hover:bg-[#F5F5F5] cursor-pointer"
                        title="View Full Size"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={clearPhoto}
                        className="p-1.5 bg-[#111111] text-white rounded-lg text-xs font-bold shadow-sm hover:bg-[#FF6B00] transition cursor-pointer"
                        title="Remove Photo"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="absolute bottom-2 left-2 bg-[#111111]/90 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                      {photoFile?.name || "Attached Photo"}
                    </span>
                  </div>
                )}
              </div>

              {/* Submit CTA Button */}
              <button
                type="submit"
                className="w-full bg-[#FF6B00] hover:bg-[#e55f00] text-white font-bold py-2.5 rounded-xl shadow-xs hover:shadow transition-all flex items-center justify-center gap-2 text-xs mt-3 cursor-pointer active:scale-[0.99]"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Submit Complaint to City</span>
              </button>

            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: Community Issue Stream */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Stream Header & Filters */}
          <div className="bg-white p-4 rounded-2xl border border-[#E5E5E5] shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-extrabold text-[#111111] flex items-center gap-2">
                  <span>Community Issue Stream</span>
                  <span className="bg-[#F5F5F5] text-[#111111] text-xs px-2 py-0.5 rounded-full font-mono font-bold border border-[#E5E5E5]">
                    {filteredComplaints.length}
                  </span>
                </h3>
                <p className="text-[11px] text-[#6B6B6B]">
                  Upvotes dynamically increase the issue priority score in department queues.
                </p>
              </div>
            </div>

            {/* Search Input & Category Filter Chips */}
            <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
              <div className="relative flex-1 w-full">
                <Search className="w-3.5 h-3.5 text-[#6B6B6B] absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search by ID, keyword, location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#F5F5F5] border border-[#E5E5E5] text-[#111111] text-xs rounded-xl pl-8 pr-3 py-1.5 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] transition-all placeholder:text-[#6B6B6B]/60"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-2 text-[#6B6B6B] hover:text-[#111111]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                {[
                  { key: "all", label: "All" },
                  { key: "pothole", label: "Roads" },
                  { key: "garbage", label: "Sanitation" },
                  { key: "streetlight", label: "Lighting" },
                  { key: "water", label: "Water" },
                ].map((pill) => (
                  <button
                    key={pill.key}
                    type="button"
                    onClick={() => setSelectedCategoryFilter(pill.key)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer whitespace-nowrap ${
                      selectedCategoryFilter === pill.key
                        ? "bg-[#111111] text-white shadow-2xs"
                        : "bg-[#F5F5F5] text-[#6B6B6B] hover:text-[#111111] hover:bg-[#E5E5E5]"
                    }`}
                  >
                    {pill.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Complaints Feed */}
          {filteredComplaints.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-[#E5E5E5] text-center text-[#6B6B6B] shadow-xs space-y-2">
              <ImageIcon className="w-8 h-8 mx-auto text-[#E5E5E5]" />
              <p className="text-sm font-bold text-[#111111]">No issues found</p>
              <p className="text-xs text-[#6B6B6B]">
                {searchQuery || selectedCategoryFilter !== "all"
                  ? "Try resetting your search filters."
                  : "Be the first to report an issue in your area."}
              </p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {filteredComplaints.map((item) => {
                const priority = calculatePriority(item);
                const overdue = isSLAOverdue(item);
                const isBelongingToCitizen = !item.createdBy || item.createdBy === userName;
                const isPendingVerification = item.status === "Pending Verification";
                const isAlreadyUpvoted =
                  votedIds.includes(item.id) ||
                  votedIds.includes(item.ticketId) ||
                  votedIds.includes(item.dbId);

                return (
                  <div
                    key={item.id}
                    className={`bg-white p-5 rounded-2xl border transition-all space-y-3.5 shadow-2xs hover:shadow-xs ${
                      isPendingVerification && isBelongingToCitizen
                        ? "border-[#FF6B00]/40 ring-2 ring-[#FF6B00]/10 bg-gradient-to-b from-[#FFF1E6]/30 to-white"
                        : "border-[#E5E5E5]"
                    }`}
                  >
                    {/* Header Row: ID, Category, Priority, Status */}
                    <div className="flex items-start justify-between gap-3 flex-wrap sm:flex-nowrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-[11px] font-bold text-[#111111] bg-[#F5F5F5] px-2 py-0.5 rounded border border-[#E5E5E5]">
                          {item.id}
                        </span>

                        <span className="text-xs font-extrabold text-[#111111] capitalize">
                          {CATEGORY_LABELS[item.category] || item.category}
                        </span>

                        {/* Priority Score Tag */}
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] border ${priority.colorClass}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${priority.dotColor}`}></span>
                          {priority.label} ({priority.score} pts)
                        </span>

                        {/* Reopen Badge */}
                        {item.reopenCount > 0 && (
                          <span className="inline-flex items-center gap-1 bg-[#FFF1E6] text-[#FF6B00] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#FF6B00]/30">
                            <RotateCcw className="w-3 h-3 text-[#FF6B00]" /> Reopened ({item.reopenCount}x)
                          </span>
                        )}

                        {/* SLA Overdue Badge */}
                        {overdue && (
                          <span className="inline-flex items-center gap-1 bg-[#111111] text-[#FF6B00] text-[10px] font-bold px-2 py-0.5 rounded-md border border-[#111111]">
                            SLA Overdue (&gt;3d)
                          </span>
                        )}
                      </div>

                      <div>{getStatusBadge(item.status)}</div>
                    </div>

                    {/* Content Row: Thumbnail + Description */}
                    <div className="flex flex-col sm:flex-row gap-3.5 items-start">
                      {/* Photo Thumbnail */}
                      {item.photoUrl ? (
                        <div
                          onClick={() => setLightboxImage(item.photoUrl)}
                          className="w-full sm:w-24 h-24 rounded-xl overflow-hidden bg-[#F5F5F5] flex-shrink-0 border border-[#E5E5E5] cursor-pointer relative group"
                          title="Click to view full photo"
                        >
                          <img
                            src={item.photoUrl}
                            alt="Issue photo"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
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
                        <div className="w-full sm:w-24 h-24 rounded-xl bg-[#F5F5F5] flex flex-col items-center justify-center text-[#6B6B6B] flex-shrink-0 border border-[#E5E5E5]">
                          <ImageIcon className="w-5 h-5 mb-0.5 text-[#6B6B6B]" />
                          <span className="text-[10px]">No Photo</span>
                        </div>
                      )}

                      {/* Text details */}
                      <div className="flex-1 space-y-2">
                        <p className="text-xs text-[#111111] font-medium leading-relaxed">
                          {item.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#6B6B6B] pt-1">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-[#6B6B6B]" />
                            {item.location}
                          </span>
                          <span className="flex items-center gap-1 font-bold text-[#111111] bg-[#F5F5F5] px-2 py-0.5 rounded border border-[#E5E5E5]">
                            <Tag className="w-3 h-3 text-[#FF6B00]" />
                            {item.department}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Footer Row: Metadata + Upvote Button */}
                    <div className="flex items-center justify-between pt-2.5 border-t border-[#E5E5E5] text-xs">
                      <span className="text-[#6B6B6B] text-[11px]">
                        Reported: {item.createdAt}
                      </span>

                      {isAlreadyUpvoted ? (
                        <div className="inline-flex items-center gap-1.5 bg-[#F5F5F5] text-[#111111] text-xs font-bold px-3 py-1.5 rounded-lg border border-[#E5E5E5] shadow-2xs">
                          <Check className="w-3.5 h-3.5 text-[#FF6B00]" />
                          <span>Upvoted ({item.upvotes || item.upvoteCount || 0})</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleCitizenUpvote(item.id || item.ticketId)}
                          className="inline-flex items-center gap-1.5 bg-white hover:bg-[#FFF1E6] text-[#111111] hover:text-[#FF6B00] text-xs font-bold px-3 py-1.5 rounded-lg border border-[#E5E5E5] hover:border-[#FF6B00]/40 transition active:scale-95 shadow-2xs cursor-pointer"
                        >
                          <ThumbsUp className="w-3.5 h-3.5 text-[#FF6B00]" />
                          <span>Upvote ({item.upvotes || item.upvoteCount || 0})</span>
                        </button>
                      )}
                    </div>

                    {/* STAGE 2: CITIZEN VERIFICATION ACCORDION */}
                    {isPendingVerification && isBelongingToCitizen && (
                      <div className="mt-3 bg-[#F5F5F5] border border-[#E5E5E5] rounded-xl p-4 space-y-3.5">
                        <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-[#E5E5E5]">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-[#111111]">
                            <ShieldCheck className="w-4 h-4 text-[#FF6B00] flex-shrink-0" />
                            <span>Stage 2: Citizen Verification Required</span>
                          </div>
                          <span className="text-[10px] font-bold text-[#111111] bg-white px-2 py-0.5 rounded-full border border-[#E5E5E5]">
                            Proof Uploaded
                          </span>
                        </div>

                        {/* Side-by-side Before / After Photo Comparison */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {/* Before Photo */}
                          <div className="space-y-1">
                            <span className="text-[11px] font-bold text-[#111111] block">
                              📷 Original Issue (Before)
                            </span>
                            <div
                              onClick={() => item.photoUrl && setLightboxImage(item.photoUrl)}
                              className="h-32 rounded-lg overflow-hidden bg-white border border-[#E5E5E5] relative cursor-pointer group"
                            >
                              {item.photoUrl ? (
                                <img
                                  src={item.photoUrl}
                                  alt="Original issue"
                                  className="w-full h-full object-cover group-hover:scale-105 transition"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-xs text-[#6B6B6B]">
                                  No Before Photo
                                </div>
                              )}
                              <span className="absolute bottom-1.5 left-1.5 bg-[#111111]/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                                Before
                              </span>
                            </div>
                          </div>

                          {/* After Photo */}
                          <div className="space-y-1">
                            <span className="text-[11px] font-bold text-[#FF6B00] block">
                              ✨ Department Fix (After)
                            </span>
                            <div
                              onClick={() => item.resolutionPhotoUrl && setLightboxImage(item.resolutionPhotoUrl)}
                              className="h-32 rounded-lg overflow-hidden bg-white border border-[#E5E5E5] relative cursor-pointer group"
                            >
                              {item.resolutionPhotoUrl ? (
                                <img
                                  src={item.resolutionPhotoUrl}
                                  alt="Department proof"
                                  className="w-full h-full object-cover group-hover:scale-105 transition"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-xs text-[#6B6B6B]">
                                  No Proof Provided
                                </div>
                              )}
                              <span className="absolute bottom-1.5 left-1.5 bg-[#FF6B00] text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                                After Fix
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2.5 border-t border-[#E5E5E5]">
                          <p className="text-xs text-[#111111] font-medium">
                            Has this civic issue been satisfactorily resolved on the ground?
                          </p>

                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            <button
                              type="button"
                              onClick={() => onVerifyResolution && onVerifyResolution(item.id, true)}
                              className="flex-1 sm:flex-none bg-[#111111] hover:bg-black text-white text-xs font-bold px-3.5 py-1.5 rounded-lg transition shadow-2xs flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                            >
                              <Check className="w-3.5 h-3.5 text-[#FF6B00]" />
                              <span>Yes, Verified</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => onVerifyResolution && onVerifyResolution(item.id, false)}
                              className="flex-1 sm:flex-none bg-white hover:bg-[#F5F5F5] text-[#111111] border border-[#E5E5E5] text-xs font-bold px-3.5 py-1.5 rounded-lg transition shadow-2xs flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                            >
                              <RotateCcw className="w-3.5 h-3.5 text-[#6B6B6B]" />
                              <span>No, Reopen</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          )}

        </div>

      </div>
      )}

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
