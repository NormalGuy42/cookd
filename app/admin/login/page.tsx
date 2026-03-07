'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Login error:', error);
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/admin');
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-[var(--surface-cream)] flex items-center justify-center px-6 relative overflow-hidden">
      <div className="hero-gradient opacity-20"></div>
      
      <div className="max-w-md w-full relative z-10">
        <div className="bg-white border border-[var(--border-light)] rounded-2xl p-8 shadow-sm">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[var(--text-primary)] font-display mb-2">Admin Login</h1>
            <p className="text-[var(--text-secondary)]">Sign in to access the admin dashboard</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="admin@cookd.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-[var(--surface-cream)]/50 border border-[var(--border-light)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--cookd-orange)] focus:ring-2 focus:ring-[var(--cookd-orange)]/10 transition-all"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-[var(--surface-cream)]/50 border border-[var(--border-light)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--cookd-orange)] focus:ring-2 focus:ring-[var(--cookd-orange)]/10 transition-all"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-500 text-sm font-medium animate-shake">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In to Dashboard'
              )}
            </button>
          </form>
        </div>
        
        <div className="mt-8 text-center">
          <Link href="/" className="text-sm text-[var(--text-muted)] hover:text-[var(--cookd-orange)] transition-colors font-medium">
            ← Back to public site
          </Link>
        </div>
      </div>
    </div>
  );
}

