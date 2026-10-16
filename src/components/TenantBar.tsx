import { useState, useEffect } from 'react';
import { RotateCcw, ShieldCheck, Database, Lock, Cpu, CheckCircle2 } from 'lucide-react';
import type { Workspace, Persona } from '@/lib/types';
import { clearEphemeralSession, getActiveDatasetName, isBenchmarkDataset, getEphemeralRecords } from '@/lib/sessionStore';

interface TenantBarProps {
  workspace: Workspace;
  persona: Persona;
  onPersonaChange: (p: Persona) => void;
  onRefresh: () => void;
  onExit?: () => void;
}

export function TenantBar({ workspace: _workspace, persona, onPersonaChange, onRefresh, onExit }: TenantBarProps) {
  const datasetName = getActiveDatasetName();
  const isBenchmark = isBenchmarkDataset();
  const [activeRows, setActiveRows] = useState<number>(() => getEphemeralRecords().length);
  const [showSafetyDetail, setShowSafetyDetail] = useState(false);

  useEffect(() => {
    const handleUpdate = () => {
      setActiveRows(getEphemeralRecords().length);
    };
    window.addEventListener('vrc_quota_updated', handleUpdate);
    return () => window.removeEventListener('vrc_quota_updated', handleUpdate);
  }, []);

  const handleReset = () => {
    if (confirm('Clear temporary in-memory data and reload default sample records? All uploaded records in browser RAM will be wiped immediately.')) {
      clearEphemeralSession();
      setActiveRows(getEphemeralRecords().length);
      onRefresh();
    }
  };

  return (
    <header className="bg-slate-900 text-slate-100 border-b border-slate-800 flex items-center justify-between px-4 h-14 shrink-0 z-20 relative">
      {/* Brand & Safety / Capacity Status */}
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

        {/* Live Safety & Unlimited File Size Badge */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowSafetyDetail(!showSafetyDetail)}
            className="flex items-center gap-2.5 bg-slate-800/90 hover:bg-slate-800 border border-emerald-700/60 px-3 py-1.5 rounded-xl text-left transition-colors cursor-pointer"
            title="Click to inspect Client-Side Safety & Unlimited File Size Architecture"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="flex flex-col">
              <div className="flex items-center gap-2 text-[10px]">
                <span className="text-emerald-300 font-bold tracking-wide">
                  100% Client-Side Safe • Unlimited Rows
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5">
                <span>0 Bytes Uploaded</span>
                <span>•</span>
                <span className="text-sky-300 font-semibold">{activeRows.toLocaleString()} Rows in RAM</span>
              </div>
            </div>
            <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700/70">
              AIR-GAP
            </span>
          </button>

          {/* Safety & Capacity Details Popover */}
          {showSafetyDetail && (
            <div className="absolute top-full left-0 mt-2 w-96 bg-slate-900 border border-slate-700 rounded-2xl p-4 shadow-2xl z-50 text-xs space-y-3 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <span className="font-bold text-white text-xs flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  Safety &amp; Unlimited File Size Guarantee
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
                  0 Bytes Sent
                </span>
              </div>

              <div className="space-y-2.5 text-slate-300 text-[11px] leading-relaxed">
                <div className="p-2.5 rounded-xl bg-slate-800/70 border border-slate-700/70">
                  <div className="font-bold text-emerald-300 flex items-center gap-1.5 mb-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    1. Zero Server Upload (Works Offline)
                  </div>
                  <p className="text-slate-400 text-[10px]">
                    Your CSV/Excel files are parsed and cleaned 100% inside your own browser&apos;s RAM. Zero bytes ever leave your computer—you can even turn off Wi-Fi before dropping a file.
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-800/70 border border-slate-700/70">
                  <div className="font-bold text-sky-300 flex items-center gap-1.5 mb-0.5">
                    <Cpu className="w-3.5 h-3.5" />
                    2. Unlimited File Size &amp; 100% Export
                  </div>
                  <p className="text-slate-400 text-[10px]">
                    No 500-row cap, no 5MB storage limit, and no row restrictions. 100% of your uploaded rows ({activeRows.toLocaleString()} active) are cleaned in non-blocking RAM chunks and exported in full CSV &amp; 7-Tab Excel workbooks.
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-800/70 border border-slate-700/70">
                  <div className="font-bold text-amber-300 flex items-center gap-1.5 mb-0.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    3. Instant Volatile Memory Purge
                  </div>
                  <p className="text-slate-400 text-[10px]">
                    Nothing is saved to disk or cloud databases. Closing this browser tab or clicking Reset immediately destroys all in-memory records.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowSafetyDetail(false)}
                className="w-full py-1.5 text-[11px] font-semibold text-center text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg cursor-pointer transition-colors"
              >
                Close Security &amp; Capacity Details
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
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
          {activeRows.toLocaleString()} rows
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
