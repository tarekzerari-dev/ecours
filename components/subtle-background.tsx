"use client";

import React from "react";

export type BackgroundVariant = "groups" | "students" | "finance" | "default";

interface SubtleBackgroundProps {
  variant?: BackgroundVariant;
  className?: string;
}

export function SubtleBackground({
  variant = "default",
  className = "",
}: SubtleBackgroundProps) {
  return (
    <div
      className={`pointer-events-none select-none absolute inset-0 z-0 overflow-hidden text-slate-400/35 dark:text-slate-500 dark:text-slate-400/25 ${className}`}
      aria-hidden="true"
    >
      {variant === "groups" && <GroupsDoodles />}
      {variant === "students" && <StudentsDoodles />}
      {variant === "finance" && <FinanceDoodles />}
      {variant === "default" && <DefaultDoodles />}
    </div>
  );
}

/* =========================================================================
   1. GROUPS VARIANT (Responsive Educational Vector Line-Art)
   ========================================================================= */
function GroupsDoodles() {
  return (
    <>
      {/* Top Left: Interactive Classroom Whiteboard */}
      <div className="absolute -top-4 -left-4 sm:-top-6 sm:-left-4 w-28 h-28 sm:w-52 sm:h-52 lg:w-72 lg:h-72 -rotate-6 transition-transform">
        <svg viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
          <rect x="15" y="20" width="170" height="110" rx="8" />
          <rect x="23" y="28" width="154" height="94" rx="4" strokeDasharray="4 4" />
          <path d="M 35 130 L 20 180 M 165 130 L 180 180 M 10 180 L 45 180 M 155 180 L 190 180" />
          <rect x="65" y="130" width="70" height="7" rx="2" />
          <path d="M 40 60 Q 65 35 90 60 T 140 60" />
          <path d="M 40 95 L 120 95 M 55 75 L 55 105" />
          <circle cx="150" cy="85" r="10" />
        </svg>
      </div>

      {/* Top Right: School Building with Clock Tower */}
      <div className="absolute -top-4 -right-4 sm:-top-6 sm:-right-4 w-28 h-28 sm:w-52 sm:h-52 lg:w-72 lg:h-72 rotate-6 transition-transform">
        <svg viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
          <path d="M 20 85 L 100 20 L 180 85 Z" />
          <path d="M 35 85 L 35 180 L 165 180 L 165 85" />
          <circle cx="100" cy="62" r="16" />
          <path d="M 100 62 L 100 52 M 100 62 L 108 62" />
          <path d="M 58 110 L 58 180 M 86 110 L 86 180 M 114 110 L 114 180 M 142 110 L 142 180" />
          <path d="M 86 180 L 86 145 C 86 138 114 138 114 145 L 114 180" />
          <path d="M 15 180 L 185 180 M 10 190 L 190 190" />
        </svg>
      </div>

      {/* Bottom Left: Geometry Set Square & Compass */}
      <div className="absolute -bottom-6 -left-4 sm:-bottom-10 sm:-left-4 w-28 h-28 sm:w-52 sm:h-52 lg:w-72 lg:h-72 rotate-12 transition-transform">
        <svg viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
          <path d="M 20 170 L 170 170 L 20 20 Z" />
          <path d="M 45 150 L 135 150 L 45 60 Z" />
          <path d="M 35 170 L 35 160 M 55 170 L 55 163 M 75 170 L 75 160 M 95 170 L 95 163 M 115 170 L 115 160 M 135 170 L 135 163 M 155 170 L 155 160" />
          <path d="M 140 40 L 105 130 M 140 40 L 175 130" />
          <circle cx="140" cy="40" r="8" />
          <path d="M 118 90 L 162 90" />
        </svg>
      </div>

      {/* Bottom Right: Teacher Desk & Globe */}
      <div className="absolute -bottom-6 -right-4 sm:-bottom-10 sm:-right-4 w-28 h-28 sm:w-52 sm:h-52 lg:w-72 lg:h-72 -rotate-12 transition-transform">
        <svg viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
          <path d="M 25 80 L 175 80 M 40 80 L 40 170 M 160 80 L 160 170" />
          <rect x="110" y="90" width="50" height="30" rx="4" />
          <rect x="110" y="125" width="50" height="30" rx="4" />
          <circle cx="135" cy="105" r="3" />
          <circle cx="135" cy="140" r="3" />
          <circle cx="65" cy="50" r="22" />
          <path d="M 65 28 C 78 28 87 38 87 50 C 87 62 78 72 65 72" />
          <path d="M 43 50 L 87 50" />
          <path d="M 65 72 L 65 80 M 52 80 L 78 80" />
        </svg>
      </div>
    </>
  );
}

