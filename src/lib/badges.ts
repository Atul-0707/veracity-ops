import type { TriageStatus } from './types';

interface BadgeClasses {
  bg: string;
  text: string;
  border: string;
  label: string;
}

export function triageBadge(status: TriageStatus): BadgeClasses {
  switch (status) {
    case 'verified':
      return {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        label: 'Verified',
      };
    case 'clean':
      return {
        bg: 'bg-sky-50',
        text: 'text-sky-700',
        border: 'border-sky-200',
        label: 'Cleaned',
      };
    case 'quarantined':
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        label: 'Quarantined',
      };
  }
}

export function tagBadge(tag: string): BadgeClasses {
  const tagMap: Record<string, BadgeClasses> = {
    FORMATTED: { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200', label: 'Formatted' },
    VERIFIED: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Verified' },
    DUPLICATE: { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200', label: 'Duplicate' },
    FAKE_PHONE: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', label: 'Fake Phone' },
    DISPOSABLE_EMAIL: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', label: 'Disposable Email' },
    INVALID_EMAIL: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'Invalid Email' },
    MISSING_NAME: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'Missing Name' },
    MISSING_EMAIL: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'Missing Email' },
    UNVERIFIED_DOMAIN: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', label: 'Unverified Domain' },
    MOJIBAKE_REPAIR: { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200', label: 'Mojibake Repair' },
    DEFANGED_EMAIL: { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200', label: 'Defanged Email' },
    SHORT_PHONE: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', label: 'Short Phone' },
    SEMANTIC_TYPE_VIOLATION: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', label: 'Semantic Violation' },
    ENTITY_MATCH: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', label: 'Entity Match' },
  };
  return tagMap[tag] || { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200', label: tag };
}

export function statusBadge(status: 'active' | 'suspended' | 'trial'): BadgeClasses {
  switch (status) {
    case 'active':
      return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'ACTIVE' };
    case 'suspended':
      return { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', label: 'SUSPENDED' };
    case 'trial':
      return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'TRIAL' };
  }
}
