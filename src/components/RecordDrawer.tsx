import type { DataRecord } from '@/lib/types';
import { triageBadge, tagBadge } from '@/lib/badges';
import { X, GitBranch, AlertTriangle, FileText } from 'lucide-react';

interface RecordDrawerProps {
  record: DataRecord;
  onClose: () => void;
}

export function RecordDrawer({ record, onClose }: RecordDrawerProps) {
  const b = triageBadge(record.triage_status);

  const fields: { label: string; raw: string | null; clean: string | null }[] = [
    { label: 'First Name', raw: record.first_name, clean: record.first_name_clean },
    { label: 'Last Name', raw: record.last_name, clean: record.last_name_clean },
    { label: 'Email', raw: record.email, clean: record.email_clean },
    { label: 'Phone', raw: record.phone, clean: record.phone_clean },
    { label: 'Company', raw: record.company, clean: record.company_clean },
    { label: 'Job Title', raw: record.job_title, clean: record.job_title_clean },
    { label: 'Country', raw: record.country, clean: record.country },
    { label: 'Region', raw: record.region, clean: record.region },
  ];

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/30 z-40 animate-fade-in" onClick={onClose} />
      <div className="fixed right-0 top-14 bottom-0 w-[420px] bg-white shadow-2xl z-50 overflow-auto scrollbar-thin animate-slide-in-right">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-5 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-semibold text-slate-900">{record.record_id}</span>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${b.bg} ${b.text} ${b.border}`}>
              {b.label}
            </span>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Lineage */}
          <section>
            <h4 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <GitBranch className="w-3.5 h-3.5" /> Record Lineage
            </h4>
            <div className="space-y-1.5">
              {(record.flag_tags || []).map((tag) => {
                const tb = tagBadge(tag);
                return (
                  <div key={tag} className="flex items-center gap-2 text-xs">
                    <span className={`font-semibold px-2 py-0.5 rounded-full border ${tb.bg} ${tb.text} ${tb.border} text-[10px]`}>
                      {tb.label}
                    </span>
                    <span className="text-slate-400 font-mono">RULE_{tag} at {new Date().toUTCString().slice(17, 25)} UTC</span>
                  </div>
                );
              })}
              {(!record.flag_tags || record.flag_tags.length === 0) && (
                <p className="text-xs text-slate-400">No transformations applied.</p>
              )}
            </div>
          </section>

          {/* Field comparison */}
          <section>
            <h4 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Field Values</h4>
            <div className="space-y-2">
              {fields.map((f) => {
                const changed = f.raw !== f.clean && f.raw && f.clean;
                return (
                  <div key={f.label} className="flex flex-col gap-0.5 py-1.5 border-b border-slate-50 last:border-0">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase">{f.label}</span>
                    {changed ? (
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs diff-strike text-rose-500 font-mono">{f.raw}</span>
                        <span className="text-xs text-emerald-700 font-mono font-medium">{f.clean}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-700 font-mono">{f.clean || f.raw || '—'}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Health score */}
          <section>
            <h4 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Health Score</h4>
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-full border-4 border-slate-100 flex items-center justify-center relative">
                <svg className="absolute inset-0 -rotate-90" viewBox="0 0 64 64">
                  <circle
                    cx="32" cy="32" r="28"
                    fill="none"
                    strokeWidth="4"
                    stroke={record.health_score >= 80 ? '#10b981' : record.health_score >= 50 ? '#f59e0b' : '#f43f5e'}
                    strokeDasharray={`${(record.health_score / 100) * 176} 176`}
                    strokeLinecap="round"
                  />
                </svg>
                <span className={`text-sm font-bold font-mono ${record.health_score >= 80 ? 'text-emerald-600' : record.health_score >= 50 ? 'text-amber-600' : 'text-rose-600'}`}>
                  {record.health_score.toFixed(0)}
                </span>
              </div>
              <div>
                <p className="text-xs text-slate-600">
                  {record.health_score >= 80
                    ? 'High quality record — ready for CRM import'
                    : record.health_score >= 50
                    ? 'Moderate quality — review recommended'
                    : 'Low quality — quarantine recommended'}
                </p>
              </div>
            </div>
          </section>

          {/* Quarantine reason */}
          {record.quarantine_reason && (
            <section className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-amber-900">Quarantine Reason</p>
                  <p className="text-xs text-amber-700 mt-0.5">{record.quarantine_reason}</p>
                </div>
              </div>
            </section>
          )}

          {/* Dedup score */}
          {record.is_duplicate && (
            <section className="bg-violet-50 border border-violet-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <FileText className="w-4 h-4 text-violet-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-violet-900">Duplicate Candidate</p>
                  <p className="text-xs text-violet-700 mt-0.5">This record has been flagged as a potential duplicate. Review in the Merge Duplicates module.</p>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
