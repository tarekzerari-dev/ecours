"use client";

import { DemoDataButton } from "@/components/demo-data-button";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function AdminSettingsPage() {
  const { t } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
          إعدادات النظام والبيانات التجريبية
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1.5 text-sm sm:text-base">
          إدارة النظام، مراقبة السحابة، وتوليد البيانات التجريبية لاختبار المنصة بكل سهولة.
        </p>
      </div>

      {/* Admin Info Card */}
      <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-700/60 shadow-sm space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-emerald-950/20">
            أ
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">حساب مدير النظام الرئيسي (Super Admin)</h2>
            <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">admin@ecours.com • صلاحيات كاملة</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 dark:border-slate-700">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-700/40">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">حالة قاعدة البيانات</p>
            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              متصل (Supabase Cloud)
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-700/40">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">نوع الصلاحية</p>
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1">
              إدارة شاملة للمدارس
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-700/40">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">البيئة الحالية</p>
            <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mt-1">
              Development (تجريبي)
            </p>
          </div>
        </div>
      </div>

      {/* Demo Data Generator Card */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-3">
          تهيئة البيانات التجريبية للأدمن
        </h2>
        <DemoDataButton role="superadmin" />
      </div>
    </div>
  );
}

