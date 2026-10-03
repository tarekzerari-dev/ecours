"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { SubtleBackground } from "@/components/subtle-background";
import { useAdminBilling } from "@/lib/hooks/queries";

export function BillingClient() {
  const { t, language } = useLanguage();
  const { data: payments = [], isLoading } = useAdminBilling();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterMonth, setFilterMonth] = useState("all");

  const monthOptions = Array.from(new Set(payments.map((p: any) => p.monthCovered).filter(Boolean)));

  const filteredPayments = payments.filter((payment: any) => {
    const matchesSearch =
      payment.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.groupName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.schoolName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesMonth = filterMonth === "all" || payment.monthCovered === filterMonth;

    return matchesSearch && matchesMonth;
  });

  const totalRevenue = payments.reduce((acc: number, p: any) => acc + (p.amount || 0), 0);
  const avgPayment = payments.length > 0 ? Math.round(totalRevenue / payments.length) : 0;

  return (
    <div className="relative min-h-[calc(100vh-8rem)]">
      <SubtleBackground variant="finance" />

      {/* Header */}
      <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold mb-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
            </svg>
            السجل المالي العام
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            المالية والاشتراكات عبر المنصة
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            سجل كافة العمليات المالية، تحصيلات الاشتراكات الشهرية في مختلف المدارس والمراكز ولدى الأساتذة
          </p>
        </div>

        {/* Quick Stats Pill */}
        <div className="flex items-center gap-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md px-5 py-3 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-sm text-xs">
          <div>
            <span className="text-slate-400">إجمالي التحصيلات: </span>
            <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">{totalRevenue.toLocaleString()} دج</span>
          </div>
          <span className="text-slate-300">|</span>
          <div>
            <span className="text-slate-400">عدد العمليات: </span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{payments.length}</span>
          </div>
          <span className="text-slate-300">|</span>
          <div>
            <span className="text-slate-400">متوسط العملية: </span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{avgPayment.toLocaleString()} دج</span>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="relative z-10 flex flex-col sm:flex-row items-center gap-3 mb-6">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="بحث باسم الطالب، الفوج، الأستاذ، أو المدرسة..."
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
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
          className="w-full sm:w-56 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all cursor-pointer"
        >
          <option value="all">جميع الأشهر</option>
          {monthOptions.map((m: any) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      {/* Payments Table */}
      <div className="relative z-10 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-700/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className={`w-full text-sm ${language === 'ar' ? 'text-right' : 'text-left'}`}>
            <thead className="bg-slate-50/70 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs">
              <tr>
                <th className="px-6 py-4 font-bold">الطالب</th>
                <th className="px-6 py-4 font-bold">الفوج الدراسي</th>
                <th className="px-6 py-4 font-bold">الأستاذ</th>
                <th className="px-6 py-4 font-bold">الجهة التابع لها</th>
                <th className="px-6 py-4 font-bold">المبلغ المسدد</th>
                <th className="px-6 py-4 font-bold">الشهر المغطى</th>
                <th className="px-6 py-4 font-bold">تاريخ الدفع</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-slate-700 dark:text-slate-200">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-slate-500 dark:text-slate-400">
                    <p className="font-bold text-base mb-1">لا توجد عمليات دفع مسجلة</p>
                    <p className="text-xs">جرب تغيير شروط البحث أو تهيئة البيانات التجريبية.</p>
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment: any) => (
                  <tr key={payment.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center text-xs shrink-0">
                          {payment.studentName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-slate-100">{payment.studentName}</p>
                          <p className="text-xs text-slate-400">طالب</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-200">
                      {payment.groupName}
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                        </svg>
                        {payment.teacherName}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {payment.schoolName && payment.schoolName !== 'مستقل' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200/50">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21" />
                          </svg>
                          {payment.schoolName}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200/50">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                          </svg>
                          أستاذ مستقل
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-extrabold text-emerald-600 dark:text-emerald-400">
                      +{payment.amount.toLocaleString()} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">دج</span>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono" dir="ltr">
                      {payment.monthCovered}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400">
                      {new Date(payment.createdAt).toLocaleDateString('ar-DZ')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
