/**
 * initialComplaints.js
 * 
 * Initial mock dataset populated when the app first loads.
 * Updated with initial upvotes, realistic dates, and Ranchi geo-coordinates:
 * - Latitude / Longitude centered around Ranchi, Jharkhand (lat: 23.3441, lng: 85.3096)
 */

export const INITIAL_COMPLAINTS = [
  {
    id: "COMP-101",
    category: "pothole",
    description: "Deep dangerous pothole near the crosswalk on Main Street causing traffic slowdown and tire damage.",
    location: "142 Main Street, Downtown, Ranchi",
    photoUrl: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80",
    status: "In Progress",
    department: "Public Works",
    upvotes: 6, // High Priority, SLA Overdue
    createdAt: "2026-08-07 09:30 AM",
    lat: 23.3441,
    lng: 85.3096,
  },
  {
    id: "COMP-102",
    category: "garbage",
    description: "Overflowing community dumpster attracting pests and spreading unpleasant odor across the street.",
    location: "Corner of Oak Avenue & 4th St, Ranchi",
    photoUrl: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=80",
    status: "Pending",
    department: "Sanitation",
    upvotes: 3, // Medium Priority, SLA Overdue
    createdAt: "2026-08-08 02:15 PM",
    lat: 23.3520,
    lng: 85.3210,
  },
  {
    id: "COMP-103",
    category: "streetlight",
    description: "Streetlight flickering rapidly and completely turning off at night, creating safety hazard for pedestrians.",
    location: "88 Pine Road, North Sector, Ranchi",
    photoUrl: "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=600&q=80",
    status: "Resolved",
    department: "Electrical",
    upvotes: 4,
    createdAt: "2026-08-05 07:45 PM",
    resolutionPhotoUrl: "https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&w=600&q=80",
    lat: 23.3380,
    lng: 85.2980,
  },
  {
    id: "COMP-104",
    category: "water",
    description: "Water pipe rupture on main road spewing clean water and flooding neighbor driveway.",
    location: "52 Elm Street, West District, Ranchi",
    photoUrl: "https://images.unsplash.com/photo-1541888946425-d0fbb186a5b2?auto=format&fit=crop&w=600&q=80",
    status: "Pending",
    department: "Water Supply",
    upvotes: 1, // Low Priority
    createdAt: "2026-08-12 08:10 AM",
    lat: 23.3600,
    lng: 85.3400,
  },
];
