"use client";

import { useState } from "react";
import { submitSelfScanAttendance } from "@/app/actions/attendance";

interface ScanClientProps {
  sessionId: string;
  groupName: string;
  date: string;
}

export default function ScanClient({ sessionId, groupName, date }: ScanClientProps) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await submitSelfScanAttendance(sessionId, name);
      if (res.success) {
        setResult({ success: true, message: `تم تسجيل حضورك بنجاح يا ${res.studentName}!` });
        setName(""); // Clear the input
      } else {
        setResult({ success: false, message: res.error || "حدث خطأ غير معروف" });
      }
    } catch (err) {
      setResult({ success: false, message: "تعذر الاتصال بالخادم. حاول مجدداً." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-300">
      <div className="bg-emerald-600 p-6 text-center text-white">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold mb-1">تسجيل الحضور</h1>
        <p className="text-emerald-100 opacity-90 text-sm">{groupName} • {date}</p>
      </div>

      <div className="p-8">
        {result?.success ? (
          <div className="text-center py-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 mb-6">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">تم بنجاح!</h2>
            <p className="text-slate-600 dark:text-slate-400">{result.message}</p>
            <p className="text-sm text-slate-400 mt-6">يمكنك الآن إغلاق هذه الصفحة.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center mb-6">
              <p className="text-slate-600 dark:text-slate-400 font-medium">
                يرجى كتابة اسمك الكامل كما هو مسجل في الفوج لتأكيد حضورك.
              </p>
            </div>

            {result?.success === false && (
              <div className="p-4 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-sm font-medium animate-in fade-in">
                {result.message}
              </div>
            )}

            <div>
              <label htmlFor="studentName" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                الاسم واللقب
              </label>
              <input
                id="studentName"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: أحمد عبد الله"
                className="w-full px-5 py-3.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-800 outline-none transition-all text-lg"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  جاري التحقق...
                </>
              ) : (
                "تأكيد الحضور"
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
