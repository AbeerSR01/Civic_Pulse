/**
 * Department.js
 * 
 * PostgreSQL Department Model & Workload Analytics Helper.
 */

import { query } from "../config/db.js";

export const Department = {
  /**
   * Create a new department
   */
  async create({ name, code, description = "", contactEmail = null, assignedCategories = [] }) {
    const text = `
      INSERT INTO departments (name, code, description, contact_email, assigned_categories)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, name, code, description, contact_email AS "contactEmail", 
                assigned_categories AS "assignedCategories", is_active AS "isActive", 
                created_at AS "createdAt"
    `;
    const values = [name.trim(), code.toUpperCase().trim(), description, contactEmail, assignedCategories];
    const res = await query(text, values);
    return res.rows[0];
  },

  /**
   * Find all active departments
   */
  async findAll() {
    const text = `
      SELECT id, name, code, description, contact_email AS "contactEmail", 
             assigned_categories AS "assignedCategories", is_active AS "isActive", 
             created_at AS "createdAt"
      FROM departments
      WHERE is_active = TRUE
      ORDER BY name ASC
    `;
    const res = await query(text);
    return res.rows;
  },

  /**
   * Find department by name
   */
  async findByName(name) {
    const text = `
      SELECT id, name, code, description, contact_email AS "contactEmail", 
             assigned_categories AS "assignedCategories", is_active AS "isActive"
      FROM departments
      WHERE LOWER(name) = LOWER($1)
      LIMIT 1
    `;
    const res = await query(text, [name.trim()]);
    return res.rows[0] || null;
  },

  /**
   * Get all departments with real-time aggregate complaint workload statistics
   */
  async getWorkloadStats() {
    const text = `
      SELECT 
        d.id,
        d.name,
        d.code,
        d.description,
        d.contact_email AS "contactEmail",
        d.assigned_categories AS "assignedCategories",
        COUNT(c.id)::int AS "total",
        COUNT(CASE WHEN c.status IN ('Reported', 'Pending') THEN 1 END)::int AS "pending",
        COUNT(CASE WHEN c.status = 'In Progress' THEN 1 END)::int AS "inProgress",
        COUNT(CASE WHEN c.status = 'Resolved' THEN 1 END)::int AS "resolved"
      FROM departments d
      LEFT JOIN complaints c ON LOWER(c.department) = LOWER(d.name)
      WHERE d.is_active = TRUE
      GROUP BY d.id, d.name, d.code, d.description, d.contact_email, d.assigned_categories
      ORDER BY d.name ASC
    `;
    const res = await query(text);
    return res.rows.map((row) => ({
      id: row.id,
      name: row.name,
      code: row.code,
      description: row.description,
      contactEmail: row.contactEmail,
      assignedCategories: row.assignedCategories,
      stats: {
        total: row.total,
        pending: row.pending,
        inProgress: row.inProgress,
        resolved: row.resolved,
      },
    }));
  },

  /**
   * Clean all departments (for seed script)
   */
  async deleteAll() {
    return query("DELETE FROM departments");
  },
};

export default Department;
