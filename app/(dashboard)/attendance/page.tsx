"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { SubtleBackground } from "@/components/subtle-background";
import { useAuth } from "@/lib/AdminContext";
import SessionQrModal from "@/components/session-qr-modal";
import type { Session, AttendanceRecord } from "@/lib/types";
import { useGroups, useStudents, useSessions, useAttendance } from "@/lib/hooks/queries";
import { useAddSession, useRecordAttendance } from "@/lib/hooks/mutations";

export default function AttendancePage() {
  const { t, language } = useLanguage();
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const { isManager, selectedTeacherId, loggedTeacherId } = useAuth();

  const activeTeacherId = isManager ? selectedTeacherId : loggedTeacherId;

  const { data: groups = [], isLoading: loadingGroups } = useGroups(activeTeacherId || undefined);
  const { data: students = [], isLoading: loadingStudents } = useStudents(selectedGroupId || undefined);
  const { data: sessions = [], isLoading: loadingSessions } = useSessions(selectedGroupId || undefined);
  const { data: serverRecords = [] } = useAttendance(activeSession?.id || "", activeSession ? 3000 : false);
  
  const pastSessions = sessions.slice(0, 10);

  const addSessionMutation = useAddSession();
  const recordAttendanceMutation = useRecordAttendance();

  useEffect(() => {
    if (serverRecords && serverRecords.length > 0) {
      setRecords(prev => {
        const newRecords = [...prev];
        let changed = false;
        serverRecords.forEach(sr => {
          const existing = newRecords.find(r => r.studentId === sr.studentId);
          if (!existing) {
            newRecords.push(sr);
            changed = true;
          }
        });
        return changed ? newRecords : prev;
      });
    }
  }, [serverRecords]);

  useEffect(() => {
    if (selectedGroupId) {
      setActiveSession(null);
      setRecords([]);
    }
  }, [selectedGroupId]);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleStartSession = async () => {
    if (!selectedGroupId) return;
    const group = groups.find(g => g.id === selectedGroupId);
    const session: Partial<Session> = {
      groupId: selectedGroupId,
      groupName: group?.name || "",
      date: new Date().toISOString().split("T")[0],
      startedAt: new Date().toISOString(),
    };
    try {
      const newSession = await addSessionMutation.mutateAsync({ session, registeredBy: loggedTeacherId || "admin" });
      setActiveSession(newSession);
      setRecords([]);
    } catch (err) {
      console.error(err);
      showToast("حدث خطأ أثناء بدء الجلسة", "error");
    }
  };

  const [savingSession, setSavingSession] = useState(false);

  const handleEndSession = async () => {
    if (!activeSession) return;
    setSavingSession(true);
    
    // Construct all records, defaulting unmarked to absent
    const finalRecords: Partial<AttendanceRecord>[] = students.map(s => {
      const existing = records.find(r => r.studentId === s.id);
      return {
        sessionId: activeSession.id,
        studentId: s.id,
        status: existing ? existing.status : 'absent'
      };
    });

    try {
      await recordAttendanceMutation.mutateAsync({ records: finalRecords, registeredBy: loggedTeacherId || "admin" });
      setActiveSession(null);
      showToast(t("attendanceRecorded"));
    } catch (err) {
      console.error(err);
      showToast("حدث خطأ أثناء حفظ الغيابات", "error");
    } finally {
      setSavingSession(false);
    }
  };

  const markStudent = (studentId: string, studentName: string, status: AttendanceRecord['status']) => {
    if (!activeSession) return;
    setRecords(prev => {
      const existing = prev.find(r => r.studentId === studentId);
      if (existing) {
        return prev.map(r => r.studentId === studentId ? { ...r, status } : r);
      }
      return [...prev, {
        id: "att_" + Date.now(),
        sessionId: activeSession.id,
        studentId,
        studentName,
        status,
        scannedAt: new Date().toISOString()
      }];
    });
    showToast(`تم التسجيل: ${studentName}`);
  };

  if (loadingGroups || loadingStudents) return null;

  return (
    <div className="relative min-h-[calc(100vh-8rem)]">
      <SubtleBackground variant="default" />

      {/* Toast */}
      {toast && (
        <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'} animate-in fade-in slide-in-from-top-2`}>
          {toast.text}
        </div>
      )}

      {/* Header */}
      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">{t("attendanceTitle")}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t("attendanceSubtitle")}</p>
        </div>
      </div>

      {/* Group Selector */}
      <div className="relative z-10 mb-6">
        <select
          value={selectedGroupId}
          onChange={(e) => setSelectedGroupId(e.target.value)}
          className="w-full sm:w-80 px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 dark:text-slate-100 bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
        >
          <option value="">{t("selectGroupFirst")}</option>
          {groups.map(g => (
            <option key={g.id} value={g.id}>{g.name} — {g.level}</option>
          ))}
        </select>
      </div>

      {selectedGroupId && (
        <>
          {/* Session Controls */}
          <div className="relative z-10 flex flex-wrap items-center gap-3 mb-6">
            {!activeSession ? (
              <button
                onClick={handleStartSession}
                disabled={students.length === 0}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
                </svg>
                {t("startSession")}
              </button>
            ) : (
              <>
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200/60">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-sm font-medium text-emerald-700">{t("sessionActive")}</span>
                  <span className="text-xs text-emerald-600 font-mono">
                    {records.filter(r => r.status === 'present' || r.status === 'late').length}/{students.length}
                  </span>
                </div>
                <button
                  onClick={() => setScannerOpen(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold shadow-sm transition-all cursor-pointer"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5Z" />
                  </svg>
                  عرض رمز الجلسة (QR)
                </button>
                <button
                  onClick={handleEndSession}
                  disabled={savingSession}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 7.5A2.25 2.25 0 0 1 7.5 5.25h9a2.25 2.25 0 0 1 2.25 2.25v9a2.25 2.25 0 0 1-2.25 2.25h-9a2.25 2.25 0 0 1-2.25-2.25v-9Z" />
                  </svg>
                  {savingSession ? t("loading") : t("endSession")}
                </button>
              </>
            )}
          </div>

          {/* Students Attendance Grid */}
          {activeSession && (
            <div className="relative z-10 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-sm overflow-hidden mb-8">
              <div className="overflow-x-auto">
                <table className={`w-full text-sm ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                  <thead className="bg-slate-50 dark:bg-slate-700/60 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                    <tr>
                      <th className="px-5 py-3.5 font-medium">{t("studentName")}</th>
                      <th className="px-5 py-3.5 font-medium">{t("status")}</th>
                      <th className="px-5 py-3.5 font-medium">{t("actions")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {students.map(student => {
                      const record = records.find(r => r.studentId === student.id);
                      return (
                        <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-5 py-3.5 font-medium text-slate-900 dark:text-slate-100">{student.fullName}</td>
                          <td className="px-5 py-3.5">
                            {record ? (
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                record.status === 'present' ? 'bg-emerald-100 text-emerald-800' :
                                record.status === 'late' ? 'bg-amber-100 text-amber-800' :
                                'bg-rose-100 text-rose-800'
                              }`}>
                                {t(record.status)}
                              </span>
                            ) : (
                              <span className="text-slate-400 text-xs">—</span>
                            )}
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => markStudent(student.id, student.fullName, "present")}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${record?.status === 'present' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}
                              >
                                {t("markPresent")}
                              </button>
                              <button
                                onClick={() => markStudent(student.id, student.fullName, "absent")}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${record?.status === 'absent' ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-700 hover:bg-rose-100'}`}
                              >
                                {t("markAbsent")}
                              </button>
                              <button
                                onClick={() => markStudent(student.id, student.fullName, "late")}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${record?.status === 'late' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'}`}
                              >
                                {t("markLate")}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Past Sessions */}
          {pastSessions.length > 0 && !activeSession && (
            <div className="relative z-10">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">{t("attendanceHistory")}</h2>
              <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className={`w-full text-sm ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 dark:text-slate-400">
                      <tr>
                        <th className="px-5 py-3.5 font-medium">{t("sessionDate")}</th>
                        <th className="px-5 py-3.5 font-medium">{t("presences")}</th>
                        <th className="px-5 py-3.5 font-medium">{t("absences")}</th>
                        <th className="px-5 py-3.5 font-medium">{t("status")}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {pastSessions.map(session => {
                        return (
                          <tr key={session.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="px-5 py-3.5 text-slate-900 dark:text-slate-100 font-medium" dir="ltr">{session.date}</td>
                            <td className="px-5 py-3.5">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">{session.presentCount}</span>
                            </td>
                            <td className="px-5 py-3.5">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800">{session.absentCount}</span>
                            </td>
                            <td className="px-5 py-3.5">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:text-slate-300`}>
                                {t("sessionEnded")}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Empty state when no students in group */}
          {students.length === 0 && (
            <div className="relative z-10 bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 p-8 text-center shadow-sm">
              <p className="text-slate-500 dark:text-slate-400">{t("noStudentsTitle")}</p>
            </div>
          )}
        </>
      )}

      {/* QR Code Modal */}
      <SessionQrModal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        sessionId={activeSession?.id || ""}
        groupName={activeSession?.groupName || ""}
      />
    </div>
  );
}
