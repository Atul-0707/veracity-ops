import { useState, useRef } from 'react';
import { 
  UploadCloud, FileSpreadsheet, CheckCircle2, ArrowRight, 
  RefreshCw, Database, Building2, ShieldCheck, Lock, Cpu 
} from 'lucide-react';
import type { Workspace, DataRecord } from '@/lib/types';
import { parseUploadedSpreadsheet } from '@/lib/fileParser';
import { 
  saveEphemeralRecords, getInitialSampleRecords, setActiveDatasetName, 
  getActiveDatasetName, isBenchmarkDataset, DEFAULT_DATASET_NAME
} from '@/lib/sessionStore';

interface MagicalImportProps {
  workspace: Workspace;
  records: DataRecord[];
  onRefresh: () => void;
  onNavigateToCleanse: () => void;
}

export function MagicalImport({ workspace: _workspace, records, onRefresh, onNavigateToCleanse }: MagicalImportProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [notice, setNotice] = useState<string | null>(null);

  const datasetName = getActiveDatasetName();
  const isBenchmark = isBenchmarkDataset();
  const duplicateClusterCount = records.filter((r) => r.is_golden_master).length || records.filter((r) => r.is_duplicate).length;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(20);

    try {
      setUploadProgress(55);
      const res = await parseUploadedSpreadsheet(file);
      const rowCount = res.totalOriginalRows || res.processedRows;

      setUploadProgress(85);
      saveEphemeralRecords(res.records);
      setActiveDatasetName(file.name);

      if (res.domainProfile.profile === 'FINANCIAL_PORTFOLIO') {
        setNotice(
          `Financial / Entity Dataset Ingested (${res.detectedColumnsCount} columns, ${rowCount.toLocaleString()} rows). 100% processed in local browser RAM with 0 bytes uploaded to any server. Entity MDM mode active.`
        );
      } else {
        setNotice(
          `Ingested and cleaned all ${rowCount.toLocaleString()} records from ${file.name} in local browser RAM (0 bytes uploaded to any server). Ready for full CSV & 7-Tab Excel export.`
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
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-slate-900">1. Schema Intake &amp; Field Auto-Mapper</h1>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
              Universal Auto-Mapper
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Unlimited Rows • 0 Bytes Uploaded
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Drag &amp; drop raw CRM or financial spreadsheets of any size. Processes 100% of your dataset directly inside local browser RAM with zero server upload.
          </p>
        </div>

        <button
          onClick={handleLoadSample}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors shadow-2xs cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
          Load Benchmark Sample (15 Rows)
        </button>
      </div>

      {/* Safety & Unlimited File Size Guarantee Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl bg-white border border-emerald-200/90 shadow-2xs flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">100% Client-Side Safe (0 Bytes Uploaded)</div>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
              Your file never leaves your computer. All parsing and cleaning happen in local browser RAM—even works with Wi-Fi turned off.
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-sky-200/90 shadow-2xs flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 border border-sky-100">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">Unlimited File Size (No 500-Row Cap)</div>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
              Processes 100% of rows in non-blocking memory chunks. Every single record is cleaned and included in your CSV &amp; 7-Tab Excel exports.
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-indigo-200/90 shadow-2xs flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">Universal Hygiene &amp; Instant RAM Purge</div>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
              Country-aware E.164 phones, brand-safe casing (eBay, iPhone, SaaS), O(1) dedup clustering, and zero disk storage when you close the tab.
            </p>
          </div>
        </div>
      </div>

      {/* Current Dataset Context Banner */}
      <div className={`p-4 rounded-xl border flex items-start justify-between flex-wrap gap-3 ${
        isBenchmark ? 'bg-amber-50/80 border-amber-200 text-amber-900' : 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
      }`}>
        <div className="flex items-start gap-3">
          <Database className={`w-5 h-5 shrink-0 mt-0.5 ${isBenchmark ? 'text-amber-600' : 'text-emerald-600'}`} />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-xs uppercase tracking-wider">
                {isBenchmark ? 'Currently Loaded: Preloaded Benchmark CRM Sample' : 'Currently Loaded: Custom Uploaded Dataset'}
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-semibold ${
                isBenchmark ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-emerald-100 text-emerald-800 border-emerald-300'
              }`}>
                {records.length.toLocaleString()} Records Active in RAM
              </span>
              {isEntityMode && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-300 font-semibold flex items-center gap-1">
                  <Building2 className="w-3 h-3" /> Entity MDM Mode
                </span>
              )}
            </div>
            <p className="text-xs mt-1 text-slate-600 max-w-2xl leading-relaxed">
              {isBenchmark
                ? 'The portal is pre-populated with a 15-record Dirty CRM Benchmark dataset demonstrating broken phone numbers, disposable emails, lowercase names, and duplicate clusters. Drop your own file below (any size) to replace this benchmark with your real data.'
                : `Currently evaluating all ${records.length.toLocaleString()} records from your uploaded file (${datasetName}) in local browser RAM. You can upload another spreadsheet below or reload the benchmark anytime.`}
            </p>
          </div>
        </div>
      </div>

      {/* Notice Banner */}
      {notice && (
        <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200 flex items-start gap-3">
          <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
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
          {isUploading ? 'Parsing & Auto-Mapping All Rows in Browser RAM...' : 'Drop your CRM or financial spreadsheet here or click to browse'}
        </h3>
        <p className="text-xs text-slate-500 mb-4 max-w-lg mx-auto">
          Supports <strong>.csv</strong>, <strong>.xlsx</strong>, and <strong>.xls</strong> of any size. Ingests and cleans <strong>100% of your records</strong> in local browser memory with zero row caps and zero server upload.
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
            <FileSpreadsheet className="w-4 h-4" /> Select Spreadsheet File (Unlimited Rows)
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
            Active: {records.length.toLocaleString()} records ready in RAM
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
                Mapped: {field.mapped}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Flow Continuation Card */}
      <div className="flex items-center justify-between flex-wrap gap-3 p-4 bg-gradient-to-r from-sky-50 to-emerald-50 rounded-xl border border-sky-200">
        <div>
          <h4 className="text-sm font-bold text-slate-900">Ready to Cleanse &amp; Deduplicate All {records.length.toLocaleString()} Records?</h4>
          <p className="text-xs text-slate-600 mt-0.5">
            Proceed to Step 2 to inspect side-by-side ghost diffs and download the full 7-Tab Excel workbook, or jump to Step 3 to review {duplicateClusterCount.toLocaleString()} duplicate cluster(s).
          </p>
        </div>

        <button
          onClick={onNavigateToCleanse}
          className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-all cursor-pointer"
        >
          Proceed to Clean &amp; Standardize <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
