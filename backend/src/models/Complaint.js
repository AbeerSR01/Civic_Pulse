/**
 * Complaint.js
 * 
 * PostgreSQL Complaint Model & Query Helper.
 * Manages complaints, geolocation coordinates, upvotes, and status audit history.
 */

import { query } from "../config/db.js";

export const Complaint = {
  /**
   * Helper to format raw database row into API complaint object
   */
  _formatRow(row) {
    if (!row) return null;
    return {
      _id: row.id,
      id: row.ticket_id || `COMP-${row.id}`,
      dbId: row.id,
      ticketId: row.ticket_id,
      title: row.title,
      category: row.category,
      description: row.description,
      photoUrl: row.photo_url,
      location: row.address,
      address: row.address,
      lat: Number(row.lat !== undefined && row.lat !== null ? row.lat : 23.3441),
      lng: Number(row.lng !== undefined && row.lng !== null ? row.lng : 85.3096),
      status: row.status || "Pending",
      department: row.department,
      reportedBy: row.reported_by
        ? {
            _id: row.reported_by,
            id: row.reported_by,
            name: row.reporter_name || row.citizen_name,
            email: row.reporter_email || null,
            role: row.reporter_role || "citizen",
          }
        : null,
      citizenName: row.citizen_name || "Anonymous Citizen",
      createdBy: row.citizen_name || "Anonymous Citizen",
      upvoteCount: Number(row.upvote_count || 0),
      upvotes: Number(row.upvote_count || 0),
      upvoteUserIds: row.upvote_user_ids ? row.upvote_user_ids.filter(Boolean) : [],
      priorityScore: Number(row.priority_score || 0),
      slaDeadline: row.sla_deadline,
      resolutionPhotoUrl: row.resolution_proof_url,
      resolutionProofUrl: row.resolution_proof_url,
      resolvedBy: row.resolved_by
        ? {
            _id: row.resolved_by,
            id: row.resolved_by,
            name: row.resolver_name || null,
            email: row.resolver_email || null,
          }
        : null,
      resolvedAt: row.resolved_at,
      resolutionRemarks: row.resolution_remarks,
      reopenCount: Number(row.reopen_count || 0),
      statusHistory: row.status_history || [],
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  },

  /**
   * Create a new complaint
   */
  async create({
    title,
    category,
    description,
    photoUrl = null,
    address,
    lat = 23.3441,
    lng = 85.3096,
    status = "Reported",
    department,
    reportedBy = null,
    citizenName = "Anonymous Citizen",
    priorityScore = 0,
    slaDeadline = null,
    ticketId = null,
  }) {
    const finalTicketId = ticketId || `COMP-${Math.floor(100 + Math.random() * 900)}`;

    const text = `
      INSERT INTO complaints (
        ticket_id, title, category, description, photo_url, address, lat, lng,
        status, department, reported_by, citizen_name, priority_score, sla_deadline
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `;

    const values = [
      finalTicketId,
      title,
      category.toLowerCase(),
      description,
      photoUrl,
      address,
      lat,
      lng,
      status,
      department,
      reportedBy,
      citizenName,
      priorityScore,
      slaDeadline,
    ];

    const res = await query(text, values);
    const row = res.rows[0];

    // Auto-record initial status in audit history
    await query(
      `INSERT INTO complaint_status_history (complaint_id, previous_status, new_status, changed_by, officer_name, remarks)
       VALUES ($1, NULL, $2, $3, $4, $5)`,
      [row.id, status, reportedBy, citizenName, "Complaint submitted and logged."]
    );

    return this.findById(row.id);
  },

  /**
   * Find complaints with filters, search, sorting, and pagination
   */
  async findWithFilters({
    status,
    category,
    department,
    search,
    sortBy = "createdAt",
    sortOrder = "desc",
    limit = 50,
    offset = 0,
  }) {
    const conditions = [];
    const values = [];
    let paramIndex = 1;

    if (status && status !== "all") {
      conditions.push(`c.status = $${paramIndex++}`);
      values.push(status);
    }

    if (category && category !== "all") {
      conditions.push(`c.category = $${paramIndex++}`);
      values.push(category.toLowerCase());
    }

    if (department && department !== "all") {
      conditions.push(`LOWER(c.department) = LOWER($${paramIndex++})`);
      values.push(department);
    }

    if (search && search.trim()) {
      const searchPattern = `%${search.trim()}%`;
      conditions.push(`(
        c.ticket_id ILIKE $${paramIndex} OR
        c.title ILIKE $${paramIndex} OR
        c.description ILIKE $${paramIndex} OR
        c.address ILIKE $${paramIndex} OR
        c.department ILIKE $${paramIndex}
      )`);
      values.push(searchPattern);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // Sort order validation
    const orderDirection = sortOrder.toLowerCase() === "asc" ? "ASC" : "DESC";
    let sortColumn = "c.created_at";
    if (sortBy === "priorityScore") sortColumn = "c.priority_score";
    if (sortBy === "upvotes") sortColumn = "upvote_count";

    const text = `
      SELECT 
        c.*,
        u.name AS reporter_name,
        u.email AS reporter_email,
        u.role AS reporter_role,
        r.name AS resolver_name,
        r.email AS resolver_email,
        COALESCE(COUNT(DISTINCT up.id), 0)::int AS upvote_count,
        COALESCE(ARRAY_AGG(DISTINCT up.user_id) FILTER (WHERE up.user_id IS NOT NULL), '{}') AS upvote_user_ids
      FROM complaints c
      LEFT JOIN users u ON c.reported_by = u.id
      LEFT JOIN users r ON c.resolved_by = r.id
      LEFT JOIN complaint_upvotes up ON c.id = up.complaint_id
      ${whereClause}
      GROUP BY c.id, u.id, r.id
      ORDER BY ${sortColumn} ${orderDirection}
      LIMIT $${paramIndex++} OFFSET $${paramIndex}
    `;

    values.push(limit, offset);
    const res = await query(text, values);
    return res.rows.map((r) => this._formatRow(r));
  },

  /**
   * Count total complaints matching filters
   */
  async countWithFilters({ status, category, department, search }) {
    const conditions = [];
    const values = [];
    let paramIndex = 1;

    if (status && status !== "all") {
      conditions.push(`c.status = $${paramIndex++}`);
      values.push(status);
    }

    if (category && category !== "all") {
      conditions.push(`c.category = $${paramIndex++}`);
      values.push(category.toLowerCase());
    }

    if (department && department !== "all") {
      conditions.push(`LOWER(c.department) = LOWER($${paramIndex++})`);
      values.push(department);
    }

    if (search && search.trim()) {
      const searchPattern = `%${search.trim()}%`;
      conditions.push(`(
        c.ticket_id ILIKE $${paramIndex} OR
        c.title ILIKE $${paramIndex} OR
        c.description ILIKE $${paramIndex} OR
        c.address ILIKE $${paramIndex} OR
        c.department ILIKE $${paramIndex}
      )`);
      values.push(searchPattern);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const text = `
      SELECT COUNT(*)::int AS total
      FROM complaints c
      ${whereClause}
    `;

    const res = await query(text, values);
    return res.rows[0]?.total || 0;
  },

  /**
   * Find complaint by ID (integer) or ticket_id ("COMP-101")
   */
  async findById(idOrTicket) {
    const isInteger = Number.isInteger(Number(idOrTicket)) && !String(idOrTicket).startsWith("COMP-");

    const text = `
      SELECT 
        c.*,
        u.name AS reporter_name,
        u.email AS reporter_email,
        u.role AS reporter_role,
        r.name AS resolver_name,
        r.email AS resolver_email,
        COALESCE(COUNT(DISTINCT up.id), 0)::int AS upvote_count,
        COALESCE(ARRAY_AGG(DISTINCT up.user_id) FILTER (WHERE up.user_id IS NOT NULL), '{}') AS upvote_user_ids
      FROM complaints c
      LEFT JOIN users u ON c.reported_by = u.id
      LEFT JOIN users r ON c.resolved_by = r.id
      LEFT JOIN complaint_upvotes up ON c.id = up.complaint_id
      WHERE ${isInteger ? "c.id = $1" : "UPPER(c.ticket_id) = UPPER($1) OR c.id::text = $1"}
      GROUP BY c.id, u.id, r.id
      LIMIT 1
    `;

    const res = await query(text, [idOrTicket]);
    if (res.rows.length === 0) return null;

    const row = res.rows[0];

    // Fetch status history
    const historyRes = await query(
      `SELECT previous_status AS "previousStatus", new_status AS "newStatus", 
              changed_by AS "changedBy", officer_name AS "officerName", 
              remarks, resolution_proof_url AS "resolutionProofUrl", 
              changed_at AS "changedAt"
       FROM complaint_status_history
       WHERE complaint_id = $1
       ORDER BY changed_at ASC`,
      [row.id]
    );

    row.status_history = historyRes.rows;
    return this._formatRow(row);
  },

  /**
   * Update complaint status and append to history log
   */
  async updateStatus(idOrTicket, { status, remarks = null, officerName = null, changedBy = null, resolutionProofUrl = null }) {
    const complaint = await this.findById(idOrTicket);
    if (!complaint) return null;

    const previousStatus = complaint.status;
    const isResolved = status === "Resolved";
    const finalResolutionUrl = resolutionProofUrl || complaint.resolutionProofUrl;

    const updateText = `
      UPDATE complaints
      SET status = $1,
          resolution_proof_url = CASE WHEN $1 = 'Resolved' THEN $2 ELSE resolution_proof_url END,
          resolved_by = CASE WHEN $1 = 'Resolved' THEN $3 ELSE resolved_by END,
          resolved_at = CASE WHEN $1 = 'Resolved' THEN CURRENT_TIMESTAMP ELSE resolved_at END,
          resolution_remarks = CASE WHEN $1 = 'Resolved' THEN $4 ELSE resolution_remarks END,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING *
    `;

    await query(updateText, [
      status,
      finalResolutionUrl,
      changedBy,
      remarks || (isResolved ? "Issue resolved." : null),
      complaint.id,
    ]);

    // Insert history record
    await query(
      `INSERT INTO complaint_status_history (
        complaint_id, previous_status, new_status, changed_by, officer_name, remarks, resolution_proof_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        complaint.id,
        previousStatus,
        status,
        changedBy,
        officerName || "Department Officer",
        remarks,
        isResolved ? finalResolutionUrl : null,
      ]
    );

    return this.findById(complaint.id);
  },

  /**
   * Cast an upvote (avoids duplicate per user)
   */
  async addUpvote(idOrTicket, userId) {
    const complaint = await this.findById(idOrTicket);
    if (!complaint) return null;

    // If no user provided, return existing state
    if (!userId) {
      return { alreadyUpvoted: false, complaint };
    }

    const dbId = complaint.dbId || complaint._id || (typeof complaint.id === "number" ? complaint.id : 1);

    try {
      const insertSql = `
        INSERT INTO complaint_upvotes (complaint_id, user_id)
        VALUES ($1, $2)
        ON CONFLICT (complaint_id, user_id) DO NOTHING
        RETURNING id
      `;
      const res = await query(insertSql, [dbId, userId]);

      // If rowCount is 0, duplicate upvote prevented by UNIQUE(complaint_id, user_id)
      if (res.rowCount === 0) {
        return { alreadyUpvoted: true, complaint: await this.findById(dbId) };
      }
    } catch (err) {
      if (err.code === "23505") {
        return { alreadyUpvoted: true, complaint: await this.findById(dbId) };
      }
      throw err;
    }

    const updated = await this.findById(dbId);
    return { alreadyUpvoted: false, complaint: updated };
  },

  /**
   * Update priority score
   */
  async updatePriorityScore(complaintId, newScore) {
    await query(
      "UPDATE complaints SET priority_score = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
      [newScore, complaintId]
    );
  },

  /**
   * Get all complaints submitted by a user
   */
  async findByReportedBy(userId) {
    const text = `
      SELECT 
        c.*,
        u.name AS reporter_name,
        u.email AS reporter_email,
        u.role AS reporter_role,
        COALESCE(COUNT(DISTINCT up.id), 0)::int AS upvote_count
      FROM complaints c
      LEFT JOIN users u ON c.reported_by = u.id
      LEFT JOIN complaint_upvotes up ON c.id = up.complaint_id
      WHERE c.reported_by = $1
      GROUP BY c.id, u.id
      ORDER BY c.created_at DESC
    `;
    const res = await query(text, [userId]);
    return res.rows.map((r) => this._formatRow(r));
  },

  /**
   * Clean all complaints (for seed script)
   */
  async deleteAll() {
    await query("DELETE FROM complaint_status_history");
    await query("DELETE FROM complaint_upvotes");
    return query("DELETE FROM complaints");
  },
};

export default Complaint;
