'use client';

import { links } from "@/constants";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[var(--surface-cream)]">
      <main className="max-w-3xl mx-auto px-6 py-20 relative">
        
        <h1 className="text-4xl md:text-5xl font-bold mb-4 font-display text-[var(--text-primary)]">Privacy Policy</h1>
        <p className="text-[var(--text-muted)] mb-12 font-medium">Last updated: {new Date().getFullYear()}</p>

        <section className="space-y-10 text-[var(--text-secondary)] leading-relaxed relative z-10">
          <div className="bg-white border border-[var(--border-light)] rounded-2xl p-8 shadow-sm">
            <p className="text-lg">
              Cookd is a platform dedicated to celebrating human creativity. We value your privacy and aim to keep data collection to a minimum. When you submit an idea or contact us, we store only what's necessary to provide our services and communicate with you.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4 font-display text-[var(--text-primary)]">Information We Collect</h2>
            <ul className="list-disc pl-6 space-y-3">
              <li>Contact information you provide (e.g., email address, social media handles)</li>
              <li>Project details and idea submissions</li>
              <li>Payment information (processed securely via our payment providers)</li>
              <li>Basic analytics to help us improve the platform</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4 font-display text-[var(--text-primary)]">How We Use Information</h2>
            <ul className="list-disc pl-6 space-y-3">
              <li>To review and build your project ideas</li>
              <li>To communicate regarding your submissions and support</li>
              <li>To showcase your projects on the platform</li>
              <li>To maintain and improve the Cookd experience</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4 font-display text-[var(--text-primary)]">Data Sharing</h2>
            <p>
              We do not sell your personal data. Your information is shared only with essential third-party service providers (like hosting and payment processing) necessary to run the platform.
            </p>
          </div>

          <div className="bg-white border border-[var(--border-light)] rounded-2xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold mb-4 font-display text-[var(--text-primary)]">Contact</h2>
            <p className="mb-6">Questions about your privacy? We're happy to help.</p>
            <a 
              href={links["twitter"]} 
              target="_blank" 
              className="inline-flex items-center gap-2 text-[var(--cookd-orange)] font-bold hover:underline"
            >
              Reach out on X @{links["twitter"]}
            </a>
          </div>
        </section>

        <div className="mt-16">
          <a href="/" className="btn-secondary">Back to Home</a>
        </div>
      </main>
    </div>
  );
}


