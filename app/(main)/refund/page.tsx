'use client';

import Link from 'next/link';
import { AlertTriangle, Trophy, Trash2, ArrowLeft, Mail } from 'lucide-react';
import { links } from '@/constants';

export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-[var(--surface-cream)]">
      <main className="max-w-3xl mx-auto px-6 py-20 relative">
        
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--cookd-orange)] transition-colors mb-8 font-medium"
        >
          <ArrowLeft size={18} />
          Back to Home
        </Link>

        <h1 className="text-4xl md:text-5xl font-bold mb-4 font-display text-[var(--text-primary)]">Refund Policy</h1>
        <p className="text-[var(--text-muted)] mb-12 font-medium">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>

        {/* Warning Banner */}
        <div className="bg-[var(--cookd-orange)]/10 border border-[var(--cookd-orange)]/20 rounded-2xl p-6 mb-12 animate-pulse-subtle">
          <div className="flex items-start gap-4">
            <AlertTriangle className="text-[var(--cookd-orange)] flex-shrink-0 mt-1" size={24} />
            <div>
              <h2 className="text-xl font-bold text-[var(--text-primary)] font-display mb-2">Important Notice</h2>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                Please read this policy carefully before making a purchase. Requesting a refund has 
                permanent consequences for your position and project visibility on Cookd.
              </p>
            </div>
          </div>
        </div>

        <section className="space-y-10 text-[var(--text-secondary)] leading-relaxed relative z-10">
          {/* Refund Eligibility */}
          <div className="bg-white border border-[var(--border-light)] rounded-2xl p-8 shadow-sm card-hover">
            <h2 className="text-2xl font-bold text-[var(--text-primary)] font-display mb-4">Refund Eligibility</h2>
            <p className="mb-4 text-lg">
              We offer refunds within <span className="text-[var(--cookd-orange)] font-bold">14 days</span> of 
              purchase for any reason. To request a refund, simply reach out to us with your order details.
            </p>
            <p className="text-[var(--text-muted)] text-sm italic">
              Refunds are processed back to the original payment method within 5-10 business days.
            </p>
          </div>

          {/* Consequences Section */}
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-[var(--text-primary)] font-display flex items-center gap-3">
              <span className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center">
                <AlertTriangle className="text-red-500" size={20} />
              </span>
              Consequences of Refunding
            </h2>
            
            <div className="grid gap-6">
              {/* Hall of Fame Removal */}
              <div className="bg-white border border-[var(--border-light)] rounded-2xl p-8 shadow-sm card-hover">
                <div className="flex flex-col md:flex-row items-start gap-6">
                  <div className="w-14 h-14 bg-[var(--cookd-golden)]/10 rounded-2xl flex items-center justify-center flex-shrink-0 wiggle">
                    <Trophy className="text-[var(--cookd-golden)]" size={30} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[var(--text-primary)] font-display mb-3">
                      Loss of Hall of Fame Position
                    </h3>
                    <p className="text-[var(--text-secondary)]">
                      If you have secured a Hall of Fame position, requesting a refund will 
                      <span className="text-red-500 font-bold"> permanently remove your spot</span>. 
                      Your position will be released and made available for others to claim. 
                      There is no way to recover your original position once released.
                    </p>
                  </div>
                </div>
              </div>

              {/* Project Removal */}
              <div className="bg-white border border-[var(--border-light)] rounded-2xl p-8 shadow-sm card-hover">
                <div className="flex flex-col md:flex-row items-start gap-6">
                  <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center flex-shrink-0 wiggle">
                    <Trash2 className="text-red-500" size={30} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[var(--text-primary)] font-display mb-3">
                      Project Removal
                    </h3>
                    <p className="text-[var(--text-secondary)]">
                      Your project will be <span className="text-red-500 font-bold">completely removed</span> from 
                      Cookd. This includes removal from the Hall of Fame, the projects gallery, 
                      and all public listings. All associated project data will be deleted.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Box */}
          <div className="bg-gradient-to-br from-[var(--cookd-golden)]/10 to-[var(--cookd-orange)]/5 border border-[var(--cookd-golden)]/20 rounded-2xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Trophy size={80} />
            </div>
            <h3 className="text-2xl font-bold text-[var(--cookd-orange)] font-display mb-6">Quick Summary</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-[var(--cookd-orange)] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
                <span className="font-medium">Refunds are available within 14 days of purchase</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
                <span className="font-medium">Refunding = Losing your Hall of Fame position forever</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
                <span className="font-medium">Refunding = Complete removal of your project from Cookd</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-[var(--cookd-golden)] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
                <span className="font-medium">Your position will be opened up for others to claim</span>
              </li>
            </ul>
          </div>

          {/* Contact Section */}
          <div className="bg-white border border-[var(--border-light)] rounded-2xl p-8 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-[var(--cookd-orange)]/10 rounded-xl flex items-center justify-center">
                <Mail className="text-[var(--cookd-orange)]" size={24} />
              </div>
              <h2 className="text-2xl font-bold text-[var(--text-primary)] font-display">How to Request</h2>
            </div>
            <p className="text-[var(--text-secondary)] mb-8 text-lg">
              To request a refund, reach out to us with your order ID and the email associated 
              with your account. We'll process your request within 2-3 business days.
            </p>
            <a 
              href={links["twitter"]} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-[var(--cookd-orange)] text-white px-8 py-4 rounded-xl font-bold hover:bg-[var(--cookd-orange-light)] transition-all shadow-lg shadow-orange-500/20 active:transform active:scale-95"
            >
              Contact @{links["twitter_username"]} on X
            </a>
          </div>
        </section>

        <div className="mt-16 flex flex-col sm:flex-row gap-4 relative z-10">
          <Link href="/" className="btn-primary text-center">
            Back to Home
          </Link>
          <Link href="/hall-of-fame" className="btn-secondary text-center">
            View Hall of Fame
          </Link>
        </div>
      </main>
    </div>
  );
}

