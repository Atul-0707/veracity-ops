import { supabase } from '@/lib/supabase';
import type { Workspace, DataRecord } from '@/lib/types';
import { updateEphemeralRecord } from '@/lib/sessionStore';
import { groupRecordsIntoClusters } from '@/lib/engine';
import { Users, ShieldCheck, Archive, Building2, Mail, PhoneCall } from 'lucide-react';

interface DedupMatrixProps {
  workspace: Workspace;
  records: DataRecord[];
  onRefresh: () => void;
}

export function DedupMatrix({ workspace: _workspace, records, onRefresh }: DedupMatrixProps) {
  // Use the engine's unified multi-vector cluster grouping
  const clusters = groupRecordsIntoClusters(records);

  const handlePickWinner = async (winnerId: string, loserIds: string[]) => {
    if (_workspace.id === 'demo-sandbox') {
      updateEphemeralRecord(winnerId, { triage_status: 'verified' });
      loserIds.forEach((id) => {
        updateEphemeralRecord(id, {
          triage_status: 'quarantined',
          quarantine_reason: 'Merged into golden record (Duplicate survivor chosen)',
        });
      });
      onRefresh();
      return;
    }

    try {
      await supabase
        .from('records')
        .update({ triage_status: 'verified' })
        .eq('id', winnerId);

      await supabase
        .from('records')
        .update({
          triage_status: 'quarantined',
          quarantine_reason: 'Merged into golden record (Duplicate survivor chosen)',
        })
        .in('id', loserIds);

      await supabase.from('audit_log').insert({
        workspace_id: _workspace.id,
        action: 'DEDUP_MERGED',
        actor: 'portal@client',
        details: { winner: winnerId, merged: loserIds },
      });
    } catch (e) {
      console.warn('Dedup merge failed:', e);
    }

    onRefresh();
  };

  const getVectorBadge = (matchType: 'email' | 'phone_lastname' | 'entity') => {
    switch (matchType) {
      case 'entity':
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Building2 className="w-3 h-3" /> Entity / Borrower Match
          </span>
        );
      case 'email':
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
            <Mail className="w-3 h-3" /> Direct Email Match
          </span>
        );
      case 'phone_lastname':
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <PhoneCall className="w-3 h-3" /> Phone + Last Name Match
          </span>
        );
    }
  };

  return (
    <div className="p-6 space-y-5 animate-fade-in max-w-6xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Users className="w-5 h-5 text-slate-700" />
          3. Merge Duplicates Studio
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Multi-vector cross-record deduplication with Golden Record survivorship —{' '}
          <strong className="text-slate-700 font-semibold">{clusters.length} duplicate cluster{clusters.length !== 1 ? 's' : ''}</strong> detected in batch
        </p>
      </div>

      {clusters.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs">
          <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-700">No duplicate clusters found.</p>
          <p className="text-xs text-slate-400 mt-1">Upload an enterprise CRM or financial dataset in Tab 1 to run automated cross-vector deduplication.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {clusters.slice(0, 150).map((cluster, ci) => {
            const displayCluster = cluster.records.slice(0, 2);

            return (
              <div
                key={cluster.clusterId || ci}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:border-slate-300 transition-all"
              >
                {/* Cluster Header */}
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-200 text-slate-700">
                      Cluster #{ci + 1}
                    </span>
                    <span className="text-sm font-bold text-slate-900">
                      {cluster.clusterName}
                    </span>
                    <span className="text-xs text-slate-400">
                      ({cluster.records.length} duplicate records)
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {getVectorBadge(cluster.matchType)}
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-200">
                      {cluster.matchScore.toFixed(1)}% Match Confidence
                    </span>
                  </div>
                </div>

                {/* Side-by-side comparison table */}
                <div className="grid grid-cols-[140px_1fr_1fr] border-b border-slate-100 bg-slate-50/50">
                  <div className="px-3 py-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-r border-slate-200">
                    Field
                  </div>
                  {displayCluster.map((rec, ri) => (
                    <div
                      key={rec.id}
                      className="px-3 py-2 text-[11px] font-bold text-slate-700 uppercase tracking-wider border-r border-slate-200 last:border-r-0"
                    >
                      Record {String.fromCharCode(65 + ri)} — {rec.record_id}
                    </div>
                  ))}
                </div>

                {/* Record ID / Loan Number */}
                <div className="grid grid-cols-[140px_1fr_1fr] border-b border-slate-100">
                  <div className="px-3 py-2 text-xs font-medium text-slate-500 border-r border-slate-200 bg-slate-50/30">
                    Record / Loan ID
                  </div>
                  {displayCluster.map((rec) => (
                    <div key={rec.id} className="px-3 py-2 text-xs font-mono font-semibold text-slate-900 border-r border-slate-200 last:border-r-0">
                      {rec.record_id}
                    </div>
                  ))}
                </div>

                {/* Company / Borrower Name */}
                <div className="grid grid-cols-[140px_1fr_1fr] border-b border-slate-100">
                  <div className="px-3 py-2 text-xs font-medium text-slate-500 border-r border-slate-200 bg-slate-50/30">
                    Entity / Borrower
                  </div>
                  {displayCluster.map((rec) => (
                    <div key={rec.id} className="px-3 py-2 text-xs font-semibold text-slate-800 border-r border-slate-200 last:border-r-0">
                      {rec.company_clean || rec.company || '—'}
                    </div>
                  ))}
                </div>

                {/* Contact Name (if applicable) */}
                <div className="grid grid-cols-[140px_1fr_1fr] border-b border-slate-100">
                  <div className="px-3 py-2 text-xs font-medium text-slate-500 border-r border-slate-200 bg-slate-50/30">
                    Contact Name
                  </div>
                  {displayCluster.map((rec) => {
                    const name = `${rec.first_name_clean || ''} ${rec.last_name_clean || ''}`.trim();
                    return (
                      <div key={rec.id} className="px-3 py-2 text-xs text-slate-600 border-r border-slate-200 last:border-r-0">
                        {name || <span className="text-slate-400 italic">None (Corporate Entity)</span>}
                      </div>
                    );
                  })}
                </div>

                {/* Email Address */}
                <div className="grid grid-cols-[140px_1fr_1fr] border-b border-slate-100">
                  <div className="px-3 py-2 text-xs font-medium text-slate-500 border-r border-slate-200 bg-slate-50/30">
                    Email
                  </div>
                  {displayCluster.map((rec) => (
                    <div key={rec.id} className="px-3 py-2 text-xs text-slate-600 font-mono border-r border-slate-200 last:border-r-0">
                      {rec.email_clean || rec.email || <span className="text-slate-400 italic">N/A</span>}
                    </div>
                  ))}
                </div>

                {/* Phone */}
                <div className="grid grid-cols-[140px_1fr_1fr] border-b border-slate-100">
                  <div className="px-3 py-2 text-xs font-medium text-slate-500 border-r border-slate-200 bg-slate-50/30">
                    Phone
                  </div>
                  {displayCluster.map((rec) => (
                    <div key={rec.id} className="px-3 py-2 text-xs text-slate-600 font-mono border-r border-slate-200 last:border-r-0">
                      {rec.phone_clean || rec.phone || <span className="text-slate-400 italic">N/A</span>}
                    </div>
                  ))}
                </div>

                {/* State / Region */}
                <div className="grid grid-cols-[140px_1fr_1fr] border-b border-slate-100">
                  <div className="px-3 py-2 text-xs font-medium text-slate-500 border-r border-slate-200 bg-slate-50/30">
                    Region / State
                  </div>
                  {displayCluster.map((rec) => (
                    <div key={rec.id} className="px-3 py-2 text-xs text-slate-700 border-r border-slate-200 last:border-r-0">
                      {rec.region || '—'}
                    </div>
                  ))}
                </div>

                {/* Golden Record Selection Action Buttons */}
                <div className="px-4 py-3 flex items-center gap-3 bg-slate-50/70 flex-wrap">
                  {displayCluster.map((rec, ri) => (
                    <button
                      key={rec.id}
                      onClick={() =>
                        handlePickWinner(
                          rec.id,
                          cluster.records.filter((r) => r.id !== rec.id).map((r) => r.id)
                        )
                      }
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-800 bg-white border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-800 rounded-lg transition-colors shadow-2xs"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Pick Record {String.fromCharCode(65 + ri)} ({rec.record_id}) as Golden Record
                    </button>
                  ))}
                  <div className="flex-1" />
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Archive className="w-3 h-3 text-slate-400" /> Subordinate duplicates quarantined automatically
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
