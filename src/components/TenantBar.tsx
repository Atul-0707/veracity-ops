import { useState, useEffect } from 'react';
import { Activity, Sparkles, RotateCcw, Shield, Home, Database, BarChart2, Layers } from 'lucide-react';
import type { Workspace, Persona, QuotaLedger } from '@/lib/types';
import { clearEphemeralSession, getActiveDatasetName, isBenchmarkDataset, getQuotaLedger } from '@/lib/sessionStore';

interface TenantBarProps {
  workspace: Workspace;
  persona: Persona;
  onPersonaChange: (p: Persona) => void;
  onRefresh: () => void;
  onExit?: () => void;
}

export function TenantBar({ workspace, persona, onPersonaChange, onRefresh, onExit }: TenantBarProps) {
  const datasetName = getActiveDatasetName();
  const isBenchmark = isBenchmarkDataset();
  const [ledger, setLedger] = useState<QuotaLedger>(() => getQuotaLedger(workspace.id));
  const [showQuotaDetail, setShowQuotaDetail] = useState(false);

  useEffect(() => {
    const handleUpdate = () => {
      setLedger(getQuotaLedger(workspace.id));
    };
    window.addEventListener('vrc_quota_updated', handleUpdate);
    return () => window.removeEventListener('vrc_quota_updated', handleUpdate);
  }, [workspace.id]);

  const handleReset = () => {
    if (confirm('Clear temporary sandbox data and reload default sample records? All your uploaded test records and quota ledger will be reset.')) {
      clearEphemeralSession();
      setLedger(getQuotaLedger(workspace.id));
      onRefresh();
    }
  };

  const usedPct = Math.min(100, Math.round((ledger.quotaUsed / Math.max(1, ledger.monthlyLimit)) * 100));

  return (
    <header className="bg-slate-900 text-slate-100 border-b border-slate-800 flex items-center justify-between px-4 h-14 shrink-0 z-20 relative">
      {/* Brand & Sandbox Identity */}
      <div className="flex items-center gap-3 min-w-0">
        <div
          onClick={onExit}
          className="flex items-center gap-2 cursor-pointer group"
          title="Veracity Home"
        >
          <img
            src="/logo.png"
            alt="Veracity Logo"
            className="w-8 h-8 rounded-lg object-contain bg-white p-1 border border-slate-700 shadow-sm shrink-0 group-hover:border-sky-500 transition-colors"
          />
          <span className="font-semibold text-sm tracking-tight text-white hidden sm:inline">Veracity Data Intelligence</span>
        </div>

        <div className="w-px h-5 bg-slate-800 hidden sm:block" />

        {/* Live Interactive Quota Meter */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowQuotaDetail(!showQuotaDetail)}
            className="flex items-center gap-2 bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 px-2.5 py-1 rounded-xl text-left transition-colors cursor-pointer"
            title="Click to view detailed monthly row quota ledger"
          >
            <div className="flex flex-col">
              <div className="flex items-center justify-between gap-3 text-[10px]">
                <span className="text-slate-400 font-medium flex items-center gap-1">
                  <BarChart2 className="w-3 h-3 text-sky-400" />
                  Monthly Quota:
                </span>
                <span className={`font-mono font-bold ${
                  ledger.quotaRemaining === 0 ? 'text-rose-400' : usedPct >= 80 ? 'text-amber-300' : 'text-sky-300'
                }`}>
                  {ledger.quotaUsed.toLocaleString()} / {ledger.monthlyLimit.toLocaleString()} Rows
                </span>
              </div>
              <div className="w-32 sm:w-40 h-1.5 bg-slate-700/80 rounded-full overflow-hidden mt-0.5">
                <div
                  className={`h-full transition-all duration-300 ${
                    ledger.quotaRemaining === 0 ? 'bg-rose-500' : usedPct >= 80 ? 'bg-amber-400' : 'bg-sky-500'
                  }`}
                  style={{ width: `${usedPct}%` }}
                />
              </div>
            </div>
            <span className="text-[9px] font-mono font-semibold px-1 py-0.2 rounded bg-slate-700 text-slate-300 border border-slate-600">
              {usedPct}%
            </span>
          </button>

          {/* Quota Details Popover */}
          {showQuotaDetail && (
            <div className="absolute top-full left-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-2xl p-4 shadow-2xl z-50 text-xs space-y-3 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-white text-xs">Monthly Row Quota Ledger</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800 font-mono">
                  {ledger.quotaRemaining.toLocaleString()} Rows Available
                </span>
              </div>

              <div className="space-y-1.5 text-slate-300 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">Monthly Entitlement:</span>
                  <span className="font-mono text-white font-semibold">{ledger.monthlyLimit.toLocaleString()} rows</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Metered Ingestion:</span>
                  <span className="font-mono text-amber-300 font-semibold">{ledger.quotaUsed.toLocaleString()} rows</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Active Metered Batches:</span>
                  <span className="font-mono text-sky-300 font-semibold">{ledger.batches.length} file(s)</span>
                </div>
              </div>

              {ledger.batches.length > 0 && (
                <div className="pt-2 border-t border-slate-800 space-y-1 max-h-32 overflow-y-auto">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Metered Ingestions:</span>
                  {ledger.batches.map((b) => (
                    <div key={b.id} className="p-1.5 rounded bg-slate-800/60 border border-slate-700/60 flex items-center justify-between text-[10px]">
                      <span className="truncate max-w-[150px] text-slate-300 font-medium" title={b.filename}>{b.filename}</span>
                      <span className="font-mono text-emerald-400">{b.row_count.toLocaleString()} rows</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="p-2 rounded-lg bg-sky-950/60 border border-sky-800/60 text-[10px] text-sky-300 leading-relaxed">
                🛡️ <strong>Invariant Guarantee:</strong> Re-exporting, cleansing, or deduplicating active files consumes <strong>0 rows</strong>. Quota is only metered for new files.
              </div>

              <button
                type="button"
                onClick={() => setShowQuotaDetail(false)}
                className="w-full py-1 text-[11px] text-center text-slate-400 hover:text-white bg-slate-800 rounded-lg cursor-pointer"
              >
                Close Ledger
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Active Dataset Indicator Banner - Streamlined Institutional Pill */}
      <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-800/60 border border-slate-700/60 text-[11px] text-slate-300">
        <Database className="w-3.5 h-3.5 text-sky-400 shrink-0" />
        <span className="text-slate-400">File:</span>
        <span className="font-mono text-slate-200 font-medium">
          {datasetName}
        </span>
        {isBenchmark && (
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 font-sans border border-slate-600">
            Sample
          </span>
        )}
      </div>

      {/* Right Action Controls: Persona Toggle, Refresh, Reset */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Executive / Data Ops Persona Switcher */}
        <div className="flex items-center bg-slate-800/90 border border-slate-700/80 rounded-lg p-0.5">
          <button
            onClick={() => onPersonaChange('executive')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
              persona === 'executive' ? 'bg-sky-600 text-white font-semibold shadow-xs' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Executive Boardroom Scoreboard (CRO / CFO Focus)"
          >
            Executive
          </button>
          <button
            onClick={() => onPersonaChange('ops')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
              persona === 'ops' ? 'bg-sky-600 text-white font-semibold shadow-xs' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Technical Data Ops Grid (High Density Ghost Diffs)"
          >
            Data Ops
          </button>
        </div>

        {/* Unified Refresh & Reset Group */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onRefresh}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 rounded-lg transition-colors cursor-pointer"
            title="Re-evaluate active records"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleReset}
            className="px-2.5 py-1.5 text-xs font-medium text-slate-400 hover:text-rose-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-rose-900/40 rounded-lg transition-colors cursor-pointer"
            title="Clear temporary sandbox data and reload default sample benchmark"
          >
            Reset
          </button>
        </div>
      </div>
    </header>
  );
}
