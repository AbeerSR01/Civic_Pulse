# CivicSense — Backend Foundation & Architecture Plan (Member 4)

> **Document Version:** 1.0.0  
> **Author:** Member 4 (Backend Foundation, PostgreSQL, Prisma ORM, REST APIs)  
> **Target Audience:** Full Hackathon Team (Members 1 through 6)  
> **Status:** Awaiting Team & Lead Review

---

## 1. Executive Summary & Objective

This document outlines the complete backend architecture, database design, REST API contracts, and team integration strategy for **CivicSense** (CivicPulse), a crowdsourced municipal issue reporting and resolution platform.

### Scope Separation
* **Member 4 Scope (This Plan & Foundation):**
  * PostgreSQL database schema & Prisma ORM modeling
  * Express.js backend infrastructure (middleware, configuration, error handling, validation)
  * Complete REST API endpoints & CRUD operations for Complaints, Departments, Upvotes, and Status Transitions
  * Seed data mirroring the frontend prototype's initial dataset (Ranchi sector)
  * Clean extension hooks for Member 5's business logic
* **Member 5 Scope (Separate - Not Implemented by Member 4):**
  * Advanced department auto-routing algorithms
  * Dynamic priority scoring & SLA breach background calculation
  * In-app / external notification delivery
  * Specialized business analytics & intelligence aggregations
* **Frontend Scope (Members 2 & 3):**
  * React 19 + Tailwind CSS + Leaflet UI
  * Replacing in-memory state in `App.jsx` with standard API service calls

---

## 2. Existing Frontend Codebase Audit

Before proposing backend designs, we audited the existing repository:

### Tech Stack Observed
* **Framework:** React 19 (`react`, `react-dom`) + Vite 8
* **Styling:** Tailwind CSS v4 (`@tailwindcss/vite`, `tailwindcss`)
* **Mapping:** Leaflet 1.9.4, `leaflet.heat` 0.2.0, `react-leaflet` 5.0.0
* **Data Visualization:** Recharts 3.10.1
* **Icons:** Lucide React (`lucide-react`)
* **Linter:** Oxlint

### Frontend State & Data Flow
* **Single Shared State:** Root state in `src/App.jsx` holding an array of complaints initialized from `src/data/initialComplaints.js`.
* **Citizen View (`src/components/CitizenView.jsx`):**
  * Citizen name sign-in prompt (stored in `App.jsx` state)
  * Submit form: `category` (dropdown), `description` (text), `location` (text), `photoFile`/`photoPreview` (file/preview), `lat`/`lng` (GPS via `navigator.geolocation` or fallback)
  * List with Upvote button (`onUpvote(id)`)
* **Admin View (`src/components/AdminView.jsx`):**
  * Admin name sign-in prompt
  * KPI metric counters: Total, Pending, In Progress, Resolved
  * Multi-filters: Search term, Status, Category, Department
  * Mode Switcher: **Table Directory** vs **Map & Heatmap** vs **Analytics View**
* **Admin Map & Heatmap (`src/components/AdminMapView.jsx`):**
  * Map centered on Ranchi, Jharkhand (`lat: 23.3441, lng: 85.3096`)
  * Marker pins with popup summaries
  * Priority Heatmap layer powered by `leaflet.heat` taking `[lat, lng, normalized_priority_intensity]`
* **Admin Analytics (`src/components/AdminAnalyticsView.jsx`):**
  * Category distribution (Bar chart)
  * Status breakdown (Donut/Pie chart)
  * Department workload distribution (Bar chart)
* **Department View (`src/components/DepartmentView.jsx`):**
  * Department officer sign-in prompt + Department dropdown switcher
  * Filtered complaints assigned to that department
  * Status action buttons: Pending, In Progress, Resolved
  * **Resolution Proof Workflow:** Mandatory proof photo upload modal when marking status as "Resolved"

### Existing Frontend Data Contracts (Complaint Model)
```javascript
{
  id: "COMP-101",                     // Unique string ID
  category: "pothole",                // 'pothole' | 'garbage' | 'streetlight' | 'water'
  description: "Deep dangerous...",   // String
  location: "142 Main Street...",     // String address / landmark
  photoUrl: "https://...",            // URL string or base64
  status: "In Progress",              // 'Pending' | 'In Progress' | 'Resolved'
  department: "Public Works",         // 'Public Works' | 'Sanitation' | 'Electrical' | 'Water Supply'
  upvotes: 6,                         // Integer >= 0
  createdAt: "2026-08-07 09:30 AM",   // Formatted date string
  resolutionPhotoUrl: "https://...",  // URL string | null
  lat: 23.3441,                       // Float latitude (Ranchi centered)
  lng: 85.3096                        // Float longitude (Ranchi centered)
}
```

