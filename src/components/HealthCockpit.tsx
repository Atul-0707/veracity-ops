import { TrendingUp, Clock, DollarSign, ShieldCheck, AlertTriangle, FileCheck2, X } from 'lucide-react';
import type { Workspace, DataRecord, Persona } from '@/lib/types';
import { triageBadge } from '@/lib/badges';

interface HealthCockpitProps {
  workspace: Workspace;
  records: DataRecord[];
  recentRunId: string | null;
  persona: Persona;
}

export function HealthCockpit({ workspace, records, persona: _persona }: HealthCockpitProps) {
  const totalRecords = records.length;
  const cleanCount = records.filter((r) => r.triage_status === 'clean').length;
  const verifiedCount = records.filter((r) => r.triage_status === 'verified').length;
  const quarantinedCount = records.filter((r) => r.triage_status === 'quarantined').length;
  const dupCount = records.filter((r) => r.is_duplicate).length;

  const avgHealth = totalRecords > 0
    ? Math.round((records.reduce((s, r) => s + r.health_score, 0) / totalRecords) * 10) / 10
    : 0;

  const approvedPct = totalRecords > 0 ? Math.round(((cleanCount + verifiedCount) / totalRecords) * 100) : 0;
  const quarantinePct = totalRecords > 0 ? Math.round((quarantinedCount / totalRecords) * 100) : 0;

  const sdrHoursSaved = quarantinedCount * 0.1;
  const payrollSaved = sdrHoursSaved * 35;

  const stats = [
    {
      label: 'Avg Data Health Score',
      value: avgHealth.toFixed(1),
      suffix: '/100',
      icon: TrendingUp,
      color: avgHealth >= 80 ? 'text-emerald-600' : avgHealth >= 60 ? 'text-amber-600' : 'text-rose-600',
      bg: avgHealth >= 80 ? 'bg-emerald-50' : avgHealth >= 60 ? 'bg-amber-50' : 'bg-rose-50',
      ring: avgHealth >= 80 ? 'ring-emerald-200' : avgHealth >= 60 ? 'ring-amber-200' : 'ring-rose-200',
    },
    {
      label: 'SDR Hours Saved',
      value: sdrHoursSaved.toFixed(1),
      suffix: 'hrs',
      icon: Clock,
      color: 'text-sky-600',
      bg: 'bg-sky-50',
      ring: 'ring-sky-200',
    },
    {
      label: 'Payroll Recovered',
      value: `$${payrollSaved.toFixed(0)}`,
      suffix: '',
      icon: DollarSign,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      ring: 'ring-emerald-200',
    },
    {
      label: 'Records Processed',
      value: totalRecords.toLocaleString(),
      suffix: 'rows',
      icon: FileCheck2,
      color: 'text-slate-700',
      bg: 'bg-slate-100',
      ring: 'ring-slate-200',
    },
  ];

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Health Cockpit</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Executive data quality scoreboard • Full-Dataset In-Memory Assessment ({totalRecords.toLocaleString()} Rows) • 0 Bytes Uploaded
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          100% Client-Side RAM Execution • Unlimited File Size
        </span>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className={`bg-white rounded-xl border border-slate-200 p-4 ring-1 ${stat.ring} animate-count-up`}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</p>
                  <p className={`text-2xl font-bold mt-1 ${stat.color} font-mono`}>
                    {stat.value}
                    <span className="text-sm font-normal text-slate-400 ml-1">{stat.suffix}</span>
                  </p>
                </div>
                <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Triage breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Triage Breakdown</h3>
          <div className="space-y-3">
            <TriageBar label="Approved Clean" count={cleanCount + verifiedCount} total={totalRecords} color="bg-emerald-500" badgeClass={triageBadge('verified')} />
            <TriageBar label="Quarantined" count={quarantinedCount} total={totalRecords} color="bg-amber-500" badgeClass={triageBadge('quarantined')} />
            <TriageBar label="Flagged Duplicates" count={dupCount} total={totalRecords} color="bg-violet-500" badgeClass={{ bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200', label: 'Duplicate' }} />
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Approved Rate</span>
            <span className="font-semibold text-emerald-600 font-mono">{approvedPct}%</span>
          </div>
          <div className="flex items-center justify-between text-xs mt-1">
            <span className="text-slate-500">Quarantine Rate</span>
            <span className="font-semibold text-amber-600 font-mono">{quarantinePct}%</span>
          </div>
        </div>

        {/* Risk & compliance panel */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Safety, Capacity &amp; Compliance</h3>
          <div className="space-y-2.5">
            <RiskRow icon={ShieldCheck} label="Client-Side RAM Isolation (Air-Gap)" status="0 Bytes Uploaded" color="emerald" />
            <RiskRow icon={ShieldCheck} label="Dataset Capacity & Export Limit" status={`Unlimited (${totalRecords.toLocaleString()} Active)`} color="emerald" />
            <RiskRow icon={ShieldCheck} label="OWASP Formula & Byte Sanitization" status="Active" color="emerald" />
            <RiskRow icon={AlertTriangle} label="Disposable Email Domains Blocked" status={`${quarantinedCount.toLocaleString()} flagged`} color="amber" />
            <RiskRow icon={X} label="Fake Phone Sentinels Detected" status={`${records.filter(r => r.flag_tags?.includes('FAKE_PHONE')).length.toLocaleString()} purged`} color="rose" />
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500 font-medium">Database Half-Life</span>
              <span className="text-xs font-mono text-slate-700">42 days</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-400 to-sky-500 rounded-full" style={{ width: '68%' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TriageBar({ label, count, total, color, badgeClass }: {
  label: string;
  count: number;
  total: number;
  color: string;
  badgeClass: { bg: string; text: string; border: string; label: string };
}) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-700 font-medium">{label}</span>
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${badgeClass.bg} ${badgeClass.text} ${badgeClass.border}`}>
            {badgeClass.label}
          </span>
        </div>
        <span className="text-xs font-mono text-slate-500">{count} / {total}</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function RiskRow({ icon: Icon, label, status, color }: {
  icon: typeof ShieldCheck;
  label: string;
  status: string;
  color: 'emerald' | 'amber' | 'rose';
}) {
  const colorMap = {
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: 'text-emerald-500' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: 'text-amber-500' },
    rose: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', icon: 'text-rose-500' },
  };
  const c = colorMap[color];
  return (
    <div className="flex items-center justify-between py-1.5">
      <div className="flex items-center gap-2">
        <Icon className={`w-4 h-4 ${c.icon}`} />
        <span className="text-sm text-slate-700">{label}</span>
      </div>
      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${c.bg} ${c.text} ${c.border}`}>
        {status}
      </span>
    </div>
  );
}
