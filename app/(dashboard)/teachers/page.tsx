"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { SubtleBackground } from "@/components/subtle-background";
import { CardCornerDoodle } from "@/components/ui/card-corner-doodle";
import { useAuth } from "@/lib/AdminContext";
import { useRouter } from "next/navigation";
import { useTeachers } from "@/lib/hooks/queries";
import AddTeacherModal from "@/components/add-teacher-modal";
import { deleteTeacher } from "@/app/(admin)/admin/actions";
import { useQueryClient } from "@tanstack/react-query";

export default function TeachersPage() {
  const { t, language } = useLanguage();
  const { isManager, setSelectedTeacherId } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isManager) {
      router.push("/dashboard");
    }
  }, [isManager, router]);

  const { data: teachers = [], isLoading } = useTeachers();

  const handleViewTeacherGroups = (teacherId: string) => {
    setSelectedTeacherId(teacherId);
    router.push("/groups");
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`هل أنت متأكد من حذف ${name}؟ سيتم حذف جميع الأفواج والبيانات المرتبطة.`)) return;

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

  if (isLoading || !isManager) return null;

  return (
    <div className="relative min-h-[calc(100vh-8rem)]">
      <SubtleBackground variant="default" />

      {/* Header */}
      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">إدارة الأساتذة</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">إضافة وحذف الأساتذة، ومتابعة أفواج ودروس كل أستاذ</p>
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

      {/* Teachers List */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teachers.length > 0 ? (
          teachers.map((teacher) => (
            <div 
              key={teacher.id} 
              className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <CardCornerDoodle type="teacher" />
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-lg border border-emerald-500/20 shrink-0">
                    {teacher.fullName.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base truncate">{teacher.fullName}</h3>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">{teacher.subject}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 py-3 border-t border-slate-100 dark:border-slate-700/60 text-xs">
                  <div className="text-right">
                    <p className="text-slate-400 dark:text-slate-500 dark:text-slate-400 mb-0.5">الطور</p>
                    <p className="font-semibold text-slate-700 dark:text-slate-200">
                      {teacher.phase === 'primary' ? 'ابتدائي' : teacher.phase === 'middle' ? 'متوسط' : 'ثانوي'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-400 dark:text-slate-500 dark:text-slate-400 mb-0.5">الهاتف</p>
                    <p className="font-semibold text-slate-700 dark:text-slate-200" dir="ltr">
                      {teacher.phone || "—"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Card Actions */}
              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center gap-2">
                <button
                  onClick={() => handleViewTeacherGroups(teacher.id)}
                  className="flex-1 py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 dark:text-emerald-300 text-xs font-bold transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                  أفواج الأستاذ
                </button>
                <button
                  onClick={() => handleDelete(teacher.id, teacher.fullName)}
                  disabled={deletingId === teacher.id}
                  className="py-2 px-3 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-900/20 transition-colors cursor-pointer border border-rose-100 dark:border-rose-900/30"
                >
                  {deletingId === teacher.id ? "جاري..." : "حذف"}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-16 text-center bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700/60 shadow-sm">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 mb-4">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">لا يوجد أساتذة مضافين بعد</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-5">أضف أساتذة مدرستك للبدء في إنشاء أفواجهم ومتابعة طلابهم ومداخيلهم.</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
            >
              إضافة أستاذ الآن
            </button>
          </div>
        )}
      </div>

      {/* Add Teacher Modal */}
      <AddTeacherModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}

