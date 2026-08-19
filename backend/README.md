# Civic Pulse Backend (Express + PostgreSQL)

Backend REST API for **Civic Pulse**, a crowdsourced municipal issue reporting and resolution platform for citizens, city administrators, and municipal departments.

---

## Tech Stack
* **Runtime:** Node.js (ES Modules)
* **Framework:** Express.js 4.x
* **Database:** PostgreSQL (using `pg` Connection Pool)
* **Authentication:** Express JWT (`jsonwebtoken` + `bcryptjs`)
* **Photo Storage:** Multer + Cloudinary (with optional local/data-URI fallback)

---

## Directory Structure
```
backend/
├── .env.example              # Environment variables template
├── .gitignore                # Ignored files (node_modules, .env, etc.)
├── package.json              # Scripts & dependencies
├── src/
│   ├── app.js                # Express app setup, CORS, JSON parsing, error handlers
│   ├── server.js             # HTTP server listener & graceful shutdown
│   ├── seed.js               # PostgreSQL database seeding script (Ranchi initial complaints)
│   ├── config/
│   │   ├── db.js             # PostgreSQL connection pool & auto DDL initializer
│   │   └── cloudinary.js     # Cloudinary image upload stream helper
│   ├── models/
│   │   ├── schema.sql        # PostgreSQL DDL table & index definitions
│   │   ├── User.js           # PostgreSQL User model & queries
│   │   ├── Department.js     # Municipal department model & workload analytics
│   │   └── Complaint.js      # Complaint model with geolocation, upvotes & status history
│   ├── middleware/
│   │   ├── auth.js           # JWT Bearer token verification & token generation
│   │   ├── roles.js          # Role-based access control (admin, department, citizen)
│   │   ├── upload.js         # Multer image upload & Cloudinary streaming
│   │   └── errorHandler.js   # Centralized error handler with PostgreSQL error mapping
│   ├── controllers/
│   │   ├── auth.controller.js        # Register, login, verify & me
│   │   ├── user.controller.js        # User profile & user complaints
│   │   ├── complaint.controller.js   # Complaint CRUD, upvotes, status, resolve
│   │   └── department.controller.js  # Department listings & workload counts
│   ├── routes/
│   │   ├── index.js                  # Main API router (/api/...)
│   │   ├── auth.routes.js            # /api/auth (register, login, verify, me)
│   │   ├── user.routes.js            # /api/users
│   │   ├── complaint.routes.js       # /api/complaints
│   │   └── department.routes.js      # /api/departments
│   ├── services/
│   │   └── hooks/
│   │       └── businessLogicHooks.js # Clean extension hooks for Member 5
│   └── utils/
│       ├── apiResponse.js            # Standardized { success, data, message } wrapper
│       └── apiError.js               # Custom error class with HTTP status codes
```

---

## Getting Started

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Edit `.env` with your PostgreSQL credentials:
* `DATABASE_URL`: `postgresql://postgres:postgres@localhost:5432/civic_pulse` (or your Supabase / Neon / Render URI)
* `JWT_SECRET`: Secret key for JWT tokens
* `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: Cloudinary credentials
* `ALLOW_DEV_AUTH_BYPASS=true`: Allows testing with dev mock tokens (`Bearer dev-admin`, `Bearer dev-department`, `Bearer dev-citizen`)

### 3. Seed Initial Database Data
```bash
npm run seed
```

### 4. Start Development Server
```bash
npm run dev
```

Server will run at `http://localhost:5000`.

---

## Default Seeded Accounts (Password: `password123`)
* **Citizen:** `citizen@civicpulse.org`
* **Admin:** `admin@civicpulse.org`
* **Department Officer (Public Works):** `department@civicpulse.org`

---

## API Endpoints Reference

### 1. System Health
* `GET /api/health` — System status and PostgreSQL database connection check

### 2. Authentication
* `POST /api/auth/register` — Register a new user (`name`, `email`, `password`, `role`, `department`)
* `POST /api/auth/login` — Login with `email` and `password` (returns `{ user, token }`)
* `POST /api/auth/verify` — Verifies JWT token and returns authenticated user
* `GET /api/auth/me` — Current authenticated user profile

### 3. Users
* `GET /api/users/me` — Current authenticated user profile and stats
* `GET /api/users/:id/complaints` — Complaints submitted by a specific user

### 4. Complaints
* `POST /api/complaints` — Submit a complaint (supports multipart photo upload or JSON)
* `GET /api/complaints` — List complaints with filters (`?status=Pending&category=pothole&department=Public%20Works&search=Main%20Street&sortBy=priorityScore&sortOrder=desc`)
* `GET /api/complaints/:id` — Get single complaint by database ID or ticket ID (`COMP-101`)
* `PATCH /api/complaints/:id/status` — Update status (requires role `admin` or `department`)
* `POST /api/complaints/:id/upvote` — Upvote complaint (prevents duplicate upvotes per user)
* `POST /api/complaints/:id/resolve` — Resolve complaint with mandatory proof photo (`resolutionProof`)

### 5. Departments
* `GET /api/departments` — List departments and active ticket workload statistics

---

## Member 5 Integration Hooks
Member 5's business logic is cleanly plugged into `src/services/hooks/businessLogicHooks.js`:
* `routeDepartmentHook(complaintData)`: Department auto-routing
* `calculatePriorityScoreHook(complaint)`: Dynamic priority score formula
* `calculateSlaDeadlineHook(complaintData)`: SLA target deadline computation
* `onComplaintCreatedHook(complaint, user)`: Notification / event trigger
* `onComplaintStatusChangedHook(complaint, oldStatus, newStatus, user)`: Notification / status trigger
* `onComplaintUpvotedHook(complaint, user)`: Priority score recalculation trigger
