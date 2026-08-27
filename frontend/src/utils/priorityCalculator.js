/**
 * priorityCalculator.js
 * 
 * HACKATHON LESSON: PRIORITY SCORE & SLA OVERDUE ALGORITHM
 * 
 * Formula:
 * - Priority Score = (Upvotes * 3) + (Days Since Created * 2)
 * 
 * Priority Level Badges:
 * - Score > 15  --> High Priority   (Red Badge)
 * - Score > 7   --> Medium Priority (Yellow Badge)
 * - Otherwise   --> Low Priority    (Green Badge)
 * 
 * SLA Overdue Rule:
 * - If status is 'Pending' or 'In Progress' AND ticket is older than 3 days.
 */

/**
 * Calculates the number of days elapsed since the complaint creation date.
 * 
 * @param {string} createdAtStr - Date string (e.g., '2026-08-05 09:30 AM')
 * @returns {number} Days elapsed (minimum 0)
 */
export function getDaysSinceCreated(createdAtStr) {
  if (!createdAtStr) return 0;
  
  // Parse date string or fallback to now if invalid
  const createdDate = new Date(createdAtStr);
  if (isNaN(createdDate.getTime())) return 0;

  const now = new Date();
  const diffInTime = now.getTime() - createdDate.getTime();
  const diffInDays = Math.floor(diffInTime / (1000 * 3600 * 24));
  
  return Math.max(0, diffInDays);
}

/**
 * Calculates priority score and returns object with score, label, and Tailwind CSS badge styling.
 * 
 * @param {Object} complaint - The complaint object
 * @returns {Object} { score, daysOpen, label, colorClass, badgeBg }
 */
export function calculatePriority(complaint) {
  const upvotes = complaint.upvotes || 0;
  const daysOpen = getDaysSinceCreated(complaint.createdAt);
  const reopenPenalty = (complaint.reopenCount || 0) * 5;
  
  // Priority Score Formula: Upvotes * 3 + Days Open * 2 + Reopen Count * 5
  const score = upvotes * 3 + daysOpen * 2 + reopenPenalty;

  let label = "Low";
  let colorClass = "bg-[#F5F5F5] text-[#6B6B6B] border-[#E5E5E5]";
  let dotColor = "bg-[#6B6B6B]";

  if (score > 15) {
    label = "High";
    colorClass = "bg-[#FFF1E6] text-[#FF6B00] border-[#FF6B00]/30 font-bold";
    dotColor = "bg-[#FF6B00] animate-pulse";
  } else if (score > 7) {
    label = "Medium";
    colorClass = "bg-[#F5F5F5] text-[#111111] border-[#E5E5E5] font-semibold";
    dotColor = "bg-[#111111]";
  }

  return {
    score,
    daysOpen,
    label,
    colorClass,
    dotColor,
  };
}

/**
 * Checks if a ticket is SLA Overdue (open > 3 days in Pending or In Progress state).
 * 
 * @param {Object} complaint 
 * @returns {boolean} True if SLA is breached (>3 days open)
 */
export function isSLAOverdue(complaint) {
  if (complaint.status === "Resolved") return false;
  
  const daysOpen = getDaysSinceCreated(complaint.createdAt);
  return daysOpen > 3;
}
