import React, { useState } from "react";
import Navbar from "./components/Navbar";
import CitizenView from "./components/CitizenView";
import AdminView from "./components/AdminView";
import DepartmentView from "./components/DepartmentView";
import { INITIAL_COMPLAINTS } from "./data/initialComplaints";
import { getDepartmentForCategory } from "./utils/departmentAssigner";
import { Info, Code, Workflow } from "lucide-react";

/**
 * App Component - Root Application Container
 * 
 * HACKATHON CONCEPT: SHARED STATE PATTERN
 * All views (Citizen, Admin, Department) share one single state array in App.jsx.
 */
export default function App() {
  // Navigation Tab State ('citizen' | 'admin' | 'department')
  const [activeTab, setActiveTab] = useState("citizen");

  // Shared Complaints Array State initialized with sample data
  const [complaints, setComplaints] = useState(INITIAL_COMPLAINTS);

  // Independent Login User Name States for each view (persisted across tab switches)
  const [citizenName, setCitizenName] = useState("");
  const [adminName, setAdminName] = useState("");
  const [departmentName, setDepartmentName] = useState("");

  /**
   * Handler to Add a New Complaint (Called by CitizenView)
   * Auto-assigns department and generates random Ranchi geo-coordinates
   */
  const handleAddComplaint = (newComplaintData) => {
    const autoAssignedDept = getDepartmentForCategory(newComplaintData.category);
    const now = new Date();
    const formattedDate = now.toLocaleDateString() + " " + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const generatedId = `COMP-${Math.floor(100 + Math.random() * 900)}`;

    // Generate random coordinates within a ~3km radius of Ranchi city center (23.3441, 85.3096)
    const baseLat = 23.3441;
    const baseLng = 85.3096;
    const generatedLat = Number((baseLat + (Math.random() - 0.5) * 0.05).toFixed(5));
    const generatedLng = Number((baseLng + (Math.random() - 0.5) * 0.05).toFixed(5));

    // Use explicit GPS coordinates if user provided them via Geolocation API, otherwise fallback to Ranchi offset
    const finalLat = (newComplaintData.lat !== null && newComplaintData.lat !== undefined)
      ? newComplaintData.lat
      : generatedLat;
    const finalLng = (newComplaintData.lng !== null && newComplaintData.lng !== undefined)
      ? newComplaintData.lng
      : generatedLng;

    const createdComplaint = {
      id: generatedId,
      category: newComplaintData.category,
      description: newComplaintData.description,
      location: newComplaintData.location,
      photoUrl: newComplaintData.photoUrl,
      status: "Pending",
      department: autoAssignedDept,
      upvotes: 0,
      createdAt: formattedDate,
      resolutionPhotoUrl: null,
      lat: finalLat,
      lng: finalLng,
      reopenCount: 0,
      createdBy: citizenName || "Anonymous Citizen",
    };

    setComplaints((prevComplaints) => [createdComplaint, ...prevComplaints]);
  };

  /**
   * Handler to Upvote a Complaint (Called by CitizenView)
   */
  const handleUpvote = (complaintId) => {
    setComplaints((prevComplaints) =>
      prevComplaints.map((item) =>
        item.id === complaintId
          ? { ...item, upvotes: (item.upvotes || 0) + 1 }
          : item
      )
    );
  };

  /**
   * Handler to Update Complaint Status (Called by DepartmentView)
   */
  const handleStatusChange = (complaintId, newStatus, resolutionPhotoUrl = null) => {
    setComplaints((prevComplaints) =>
      prevComplaints.map((item) =>
        item.id === complaintId
          ? {
              ...item,
              status: newStatus,
              ...(resolutionPhotoUrl ? { resolutionPhotoUrl } : {}),
            }
          : item
      )
    );
  };

  /**
   * Handler for Citizen Verification (Called by CitizenView)
   * If approved -> status = "Resolved"
   * If rejected -> status = "Pending", increment reopenCount
   */
  const handleVerifyResolution = (complaintId, isResolved) => {
    setComplaints((prevComplaints) =>
      prevComplaints.map((item) => {
        if (item.id !== complaintId) return item;
        if (isResolved) {
          return { ...item, status: "Resolved" };
        } else {
          return {
            ...item,
            status: "Pending",
            reopenCount: (item.reopenCount || 0) + 1,
          };
        }
      })
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans antialiased">
      
      {/* Top Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        totalCount={complaints.length}
      />

      {/* Main View Area - Conditional Rendering based on activeTab */}
      <main className="flex-1">
        {activeTab === "citizen" && (
          <CitizenView
            complaints={complaints}
            onAddComplaint={handleAddComplaint}
            onUpvote={handleUpvote}
            onVerifyResolution={handleVerifyResolution}
            userName={citizenName}
            setUserName={setCitizenName}
          />
        )}

        {activeTab === "admin" && (
          <AdminView
            complaints={complaints}
            userName={adminName}
            setUserName={setAdminName}
          />
        )}

        {activeTab === "department" && (
          <DepartmentView
            complaints={complaints}
            onStatusChange={handleStatusChange}
            userName={departmentName}
            setUserName={setDepartmentName}
          />
        )}
      </main>

      {/* Footer Banner */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          
          <div className="flex items-center space-x-2">
            <Workflow className="w-4 h-4 text-blue-400" />
            <span>
              <strong>Architecture Note:</strong> Single React State in <code className="text-blue-300">App.jsx</code> powers all views & map layers seamlessly.
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="flex items-center gap-1 text-slate-300">
              <Code className="w-3.5 h-3.5 text-blue-400" /> React + Vite + Leaflet + Tailwind
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">Zero Backend / In-Memory Demo</span>
          </div>

        </div>
      </footer>

    </div>
  );
}
