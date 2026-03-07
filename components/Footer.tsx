import { links } from "@/constants";
import Link from "next/link";

export default function Footer(){
    return(
        <footer className="py-20 px-6 border-t border-[var(--border-light)] bg-[var(--surface-cream)]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between gap-10 md:gap-16">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl font-bold text-[var(--text-primary)] font-display">Cookd</span>
              </div>
              <p className="text-[var(--text-secondary)] text-sm max-w-md mb-6">
                Where great ideas get cooked. A platform celebrating human creativity and ingenuity.
              </p>
              <div className="flex items-center gap-3">
                <Link 
                  href={links["twitter"]} 
                  className="p-2.5 rounded-xl border border-[var(--border-light)] hover:border-[var(--cookd-orange)] hover:bg-[var(--cookd-orange)]/5 transition-all" 
                  target="_blank"
                  aria-label="Twitter"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--text-secondary)" className="hover:fill-[var(--cookd-orange)]">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </Link>
                <Link 
                  href={links["discord"]} 
                  className="p-2.5 rounded-xl border border-[var(--border-light)] hover:border-[var(--cookd-orange)] hover:bg-[var(--cookd-orange)]/5 transition-all" 
                  target="_blank"
                  aria-label="Discord"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--text-secondary)">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                  </svg>
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-sm">
              <div>
                <div className="text-[var(--text-primary)] font-semibold mb-4">Explore</div>
                <ul className="space-y-3 text-[var(--text-secondary)]">
                  <li><Link href="/projects" className="hover:text-[var(--cookd-orange)] transition-colors underline-draw">Creations</Link></li>
                  <li><Link href="/blog" className="hover:text-[var(--cookd-orange)] transition-colors underline-draw">Blog</Link></li>
                  <li><Link href="/hall-of-fame" className="hover:text-[var(--cookd-orange)] transition-colors underline-draw">Hall of Fame</Link></li>
                </ul>
              </div>
              <div>
                <div className="text-[var(--text-primary)] font-semibold mb-4">Connect</div>
                <ul className="space-y-3 text-[var(--text-secondary)]">
                  <li><Link href="/#about" className="hover:text-[var(--cookd-orange)] transition-colors underline-draw">About</Link></li>
                  <li><Link href={links["twitter"]} className="hover:text-[var(--cookd-orange)] transition-colors underline-draw">Contact</Link></li>
                </ul>
              </div>
              <div>
                <div className="text-[var(--text-primary)] font-semibold mb-4">Legal</div>
                <ul className="space-y-3 text-[var(--text-secondary)]">
                  <li><Link href="/privacy" className="hover:text-[var(--cookd-orange)] transition-colors underline-draw">Privacy</Link></li>
                  <li><Link href="/terms" className="hover:text-[var(--cookd-orange)] transition-colors underline-draw">Terms</Link></li>
                  <li><Link href="/refund" className="hover:text-[var(--cookd-orange)] transition-colors underline-draw">Refund Policy</Link></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-[var(--border-light)] text-sm text-[var(--text-muted)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>© {new Date().getFullYear()} Cookd. All rights reserved.</div>
            <div className="flex items-center gap-2">
              <span>Cooked with care by <a href={links["twitter"]} target="_blank" rel="noopener noreferrer" className="underline hover:text-[var(--cookd-orange)] transition-colors">Madiou</a></span>
            </div>
          </div>
        </div>
      </footer>
    )
}