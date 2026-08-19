/**
 * api.js
 * 
 * Frontend REST API Service for Civic Pulse.
 * Connects React UI to Express + PostgreSQL backend.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/**
 * Helper to make JSON HTTP requests with error handling
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMessage = data?.message || data?.error || `HTTP ${response.status}: Request failed`;
    const error = new Error(errorMessage);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  /**
   * Fetch all complaints with optional query filters
   */
  async getComplaints(params = {}) {
    const query = new URLSearchParams();
    if (params.status && params.status !== "all") query.append("status", params.status);
    if (params.category && params.category !== "all") query.append("category", params.category);
    if (params.department && params.department !== "all") query.append("department", params.department);
    if (params.search) query.append("search", params.search);
    if (params.limit) query.append("limit", params.limit);

    const queryString = query.toString() ? `?${query.toString()}` : "";
    return request(`/complaints${queryString}`, { method: "GET" });
  },

  /**
   * Fetch a single complaint by integer ID or Ticket ID (e.g., "COMP-101")
   */
  async getComplaintById(id) {
    return request(`/complaints/${encodeURIComponent(id)}`, { method: "GET" });
  },

  /**
   * Submit a new complaint to PostgreSQL
   */
  async createComplaint(complaintData, citizenName = null) {
    return request("/complaints", {
      method: "POST",
      headers: citizenName ? { "x-citizen-name": citizenName } : {},
      body: JSON.stringify({
        ...complaintData,
        citizenName: citizenName || complaintData.citizenName || "Anonymous Citizen",
      }),
    });
  },

  /**
   * Cast an upvote (atomic duplicate-prevention on PostgreSQL UNIQUE constraint)
   */
  async upvoteComplaint(complaintId, citizenName = null) {
    return request(`/complaints/${encodeURIComponent(complaintId)}/upvote`, {
      method: "POST",
      headers: citizenName ? { "x-citizen-name": citizenName } : {},
      body: JSON.stringify({
        citizenName: citizenName || "Citizen User",
      }),
    });
  },

  /**
   * Update complaint status (e.g. In Progress, Pending Verification, Resolved)
   */
  async updateComplaintStatus(complaintId, updateData) {
    return request(`/complaints/${encodeURIComponent(complaintId)}/status`, {
      method: "PATCH",
      body: JSON.stringify(updateData),
    });
  },

  /**
   * Fetch departments list and workload metrics
   */
  async getDepartments() {
    return request("/departments", { method: "GET" });
  },
};

export default api;
