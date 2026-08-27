import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.heat";
import "leaflet/dist/leaflet.css";

// Standard Leaflet marker icon images
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

import { MapPin, Flame, Layers } from "lucide-react";
import { CATEGORY_LABELS } from "../utils/departmentAssigner";
import { calculatePriority } from "../utils/priorityCalculator";

// Fix Leaflet default icon paths for Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

/**
 * HeatmapLayer Sub-component
 */
function HeatmapLayer({ complaints, showHeatmap }) {
  const map = useMap();

  useEffect(() => {
    if (!showHeatmap || !map) return;

    const heatPoints = complaints.map((item) => {
      const priority = calculatePriority(item);
      const intensity = Math.min(1.0, Math.max(0.2, priority.score / 20));
      return [item.lat || 23.3441, item.lng || 85.3096, intensity];
    });

    const heatLayer = L.heatLayer(heatPoints, {
      radius: 35,
      blur: 20,
      maxZoom: 17,
      max: 1.0,
      gradient: {
        0.2: '#6B6B6B', // Low Intensity -> Medium Grey
        0.5: '#FF9E4D', // Medium Intensity -> Warm Orange
        0.8: '#FF6B00', // High Intensity -> Signature Orange
      }
    });

    heatLayer.addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, complaints, showHeatmap]);

  return null;
}

/**
 * Modern Minimalist AdminMapView Component
 * 
 * Premium Monochrome + Signature Orange (#FF6B00) Accent
 */
export default function AdminMapView({ complaints }) {
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showMarkers, setShowMarkers] = useState(true);

  const RANCHI_CENTER = [23.3441, 85.3096];

  return (
    <div className="space-y-4">
      
      {/* Map Control Bar & Toggles */}
      <div className="bg-white p-4 rounded-2xl border border-[#E5E5E5] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        
        <div className="flex items-center gap-2 text-[#111111] font-bold text-xs">
          <div className="w-7 h-7 rounded-lg bg-[#FFF1E6] text-[#FF6B00] flex items-center justify-center border border-[#FF6B00]/20">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <span>Geospatial Issue Map (Ranchi Sector)</span>
          <span className="bg-[#F5F5F5] text-[#111111] text-xs px-2 py-0.5 rounded-full font-mono font-bold border border-[#E5E5E5]">
            {complaints.length} Issues Mapped
          </span>
        </div>

        {/* Toggle Switch Controls */}
        <div className="flex items-center gap-2.5">
          {/* Heatmap Toggle */}
          <label className="flex items-center gap-1.5 text-xs font-bold text-[#111111] cursor-pointer bg-[#F5F5F5] px-3 py-1.5 rounded-xl border border-[#E5E5E5] hover:bg-[#E5E5E5] transition">
            <input
              type="checkbox"
              checked={showHeatmap}
              onChange={(e) => setShowHeatmap(e.target.checked)}
              className="w-3.5 h-3.5 text-[#FF6B00] rounded focus:ring-[#FF6B00] cursor-pointer"
            />
            <Flame className={`w-3.5 h-3.5 ${showHeatmap ? "text-[#FF6B00] animate-pulse" : "text-[#6B6B6B]"}`} />
            <span>Heatmap Layer</span>
          </label>

          {/* Markers Toggle */}
          <label className="flex items-center gap-1.5 text-xs font-bold text-[#111111] cursor-pointer bg-[#F5F5F5] px-3 py-1.5 rounded-xl border border-[#E5E5E5] hover:bg-[#E5E5E5] transition">
            <input
              type="checkbox"
              checked={showMarkers}
              onChange={(e) => setShowMarkers(e.target.checked)}
              className="w-3.5 h-3.5 text-[#FF6B00] rounded focus:ring-[#FF6B00] cursor-pointer"
            />
            <MapPin className="w-3.5 h-3.5 text-[#111111]" />
            <span>Pin Markers</span>
          </label>
        </div>

      </div>

      {/* MAP CONTAINER */}
      <div className="bg-white rounded-2xl border border-[#E5E5E5] shadow-2xs overflow-hidden relative z-10">
        <MapContainer
          center={RANCHI_CENTER}
          zoom={13.5}
          scrollWheelZoom={true}
          style={{ height: "520px", width: "100%" }}
          className="rounded-2xl"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <HeatmapLayer complaints={complaints} showHeatmap={showHeatmap} />

          {showMarkers &&
            complaints.map((item) => {
              const priority = calculatePriority(item);
              const position = [item.lat || 23.3441, item.lng || 85.3096];

              return (
                <Marker key={item.id} position={position}>
                  <Popup className="custom-leaflet-popup">
                    <div className="p-1 space-y-2 max-w-xs text-xs">
                      <div className="flex items-center justify-between gap-2 border-b border-[#E5E5E5] pb-1.5">
                        <span className="font-mono font-bold text-[#111111]">{item.id}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] border font-bold ${priority.colorClass}`}>
                          {priority.label} ({priority.score} pts)
                        </span>
                      </div>

                      <h4 className="font-bold text-[#111111] text-xs capitalize">
                        {CATEGORY_LABELS[item.category] || item.category}
                      </h4>

                      <p className="text-[#6B6B6B] text-xs line-clamp-2">
                        {item.description}
                      </p>

                      <div className="flex flex-col gap-1 text-[11px] text-[#111111] bg-[#F5F5F5] p-2 rounded-lg border border-[#E5E5E5]">
                        <div className="flex items-center gap-1 text-[#6B6B6B]">
                          <MapPin className="w-3 h-3 text-[#FF6B00]" />
                          <span>{item.location}</span>
                        </div>
                        <div className="flex items-center justify-between pt-1 font-bold">
                          <span className="text-[#111111]">Dept: {item.department}</span>
                          <span className="text-[#FF6B00]">Status: {item.status}</span>
                        </div>
                        <div className="flex items-center justify-between text-[#6B6B6B] pt-0.5">
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
          <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-md text-[#111111] p-3 rounded-xl border border-[#E5E5E5] text-xs z-[1000] shadow-lg space-y-1.5">
            <div className="font-bold flex items-center gap-1 text-[#111111] text-[11px]">
              <Flame className="w-3.5 h-3.5 text-[#FF6B00]" /> Priority Heatmap Intensity
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-32 rounded-full bg-gradient-to-r from-[#6B6B6B] via-[#FF9E4D] to-[#FF6B00] border border-[#E5E5E5]"></div>
            </div>
            <div className="flex justify-between text-[10px] text-[#6B6B6B] font-mono">
              <span>Low</span>
              <span className="text-[#FF6B00] font-bold">High Priority</span>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
