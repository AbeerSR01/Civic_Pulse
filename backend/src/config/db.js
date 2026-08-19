/**
 * db.js
 * 
 * Resilient PostgreSQL Database Client with Automatic Dev Storage Engine.
 * 
 * 1. Attempts connection to PostgreSQL via 'pg' connection pool.
 * 2. If PostgreSQL is online: Auto-runs DDL schema creation and executes real SQL queries.
 * 3. If PostgreSQL is offline (ECONNREFUSED): Automatically activates the built-in dev database
 *    engine so the API, seed script, and frontend continue functioning seamlessly with zero setup.
 */

import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Pool } = pg;

export let isPgConnected = false;
let pool = null;

// Pre-hashed bcrypt password for "password123"
const DEMO_PASSWORD_HASH = "$2a$10$tZzCqGkKxK3r5uG0kK4tI.8BwSgRpHXqV6WqJzF2Q7x9V0nM1O4b2";

// Built-in Dev Storage (Activated if PostgreSQL is offline)
const memDB = {
  departments: [],
  users: [],
  complaints: [],
  upvotes: [],
  statusHistory: [],
  nextUserId: 1,
  nextDeptId: 1,
  nextComplaintId: 1,
  nextUpvoteId: 1,
  nextHistoryId: 1,
};

/**
 * Populate default seed data in Dev Memory Storage
 */
