import { FileSpreadsheet, Gauge, UploadCloud, CheckCheck, Users, Layers, ShieldAlert, ChevronLeft, ChevronRight } from 'lucide-react';
import type { ModuleId } from '@/lib/types';

interface ModuleRailProps {
  active: ModuleId;
  onChange: (id: ModuleId) => void;
  expanded: boolean;
  onToggle: () => void;
}

interface NavItem {
  id: ModuleId;
  label: string;
  icon: any;
  description: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'EXPRESS WORKSPACE',
    items: [
      { id: 'instant', label: 'Instant Lead Scrub', icon: FileSpreadsheet, description: '1-click drop & clean CSV' },
      { id: 'health', label: 'Health Scoreboard', icon: Gauge, description: 'Executive scoreboard & ROI' },
    ],
  },
  {
    title: '4-STEP PIPELINE',
    items: [
      { id: 'import', label: '1. Schema & Field Mapper', icon: UploadCloud, description: 'CSV/Excel auto-mapping' },
      { id: 'cleanse', label: '2. Clean & Standardize', icon: CheckCheck, description: 'Phone, email, syntax scrub' },
      { id: 'dedupe', label: '3. Merge Duplicates', icon: Users, description: 'Fuzzy match & golden record' },
      { id: 'enrich', label: '4. Enrich & Segment', icon: Layers, description: 'Domain linking & ICP tiers' },
    ],
  },
  {
    title: 'GOVERNANCE',
    items: [
      { id: 'quarantine', label: 'Quarantine Review', icon: ShieldAlert, description: 'Triage blocked records' },
    ],
  },
];

export function ModuleRail({ active, onChange, expanded, onToggle }: ModuleRailProps) {
  return (
    <aside
      className={`bg-white border-r border-slate-200 flex flex-col transition-all duration-200 shrink-0 ${
        expanded ? 'w-56' : 'w-16'
      }`}
    >
      <nav className="flex-1 py-3 px-2 space-y-3 overflow-y-auto">
        {NAV_SECTIONS.map((section, sIdx) => (
          <div key={section.title} className="space-y-1">
            {expanded ? (
              <div className="px-2 pt-1 pb-1 text-[9px] font-bold text-slate-400 tracking-wider uppercase">
                {section.title}
              </div>
            ) : sIdx > 0 ? (
              <div className="my-1.5 border-t border-slate-100" />
            ) : null}

            {section.items.map((mod) => {
              const Icon = mod.icon;
              const isActive = active === mod.id;
              return (
                <button
                  key={mod.id}
                  onClick={() => onChange(mod.id)}
                  className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-lg transition-all group relative cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                  title={!expanded ? mod.label : undefined}
                >
                  <Icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
                  {expanded && (
                    <div className="flex flex-col items-start min-w-0">
                      <span className="text-xs font-semibold truncate">{mod.label}</span>
                      <span className={`text-[10px] truncate ${isActive ? 'text-slate-300' : 'text-slate-400'}`}>
                        {mod.description}
                      </span>
                    </div>
                  )}
                  {isActive && !expanded && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-7 bg-sky-500 rounded-r-full" />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      <button
        onClick={onToggle}
        className="border-t border-slate-200 py-2.5 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
        title={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
      >
        {expanded ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>
    </aside>
  );
}