/* =========================================================================
   2. STUDENTS VARIANT (Graduation Cap, Backpack, Open Book, Notebook)
   ========================================================================= */
function StudentsDoodles() {
  return (
    <>
      {/* Top Right: Graduation Cap */}
      <div className="absolute -top-4 -right-4 sm:-top-6 sm:-right-4 w-28 h-28 sm:w-52 sm:h-52 lg:w-72 lg:h-72 rotate-6">
        <svg viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
          <polygon points="100,25 185,65 100,105 15,65" />
          <path d="M 50 85 L 50 120 C 50 138 150 138 150 120 L 150 85" />
          <path d="M 100 65 L 165 95 L 165 145" />
          <polygon points="158,145 172,145 168,168 162,168" />
          <circle cx="100" cy="65" r="4" fill="currentColor" />
        </svg>
      </div>

      {/* Top Left: School Backpack */}
      <div className="absolute -top-4 -left-4 sm:-top-6 sm:-left-4 w-28 h-28 sm:w-52 sm:h-52 lg:w-72 lg:h-72 -rotate-6">
        <svg viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
          <rect x="35" y="45" width="130" height="140" rx="30" />
          <rect x="55" y="110" width="90" height="65" rx="14" />
          <path d="M 70 45 C 70 20 130 20 130 45" />
          <path d="M 45 60 C 20 85 20 150 35 175" />
          <path d="M 155 60 C 180 85 180 150 165 175" />
          <line x1="65" y1="128" x2="135" y2="128" strokeDasharray="4 4" />
        </svg>
      </div>

      {/* Bottom Left: Open Textbook */}
      <div className="absolute -bottom-6 -left-4 sm:-bottom-10 sm:-left-4 w-28 h-28 sm:w-52 sm:h-52 lg:w-72 lg:h-72 rotate-12">
        <svg viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
          <path d="M 100 35 C 65 22 25 35 12 42 L 12 148 C 25 141 65 128 100 141 Z" />
          <path d="M 100 35 C 135 22 175 35 188 42 L 188 148 C 175 141 135 128 100 141 Z" />
          <path d="M 100 35 L 100 141" />
          <line x1="30" y1="65" x2="80" y2="58" />
          <line x1="30" y1="85" x2="80" y2="78" />
          <line x1="30" y1="105" x2="80" y2="98" />
          <line x1="120" y1="58" x2="170" y2="65" />
          <line x1="120" y1="78" x2="170" y2="85" />
          <line x1="120" y1="98" x2="170" y2="105" />
          <path d="M 100 35 L 115 95 L 100 85 L 85 95 Z" />
        </svg>
      </div>

      {/* Bottom Right: Notebook & Pencil */}
      <div className="absolute -bottom-6 -right-4 sm:-bottom-10 sm:-right-4 w-28 h-28 sm:w-52 sm:h-52 lg:w-72 lg:h-72 -rotate-12">
        <svg viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
          <rect x="40" y="30" width="130" height="150" rx="12" />
          <path d="M 28 50 C 28 42 50 42 50 50 M 28 75 C 28 67 50 67 50 75 M 28 100 C 28 92 50 92 50 100 M 28 125 C 28 117 50 117 50 125 M 28 150 C 28 142 50 142 50 150" />
          <line x1="68" y1="65" x2="148" y2="65" strokeDasharray="3 3" />
          <line x1="68" y1="90" x2="148" y2="90" strokeDasharray="3 3" />
          <line x1="68" y1="115" x2="148" y2="115" strokeDasharray="3 3" />
          <line x1="68" y1="140" x2="148" y2="140" strokeDasharray="3 3" />
          <g transform="translate(140, 15) rotate(30)">
            <path d="M 0 0 L 16 0 L 16 110 L 8 128 L 0 110 Z" />
            <line x1="0" y1="20" x2="16" y2="20" />
            <polygon points="5,122 8,128 11,122" fill="currentColor" />
          </g>
        </svg>
      </div>
    </>
  );
}

