/**
 * businessLogicHooks.js
 * 
 * ==============================================================================
 * MEMBER 5 EXTENSION HOOKS (Express + PostgreSQL)
 * ==============================================================================
 * 
 * Member 4 provides these clean service hooks so Member 5 can inject:
 * 1. Department Auto-routing algorithms
 * 2. Dynamic Priority Scoring algorithms
 * 3. SLA deadline calculations & breach monitors
 * 4. Citizen/Staff notification event handlers
 */

import Complaint from "../../models/Complaint.js";

// Baseline Category to Department mapping dictionary
export const DEFAULT_CATEGORY_DEPARTMENT_MAP = {
  pothole: "Public Works",
  garbage: "Sanitation",
  streetlight: "Electrical",
  water: "Water Supply",
  other: "General Services",
};

/**
 * HOOK 1: Department Auto-Routing
 * Called during complaint creation to determine responsible municipal department.
 * 
 * @param {Object} complaintData - { category, title, description, location }
 * @returns {Promise<string>} Assigned department name
 */
export async function routeDepartmentHook(complaintData) {
  // MEMBER 5: Replace or extend this logic with your NLP/auto-routing service
  const categoryKey = (complaintData.category || "").toLowerCase();
  return DEFAULT_CATEGORY_DEPARTMENT_MAP[categoryKey] || "General Services";
}

/**
 * HOOK 2: Priority Score Calculation
 * Called when creating or upvoting a complaint to calculate the priority score.
 * 
 * Formula (Default Hackathon Spec):
 * - Score = (Upvotes * 3) + (Days Since Created * 2)
 * 
 * @param {Object} complaint - Complaint record
 * @returns {Promise<number>} Calculated priority score
 */
export async function calculatePriorityScoreHook(complaint) {
  // MEMBER 5: Replace or extend with your priority scoring algorithm
  const upvotesCount = complaint.upvoteCount !== undefined
    ? complaint.upvoteCount
    : (Array.isArray(complaint.upvotes) ? complaint.upvotes.length : 0);
  
  const createdAt = complaint.createdAt ? new Date(complaint.createdAt) : new Date();
  const now = new Date();
  const diffInDays = Math.max(0, Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 3600 * 24)));

  const priorityScore = upvotesCount * 3 + diffInDays * 2;
  return priorityScore;
}

/**
 * HOOK 3: SLA Deadline Calculation
 * Called on complaint creation to set target resolution deadline.
 * 
 * Default Rule: 3 business days from creation.
 * 
 * @param {Object} complaintData 
 * @returns {Promise<Date>} Target resolution deadline
 */
export async function calculateSlaDeadlineHook(complaintData) {
  // MEMBER 5: Replace or extend with your SLA rules per category/priority
  const deadline = new Date();
  deadline.setDate(deadline.getDate() + 3); // 3 days SLA target
  return deadline;
}

/**
 * HOOK 4: Event Trigger - Complaint Created
 * Called after complaint is saved to DB.
 * 
 * @param {Object} complaint 
 * @param {Object} user 
 */
export async function onComplaintCreatedHook(complaint, user) {
  // MEMBER 5: Send confirmation SMS/Email, notify department officer
  console.log(`📣 [Hook: onComplaintCreated] Complaint ${complaint.ticketId || complaint.id} created and routed to ${complaint.department}`);
}

/**
 * HOOK 5: Event Trigger - Status Changed
 * Called after complaint status is updated or resolved.
 * 
 * @param {Object} complaint 
 * @param {string} oldStatus 
 * @param {string} newStatus 
 * @param {Object} user 
 */
export async function onComplaintStatusChangedHook(complaint, oldStatus, newStatus, user) {
  // MEMBER 5: Trigger notification to citizen and department head
  console.log(`📣 [Hook: onComplaintStatusChanged] Complaint ${complaint.ticketId || complaint.id} status: ${oldStatus} -> ${newStatus}`);
}

/**
 * HOOK 6: Event Trigger - Complaint Upvoted
 * Called after a user upvotes a complaint.
 * 
 * @param {Object} complaint 
 * @param {Object} user 
 */
export async function onComplaintUpvotedHook(complaint, user) {
  // Recalculate priority score on upvote
  const newScore = await calculatePriorityScoreHook(complaint);
  await Complaint.updatePriorityScore(complaint.id, newScore);
  console.log(`📣 [Hook: onComplaintUpvoted] Complaint ${complaint.ticketId || complaint.id} priority updated to ${newScore}`);
}
