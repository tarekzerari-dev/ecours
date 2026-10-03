"use client";

import { useState } from "react";
import { updateProfile, updatePassword } from "./actions";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/AdminContext";
import { DemoDataButton } from "@/components/demo-data-button";

export function ProfileForm({ initialName, email, userId }: { initialName: string, email: string, userId: string }) {
  const { t } = useLanguage();
  const { isManager, isSuperAdmin } = useAuth();
  const currentRole = isSuperAdmin ? "superadmin" : isManager ? "manager" : "teacher";

  const [nameLoading, setNameLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  async function handleNameSubmit(formData: FormData) {
    setNameLoading(true);
    setMessage(null);
    const result = await updateProfile(formData);
    
    if (result.error) setMessage({ type: 'error', text: result.error });
    else setMessage({ type: 'success', text: t('success') });
    
    setNameLoading(false);
  }

  async function handlePasswordSubmit(formData: FormData) {
    setPassLoading(true);
    setMessage(null);
    const result = await updatePassword(formData);
    
    if (result.error) setMessage({ type: 'error', text: result.error });
    else setMessage({ type: 'success', text: t('success') });
    
    setPassLoading(false);
  }

  // Handle Avatar Upload directly to Supabase Storage
  async function handleAvatarUpload(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      setAvatarLoading(true);
      setMessage(null);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}-${Math.random()}.${fileExt}`;

      const supabase = createClient();

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      setMessage({ type: 'success', text: t('avatarUploadSuccess') });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || t('avatarUploadError') });
    } finally {
      setAvatarLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('profileTitle')}</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">{t('profileSubtitle')}</p>
      </div>

      {message && (
        <div className={`p-4 rounded-xl ${message.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700/40' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-700/40'}`}>
          {message.text}
        </div>
      )}

      {/* Avatar Section */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200/60 dark:border-slate-700/60">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">{t('avatarTitle')}</h2>
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-300 overflow-hidden border-2 border-slate-200 dark:border-slate-600">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
          </div>
          <div>
            <label className="bg-emerald-50 hover:bg-emerald-100/80 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-700/40 px-4 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer inline-flex items-center gap-2">
              {avatarLoading ? t('loading') : t('changeAvatar')}
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleAvatarUpload}
                disabled={avatarLoading}
              />
            </label>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{t('avatarHelp')}</p>
          </div>
        </div>
      </div>

      {/* Profile Details */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200/60 dark:border-slate-700/60">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">{t('profileTitle')}</h2>
        
        <form action={handleNameSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t('email')}</label>
            <input 
              type="email" 
              disabled 
              value={email}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 outline-none" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t('fullName')}</label>
            <input 
              name="fullName" 
              required 
              defaultValue={initialName}
              type="text" 
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all" 
            />
          </div>

          <button
            type="submit"
            disabled={nameLoading}
            className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 shadow-sm transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {nameLoading ? t('loading') : t('updateProfile')}
          </button>
        </form>
      </div>

      {/* Password Reset */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200/60 dark:border-slate-700/60">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">{t('updatePassword')}</h2>
        
        <form action={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t('newPassword')}</label>
            <input 
              name="newPassword" 
              required 
              minLength={6}
              type="password" 
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all" 
            />
          </div>

          <button
            type="submit"
            disabled={passLoading}
            className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-slate-700 text-white font-medium hover:bg-slate-800 dark:hover:bg-slate-600 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {passLoading ? t('loading') : t('updatePassword')}
          </button>
        </form>
      </div>

      {/* Demo Data Management Section */}
      <div className="pt-2">
        <DemoDataButton role={currentRole} />
      </div>
    </div>
  );
}

