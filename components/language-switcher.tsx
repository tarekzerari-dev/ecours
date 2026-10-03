"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Language } from "@/lib/i18n/translations";

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  const languages: { code: Language; label: string }[] = [
    { code: 'ar', label: 'العربية' },
    { code: 'en', label: 'English' },
    { code: 'fr', label: 'Français' },
  ];

  return (
    <div className="flex gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/50">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => setLanguage(lang.code)}
          className={`flex-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 cursor-pointer text-center ${
            language === lang.code
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
          }`}
        >
          {lang.code.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
