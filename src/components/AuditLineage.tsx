import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Workspace, BatchRun, AuditLogEntry } from '@/lib/types';
import { ScrollText, Undo2, Clock, FileText, Settings, CheckCircle2 } from 'lucide-react';

interface AuditLineageProps {
  workspace: Workspace;
  onRollback: (runId: string) => void;
}

export function AuditLineage({ workspace, onRollback }: AuditLineageProps) {
  const [batches, setBatches] = useState<BatchRun[]>([]);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [workspace.id]);

  const loadData = async () => {
    setLoading(true);
    if (workspace.id === 'demo-sandbox') {
      setBatches([
        {
          id: 'run-demo-sandbox',
          run_id: 'RUN-2026-DEMO-001',
          workspace_id: 'demo-sandbox',
          input_count: 15,
          clean_count: 12,
          quarantined_count: 3,
          duplicate_clusters_count: 1,
          avg_health_score: 84.5,
          sdr_hours_saved: 0.3,
          payroll_saved: 10.5,
          recipe_name: 'Outbound Campaign Sanitizer v2',
          status: 'completed',
          iso_seal: 'SHA-256 a7f92e448b11c902bdf6c1e3894451fa2',
          created_at: new Date(Date.now() - 3600000).toISOString(),
        },
      ]);
      setAuditLog([
        {
          id: 'audit-demo-1',
          workspace_id: 'demo-sandbox',
          action: 'BATCH_CLEANSED',
          actor: 'evaluator@demo.com',
          details: { records_evaluated: 15, status: 'SUCCESS' },
          timestamp: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: 'audit-demo-2',
          workspace_id: 'demo-sandbox',
          action: 'QUARANTINE_ISOLATED',
          actor: 'system_gatekeeper',
          details: { quarantined_count: 3, reason: 'INVALID_DIRECT_DIAL_OR_SYNTAX' },
          timestamp: new Date(Date.now() - 3590000).toISOString(),
        },
      ]);
      setLoading(false);
      return;
    }

    try {
      const [batchRes, auditRes] = await Promise.all([
        supabase
          .from('batch_runs')
          .select('*')
          .eq('workspace_id', workspace.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('audit_log')
          .select('*')
          .eq('workspace_id', workspace.id)
          .order('timestamp', { ascending: false })
          .limit(20),
      ]);
      setBatches(batchRes.data || []);
      setAuditLog(auditRes.data || []);
    } catch (err) {
      console.warn('Audit fetch failed:', err);
    }
    setLoading(false);
  };

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <ScrollText className="w-5 h-5 text-slate-700" />
          Audit & Lineage
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">Immutable ledger with 1-click batch rollback / undo</p>
      </div>

      {/* Batch history */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
          <h3 className="text-sm font-semibold text-slate-900">Batch Run History</h3>
        </div>
        {loading ? (
          <div className="p-8 text-center text-sm text-slate-400">Loading...</div>
        ) : batches.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-400">No batch runs recorded yet.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {batches.map((batch) => (
              <div key={batch.id} className="px-4 py-3 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  batch.status === 'completed' ? 'bg-emerald-50' : batch.status === 'reverted' ? 'bg-slate-100' : 'bg-amber-50'
                }`}>
                  {batch.status === 'completed' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Undo2 className="w-4 h-4 text-slate-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-900 truncate">{batch.filename}</span>
                    <span className="font-mono text-[10px] text-slate-400">{batch.run_id}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(batch.created_at).toLocaleString()}
                    </span>
                    <span>{batch.record_count.toLocaleString()} rows</span>
                    <span className="text-emerald-600 font-medium">{batch.health_score.toFixed(1)}% health</span>
                    <span className="text-amber-600">{batch.quarantined_count} quarantined</span>
                    {batch.status === 'reverted' && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500">
                        REVERTED
                      </span>
                    )}
                  </div>
                </div>
                {batch.status === 'completed' && (
                  <button
                    onClick={() => onRollback(batch.run_id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 rounded-lg transition-colors shrink-0"
                  >
                    <Undo2 className="w-3.5 h-3.5" /> Undo Batch
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Audit ledger */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
          <h3 className="text-sm font-semibold text-slate-900">Immutable Action Ledger</h3>
        </div>
        {auditLog.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-400">No audit entries yet.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {auditLog.map((entry) => {
              const icon = getActionIcon(entry.action);
              const Icon = icon.icon;
              return (
                <div key={entry.id} className="px-4 py-2.5 flex items-center gap-3">
                  <Icon className={`w-3.5 h-3.5 ${icon.color} shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-mono font-semibold text-slate-700">{entry.action}</span>
                    <span className="ml-2 text-xs text-slate-500">{entry.actor}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono shrink-0">
                    {new Date(entry.timestamp).toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function getActionIcon(action: string): { icon: typeof FileText; color: string } {
  if (action.startsWith('BATCH')) return { icon: FileText, color: 'text-sky-500' };
  if (action.startsWith('RECIPE')) return { icon: Settings, color: 'text-violet-500' };
  if (action.startsWith('DEDUP')) return { icon: CheckCircle2, color: 'text-emerald-500' };
  if (action.includes('REVERT')) return { icon: Undo2, color: 'text-rose-500' };
  return { icon: FileText, color: 'text-slate-400' };
}
