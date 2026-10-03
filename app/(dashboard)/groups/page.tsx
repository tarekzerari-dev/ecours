"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { SubtleBackground } from "@/components/subtle-background";
import { CardCornerDoodle } from "@/components/ui/card-corner-doodle";
import AddGroupModal from "@/components/add-group-modal";
import { useAuth } from "@/lib/AdminContext";
import type { Group } from "@/lib/types";
import Link from "next/link";
import { useGroups } from "@/lib/hooks/queries";
import { useAddGroup, useDeleteGroup } from "@/lib/hooks/mutations";

export default function GroupsPage() {
  const { t, language } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isManager, selectedTeacherId, loggedTeacherId } = useAuth();

  const activeTeacherId = isManager ? selectedTeacherId : loggedTeacherId;

  const { data: groups = [], isLoading } = useGroups(activeTeacherId || undefined);
  const addGroupMutation = useAddGroup();
  const deleteGroupMutation = useDeleteGroup();

  const handleAddGroup = async (newGroup: Group) => {
    try {
      await addGroupMutation.mutateAsync(newGroup);
    } catch (error) {
      console.error("Failed to add group:", error);
      alert("حدث خطأ أثناء إضافة الفوج");
    }
  };

  const handleDeleteGroup = async (id: string) => {
    if (!confirm(t("deleteGroupConfirm"))) return;
    try {
      await deleteGroupMutation.mutateAsync(id);
    } catch (error) {
      console.error("Failed to delete group:", error);
      alert("حدث خطأ أثناء حذف الفوج");
    }
  };

  if (isLoading) return null;

  return (
    <div className="relative min-h-[calc(100vh-8rem)]">
      <SubtleBackground variant="groups" />

      {/* Page Header */}
      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">{t("groupsTitle")}</h1>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1">{t("groupsSubtitle")}</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm transition-all duration-200 cursor-pointer ${
            language === "ar" ? "flex-row" : "flex-row-reverse"
          }`}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          {t("newGroup")}
        </button>
      </div>

      {/* Content Area */}
      {groups.length > 0 ? (
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {groups.map((group) => {
            const studentCount = group.studentCount || 0;
            return (
              <div
                key={group.id}
                className="group relative bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-slate-700/60 p-6 shadow-sm hover:shadow-lg hover:shadow-emerald-950/5 transition-all duration-300 overflow-hidden flex flex-col justify-between"
              >
                <CardCornerDoodle type="group" />

                <div>
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-700/50">
                      {group.level}
                    </span>
                    {group.teacherName && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300 border border-teal-200/60 dark:border-teal-700/50">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                        </svg>
                        {group.teacherName}
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1 line-clamp-1">{group.name}</h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                    {t("studentsCount")}: <span className="font-bold text-slate-700 dark:text-slate-200">{studentCount}</span>
                  </p>
                </div>

                {/* Pricing & Footer */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-2">
                  <div>
                    <p className="text-xs text-slate-400">{t("monthlyPrice")}</p>
                    <p className="text-base font-extrabold text-emerald-600">
                      {group.monthlyPrice.toLocaleString()} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">{t("currencyDzd")}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDeleteGroup(group.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title={t("deleteGroup")}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                      </svg>
                    </button>

                    <Link
                      href={`/groups/${group.id}`}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                    >
                      {t("viewGroup")}
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
          <div className="relative z-10 bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 p-6 sm:p-12 text-center shadow-sm overflow-hidden group">
            <CardCornerDoodle type="group" />
            <div className="absolute -bottom-6 -right-6 sm:-bottom-10 sm:-right-10 w-32 h-32 sm:w-48 sm:h-48 text-emerald-600/10 pointer-events-none group-hover:scale-105 transition-transform duration-500">
              <svg viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
                <rect x="15" y="20" width="170" height="110" rx="8" />
                <rect x="23" y="28" width="154" height="94" rx="4" strokeDasharray="4 4" />
                <path d="M 35 130 L 20 180 M 165 130 L 180 180 M 10 180 L 45 180 M 155 180 L 190 180" />
                <path d="M 40 60 Q 65 35 90 60 T 140 60" />
              </svg>
            </div>

            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-slate-100/80 border border-slate-200/80 mb-5 p-4 text-slate-400 group-hover:text-slate-500 dark:text-slate-400 group-hover:bg-slate-100 transition-all duration-300">
                <svg className="w-10 h-10 stroke-[1.4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5m.75-9 3-3 2.148 2.148A12.061 12.061 0 0 1 16.5 7.605" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">{t("noGroupsTitle")}</h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">{t("noGroupsDesc")}</p>

              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm transition-all cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                {t("addNewGroup")}
              </button>
            </div>
          </div>
      )}

      <AddGroupModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddGroup={handleAddGroup}
      />
    </div>
  );
}
