"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface DemoDataButtonProps {
  role: "superadmin" | "manager" | "teacher";
}

const roleConfig = {
  superadmin: {
    title: "تهيئة بيانات المنصة الشاملة — الأدمن",
    description: "سيتم إنشاء مدارس ومدراء، أساتذة تابعين وأساتذة مستقلين، مع أفواجهم والطلبة وسجلات المدفوعات.",
    buttonText: "تهيئة بيانات المنصة الكاملة",
    endpoint: "/api/seed-admin",
    color: "emerald",
    items: [
      "مدارس ومراكز ومدراء",
      "أساتذة تابعون ومستقلون",
      "أفواج دراسية متعددة",
      "طلبة وبطاقات QR",
      "سجلات مدفوعات وتحصيلات",
    ],
    buildBody: async () => ({}),
  },
  manager: {
    title: "تهيئة بيانات تجريبية — المدير",
    description: "سيتم إنشاء أساتذة وأفواج وطلبة وسجلات حضور ومدفوعات لمدرستك.",
    buttonText: "إنشاء بيانات المدرسة",
    endpoint: "/api/seed-manager",
    color: "emerald",
    items: [
      "أساتذة مع موادهم وأطوارهم",
      "أفواج دراسية للمدرسة",
      "طلبة مسجلون وبطاقاتهم",
      "جلسات وسجلات الحضور",
      "تحصيلات ومدفوعات شهرية",
    ],
    buildBody: async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      return { managerId: user?.id };
    },
  },
  teacher: {
    title: "تهيئة بيانات تجريبية — الأستاذ",
    description: "سيتم إنشاء أفواج وطلبة وسجلات حضور ومدفوعات لحسابك.",
    buttonText: "إنشاء بيانات الأستاذ",
    endpoint: "/api/seed-teacher",
    color: "teal",
    items: [
      "أفواج دراسية خاصة",
      "طلبة منخرطون وبطاقات QR",
      "سجلات وجلسات الحضور",
      "اشتراكات ومداخيل شهرية",
    ],
    buildBody: async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      return { teacherId: user?.id };
    },
  },
};

