-- ============================================================================
-- Civic Pulse PostgreSQL Relational Database Schema
-- SIH Project Backend: Express + PostgreSQL
-- ============================================================================

-- 1. Municipal Departments Table
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

-- 2. Users Table (Citizens, Administrators, Department Officers)
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

-- 3. Civic Complaints Table
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
    status VARCHAR(50) DEFAULT 'Reported' CHECK (status IN ('Reported', 'Pending', 'Assigned', 'In Progress', 'Pending Verification', 'Resolved')),
    department VARCHAR(100) NOT NULL,
    reported_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    citizen_name VARCHAR(150) DEFAULT 'Anonymous Citizen',
    priority_score INTEGER DEFAULT 0,
    sla_deadline TIMESTAMP WITH TIME ZONE,
    resolution_proof_url TEXT,
    resolved_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolution_remarks TEXT,
    reopen_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Upvotes Table (Prevents duplicate upvoting per user via UNIQUE constraint)
CREATE TABLE IF NOT EXISTS complaint_upvotes (
    id SERIAL PRIMARY KEY,
    complaint_id INTEGER NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(complaint_id, user_id)
);

-- 5. Complaint Status History Audit Log
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

-- Indexes for high-efficiency querying & reporting
CREATE INDEX IF NOT EXISTS idx_complaints_category ON complaints(category);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_department ON complaints(department);
CREATE INDEX IF NOT EXISTS idx_complaints_ticket_id ON complaints(ticket_id);
CREATE INDEX IF NOT EXISTS idx_complaints_reported_by ON complaints(reported_by);
CREATE INDEX IF NOT EXISTS idx_complaints_priority ON complaints(priority_score DESC);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_upvotes_complaint ON complaint_upvotes(complaint_id);
