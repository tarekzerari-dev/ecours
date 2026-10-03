"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { SubtleBackground } from "@/components/subtle-background";
import { CardCornerDoodle } from "@/components/ui/card-corner-doodle";
import { notificationsStore } from "@/lib/store";
import { useAuth } from "@/lib/AdminContext";
import type { Student, ParentNotification } from "@/lib/types";
import { useStudents } from "@/lib/hooks/queries";

export default function NotificationsPage() {
  const { t, language } = useLanguage();
  const [history, setHistory] = useState<ParentNotification[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { isManager, selectedTeacherId, loggedTeacherId } = useAuth();

  const activeTeacherId = isManager ? selectedTeacherId : loggedTeacherId;

  const { data: allStudents = [], isLoading } = useStudents(undefined);

  const studentsWithAbsences = allStudents.filter(s => s.totalAbsences >= 3);

  useEffect(() => {
    if (!isLoading) {
      setHistory(notificationsStore.getAll().filter(n => {
        const student = allStudents.find(s => s.id === n.studentId);
        return student !== undefined;
      }));
    }
  }, [allStudents, isLoading]);

  const buildMessage = (student: Student): string => {
    return t("parentAlertMessage")
      .replace("{name}", student.fullName)
      .replace("{count}", String(student.totalAbsences));
  };

  const handleSendWhatsApp = (student: Student) => {
    const message = buildMessage(student);
    const phone = student.parentPhone.replace(/^0/, "213");
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");

    const notification: ParentNotification = {
      id: "notif_" + Date.now(),
      studentId: student.id,
      studentName: student.fullName,
      parentPhone: student.parentPhone,
      absenceCount: student.totalAbsences,
      message,
      sentAt: new Date().toISOString(),
      sentVia: "whatsapp",
    };
    notificationsStore.add(notification);
    setHistory(notificationsStore.getAll());
  };

  const handleCopyMessage = (student: Student) => {
    const message = buildMessage(student);
    navigator.clipboard.writeText(message).then(() => {
      setCopiedId(student.id);
      setTimeout(() => setCopiedId(null), 2000);

      const notification: ParentNotification = {
        id: "notif_" + Date.now(),
        studentId: student.id,
        studentName: student.fullName,
        parentPhone: student.parentPhone,
        absenceCount: student.totalAbsences,
        message,
        sentAt: new Date().toISOString(),
        sentVia: "copied",
      };
      notificationsStore.add(notification);
      setHistory(notificationsStore.getAll());
    });
  };

  if (isLoading) return null;

  return (
    <div className="relative min-h-[calc(100vh-8rem)]">
      <SubtleBackground variant="default" />

      {/* Header */}
      <div className="relative z-10 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">{t("notificationsTitle")}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t("notificationsSubtitle")}</p>
      </div>

      {/* Alert Banner */}
      {studentsWithAbsences.length > 0 && (
        <div className="relative z-10 mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200/60 flex items-start gap-3">
          <svg className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-amber-800">
              {t("absenceAlert")}: {studentsWithAbsences.length} {t("students")}
            </p>
            <p className="text-xs text-amber-700 mt-0.5">{t("notificationsSubtitle")}</p>
          </div>
        </div>
      )}

      {/* Students exceeding 3 absences */}
      {studentsWithAbsences.length > 0 ? (
        <div className="relative z-10 space-y-4 mb-8">
          {studentsWithAbsences.map(student => (
            <div
              key={student.id}
              className="bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-rose-100 text-rose-700 font-bold text-lg shrink-0">
                  {student.totalAbsences}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{student.fullName}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {student.groupName} • {t("parentPhone")}: <span dir="ltr">{student.parentPhone || "—"}</span>
                  </p>
                  <p className="text-xs text-rose-600 mt-1 font-medium">
                    {student.totalAbsences} {t("absences")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {student.parentPhone && (
                  <button
                    onClick={() => handleSendWhatsApp(student)}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-semibold transition-all cursor-pointer"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                    </svg>
                    {t("sendViaWhatsapp")}
                  </button>
                )}
                <button
                  onClick={() => handleCopyMessage(student)}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 transition-all cursor-pointer"
                >
                  {copiedId === student.id ? (
                    <>
                      <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                      </svg>
                      {t("messageCopied")}
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
                      </svg>
                      {t("copyMessage")}
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="relative z-10 bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 p-8 sm:p-12 text-center shadow-sm mb-8">
          <CardCornerDoodle type="bell" />
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200/60 mb-4 text-emerald-600">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">{t("noAlertsNeeded")}</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">{t("noAlertsDesc")}</p>
          </div>
        </div>
      )}

      {/* Alert History */}
      {history.length > 0 && (
        <div className="relative z-10">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">{t("alertHistory")}</h2>
          <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className={`w-full text-sm ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="px-5 py-3.5 font-medium">{t("studentName")}</th>
                    <th className="px-5 py-3.5 font-medium">{t("absences")}</th>
                    <th className="px-5 py-3.5 font-medium">{t("parentPhone")}</th>
                    <th className="px-5 py-3.5 font-medium">{t("paymentDate")}</th>
                    <th className="px-5 py-3.5 font-medium">{t("paymentMethod")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {history.map(notif => (
                    <tr key={notif.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-slate-900 dark:text-slate-100">{notif.studentName}</td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800">{notif.absenceCount}</span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400" dir="ltr">{notif.parentPhone}</td>
                      <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400" dir="ltr">{new Date(notif.sentAt).toLocaleString()}</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${notif.sentVia === 'whatsapp' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-700 dark:text-slate-300'}`}>
                          {notif.sentVia === 'whatsapp' ? 'WhatsApp' : t("copyMessage")}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