export function DemoDataButton({ role }: DemoDataButtonProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const queryClient = useQueryClient();
  const config = roleConfig[role];

  const colorMap = {
    purple: {
      card: "border-purple-200/60 bg-purple-50/50 dark:bg-purple-900/10 dark:border-purple-700/40",
      icon: "bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400",
      title: "text-purple-800 dark:text-purple-300",
      badge: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
      btn: "bg-purple-600 hover:bg-purple-700 shadow-purple-950/10",
      confirm: "bg-purple-600 hover:bg-purple-700",
    },
    emerald: {
      card: "border-emerald-200/60 bg-emerald-50/50 dark:bg-emerald-900/10 dark:border-emerald-700/40",
      icon: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400",
      title: "text-emerald-800 dark:text-emerald-300",
      badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
      btn: "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-950/10",
      confirm: "bg-emerald-600 hover:bg-emerald-700",
    },
    teal: {
      card: "border-teal-200/60 bg-teal-50/50 dark:bg-teal-900/10 dark:border-teal-700/40",
      icon: "bg-teal-100 text-teal-600 dark:bg-teal-900/40 dark:text-teal-400",
      title: "text-teal-800 dark:text-teal-300",
      badge: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
      btn: "bg-teal-600 hover:bg-teal-700 shadow-teal-950/10",
      confirm: "bg-teal-600 hover:bg-teal-700",
    },
  };

  const c = colorMap[config.color as keyof typeof colorMap];

  const handleSeed = async () => {
    setStatus("loading");
    setMessage("");
    setShowConfirm(false);

    try {
      const body = await config.buildBody();
      const res = await fetch(config.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل إنشاء البيانات");
      setStatus("success");
      setMessage(data.message || "تم إنشاء البيانات بنجاح!");
      // Invalidate all queries to refresh the UI
      queryClient.invalidateQueries();
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message);
    }
  };

  const handleResetDb = async () => {
    setStatus("loading");
    setMessage("");
    setShowResetConfirm(false);
    try {
      const res = await fetch("/api/reset-db", {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل حذف البيانات");
      setStatus("success");
      setMessage(data.message || "تم حذف البيانات بنجاح!");
      queryClient.invalidateQueries();
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message);
    }
  };

  return (
    <div className={`rounded-2xl border p-6 ${c.card} relative overflow-hidden`}>
      {/* Background decoration */}
      <div className="absolute -top-8 -left-8 w-32 h-32 rounded-full opacity-10 bg-current" />

      {/* Header */}
      <div className="flex items-start gap-4 mb-4 relative z-10">
        <div className={`p-3 rounded-2xl shrink-0 ${c.icon}`}>
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 2.625c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125m16.5 5.625c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
          </svg>
        </div>
        <div>
          <h3 className={`text-base font-bold mb-1 ${c.title}`}>{config.title}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{config.description}</p>
        </div>
      </div>

      {/* What will be created */}
      <div className="mb-5 relative z-10">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">ما سيتم إنشاؤه في قاعدة البيانات:</p>
        <div className="flex flex-wrap gap-2">
          {config.items.map((item, i) => (
            <span key={i} className={`inline-flex items-center px-3 py-1 rounded-xl text-xs font-semibold ${c.badge}`}>
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Status messages */}
      {status === "success" && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700/40 flex items-start gap-2 relative z-10">
          <svg className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400 whitespace-pre-line">{message}</p>
        </div>
      )}
      {status === "error" && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-700/40 flex items-start gap-2 relative z-10">
          <svg className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
          <p className="text-sm font-medium text-rose-700 dark:text-rose-400">{message}</p>
        </div>
      )}

      {/* Confirm dialog for SEED */}
      {showConfirm && (
        <div className="mb-4 p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40 relative z-10">
          <div className="flex items-center gap-2 mb-1 text-amber-800 dark:text-amber-300">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
            <p className="text-sm font-bold">تأكيد عملية التهيئة</p>
          </div>
          <p className="text-xs text-amber-700 dark:text-amber-400 mb-3">سيتم إنشاء وتحديث بيانات تجريبية متكاملة في السحابة لتجربة كامل خصائص الداشبورد.</p>
          <div className="flex gap-2">
            <button onClick={handleSeed} className={`flex-1 py-2 px-3 rounded-xl text-white text-xs font-bold transition-all cursor-pointer ${c.confirm}`}>
              نعم، تهيئة البيانات الآن
            </button>
            <button onClick={() => setShowConfirm(false)} className="flex-1 py-2 px-3 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all cursor-pointer hover:bg-slate-50">
              إلغاء
            </button>
          </div>
        </div>
      )}

      {/* Confirm dialog for RESET */}
      {showResetConfirm && (
        <div className="mb-4 p-4 rounded-2xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-700/40 relative z-10">
          <div className="flex items-center gap-2 mb-1 text-rose-800 dark:text-rose-300">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
            <p className="text-sm font-bold">تأكيد عملية الحذف الجذري</p>
          </div>
          <p className="text-xs text-rose-700 dark:text-rose-400 mb-3">هل أنت متأكد؟ سيتم محو جميع بيانات المنصة بالكامل (طلبة، أفواج، حصص، مدفوعات، وحسابات). لا يمكن التراجع.</p>
          <div className="flex gap-2">
            <button onClick={handleResetDb} className="flex-1 py-2 px-3 rounded-xl bg-rose-600 text-white text-xs font-bold transition-all cursor-pointer hover:bg-rose-700 shadow-sm shadow-rose-950/10">
              نعم، احذف كل شيء
            </button>
            <button onClick={() => setShowResetConfirm(false)} className="flex-1 py-2 px-3 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all cursor-pointer hover:bg-slate-50">
              إلغاء
            </button>
          </div>
        </div>
      )}

      {/* Main button */}
      {(!showConfirm && !showResetConfirm) && (
        <div className="flex flex-col gap-2 relative z-10">
          <button
            onClick={() => status === "success" ? handleSeed() : setShowConfirm(true)}
            disabled={status === "loading"}
            className={`w-full py-3 px-4 rounded-xl text-white text-sm font-semibold shadow-sm transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${c.btn}`}
          >
            {status === "loading" ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                جاري العمل...
              </>
            ) : status === "success" ? (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
                إعادة العملية
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
                </svg>
                {config.buttonText}
              </>
            )}
          </button>
          
          <button
            onClick={() => setShowResetConfirm(true)}
            disabled={status === "loading"}
            className="w-full py-2 px-4 rounded-xl text-rose-600 bg-white dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/50 hover:bg-rose-50 dark:hover:bg-rose-900/30 text-xs font-semibold transition-all duration-200 cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
            تفريغ قاعدة البيانات بالكامل (حذف جذري)
          </button>
        </div>
      )}
    </div>
  );
}
