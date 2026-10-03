"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { SubtleBackground } from "@/components/subtle-background";
import { CardCornerDoodle } from "@/components/ui/card-corner-doodle";
import AddStudentModal from "@/components/add-student-modal";
import QrDisplayModal from "@/components/qr-display-modal";
import { useAuth } from "@/lib/AdminContext";
import type { Student } from "@/lib/types";
import { useGroups, useStudents } from "@/lib/hooks/queries";
import { useAddStudent, useDeleteStudent } from "@/lib/hooks/mutations";

export default function StudentsPage() {
  const { t, language } = useLanguage();
  const [search, setSearch] = useState("");
  const [filterGroup, setFilterGroup] = useState("all");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [qrStudent, setQrStudent] = useState<Student | null>(null);
  const { isManager, selectedTeacherId, loggedTeacherId } = useAuth();

  const activeTeacherId = isManager ? selectedTeacherId : loggedTeacherId;

  const { data: groups = [], isLoading: loadingGroups } = useGroups(activeTeacherId || undefined);
  const { data: students = [], isLoading: loadingStudents } = useStudents();
  
  const addStudentMutation = useAddStudent();
  const deleteStudentMutation = useDeleteStudent();

  const handleAddStudent = async (student: Student) => {
    try {
      await addStudentMutation.mutateAsync({ student, groupId: student.groupId });
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء إضافة الطالب");
    }
  };

  const handleDeleteStudent = async (id: string) => {
    if (!confirm(t("deleteStudentConfirm"))) return;
    try {
      await deleteStudentMutation.mutateAsync(id);
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء حذف الطالب");
    }
  };

  if (loadingGroups || loadingStudents) return null;

  const filtered = students.filter((s) => {
    const matchSearch = s.fullName.toLowerCase().includes(search.toLowerCase());
    const matchGroup = filterGroup === "all" || s.groupId === filterGroup;
    return matchSearch && matchGroup;
  });

  return (
    <div className="relative min-h-[calc(100vh-8rem)]">
      <SubtleBackground variant="students" />

      {/* Header */}
      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">{t("studentsTitle")}</h1>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1">{t("studentsSubtitle")}</p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm transition-all cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          {t("addStudent")}
        </button>
      </div>

      {students.length > 0 ? (
        <>
          {/* Search & Filter */}
          <div className="relative z-10 flex flex-col sm:flex-row gap-3 mb-5">
            <div className="relative flex-1">
              <svg className={`absolute ${language === 'ar' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("searchPlaceholder")}
                className={`w-full ${language === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all`}
              />
            </div>
            <select
              value={filterGroup}
              onChange={(e) => setFilterGroup(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 dark:text-slate-100 bg-white focus:border-emerald-500 outline-none"
            >
              <option value="all">{t("all")}</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>

          {/* Table */}
          <div className="relative z-10 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-sm overflow-hidden">
            <CardCornerDoodle type="cap" />
            <div className="overflow-x-auto">
              <table className={`w-full text-sm ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                <thead className="bg-slate-50 dark:bg-slate-700/60 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="px-5 py-3.5 font-medium">{t("studentName")}</th>
                    <th className="px-5 py-3.5 font-medium">{t("studentGroup")}</th>
                    <th className="px-5 py-3.5 font-medium">{t("parentPhone")}</th>
                    <th className="px-5 py-3.5 font-medium">{t("presences")}</th>
                    <th className="px-5 py-3.5 font-medium">{t("absences")}</th>
                    <th className="px-5 py-3.5 font-medium">{t("actions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center text-slate-500 dark:text-slate-400">{t("noResults")}</td>
                    </tr>
                  ) : (
                    filtered.map((student) => (
                      <tr key={student.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/40 transition-colors">
                        <td className="px-5 py-3.5 font-medium text-slate-900 dark:text-slate-100">{student.fullName}</td>
                        <td className="px-5 py-3.5">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                            {student.groupName}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400" dir="ltr">{student.parentPhone || "—"}</td>
                        <td className="px-5 py-3.5">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">{student.totalPresences}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${student.totalAbsences >= 3 ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700 dark:text-slate-300'}`}>
                            {student.totalAbsences}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => setQrStudent(student)} className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer" title={t("showQr")}>
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5Z" />
                              </svg>
                            </button>
                            <button onClick={() => handleDeleteStudent(student.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer" title={t("deleteStudent")}>
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="relative z-10 bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 p-6 sm:p-12 text-center shadow-sm overflow-hidden group">
          <CardCornerDoodle type="cap" />
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-slate-100/80 border border-slate-200/80 mb-5 p-4 text-slate-400">
              <svg className="w-10 h-10 stroke-[1.4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18c-2.305 0-4.408.867-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">{t("noStudentsTitle")}</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">{t("noStudentsDesc")}</p>
            <button
              onClick={() => setIsAddOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm transition-all cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              {t("addStudent")}
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <AddStudentModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAddStudent={handleAddStudent}
        groups={groups}
      />
      {qrStudent && (
        <QrDisplayModal
          isOpen={!!qrStudent}
          onClose={() => setQrStudent(null)}
          studentName={qrStudent.fullName}
          qrCode={qrStudent.qrCode}
          groupName={qrStudent.groupName}
        />
      )}
    </div>
  );
}
