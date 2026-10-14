import { Zap, Gauge, UploadCloud, Sparkles, Users, Layers, ShieldAlert, ChevronLeft, ChevronRight } from 'lucide-react';
import type { ModuleId } from '@/lib/types';

interface ModuleRailProps {
  active: ModuleId;
  onChange: (id: ModuleId) => void;
  expanded: boolean;
  onToggle: () => void;
}

const MODULES: { id: ModuleId; label: string; icon: any; description: string }[] = [
  { id: 'instant', label: 'Instant Lead Scrub', icon: Zap, description: '1-click drop & clean CSV' },
  { id: 'health', label: 'Health Scoreboard', icon: Gauge, description: 'Executive scoreboard & ROI' },
  { id: 'import', label: '1. Magical Import', icon: UploadCloud, description: 'CSV/Excel auto-mapping' },
  { id: 'cleanse', label: '2. Clean & Standardize', icon: Sparkles, description: 'Phone, email, syntax scrub' },
  { id: 'dedupe', label: '3. Merge Duplicates', icon: Users, description: 'Fuzzy match & golden record' },
  { id: 'enrich', label: '4. Enrich & Segment', icon: Layers, description: 'Domain linking & ICP tiers' },
  { id: 'quarantine', label: 'Quarantine Review', icon: ShieldAlert, description: 'Triage blocked records' },
];

export function ModuleRail({ active, onChange, expanded, onToggle }: ModuleRailProps) {
  return (
    <aside
      className={`bg-white border-r border-slate-200 flex flex-col transition-all duration-200 shrink-0 ${
        expanded ? 'w-56' : 'w-16'
      }`}
    >
      <nav className="flex-1 py-3 px-2 space-y-1">
        {MODULES.map((mod) => {
          const Icon = mod.icon;
          const isActive = active === mod.id;
          return (
            <button
              key={mod.id}
              onClick={() => onChange(mod.id)}
              className={`w-full flex items-center gap-3 px-2.5 py-2.5 rounded-lg transition-all group relative ${
                isActive
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
              title={!expanded ? mod.label : undefined}
            >
              <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
              {expanded && (
                <div className="flex flex-col items-start min-w-0">
                  <span className="text-xs font-semibold truncate">{mod.label}</span>
                  <span className={`text-[10px] truncate ${isActive ? 'text-slate-300' : 'text-slate-400'}`}>
                    {mod.description}
                  </span>
                </div>
              )}
              {isActive && !expanded && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-sky-500 rounded-r-full" />
              )}
            </button>
          );
        })}
      </nav>

      <button
        onClick={onToggle}
        className="border-t border-slate-200 py-2.5 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
      >
        {expanded ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>
    </aside>
  );
}
