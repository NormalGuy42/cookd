'use client';

import { Suspense, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Mail, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

function PaymentSuccessContent() {
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [customerEmail, setCustomerEmail] = useState<string | null>(null);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentId = searchParams.get('payment_id');
  const paymentStatus = searchParams.get('status');
  const sessionId = searchParams.get('session_id');
  const supabase = createClient();

  useEffect(() => {
    checkPaymentStatus();
  }, []);

  const checkPaymentStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      setIsLoggedIn(true);
      setCustomerEmail(user.email || null);
    }

    console.log('Payment success params:', { paymentId, paymentStatus, sessionId });
    
    if (paymentId) {
      console.log('Processing payment_id:', paymentId, 'status:', paymentStatus);
      
      if (paymentStatus === 'failed' || paymentStatus === 'cancelled') {
        setPaymentError('Payment was not completed. Please try again.');
        setLoading(false);
        return;
      }
      
      try {
        const response = await fetch('/api/dodo/complete-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentId }),
        });
        
        const data = await response.json();
        console.log('Complete order response:', data);
        
        if (response.ok && data.success) {
          setPaymentComplete(true);
          
          if (data.order?.payer_email) {
            setCustomerEmail(data.order.payer_email);
            setEmail(data.order.payer_email);
          }
          
          if (user) {
            try {
              await fetch('/api/orders/link-by-email', { method: 'POST' });
            } catch (e) {
              console.error('Error linking orders:', e);
            }
          }
        } else {
          console.warn('Complete order API failed:', data.error);
          if (paymentStatus === 'succeeded') {
            setPaymentComplete(true);
          } else {
            setPaymentError(data.error || 'Failed to process payment');
          }
        }
      } catch (e) {
        console.error('Error completing order:', e);
        if (paymentStatus === 'succeeded') {
          setPaymentComplete(true);
        } else {
          setPaymentError('Failed to verify payment. Please contact support.');
        }
      }
      
      setLoading(false);
      return;
    }
    
    if (sessionId) {
      try {
        const response = await fetch(`/api/dodo/session-info?session_id=${encodeURIComponent(sessionId)}`);

        if (response.ok) {
          const data = await response.json();
          console.log('Session info:', data);
          
          if (data.status === 'succeeded' || data.status === 'processing') {
            try {
              const createOrderResponse = await fetch('/api/dodo/create-order-from-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId }),
              });
              
              if (createOrderResponse.ok) {
                const orderData = await createOrderResponse.json();
                console.log('Order created/verified from session:', orderData);
                
                if (orderData.order?.payer_email) {
                  setCustomerEmail(orderData.order.payer_email);
                  setEmail(orderData.order.payer_email);
                }
              } else {
                const errorData = await createOrderResponse.json().catch(() => ({}));
                console.log('Order creation response:', errorData);
              }
            } catch (e) {
              console.error('Error ensuring order exists:', e);
            }
            
            setPaymentComplete(true);
            
            if (!customerEmail && data.customerEmail) {
              setCustomerEmail(data.customerEmail);
              setEmail(data.customerEmail);
            }
            
            if (user) {
              try {
                await fetch('/api/orders/link-by-email', { method: 'POST' });
              } catch (e) {
                console.error('Error linking orders:', e);
              }
            }
          } else if (data.status === 'failed' || data.status === 'cancelled') {
            setPaymentError('Payment was not completed. Please try again.');
          } else if (data.status === 'pending') {
            setPaymentError('Payment was not completed. Please try again.');
          } else {
            console.log('Unknown payment status:', data.status);
            setPaymentComplete(true);
            
            if (data.customerEmail) {
              setCustomerEmail(data.customerEmail);
              setEmail(data.customerEmail);
            }
          }
        } else {
          console.warn('Could not fetch session info');
          setPaymentComplete(true);
        }
      } catch (e) {
        console.error('Error checking payment status:', e);
        setPaymentComplete(true);
      }
      
      setLoading(false);
      return;
    }
    
    if (user) {
      try {
        const { data: recentOrders } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1);
        
        if (recentOrders && recentOrders.length > 0) {
          const recentOrder = recentOrders[0];
          if (recentOrder.status === 'completed') {
            setPaymentComplete(true);
          }
        }
      } catch (e) {
        console.error('Error checking recent orders:', e);
      }
    }
    
    setPaymentComplete(true);
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          setError('An account with this email already exists. Please sign in instead.');
        } else {
          setError(signUpError.message);
        }
        setIsSubmitting(false);
        return;
      }

      if (data.user) {
        await fetch('/api/orders/link-by-email', { method: 'POST' });
        
        if (data.session) {
          router.push('/dashboard');
          router.refresh();
        } else {
          setSuccess('Account created! Please check your email to confirm your account, then sign in.');
        }
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }

    setIsSubmitting(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setIsSubmitting(false);
      return;
    }

    await fetch('/api/orders/link-by-email', { method: 'POST' });
    router.push('/dashboard');
    router.refresh();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--surface-cream)] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-[var(--cookd-orange)]/20 border-t-[var(--cookd-orange)] rounded-full animate-spin mb-4" />
        <p className="text-[var(--text-muted)] font-medium">Verifying your payment...</p>
      </div>
    );
  }

  if (paymentError) {
    return (
      <div className="min-h-screen bg-[var(--surface-cream)] flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <div className="mb-8 flex justify-center">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center">
              <AlertCircle className="text-red-500 w-10 h-10" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-[var(--text-primary)] font-display mb-4">Payment Issue</h1>
          <p className="text-[var(--text-secondary)] mb-8">{paymentError}</p>

          <div className="flex flex-col gap-4">
            <Link href="/#pricing" className="btn-primary inline-flex items-center justify-center gap-2">
              Try Again
              <ArrowRight size={18} />
            </Link>
            <Link href="/" className="btn-secondary">
              Go Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isLoggedIn && paymentComplete) {
    return (
      <div className="min-h-screen bg-[var(--surface-cream)] flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <div className="mb-8 flex justify-center">
            <div className="w-20 h-20 bg-[var(--cookd-green)]/10 rounded-full flex items-center justify-center">
              <CheckCircle className="text-[var(--cookd-green)] w-10 h-10" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-[var(--text-primary)] font-display mb-4">Payment Successful!</h1>
          <p className="text-[var(--text-secondary)] mb-8">
            Thank you for your purchase! Your order has been created and is ready for you.
          </p>

          <Link href="/dashboard" className="btn-primary inline-flex items-center gap-2">
            Go to Dashboard
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--surface-cream)] flex items-center justify-center px-6 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 bg-[var(--cookd-green)]/10 rounded-full flex items-center justify-center">
              <CheckCircle className="text-[var(--cookd-green)] w-10 h-10" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)] font-display mb-2">Payment Successful!</h1>
          <p className="text-[var(--text-secondary)]">
            Create your account to access your order and submit your project idea.
          </p>
        </div>

        <div className="bg-white border border-[var(--border-light)] rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6 p-3 bg-[var(--cookd-orange)]/10 border border-[var(--cookd-orange)]/20 rounded-xl">
            <Mail className="text-[var(--cookd-orange)] flex-shrink-0" size={20} />
            <p className="text-sm text-[var(--text-secondary)]">
              {customerEmail 
                ? `Create an account with ${customerEmail} to access your order.`
                : 'Create an account with the email you used for payment.'}
            </p>
          </div>

          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-[var(--text-primary)] mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-[var(--surface-cream)]/50 border border-[var(--border-light)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--cookd-orange)] transition-colors"
                placeholder="your@email.com"
              />
              {customerEmail && email !== customerEmail && (
                <p className="text-xs text-[var(--cookd-orange)] mt-1 font-medium">
                  Use {customerEmail} to access your order
                </p>
              )}
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-bold text-[var(--text-primary)] mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 bg-[var(--surface-cream)]/50 border border-[var(--border-light)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--cookd-orange)] transition-colors"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-bold text-[var(--text-primary)] mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 bg-[var(--surface-cream)]/50 border border-[var(--border-light)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--cookd-orange)] transition-colors"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl text-sm bg-red-50 border border-red-100 text-red-500">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 rounded-xl text-sm bg-[var(--cookd-green)]/10 border border-[var(--cookd-green)]/20 text-[var(--cookd-green)]">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[var(--border-light)]">
            <p className="text-center text-[var(--text-muted)] text-sm mb-4">
              Already have an account?
            </p>
            <form onSubmit={handleSignIn} className="space-y-3">
              <button
                type="submit"
                disabled={isSubmitting || !email || !password}
                className="w-full btn-secondary disabled:opacity-50"
              >
                Sign In Instead
              </button>
            </form>
          </div>
        </div>

        <p className="text-center text-[var(--text-muted)] text-sm mt-6">
          Your order will be automatically linked to your account.
        </p>
      </div>
    </div>
  );
}

export default function PaymentSuccess() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--surface-cream)] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[var(--cookd-orange)]/20 border-t-[var(--cookd-orange)] rounded-full animate-spin" />
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