### Inviolable Rules / What Must NOT Be Changed
1. **Frontend compatibility:** The backend response payload for complaints **must match or map cleanly to the exact field names** expected by the React frontend components (`id`, `category`, `description`, `location`, `photoUrl`, `status`, `department`, `upvotes`, `createdAt`, `resolutionPhotoUrl`, `lat`, `lng`).
2. **Business logic encapsulation:** Member 4 builds standard CRUD and database operations; all priority score formulas, auto-routing rules, and SLA tracking are decoupled into isolated service hooks for Member 5.
3. **No unnecessary architecture complexity:** No microservices, GraphQL, Redis, Docker, or Kubernetes. Use clean Express.js + Prisma + PostgreSQL.

---

## 3. Backend System Architecture

```
                                  +---------------------------------------+
                                  |         React 19 Frontend             |
                                  |  (Citizen, Admin, Department Views)   |
                                  +---------------------------------------+
                                                     |
                                                     | HTTP / REST (JSON)
                                                     v
+---------------------------------------------------------------------------------------------------------+
|                                        Node.js + Express Server                                         |
|                                                                                                         |
|  [ Middlewares ]                                                                                        |
|  - CORS & Helmet                                                                                        |
|  - Request Body Parser (JSON, URL-encoded)                                                              |
|  - Request Validation (Joi / Zod schema checks)                                                         |
|  - Global Centralized Error Handling                                                                    |
|                                                                                                         |
|  [ Routes / Controllers ]                                                                               |
|  - /api/v1/complaints   --> ComplaintController (CRUD, Upvotes, Status Updates)                         |
|  - /api/v1/departments  --> DepartmentController (List, Filter by Department)                           |
|  - /api/v1/analytics    --> AnalyticsController (Summary, Category, Workload, Map Heatmap)              |
|                                                                                                         |
|  [ Core Services (Member 4) ]                   [ Business Logic Extension Hooks (Member 5) ]           |
|  - ComplaintService (DB CRUD queries)            - RoutingService (Auto-department assignment)           |
|  - DepartmentService                             - PriorityService (Score & SLA overdue calculation)     |
|  - UpvoteService                                 - NotificationService (Event triggers)                  |
|  - StatusService                                 - AnalyticsService (Advanced metrics)                   |
|                                                                                                         |
|  [ Data Access Layer ]                                                                                  |
|  - Prisma ORM Client                                                                                    |
+---------------------------------------------------------------------------------------------------------+
                                                     |
                                                     | PostgreSQL Protocol
                                                     v
                                  +---------------------------------------+
                                  |         PostgreSQL Database           |
                                  |  (complaints, departments, upvotes,   |
                                  |   status_history, users)              |
                                  +---------------------------------------+
```

---

## 4. Backend Directory & File Structure

