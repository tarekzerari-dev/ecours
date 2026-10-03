"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { Student, StudentPayment, Group } from "@/lib/types";

interface AddStudentPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPayment: (payment: StudentPayment) => Promise<void> | void;
  students: Student[];
  groups: Group[];
  preselectedStudentId?: string;
}

export default function AddStudentPaymentModal({
  isOpen,
  onClose,
  onAddPayment,
  students,
  groups,
  preselectedStudentId,
}: AddStudentPaymentModalProps) {
  const [studentId, setStudentId] = useState(preselectedStudentId || "");
  const [amount, setAmount] = useState(2500);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);
  const [monthCovered, setMonthCovered] = useState(new Date().toISOString().slice(0, 7));
  const [method, setMethod] = useState<"cash" | "ccp">("cash");
  const [loading, setLoading] = useState(false);

  const { t, language } = useLanguage();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId) return;

    setLoading(true);
    const student = students.find(s => s.id === studentId);
    const group = groups.find(g => g.id === student?.groupId);

    const payment: StudentPayment = {
      id: "pay_" + Date.now(),
      studentId,
      studentName: student?.fullName || "",
      groupId: student?.groupId || "",
      groupName: group?.name || "",
      amount: Number(amount),
      monthCovered,
      paymentDate,
      method,
    };

    try {
      await onAddPayment(payment);
      onClose();
      // Reset
      if (!preselectedStudentId) setStudentId("");
      setAmount(2500);
      setPaymentDate(new Date().toISOString().split("T")[0]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-100">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{t("recordNewPayment")}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t("financesSubtitle")}</p>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:text-slate-400 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Student Selection */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              {t("studentName")} <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              disabled={!!preselectedStudentId}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-slate-900 dark:text-slate-100 text-sm transition-all bg-white disabled:bg-slate-50"
            >
              <option value="">{t("studentName")}...</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.fullName} — {s.groupName}
                </option>
              ))}
            </select>
          </div>

          {/* Amount & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {t("paymentAmount")} ({t("currencyDzd")})
              </label>
              <input
                type="number"
                min="0"
                step="100"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-slate-900 dark:text-slate-100 text-sm transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {t("paymentDate")}
              </label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-slate-900 dark:text-slate-100 text-sm transition-all"
              />
            </div>
          </div>

          {/* Month Covered & Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {t("monthCovered")}
              </label>
              <input
                type="month"
                value={monthCovered}
                onChange={(e) => setMonthCovered(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-slate-900 dark:text-slate-100 text-sm transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {t("paymentMethod")}
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as "cash" | "ccp")}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-slate-900 dark:text-slate-100 text-sm transition-all bg-white"
              >
                <option value="cash">{t("cash")}</option>
                <option value="ccp">{t("bankTransfer")}</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 dark:text-slate-400 font-semibold hover:bg-slate-50 transition-colors text-sm cursor-pointer"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? t("loading") : t("savePayment")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
