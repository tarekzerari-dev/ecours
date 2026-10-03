"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import AdminSidebar from "@/components/admin-sidebar";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userName, setUserName] = useState<string | undefined>(undefined);
  const { t, language } = useLanguage();

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
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userName={userName}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800">
          <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
            {/* Hamburger menu (mobile) */}
            <button
              onClick={() => setSidebarOpen(true)}
              className={`lg:hidden p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:text-slate-300 dark:hover:text-slate-200 transition-colors cursor-pointer ${language === 'ar' ? 'ml-auto' : 'mr-auto'}`}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>

            {/* Title / Search placeholder */}
            <div className={`hidden sm:flex items-center flex-1 ${language === 'ar' ? 'ml-auto' : 'mr-auto'}`}>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50/80 dark:bg-emerald-900/30 px-3 py-1.5 rounded-xl border border-emerald-200/60 dark:border-emerald-700/50">
                لوحة أدمن النظام المركزية (Super Admin)
              </span>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              <span className="hidden md:inline text-xs text-slate-500 dark:text-slate-400">
                {t('welcome')} <span className="font-bold text-slate-800 dark:text-slate-200">{userName?.split("@")[0] || "أدمن المنصة"}</span>
              </span>
              <div className="flex items-center justify-center w-9 h-9 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white text-sm font-bold shadow-sm shadow-emerald-950/10">
                {userName ? userName.charAt(0).toUpperCase() : "أ"}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="relative flex-1 p-4 sm:p-6 lg:p-8 overflow-hidden">{children}</main>
      </div>
    </div>
  );
}