```
backend/
├── .env.example                  # Environment variables template (PORT, DATABASE_URL, CORS_ORIGIN)
├── .gitignore                    # Node modules, env files, logs
├── package.json                  # Backend dependencies & scripts
├── README.md                     # Backend setup & developer instructions
├── prisma/
│   ├── schema.prisma             # PostgreSQL Prisma schema definitions
│   └── seed.js                   # Seed script populated with Ranchi initial complaints
└── src/
    ├── app.js                    # Express app initialization & middleware configuration
    ├── server.js                 # HTTP server listener & graceful shutdown handlers
    ├── config/
    │   ├── env.js                # Environment variable loader & validator
    │   └── prisma.js             # Singleton Prisma client instance
    ├── constants/
    │   ├── categories.js         # Category enums & labels
    │   ├── departments.js        # Department enums & codes
    │   ├── roles.js              # User roles (CITIZEN, ADMIN, DEPARTMENT_OFFICER)
    │   └── statuses.js           # Complaint statuses (PENDING, IN_PROGRESS, RESOLVED)
    ├── controllers/
    │   ├── complaint.controller.js   # Handles complaint CRUD, upvoting, status updates
    │   ├── department.controller.js  # Handles department listings & assignments
    │   └── analytics.controller.js   # Handles stats summaries & map data feeds
    ├── middlewares/
    │   ├── errorHandler.js       # Centralized JSON error response handler
    │   ├── notFoundHandler.js    # 404 Route handler
    │   ├── validate.js           # Request payload validation middleware
    │   └── requestLogger.js      # Console logger for inbound HTTP requests
    ├── routes/
    │   ├── index.js              # Main API router aggregator (/api/v1)
    │   ├── complaint.routes.js   # /api/v1/complaints
    │   ├── department.routes.js  # /api/v1/departments
    │   └── analytics.routes.js   # /api/v1/analytics
    ├── services/
    │   ├── complaint.service.js  # Core complaint database operations (Member 4)
    │   ├── department.service.js # Core department queries (Member 4)
    │   └── hooks/                # MEMBER 5 INTEGRATION HOOKS
    │       ├── routing.hook.js       # Category-to-Department routing stub
    │       ├── priority.hook.js      # Priority score & SLA calculation stub
    │       └── notification.hook.js  # Notification trigger stub
    └── utils/
        ├── apiResponse.js        # Standardized { success, data, message } response builder
        ├── apiError.js           # Custom operational ApiError class
        └── ticketGenerator.js    # Formatter for friendly IDs (e.g. "COMP-105")
```

---

## 5. Domain Enums & Constants

To guarantee data consistency between PostgreSQL, Prisma, Express, and React, standard enums will be enforced:

### Category Enums
| DB Value | Frontend Key | Display Label | Default Assigned Department |
| :--- | :--- | :--- | :--- |
| `POTHOLE` | `pothole` | Pothole / Road Repair | Public Works |
| `GARBAGE` | `garbage` | Garbage Overflow | Sanitation |
| `STREETLIGHT` | `streetlight` | Streetlight Fault | Electrical |
| `WATER` | `water` | Water Pipeline Leak | Water Supply |
| `OTHER` | `other` | Other Civic Issue | General Services |

### Status Enums
| DB Value | Frontend Label | Description | Allowed Next States |
| :--- | :--- | :--- | :--- |
| `PENDING` | `Pending` | Newly submitted ticket awaiting review | `IN_PROGRESS`, `RESOLVED` |
| `IN_PROGRESS` | `In Progress` | Work crew dispatched or maintenance ongoing | `PENDING`, `RESOLVED` |
| `RESOLVED` | `Resolved` | Work finished (Proof photo mandatory) | `IN_PROGRESS` (if reopened) |

### Role Enums (Future Auth Preparation)
| Role Value | Description |
| :--- | :--- |
| `CITIZEN` | Can submit complaints, view community complaints, and upvote |
| `DEPARTMENT_OFFICER` | Can view assigned department complaints and update status with proof |
| `ADMIN` | Can view all city complaints, map heatmaps, analytics, and oversee departments |

---

## 6. Database Schema Design (PostgreSQL + Prisma)

Below is the complete `prisma/schema.prisma` specification:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  CITIZEN
  ADMIN
  DEPARTMENT_OFFICER
}

enum ComplaintStatus {
  PENDING
  IN_PROGRESS
  RESOLVED
}

enum ComplaintCategory {
  POTHOLE
  GARBAGE
  STREETLIGHT
  WATER
  OTHER
}

enum PriorityLevel {
  LOW
  MEDIUM
  HIGH
}

model User {
  id            String          @id @default(cuid())
  name          String
  email         String?         @unique
  role          Role            @default(CITIZEN)
  departmentId  String?
  department    Department?     @relation(fields: [departmentId], references: [id])
  complaints    Complaint[]     @relation("CitizenComplaints")
  upvotes       Upvote[]
  statusLogs    ComplaintStatusHistory[]
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt

  @@map("users")
}

model Department {
  id          String       @id @default(cuid())
  name        String       @unique // e.g. "Public Works", "Sanitation", "Electrical", "Water Supply"
  code        String       @unique // e.g. "PUBLIC_WORKS", "SANITATION"
  description String?
  officers    User[]
  complaints  Complaint[]
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  @@map("departments")
}

