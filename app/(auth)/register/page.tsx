"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { api } from "@/lib/supabase/api";

function RegisterForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  
  const [isValidating, setIsValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<'teacher' | 'manager'>('teacher');
  
  const router = useRouter();

  useEffect(() => {
    async function checkToken() {
      if (!token) {
        setIsValid(false);
        setIsValidating(false);
        return;
      }
      
      try {
        const valid = await api.validateRegistrationLink(token);
        setIsValid(valid);
      } catch (err) {
        setIsValid(false);
      } finally {
        setIsValidating(false);
      }
    }
    
    checkToken();
  }, [token]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || !token) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const supabase = createClient();
      
      // 1. Sign up the user (this triggers the database function to create profile)
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role
          }
        }
      });
      
      if (authError) throw authError;
      
      // 2. Mark token as used
      await api.markRegistrationLinkAsUsed(token, email);
      
      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 3000);
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || "حدث خطأ أثناء التسجيل. يرجى المحاولة مرة أخرى.");
      setLoading(false);
    }
  };

  if (isValidating) {
    return (
      <div className="w-full max-w-sm mx-auto text-center py-20">
        <svg className="animate-spin h-8 w-8 text-emerald-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-slate-500 dark:text-slate-400 font-medium">جاري التحقق من الرابط...</p>
      </div>
    );
  }

  if (!isValid) {
    return (
      <div className="w-full max-w-sm mx-auto text-center py-12">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">رابط غير صالح</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 leading-relaxed">
          هذا الرابط غير صالح أو تم استخدامه من قبل. يرجى طلب رابط جديد من الإدارة.
        </p>
        <button
          onClick={() => router.push("/login")}
          className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors"
        >
          العودة لتسجيل الدخول
        </button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="w-full max-w-sm mx-auto text-center py-12">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">تم التسجيل بنجاح!</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 leading-relaxed">
          تم إنشاء حسابك بنجاح. سيتم توجيهك الآن لصفحة تسجيل الدخول...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="mb-8 text-center md:text-right">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2 tracking-tight">إنشاء حساب جديد</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">أهلاً بك في منصة eCours! يرجى إدخال بياناتك للبدء.</p>
      </div>

      <form onSubmit={handleRegister} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 text-sm rounded-xl text-center font-medium">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">نوع الحساب</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole('teacher')}
              className={`p-3 rounded-xl border-2 text-sm font-bold transition-all ${
                role === 'teacher' 
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                  : 'border-slate-100 bg-white text-slate-500 dark:text-slate-400 hover:border-slate-200'
              }`}
            >
              أستاذ مستقل
            </button>
            <button
              type="button"
              onClick={() => setRole('manager')}
              className={`p-3 rounded-xl border-2 text-sm font-bold transition-all ${
                role === 'manager' 
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                  : 'border-slate-100 bg-white text-slate-500 dark:text-slate-400 hover:border-slate-200'
              }`}
            >
              مؤسسة تعليمية
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            {role === 'teacher' ? 'الاسم الكامل' : 'اسم المسؤول (أو مدير المؤسسة)'}
          </label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-slate-900 dark:text-slate-100 transition-all bg-white"
            placeholder="مثال: أحمد عبد الله"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">البريد الإلكتروني</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            dir="ltr"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-slate-900 dark:text-slate-100 transition-all bg-white text-left font-medium"
            placeholder="name@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">كلمة المرور</label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            dir="ltr"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-slate-900 dark:text-slate-100 transition-all bg-white text-left tracking-widest font-mono text-lg"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg shadow-emerald-500/30 text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-6 cursor-pointer"
        >
          {loading ? (
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            "تأكيد وإنشاء الحساب"
          )}
        </button>
      </form>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">جاري التحميل...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
