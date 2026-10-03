"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { SubtleBackground } from "@/components/subtle-background";
import { useAdminSchools, useAdminTeachers } from "@/lib/hooks/queries";
import AddSchoolModal from "@/components/add-school-modal";
import SchoolTeachersModal from "@/components/school-teachers-modal";
import { deleteSchool } from "@/app/(admin)/admin/actions";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";

export default function AdminSchoolsPage() {
  const { t, language } = useLanguage();
  const { data: schools = [], isLoading } = useAdminSchools();
  const { data: teachers = [] } = useAdminTeachers();
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSchoolForTeachers, setSelectedSchoolForTeachers] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredSchools = schools.filter(
    (s: any) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.managerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`هل أنت متأكد من حذف ${name}؟ سيتم حذف جميع الأفواج والبيانات التابعة لها.`)) return;

    setDeletingId(id);
    try {
      const res = await deleteSchool(id);
      if (res?.error) {
        alert(res.error);
      } else {
        queryClient.invalidateQueries();
      }
    } catch (err: any) {
      alert("حدث خطأ أثناء الحذف: " + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-8rem)]">
      <SubtleBackground variant="groups" />

      {/* Header */}
      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold mb-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21" />
            </svg>
            المؤسسات والمراكز التعليمية
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            إدارة المدارس والمدراء
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            متابعة جميع المدارس والمراكز المسجلة في المنصة والمدراء المشرفين عليها
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm transition-all cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          إضافة مدرسة جديدة
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative z-10 mb-6 max-w-md">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="بحث باسم المدرسة، المدير، أو المدينة..."
            className="w-full pl-4 pr-10 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none backdrop-blur-md transition-all placeholder:text-slate-400"
          />
          <svg
            className="w-5 h-5 absolute right-3.5 top-3.5 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.8}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
        </div>
      </div>

      {/* Schools Grid */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSchools.length > 0 ? (
          filteredSchools.map((school: any) => {
            const schoolTeachersCount = teachers.filter(
              (t: any) => t.schoolId === school.id || (t.schoolName && t.schoolName === school.name)
            ).length;

            return (
              <div
                key={school.id}
                className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700/60 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3.5 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xl border border-emerald-500/20 shrink-0">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21" />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base truncate">{school.name}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                        </svg>
                        {school.address}
                      </p>
                    </div>
                  </div>

                  {/* Manager Info */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-700/40 mb-4">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">المدير المسؤول</p>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{school.managerName}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5" dir="ltr">{school.managerPhone}</p>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-3 py-3 border-t border-slate-100 dark:border-slate-700/60 text-xs">
                    <div className="text-right">
                      <p className="text-slate-400 dark:text-slate-500 dark:text-slate-400 mb-0.5">الأفواج</p>
                      <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                        {school.groupsCount} فوج
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-400 dark:text-slate-500 dark:text-slate-400 mb-0.5">الطلبة المسجلين</p>
                      <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                        {school.studentsCount} طالب
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center gap-2">
                  {/* Pop-up trigger button for School Teachers */}
                  <button
                    type="button"
                    onClick={() => setSelectedSchoolForTeachers(school)}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 dark:text-emerald-300 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs border border-emerald-200/50 dark:border-emerald-700/40"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                    </svg>
                    <span>الأساتذة ({schoolTeachersCount})</span>
                  </button>

                  <Link
                    href={`/admin/groups`}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:text-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer text-center"
                  >
                    الأفواج
                  </Link>

                  <button
                    onClick={() => handleDelete(school.id, school.name)}
                    disabled={deletingId === school.id}
                    className="py-2.5 px-3 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-900/20 transition-colors cursor-pointer border border-rose-100 dark:border-rose-900/30"
                  >
                    {deletingId === school.id ? "..." : "حذف"}
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-16 text-center bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700/60 shadow-sm">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 mb-4">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
              {searchTerm ? "لم يتم العثور على مدرسة مطابقة" : "لا توجد مدارس مضافة بعد"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-5">
              يمكنك إضافة مدرسة جديدة أو تهيئة البيانات التجريبية عبر قسم الإعدادات.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
            >
              إضافة مدرسة جديدة الآن
            </button>
          </div>
        )}
      </div>

      {/* Add School Modal */}
      <AddSchoolModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      {/* Pop-up modal for displaying school teachers */}
      <SchoolTeachersModal
        isOpen={!!selectedSchoolForTeachers}
        onClose={() => setSelectedSchoolForTeachers(null)}
        school={selectedSchoolForTeachers}
        teachers={teachers}
      />
    </div>
  );
}
