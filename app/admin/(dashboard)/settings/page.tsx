'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { LogOut, User, Shield } from 'lucide-react';

export default function AdminSettings() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserEmail(user?.email || null);
      setLoading(false);
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-10 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[var(--cookd-orange)]/20 border-t-[var(--cookd-orange)] rounded-full animate-spin" />
          <div className="text-[var(--text-muted)] font-medium">Loading settings...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-10 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold font-display text-[var(--text-primary)] mb-2">Settings</h1>
        <p className="text-[var(--text-secondary)]">Manage your kitchen preferences and account security.</p>
      </div>

      <div className="space-y-8">
        {/* Profile Card */}
        <div className="bg-white border border-[var(--border-light)] rounded-3xl p-6 sm:p-10 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <User size={120} />
          </div>
          
          <h2 className="text-2xl font-bold text-[var(--text-primary)] font-display mb-8 flex items-center gap-3">
            <span className="w-10 h-10 bg-[var(--cookd-orange)]/10 rounded-xl flex items-center justify-center">
              <User className="text-[var(--cookd-orange)]" size={20} />
            </span>
            Admin Profile
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
            <div className="bg-[var(--surface-cream)]/50 border border-[var(--border-light)] rounded-2xl p-6">
              <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2">Authenticated Email</label>
              <div className="text-[var(--text-primary)] text-lg font-bold break-all flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[var(--cookd-green)]" />
                {userEmail}
              </div>
            </div>
            
            <div className="bg-[var(--surface-cream)]/50 border border-[var(--border-light)] rounded-2xl p-6">
              <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2">Access Level</label>
              <div className="flex items-center gap-3">
                <div className="px-4 py-1.5 bg-[var(--cookd-orange)]/10 text-[var(--cookd-orange)] rounded-xl text-sm font-bold uppercase tracking-wide border border-[var(--cookd-orange)]/20 shadow-sm">
                  Head Chef / Admin
                </div>
                <Shield size={20} className="text-[var(--cookd-green)]" />
              </div>
            </div>
          </div>
        </div>

        {/* Danger Zone Card */}
        <div className="bg-white border border-red-100 rounded-3xl p-6 sm:p-10 shadow-sm">
          <h2 className="text-2xl font-bold text-red-500 font-display mb-6">Danger Zone</h2>
          <div className="bg-red-50 border border-red-100 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h3 className="text-lg font-bold text-red-600 mb-1">Sign Out</h3>
              <p className="text-sm text-red-500 font-medium opacity-80">
                End your current session and return to the login screen.
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 px-8 py-4 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 active:scale-95 shrink-0"
            >
              <LogOut size={20} />
              Logout Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
