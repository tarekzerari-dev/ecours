"use client";

import { useState, useMemo } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useAuth } from "@/lib/AdminContext";
import { SubtleBackground } from "@/components/subtle-background";
import { CardCornerDoodle, DoodleIconType } from "@/components/ui/card-corner-doodle";
import Link from "next/link";
import { useGroups, useStudents, useSessions, usePayments } from "@/lib/hooks/queries";

export default function DashboardPage() {
  const { t, language } = useLanguage();
  const { isManager, selectedTeacherId, loggedTeacherId } = useAuth();

  const activeTeacherId = isManager ? selectedTeacherId : loggedTeacherId;

  const { data: groups = [], isLoading: loadingGroups } = useGroups(activeTeacherId || undefined);
  const { data: students = [], isLoading: loadingStudents } = useStudents();
  const { data: sessions = [], isLoading: loadingSessions } = useSessions();
  const { data: payments = [], isLoading: loadingPayments } = usePayments();

  const stats = useMemo(() => {
    const totalPresent = sessions.reduce((sum, s) => sum + s.presentCount, 0);
    const totalAbsent = sessions.reduce((sum, s) => sum + s.absentCount, 0);
    const totalRecords = totalPresent + totalAbsent;
    const attendanceRate = totalRecords > 0 ? Math.round((totalPresent / totalRecords) * 100) : 0;

    const currentMonth = new Date().toISOString().slice(0, 7);
    const unpaidStudents = students.filter(s => {
      const group = groups.find(g => g.id === s.groupId);
      const monthlyPrice = group?.monthlyPrice || 0;
      const studentPayments = payments.filter(p => p.studentId === s.id && p.monthCovered === currentMonth);
      const totalPaid = studentPayments.reduce((sum, p) => sum + p.amount, 0);
      return totalPaid < monthlyPrice;
    });

    return {
      totalGroups: groups.length,
      totalStudents: students.length,
      attendanceRate,
      pendingPayments: unpaidStudents.length,
      totalRevenue: payments.reduce((s, p) => s + p.amount, 0),
      totalAbsences: students.filter(s => s.totalAbsences >= 3).length,
    };
  }, [groups, students, sessions, payments]);

  const recentSessions = [...sessions].sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()).slice(0, 5);
  const recentPayments = [...payments].sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()).slice(0, 5);

  if (loadingGroups || loadingStudents || loadingSessions || loadingPayments) return null;

  const statCards = [
    { label: t("totalGroups"), value: stats.totalGroups, doodle: "group" as DoodleIconType, color: "emerald", href: "/groups" },
    { label: t("totalStudents"), value: stats.totalStudents, doodle: "cap" as DoodleIconType, color: "teal", href: "/students" },
    { label: t("attendanceRate"), value: stats.attendanceRate > 0 ? `${stats.attendanceRate}%` : "—", doodle: "spark" as DoodleIconType, color: "emerald", href: "/attendance" },
    { label: t("studentsToPay"), value: stats.pendingPayments, doodle: "coin" as DoodleIconType, color: "rose", href: "/finances" },
  ];

  const hasData = stats.totalGroups > 0;

  return (
    <div className="relative min-h-[calc(100vh-8rem)]">
      <SubtleBackground variant="default" />

      {/* Page Header */}
      <div className="relative z-10 mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t("dashboardTitle")}</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">{t("dashboardSubtitle")}</p>
      </div>

      {/* Stats Cards */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <div className="relative bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 hover:shadow-lg transition-all duration-200 overflow-hidden cursor-pointer">
              <CardCornerDoodle type={stat.doodle} />
              <div className="pt-8">
                <p className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">{stat.value}</p>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-2">{stat.label}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {hasData ? (
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Attendance Overview */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm overflow-hidden">
            <CardCornerDoodle type="spark" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">{t("attendanceRate")}</h2>
            
            <div className="flex items-center justify-center mb-4">
              {/* Simple circular chart */}
              <div className="relative w-32 h-32">
                <svg className="w-32 h-32 -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#059669"
                    strokeWidth="3"
                    strokeDasharray={`${stats.attendanceRate}, 100`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-extrabold text-emerald-600">
                    {stats.attendanceRate > 0 ? `${stats.attendanceRate}%` : "—"}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-emerald-50/80 dark:bg-emerald-900/20">
                <p className="text-lg font-bold text-emerald-600">{stats.totalStudents}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{t("totalStudents")}</p>
              </div>
              <div className="p-3 rounded-xl bg-amber-50/80 dark:bg-amber-900/20">
                <p className="text-lg font-bold text-amber-600">{stats.totalAbsences}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{t("notifications")}</p>
              </div>
              <div className="p-3 rounded-xl bg-rose-50/80 dark:bg-rose-900/20">
                <p className="text-lg font-bold text-rose-600">{stats.pendingPayments}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{t("studentsToPay")}</p>
              </div>
            </div>
          </div>

          {/* Financial Overview */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm overflow-hidden">
            <CardCornerDoodle type="coin" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">{t("financialSummary")}</h2>

            <div className="mb-4 p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/20 border border-emerald-200/60 dark:border-emerald-700/40">
              <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium mb-1">{t("totalRevenue")}</p>
              <p className="text-3xl font-extrabold text-emerald-700 dark:text-emerald-400">
                {stats.totalRevenue.toLocaleString()} <span className="text-lg font-normal">{t("currencyDzd")}</span>
              </p>
            </div>

            {/* Recent payments */}
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">{t("recentActivity")}</h3>
            {recentPayments.length > 0 ? (
              <div className="space-y-2">
                {recentPayments.map((p: any) => (
                  <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50/80 dark:bg-slate-700/50 hover:bg-slate-100/80 dark:hover:bg-slate-700 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{p.studentName}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{p.groupName} • {p.paymentDate}</p>
                    </div>
                    <span className="text-sm font-bold text-emerald-600">+{p.amount.toLocaleString()} {t("currencyDzd")}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400 text-center py-4">{t("noRecentActivity")}</p>
            )}
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="relative z-10 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 sm:p-12 text-center shadow-sm overflow-hidden group">
          <CardCornerDoodle type="spark" />
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 mb-5 p-4 text-slate-400 group-hover:text-slate-500 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-600 transition-all duration-200">
              <svg className="w-10 h-10 stroke-[1.4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5m.75-9 3-3 2.148 2.148A12.061 12.061 0 0 1 16.5 7.605" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
              {t("dashboardEmptyTitle")}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
              {t("dashboardEmptyDesc")}
            </p>
            <Link
              href="/groups"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm transition-all"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              {t("startByCreatingGroup")}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
