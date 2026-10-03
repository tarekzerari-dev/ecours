"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { SubtleBackground } from "@/components/subtle-background";
import { CardCornerDoodle } from "@/components/ui/card-corner-doodle";
import AddStudentPaymentModal from "@/components/add-student-payment-modal";
import { useAuth } from "@/lib/AdminContext";
import type { Student, StudentPayment } from "@/lib/types";
import { useGroups, useStudents, usePayments } from "@/lib/hooks/queries";
import { useAddPayment, useDeletePayment } from "@/lib/hooks/mutations";

export default function FinancesPage() {
  const { t, language } = useLanguage();
  const [filterGroup, setFilterGroup] = useState("all");
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const { isManager, selectedTeacherId, loggedTeacherId } = useAuth();

  const activeTeacherId = isManager ? selectedTeacherId : loggedTeacherId;

  const { data: groups = [], isLoading: loadingGroups } = useGroups(activeTeacherId || undefined);
  const { data: students = [], isLoading: loadingStudents } = useStudents();
  const { data: payments = [], isLoading: loadingPayments } = usePayments();

  const addPaymentMutation = useAddPayment();
  const deletePaymentMutation = useDeletePayment();

  const handleAddPayment = async (payment: StudentPayment) => {
    try {
      await addPaymentMutation.mutateAsync({ payment, receivedBy: loggedTeacherId || "admin" });
    } catch (e) {
      console.error(e);
      alert("حدث خطأ أثناء حفظ الدفعة");
    }
  };

  const handleDeletePayment = async (id: string) => {
    if (!confirm(t("deletePaymentConfirm") || "هل أنت متأكد من حذف الدفعة؟")) return;
    try {
      await deletePaymentMutation.mutateAsync(id);
    } catch (e) {
      console.error(e);
      alert("حدث خطأ أثناء حذف الدفعة");
    }
  };

  // Calculate debts
  const currentMonth = new Date().toISOString().slice(0, 7);
  const getStudentStatus = (student: Student) => {
    const group = groups.find(g => g.id === student.groupId);
    const monthlyPrice = group?.monthlyPrice || 0;
    const studentPayments = payments.filter(p => p.studentId === student.id && p.monthCovered === currentMonth);
    const totalPaid = studentPayments.reduce((s, p) => s + p.amount, 0);
    if (totalPaid >= monthlyPrice) return "paid";
    if (totalPaid > 0) return "partial";
    return "unpaid";
  };

  const filteredStudents = students.filter(s => filterGroup === "all" || s.groupId === filterGroup);
  const totalRevenue = payments.reduce((s, p) => s + p.amount, 0);
  const paidCount = filteredStudents.filter(s => getStudentStatus(s) === "paid").length;
  const unpaidCount = filteredStudents.filter(s => getStudentStatus(s) === "unpaid").length;

  if (loadingGroups || loadingStudents || loadingPayments) return null;

  return (
    <div className="relative min-h-[calc(100vh-8rem)]">
      <SubtleBackground variant="finance" />

      {/* Header */}
      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">{t("financesTitle")}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t("financesSubtitle")}</p>
        </div>
        <button
          onClick={() => setIsPaymentOpen(true)}
          disabled={students.length === 0}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-50"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          {t("recordPayment")}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-xl border border-slate-200/80 dark:border-slate-700/60 p-4 text-center">
          <p className="text-2xl font-extrabold text-emerald-600">{totalRevenue.toLocaleString()}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t("totalRevenue")} ({t("currencyDzd")})</p>
        </div>
        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-xl border border-slate-200/80 dark:border-slate-700/60 p-4 text-center">
          <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{students.length}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t("totalStudents")}</p>
        </div>
        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-xl border border-slate-200/80 dark:border-slate-700/60 p-4 text-center">
          <p className="text-2xl font-extrabold text-emerald-600">{paidCount}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t("paid")} ({t("thisMonth")})</p>
        </div>
        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-xl border border-slate-200/80 dark:border-slate-700/60 p-4 text-center">
          <p className="text-2xl font-extrabold text-rose-600">{unpaidCount}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t("unpaid")} ({t("thisMonth")})</p>
        </div>
      </div>

      {/* Filter */}
      <div className="relative z-10 mb-5">
        <select
          value={filterGroup}
          onChange={(e) => setFilterGroup(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 dark:text-slate-100 bg-white focus:border-emerald-500 outline-none"
        >
          <option value="all">{t("all")}</option>
          {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
      </div>

      {/* Students Payment Status */}
      {filteredStudents.length > 0 ? (
        <div className="relative z-10 mb-8">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">{t("financialSummary")} — {currentMonth}</h2>
          <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-sm overflow-hidden">
            <CardCornerDoodle type="coin" />
            <div className="overflow-x-auto">
              <table className={`w-full text-sm ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                <thead className="bg-slate-50 dark:bg-slate-700/60 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="px-5 py-3.5 font-medium">{t("studentName")}</th>
                    <th className="px-5 py-3.5 font-medium">{t("studentGroup")}</th>
                    <th className="px-5 py-3.5 font-medium">{t("totalDue")}</th>
                    <th className="px-5 py-3.5 font-medium">{t("totalPaid")}</th>
                    <th className="px-5 py-3.5 font-medium">{t("status")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map(student => {
                    const group = groups.find(g => g.id === student.groupId);
                    const monthlyPrice = group?.monthlyPrice || 0;
                    const studentPayments = payments.filter(p => p.studentId === student.id && p.monthCovered === currentMonth);
                    const totalPaid = studentPayments.reduce((s, p) => s + p.amount, 0);
                    const status = getStudentStatus(student);

                    return (
                      <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-5 py-3.5 font-medium text-slate-900 dark:text-slate-100">{student.fullName}</td>
                        <td className="px-5 py-3.5">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">{student.groupName}</span>
                        </td>
                        <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400 font-medium">{monthlyPrice.toLocaleString()} {t("currencyDzd")}</td>
                        <td className="px-5 py-3.5 font-bold text-emerald-600">{totalPaid.toLocaleString()} {t("currencyDzd")}</td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            status === 'paid' ? 'bg-emerald-100 text-emerald-800' :
                            status === 'partial' ? 'bg-amber-100 text-amber-800' :
                            'bg-rose-100 text-rose-800'
                          }`}>
                            {status === 'paid' ? '✅ ' + t("paid") : status === 'partial' ? '🟡 ' + t("partial") : '❌ ' + t("unpaid")}
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
      ) : (
        <div className="relative z-10 bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 p-8 text-center shadow-sm">
          <CardCornerDoodle type="coin" />
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-100/80 mb-4 text-slate-400">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">{t("noPaymentsYet")}</h3>
            <p className="text-slate-500 dark:text-slate-400">{t("startByCreatingGroup")}</p>
          </div>
        </div>
      )}

      {/* Recent Payments */}
      {payments.length > 0 && (
        <div className="relative z-10">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">{t("recentActivity")}</h2>
          <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className={`w-full text-sm ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="px-5 py-3.5 font-medium">{t("paymentDate")}</th>
                    <th className="px-5 py-3.5 font-medium">{t("studentName")}</th>
                    <th className="px-5 py-3.5 font-medium">{t("amount")}</th>
                    <th className="px-5 py-3.5 font-medium">{t("monthCovered")}</th>
                    <th className="px-5 py-3.5 font-medium">{t("paymentMethod")}</th>
                    <th className="px-5 py-3.5 font-medium">{t("actions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments.slice(0, 20).map(payment => (
                    <tr key={payment.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400" dir="ltr">{payment.paymentDate}</td>
                      <td className="px-5 py-3.5 font-medium text-slate-900 dark:text-slate-100">{payment.studentName}</td>
                      <td className="px-5 py-3.5 font-bold text-emerald-600">+{payment.amount.toLocaleString()} {t("currencyDzd")}</td>
                      <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400" dir="ltr">{payment.monthCovered}</td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:text-slate-300">
                          {payment.method === 'cash' ? t("cash") : t("bankTransfer")}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => handleDeletePayment(payment.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      <AddStudentPaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        onAddPayment={handleAddPayment}
        students={students}
        groups={groups}
      />
    </div>
  );
}
