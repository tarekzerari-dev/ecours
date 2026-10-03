"use client";

import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t, language } = useLanguage();
  
  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-8 overflow-hidden font-sans bg-emerald-950" dir={language === "ar" ? "rtl" : "ltr"}>
      
      {/* Back to Home Button */}
      <Link href="/" className="absolute top-6 left-6 z-50 flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-full text-white text-sm font-medium transition-all shadow-lg hover:shadow-xl hover:-translate-x-1">
        <svg className={`w-4 h-4 ${language === "ar" ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        <span className="hidden sm:inline">{t("backToHome")}</span>
        <span className="sm:hidden">{t("back")}</span>
      </Link>

      {/* Full Background Image */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="/images/login-bg-v3.jpg" 
          alt="Classroom" 
          fill
          className="object-cover object-center opacity-70"
          priority
          quality={100}
        />
        {/* Overlay to ensure text readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/70 via-teal-900/50 to-slate-950/80 mix-blend-multiply" />
      </div>

      {/* Decorative Blur Orbs */}
      <div className="absolute -top-[20%] -right-[10%] w-[500px] h-[500px] rounded-full bg-emerald-500/30 blur-[120px] pointer-events-none z-0" />
      <div className="absolute -bottom-[20%] -left-[10%] w-[500px] h-[500px] rounded-full bg-teal-500/30 blur-[120px] pointer-events-none z-0" />

      {/* Main Glass Card (البطاقة المائية) */}
      <div className="relative z-10 w-full max-w-[1000px] flex flex-col md:flex-row rounded-[2rem] overflow-hidden border border-white/20 shadow-[0_8px_40px_rgba(0,0,0,0.3)] bg-white/10 backdrop-blur-2xl">
        
        {/* Left Side: Branding / Info (Visual Right in code layout, visually right in RTL) */}
        <div className="hidden md:flex flex-col justify-between w-full md:w-[45%] p-10 lg:p-12 bg-gradient-to-b from-white/10 to-white/5 border-l border-white/10">
          <div>
            {/* Logo — large, centered, fills the top area */}
            <div className="flex items-center justify-center mb-10 drop-shadow-2xl">
              <img
                src="/images/ecours.png"
                alt="eCours"
                className="w-full max-w-[320px] h-auto object-contain"
              />
            </div>


            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4 leading-tight drop-shadow-md">
              {t("welcomeAuth")}
            </h2>
            <p className="text-emerald-50/90 leading-relaxed text-sm lg:text-base font-medium">
              {t("authDesc")}
            </p>
            <div className="hidden md:block absolute bottom-8 left-10">
              <p className="text-white/40 text-xs font-medium tracking-wide">
                &copy; {new Date().getFullYear()} eCours. {t("landing.footerRights")}
              </p>
            </div>
          </div>
          
          <div className="space-y-5 mt-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border border-white/20 shadow-inner">
                <svg className="w-6 h-6 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm lg:text-base text-white font-medium drop-shadow-sm">{t("featureSecureDesc")}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border border-white/20 shadow-inner">
                <svg className="w-6 h-6 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <p className="text-sm lg:text-base text-white font-medium drop-shadow-sm">{t("featureFastDesc")}</p>
            </div>
          </div>
        </div>

        {/* Right Side: Auth Form (Visual Left in RTL) */}
        <div className="flex-1 p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-white shadow-[-10px_0_30px_rgba(0,0,0,0.1)]">
          {children}
        </div>
      </div>
    </div>
  );
}
