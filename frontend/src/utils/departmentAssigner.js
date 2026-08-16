/**
 * departmentAssigner.js
 * 
 * HACKATHON LESSON: AUTO-ASSIGNMENT LOGIC
 * This file contains the logic that automatically routes a civic complaint
 * to the correct government department based on its category.
 * 
 * Category to Department Mapping:
 * - 'pothole'     --> "Public Works"
 * - 'garbage'     --> "Sanitation"
 * - 'streetlight' --> "Electrical"
 * - 'water'       --> "Water Supply"
 */

// Dictionary mapping issue categories to their responsible departments
export const CATEGORY_DEPARTMENT_MAP = {
  pothole: "Public Works",
  garbage: "Sanitation",
  streetlight: "Electrical",
  water: "Water Supply",
};

// Human-friendly display labels for categories
export const CATEGORY_LABELS = {
  pothole: "Pothole / Road Repair",
  garbage: "Garbage Overflow",
  streetlight: "Streetlight Fault",
  water: "Water Pipeline Leak",
};

/**
 * Returns the auto-assigned department name given a complaint category key.
 * If category is unknown, defaults to 'General Services'.
 * 
 * @param {string} category - The issue category key (e.g. 'pothole')
 * @returns {string} The assigned department name
 */
export function getDepartmentForCategory(category) {
  return CATEGORY_DEPARTMENT_MAP[category] || "General Services";
}
