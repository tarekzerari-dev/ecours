"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { Group, Student } from "@/lib/types";

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddStudent: (student: Student) => Promise<void> | void;
  groups: Group[];
  preselectedGroupId?: string;
}

export default function AddStudentModal({
  isOpen,
  onClose,
  onAddStudent,
  groups,
  preselectedGroupId,
}: AddStudentModalProps) {
  const [fullName, setFullName] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [groupId, setGroupId] = useState(preselectedGroupId || "");
  const [loading, setLoading] = useState(false);

  const { t, language } = useLanguage();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !groupId) return;

    setLoading(true);

    const group = groups.find(g => g.id === groupId);
    const qrCode = `ecours_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    const newStudent: Student = {
      id: "stu_" + Date.now(),
      fullName: fullName.trim(),
      parentPhone: parentPhone.trim(),
      groupId,
      groupName: group?.name || "",
      qrCode,
      totalAbsences: 0,
      totalPresences: 0,
      createdAt: new Date().toISOString(),
    };

    try {
      await onAddStudent(newStudent);
      onClose();
      // Reset form
      setFullName("");
      setParentPhone("");
      if (!preselectedGroupId) setGroupId("");
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
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{t("addNewStudent")}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t("studentsSubtitle")}</p>
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
          {/* Student Name */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              {t("studentName")} <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={t("studentNamePlaceholder")}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-sm transition-all"
            />
          </div>

          {/* Parent Phone */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              {t("parentPhone")}
            </label>
            <input
              type="tel"
              value={parentPhone}
              onChange={(e) => setParentPhone(e.target.value)}
              placeholder={t("parentPhonePlaceholder")}
              dir="ltr"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-sm transition-all"
            />
          </div>

          {/* Group Selection */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              {t("selectGroup")} <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              disabled={!!preselectedGroupId}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-slate-900 dark:text-slate-100 text-sm transition-all bg-white disabled:bg-slate-50 disabled:text-slate-500 dark:text-slate-400"
            >
              <option value="">{t("selectGroup")}...</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name} — {group.level}
                </option>
              ))}
            </select>
          </div>

          {/* QR Info */}
          <div className={`flex items-center gap-3 p-3 rounded-xl bg-emerald-50/80 border border-emerald-200/50 ${language === 'ar' ? 'flex-row' : 'flex-row'}`}>
            <svg className="w-8 h-8 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5Z" />
            </svg>
            <p className="text-xs text-emerald-700">{t("qrCodeDesc")}</p>
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
              {loading ? t("loading") : t("saveStudent")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
