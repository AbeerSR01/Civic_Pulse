import React from "react";
import { User, ShieldCheck, Building2, AlertCircle } from "lucide-react";

/**
 * Navbar Component
 * 
 * Props:
 * - activeTab: string ('citizen' | 'admin' | 'department') - currently visible tab
 * - setActiveTab: function - callback to update the active tab in App.jsx
 * - totalCount: number - total count of complaints to display in badge
 */
export default function Navbar({ activeTab, setActiveTab, totalCount }) {
  // Navigation tabs configuration array for easy rendering
  const navTabs = [
    {
      id: "citizen",
      label: "Citizen View",
      subtitle: "Report & Track Issues",
      icon: User,
    },
    {
      id: "admin",
      label: "Admin View",
      subtitle: "City-wide Overview",
      icon: ShieldCheck,
    },
    {
      id: "department",
      label: "Department View",
      subtitle: "Resolve Issues",
      icon: Building2,
    },
  ];

  return (
    <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-50 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between py-3 gap-4">
          
          {/* App Branding & Logo */}
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-tr from-blue-600 to-indigo-500 p-2.5 rounded-xl shadow-md flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white">CivicPulse</h1>
                <span className="bg-blue-500/20 text-blue-300 text-xs font-semibold px-2 py-0.5 rounded-full border border-blue-400/30">
                  Hackathon Prototype
                </span>
              </div>
              <p className="text-xs text-slate-400">Crowdsourced Issue Reporting & Resolution System</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center bg-slate-800/80 p-1.5 rounded-xl border border-slate-700/60 overflow-x-auto">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                      : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                  <div className="text-left">
                    <div>{tab.label}</div>
                  </div>
                </button>
              );
            })}
          </nav>

        </div>
      </div>
    </header>
  );
}