/* =========================================================================
   3. FINANCE VARIANT (Piggy Bank, Calculator, Banknotes, Growth Chart)
   ========================================================================= */
function FinanceDoodles() {
  return (
    <>
      {/* Top Right: Piggy Bank */}
      <div className="absolute -top-4 -right-4 sm:-top-6 sm:-right-4 w-28 h-28 sm:w-52 sm:h-52 lg:w-72 lg:h-72 rotate-6">
        <svg viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
          <path d="M 50 90 C 25 65 35 25 90 30 C 135 12 180 40 175 85 C 180 105 168 130 150 130 L 138 130 L 130 150 L 105 150 L 112 130 L 75 130 L 68 150 L 43 150 L 50 130 C 30 122 25 105 32 90 Z" />
          <ellipse cx="32" cy="85" rx="10" ry="15" />
          <circle cx="28" cy="80" r="2" fill="currentColor" />
          <circle cx="28" cy="90" r="2" fill="currentColor" />
          <circle cx="70" cy="55" r="4" fill="currentColor" />
          <path d="M 80 30 L 65 10 L 62 33" />
          <line x1="100" y1="25" x2="130" y2="25" strokeWidth="2.5" />
          <circle cx="115" cy="8" r="10" />
          <path d="M 115 4 L 115 12 M 111 8 L 119 8" />
        </svg>
      </div>

      {/* Top Left: Calculator */}
      <div className="absolute -top-4 -left-4 sm:-top-6 sm:-left-4 w-28 h-28 sm:w-52 sm:h-52 lg:w-72 lg:h-72 -rotate-6">
        <svg viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
          <rect x="30" y="20" width="130" height="170" rx="16" />
          <rect x="46" y="38" width="98" height="38" rx="6" />
          <path d="M 58 57 L 78 57 M 98 57 L 126 57" strokeDasharray="3 3" />
          <circle cx="60" cy="100" r="7" />
          <circle cx="95" cy="100" r="7" />
          <circle cx="130" cy="100" r="7" />
          <circle cx="60" cy="130" r="7" />
          <circle cx="95" cy="130" r="7" />
          <circle cx="130" cy="130" r="7" />
          <circle cx="60" cy="160" r="7" />
          <circle cx="95" cy="160" r="7" />
          <rect x="120" y="151" width="20" height="18" rx="4" />
        </svg>
      </div>

      {/* Bottom Left: Cash Stack */}
      <div className="absolute -bottom-6 -left-4 sm:-bottom-10 sm:-left-4 w-28 h-28 sm:w-52 sm:h-52 lg:w-72 lg:h-72 rotate-12">
        <svg viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
          <rect x="35" y="25" width="145" height="85" rx="8" transform="rotate(-8 35 25)" />
          <rect x="20" y="50" width="155" height="90" rx="10" />
          <circle cx="97" cy="95" r="22" />
          <text x="86" y="103" fontSize="20" fontWeight="bold" fill="currentColor" stroke="none">DA</text>
          <rect x="34" y="64" width="18" height="18" rx="3" />
          <rect x="143" y="108" width="18" height="18" rx="3" />
        </svg>
      </div>

      {/* Bottom Right: Bar Chart */}
      <div className="absolute -bottom-6 -right-4 sm:-bottom-10 sm:-right-4 w-28 h-28 sm:w-52 sm:h-52 lg:w-72 lg:h-72 -rotate-12">
        <svg viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
          <path d="M 20 175 L 185 175 M 20 175 L 20 20" />
          <rect x="38" y="115" width="26" height="60" rx="4" />
          <rect x="76" y="90" width="26" height="85" rx="4" />
          <rect x="114" y="55" width="26" height="120" rx="4" />
          <rect x="152" y="25" width="26" height="150" rx="4" />
          <path d="M 32 125 L 75 95 L 115 60 L 175 15" strokeWidth="2.5" />
          <path d="M 152 15 L 175 15 L 175 38" strokeWidth="2.5" />
        </svg>
      </div>
    </>
  );
}

