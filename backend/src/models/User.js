/**
 * User.js
 * 
 * PostgreSQL User Model & Database Helper.
 */

import { query } from "../config/db.js";

export const User = {
  /**
   * Create a new user in PostgreSQL
   */
  async create({ name, email, passwordHash, role = "citizen", department = null, phoneNumber = null, avatarUrl = null }) {
    const text = `
      INSERT INTO users (name, email, password_hash, role, department, phone_number, avatar_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, name, email, role, department, phone_number AS "phoneNumber", avatar_url AS "avatarUrl", created_at AS "createdAt", updated_at AS "updatedAt"
    `;
    const values = [name, email.toLowerCase().trim(), passwordHash, role, department, phoneNumber, avatarUrl];
    const res = await query(text, values);
    return res.rows[0];
  },

  /**
   * Find user by email (includes password_hash for authentication)
   */
  async findByEmail(email) {
    const text = `
      SELECT id, name, email, password_hash AS "passwordHash", role, department, 
             phone_number AS "phoneNumber", avatar_url AS "avatarUrl", 
             created_at AS "createdAt", updated_at AS "updatedAt"
      FROM users
      WHERE LOWER(email) = LOWER($1)
      LIMIT 1
    `;
    const res = await query(text, [email.trim()]);
    return res.rows[0] || null;
  },

  /**
   * Find user by ID (excludes password hash)
   */
  async findById(id) {
    const text = `
      SELECT id, name, email, role, department, 
             phone_number AS "phoneNumber", avatar_url AS "avatarUrl", 
             created_at AS "createdAt", updated_at AS "updatedAt"
      FROM users
      WHERE id = $1
      LIMIT 1
    `;
    const res = await query(text, [id]);
    return res.rows[0] || null;
  },

  /**
   * Find user by role
   */
  async findByRole(role) {
    const text = `
      SELECT id, name, email, role, department, 
             phone_number AS "phoneNumber", avatar_url AS "avatarUrl", 
             created_at AS "createdAt"
      FROM users
      WHERE role = $1
      ORDER BY id ASC
    `;
    const res = await query(text, [role]);
    return res.rows;
  },

  /**
   * Count user complaints by status
   */
  async getUserStats(userId) {
    const text = `
      SELECT 
        COUNT(*)::int AS "totalSubmitted",
        COUNT(CASE WHEN status = 'Resolved' THEN 1 END)::int AS "resolvedCount",
        COUNT(CASE WHEN status IN ('Reported', 'Pending', 'Assigned', 'In Progress') THEN 1 END)::int AS "pendingCount"
      FROM complaints
      WHERE reported_by = $1
    `;
    const res = await query(text, [userId]);
    return res.rows[0] || { totalSubmitted: 0, resolvedCount: 0, pendingCount: 0 };
  },

  /**
   * Clean all users (for seed script)
   */
  async deleteAll() {
    return query("DELETE FROM users");
  },
};

export default User;
