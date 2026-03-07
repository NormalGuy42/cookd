'use client';

import { Idea, Category } from '@/types/database';
import { Edit, Trash2 } from 'lucide-react';
import TweetEmbed, { containsTweetUrl } from './TweetEmbed';

interface IdeaCardProps {
  idea: Idea & { categories?: Category | null };
  category: Category | null;
  onEdit: (idea: Idea) => void;
  onDelete: (id: string) => void;
  onStatusChange: (idea: Idea, newStatus: 'plan_to_do' | 'done' | 'dropped') => void;
}

// Remove tweet URL from description for cleaner display
function getCleanDescription(description: string | null): string | null {
  if (!description) return null;
  const urlPattern = /(https?:\/\/(?:twitter\.com|x\.com)\/\w+\/status(?:es)?\/\d+)/gi;
  return description.replace(urlPattern, '').trim() || null;
}

export default function IdeaCard({ idea, category, onEdit, onDelete, onStatusChange }: IdeaCardProps) {
  const tweetUrl = idea.description ? containsTweetUrl(idea.description) : null;
  const cleanDescription = getCleanDescription(idea.description);
  const statusLabels = {
    plan_to_do: 'Plan to do',
    done: 'Done',
    dropped: 'Dropped',
  };

  const statusColors = {
    plan_to_do: 'bg-blue-50 text-blue-600 border-blue-100',
    done: 'bg-[var(--cookd-green)]/10 text-[var(--cookd-green)] border-[var(--cookd-green)]/20',
    dropped: 'bg-red-50 text-red-500 border-red-100',
  };

  return (
    <div className="bg-white border border-[var(--border-light)] rounded-3xl p-8 hover:border-[var(--cookd-orange)]/30 transition-all shadow-sm card-hover flex flex-col h-full group">
      <div className="flex justify-between items-start mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-4">
            {category && (
              <span
                className="inline-block px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider"
                style={{
                  backgroundColor: `${category.color}15`,
                  color: category.color,
                  border: `1px solid ${category.color}25`,
                }}
              >
                {category.name}
              </span>
            )}
            {idea.emoji && (
              <span className="text-2xl bg-[var(--surface-cream)] w-10 h-10 flex items-center justify-center rounded-xl border border-[var(--border-light)]">
                {idea.emoji}
              </span>
            )}
          </div>
          <h3 className="text-xl font-bold text-[var(--text-primary)] font-display mb-3 leading-tight group-hover:text-[var(--cookd-orange)] transition-colors">
            {idea.title}
          </h3>
          {cleanDescription && (
            <p className="text-[var(--text-secondary)] text-sm mb-4 font-medium leading-relaxed">
              {cleanDescription}
            </p>
          )}
          {tweetUrl && (
            <div className="mt-4 rounded-2xl overflow-hidden border border-[var(--border-light)]">
              <TweetEmbed tweetUrl={tweetUrl} />
            </div>
          )}
        </div>
        <div className="flex gap-1 ml-4">
          <button
            onClick={() => onEdit(idea)}
            className="p-2.5 text-[var(--text-muted)] hover:text-[var(--cookd-orange)] hover:bg-[var(--cookd-orange)]/10 rounded-xl transition-all"
            title="Edit"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={() => onDelete(idea.id)}
            className="p-2.5 text-[var(--text-muted)] hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
            title="Delete"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
      
      <div className="mt-auto pt-6 border-t border-[var(--border-light)] flex items-center justify-between">
        <select
          value={idea.status}
          onChange={(e) => onStatusChange(idea, e.target.value as 'plan_to_do' | 'done' | 'dropped')}
          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border shadow-sm transition-all focus:outline-none cursor-pointer ${statusColors[idea.status]}`}
        >
          <option value="plan_to_do">Plan to do</option>
          <option value="done">Done</option>
          <option value="dropped">Dropped</option>
        </select>
        <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">
          {new Date(idea.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
      </div>
    </div>
  );
}