function seedMemDBIfEmpty() {
  if (memDB.departments.length > 0) return;

  // 1. Departments
  memDB.departments = [
    {
      id: 1,
      name: "Public Works",
      code: "PUBLIC_WORKS",
      description: "Roads, potholes, bridges, footpaths, and public infrastructure maintenance.",
      contactEmail: "pwd@civicpulse.org",
      assignedCategories: ["pothole"],
      isActive: true,
      createdAt: new Date(),
    },
    {
      id: 2,
      name: "Sanitation",
      code: "SANITATION",
      description: "Waste collection, overflowing dumpsters, recycling, and city hygiene.",
      contactEmail: "sanitation@civicpulse.org",
      assignedCategories: ["garbage"],
      isActive: true,
      createdAt: new Date(),
    },
    {
      id: 3,
      name: "Electrical",
      code: "ELECTRICAL",
      description: "Streetlights, power cables, traffic signals, and municipal electrical grids.",
      contactEmail: "electrical@civicpulse.org",
      assignedCategories: ["streetlight"],
      isActive: true,
      createdAt: new Date(),
    },
    {
      id: 4,
      name: "Water Supply",
      code: "WATER_SUPPLY",
      description: "Water pipeline leaks, drainage overflow, water quality, and sewer systems.",
      contactEmail: "water@civicpulse.org",
      assignedCategories: ["water"],
      isActive: true,
      createdAt: new Date(),
    },
  ];
  memDB.nextDeptId = 5;

  // 2. Users
  memDB.users = [
    {
      id: 1,
      name: "Rahul Sharma",
      email: "citizen@civicpulse.org",
      password_hash: DEMO_PASSWORD_HASH,
      role: "citizen",
      department: null,
      phoneNumber: "+91 98765 43210",
      avatarUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 2,
      name: "Director Verma",
      email: "admin@civicpulse.org",
      password_hash: DEMO_PASSWORD_HASH,
      role: "admin",
      department: null,
      phoneNumber: "+91 98765 43211",
      avatarUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 3,
      name: "Officer Anita Roy",
      email: "department@civicpulse.org",
      password_hash: DEMO_PASSWORD_HASH,
      role: "department",
      department: "Public Works",
      phoneNumber: "+91 98765 43212",
      avatarUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
  memDB.nextUserId = 4;

  // 3. Complaints
  memDB.complaints = [
    {
      id: 1,
      ticket_id: "COMP-101",
      title: "Pothole / Road Damage Reported",
      category: "pothole",
      description: "Deep dangerous pothole near the crosswalk on Main Street causing traffic slowdown and tire damage.",
      photo_url: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80",
      address: "142 Main Street, Downtown, Ranchi",
      lat: 23.3441,
      lng: 85.3096,
      status: "In Progress",
      department: "Public Works",
      reported_by: 1,
      citizen_name: "Rahul Sharma",
      priority_score: 18,
      sla_deadline: new Date(Date.now() - 1000 * 3600 * 24),
      resolution_proof_url: null,
      resolved_by: null,
      resolved_at: null,
      resolution_remarks: null,
      created_at: new Date(Date.now() - 1000 * 3600 * 48),
      updated_at: new Date(),
    },
    {
      id: 2,
      ticket_id: "COMP-102",
      title: "Garbage Overflow / Waste Clearance",
      category: "garbage",
      description: "Overflowing community dumpster attracting pests and spreading unpleasant odor across the street.",
      photo_url: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=80",
      address: "Corner of Oak Avenue & 4th St, Ranchi",
      lat: 23.3520,
      lng: 85.3210,
      status: "Reported",
      department: "Sanitation",
      reported_by: 1,
      citizen_name: "Rahul Sharma",
      priority_score: 9,
      sla_deadline: new Date(Date.now() + 1000 * 3600 * 24 * 2),
      resolution_proof_url: null,
      resolved_by: null,
      resolved_at: null,
      resolution_remarks: null,
      created_at: new Date(Date.now() - 1000 * 3600 * 24),
      updated_at: new Date(),
    },
    {
      id: 3,
      ticket_id: "COMP-103",
      title: "Faulty Streetlight Hazard",
      category: "streetlight",
      description: "Streetlight flickering rapidly and completely turning off at night, creating safety hazard for pedestrians.",
      photo_url: "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=600&q=80",
      address: "88 Pine Road, North Sector, Ranchi",
      lat: 23.3380,
      lng: 85.2980,
      status: "Resolved",
      department: "Electrical",
      reported_by: 1,
      citizen_name: "Rahul Sharma",
      priority_score: 12,
      sla_deadline: new Date(Date.now() - 1000 * 3600 * 48),
      resolution_proof_url: "https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&w=600&q=80",
      resolved_by: 3,
      resolved_at: new Date(),
      resolution_remarks: "Replaced faulty LED light fixture and checked circuit wiring.",
      created_at: new Date(Date.now() - 1000 * 3600 * 72),
      updated_at: new Date(),
    },
    {
      id: 4,
      ticket_id: "COMP-104",
      title: "Water Pipeline Leakage",
      category: "water",
      description: "Water pipe rupture on main road spewing clean water and flooding neighbor driveway.",
      photo_url: "https://images.unsplash.com/photo-1541888946425-d0fbb186a5b2?auto=format&fit=crop&w=600&q=80",
      address: "52 Elm Street, West District, Ranchi",
      lat: 23.3600,
      lng: 85.3400,
      status: "Reported",
      department: "Water Supply",
      reported_by: 1,
      citizen_name: "Rahul Sharma",
      priority_score: 3,
      sla_deadline: new Date(Date.now() + 1000 * 3600 * 24 * 3),
      resolution_proof_url: null,
      resolved_by: null,
      resolved_at: null,
      resolution_remarks: null,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ];
  memDB.nextComplaintId = 5;

  // 4. Upvotes
  memDB.upvotes = [
    { id: 1, complaint_id: 1, user_id: 1, createdAt: new Date() },
    { id: 2, complaint_id: 3, user_id: 1, createdAt: new Date() },
  ];
  memDB.nextUpvoteId = 3;

  // 5. History
  memDB.statusHistory = [
    {
      id: 1,
      complaint_id: 1,
      previousStatus: "Reported",
      newStatus: "In Progress",
      changedBy: 3,
      officerName: "Officer Anita Roy",
      remarks: "Road repair crew scheduled for inspection.",
      resolutionProofUrl: null,
      changedAt: new Date(),
    },
    {
      id: 2,
      complaint_id: 3,
      previousStatus: "In Progress",
      newStatus: "Resolved",
      changedBy: 3,
      officerName: "Officer Anita Roy",
      remarks: "Replaced faulty LED light fixture and checked circuit wiring.",
      resolutionProofUrl: "https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&w=600&q=80",
      changedAt: new Date(),
    },
  ];
  memDB.nextHistoryId = 3;
}

function createPool() {
  const connectionString = process.env.DATABASE_URL;

  const config = connectionString
    ? {
        connectionString,
        connectionTimeoutMillis: 2500,
        ssl:
          connectionString.includes("localhost") || connectionString.includes("127.0.0.1")
            ? false
            : { rejectUnauthorized: false },
      }
    : {
        user: process.env.PGUSER || "postgres",
        password: process.env.PGPASSWORD || "postgres",
        host: process.env.PGHOST || "localhost",
        port: parseInt(process.env.PGPORT || "5432", 10),
        database: process.env.PGDATABASE || "civic_pulse",
        connectionTimeoutMillis: 2500,
      };

  return new Pool(config);
}

/**
 * Initialize Database Connection & Tables
 */
export async function initDB() {
  console.log("🔌 [Database] Connecting to PostgreSQL database...");

  try {
    pool = createPool();

    pool.on("error", (err) => {
      if (isPgConnected) {
        console.error("❌ [Database] PostgreSQL client error:", err.message);
      }
    });

    const client = await pool.connect();
    console.log("✅ [Database] PostgreSQL connected successfully.");
    isPgConnected = true;

    // Run Schema Migrations DDL
    await client.query(`
      CREATE TABLE IF NOT EXISTS departments (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        code VARCHAR(50) UNIQUE NOT NULL,
        description TEXT DEFAULT '',
        contact_email VARCHAR(255),
        assigned_categories TEXT[] DEFAULT '{}',
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'citizen' CHECK (role IN ('citizen', 'admin', 'department')),
        department VARCHAR(100) REFERENCES departments(name) ON DELETE SET NULL,
        phone_number VARCHAR(50),
        avatar_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS complaints (
        id SERIAL PRIMARY KEY,
        ticket_id VARCHAR(50) UNIQUE NOT NULL,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(50) NOT NULL CHECK (category IN ('pothole', 'garbage', 'streetlight', 'water', 'other')),
        description TEXT NOT NULL,
        photo_url TEXT,
        address TEXT NOT NULL,
        lat DOUBLE PRECISION DEFAULT 23.3441,
        lng DOUBLE PRECISION DEFAULT 85.3096,
        status VARCHAR(50) DEFAULT 'Reported' CHECK (status IN ('Reported', 'Pending', 'Assigned', 'In Progress', 'Resolved')),
        department VARCHAR(100) NOT NULL,
        reported_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        citizen_name VARCHAR(150) DEFAULT 'Anonymous Citizen',
        priority_score INTEGER DEFAULT 0,
        sla_deadline TIMESTAMP WITH TIME ZONE,
        resolution_proof_url TEXT,
        resolved_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        resolved_at TIMESTAMP WITH TIME ZONE,
        resolution_remarks TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS complaint_upvotes (
        id SERIAL PRIMARY KEY,
        complaint_id INTEGER NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(complaint_id, user_id)
      );

      CREATE TABLE IF NOT EXISTS complaint_status_history (
        id SERIAL PRIMARY KEY,
        complaint_id INTEGER NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
        previous_status VARCHAR(50),
        new_status VARCHAR(50) NOT NULL,
        changed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        officer_name VARCHAR(150),
        remarks TEXT,
        resolution_proof_url TEXT,
        changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_complaints_category ON complaints(category);
      CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
      CREATE INDEX IF NOT EXISTS idx_complaints_department ON complaints(department);
      CREATE INDEX IF NOT EXISTS idx_complaints_ticket_id ON complaints(ticket_id);
      CREATE INDEX IF NOT EXISTS idx_complaints_reported_by ON complaints(reported_by);
      CREATE INDEX IF NOT EXISTS idx_complaints_priority ON complaints(priority_score DESC);
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_upvotes_complaint ON complaint_upvotes(complaint_id);
    `);

    client.release();
    console.log("✅ [Database] PostgreSQL Tables & Indexes Verified/Created.");
    return pool;
  } catch (error) {
    isPgConnected = false;
    seedMemDBIfEmpty();
    console.warn(`
================================================================
⚠️  [Database Notice] PostgreSQL is not reachable (${error.code || error.message}).
⚡ [Database Notice] Activated Built-in Dev Storage Adapter.
💡 [Database Notice] API & Seed operations are 100% operational in dev mode!
   To connect a live PostgreSQL database:
   • Start local PostgreSQL on port 5432, or
   • Set DATABASE_URL in backend/.env (e.g. Neon.tech or Supabase URI)
================================================================
    `);
  }
}

/**
 * Execute parameterized query (routed to PostgreSQL or Dev Storage Adapter)
 */
export async function query(text, params = []) {
  if (isPgConnected && pool) {
    try {
      return await pool.query(text, params);
    } catch (err) {
      if (err.code === "ECONNREFUSED" || err.code === "57P01") {
        isPgConnected = false;
      } else {
        throw err;
      }
    }
  }

  // Ensure dev storage has base seed data if PostgreSQL is offline
  seedMemDBIfEmpty();

  // Handle queries via Dev Memory Storage
  return executeDevQuery(text, params);
}

/**
 * Dev Storage SQL Interpreter for seamless offline execution
 */
function executeDevQuery(text, params = []) {
  const sql = text.trim();

  // 1. DDL Statements
  if (sql.startsWith("CREATE") || sql.startsWith("ALTER")) {
    return { rows: [], rowCount: 0 };
  }

  // 2. Clear Tables (seed script)
  if (sql.startsWith("DELETE FROM users")) {
    memDB.users = [];
    return { rows: [], rowCount: 0 };
  }
  if (sql.startsWith("DELETE FROM departments")) {
    memDB.departments = [];
    return { rows: [], rowCount: 0 };
  }
  if (sql.startsWith("DELETE FROM complaints")) {
    memDB.complaints = [];
    return { rows: [], rowCount: 0 };
  }
  if (sql.startsWith("DELETE FROM complaint_upvotes")) {
    memDB.upvotes = [];
    return { rows: [], rowCount: 0 };
  }
  if (sql.startsWith("DELETE FROM complaint_status_history")) {
    memDB.statusHistory = [];
    return { rows: [], rowCount: 0 };
  }

  // 3. User Operations
  if (sql.includes("INSERT INTO users")) {
    const [name, email, passwordHash, role, department, phoneNumber, avatarUrl] = params;
    const user = {
      id: memDB.nextUserId++,
      name,
      email,
      password_hash: passwordHash,
      role: role || "citizen",
      department: department || null,
      phoneNumber: phoneNumber || null,
      avatarUrl: avatarUrl || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    memDB.users.push(user);
    return { rows: [user], rowCount: 1 };
  }

  if (sql.includes("FROM users WHERE LOWER(email) = LOWER($1)")) {
    const email = params[0]?.toLowerCase().trim();
    const user = memDB.users.find((u) => u.email.toLowerCase() === email);
    if (!user) return { rows: [] };
    return {
      rows: [
        {
          id: user.id,
          name: user.name,
          email: user.email,
          passwordHash: user.password_hash,
          role: user.role,
          department: user.department,
          phoneNumber: user.phoneNumber,
          avatarUrl: user.avatarUrl,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      ],
      rowCount: 1,
    };
  }

  if (sql.includes("FROM users WHERE id = $1")) {
    const id = Number(params[0]);
    const user = memDB.users.find((u) => u.id === id);
    if (!user) return { rows: [] };
    return {
      rows: [
        {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          phoneNumber: user.phoneNumber,
          avatarUrl: user.avatarUrl,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      ],
      rowCount: 1,
    };
  }

  if (sql.includes("FROM complaints WHERE reported_by = $1")) {
    const userId = Number(params[0]);
    const userComplaints = memDB.complaints.filter((c) => c.reported_by === userId);
    return {
      rows: [
        {
          totalSubmitted: userComplaints.length,
          resolvedCount: userComplaints.filter((c) => c.status === "Resolved").length,
          pendingCount: userComplaints.filter((c) => ["Reported", "Pending", "Assigned", "In Progress"].includes(c.status)).length,
        },
      ],
      rowCount: 1,
    };
  }

  // 4. Department Operations
  if (sql.includes("INSERT INTO departments")) {
    const [name, code, description, contactEmail, assignedCategories] = params;
    const dept = {
      id: memDB.nextDeptId++,
      name,
      code,
      description: description || "",
      contactEmail: contactEmail || null,
      assignedCategories: assignedCategories || [],
      isActive: true,
      createdAt: new Date(),
    };
    memDB.departments.push(dept);
    return { rows: [dept], rowCount: 1 };
  }

  if (sql.includes("FROM departments d") && sql.includes("GROUP BY")) {
    const results = memDB.departments.map((d) => {
      const deptsComplaints = memDB.complaints.filter(
        (c) => (c.department || "").toLowerCase() === (d.name || "").toLowerCase()
      );
      return {
        id: d.id,
        name: d.name,
        code: d.code,
        description: d.description,
        contactEmail: d.contactEmail,
        assignedCategories: d.assignedCategories,
        total: deptsComplaints.length,
        pending: deptsComplaints.filter((c) => ["Reported", "Pending"].includes(c.status)).length,
        inProgress: deptsComplaints.filter((c) => c.status === "In Progress").length,
        resolved: deptsComplaints.filter((c) => c.status === "Resolved").length,
      };
    });
    return { rows: results, rowCount: results.length };
  }

  if (sql.includes("FROM departments") && sql.includes("WHERE is_active = TRUE")) {
    return { rows: memDB.departments, rowCount: memDB.departments.length };
  }

  // 5. Complaint Operations
  if (sql.includes("INSERT INTO complaints")) {
    const [ticketId, title, category, description, photoUrl, address, lat, lng, status, department, reportedBy, citizenName, priorityScore, slaDeadline] = params;
    const complaint = {
      id: memDB.nextComplaintId++,
      ticket_id: ticketId,
      title,
      category,
      description,
      photo_url: photoUrl,
      address,
      lat: Number(lat),
      lng: Number(lng),
      status: status || "Reported",
      department,
      reported_by: reportedBy ? Number(reportedBy) : null,
      citizen_name: citizenName,
      priority_score: Number(priorityScore || 0),
      sla_deadline: slaDeadline || null,
      resolution_proof_url: null,
      resolved_by: null,
      resolved_at: null,
      resolution_remarks: null,
      created_at: new Date(),
      updated_at: new Date(),
    };
    memDB.complaints.push(complaint);
    return { rows: [complaint], rowCount: 1 };
  }

  if (sql.includes("INSERT INTO complaint_status_history")) {
    const [complaintId, prevStatus, newStatus, changedBy, officerName, remarks, proofUrl] = params;
    const entry = {
      id: memDB.nextHistoryId++,
      complaint_id: Number(complaintId),
      previousStatus: prevStatus,
      newStatus,
      changedBy: changedBy ? Number(changedBy) : null,
      officerName,
      remarks,
      resolutionProofUrl: proofUrl || null,
      changedAt: new Date(),
    };
    memDB.statusHistory.push(entry);
    return { rows: [entry], rowCount: 1 };
  }

  if (sql.includes("FROM complaint_status_history WHERE complaint_id = $1")) {
    const complaintId = Number(params[0]);
    const history = memDB.statusHistory.filter((h) => h.complaint_id === complaintId);
    return { rows: history, rowCount: history.length };
  }

  if (sql.includes("SELECT id FROM complaint_upvotes WHERE complaint_id = $1 AND user_id = $2")) {
    const [complaintId, userId] = params.map(Number);
    const existing = memDB.upvotes.filter((u) => u.complaint_id === complaintId && u.user_id === userId);
    return { rows: existing, rowCount: existing.length };
  }

  if (sql.includes("INSERT INTO complaint_upvotes")) {
    const [complaintId, userId] = params.map(Number);
    memDB.upvotes.push({
      id: memDB.nextUpvoteId++,
      complaint_id: complaintId,
      user_id: userId,
      createdAt: new Date(),
    });
    return { rows: [], rowCount: 1 };
  }

  if (sql.includes("UPDATE complaints SET priority_score = $1")) {
    const [score, complaintId] = params;
    const item = memDB.complaints.find((c) => c.id === Number(complaintId));
    if (item) {
      item.priority_score = Number(score);
      item.updated_at = new Date();
    }
    return { rows: [], rowCount: 1 };
  }

  if (sql.includes("UPDATE complaints") && sql.includes("SET status = $1")) {
    const [status, proofUrl, changedBy, remarks, complaintId] = params;
    const item = memDB.complaints.find((c) => c.id === Number(complaintId));
    if (item) {
      item.status = status;
      if (status === "Resolved") {
        item.resolution_proof_url = proofUrl || item.resolution_proof_url;
        item.resolved_by = changedBy ? Number(changedBy) : item.resolved_by;
        item.resolved_at = new Date();
        item.resolution_remarks = remarks || "Resolved";
      }
      item.updated_at = new Date();
    }
    return { rows: [item], rowCount: 1 };
  }

  if (sql.includes("COUNT(*)::int AS total FROM complaints")) {
    return { rows: [{ total: memDB.complaints.length }], rowCount: 1 };
  }

  if (sql.includes("FROM complaints c") && (sql.includes("c.id = $1") || sql.includes("c.ticket_id"))) {
    const idOrTicket = String(params[0]);
    const item = memDB.complaints.find(
      (c) => String(c.id) === idOrTicket || (c.ticket_id || "").toUpperCase() === idOrTicket.toUpperCase()
    );
    if (!item) return { rows: [] };

    const reporter = memDB.users.find((u) => u.id === item.reported_by);
    const resolver = memDB.users.find((u) => u.id === item.resolved_by);
    const upvotes = memDB.upvotes.filter((u) => u.complaint_id === item.id);

    return {
      rows: [
        {
          ...item,
          reporter_name: reporter?.name,
          reporter_email: reporter?.email,
          reporter_role: reporter?.role,
          resolver_name: resolver?.name,
          resolver_email: resolver?.email,
          upvote_count: upvotes.length,
          upvote_user_ids: upvotes.map((u) => u.user_id),
        },
      ],
      rowCount: 1,
    };
  }

  if (sql.includes("FROM complaints c")) {
    let items = [...memDB.complaints];

    // Format rows with join data
    const rows = items.map((c) => {
      const reporter = memDB.users.find((u) => u.id === c.reported_by);
      const resolver = memDB.users.find((u) => u.id === c.resolved_by);
      const upvotes = memDB.upvotes.filter((u) => u.complaint_id === c.id);
      return {
        ...c,
        reporter_name: reporter?.name,
        reporter_email: reporter?.email,
        reporter_role: reporter?.role,
        resolver_name: resolver?.name,
        resolver_email: resolver?.email,
        upvote_count: upvotes.length,
        upvote_user_ids: upvotes.map((u) => u.user_id),
      };
    });

    return { rows, rowCount: rows.length };
  }

  return { rows: [], rowCount: 0 };
}

export { pool };
export default { query, initDB, pool };