model Complaint {
  id                  String             @id @default(cuid())
  ticketId            String             @unique // e.g. "COMP-101", human-friendly format
  category            ComplaintCategory
  description         String             @db.Text
  location            String             // Human-readable address / landmark
  lat                 Float?             // Geo latitude (e.g. 23.3441)
  lng                 Float?             // Geo longitude (e.g. 85.3096)
  photoUrl            String?            @db.Text
  resolutionPhotoUrl  String?            @db.Text
  status              ComplaintStatus    @default(PENDING)
  
  // Upvote counter (cached for high performance reads)
  upvotesCount        Int                @default(0)
  
  // Business logic fields (Calculated & Updated via Member 5 services)
  priorityScore       Int                @default(0)
  priorityLevel       PriorityLevel      @default(LOW)
  isSlaOverdue        Boolean            @default(false)

  // Relations
  departmentId        String?
  department          Department?        @relation(fields: [departmentId], references: [id], onDelete: SetNull)
  
  citizenId           String?
  citizen             User?              @relation("CitizenComplaints", fields: [citizenId], references: [id], onDelete: SetNull)
  citizenName         String?            // Captured directly from form when auth is bypassed

  upvotes             Upvote[]
  statusHistory       ComplaintStatusHistory[]

  createdAt           DateTime           @default(now())
  updatedAt           DateTime           @updatedAt

  @@index([status])
  @@index([category])
  @@index([departmentId])
  @@index([priorityScore(sort: Desc)])
  @@map("complaints")
}

model Upvote {
  id           String     @id @default(cuid())
  complaintId  String
  complaint    Complaint  @relation(fields: [complaintId], references: [id], onDelete: Cascade)
  userId       String?
  user         User?      @relation(fields: [userId], references: [id], onDelete: SetNull)
  citizenName  String?    // Stored for anonymous/mock citizen upvoting
  ipAddress    String?    // To prevent rapid duplicate spam upvotes
  createdAt    DateTime   @default(now())

  @@unique([complaintId, userId])
  @@index([complaintId])
  @@map("upvotes")
}

