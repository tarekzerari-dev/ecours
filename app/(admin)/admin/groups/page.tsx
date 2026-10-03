"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { SubtleBackground } from "@/components/subtle-background";
import { useAdminGroups } from "@/lib/hooks/queries";

export default function AdminGroupsPage() {
  const { t, language } = useLanguage();
  const { data: groups = [], isLoading } = useAdminGroups();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterSchool, setFilterSchool] = useState("all");

  const schoolOptions = Array.from(new Set(groups.map((g: any) => g.schoolName).filter(Boolean)));

  const filteredGroups = groups.filter((group: any) => {
    const matchesSearch =
      group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.schoolName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSchool = filterSchool === "all" || group.schoolName === filterSchool;

    return matchesSearch && matchesSchool;
  });

  const totalStudents = groups.reduce((acc: number, g: any) => acc + (g.studentCount || 0), 0);

  return (
    <div className="relative min-h-[calc(100vh-8rem)]">
      <SubtleBackground variant="groups" />

      {/* Header */}
      <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold mb-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
            </svg>
            الأفواج والأقسام الدراسية
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            إدارة الأفواج عبر المنصة
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            استعراض جميع الأفواج المسجلة في المدارس ولدى الأساتذة المستقلين، ومتابعة أعداد الطلبة والتسعير
          </p>
        </div>

        {/* Quick Stats Pill */}
        <div className="flex items-center gap-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-sm text-xs">
          <div>
            <span className="text-slate-400">إجمالي الأفواج: </span>
            <span className="font-bold text-slate-900 dark:text-slate-100">{groups.length}</span>
          </div>
          <span className="text-slate-300">|</span>
          <div>
            <span className="text-slate-400">إجمالي الطلبة: </span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">{totalStudents}</span>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="relative z-10 flex flex-col sm:flex-row items-center gap-3 mb-6">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="بحث باسم الفوج، الأستاذ، أو المدرسة..."
            className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none backdrop-blur-md transition-all placeholder:text-slate-400"
          />
          <svg
            className="w-5 h-5 absolute right-3 top-3 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.8}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
        </div>

        <select
          value={filterSchool}
          onChange={(e) => setFilterSchool(e.target.value)}
          className="w-full sm:w-56 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all cursor-pointer"
        >
          <option value="all">جميع المدارس / المراكز</option>
          {schoolOptions.map((s: any) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Groups Table */}
      <div className="relative z-10 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-700/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className={`w-full text-sm ${language === 'ar' ? 'text-right' : 'text-left'}`}>
            <thead className="bg-slate-50/70 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs">
              <tr>
                <th className="px-6 py-4 font-bold">اسم الفوج</th>
                <th className="px-6 py-4 font-bold">الأستاذ المشرف</th>
                <th className="px-6 py-4 font-bold">الجهة التابع لها</th>
                <th className="px-6 py-4 font-bold">عدد الطلبة</th>
                <th className="px-6 py-4 font-bold">السعر الشهري</th>
                <th className="px-6 py-4 font-bold">تاريخ الإنشاء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-slate-700 dark:text-slate-200">
              {filteredGroups.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-slate-500 dark:text-slate-400">
                    <p className="font-bold text-base mb-1">لا توجد أفواج مطابقة</p>
                    <p className="text-xs">جرب تغيير شروط البحث.</p>
                  </td>
                </tr>
              ) : (
                filteredGroups.map((group: any) => (
                  <tr key={group.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center text-sm shrink-0">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-slate-100">{group.name}</p>
                          <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">فوج دراسي</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21c-2.676 0-5.216-.584-7.499-1.632Z" />
                        </svg>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {group.teacherName}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {group.schoolId ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200/50">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21" />
                          </svg>
                          {group.schoolName}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200/50">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21c-2.676 0-5.216-.584-7.499-1.632Z" />
                          </svg>
                          أستاذ مستقل
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-bold text-emerald-600 dark:text-emerald-400">
                      {group.studentCount} طالب
                    </td>
                    <td className="px-6 py-4 font-extrabold text-slate-900 dark:text-slate-100">
                      {group.monthlyPrice.toLocaleString()} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">دج</span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400">
                      {new Date(group.createdAt).toLocaleDateString('ar-DZ')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
