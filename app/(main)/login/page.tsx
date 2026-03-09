'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Mail, Lock, ArrowRight, UserPlus, LogIn } from 'lucide-react';
import Image from 'next/image';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        setError(error.message);
        setLoading(false);
      } else {
        setError('Check your email to confirm your account!');
        setLoading(false);
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        setLoading(false);
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    }
  };

  return (
    <div className="min-h-screen bg-[var(--surface-cream)] flex items-center justify-center px-6 py-12">
      <div className="max-w-md w-full">
        

        {/* Card */}
        <div className="bg-white border border-[var(--border-light)] rounded-3xl p-8 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
              isSignUp 
                ? 'bg-[var(--cookd-green)]/10' 
                : 'bg-[var(--cookd-orange)]/10'
            }`}>
              {isSignUp ? (
                <UserPlus className="text-[var(--cookd-green)]" size={24} />
              ) : (
                <LogIn className="text-[var(--cookd-orange)]" size={24} />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--text-primary)] font-display">
                {isSignUp ? 'Create Account' : 'Welcome Back'}
              </h1>
              <p className="text-[var(--text-muted)] text-sm">
                {isSignUp 
                  ? 'Sign up to manage your projects' 
                  : 'Sign in to your dashboard'}
              </p>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-[var(--text-primary)] mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full pl-12 pr-4 py-3 bg-[var(--surface-cream)]/50 border border-[var(--border-light)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--cookd-orange)] focus:ring-2 focus:ring-[var(--cookd-orange)]/10 transition-all"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-bold text-[var(--text-primary)] mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3 bg-[var(--surface-cream)]/50 border border-[var(--border-light)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--cookd-orange)] focus:ring-2 focus:ring-[var(--cookd-orange)]/10 transition-all"
                />
              </div>
            </div>

            {error && (
              <div className={`p-4 rounded-xl text-sm flex items-start gap-3 ${
                error.includes('Check your email') 
                  ? 'bg-[var(--cookd-green)]/10 border border-[var(--cookd-green)]/20 text-[var(--cookd-green)]'
                  : 'bg-red-50 border border-red-100 text-red-500'
              }`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  error.includes('Check your email') ? 'bg-[var(--cookd-green)]/20' : 'bg-red-100'
                }`}>
                  {error.includes('Check your email') ? '✓' : '!'}
                </div>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  {isSignUp ? 'Creating account...' : 'Signing in...'}
                </>
              ) : (
                <>
                  {isSignUp ? 'Create Account' : 'Sign In'}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[var(--border-light)]">
            <p className="text-center text-[var(--text-muted)] text-sm mb-3">
              {isSignUp 
                ? 'Already have an account?' 
                : "Don't have an account?"}
            </p>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
              }}
              className="w-full btn-secondary py-3"
            >
              {isSignUp ? 'Sign In Instead' : 'Create Account'}
            </button>
          </div>
        </div>

        {/* Footer Link */}
        <p className="text-center text-[var(--text-muted)] text-sm mt-6">
          <Link href="/" className="hover:text-[var(--cookd-orange)] transition-colors">
            ← Back to Home
          </Link>
        </p>
      </div>
    </div>
  );
}
