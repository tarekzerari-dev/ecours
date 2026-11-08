"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { t } = useLanguage();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(t("loginError"));
        setLoading(false);
        return;
      }

      // Check role directly to decide where to route
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single();
      
      if (profile?.role === 'superadmin') {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
      
      router.refresh();
    } catch (err) {
      console.error("Supabase auth error:", err);
      setError(t("serverError"));
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">{t("loginTitle")}</h1>
        <p className="text-slate-500 text-sm">{t("loginSubtitle")}</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-5">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 text-sm rounded-xl text-center font-medium">
            {error}
          </div>
        )}

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 text-start">{t("emailLabel")}</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                dir="ltr"
                className="w-full pl-4 pr-12 py-3.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-slate-900 transition-all bg-slate-50 hover:bg-white focus:bg-white text-left font-medium"
                placeholder="admin@ecours.com"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                </svg>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-slate-700 text-start">{t("passwordLabel")}</label>
              <a href="#" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">
                {t("forgotPassword")}
              </a>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                dir="ltr"
                className="w-full pl-4 pr-12 py-3.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-slate-900 transition-all bg-slate-50 hover:bg-white focus:bg-white text-left tracking-widest font-mono text-lg"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg shadow-emerald-500/30 text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-6"
        >
          {loading ? (
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            t("loginButton")
          )}
        </button>
      </form>
      
      {/* Demo Accounts Quick-fill */}
      <div className="mt-6 p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 text-center">
        <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300 mb-2">
          ⚡ حسابات تجريبية سريعة (اضغط للتعبئة):
        </p>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <button
            type="button"
            onClick={() => {
              setEmail("admin@ecours.com");
              setPassword("DemoPass123!");
            }}
            className="py-1.5 px-2 bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 rounded-lg text-emerald-700 dark:text-emerald-300 font-semibold hover:bg-emerald-100 dark:hover:bg-slate-700 transition-colors cursor-pointer shadow-xs"
          >
            المدير العام
          </button>
          <button
            type="button"
            onClick={() => {
              setEmail("manager_algiers@ecours.demo");
              setPassword("DemoPass123!");
            }}
            className="py-1.5 px-2 bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 rounded-lg text-emerald-700 dark:text-emerald-300 font-semibold hover:bg-emerald-100 dark:hover:bg-slate-700 transition-colors cursor-pointer shadow-xs"
          >
            مدير مدرسة
          </button>
          <button
            type="button"
            onClick={() => {
              setEmail("teacher_mourad@ecours.demo");
              setPassword("DemoPass123!");
            }}
            className="py-1.5 px-2 bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 rounded-lg text-emerald-700 dark:text-emerald-300 font-semibold hover:bg-emerald-100 dark:hover:bg-slate-700 transition-colors cursor-pointer shadow-xs"
          >
            أستاذ
          </button>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
          كلمة المرور: <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">DemoPass123!</span>
        </p>
      </div>

      {/* Subscribe Button */}
      <div className="mt-8 pt-6 border-t border-slate-100 text-center">
        <p className="text-sm text-slate-500 mb-3">{t("newAccountQ")}</p>
        <button
          onClick={() => setShowSubscribeModal(true)}
          className="text-emerald-600 font-bold hover:text-emerald-700 transition-colors"
        >
          {t("subscribeNow")}
        </button>
      </div>

      {/* Subscribe Modal */}
      {showSubscribeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200 p-8 text-center relative">
            <button
              onClick={() => setShowSubscribeModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-emerald-600">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">طلب اشتراك جديد</h3>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              لإنشاء حساب جديد كأستاذ مستقل أو مؤسسة تعليمية، يرجى التواصل معنا للحصول على رابط التسجيل الخاص بك.
            </p>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-left" dir="ltr">
              <p className="text-sm font-semibold text-slate-700 mb-1">Email:</p>
              <a href="mailto:contact@ecours.com" className="text-emerald-600 font-bold hover:underline mb-3 block">contact@ecours.com</a>
              <p className="text-sm font-semibold text-slate-700 mb-1">Phone:</p>
              <a href="tel:+213000000000" className="text-emerald-600 font-bold hover:underline block">+213 (0) 00 00 00 00</a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
