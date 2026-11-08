"use client";

import React from "react";

interface LogoProps {
  variant?: "full" | "horizontal" | "icon";
  theme?: "light" | "dark";
  className?: string;
  size?: number | string;
}

export function Logo({
  variant = "horizontal",
  theme = "light",
  className = "",
  size,
}: LogoProps) {
  // Theme color variables for text contrast
  const textColor = theme === "dark" ? "#FFFFFF" : "#0F172A"; // slate-900 or white
  const sloganColor = theme === "dark" ? "#94A3B8" : "#475569"; // slate-400 or slate-600
  const dividerColor = theme === "dark" ? "#334155" : "#E2E8F0"; // slate-700 or slate-200

  // 1. ICON ONLY — wordmark only
  if (variant === "icon") {
    return (
      <div className={`inline-flex items-baseline font-extrabold select-none ${className}`} style={{ fontFamily: "var(--font-brand), system-ui, sans-serif", fontSize: size || '1.5rem' }}>
        <span className="text-emerald-500 italic font-black" style={{ fontSize: '1.2em' }}>e</span>
        <span style={{ color: textColor }}>Cours</span>
      </div>
    );
  }

  // 2. HORIZONTAL VARIANT (Wordmark only - Ideal for Sidebars & Headers)
  if (variant === "horizontal") {
    return (
      <div className={`inline-flex items-baseline select-none ${className}`} style={{ fontFamily: "var(--font-brand), system-ui, sans-serif" }}>
        <span className="text-emerald-500 font-black italic text-3xl leading-none">e</span>
        <span style={{ color: textColor }} className="font-extrabold tracking-tight text-2xl leading-none">Cours</span>
      </div>
    );
  }

  // 3. FULL VARIANT (Wordmark + Arabic Slogan + Decorative Divider)
  return (
    <div className={`flex flex-col items-center text-center select-none ${className}`}>
      {/* Styled Wordmark Text */}
      <div className="flex items-baseline justify-center font-extrabold tracking-tight mb-3" style={{ fontFamily: "var(--font-brand), system-ui, sans-serif" }}>
        <span className="text-emerald-500 italic font-black" style={{ fontSize: '4.5rem', lineHeight: 1 }}>e</span>
        <span style={{ color: textColor, fontSize: '3.5rem', lineHeight: 1 }} className="font-extrabold tracking-tight">Cours</span>
      </div>

      {/* Elegant Horizontal Divider with Center Dot */}
      <div className="flex items-center justify-center w-full max-w-xs my-2 gap-3">
        <div className="h-px flex-1" style={{ backgroundColor: dividerColor }} />
        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-xs" />
        <div className="h-px flex-1" style={{ backgroundColor: dividerColor }} />
      </div>

      {/* Arabic Slogan */}
      <p
        className="text-xs sm:text-sm font-semibold tracking-wide mt-1"
        style={{ color: sloganColor, fontFamily: "var(--font-beiruti), var(--font-accent), system-ui, sans-serif" }}
      >
        إدارة ذكية • تعليم منظم • مستقبل أفضل
      </p>
    </div>
  );
}