model ComplaintStatusHistory {
  id                  String           @id @default(cuid())
  complaintId         String
  complaint           Complaint        @relation(fields: [complaintId], references: [id], onDelete: Cascade)
  previousStatus      ComplaintStatus
  newStatus           ComplaintStatus
  changedById         String?
  changedBy           User?            @relation(fields: [changedById], references: [id], onDelete: SetNull)
  officerName         String?          // Fallback officer display name
  remarks             String?          @db.Text
  resolutionPhotoUrl  String?          @db.Text
  createdAt           DateTime         @default(now())

  @@index([complaintId])
  @@map("complaint_status_history")
}
```

---

## 7. REST API Endpoint Specifications

All endpoints are prefixed with `/api/v1`.

### 7.1 Complaint Endpoints

#### 1. `GET /api/v1/complaints`
* **Description:** Retrieve a list of complaints with filtering, search, pagination, and sorting.
* **Query Parameters:**
  * `status`: `Pending` | `In Progress` | `Resolved` | `all`
  * `category`: `pothole` | `garbage` | `streetlight` | `water` | `all`
  * `department`: `Public Works` | `Sanitation` | `Electrical` | `Water Supply` | `all`
  * `search`: string (matches ticketId, description, location, or department)
  * `sortBy`: `createdAt` | `priorityScore` | `upvotes` (default: `createdAt`)
  * `sortOrder`: `asc` | `desc` (default: `desc`)
  * `page`: integer (default: `1`)
  * `limit`: integer (default: `50`)

* **Response (200 OK):**
```json
{
  "success": true,
  "message": "Complaints retrieved successfully",
  "data": [
    {
      "id": "COMP-101",
      "category": "pothole",
      "description": "Deep dangerous pothole near the crosswalk on Main Street causing traffic slowdown and tire damage.",
      "location": "142 Main Street, Downtown, Ranchi",
      "photoUrl": "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80",
      "status": "In Progress",
      "department": "Public Works",
      "upvotes": 6,
      "priorityScore": 18,
      "priorityLevel": "High",
      "isSlaOverdue": true,
      "createdAt": "2026-08-07 09:30 AM",
      "resolutionPhotoUrl": null,
      "lat": 23.3441,
      "lng": 85.3096
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 50,
    "totalPages": 1
  }
}
```

---

#### 2. `GET /api/v1/complaints/:id`
* **Description:** Fetch complete details of a single complaint by its friendly `ticketId` (e.g. `COMP-101`) or DB `id`.
* **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "COMP-101",
    "category": "pothole",
    "description": "Deep dangerous pothole near the crosswalk on Main Street causing traffic slowdown and tire damage.",
    "location": "142 Main Street, Downtown, Ranchi",
    "photoUrl": "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80",
    "status": "In Progress",
    "department": "Public Works",
    "upvotes": 6,
    "priorityScore": 18,
    "priorityLevel": "High",
    "isSlaOverdue": true,
    "createdAt": "2026-08-07 09:30 AM",
    "resolutionPhotoUrl": null,
    "lat": 23.3441,
    "lng": 85.3096,
    "statusHistory": [
      {
        "previousStatus": "Pending",
        "newStatus": "In Progress",
        "officerName": "Officer Verma",
        "createdAt": "2026-08-08 11:00 AM"
      }
    ]
  }
}
```

---

#### 3. `POST /api/v1/complaints`
* **Description:** Submit a new civic complaint. Automatically generates ticket ID, invokes department auto-routing hook, computes initial priority, and saves to database.
* **Request Body:**
```json
{
  "category": "pothole",
  "description": "Large road crater in front of Central Hospital entrance.",
  "location": "Circular Road, Lalpur, Ranchi",
  "photoUrl": "https://example.com/uploads/pothole.jpg",
  "lat": 23.3654,
  "lng": 85.3289,
  "citizenName": "Rahul Sharma"
}
```
* **Validation Rules:**
  * `category`: Required, must be one of `pothole`, `garbage`, `streetlight`, `water`, `other`
  * `description`: Required, min 5 chars, max 2000 chars
  * `location`: Required, min 3 chars
  * `photoUrl`: Optional, valid URI or base64 data string
  * `lat`: Optional, float between -90 and 90 (Defaults to Ranchi region random offset if null)
  * `lng`: Optional, float between -180 and 180 (Defaults to Ranchi region random offset if null)
  * `citizenName`: Optional string

* **Response (201 Created):**
```json
{
  "success": true,
  "message": "Complaint submitted and routed successfully",
  "data": {
    "id": "COMP-105",
    "category": "pothole",
    "description": "Large road crater in front of Central Hospital entrance.",
    "location": "Circular Road, Lalpur, Ranchi",
    "photoUrl": "https://example.com/uploads/pothole.jpg",
    "status": "Pending",
    "department": "Public Works",
    "upvotes": 0,
    "priorityScore": 0,
    "priorityLevel": "Low",
    "isSlaOverdue": false,
    "createdAt": "2026-08-16 02:45 PM",
    "resolutionPhotoUrl": null,
    "lat": 23.3654,
    "lng": 85.3289
  }
}
```

---

#### 4. `POST /api/v1/complaints/:id/upvote`
* **Description:** Increment the upvote counter for a complaint and trigger priority recalculation hook.
* **Request Body:**
```json
{
  "citizenName": "Rahul Sharma"
}
```
* **Response (200 OK):**
```json
{
  "success": true,
  "message": "Complaint upvoted successfully",
  "data": {
    "id": "COMP-101",
    "upvotes": 7,
    "priorityScore": 21,
    "priorityLevel": "High"
  }
}
```

---

#### 5. `PATCH /api/v1/complaints/:id/status`
* **Description:** Update ticket status (Pending, In Progress, Resolved). Enforces mandatory resolution photo proof when status is `Resolved`.
* **Request Body (Status to In Progress):**
```json
{
  "status": "In Progress",
  "officerName": "Officer Anita Roy",
  "remarks": "Repair crew dispatched to site."
}
```
* **Request Body (Status to Resolved):**
```json
{
  "status": "Resolved",
  "resolutionPhotoUrl": "https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&w=600&q=80",
  "officerName": "Officer Anita Roy",
  "remarks": "Pothole filled and sealed with asphalt."
}
```
* **Validation Rules:**
  * `status`: Required, must be `Pending` | `In Progress` | `Resolved`
  * `resolutionPhotoUrl`: **Mandatory** when `status` is `Resolved`
* **Response (200 OK):**
```json
{
  "success": true,
  "message": "Complaint status updated to Resolved",
  "data": {
    "id": "COMP-101",
    "status": "Resolved",
    "resolutionPhotoUrl": "https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&w=600&q=80",
    "updatedAt": "2026-08-16 03:10 PM"
  }
}
```

---

### 7.2 Department Endpoints

#### 1. `GET /api/v1/departments`
* **Description:** List all municipal departments with complaint counts by status.
* **Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "dept_pw",
      "name": "Public Works",
      "code": "PUBLIC_WORKS",
      "complaintCounts": {
        "total": 5,
        "pending": 2,
        "inProgress": 2,
        "resolved": 1
      }
    },
    {
      "id": "dept_san",
      "name": "Sanitation",
      "code": "SANITATION",
      "complaintCounts": {
        "total": 3,
        "pending": 1,
        "inProgress": 1,
        "resolved": 1
      }
    }
  ]
}
```

---

### 7.3 Analytics & Heatmap Endpoints

#### 1. `GET /api/v1/analytics/overview`
* **Description:** Executive metrics for the Admin dashboard summary cards.
* **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "totalReported": 12,
    "pendingCount": 4,
    "inProgressCount": 3,
    "resolvedCount": 5,
    "slaBreachedCount": 2
  }
}
```

