import React, { useState } from "react";
import { User, ShieldCheck, Building2, Activity, Menu, X, Layers } from "lucide-react";

/**
 * Modern Minimalist SaaS Navbar Component
 * 
 * Premium Monochrome + Signature Orange (#FF6B00) Accent
 */
export default function Navbar({ activeTab, setActiveTab, totalCount }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navTabs = [
    {
      id: "citizen",
      label: "Citizen Portal",
      description: "Report & Track",
      icon: User,
    },
    {
      id: "admin",
      label: "City Administration",
      description: "Map & Analytics",
      icon: ShieldCheck,
    },
    {
      id: "department",
      label: "Department Action",
      description: "Resolve & Verify",
      icon: Building2,
    },
  ];

  return (
    <header className="bg-white sticky top-0 z-50 border-b border-[#E5E5E5] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* App Branding */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#111111] flex items-center justify-center text-[#FF6B00] shadow-2xs border border-[#111111]">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-[#111111] tracking-tight text-lg">
                  Civic<span className="text-[#FF6B00]">Pulse</span>
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FFF1E6] text-[#FF6B00] border border-[#FF6B00]/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B00] mr-1.5 animate-pulse"></span>
                  Live Network
                </span>
              </div>
              <p className="text-[11px] text-[#6B6B6B] -mt-0.5 hidden sm:block">
                Municipal Issue Resolution Platform
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs - Segmented Control */}
          <nav className="hidden md:flex items-center bg-[#F5F5F5] p-1 rounded-xl border border-[#E5E5E5]">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${
                    isActive
                      ? "bg-white text-[#111111] shadow-2xs border border-[#E5E5E5]"
                      : "text-[#6B6B6B] hover:text-[#111111] hover:bg-[#E5E5E5]/50"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-[#FF6B00]" : "text-[#6B6B6B]"}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Status Badge & Mobile Menu Button */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2 bg-[#F5F5F5] px-3 py-1.5 rounded-xl border border-[#E5E5E5] text-xs font-medium text-[#6B6B6B]">
              <Layers className="w-3.5 h-3.5 text-[#FF6B00]" />
              <span>Active Issues:</span>
              <span className="font-bold text-[#111111] font-mono bg-white px-1.5 py-0.5 rounded border border-[#E5E5E5] text-[11px]">
                {totalCount}
              </span>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-[#111111] hover:bg-[#F5F5F5] border border-[#E5E5E5] transition cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Dropdown Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-[#E5E5E5] px-4 pt-2 pb-4 space-y-2 animate-fade-in shadow-lg">
          <p className="text-[11px] font-semibold text-[#6B6B6B] uppercase tracking-wider px-2 pt-1">
            Navigation Portals
          </p>
          <div className="grid grid-cols-1 gap-1">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                    isActive
                      ? "bg-[#FFF1E6] text-[#111111] border border-[#FF6B00]/30 font-semibold"
                      : "text-[#6B6B6B] hover:bg-[#F5F5F5]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? "text-[#FF6B00]" : "text-[#6B6B6B]"}`} />
                    <span>{tab.label}</span>
                  </div>
                  <span className="text-xs text-[#6B6B6B]">{tab.description}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-[#E5E5E5] flex items-center justify-between text-xs text-[#6B6B6B] px-2">
            <span>Total Active Issues:</span>
            <span className="font-bold text-[#111111] font-mono bg-[#F5F5F5] px-2 py-0.5 rounded border border-[#E5E5E5]">
              {totalCount}
            </span>
          </div>
        </div>
      )}
    </header>
  );
}
