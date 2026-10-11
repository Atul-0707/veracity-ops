import { useState, useRef } from 'react';
import { 
  UploadCloud, FileSpreadsheet, CheckCircle2, ArrowRight, Sparkles, 
  AlertCircle, RefreshCw, Layers, Database, Building2, AlertTriangle, 
  RotateCcw, ShieldCheck, Crown, X, BarChart2 
} from 'lucide-react';
import type { Workspace, DataRecord, IngestedBatch } from '@/lib/types';
import { parseUploadedSpreadsheet } from '@/lib/fileParser';
import { 
  saveEphemeralRecords, getInitialSampleRecords, setActiveDatasetName, 
  getActiveDatasetName, isBenchmarkDataset, DEFAULT_DATASET_NAME,
  computeFileHash, commitIngestedBatch, discardActiveBatch, 
  canDiscardBatch, getLatestActiveBatch, getQuotaLedger
} from '@/lib/sessionStore';

interface MagicalImportProps {
  workspace: Workspace;
  records: DataRecord[];
  onRefresh: () => void;
  onNavigateToCleanse: () => void;
}

export function MagicalImport({ workspace, records, onRefresh, onNavigateToCleanse }: MagicalImportProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [notice, setNotice] = useState<string | null>(null);
  const [blockedError, setBlockedError] = useState<{
    fileName: string;
    requestedRows: number;
    remainingQuota: number;
  } | null>(null);

  const datasetName = getActiveDatasetName();
  const isBenchmark = isBenchmarkDataset();
  const latestBatch = getLatestActiveBatch(workspace.id);
  const hasGracePeriod = latestBatch && canDiscardBatch(latestBatch) && !isBenchmark;

  const handleDiscardBatch = () => {
    if (!latestBatch) return;
    if (confirm(`Discard "${latestBatch.filename}" and immediately restore ${latestBatch.row_count.toLocaleString()} rows back to your monthly quota?`)) {
      const res = discardActiveBatch(latestBatch.id, workspace.id);
      if (res.success) {
        const sample = getInitialSampleRecords();
        saveEphemeralRecords(sample);
        setActiveDatasetName(DEFAULT_DATASET_NAME);
        setNotice(`✓ Batch discarded. ${res.refundedRows.toLocaleString()} rows restored to your quota. Available: ${res.remaining.toLocaleString()} rows.`);
        onRefresh();
      }
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(15);
    setBlockedError(null);

    try {
      setUploadProgress(35);
      const fileHash = await computeFileHash(file);
      
      setUploadProgress(65);
      const res = await parseUploadedSpreadsheet(file);
      const rowCount = res.totalOriginalRows || res.processedRows;

      // Pre-Ingestion Gatekeeper Check: Enforce strictly 0 rows on re-upload, or verify headroom
      const commitRes = commitIngestedBatch(file.name, fileHash, rowCount, workspace.id);

      if (!commitRes.success) {
        setBlockedError({
          fileName: file.name,
          requestedRows: rowCount,
          remainingQuota: commitRes.remaining,
        });
        setIsUploading(false);
        if (e.target) e.target.value = '';
        return;
      }

      setUploadProgress(90);
      saveEphemeralRecords(res.records);
      setActiveDatasetName(file.name);

      if (commitRes.isReupload) {
        setNotice(
          `✓ File recognized via SHA-256 fingerprint (${file.name}). Quota consumed: 0 rows (Already metered in active cycle). Available: ${commitRes.remaining.toLocaleString()} rows.`
        );
      } else if (res.domainProfile.profile === 'FINANCIAL_PORTFOLIO') {
        setNotice(
          `✓ Federal Financial Portfolio Ingested (${res.detectedColumnsCount} cols, ${rowCount.toLocaleString()} rows). Quota debited: ${commitRes.quotaConsumed.toLocaleString()} rows. Available: ${commitRes.remaining.toLocaleString()} rows. Entity MDM mode active.`
        );
      } else if (res.wasSliced) {
        setNotice(
          `✓ Dataset Ingested (${rowCount.toLocaleString()} rows). Quota debited: ${commitRes.quotaConsumed.toLocaleString()} rows. Available: ${commitRes.remaining.toLocaleString()} rows. First 500 records loaded for diagnostic audit.`
        );
      } else {
        setNotice(
          `✓ Ingested all ${rowCount.toLocaleString()} records from ${file.name}. Quota debited: ${commitRes.quotaConsumed.toLocaleString()} rows. Available: ${commitRes.remaining.toLocaleString()} rows.`
        );
      }

      setUploadProgress(100);
      setTimeout(() => {
        setIsUploading(false);
        onRefresh();
      }, 300);
    } catch (err: any) {
      console.error('File parsing error:', err);
      alert('Could not parse file. Please upload a valid .csv, .xlsx, or .xls spreadsheet.');
      setIsUploading(false);
    }

    if (e.target) e.target.value = '';
  };

  const handleLoadSample = () => {
    const sample = getInitialSampleRecords();
    saveEphemeralRecords(sample);
    setActiveDatasetName(DEFAULT_DATASET_NAME);
    setNotice('Restored benchmark 15 dirty lead records for evaluation.');
    onRefresh();
  };

  // Inspect sample record mapping from current records
  const sampleRec = records[0];
  const isEntityMode = sampleRec?.entity_type === 'organization' || sampleRec?.dataset_domain === 'FINANCIAL_PORTFOLIO';

  return (
    <div className="p-6 space-y-6 animate-fade-in max-w-6xl mx-auto">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.xlsx,.xls"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">1. Magical Import & Schema Intake</h1>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
              Universal Auto-Mapper
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Drag & drop raw CRM or financial spreadsheets. Ingests datasets of any size, gracefully samples the first 500 rows for live in-browser audit.
          </p>
        </div>

        <button
          onClick={handleLoadSample}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors shadow-2xs"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
          Load Benchmark Sample (15 Rows)
        </button>
      </div>

      {/* Current Dataset Context Banner */}
      <div className={`p-4 rounded-xl border flex items-start justify-between flex-wrap gap-3 ${
        isBenchmark ? 'bg-amber-50/80 border-amber-200 text-amber-900' : 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
      }`}>
        <div className="flex items-start gap-3">
          <Database className={`w-5 h-5 shrink-0 mt-0.5 ${isBenchmark ? 'text-amber-600' : 'text-emerald-600'}`} />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs uppercase tracking-wider">
                {isBenchmark ? 'Currently Loaded: Preloaded Benchmark CRM Sample' : 'Currently Loaded: Custom Uploaded Dataset'}
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-semibold ${
                isBenchmark ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-emerald-100 text-emerald-800 border-emerald-300'
              }`}>
                {records.length} Records Active
              </span>
              {isEntityMode && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-300 font-semibold flex items-center gap-1">
                  <Building2 className="w-3 h-3" /> Entity MDM Mode
                </span>
              )}
            </div>
            <p className="text-xs mt-1 text-slate-600 max-w-2xl leading-relaxed">
              {isBenchmark
                ? 'The portal is pre-populated with a 15-record Dirty CRM Benchmark dataset demonstrating broken phone numbers, disposable emails, lowercase names, and duplicate clusters. Drop your own file below to replace this benchmark with your real data.'
                : `Currently evaluating your uploaded file (${datasetName}). You can re-upload another spreadsheet below or reload the benchmark anytime.`}
            </p>
          </div>
        </div>
      </div>

      {/* 15-Minute Grace Period Refund Banner */}
      {hasGracePeriod && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 flex items-center justify-between flex-wrap gap-3 shadow-xs animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-amber-950 uppercase tracking-wide">
                  Uploaded Wrong File? 15-Minute Discard Grace Period Active
                </span>
                <span className="text-[10px] px-2 py-0.2 rounded-full bg-amber-200 text-amber-900 font-semibold font-mono">
                  {latestBatch?.row_count.toLocaleString()} Rows Refundable
                </span>
              </div>
              <p className="text-xs text-amber-800 mt-0.5">
                Uploaded {latestBatch?.filename}. Discarding this batch will immediately restore {latestBatch?.row_count.toLocaleString()} rows back to your monthly quota.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDiscardBatch}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Discard Batch &amp; Restore Quota
          </button>
        </div>
      )}

      {/* Quota Limit Reached Paywall / Blocker Card */}
      {blockedError && (
        <div className="p-5 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-950 space-y-3 shadow-sm animate-fade-in">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-rose-900">
                  Monthly Row Quota Exceeded ({blockedError.fileName})
                </h3>
                <p className="text-xs text-rose-700 mt-0.5">
                  This file contains <strong>{blockedError.requestedRows.toLocaleString()} rows</strong>, but your plan has only <strong>{blockedError.remainingQuota.toLocaleString()} rows remaining</strong> in this monthly cycle.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setBlockedError(null)}
              className="text-rose-400 hover:text-rose-700 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-3 bg-white/80 rounded-xl border border-rose-200 flex items-center justify-between flex-wrap gap-2 text-xs">
            <div className="text-slate-600">
              <span>Required: <strong className="text-rose-700 font-mono">{blockedError.requestedRows.toLocaleString()} rows</strong></span>
              <span className="mx-2">•</span>
              <span>Available Headroom: <strong className="text-slate-800 font-mono">{blockedError.remainingQuota.toLocaleString()} rows</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => alert("Connecting with Rishita Tripathi (Founder & CEO) to expand your monthly volume bracket or allocate custom batch capacity.")}
                className="px-3.5 py-1.5 bg-rose-700 hover:bg-rose-800 text-white font-bold rounded-lg text-xs shadow-xs transition-all"
              >
                Expand Row Quota ($10 / 2.5k)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notice Banner */}
      {notice && (
        <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200 flex items-start gap-3">
          <Sparkles className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
          <p className="text-xs text-sky-800 font-medium leading-relaxed">{notice}</p>
        </div>
      )}

      {/* Drag & Drop Upload Zone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
          isUploading
            ? 'border-sky-400 bg-sky-50/50'
            : 'border-slate-300 hover:border-sky-500 hover:bg-slate-50/60 bg-white'
        }`}
      >
        <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto mb-4 border border-sky-100 shadow-sm">
          <UploadCloud className="w-7 h-7" />
        </div>

        <h3 className="text-base font-bold text-slate-900 mb-1">
          {isUploading ? 'Parsing & Auto-Mapping Columns...' : 'Drop your CRM or loan spreadsheet here or click to browse'}
        </h3>
        <p className="text-xs text-slate-500 mb-4 max-w-md mx-auto">
          Supports <strong>.csv</strong>, <strong>.xlsx</strong>, and <strong>.xls</strong>. Ingests full database; first 500 records evaluated immediately in memory with zero server retention.
        </p>

        {isUploading ? (
          <div className="max-w-xs mx-auto">
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-sky-500 rounded-full transition-all duration-200"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-2 font-mono">{uploadProgress}% complete</p>
          </div>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg shadow-sm transition-all">
            <FileSpreadsheet className="w-4 h-4" /> Select Spreadsheet File
          </span>
        )}
      </div>

      {/* Auto-Mapping Verification Grid */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">
              {isEntityMode ? 'Entity Master Data Auto-Mapping' : 'CRM Field Auto-Mapping'}
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            Active: {records.length} records ready
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {(isEntityMode ? [
            { label: 'Record / Loan ID', detected: sampleRec?.record_id || '—', mapped: 'record_id' },
            { label: 'Entity / Borrower', detected: sampleRec?.company || sampleRec?.company_clean || '—', mapped: 'company' },
            { label: 'Region / State', detected: sampleRec?.region || '—', mapped: 'region' },
            { label: 'Country', detected: sampleRec?.country || 'US', mapped: 'country' },
            { label: 'JobsReported', detected: 'Excluded (Numeric)', mapped: '[Ignored Guard]' },
            { label: 'Dedup Match Vector', detected: 'Normalized Entity', mapped: 'Multi-Vector' },
          ] : [
            { label: 'First Name', detected: sampleRec?.first_name || '—', mapped: 'first_name' },
            { label: 'Last Name', detected: sampleRec?.last_name || '—', mapped: 'last_name' },
            { label: 'Email', detected: sampleRec?.email || '—', mapped: 'email' },
            { label: 'Phone', detected: sampleRec?.phone || '—', mapped: 'phone' },
            { label: 'Company', detected: sampleRec?.company || '—', mapped: 'company' },
            { label: 'Job Title', detected: sampleRec?.job_title || '—', mapped: 'job_title' },
          ]).map((field) => (
            <div key={field.label} className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                {field.label}
              </span>
              <p className="font-mono text-slate-800 truncate text-[11px]" title={field.detected}>
                {field.detected}
              </p>
              <span className="inline-block mt-2 text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                ✓ {field.mapped}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Flow Continuation Card */}
      <div className="flex items-center justify-between flex-wrap gap-3 p-4 bg-gradient-to-r from-sky-50 to-emerald-50 rounded-xl border border-sky-200">
        <div>
          <h4 className="text-sm font-bold text-slate-900">Ready to Cleanse & Deduplicate?</h4>
          <p className="text-xs text-slate-600 mt-0.5">
            Proceed to Step 2 to inspect side-by-side ghost diffs, or jump directly to Step 3 to review the 39 duplicate clusters.
          </p>
        </div>

        <button
          onClick={onNavigateToCleanse}
          className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-all"
        >
          Proceed to Clean & Standardize <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
