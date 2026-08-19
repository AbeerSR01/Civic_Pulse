/**
 * seed.js
 * 
 * PostgreSQL Database Seed Script for Civic Pulse.
 * Populates PostgreSQL with default municipal departments, demo users with hashed passwords,
 * and initial Ranchi civic complaints for rapid testing & live demos.
 * 
 * Run with:
 *   npm run seed
 */

import dotenv from "dotenv";
dotenv.config();

import bcrypt from "bcryptjs";
import { initDB, pool } from "./config/db.js";
import Department from "./models/Department.js";
import User from "./models/User.js";
import Complaint from "./models/Complaint.js";

async function seedDatabase() {
  try {
    console.log("🌱 [Seed] Initializing database schema...");
    await initDB();

    console.log("🧹 [Seed] Clearing existing records...");
    await Complaint.deleteAll();
    await User.deleteAll();
    await Department.deleteAll();

    // 1. Seed Municipal Departments
    console.log("🏢 [Seed] Creating Municipal Departments...");
    const departmentsData = [
      {
        name: "Public Works",
        code: "PUBLIC_WORKS",
        description: "Roads, potholes, bridges, footpaths, and public infrastructure maintenance.",
        contactEmail: "pwd@civicpulse.org",
        assignedCategories: ["pothole"],
      },
      {
        name: "Sanitation",
        code: "SANITATION",
        description: "Waste collection, overflowing dumpsters, recycling, and city hygiene.",
        contactEmail: "sanitation@civicpulse.org",
        assignedCategories: ["garbage"],
      },
      {
        name: "Electrical",
        code: "ELECTRICAL",
        description: "Streetlights, power cables, traffic signals, and municipal electrical grids.",
        contactEmail: "electrical@civicpulse.org",
        assignedCategories: ["streetlight"],
      },
      {
        name: "Water Supply",
        code: "WATER_SUPPLY",
        description: "Water pipeline leaks, drainage overflow, water quality, and sewer systems.",
        contactEmail: "water@civicpulse.org",
        assignedCategories: ["water"],
      },
    ];

    for (const d of departmentsData) {
      await Department.create(d);
    }

    // 2. Seed Users (Hashed Passwords)
    console.log("👥 [Seed] Creating Demo Users...");
    const salt = await bcrypt.genSalt(10);
    const demoPasswordHash = await bcrypt.hash("password123", salt);

    const citizen = await User.create({
      name: "Rahul Sharma",
      email: "citizen@civicpulse.org",
      passwordHash: demoPasswordHash,
      role: "citizen",
      phoneNumber: "+91 98765 43210",
    });

    const admin = await User.create({
      name: "Director Verma",
      email: "admin@civicpulse.org",
      passwordHash: demoPasswordHash,
      role: "admin",
      phoneNumber: "+91 98765 43211",
    });

    const officer = await User.create({
      name: "Officer Anita Roy",
      email: "department@civicpulse.org",
      passwordHash: demoPasswordHash,
      role: "department",
      department: "Public Works",
      phoneNumber: "+91 98765 43212",
    });

    const citizen2 = await User.create({
      name: "Priya Patel",
      email: "priya@civicpulse.org",
      passwordHash: demoPasswordHash,
      role: "citizen",
      phoneNumber: "+91 98765 43213",
    });

    // 3. Seed Initial Ranchi Complaints
    console.log("📋 [Seed] Creating Initial Complaints (Ranchi Sector)...");

    const comp1 = await Complaint.create({
      ticketId: "COMP-101",
      title: "Pothole / Road Damage Reported",
      category: "pothole",
      description: "Deep dangerous pothole near the crosswalk on Main Street causing traffic slowdown and tire damage.",
      address: "142 Main Street, Downtown, Ranchi",
      lat: 23.3441,
      lng: 85.3096,
      photoUrl: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80",
      status: "In Progress",
      department: "Public Works",
      reportedBy: citizen.id,
      citizenName: citizen.name,
      priorityScore: 18,
      slaDeadline: new Date(Date.now() - 1000 * 3600 * 24), // SLA breached
    });
    await Complaint.addUpvote(comp1.id, citizen.id);
    await Complaint.addUpvote(comp1.id, citizen2.id);

    const comp2 = await Complaint.create({
      ticketId: "COMP-102",
      title: "Garbage Overflow / Waste Clearance",
      category: "garbage",
      description: "Overflowing community dumpster attracting pests and spreading unpleasant odor across the street.",
      address: "Corner of Oak Avenue & 4th St, Ranchi",
      lat: 23.3520,
      lng: 85.3210,
      photoUrl: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=80",
      status: "Pending",
      department: "Sanitation",
      reportedBy: citizen.id,
      citizenName: citizen.name,
      priorityScore: 9,
      slaDeadline: new Date(Date.now() + 1000 * 3600 * 24 * 2),
    });
    await Complaint.addUpvote(comp2.id, citizen.id);

    const comp3 = await Complaint.create({
      ticketId: "COMP-103",
      title: "Faulty Streetlight Hazard",
      category: "streetlight",
      description: "Streetlight flickering rapidly and completely turning off at night, creating safety hazard for pedestrians.",
      address: "88 Pine Road, North Sector, Ranchi",
      lat: 23.3380,
      lng: 85.2980,
      photoUrl: "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=600&q=80",
      status: "Resolved",
      department: "Electrical",
      reportedBy: citizen.id,
      citizenName: citizen.name,
      priorityScore: 12,
      slaDeadline: new Date(Date.now() - 1000 * 3600 * 48),
    });
    await Complaint.addUpvote(comp3.id, citizen.id);
    await Complaint.updateStatus(comp3.id, {
      status: "Resolved",
      remarks: "Replaced faulty LED light fixture and checked circuit wiring.",
      officerName: officer.name,
      changedBy: officer.id,
      resolutionProofUrl: "https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&w=600&q=80",
    });

    const comp4 = await Complaint.create({
      ticketId: "COMP-104",
      title: "Water Pipeline Leakage",
      category: "water",
      description: "Water pipe rupture on main road spewing clean water and flooding neighbor driveway.",
      address: "52 Elm Street, West District, Ranchi",
      lat: 23.3600,
      lng: 85.3400,
      photoUrl: "https://images.unsplash.com/photo-1541888946425-d0fbb186a5b2?auto=format&fit=crop&w=600&q=80",
      status: "Pending",
      department: "Water Supply",
      reportedBy: citizen.id,
      citizenName: citizen.name,
      priorityScore: 3,
      slaDeadline: new Date(Date.now() + 1000 * 3600 * 24 * 3),
    });

    const comp5 = await Complaint.create({
      ticketId: "COMP-105",
      title: "Hazardous Road Crack near Market Square",
      category: "pothole",
      description: "Hazardous road crack near Market Square repaired by crew awaiting citizen verification.",
      address: "Market Square, Main Rd, Ranchi",
      lat: 23.3480,
      lng: 85.3150,
      photoUrl: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80",
      status: "Pending Verification",
      department: "Public Works",
      reportedBy: citizen.id,
      citizenName: citizen.name,
      priorityScore: 15,
      slaDeadline: new Date(Date.now() - 1000 * 3600 * 12),
    });
    await Complaint.addUpvote(comp5.id, citizen.id);
    await Complaint.updateStatus(comp5.id, {
      status: "Pending Verification",
      remarks: "Crew completed asphalt sealing and resurfacing. Awaiting citizen verification.",
      officerName: officer.name,
      changedBy: officer.id,
      resolutionProofUrl: "https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&w=600&q=80",
    });

    console.log(`
================================================================
✅ [Seed] PostgreSQL Database Seeded Successfully!
================================================================
Demo Accounts (Password: password123):
- Citizen:    citizen@civicpulse.org
- Admin:      admin@civicpulse.org
- Department: department@civicpulse.org (Public Works)
================================================================
    `);

    if (pool) {
      try {
        await pool.end();
      } catch (e) {
        // ignore error on exit
      }
    }
    process.exit(0);
  } catch (error) {
    console.error("❌ [Seed Error]:", error);
    process.exit(1);
  }
}

seedDatabase();
