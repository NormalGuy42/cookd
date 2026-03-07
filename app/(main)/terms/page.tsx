'use client';

export default function Terms() {
  return (
    <div className="min-h-screen bg-[var(--surface-cream)]">
      <main className="max-w-3xl mx-auto px-6 py-20 relative">
        
        <h1 className="text-4xl md:text-5xl font-bold mb-4 font-display text-[var(--text-primary)]">Terms & Conditions</h1>
        <p className="text-[var(--text-muted)] mb-12 font-medium">Last updated: {new Date().getFullYear()}</p>

        <section className="space-y-10 text-[var(--text-secondary)] leading-relaxed relative z-10">
          <div className="bg-white border border-[var(--border-light)] rounded-2xl p-8 shadow-sm">
            <p className="text-lg">
              Welcome to Cookd. By accessing or using our platform, you agree to be bound by these terms. Cookd provides a space to bring your creative ideas to life through expert development and showcasing.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4 font-display text-[var(--text-primary)]">Use of Service</h2>
            <ul className="list-disc pl-6 space-y-3">
              <li>You must provide accurate information when submitting ideas.</li>
              <li>Do not submit content that is illegal, harmful, or violates others' rights.</li>
              <li>We reserve the right to refuse any submission that goes against our values of creativity and quality.</li>
              <li>Service delivery timelines are estimates and may vary based on project complexity.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4 font-display text-[var(--text-primary)]">Intellectual Property</h2>
            <p>
              You retain the primary rights to your original ideas. By submitting to Cookd, you grant us the necessary permissions to build, host, and showcase your project on our platform.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4 font-display text-[var(--text-primary)]">Payments & Refunds</h2>
            <p>
              All payments are processed securely. Refund requests are handled according to our separate Refund Policy. Once a project is built and delivered, the service is considered fulfilled.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4 font-display text-[var(--text-primary)]">Limitation of Liability</h2>
            <p>
              Cookd is provided on an "as-is" basis. While we strive for excellence, we are not liable for any indirect or consequential damages arising from the use or inability to use the platform.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4 font-display text-[var(--text-primary)]">Changes to Terms</h2>
            <p>
              We may update these terms from time to time. Your continued use of the platform after changes are posted constitutes your acceptance of the new terms.
            </p>
          </div>
        </section>

        <div className="mt-16">
          <a href="/" className="btn-secondary">Back to Home</a>
        </div>
      </main>
    </div>
  );
}


