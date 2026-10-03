"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import AddStudentModal from "@/components/add-student-modal";
import QrDisplayModal from "@/components/qr-display-modal";
import { SubtleBackground } from "@/components/subtle-background";
import { CardCornerDoodle } from "@/components/ui/card-corner-doodle";
import type { Student } from "@/lib/types";
import { useGroup, useStudents, useSessions, usePayments } from "@/lib/hooks/queries";
import { useAddStudent, useDeleteStudent } from "@/lib/hooks/mutations";

export default function GroupDetailPage() {
  const params = useParams();
  const groupId = params.id as string;
  const { t, language } = useLanguage();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [qrStudent, setQrStudent] = useState<Student | null>(null);

  const { data: group, isLoading: loadingGroup } = useGroup(groupId);
  const { data: students = [], isLoading: loadingStudents } = useStudents(groupId);
  const { data: sessions = [], isLoading: loadingSessions } = useSessions(groupId);
  const { data: payments = [], isLoading: loadingPayments } = usePayments(groupId);

  const addStudentMutation = useAddStudent();
  const deleteStudentMutation = useDeleteStudent();

  const sessionsCount = sessions.length;
  const totalPaid = payments.reduce((s, p) => s + p.amount, 0);

  const handleAddStudent = async (student: Student) => {
    try {
      await addStudentMutation.mutateAsync({ student, groupId });
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

  const handlePrintAllQrs = async () => {
    if (students.length === 0 || !group) return;

    try {
      // Import dynamically to avoid SSR issues or just rely on the static import if added
      const QRCode = (await import('qrcode')).default;
      
      const win = window.open("", "_blank");
      if (!win) {
        alert("Please allow popups to print QR codes");
        return;
      }

      // Generate HTML for all students
      let htmlContent = `
        <html>
          <head>
            <title>QR Codes - ${group.name}</title>
            <style>
              body { font-family: system-ui, sans-serif; margin: 0; padding: 20px; }
              .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 20px; }
              .card { text-align: center; padding: 15px; border: 2px dashed #cbd5e1; border-radius: 12px; page-break-inside: avoid; }
              h3 { font-size: 16px; margin: 0 0 5px 0; color: #0f172a; }
              p { font-size: 12px; margin: 0 0 10px 0; color: #64748b; }
              img { max-width: 100%; height: auto; margin-bottom: 5px; }
              @media print {
                @page { margin: 1cm; }
                body { padding: 0; }
                .card { border-color: #000; }
              }
            </style>
          </head>
          <body>
            <h1 style="text-align: center; margin-bottom: 30px;">${group.name} - رموز QR للطلاب</h1>
            <div class="grid">
      `;

      for (const student of students) {
        if (student.qrCode) {
          const dataUrl = await QRCode.toDataURL(student.qrCode, {
            width: 200,
            margin: 2,
            color: { dark: "#000000", light: "#ffffff" },
          });
          htmlContent += `
            <div class="card">
              <h3>${student.fullName}</h3>
              <p>${group.name}</p>
              <img src="${dataUrl}" alt="QR Code for ${student.fullName}" />
              <div style="font-size: 10px; color: #94a3b8;">eCours — Smart Attendance</div>
            </div>
          `;
        }
      }

      htmlContent += `
            </div>
          </body>
        </html>
      `;

      win.document.write(htmlContent);
      win.document.close();
      
      // Wait for images to load before printing
      setTimeout(() => {
        win.print();
      }, 500);

    } catch (error) {
      console.error("Failed to generate QR codes for printing:", error);
      alert("حدث خطأ أثناء تحضير رموز QR للطباعة");
    }
  };

  if (loadingGroup || loadingStudents || loadingSessions || loadingPayments) return null;
  if (!group) {
    return (
      <div className="relative min-h-[calc(100vh-8rem)] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">{t("error")}</h2>
          <Link href="/groups" className="text-emerald-600 hover:text-emerald-700 font-medium">{t("back")}</Link>
        </div>
      </div>
    );
  }


  return (
    <div className="relative min-h-[calc(100vh-8rem)]">
      <SubtleBackground variant="groups" />

      {/* Back + Header */}
      <div className="relative z-10 mb-6">
        <Link href="/groups" className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-emerald-600 transition-colors mb-4">
          <svg className={`w-4 h-4 ${language === 'ar' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          {t("back")}
        </Link>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">{group.level}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">{group.name}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {t("monthlyPrice")}: <span className="font-bold text-emerald-600">{group.monthlyPrice.toLocaleString()} {t("currencyDzd")}</span>
              {" • "}
              {t("sessionPrice")}: <span className="font-bold">{group.sessionPrice.toLocaleString()} {t("currencyDzd")}</span>
            </p>
          </div>

          <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={handlePrintAllQrs}
              disabled={students.length === 0}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 dark:text-slate-300 hover:bg-slate-50 text-sm font-semibold transition-all cursor-pointer disabled:opacity-50"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18.75 12h.008v.008h-.008V12Zm-2.25 0h.008v.008H16.5V12Z" />
              </svg>
              طباعة رموز QR
            </button>
            <button
              onClick={() => setIsAddOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm transition-all cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              {t("addStudentToGroup")}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: t("studentsCount"), value: students.length, color: "emerald" },
          { label: t("attendance"), value: sessionsCount, color: "teal" },
          { label: t("totalPaid"), value: `${totalPaid.toLocaleString()} ${t("currencyDzd")}`, color: "emerald" },
          { label: t("studentsOwing"), value: students.filter(s => s.totalAbsences >= 3).length, color: "rose" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white/90 backdrop-blur-md rounded-xl border border-slate-200/80 p-4 text-center">
            <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{stat.value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Students List */}
      <div className="relative z-10">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">{t("groupStudents")}</h2>

        {students.length > 0 ? (
          <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className={`w-full text-sm ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="px-5 py-3.5 font-medium">{t("studentName")}</th>
                    <th className="px-5 py-3.5 font-medium">{t("parentPhone")}</th>
                    <th className="px-5 py-3.5 font-medium">{t("presences")}</th>
                    <th className="px-5 py-3.5 font-medium">{t("absences")}</th>
                    <th className="px-5 py-3.5 font-medium">{t("actions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-slate-900 dark:text-slate-100">{student.fullName}</td>
                      <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400" dir="ltr">{student.parentPhone || "—"}</td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">{student.totalPresences}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${student.totalAbsences >= 3 ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700 dark:text-slate-300'}`}>{student.totalAbsences}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setQrStudent(student)}
                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                            title={t("showQr")}
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5Z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(student.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title={t("deleteStudent")}
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 p-8 sm:p-12 text-center shadow-sm">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-100/80 mb-4 text-slate-400">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">{t("noStudentsTitle")}</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm mx-auto">{t("noStudentsDesc")}</p>
            <button
              onClick={() => setIsAddOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm transition-all cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              {t("addStudentToGroup")}
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      <AddStudentModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAddStudent={handleAddStudent}
        groups={group ? [group] : []}
        preselectedGroupId={groupId}
      />

      {qrStudent && (
        <QrDisplayModal
          isOpen={!!qrStudent}
          onClose={() => setQrStudent(null)}
          studentName={qrStudent.fullName}
          qrCode={qrStudent.qrCode}
          groupName={group.name}
        />
      )}
    </div>
  );
}
