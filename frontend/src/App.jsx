import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import CitizenView from "./components/CitizenView";
import AdminView from "./components/AdminView";
import DepartmentView from "./components/DepartmentView";
import { INITIAL_COMPLAINTS } from "./data/initialComplaints";
import { getDepartmentForCategory } from "./utils/departmentAssigner";
import api from "./services/api";
import { Code, Activity } from "lucide-react";

/**
 * App Component - Root Application Container
 * 
 * Premium Monochrome + Signature Orange (#FF6B00) Accent System
 */
export default function App() {
  // Navigation Tab State ('citizen' | 'admin' | 'department')
  const [activeTab, setActiveTab] = useState("citizen");

  // Shared Complaints Array State
  const [complaints, setComplaints] = useState(INITIAL_COMPLAINTS);
  const [isLoading, setIsLoading] = useState(false);
  const [dbConnected, setDbConnected] = useState(false);

  // Independent Login User Name States for each view (persisted across tab switches)
  const [citizenName, setCitizenName] = useState("");
  const [adminName, setAdminName] = useState("");
  const [departmentName, setDepartmentName] = useState("");

  /**
   * Fetch live complaints from PostgreSQL backend on initial load
   */
  const loadComplaints = async () => {
    try {
      setIsLoading(true);
      const res = await api.getComplaints();
      if (res && res.data && Array.isArray(res.data) && res.data.length > 0) {
        setComplaints(res.data);
        setDbConnected(true);
      }
    } catch (err) {
      console.warn("ℹ️ [API Notice] Backend running in resilient state:", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, []);

  /**
   * Handler to Add a New Complaint (Called by CitizenView)
   */
  const handleAddComplaint = async (newComplaintData) => {
    const autoAssignedDept = getDepartmentForCategory(newComplaintData.category);
    const now = new Date();
    const formattedDate =
      now.toLocaleDateString() +
      " " +
      now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const generatedId = `COMP-${Math.floor(100 + Math.random() * 900)}`;

    const baseLat = 23.3441;
    const baseLng = 85.3096;
    const generatedLat = Number((baseLat + (Math.random() - 0.5) * 0.05).toFixed(5));
    const generatedLng = Number((baseLng + (Math.random() - 0.5) * 0.05).toFixed(5));

    const finalLat =
      newComplaintData.lat !== null && newComplaintData.lat !== undefined
        ? newComplaintData.lat
        : generatedLat;
    const finalLng =
      newComplaintData.lng !== null && newComplaintData.lng !== undefined
        ? newComplaintData.lng
        : generatedLng;

    const payload = {
      title: `${newComplaintData.category.toUpperCase()} Issue Reported`,
      category: newComplaintData.category,
      description: newComplaintData.description,
      location: newComplaintData.location,
      address: newComplaintData.location,
      photoUrl: newComplaintData.photoUrl,
      status: "Pending",
      department: autoAssignedDept,
      lat: finalLat,
      lng: finalLng,
      citizenName: citizenName || "Anonymous Citizen",
    };

    try {
      const res = await api.createComplaint(payload, citizenName);
      if (res && res.data) {
        setComplaints((prev) => [res.data, ...prev]);
        setDbConnected(true);
        return res.data;
      }
    } catch (err) {
      console.warn("⚠️ [API Notice] Saving to resilient local state:", err.message);
    }

    // Resilient fallback to local state
    const localComplaint = {
      id: generatedId,
      ...payload,
      upvotes: 0,
      createdAt: formattedDate,
      resolutionPhotoUrl: null,
      reopenCount: 0,
      createdBy: citizenName || "Anonymous Citizen",
    };

    setComplaints((prev) => [localComplaint, ...prev]);
    return localComplaint;
  };

  /**
   * Handler to Upvote a Complaint (Called by CitizenView)
   */
  const handleUpvote = async (complaintId) => {
    try {
      const res = await api.upvoteComplaint(complaintId, citizenName);
      if (res && res.data) {
        const updatedInfo = res.data;
        setComplaints((prev) =>
          prev.map((item) =>
            item.id === complaintId || item.ticketId === complaintId || item.dbId === complaintId
              ? {
                  ...item,
                  upvotes:
                    updatedInfo.upvoteCount !== undefined
                      ? updatedInfo.upvoteCount
                      : updatedInfo.upvotes,
                  upvoteCount:
                    updatedInfo.upvoteCount !== undefined
                      ? updatedInfo.upvoteCount
                      : updatedInfo.upvotes,
                  priorityScore: updatedInfo.priorityScore || item.priorityScore,
                  upvoteUserIds: updatedInfo.upvoteUserIds || item.upvoteUserIds,
                }
              : item
          )
        );
        return { success: true, alreadyUpvoted: false };
      }
    } catch (err) {
      if (err.status === 409 || err.message?.includes("already upvoted")) {
        return { success: false, alreadyUpvoted: true };
      }
      console.warn("⚠️ [Upvote Notice] Network issue, updating local upvote counter:", err.message);
    }

    // Local fallback
    setComplaints((prev) =>
      prev.map((item) =>
        item.id === complaintId ? { ...item, upvotes: (item.upvotes || 0) + 1 } : item
      )
    );
    return { success: true, alreadyUpvoted: false };
  };

  /**
   * Handler to Update Complaint Status (Called by DepartmentView)
   */
  const handleStatusChange = async (complaintId, newStatus, resolutionPhotoUrl = null) => {
    try {
      const res = await api.updateComplaintStatus(complaintId, {
        status: newStatus,
        resolutionPhotoUrl,
        officerName: departmentName || "Department Officer",
      });
      if (res && res.data) {
        setComplaints((prev) =>
          prev.map((item) =>
            item.id === complaintId || item.ticketId === complaintId ? res.data : item
          )
        );
        return;
      }
    } catch (err) {
      console.warn("⚠️ [Status Update Notice] Falling back to local state update:", err.message);
    }

    setComplaints((prev) =>
      prev.map((item) =>
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
   */
  const handleVerifyResolution = async (complaintId, isResolved) => {
    try {
      const res = await api.updateComplaintStatus(complaintId, {
        isResolved,
        citizenName,
      });
      if (res && res.data) {
        setComplaints((prev) =>
          prev.map((item) =>
            item.id === complaintId || item.ticketId === complaintId ? res.data : item
          )
        );
        return;
      }
    } catch (err) {
      console.warn("⚠️ [Verification Notice] Falling back to local state verification:", err.message);
    }

    setComplaints((prev) =>
      prev.map((item) => {
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
    <div className="min-h-screen bg-white text-[#111111] flex flex-col font-sans antialiased selection:bg-[#FFF1E6] selection:text-[#FF6B00]">
      
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        totalCount={complaints.length}
      />

      {/* Main View Container */}
      <main className="flex-1 bg-white">
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

      {/* Clean Monochrome Footer */}
      <footer className="bg-white border-t border-[#E5E5E5] text-[#6B6B6B] py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-[#111111] text-[#FF6B00] flex items-center justify-center font-bold">
              <Activity className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-[#111111]">
              CivicPulse Platform
            </span>
            <span className="text-[#E5E5E5]">|</span>
            <span className="text-[#6B6B6B]">
              Citizen Reporting, Priority Scoring & Two-Stage Resolution Audit
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#F5F5F5] text-[#111111] border border-[#E5E5E5]">
              <Code className="w-3 h-3 text-[#FF6B00]" /> React 19 + Vite + Node
            </span>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
              dbConnected
                ? "bg-[#FFF1E6] text-[#FF6B00] border-[#FF6B00]/30"
                : "bg-[#F5F5F5] text-[#111111] border-[#E5E5E5]"
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${dbConnected ? "bg-[#FF6B00] animate-pulse" : "bg-[#6B6B6B]"}`}></span>
              {dbConnected ? "PostgreSQL Synchronized" : "Local Resilient Engine"}
            </span>
          </div>

        </div>
      </footer>

    </div>
  );
}
