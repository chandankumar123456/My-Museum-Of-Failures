import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function getExhibitIdDisplay(id: string): string {
  return `#${id.slice(0, 8).toUpperCase()}`;
}

export function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    startup_failure: 'Startup Failure',
    academic_collapse: 'Academic Collapse',
    relationship_failure: 'Relationship Failure',
    burnout: 'Burnout',
    career_regret: 'Career Regret',
    missed_opportunity: 'Missed Opportunity',
    financial_mistake: 'Financial Mistake',
    family_conflict: 'Family Conflict',
    creative_failure: 'Creative Failure',
    identity_crisis: 'Identity Crisis',
    mental_exhaustion: 'Mental Exhaustion',
    failed_side_project: 'Failed Side Project',
    interview_rejection: 'Interview Rejection',
    betrayal: 'Betrayal',
    unrealized_dream: 'Unrealized Dream',
  };
  return labels[category] || category;
}

export function getEndingStatusColor(status: string): string {
  const colors: Record<string, string> = {
    destroyed_me: 'text-red-400',
    changed_me: 'text-amber-400',
    still_defining_me: 'text-blue-400',
    made_me_stronger: 'text-emerald-400',
    still_unresolved: 'text-purple-400',
  };
  return colors[status] || 'text-whisper';
}

export function getReactionIcon(reaction: string): string {
  const icons: Record<string, string> = {
    i_relate: '🤝',
    i_survived_this_too: '💪',
    still_recovering: '❤️‍🩹',
    this_hurt: '💔',
    you_were_brave: '🕯️',
    i_understand: '👁️',
  };
  return icons[reaction] || '·';
}