#### 2. `GET /api/v1/analytics/category-distribution`
* **Description:** Aggregated complaint counts grouped by category for the Recharts Bar Chart.
* **Response (200 OK):**
```json
{
  "success": true,
  "data": [
    { "category": "Pothole", "count": 4, "key": "pothole" },
    { "category": "Garbage", "count": 3, "key": "garbage" },
    { "category": "Streetlight", "count": 3, "key": "streetlight" },
    { "category": "Water Leakage", "count": 2, "key": "water" }
  ]
}
```

#### 3. `GET /api/v1/analytics/department-workload`
* **Description:** Aggregated assigned complaint workload grouped by department.
* **Response (200 OK):**
```json
{
  "success": true,
  "data": [
    { "department": "Public Works", "count": 5 },
    { "department": "Sanitation", "count": 3 },
    { "department": "Electrical", "count": 2 },
    { "department": "Water Supply", "count": 2 }
  ]
}
```

#### 4. `GET /api/v1/analytics/heatmap`
* **Description:** Geospatial coordinate points with normalized priority weight for Leaflet Heatmap Layer.
* **Response (200 OK):**
```json
{
  "success": true,
  "data": [
    { "lat": 23.3441, "lng": 85.3096, "intensity": 0.9, "ticketId": "COMP-101" },
    { "lat": 23.3520, "lng": 85.3210, "intensity": 0.5, "ticketId": "COMP-102" }
  ]
}
```

---

## 8. Error Response Standard

