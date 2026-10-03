"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Sidebar from "@/components/sidebar";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { AuthProvider, useAuth } from "@/lib/AdminContext";
import { api } from "@/lib/supabase/api";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userName, setUserName] = useState<string | undefined>(undefined);
  const [teachers, setTeachers] = useState<any[]>([]);
  const { t, language } = useLanguage();
  const { isManager, isSuperAdmin, selectedTeacherId, setSelectedTeacherId } = useAuth();

  useEffect(() => {
    const getUser = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUserName(user?.user_metadata?.full_name || user?.email);
      } catch (err) {
        console.warn("Auth not configured yet");
      }
    };
    getUser();

    // Load teachers for admin dropdown
    const loadTeachers = async () => {
      try {
        if (isManager) {
          const t = await api.getTeachers();
          setTeachers(t);
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadTeachers();
  }, [isManager]);

  const defaultRoleName = isSuperAdmin ? "أدمن النظام" : isManager ? "مدير المدرسة" : t('teacher');

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userName={userName}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/60 dark:bg-slate-900/80 dark:border-slate-700/60">
          <div className="relative flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
            {/* Hamburger menu (mobile) */}
            <button
              onClick={() => setSidebarOpen(true)}
              className={`lg:hidden p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer ${language === 'ar' ? 'ml-2' : 'mr-2'}`}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>

            {/* Start side: Search */}
            <div className="hidden sm:flex items-center flex-1 max-w-xs">
              <div className="relative w-full">
                <svg className={`absolute ${language === 'ar' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
                <input
                  type="text"
                  placeholder={t('searchPlaceholder')}
                  className={`w-full ${language === 'ar' ? 'pr-9 pl-4' : 'pl-9 pr-4'} py-2 rounded-xl bg-slate-100/80 text-sm text-slate-700 dark:text-slate-300 placeholder:text-slate-400 border border-transparent focus:bg-white focus:border-emerald-300 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200 dark:bg-slate-800/80 dark:text-slate-300 dark:placeholder:text-slate-500 dark:text-slate-400 dark:focus:bg-slate-800 dark:focus:border-emerald-500/40`}
                />
              </div>
            </div>

            {/* Center: Redesigned 'View As' Selector for Manager */}
            {isManager && (
              <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-500/10 via-teal-500/15 to-emerald-500/10 border border-emerald-500/30 shadow-sm backdrop-blur-md dark:bg-slate-800/90 dark:border-emerald-500/40">
                  <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 text-xs font-bold shrink-0">
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span>عرض كـ:</span>
                  </div>

                  <div className="relative">
                    <select
                      value={selectedTeacherId || ''}
                      onChange={(e) => setSelectedTeacherId(e.target.value || null)}
                      className="appearance-none bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-semibold text-xs py-1.5 pr-3 pl-8 rounded-lg border border-emerald-200 dark:border-emerald-700/60 shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30 cursor-pointer hover:border-emerald-400 transition-all"
                    >
                      <option value="">كافة أساتذة المدرسة (الكل)</option>
                      {teachers.map(t => (
                        <option key={t.id} value={t.id}>{t.fullName} ({t.subject})</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 left-2 flex items-center text-emerald-600 dark:text-emerald-400">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* End side: User Info */}
            <div className="flex items-center gap-3">
              <span className="hidden md:inline text-sm text-slate-500 dark:text-slate-400">
                {t('welcome')} <span className="font-semibold text-slate-800 dark:text-slate-100">{userName?.split("@")[0] || defaultRoleName}</span>
              </span>
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-emerald-600 to-teal-700 text-white text-sm font-bold shadow-sm shadow-emerald-950/20 ring-2 ring-emerald-500/20">
                {userName ? userName.charAt(0).toUpperCase() : (isSuperAdmin ? "أ" : isManager ? "م" : "أ")}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="relative flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );

}
