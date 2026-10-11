import type { Workspace, DataRecord } from '@/lib/types';
import { triageBadge, tagBadge } from '@/lib/badges';
import { ShieldAlert, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

interface QuarantineStewardshipProps {
  workspace: Workspace;
  records: DataRecord[];
  onRowClick: (r: DataRecord) => void;
  onApprove: (id: string) => void;
  onDismiss: (id: string) => void;
}

export function QuarantineStewardship({ workspace: _workspace, records, onRowClick, onApprove, onDismiss }: QuarantineStewardshipProps) {
  const quarantined = records.filter((r) => r.triage_status === 'quarantined');

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-600" />
            Quarantine Stewardship
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {quarantined.length} record{quarantined.length !== 1 ? 's' : ''} need manual review
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs text-slate-500">
            <span className="font-semibold text-amber-600">{quarantined.length}</span> pending
          </div>
        </div>
      </div>

      {quarantined.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <CheckCircle2 className="w-10 h-10 text-emerald-300 mx-auto mb-3" />
          <p className="text-sm text-slate-400">Quarantine is empty. All records passed validation.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quarantined.map((r) => {
            const b = triageBadge(r.triage_status);
            return (
              <div
                key={r.id}
                className="bg-white rounded-xl border border-slate-200 p-4 hover:border-amber-300 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-slate-500">{r.record_id}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${b.bg} ${b.text} ${b.border}`}>
                      {b.label}
                    </span>
                  </div>
                  <span className={`font-mono text-xs font-semibold ${r.health_score >= 50 ? 'text-amber-600' : 'text-rose-600'}`}>
                    {r.health_score.toFixed(0)}/100
                  </span>
                </div>

                <div className="space-y-2 mb-3">
                  <div className="flex items-start gap-2">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase w-16 shrink-0 pt-0.5">Name</span>
                    <span className="text-sm text-slate-700">
                      {r.first_name_clean || r.first_name || '—'} {r.last_name_clean || r.last_name || ''}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase w-16 shrink-0 pt-0.5">Email</span>
                    <span className="text-sm text-slate-700 font-mono break-all">{r.email || r.email_clean || '—'}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase w-16 shrink-0 pt-0.5">Phone</span>
                    <span className="text-sm text-slate-700 font-mono">{r.phone || r.phone_clean || '—'}</span>
                  </div>
                </div>

                {/* Quarantine reason */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3">
                  <p className="text-xs text-amber-800 font-medium">
                    {r.quarantine_reason || 'Flagged during processing'}
                  </p>
                </div>

                {/* Flag tags */}
                {(r.flag_tags || []).length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {r.flag_tags!.map((tag) => {
                      const tb = tagBadge(tag);
                      return (
                        <span key={tag} className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full border ${tb.bg} ${tb.text} ${tb.border}`}>
                          {tb.label}
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => onApprove(r.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors flex-1 justify-center"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                  </button>
                  <button
                    onClick={() => onDismiss(r.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors flex-1 justify-center"
                  >
                    <XCircle className="w-3.5 h-3.5" /> Purge
                  </button>
                  <button
                    onClick={() => onRowClick(r)}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
                  >
                    Details <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
