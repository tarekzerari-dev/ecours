"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import LanguageSwitcherFloating from "@/components/language-switcher-floating";

export default function LandingPage() {
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const { t, language, setLanguage, dir } = useLanguage();
  const l = (t as any)('landing') || {};

  return (
    <main className="relative min-h-screen flex flex-col selection:bg-emerald-500/30 overflow-x-hidden font-sans" dir={dir}>
      {/* 1. Full Screen Background Image */}
      <div className="fixed inset-0 z-0">
        <Image 
          src="/images/login-bg-v3.jpg" 
          alt="eCours Background" 
          fill 
          className="object-cover object-center"
          priority
          quality={100}
        />
        {/* Subtle overlay to ensure text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/80 via-teal-900/70 to-slate-900/90 backdrop-blur-[4px]" />
      </div>

      {/* 2. Glassmorphism Navbar (Dynamic Pill) */}
      <nav className="fixed top-6 left-0 right-0 z-50 w-full px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="relative flex items-center justify-between px-6 py-3 bg-white/10 backdrop-blur-xl backdrop-saturate-150 border border-white/30 rounded-full shadow-[0_8px_32px_0_rgba(255,255,255,0.05)] transition-all duration-300 hover:bg-white/20">
            {/* Logo */}
            <div className="flex items-center">
              <img src="/images/ecours.png" alt="eCours" className="h-20 md:h-24 w-auto object-contain drop-shadow-md -my-5" />
            </div>
            
            {/* Centered Links */}
            <div className={`hidden md:flex absolute ${dir === 'rtl' ? 'left-1/2 -translate-x-1/2' : 'right-1/2 translate-x-1/2'} items-center gap-2`}>
              <a href="#about" className="px-4 py-2 text-sm font-medium text-white/90 hover:text-white hover:bg-white/20 rounded-full transition-all">{l.navAbout}</a>
              <a href="#challenges" className="px-4 py-2 text-sm font-medium text-white/90 hover:text-white hover:bg-white/20 rounded-full transition-all">{l.navWhy}</a>
              <a href="#audience" className="px-4 py-2 text-sm font-medium text-white/90 hover:text-white hover:bg-white/20 rounded-full transition-all">{l.navAudience}</a>
              <a href="#developer" className="px-4 py-2 text-sm font-medium text-white/90 hover:text-white hover:bg-white/20 rounded-full transition-all">{l.navDev}</a>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Link href="/login" className="hidden sm:block px-4 py-2 text-sm font-medium text-white/90 hover:text-emerald-400 transition-colors">
                {l.login}
              </Link>
              <button onClick={() => setShowSubscribeModal(true)} className="px-5 py-2.5 text-sm font-bold text-teal-950 bg-emerald-400 hover:bg-emerald-300 rounded-full shadow-[0_0_20px_rgba(52,211,153,0.3)] transition-all cursor-pointer">
                {l.subscribe}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 3. Hero Section */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 pt-36 pb-20 text-center">
        <div className="max-w-4xl mx-auto opacity-0 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <span className="inline-flex items-center gap-2 px-5 py-2 mb-8 text-sm font-semibold text-emerald-300 bg-emerald-950/50 backdrop-blur-md border border-emerald-500/30 rounded-full">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {l.heroBadge}
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-white leading-tight mb-6 drop-shadow-lg">
            {l.heroTitle1} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-teal-200">
              {l.heroTitle2}
            </span>
          </h1>
          <p className="text-lg md:text-xl text-emerald-50 mb-10 max-w-2xl mx-auto leading-relaxed drop-shadow-md">
            {l.heroDesc}
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={() => setShowSubscribeModal(true)} className="w-full sm:w-auto px-8 py-4 text-lg font-bold text-teal-950 bg-gradient-to-r from-emerald-300 to-teal-300 rounded-2xl shadow-[0_0_30px_rgba(52,211,153,0.4)] hover:shadow-[0_0_40px_rgba(52,211,153,0.6)] transition-all duration-300 cursor-pointer">
              {l.subscribe}
            </button>
            <Link href="/login" className="w-full sm:w-auto px-8 py-4 text-lg font-medium text-white bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl hover:bg-white/20 transition-all duration-300 text-center">
              {l.login}
            </Link>
          </div>
        </div>
      </div>

      {/* 4. About eCours Section */}
      <div id="about" className="relative z-10 flex items-center w-full min-h-screen px-6 py-16">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">{l.aboutTitle1} <span className="text-emerald-400">eCours</span> {l.aboutTitle2}</h2>
            <p className="text-lg text-emerald-50/90 leading-relaxed mb-6">
              {l.aboutDesc1}
            </p>
            <p className="text-lg text-emerald-50/90 leading-relaxed mb-8">
              {l.aboutDesc2}
            </p>
            
            <div className="flex gap-6">
              <div className="bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-2xl flex-1 hover:bg-white/10 transition-colors">
                <svg className="w-8 h-8 text-emerald-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <h3 className="text-white font-bold text-lg mb-2">{l.teacherValueTitle}</h3>
                <p className="text-sm text-emerald-100/70 leading-relaxed">{l.teacherValueDesc}</p>
              </div>
              <div className="bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-2xl flex-1 hover:bg-white/10 transition-colors">
                <svg className="w-8 h-8 text-emerald-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <h3 className="text-white font-bold text-lg mb-2">{l.parentValueTitle}</h3>
                <p className="text-sm text-emerald-100/70 leading-relaxed">{l.parentValueDesc}</p>
              </div>
            </div>
          </div>
          
          {/* Decorative Wordmark */}
          <div className="flex-1 flex justify-center lg:justify-end items-center opacity-0 animate-fade-in-up mt-12 lg:mt-0" style={{ animationDelay: '0.6s' }}>
            <div className="relative w-full max-w-sm lg:max-w-lg animate-float">
              <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full"></div>
              <img 
                src="/images/ecours.png" 
                alt="eCours Platform" 
                className="relative z-10 w-full h-auto object-contain drop-shadow-2xl" 
              />
            </div>
          </div>
        </div>
      </div>

      {/* 5. Challenges vs Solutions (Why eCours) */}
      <div id="challenges" className="relative z-10 flex flex-col justify-center w-full min-h-screen px-6 py-16 bg-black/20 backdrop-blur-sm border-y border-white/10">
        <div className="w-full">
        <div className="max-w-7xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{l.whyTitle1} <span className="text-emerald-400">eCours</span> {l.whyTitle2}</h2>
          <p className="text-emerald-100/80 max-w-2xl mx-auto">{l.whyDesc}</p>
        </div>
        
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ChallengeCard number="01" title={l.ch1Title} desc={l.ch1Desc} solution={l.ch1Sol} dir={dir} />
          <ChallengeCard number="02" title={l.ch2Title} desc={l.ch2Desc} solution={l.ch2Sol} dir={dir} />
          <ChallengeCard number="03" title={l.ch3Title} desc={l.ch3Desc} solution={l.ch3Sol} dir={dir} />
          <ChallengeCard number="04" title={l.ch4Title} desc={l.ch4Desc} solution={l.ch4Sol} dir={dir} />
          <ChallengeCard number="05" title={l.ch5Title} desc={l.ch5Desc} solution={l.ch5Sol} dir={dir} />
          <ChallengeCard number="06" title={l.ch6Title} desc={l.ch6Desc} solution={l.ch6Sol} dir={dir} />
        </div>
        </div>
      </div>

      {/* 6. Target Audience */}
      <div id="audience" className="relative z-10 flex flex-col justify-center w-full min-h-screen px-6 py-24">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-16">{l.audienceTitle1} <span className="text-emerald-400">eCours</span> {l.audienceTitle2}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <AudienceCard 
              icon={<svg className="w-12 h-12 text-emerald-400 drop-shadow-md mb-6 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
              title={l.aud1Title} 
              desc={l.aud1Desc} 
            />
            <AudienceCard 
              icon={<svg className="w-12 h-12 text-emerald-400 drop-shadow-md mb-6 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>}
              title={l.aud2Title} 
              desc={l.aud2Desc} 
            />
            <AudienceCard 
              icon={<svg className="w-12 h-12 text-emerald-400 drop-shadow-md mb-6 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
              title={l.aud3Title} 
              desc={l.aud3Desc} 
            />
          </div>
          
          <div className="mt-16 bg-gradient-to-r from-emerald-600/40 to-teal-600/40 backdrop-blur-md border border-emerald-400/30 rounded-3xl p-8 text-center max-w-4xl mx-auto shadow-2xl">
            <p className="text-xl md:text-2xl font-bold text-white leading-relaxed">
              {l.audFooter}
            </p>
          </div>
        </div>
      </div>

      {/* 7. About the Developer */}
      <div id="developer" className="relative z-10 flex flex-col justify-center w-full min-h-screen px-6 py-24 bg-black/10 border-t border-white/10">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-10 md:p-16 shadow-2xl flex flex-col md:flex-row items-center gap-12 md:gap-16">
            {/* Developer Image */}
            <div className="relative w-56 h-56 md:w-72 md:h-72 shrink-0 rounded-full p-2 bg-gradient-to-br from-emerald-400 to-teal-600 shadow-xl overflow-hidden group">
              <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
              <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-white/20 bg-slate-800">
                <Image 
                  src="/images/photo.png" 
                  alt="Tarek Zerari" 
                  fill 
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 flex items-center justify-center -z-10">
                  <svg className="w-16 h-16 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Developer Info */}
            <div className={`flex-1 text-center ${dir === 'rtl' ? 'md:text-right' : 'md:text-left'}`}>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">{l.devName}</h2>
              <div className="inline-block px-5 py-2 mb-6 text-base font-medium text-emerald-300 bg-emerald-950/80 border border-emerald-500/30 rounded-full">
                {l.devRole}
              </div>
              <p className="text-emerald-50/90 text-xl mb-8 leading-relaxed">
                {l.devDesc}
              </p>
              
              <div className={`flex flex-col sm:flex-row items-center gap-4 justify-center ${dir === 'rtl' ? 'md:justify-start' : 'md:justify-start'}`}>
                <a href="mailto:nt_zerari@esi.dz" className="flex items-center gap-3 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-colors text-white text-lg">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  <span dir="ltr">nt_zerari@esi.dz</span>
                </a>
                <a href="tel:0561069167" className="flex items-center gap-3 px-6 py-3 bg-emerald-600/80 hover:bg-emerald-500 border border-emerald-400/50 rounded-xl transition-colors text-white font-medium text-lg shadow-lg shadow-emerald-900/50">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  <span dir="ltr">0561 06 91 67</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 8. Footer (Simple Glass) */}
      <footer className="relative z-10 w-full py-8 border-t border-white/10 bg-black/40 backdrop-blur-xl text-center">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center overflow-visible">
            <img src="/images/ecours.png" alt="eCours" className="h-24 w-auto object-contain -my-8 drop-shadow-xl" />
          </div>
          <p className="text-sm text-emerald-100/60">
            © {new Date().getFullYear()} {l.footerRights}
          </p>
        </div>
      </footer>

      {/* Subscribe Modal */}
      {showSubscribeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200" dir={dir}>
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200 p-8 text-center relative">
            <button
              onClick={() => setShowSubscribeModal(false)}
              className={`absolute top-4 ${dir === 'rtl' ? 'left-4' : 'right-4'} p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:text-slate-400 hover:bg-slate-100 transition-colors cursor-pointer`}
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
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">{l.subModalTitle}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              {l.subModalDesc}
            </p>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-left" dir="ltr">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Email:</p>
              <a href="mailto:nt_zerari@esi.dz" className="text-emerald-600 font-bold hover:underline mb-3 block">nt_zerari@esi.dz</a>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone:</p>
              <a href="tel:+213561069167" className="text-emerald-600 font-bold hover:underline block">+213 (0) 561 06 91 67</a>
            </div>
            <button
              onClick={() => setShowSubscribeModal(false)}
              className="mt-6 w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-colors cursor-pointer"
            >
              {l.close}
            </button>
          </div>
        </div>
      )}
      
      <LanguageSwitcherFloating />
    </main>
  );
}

function ChallengeCard({ number, title, desc, solution, dir }: { number: string, title: string, desc: string, solution: string, dir: string }) {
  return (
    <div className="group relative p-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-300">
      <div className={`absolute -top-4 ${dir === 'rtl' ? '-right-4' : '-left-4'} w-12 h-12 bg-emerald-500 rounded-xl ${dir === 'rtl' ? 'rotate-12 group-hover:rotate-0' : '-rotate-12 group-hover:rotate-0'} flex items-center justify-center font-bold text-xl text-white shadow-lg transition-all duration-300`}>{number}</div>
      <h3 className="text-xl font-bold text-white mb-3 mt-4">{title}</h3>
      <p className="text-emerald-100/70 mb-4 relative inline-block">
        <span className="relative z-10">{desc}</span>
        <span className="absolute top-1/2 left-0 right-0 h-0.5 bg-red-500/80 -rotate-2 z-20 group-hover:bg-red-400 transition-colors"></span>
      </p>
      <div className="flex items-center gap-2 text-emerald-400 font-medium">
        <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <span>{solution}</span>
      </div>
    </div>
  );
}

function AudienceCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all duration-300 hover:-translate-y-2">
      {icon}
      <h3 className="text-2xl font-bold text-white mb-4">{title}</h3>
      <p className="text-emerald-100/80 leading-relaxed">{desc}</p>
    </div>
  );
}
