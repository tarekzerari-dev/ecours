"use client";

import React, { useEffect, useState } from "react";
import QRCode from "qrcode";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface SessionQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
  groupName: string;
}

export default function SessionQrModal({ isOpen, onClose, sessionId, groupName }: SessionQrModalProps) {
  const { t } = useLanguage();
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  useEffect(() => {
    if (isOpen && sessionId) {
      // The public scan URL
      const scanUrl = `${window.location.origin}/scan/${sessionId}`;
      
      QRCode.toDataURL(scanUrl, {
        width: 400,
        margin: 2,
        color: {
          dark: '#0f172a', // slate-900
          light: '#ffffff'
        }
      }).then(url => {
        setQrDataUrl(url);
      }).catch(err => {
        console.error("Failed to generate QR code", err);
      });
    } else {
      setQrDataUrl("");
    }
  }, [isOpen, sessionId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-700 animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50/60 dark:bg-slate-900/40">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">رمز تسجيل الحضور</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{groupName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-8 flex flex-col items-center justify-center text-center">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-6 max-w-xs">
            اطلب من الطلبة مسح هذا الرمز باستخدام هواتفهم لتسجيل حضورهم في هذه الجلسة.
          </p>
          
          <div className="relative bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="Session QR Code" className="w-64 h-64 object-contain" />
            ) : (
              <div className="w-64 h-64 flex items-center justify-center bg-slate-50 rounded-xl">
                <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            
            {/* Corner decorations */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-emerald-500 rounded-tl-xl"></div>
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-emerald-500 rounded-tr-xl"></div>
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-emerald-500 rounded-bl-xl"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-emerald-500 rounded-br-xl"></div>
          </div>
          
          <p className="text-xs text-slate-400 dark:text-slate-500 dark:text-slate-400 mt-6 max-w-sm">
            بعد المسح، سيطلب من الطالب كتابة اسمه. سيقوم النظام بتسجيله تلقائياً إذا كان مسجلاً في الفوج.
          </p>
        </div>
      </div>
    </div>
  );
}
