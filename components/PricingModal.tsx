'use client';

import { X, Crown, Award, Trophy, Zap } from 'lucide-react';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  tier: 'premium' | 'standard' | 'hall_of_fame' | 'bare_minimum';
  availability?: boolean | null;
  onCheckout: (tier: 'premium' | 'standard' | 'hall_of_fame' | 'bare_minimum') => void;
  loading?: boolean;
}

export default function PricingModal({
  isOpen,
  onClose,
  tier,
  availability,
  onCheckout,
  loading = false,
}: PricingModalProps) {
  if (!isOpen) return null;

  const getTierData = () => {
    switch (tier) {
      case 'premium':
        return {
          title: 'Premium',
          icon: Crown,
          iconColor: 'text-[var(--cookd-golden)]',
          iconBg: 'bg-[var(--cookd-golden)]/10',
          price: '$300',
          description: 'Hall of Fame position #1',
          badge: '#1 SPOT',
          features: [
            '1 app deployment',
            '#1 Hall of Fame position',
            'Premium design',
            'Premium functionalities',
            'Complete access to code and repo',
            'Priority support',
          ],
          buttonText: 'Claim Position #1',
          borderClass: 'border-2 border-[var(--cookd-golden)]',
        };
      case 'standard':
        return {
          title: 'Standard',
          icon: Award,
          iconColor: 'text-[var(--cookd-golden)]',
          iconBg: 'bg-[var(--cookd-golden)]/10',
          price: '$150',
          description: 'Hall of Fame positions 2-10',
          features: [
            '1 app deployment',
            'Hall of Fame (positions 2-11)',
            'Enhanced design',
            'Premium functionalities',
            'Complete access to code and repo',
            'Support (up to 3 revisions)',
          ],
          buttonText: 'Claim Your Spot',
          borderClass: 'border-2 border-[var(--cookd-golden)]/50',
        };
      case 'hall_of_fame':
        return {
          title: 'Hall of Famer',
          icon: Trophy,
          iconColor: 'text-[var(--cookd-orange)]',
          iconBg: 'bg-[var(--cookd-orange)]/10',
          price: '$75',
          description: 'Hall of Fame positions 11-100',
          features: [
            '1 app deployment',
            'Hall of Fame (positions 12-100)',
            'Enhanced design',
            'Premium functionalities',
            'Complete access to code and repo',
            'Support (up to 3 revisions)',
          ],
          buttonText: 'Claim Your Spot',
          borderClass: 'border border-[var(--border-light)]',
        };
      case 'bare_minimum':
        return {
          title: 'Basic',
          icon: Zap,
          iconColor: 'text-[var(--cookd-orange)]',
          iconBg: 'bg-[var(--cookd-orange)]/10',
          price: '$50',
          description: 'Host 1 app (no Hall of Fame)',
          features: [
            '1 app deployment',
            'Complete access to code and repo',
            'Your idea, brought to life',
          ],
          excludedFeatures: [
            'Hall of Fame placement',
          ],
          buttonText: 'Get Started',
          borderClass: 'border border-[var(--border-light)]',
        };
    }
  };

  const tierData = getTierData();
  const isSoldOut = availability === false;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`bg-white ${tierData.borderClass} rounded-2xl p-8 max-w-[400px] w-full relative shadow-xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
        >
          <X size={24} />
        </button>

        <div className="text-center flex flex-col w-full">
          {tierData.badge && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[var(--cookd-golden)] text-white px-4 py-1.5 rounded-full text-xs font-bold">
              {tierData.badge}
            </div>
          )}
          
          <div className={`w-14 h-14 rounded-2xl ${tierData.iconBg} flex items-center justify-center mx-auto mb-4`}>
            <tierData.icon size={28} className={tierData.iconColor} />
          </div>
          <h3 className="text-2xl font-bold mb-2 text-[var(--text-primary)] font-display">{tierData.title}</h3>
          <div className="text-5xl font-bold text-[var(--cookd-orange)] mb-2">{tierData.price}</div>
          <p className="text-[var(--text-secondary)] mb-6">{tierData.description}</p>
          
          <ul className="text-left space-y-3 mb-8">
            {tierData.features.map((feature, index) => (
              <li key={index} className="text-[var(--text-secondary)] flex items-center gap-2">
                <span className="text-[var(--cookd-green)]">✓</span>
                {feature}
              </li>
            ))}
            {tierData.excludedFeatures?.map((feature, index) => (
              <li key={`excluded-${index}`} className="text-[var(--text-muted)] flex items-center gap-2">
                <span>✗</span>
                {feature}
              </li>
            ))}
          </ul>
          
          {isSoldOut && (
            <p className="text-red-500 text-sm mb-4">
              {tier === 'premium' ? 'Sold out' : 'All spots taken'}
            </p>
          )}
          {!isSoldOut && tier !== 'bare_minimum' && availability === true && (
            <p className="text-[var(--cookd-green)] text-sm mb-4">
              {tier === 'premium'
                ? 'Position #1 available!'
                : tier === 'standard'
                ? 'Positions 2-11 available!'
                : 'Positions 12-100 available!'}
            </p>
          )}
          
          <button
            onClick={() => onCheckout(tier)}
            disabled={loading || isSoldOut}
            className="btn-primary w-full mt-auto disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? 'Loading...'
              : isSoldOut
              ? 'Sold Out'
              : tierData.buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}