All errors returned by the Express API follow an RFC 7807 inspired standard format:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Resolution photo proof is required when marking a complaint as Resolved.",
    "statusCode": 400,
    "details": [
      {
        "field": "resolutionPhotoUrl",
        "message": "resolutionPhotoUrl must not be empty when status is Resolved"
      }
    ]
  },
  "timestamp": "2026-08-16T09:21:53.000Z"
}
```

### Standard HTTP Status Codes Used
* `200 OK`: Successful read or update operation
* `201 Created`: Successful creation of a complaint or upvote
* `400 Bad Request`: Validation failure or missing mandatory fields
* `404 Not Found`: Ticket or department does not exist
* `409 Conflict`: Duplicate upvote or resource conflict
* `500 Internal Server Error`: Unhandled server exception

---

## 9. Team Responsibilities: Member 4 vs Member 5

| Module / Component | Member 4 Responsibility (Foundation) | Member 5 Responsibility (Business Logic) |
| :--- | :--- | :--- |
| **Database & ORM** | Defines schema, Prisma client, relations, indexes, migrations, seeds | Queries models, adds analytics views or indexes if needed |
| **Express Server** | Configures routes, middleware, validation, error handler, CORS | Injects business rules and custom analytics endpoints |
| **Department Routing** | Exposes `routing.hook.js` with category mapping fallback | Implements advanced routing (keyword NLP, location geofencing, ML) |
| **Priority Scoring** | Exposes `priority.hook.js` with baseline formula `(upvotes * 3) + (days * 2)` | Implements dynamic priority weighting, crowd density weighting |
| **SLA Tracking** | Schema fields `isSlaOverdue`, SLA checks on retrieve | Implements automated background cron/jobs for SLA escalation |
| **Notifications** | Exposes `notification.hook.js` trigger points on create/status change | Implements notification delivery (in-app, SMS, email, websockets) |
| **Analytics APIs** | Exposes raw SQL / Prisma group-by aggregations for charts | Implements predictive analytics, resolution time forecasting |

---

## 10. Frontend & Backend Integration Plan (Members 2 & 3 Integration)

To seamlessly connect the React prototype with the Express backend without breaking any visual components:

1. **API Client Service (`src/services/api.js`):**
   Create a lightweight Axios or Native Fetch client in the frontend:
   ```javascript
   // src/services/api.js
   const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

   export const fetchComplaints = (filters = {}) => 
     fetch(`${API_BASE}/complaints?${new URLSearchParams(filters)}`).then(r => r.json());

   export const createComplaint = (data) =>
     fetch(`${API_BASE}/complaints`, {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify(data),
     }).then(r => r.json());

   export const upvoteComplaint = (id, citizenName) =>
     fetch(`${API_BASE}/complaints/${id}/upvote`, {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ citizenName }),
     }).then(r => r.json());

   export const updateComplaintStatus = (id, status, resolutionPhotoUrl, officerName) =>
     fetch(`${API_BASE}/complaints/${id}/status`, {
       method: 'PATCH',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ status, resolutionPhotoUrl, officerName }),
     }).then(r => r.json());
   ```

2. **Connecting `App.jsx`:**
   * Replace static `INITIAL_COMPLAINTS` state in `src/App.jsx` with a `useEffect` that calls `fetchComplaints()`.
   * Update `handleAddComplaint`, `handleUpvote`, and `handleStatusChange` to call their respective API functions and re-fetch or optimistically update state.

3. **Data Field Alignment:**
   Because our REST API responses return the exact same key names (`id`, `category`, `description`, `location`, `photoUrl`, `status`, `department`, `upvotes`, `createdAt`, `resolutionPhotoUrl`, `lat`, `lng`), **zero modifications are needed inside `CitizenView.jsx`, `AdminView.jsx`, `AdminMapView.jsx`, `AdminAnalyticsView.jsx`, or `DepartmentView.jsx`**.

---

## 11. Open Questions & Team Decisions

Before starting full backend implementation, the team should confirm the following decisions:

1. **Photo Upload Storage Mechanism:**
   * *Option A (Hackathon Fast):* Frontend passes Base64 or direct Image URL strings (currently used in mock data).
   * *Option B (Local Storage):* Express `multer` middleware saving images to `backend/public/uploads` and serving static URLs.
   * *Option C (Cloud Storage):* Direct upload to Cloudinary / AWS S3 / Firebase Storage.
   * *Recommendation:* Start with Option A/B for rapid hackathon velocity.
2. **PostgreSQL Database Connection:**
   * Will we connect to a local PostgreSQL instance (`postgresql://postgres:postgres@localhost:5432/civicsense`) or a free cloud-hosted PostgreSQL database (e.g. Supabase, Neon, Railway)?
   * *Recommendation:* Use Neon / Supabase free tier or local PostgreSQL with `.env` switch.
3. **Seed Data Coordinates:**
   * The prototype currently defaults coordinates around **Ranchi, Jharkhand** (`lat: 23.3441, lng: 85.3096`). Should the backend seed and geo-fallback remain centered on Ranchi?
   * *Recommendation:* Yes, preserve Ranchi coordinates so the Leaflet Map and Heatmap render immediately with rich data.
4. **Member 5 Hook Signatures:**
   * Confirm that Member 5 agrees with the signature and async hook approach in `src/services/hooks/`.

---

## 12. Next Steps

Upon approval of this plan:
1. Initialize `backend/package.json` with dependencies (`express`, `cors`, `@prisma/client`, `dotenv`, `morgan`, `zod`/`joi`, `prisma`).
2. Set up `prisma/schema.prisma` and run initial migrations against PostgreSQL.
3. Create `prisma/seed.js` to populate initial Ranchi complaints dataset.
4. Implement Express server foundation, middlewares, error handler, and routes.
5. Implement CRUD operations in `complaint.service.js`, `department.service.js`, and `analytics.service.js`.
6. Add extension hook stubs for Member 5.
7. Verify all REST endpoints using HTTP tests.
