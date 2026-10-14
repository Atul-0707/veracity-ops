import React, { useState, useMemo } from 'react';
import type { DataRecord, Workspace } from '@/lib/types';
import { downloadCleanedCSV, downloadCleanedMasterExcel } from '@/lib/exportExcel';
import { parseUploadedSpreadsheet } from '@/lib/fileParser';
import { saveEphemeralRecords } from '@/lib/sessionStore';
import {
  UploadCloud,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Users,
  Phone,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Search,
  Filter,
} from 'lucide-react';

interface InstantScrubProps {
  workspace: Workspace;
  records: DataRecord[];
  onRefresh: () => void;
  onRowClick?: (record: DataRecord) => void;
  onNavigateToStudio?: (tabId: string) => void;
}

export function InstantScrub({
  workspace,
  records,
  onRefresh,
  onRowClick,
  onNavigateToStudio,
}: InstantScrubProps) {
  const [filter, setFilter] = useState<'all' | 'clean' | 'duplicates' | 'quarantined'>('all');
  const [search, setSearch] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [batchNotice, setBatchNotice] = useState<{
    filename: string;
    totalRows: number;
    processedRows: number;
    wasSliced: boolean;
  } | null>(null);

  // Computed metrics
  const cleanRecords = useMemo(
    () => records.filter((r) => (r.triage_status === 'clean' || r.triage_status === 'verified') && !r.is_subordinate),
    [records]
  );
  const duplicateRecords = useMemo(() => records.filter((r) => r.is_duplicate), [records]);
  const quarantinedRecords = useMemo(
    () => records.filter((r) => r.triage_status === 'quarantined' && !r.is_subordinate),
    [records]
  );
  const phoneNormalizedCount = useMemo(
    () =>
      records.filter(
        (r) =>
          (r.phone_clean || r.phone) &&
          ((r.phone_clean || r.phone)!.startsWith('+1') ||
            (r.phone_clean || r.phone)!.startsWith('+44') ||
            (r.phone_clean || r.phone)!.startsWith('+91'))
      ).length,
    [records]
  );

  // Filtered rows for diff table
  const displayedRecords = useMemo(() => {
    return records
      .filter((r) => {
        if (filter === 'clean') return (r.triage_status === 'clean' || r.triage_status === 'verified') && !r.is_subordinate;
        if (filter === 'duplicates') return r.is_duplicate;
        if (filter === 'quarantined') return r.triage_status === 'quarantined' && !r.is_subordinate;
        return true;
      })
      .filter((r) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
          (r.first_name_clean || r.first_name || '').toLowerCase().includes(q) ||
          (r.last_name_clean || r.last_name || '').toLowerCase().includes(q) ||
          (r.email_clean || r.email || '').toLowerCase().includes(q) ||
          (r.company_clean || r.company || '').toLowerCase().includes(q) ||
          (r.phone_clean || r.phone || '').toLowerCase().includes(q)
        );
      });
  }, [records, filter, search]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processUploadedFile(file);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await processUploadedFile(file);
    }
  };

  const processUploadedFile = async (file: File) => {
    setIsProcessing(true);
    try {
      const result = await parseUploadedSpreadsheet(file);
      if (result.records.length > 0) {
        saveEphemeralRecords(result.records);
        if (result.wasSliced) {
          setBatchNotice({
            filename: file.name,
            totalRows: result.totalOriginalRows,
            processedRows: result.processedRows,
            wasSliced: true,
          });
        } else {
          setBatchNotice(null);
        }
        onRefresh();
      }
    } catch (err: any) {
      alert(`Error parsing file: ${err.message || err}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Top Banner / Headline */}
      <div className="bg-white p-7 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 border border-primary-200 text-primary-800 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-primary-600" />
            Zero-Config Outbound &amp; CRM Hygiene
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
            1-Click Lead Scrub &amp; Golden Record Diff
          </h1>
          <p className="mt-1 text-sm text-slate-600 max-w-2xl">
            Drop any chaotic Apollo, LinkedIn, or trade show export. Our deterministic engine merges duplicates, standardizes international phones to E.164, and purges syntax errors in seconds.
          </p>
        </div>

        {/* 1-Click Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => downloadCleanedCSV(records, `${workspace.slug}_clean_leads.csv`)}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Download Clean CSV
          </button>
          <button
            type="button"
            onClick={() => downloadCleanedMasterExcel(records, workspace.company_name)}
            className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 text-xs font-bold transition shadow-2xs cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            Export 7-Tab Excel
          </button>
        </div>
      </div>

      {/* Drag & Drop File Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all bg-white ${
          isDragging
            ? 'border-primary-500 bg-primary-50/40 shadow-md'
            : 'border-slate-300 hover:border-slate-400'
        }`}
      >
        <input
          type="file"
          id="instant-file-input"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileUpload}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="max-w-md mx-auto space-y-3 pointer-events-none">
          <div className="w-14 h-14 rounded-2xl bg-primary-50 border border-primary-100 text-primary-600 flex items-center justify-center mx-auto shadow-2xs">
            {isProcessing ? (
              <Sparkles className="w-7 h-7 animate-spin text-primary-600" />
            ) : (
              <UploadCloud className="w-7 h-7 text-primary-600" />
            )}
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {isProcessing ? 'Processing & Cleaning File in RAM...' : 'Drop your messy CSV or Excel file here'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Supports Apollo, ZoomInfo, Clay, LinkedIn Scrapers, and Salesforce/HubSpot exports.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-md text-[11px] font-medium text-slate-600">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            100% In-Memory Execution · Zero Persistent PII Storage
          </div>
        </div>
      </div>

      {/* Enterprise Volume Notification Banner */}
      {batchNotice && batchNotice.wasSliced && (
        <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200/90 flex items-start gap-3.5 shadow-2xs animate-fade-in">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-2">
              <span>Enterprise Dataset Detected</span>
              <span className="font-mono bg-amber-200/70 text-amber-900 px-2 py-0.5 rounded text-[11px]">
                {batchNotice.totalRows.toLocaleString()} rows in {batchNotice.filename}
              </span>
            </div>
            <p className="text-xs text-amber-800 leading-relaxed">
              To protect browser memory and maintain zero-latency responsiveness, our in-memory engine loaded an interactive <strong>{batchNotice.processedRows}-record pre-flight diagnostic sample</strong>. Full {batchNotice.totalRows.toLocaleString()}-record production batch jobs execute headless via our Python DuckDB REST API / n8n webhook queue.
            </p>
          </div>
        </div>
      )}

      {/* 4 Outcome Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
            <span>Approved Clean Leads</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">
            {cleanRecords.length.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">
            Ready for instant Smartlead &amp; HubSpot sync
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
            <span>Duplicates Merged</span>
            <Users className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-amber-600 font-mono">
            {duplicateRecords.length.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Preserved credits &amp; golden record synthesized
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
            <span>Phones Standardized</span>
            <Phone className="w-4 h-4 text-primary-600" />
          </div>
          <div className="text-2xl font-extrabold text-primary-700 font-mono">
            {phoneNormalizedCount.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Normalized to E.164 (+1, +44, +91)
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
            <span>Quarantined / Syntax Flags</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-extrabold text-rose-600 font-mono">
            {quarantinedRecords.length.toLocaleString()}
          </div>
          <div className="text-[11px] text-rose-600 font-semibold mt-1">
            Defanged to protect domain reputation
          </div>
        </div>
      </div>

      {/* Interactive Cleanse Diff Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Controls */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-semibold w-full sm:w-auto overflow-x-auto">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition ${
                filter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Records ({records.length})
            </button>
            <button
              onClick={() => setFilter('clean')}
              className={`px-3 py-1.5 rounded-lg transition ${
                filter === 'clean' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Clean &amp; Verified ({cleanRecords.length})
            </button>
            <button
              onClick={() => setFilter('duplicates')}
              className={`px-3 py-1.5 rounded-lg transition ${
                filter === 'duplicates' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Duplicate Clusters ({duplicateRecords.length})
            </button>
            <button
              onClick={() => setFilter('quarantined')}
              className={`px-3 py-1.5 rounded-lg transition ${
                filter === 'quarantined' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Quarantine ({quarantinedRecords.length})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search leads, domains..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Table Body */}
        <div className="overflow-x-auto max-h-[500px] scrollbar-thin">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50/80 sticky top-0 border-b border-slate-200 text-slate-600 uppercase font-bold text-[10px] tracking-wider z-10">
              <tr>
                <th className="py-3 px-4">Contact &amp; Title</th>
                <th className="py-3 px-4">Standardized Email</th>
                <th className="py-3 px-4">E.164 Phone</th>
                <th className="py-3 px-4">Company Entity</th>
                <th className="py-3 px-4">Disposition Status</th>
                <th className="py-3 px-4">Automated Hygiene Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedRecords.slice(0, 50).map((r) => {
                const isClean = r.triage_status === 'clean' || r.triage_status === 'verified';
                const isDedupe = r.is_duplicate;
                const isQuarantine = r.triage_status === 'quarantined';

                return (
                  <tr
                    key={r.id || r.record_id}
                    onClick={() => onRowClick && onRowClick(r)}
                    className="hover:bg-slate-50/80 transition cursor-pointer"
                  >
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">
                        {r.first_name_clean || r.first_name} {r.last_name_clean || r.last_name}
                      </div>
                      <div className="text-[11px] text-slate-500">{r.job_title_clean || r.job_title || 'Executive'}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-700">
                      {r.email_clean || r.email || '—'}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px]">
                      {r.phone_clean || r.phone ? (
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 font-semibold">
                          {r.phone_clean || r.phone}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">
                      {r.company_clean || r.company}
                      {r.domain && <span className="block text-[10px] text-slate-400 font-mono">{r.domain}</span>}
                    </td>
                    <td className="py-3 px-4">
                      {r.is_golden_master && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <Sparkles className="w-3 h-3" />
                          GOLDEN MASTER
                        </span>
                      )}
                      {!r.is_golden_master && !r.is_subordinate && isClean && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          CLEAN
                        </span>
                      )}
                      {r.is_subordinate && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <Users className="w-3 h-3" />
                          MERGED DUP
                        </span>
                      )}
                      {isQuarantine && !r.is_subordinate && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <AlertTriangle className="w-3 h-3" />
                          QUARANTINE
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-[11px] text-slate-600">
                      {r.is_golden_master
                        ? 'Golden Record Synthesized (Cross-Source Coalesced)'
                        : r.is_subordinate
                        ? r.quarantine_reason || 'Merged into Golden Record (Attribution preserved)'
                        : isQuarantine
                        ? r.quarantine_reason || 'Flagged for syntax review'
                        : 'Phone E.164 verified • Syntax validated'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {displayedRecords.length > 50 && (
          <div className="py-2.5 px-4 bg-slate-50 border-t border-slate-100 text-center text-xs text-slate-500">
            Showing first 50 records of {displayedRecords.length} records. Download the Clean CSV to access the full dataset.
          </div>
        )}
      </div>

      {/* Deep Control Navigation Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-primary-950 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div>
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Need deep manual rule control or custom tie-breakers?
          </h4>
          <p className="text-xs text-slate-300 mt-0.5">
            You can access our granular Cleanse Studio, Deduplication Matrix, and Quarantine Stewardship anytime using the left sidebar.
          </p>
        </div>
        <button
          onClick={() => onNavigateToStudio && onNavigateToStudio('cleanse')}
          className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold text-white transition shrink-0 flex items-center gap-1.5 cursor-pointer"
        >
          Open Cleanse Studio
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
