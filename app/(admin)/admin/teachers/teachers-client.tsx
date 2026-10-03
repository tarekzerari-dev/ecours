"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { SubtleBackground } from "@/components/subtle-background";
import { useAdminTeachers } from "@/lib/hooks/queries";
import AddTeacherModal from "@/components/add-teacher-modal";
import { deleteTeacher } from "@/app/(admin)/admin/actions";
import { useQueryClient } from "@tanstack/react-query";

export function TeachersClient() {
  const { t, language } = useLanguage();
  const { data: teachers = [], isLoading } = useAdminTeachers();
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Extract unique school names for filter
  const schoolOptions = Array.from(new Set(teachers.map((t: any) => t.schoolName).filter(Boolean)));

  const filteredTeachers = teachers.filter((teacher: any) => {
    const matchesSearch =
      teacher.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (teacher.phone && teacher.phone.includes(searchTerm)) ||
      (teacher.subject && teacher.subject.toLowerCase().includes(searchTerm.toLowerCase()));

    let matchesType = true;
    if (filterType === "independent") {
      matchesType = teacher.isIndependent;
    } else if (filterType === "affiliated") {
      matchesType = !teacher.isIndependent;
    } else if (filterType !== "all") {
      matchesType = teacher.schoolName === filterType;
    }

    return matchesSearch && matchesType;
  });

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`هل أنت متأكد من حذف الأستاذ ${name}؟ سيتم حذف جميع الأفواج والبيانات التابعة له.`)) return;

    setDeletingId(id);
    try {
      const res = await deleteTeacher(id);
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
      <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 text-xs font-bold mb-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
            سجل الكادر التعليمي
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            إدارة الأساتذة عبر المنصة
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            متابعة دقيقة لجميع الأساتذة مع التمييز الواضح بين الأساتذة المستقلين والأساتذة التابعين للمراكز
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm transition-all cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          إضافة أستاذ جديد
        </button>
      </div>

      {/* Search & Filters */}
      <div className="relative z-10 flex flex-col sm:flex-row items-center gap-3 mb-6">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="بحث باسم الأستاذ، رقم الهاتف، أو المادة الدراسية..."
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
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="w-full sm:w-64 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all cursor-pointer"
        >
          <option value="all">نوع الأستاذ: الكل</option>
          <option value="independent">الأساتذة المستقلون فقط (حساب مباشر)</option>
          <option value="affiliated">الأساتذة التابعون للمراكز والمدارس</option>
          {schoolOptions.map((s: any) => (
            <option key={s} value={s}>تابع لـ: {s}</option>
          ))}
        </select>
      </div>

      {/* Teachers Table */}
      <div className="relative z-10 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-700/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className={`w-full text-sm ${language === 'ar' ? 'text-right' : 'text-left'}`}>
            <thead className="bg-slate-50/70 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs">
              <tr>
                <th className="px-6 py-4 font-bold">الأستاذ</th>
                <th className="px-6 py-4 font-bold">نوع الأستاذ والتبعية</th>
                <th className="px-6 py-4 font-bold">المادة الدراسية</th>
                <th className="px-6 py-4 font-bold">الطور</th>
                <th className="px-6 py-4 font-bold">الأفواج</th>
                <th className="px-6 py-4 font-bold">رقم الهاتف</th>
                <th className="px-6 py-4 font-bold">الحالة</th>
                <th className="px-6 py-4 font-bold text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-slate-700 dark:text-slate-200">
              {filteredTeachers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center text-slate-500 dark:text-slate-400">
                    <p className="font-bold text-base mb-1">لا يوجد أساتذة مطابقين</p>
                    <p className="text-xs">جرب تغيير شروط البحث أو الفلترة.</p>
                  </td>
                </tr>
              ) : (
                filteredTeachers.map((teacher: any) => (
                  <tr key={teacher.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors">
                    {/* Teacher Name */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center text-sm shrink-0">
                          {teacher.fullName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-slate-100">{teacher.fullName}</p>
                          <p className="text-xs text-slate-400">{teacher.email || "أستاذ مسجل"}</p>
                        </div>
                      </div>
                    </td>

                    {/* Teacher Type & Affiliation */}
                    <td className="px-6 py-4">
                      {teacher.isIndependent ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-700/50">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                          </svg>
                          أستاذ مستقل (حساب مباشر)
                        </span>
                      ) : (
                        <div className="inline-flex flex-col">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-700/50">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21" />
                            </svg>
                            أستاذ تابع لمركز
                          </span>
                          {teacher.schoolName && (
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
                              {teacher.schoolName}
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Subject */}
                    <td className="px-6 py-4 font-semibold text-emerald-600 dark:text-emerald-400">
                      {teacher.subject}
                    </td>

                    {/* Phase */}
                    <td className="px-6 py-4 text-xs font-medium">
                      {teacher.phase === 'primary' ? 'ابتدائي' : teacher.phase === 'middle' ? 'متوسط' : 'ثانوي'}
                    </td>

                    {/* Groups Count */}
                    <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200">
                      {teacher.groupsCount} فوج
                    </td>

                    {/* Phone */}
                    <td className="px-6 py-4 text-xs font-mono" dir="ltr">
                      {teacher.phone}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${teacher.isActive ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-slate-100 text-slate-600 dark:text-slate-400 dark:bg-slate-700'}`}>
                        {teacher.isActive ? "نشط" : "متوقف"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleDelete(teacher.id, teacher.fullName)}
                        disabled={deletingId === teacher.id}
                        className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors cursor-pointer"
                        title="حذف الأستاذ"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddTeacherModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
