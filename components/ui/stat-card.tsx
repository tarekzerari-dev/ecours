"use client";

import { ReactNode } from "react";
import { CardCornerDoodle, DoodleIconType } from "./card-corner-doodle";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  doodleType?: DoodleIconType;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  isLoading?: boolean;
}

export function StatCard({ title, value, icon, doodleType = "spark", trend, isLoading }: StatCardProps) {
  if (isLoading) {
    return (
      <div className="relative overflow-hidden rounded-3xl p-6 glass-panel flex flex-col gap-4 animate-pulse">
        <div className="flex justify-between items-start">
          <div className="w-12 h-12 rounded-2xl bg-slate-200/50" />
          <div className="w-16 h-6 rounded-full bg-slate-200/50" />
        </div>
        <div className="space-y-2 mt-4">
          <div className="w-24 h-4 rounded-full bg-slate-200/50" />
          <div className="w-32 h-8 rounded-full bg-slate-200/50" />
        </div>
      </div>
    );
  }

  return (
    <div className="group relative overflow-hidden rounded-3xl p-6 glass-panel interactive-element hover:shadow-float-hover bg-gradient-to-br from-white/80 to-white/40">
      {/* Subtle background glow effect */}
      <div className="absolute -inset-px bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out" />
      
      <div className="relative z-10 flex flex-col h-full justify-between gap-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-sm shadow-emerald-950/15 hover:scale-110 transition-transform duration-300 ease-out cursor-pointer">
            {icon}
          </div>
          
          {trend && (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold tracking-wide ${
              trend.isPositive 
                ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-200/50' 
                : 'bg-rose-500/10 text-rose-600 border border-rose-200/50'
            }`}>
              <span className="ml-1">{trend.isPositive ? '+' : '-'}</span>
              <span dir="ltr">{Math.abs(trend.value)}%</span>
            </span>
          )}
        </div>

        <div className="mt-4">
          <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 tracking-wide uppercase">{title}</h3>
          <p className="mt-1 text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">{value}</p>
        </div>
      </div>
    </div>
  );
}
