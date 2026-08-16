import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.heat";
import "leaflet/dist/leaflet.css";

// Import standard Leaflet marker icon images to fix missing icon issue in Vite bundlers
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

import { MapPin, Flame, Eye, Layers, Tag, Building2, Clock, ThumbsUp } from "lucide-react";
import { CATEGORY_LABELS } from "../utils/departmentAssigner";
import { calculatePriority } from "../utils/priorityCalculator";

// Fix Leaflet default icon paths for Vite/React bundling
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

/**
 * HeatmapLayer Sub-component
 * 
 * Dynamically mounts and updates a Leaflet.heat layer on the React-Leaflet map canvas.
 * Uses each complaint's coordinates [lat, lng] and its calculated priority score as the intensity weight.
 */
function HeatmapLayer({ complaints, showHeatmap }) {
  const map = useMap();

  useEffect(() => {
    if (!showHeatmap || !map) return;

    // Construct array of points [lat, lng, intensity] for leaflet.heat
    const heatPoints = complaints.map((item) => {
      const priority = calculatePriority(item);
      // Normalize priority score (0 to 30+) into intensity weight between 0.2 and 1.0
      const intensity = Math.min(1.0, Math.max(0.2, priority.score / 20));
      
      return [item.lat || 23.3441, item.lng || 85.3096, intensity];
    });

    // Create the leaflet.heat layer instance
    const heatLayer = L.heatLayer(heatPoints, {
      radius: 35,
      blur: 20,
      maxZoom: 17,
      max: 1.0,
      gradient: {
        0.2: '#3b82f6', // Low intensity -> Blue
        0.5: '#eab308', // Medium intensity -> Yellow
        0.8: '#ef4444', // High intensity -> Red
      }
    });

    // Add heat layer to map
    heatLayer.addTo(map);

    // Cleanup function: remove layer when component unmounts or toggle changes
    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, complaints, showHeatmap]);

  return null;
}

/**
 * AdminMapView Component
 * 
 * Renders an interactive React-Leaflet map centered on Ranchi, Jharkhand.
 * Displays markers for all complaints and a toggleable Priority Heatmap overlay.
 * 
 * Props:
 * - complaints: Shared complaints array from App.jsx state
 */
export default function AdminMapView({ complaints }) {
  // State for Heatmap Overlay Toggle (ON / OFF)
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showMarkers, setShowMarkers] = useState(true);

  // Center coordinates for Ranchi, Jharkhand
  const RANCHI_CENTER = [23.3441, 85.3096];

  return (
    <div className="space-y-4">
      
      {/* Map Control Bar & Toggles */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
          <Layers className="w-5 h-5 text-indigo-600" />
          <span>Geospatial Issue Map (Ranchi Sector)</span>
          <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded-full font-mono font-medium">
            {complaints.length} Total Issues
          </span>
        </div>

        {/* Toggle Switch Controls */}
        <div className="flex items-center gap-4">
          
          {/* Heatmap Toggle */}
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 transition">
            <input
              type="checkbox"
              checked={showHeatmap}
              onChange={(e) => setShowHeatmap(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
            />
            <Flame className={`w-4 h-4 ${showHeatmap ? "text-amber-500 animate-pulse" : "text-slate-400"}`} />
            <span>Priority Heatmap Layer</span>
          </label>

          {/* Markers Toggle */}
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 transition">
            <input
              type="checkbox"
              checked={showMarkers}
              onChange={(e) => setShowMarkers(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
            />
            <MapPin className="w-4 h-4 text-blue-600" />
            <span>Issue Markers</span>
          </label>

        </div>

      </div>

      {/* REACT-LEAFLET MAP CONTAINER */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative z-10">
        
        <MapContainer
          center={RANCHI_CENTER}
          zoom={13.5}
          scrollWheelZoom={true}
          style={{ height: "520px", width: "100%" }}
          className="rounded-2xl"
        >
          {/* Tile Layer */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Custom Heatmap Layer */}
          <HeatmapLayer complaints={complaints} showHeatmap={showHeatmap} />

          {/* Render Markers for each complaint */}
          {showMarkers &&
            complaints.map((item) => {
              const priority = calculatePriority(item);
              const position = [item.lat || 23.3441, item.lng || 85.3096];

              return (
                <Marker key={item.id} position={position}>
                  <Popup className="custom-leaflet-popup">
                    <div className="p-1 space-y-2 max-w-xs text-xs">
                      
                      <div className="flex items-center justify-between gap-2 border-b pb-1.5">
                        <span className="font-mono font-bold text-slate-700">{item.id}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] border ${priority.colorClass}`}>
                          {priority.label} ({priority.score} pts)
                        </span>
                      </div>

                      <h4 className="font-bold text-slate-900 text-sm">
                        {CATEGORY_LABELS[item.category] || item.category}
                      </h4>

                      <p className="text-slate-700 text-xs line-clamp-2">
                        {item.description}
                      </p>

                      <div className="flex flex-col gap-1 text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{item.location}</span>
                        </div>
                        <div className="flex items-center justify-between pt-1">
                          <span className="font-medium text-blue-600">Dept: {item.department}</span>
                          <span className="font-semibold text-slate-800">Status: {item.status}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-500 pt-0.5">
                          <span>👍 {item.upvotes || 0} Upvotes</span>
                          <span>{item.createdAt}</span>
                        </div>
                      </div>

                    </div>
                  </Popup>
                </Marker>
              );
            })}
        </MapContainer>

        {/* Heatmap Legend Overlay Box */}
        {showHeatmap && (
          <div className="absolute bottom-4 right-4 bg-slate-900/90 backdrop-blur-md text-white p-3 rounded-xl border border-slate-700 text-xs z-[1000] shadow-lg space-y-1.5">
            <div className="font-semibold flex items-center gap-1 text-slate-200">
              <Flame className="w-3.5 h-3.5 text-amber-400" /> Heatmap Intensity Legend
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-32 rounded-full bg-gradient-to-r from-blue-500 via-yellow-400 to-red-500 border border-slate-600"></div>
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>Low Priority</span>
              <span>High Priority</span>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
