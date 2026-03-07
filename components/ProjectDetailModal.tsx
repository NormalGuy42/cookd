'use client';

import { X, ExternalLink, Github, User, ChefHat, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { useEffect } from 'react';

interface ProjectProfile {
  display_name: string | null;
  avatar_url: string | null;
  twitter_url: string | null;
  is_anonymous: boolean;
}

interface Project {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  live_url: string | null;
  github_url: string | null;
  featured: boolean;
  user_id: string | null;
  created_at: string;
  profile?: ProjectProfile | null;
}

interface ProjectDetailModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProjectDetailModal({ project, isOpen, onClose }: ProjectDetailModalProps) {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !project) return null;

  const showProfile = project.profile && !project.profile.is_anonymous;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white border border-[var(--border-light)] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] bg-white/80 rounded-full transition-colors border border-[var(--border-light)]"
        >
          <X size={20} />
        </button>

        {/* Project Image */}
        {project.image_url ? (
          <div className="relative w-full h-64 sm:h-80">
            <Image
              src={project.image_url}
              alt={project.name}
              fill
              className="object-cover rounded-t-2xl"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
          </div>
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-[var(--cookd-orange)]/10 to-[var(--cookd-golden)]/10 rounded-t-2xl flex items-center justify-center">
            <ChefHat size={64} className="text-[var(--cookd-orange)]/20" />
          </div>
        )}

        {/* Content */}
        <div className="p-6 sm:p-8 -mt-12 relative">
          {/* Creator Profile */}
          {showProfile && (
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[var(--surface-cream)] overflow-hidden flex items-center justify-center border-2 border-white shadow-md">
                {project.profile?.avatar_url ? (
                  <img
                    src={project.profile.avatar_url}
                    alt={project.profile.display_name || 'Creator'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="text-[var(--text-muted)] w-5 h-5" />
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[var(--text-secondary)] text-sm font-medium">
                  {project.profile?.display_name || 'Anonymous'}
                </span>
                {project.profile?.twitter_url && (
                  <a
                    href={project.profile.twitter_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--text-muted)] hover:text-[var(--cookd-orange)] transition-colors"
                    title="View Twitter Profile"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Title */}
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-3 font-display">{project.name}</h2>
          
          {/* Description */}
          {project.description && (
            <p className="text-[var(--text-secondary)] mb-6 leading-relaxed">{project.description}</p>
          )}

          {/* Tags/Badges */}
          <div className="flex flex-wrap gap-2 mb-6">
            {project.featured && (
              <span className="px-3 py-1.5 bg-[var(--cookd-golden)]/10 text-[var(--cookd-golden)] text-xs font-medium rounded-full border border-[var(--cookd-golden)]/30 flex items-center gap-1">
                <Sparkles size={12} />
                Featured
              </span>
            )}
            <span className="px-3 py-1.5 bg-[var(--cookd-orange)]/10 text-[var(--cookd-orange)] text-xs rounded-full border border-[var(--cookd-orange)]/20 flex items-center gap-1">
              <ChefHat size={12} />
              Cooked on Cookd
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            {project.live_url && (
              <a
                href={project.live_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary flex-1 flex items-center justify-center gap-2 py-3"
              >
                <ExternalLink size={18} />
                Visit Live Site
              </a>
            )}
            {project.github_url && (
              <a
                href={project.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-inverse flex-1 flex items-center justify-center gap-2 py-3"
              >
                <Github size={18} />
                View Source Code
              </a>
            )}
          </div>

          {/* No links message */}
          {!project.live_url && !project.github_url && (
            <p className="text-[var(--text-muted)] text-center py-4 italic">
              No links available for this project yet.
            </p>
          )}

          {/* Date */}
          <p className="text-[var(--text-muted)] text-xs text-center mt-6">
            Cooked on {new Date(project.created_at).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
