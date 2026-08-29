/**
 * test-integration.js
 * 
 * Comprehensive Integration Test for Civic Pulse PostgreSQL Backend.
 * Tests:
 * 1. Database table initialization & connectivity
 * 2. Complaint creation
 * 3. Complaint listing & single retrieval
 * 4. User A upvote
 * 5. User A duplicate upvote prevention (UNIQUE constraint)
 * 6. User B upvote (count increment)
 * 7. Rapid concurrent upvotes (race condition safety)
 * 8. Status update & verification flow
 */

import { initDB } from "./src/config/db.js";
import Complaint from "./src/models/Complaint.js";
import User from "./src/models/User.js";
import Department from "./src/models/Department.js";

async function runTests() {
  console.log("================================================================");
  console.log("🧪 STARTING POSTGRESQL INTEGRATION & UPVOTE CONSTRAINT TESTS");
  console.log("================================================================\n");

  // 1. Initialize DB
  await initDB();

  // Clean test tables
  await Complaint.deleteAll();
  await User.deleteAll();
  await Department.deleteAll();

  // Seed department
  await Department.create({
    name: "Public Works",
    code: "PUBLIC_WORKS",
    description: "Roads & Infrastructure",
  });

  // 2. Create Users
  console.log("1️⃣ Testing User Creation...");
  const userA = await User.create({
    name: "User A (Rahul)",
    email: "userA@civicpulse.org",
    passwordHash: "dummyHash",
    role: "citizen",
  });
  const userB = await User.create({
    name: "User B (Priya)",
    email: "userB@civicpulse.org",
    passwordHash: "dummyHash",
    role: "citizen",
  });
  console.log(`   ✅ Created User A (ID: ${userA.id}) and User B (ID: ${userB.id})`);

  // 3. Create Complaint
  console.log("\n2️⃣ Testing Complaint Creation...");
  const complaint = await Complaint.create({
    ticketId: "COMP-TEST-101",
    title: "Test Main Road Pothole",
    category: "pothole",
    description: "Large dangerous road pothole reported for integration testing.",
    address: "100 Test Avenue, Ranchi",
    lat: 23.3441,
    lng: 85.3096,
    status: "Pending",
    department: "Public Works",
    reportedBy: userA.id,
    citizenName: userA.name,
    priorityScore: 0,
  });
  console.log(`   ✅ Complaint Created: Ticket ${complaint.ticketId}, ID: ${complaint.id}, Status: ${complaint.status}`);

  // 4. Retrieve Complaint
  console.log("\n3️⃣ Testing Complaint Retrieval...");
  const fetched = await Complaint.findById(complaint.id);
  console.log(`   ✅ Retrieved: "${fetched.title}" at "${fetched.location}" with ${fetched.upvoteCount} upvotes`);

  // 5. User A Upvotes
  console.log("\n4️⃣ Testing User A Upvoting Complaint...");
  const vote1 = await Complaint.addUpvote(complaint.id, userA.id);
  console.log(`   ✅ User A Vote Result: alreadyUpvoted=${vote1.alreadyUpvoted}, new count=${vote1.complaint.upvoteCount}`);
  if (vote1.complaint.upvoteCount !== 1) throw new Error("Expected count 1 after first upvote");

  // 6. User A Attempts Duplicate Upvote
  console.log("\n5️⃣ Testing User A Duplicate Upvote (Must be Rejected)...");
  const vote1Duplicate = await Complaint.addUpvote(complaint.id, userA.id);
  console.log(`   ✅ User A Duplicate Vote Result: alreadyUpvoted=${vote1Duplicate.alreadyUpvoted}, count=${vote1Duplicate.complaint.upvoteCount}`);
  if (!vote1Duplicate.alreadyUpvoted || vote1Duplicate.complaint.upvoteCount !== 1) {
    throw new Error("Duplicate upvote was NOT prevented!");
  }
  console.log("   🛡️ [Security Confirmed] Database UNIQUE(complaint_id, user_id) blocked duplicate upvote!");

  // 7. User B Upvotes
  console.log("\n6️⃣ Testing User B Upvoting Same Complaint...");
  const vote2 = await Complaint.addUpvote(complaint.id, userB.id);
  console.log(`   ✅ User B Vote Result: alreadyUpvoted=${vote2.alreadyUpvoted}, new count=${vote2.complaint.upvoteCount}`);
  if (vote2.complaint.upvoteCount !== 2) throw new Error("Expected count 2 after second user upvote");

  // 8. Rapid Concurrent Upvotes (Race condition test)
  console.log("\n7️⃣ Testing Rapid Concurrent Upvotes (Race Condition Defense)...");
  const concurrentResults = await Promise.all([
    Complaint.addUpvote(complaint.id, userA.id),
    Complaint.addUpvote(complaint.id, userA.id),
    Complaint.addUpvote(complaint.id, userA.id),
  ]);
  const finalComplaint = await Complaint.findById(complaint.id);
  console.log(`   ✅ Rapid Concurrent Requests Finished. Final Upvote Count: ${finalComplaint.upvoteCount} (Must be exactly 2)`);
  if (finalComplaint.upvoteCount !== 2) throw new Error("Race condition failure: duplicate votes counted!");

  // 9. Status Update
  console.log("\n8️⃣ Testing Status Lifecycle...");
  const updatedStatus = await Complaint.updateStatus(complaint.id, {
    status: "Pending Verification",
    resolutionProofUrl: "https://example.com/proof.jpg",
    remarks: "Repaired and awaiting citizen check",
  });
  console.log(`   ✅ Status updated to: ${updatedStatus.status}, Proof: ${updatedStatus.resolutionProofUrl}`);

  // 10. Duplicate Detection Tests
  console.log("\n9️⃣ Testing Duplicate Complaint Detection (Proximity & Category Match)...");
  
  // Test A: Nearby same category (should MATCH)
  const duplicateMatch = await Complaint.findActiveDuplicate({
    category: "pothole",
    lat: 23.34415, // ~5 meters away
    lng: 85.30965,
    radiusMeters: 100,
  });
  if (!duplicateMatch || duplicateMatch.ticketId !== "COMP-TEST-101") {
    throw new Error("Duplicate detection failed to find nearby active complaint!");
  }
  console.log(`   ✅ Nearby same category correctly matched duplicate: Ticket ${duplicateMatch.ticketId}`);

  // Test B: Different category (should NOT match)
  const differentCategory = await Complaint.findActiveDuplicate({
    category: "garbage",
    lat: 23.34415,
    lng: 85.30965,
    radiusMeters: 100,
  });
  if (differentCategory !== null) {
    throw new Error("Duplicate detection wrongly matched different category!");
  }
  console.log("   ✅ Different category at same location correctly rejected as duplicate.");

  // Test C: Far away (> 100m, e.g. 5km away, should NOT match)
  const farAway = await Complaint.findActiveDuplicate({
    category: "pothole",
    lat: 23.3900,
    lng: 85.3500,
    radiusMeters: 100,
  });
  if (farAway !== null) {
    throw new Error("Duplicate detection wrongly matched far-away complaint!");
  }
  console.log("   ✅ Far-away complaint (>100m) correctly rejected as duplicate.");

  // Test D: Resolved complaint (should NOT match)
  await Complaint.updateStatus(complaint.id, {
    status: "Resolved",
    resolutionProofUrl: "https://example.com/proof.jpg",
  });
  const resolvedMatch = await Complaint.findActiveDuplicate({
    category: "pothole",
    lat: 23.34415,
    lng: 85.30965,
    radiusMeters: 100,
  });
  if (resolvedMatch !== null) {
    throw new Error("Duplicate detection wrongly matched a Resolved complaint!");
  }
  console.log("   ✅ Resolved complaint correctly ignored for duplicate detection.");

  // Test E: Active complaint with typed address matching (e.g. Kanpur street)
  const compKanpur = await Complaint.create({
    ticketId: "COMP-TEST-KANPUR-1",
    title: "Streetlight Fault",
    category: "streetlight",
    description: "Faulty broken pole light",
    address: "Kanpur, Kanpur Nagar, Uttar Pradesh, 208012, India",
    lat: 26.4499,
    lng: 80.3319,
    status: "Pending",
    department: "Electrical",
  });
  const kanpurDuplicate = await Complaint.findActiveDuplicate({
    category: "streetlight",
    address: "Kanpur, Kanpur Nagar, Uttar Pradesh, 208012, India",
  });
  if (!kanpurDuplicate || kanpurDuplicate.ticketId !== "COMP-TEST-KANPUR-1") {
    throw new Error("Address text duplicate detection failed for Kanpur!");
  }
  console.log(`   ✅ Address text duplicate matched successfully: Ticket ${kanpurDuplicate.ticketId}`);

  console.log("\n================================================================");
  console.log("🎉 ALL INTEGRATION, UPVOTE & DUPLICATE DETECTION TESTS PASSED (100%)");
  console.log("================================================================\n");

  process.exit(0);
}

runTests().catch((err) => {
  console.error("❌ Test Failed:", err);
  process.exit(1);
});
