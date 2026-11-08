"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useAuth } from "@/lib/AdminContext";
import { useTeachers } from "@/lib/hooks/queries";
import type { Group } from "@/lib/types";

// Keep the old export name for backward compatibility
export type GroupData = Group;

interface AddGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddGroup: (group: Group) => Promise<void> | void;
}

export default function AddGroupModal({
  isOpen,
  onClose,
  onAddGroup,
}: AddGroupModalProps) {
  const [name, setName] = useState("");
  const [level, setLevel] = useState("");
  const [monthlyPrice, setMonthlyPrice] = useState(2500);
  const [sessionPrice, setSessionPrice] = useState(600);
  const [loading, setLoading] = useState(false);

  const { t, language } = useLanguage();
  const { isManager, selectedTeacherId, loggedTeacherId } = useAuth();
  const { data: teachers = [] } = useTeachers();

  const [assignedTeacherId, setAssignedTeacherId] = useState(selectedTeacherId || "");
  const [phase, setPhase] = useState<'primary' | 'middle' | 'secondary'>('secondary');

  useEffect(() => {
    if (selectedTeacherId) {
      setAssignedTeacherId(selectedTeacherId);
    } else if (teachers.length > 0 && !assignedTeacherId) {
      setAssignedTeacherId(teachers[0].id);
    }
  }, [selectedTeacherId, teachers, assignedTeacherId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);

    const targetTeacherId = isManager
      ? (assignedTeacherId || teachers[0]?.id || selectedTeacherId || loggedTeacherId)
      : (loggedTeacherId || selectedTeacherId);

    if (!targetTeacherId) {
      alert("يرجى اختيار أستاذ الفوج");
      setLoading(false);
      return;
    }

    const newGroup: GroupData = {
      id: "grp_" + Date.now(),
      teacherId: targetTeacherId,
      name: name.trim(),
      level: level || (phase === 'primary' ? 'Primary' : phase === 'middle' ? '4AM' : '3AS'),
      monthlyPrice: Number(monthlyPrice),
      sessionPrice: Number(sessionPrice),
      studentCount: 0,
      createdAt: new Date().toISOString(),
    };

    try {
      await onAddGroup(newGroup);
      onClose();
      // Reset form
      setName("");
      setMonthlyPrice(2500);
      setSessionPrice(600);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm transition-opacity">
      <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/40">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{t("addNewGroup")}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t("groupsSubtitle")}</p>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Teacher Selector for Manager */}
          {isManager && teachers.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                الأستاذ المشرف على الفوج <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={assignedTeacherId}
                onChange={(e) => setAssignedTeacherId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-slate-900 dark:text-slate-100 text-sm transition-all bg-white dark:bg-slate-900"
              >
                {teachers.map((t: any) => (
                  <option key={t.id} value={t.id}>{t.fullName} ({t.subject})</option>
                ))}
              </select>
            </div>
          )}

          {/* Group Name */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              {t("groupName")} <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("groupNamePlaceholder")}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-sm transition-all bg-white dark:bg-slate-900"
            />
          </div>

          {/* Phase */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {language === 'ar' ? 'الطور التعليمي' : 'Educational Phase'}
              </label>
              <select
                value={phase}
                onChange={(e) => setPhase(e.target.value as 'primary' | 'middle' | 'secondary')}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-slate-900 dark:text-slate-100 text-sm transition-all bg-white"
              >
                <option value="primary">{language === 'ar' ? 'ابتدائي' : 'Primary'}</option>
                <option value="middle">{language === 'ar' ? 'متوسط' : 'Middle'}</option>
                <option value="secondary">{language === 'ar' ? 'ثانوي' : 'Secondary'}</option>
              </select>
            </div>
          </div>

          {/* Level */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {t("educationalLevel")}
              </label>
              <select
                value={level || (phase === 'primary' ? 'Primary' : phase === 'middle' ? '4AM' : '3AS')}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-slate-900 dark:text-slate-100 text-sm transition-all bg-white"
              >
                {phase === 'secondary' && (
                  <>
                    <option value="3AS">{language === 'ar' ? 'ثالثة ثانوي (بكالوريا)' : '3rd Secondary (BAC)'}</option>
                    <option value="2AS">{language === 'ar' ? 'ثانية ثانوي' : '2nd Secondary'}</option>
                    <option value="1AS">{language === 'ar' ? 'أولى ثانوي' : '1st Secondary'}</option>
                  </>
                )}
                {phase === 'middle' && (
                  <>
                    <option value="4AM">{language === 'ar' ? 'رابعة متوسط (BEM)' : '4th Middle (BEM)'}</option>
                    <option value="3AM">{language === 'ar' ? 'ثالثة متوسط' : '3rd Middle'}</option>
                    <option value="2AM">{language === 'ar' ? 'ثانية متوسط' : '2nd Middle'}</option>
                    <option value="1AM">{language === 'ar' ? 'أولى متوسط' : '1st Middle'}</option>
                  </>
                )}
                {phase === 'primary' && (
                  <option value="Primary">{language === 'ar' ? 'ابتدائي' : 'Primary'}</option>
                )}
              </select>
            </div>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {t("monthlyPrice")} ({t("currencyDzd")})
              </label>
              <input
                type="number"
                min="0"
                step="100"
                value={monthlyPrice}
                onChange={(e) => setMonthlyPrice(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-slate-900 dark:text-slate-100 text-sm transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {t("sessionPrice")} ({t("currencyDzd")})
              </label>
              <input
                type="number"
                min="0"
                step="50"
                value={sessionPrice}
                onChange={(e) => setSessionPrice(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-slate-900 dark:text-slate-100 text-sm transition-all"
              />
            </div>
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
              {loading ? t("loading") : t("saveGroup")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
