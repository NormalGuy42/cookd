'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Menu } from 'lucide-react';

interface AdminNavbarProps {
  onMenuClick: () => void;
}

export default function AdminNavbar({ onMenuClick }: AdminNavbarProps) {
  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-[var(--border-light)]">
      <div className="flex items-center h-16 px-4">
        {/* Hamburger Menu - visible on mobile */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 mr-2 text-[var(--text-secondary)] hover:text-[var(--cookd-orange)] hover:bg-[var(--surface-cream)] rounded-lg transition-colors"
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>

        {/* Logo and Title */}
        <Link href="/admin" className="flex items-center gap-3">
          <span className="relative h-9 w-9 overflow-hidden rounded-xl">
            <img
              src="/cookd-logo.png"
              alt="Cookd logo"
              className="object-contain h-[38px] w-[38px]"
            />
          </span>
          <span className="text-xl font-bold text-[var(--text-primary)] font-display">Cookd</span>
          <span className="hidden sm:inline-block px-2.5 py-1 text-xs font-semibold bg-[var(--cookd-orange)]/10 text-[var(--cookd-orange)] rounded-full">
            Admin
          </span>
        </Link>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Back to Site Link */}
        <Link
          href="/"
          className="text-sm text-[var(--text-secondary)] hover:text-[var(--cookd-orange)] transition-colors"
        >
          ← Back to site
        </Link>
      </div>
    </nav>
  );
}