/* =========================================================================
   4. DEFAULT VARIANT (Lightbulb, Atom, Graduation Book, Analytics Scroll)
   ========================================================================= */
function DefaultDoodles() {
  return (
    <>
      {/* Top Right: Lightbulb */}
      <div className="absolute -top-4 -right-4 sm:-top-6 sm:-right-4 w-28 h-28 sm:w-52 sm:h-52 lg:w-72 lg:h-72 rotate-6">
        <svg viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
          <path d="M 60 120 C 38 105 25 75 32 45 C 44 15 80 8 108 22 C 130 38 138 72 122 98 C 110 112 100 120 92 135 L 60 135 Z" />
          <path d="M 60 135 L 92 135 M 63 147 L 89 147 M 68 159 L 84 159" />
          <line x1="77" y1="-2" x2="77" y2="-18" />
          <line x1="130" y1="20" x2="145" y2="8" />
          <line x1="152" y1="65" x2="170" y2="65" />
          <line x1="3" y1="65" x2="-15" y2="65" />
          <line x1="22" y1="20" x2="7" y2="8" />
        </svg>
      </div>

      {/* Top Left: Graduation Book Stack */}
      <div className="absolute -top-4 -left-4 sm:-top-6 sm:-left-4 w-28 h-28 sm:w-52 sm:h-52 lg:w-72 lg:h-72 -rotate-6">
        <svg viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
          <rect x="25" y="140" width="150" height="30" rx="6" />
          <line x1="40" y1="155" x2="160" y2="155" />
          <rect x="40" y="105" width="130" height="30" rx="6" />
          <polygon points="100,20 180,50 100,80 20,50" />
          <path d="M 50 62 L 50 90 C 50 102 150 102 150 90 L 150 62" />
          <path d="M 100 50 L 160 72 L 160 110" />
        </svg>
      </div>

      {/* Bottom Left: Atom Science */}
      <div className="absolute -bottom-6 -left-4 sm:-bottom-10 sm:-left-4 w-28 h-28 sm:w-52 sm:h-52 lg:w-72 lg:h-72 rotate-12">
        <svg viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
          <ellipse cx="100" cy="100" rx="85" ry="30" transform="rotate(30 100 100)" />
          <ellipse cx="100" cy="100" rx="85" ry="30" transform="rotate(-30 100 100)" />
          <ellipse cx="100" cy="100" rx="85" ry="30" transform="rotate(90 100 100)" />
          <circle cx="100" cy="100" r="14" fill="currentColor" />
        </svg>
      </div>

      {/* Bottom Right: Analytics Scroll */}
      <div className="absolute -bottom-6 -right-4 sm:-bottom-10 sm:-right-4 w-28 h-28 sm:w-52 sm:h-52 lg:w-72 lg:h-72 -rotate-12">
        <svg viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
          <path d="M 40 30 C 25 30 25 50 40 50 L 160 50 C 175 50 175 30 160 30 Z" />
          <rect x="32" y="50" width="136" height="120" rx="6" />
          <path d="M 32 170 C 17 170 17 150 32 150 L 152 150 C 167 150 167 170 152 170 Z" />
          <circle cx="125" cy="110" r="20" />
          <path d="M 113 126 L 105 160 L 125 148 L 145 160 L 137 126" />
          <line x1="55" y1="80" x2="100" y2="80" />
          <line x1="55" y1="105" x2="90" y2="105" />
        </svg>
      </div>
    </>
  );
}
