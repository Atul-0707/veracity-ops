import type { Workspace, DataRecord, BatchRun, IngestedBatch, QuotaLedger } from './types';
import { SAMPLE_LEAD_DATA, cleanseRecord, detectDuplicates, calculateHealthScore, calculateSdrHoursSaved, calculatePayrollSaved } from './engine';

const STORAGE_KEY_RECORDS = 'vrc_sandbox_records';
const STORAGE_KEY_RUNS = 'vrc_sandbox_runs';
const STORAGE_KEY_DATASET_NAME = 'vrc_sandbox_dataset_name';
const STORAGE_KEY_QUOTA = 'vrc_quota_ledger';
export const DEFAULT_DATASET_NAME = 'Benchmark Dirty CRM Sample (15 Records)';

export function getActiveDatasetName(): string {
  try {
    return sessionStorage.getItem(STORAGE_KEY_DATASET_NAME) || DEFAULT_DATASET_NAME;
  } catch {
    return DEFAULT_DATASET_NAME;
  }
}

export function setActiveDatasetName(name: string): void {
  try {
    sessionStorage.setItem(STORAGE_KEY_DATASET_NAME, name);
  } catch (err) {
    console.warn('Failed to save dataset name:', err);
  }
}

export function isBenchmarkDataset(): boolean {
  return getActiveDatasetName() === DEFAULT_DATASET_NAME;
}

export const DEMO_WORKSPACE: Workspace = {
  id: 'demo-sandbox',
  slug: 'demo',
  company_name: 'Veracity Founding Cohort Sandbox',
  logo_url: null,
  crm_target: 'Salesforce / HubSpot',
  status: 'active',
  monthly_fee: 150,
  quota_limit: 50000,
  quota_used: 0,
  valid_until: new Date(Date.now() + 86400000 * 365).toISOString(),
  primary_contact: 'Founding Member',
  contact_email: 'member@veracity.io',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

/**
 * Computes an SHA-256 fingerprint from the file content (first 64KB + size + signature).
 * This ensures renaming a file (e.g. Leads.csv -> Leads_copy.csv) produces the exact same hash
 * and prevents double-billing for re-uploads.
 */
export async function computeFileHash(file: File): Promise<string> {
  try {
    const slice = file.slice(0, 65536);
    const arrayBuffer = await slice.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    return `sha256_${hashHex.slice(0, 24)}_${file.size}`;
  } catch {
    return `fallback_${file.name.replace(/[^a-zA-Z0-9]/g, '_')}_${file.size}_${file.lastModified}`;
  }
}

/**
 * Retrieves the quota ledger for the current session.
 * Default: 50,000 monthly limit.
 */
export function getQuotaLedger(workspaceId = DEMO_WORKSPACE.id): QuotaLedger {
  try {
    const key = `${STORAGE_KEY_QUOTA}_${workspaceId}`;
    const raw = sessionStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.monthlyLimit === 'number') {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to load quota ledger:', err);
  }

  return {
    monthlyLimit: DEMO_WORKSPACE.quota_limit,
    quotaUsed: 0,
    quotaRemaining: DEMO_WORKSPACE.quota_limit,
    batches: [],
  };
}

export function saveQuotaLedger(ledger: QuotaLedger, workspaceId = DEMO_WORKSPACE.id): void {
  try {
    const key = `${STORAGE_KEY_QUOTA}_${workspaceId}`;
    sessionStorage.setItem(key, JSON.stringify(ledger));
    window.dispatchEvent(new CustomEvent('vrc_quota_updated', { detail: ledger }));
  } catch (err) {
    console.warn('Failed to save quota ledger:', err);
  }
}

/**
 * Pre-ingestion check: checks whether a file is within quota or is an existing re-upload.
 */
export function checkCanIngest(
  rowCount: number,
  fileHash: string,
  workspaceId = DEMO_WORKSPACE.id
): {
  allowed: boolean;
  isReupload: boolean;
  existingBatch?: IngestedBatch;
  remaining: number;
} {
  const ledger = getQuotaLedger(workspaceId);

  // Check if identical file content already exists in active batches
  const existing = ledger.batches.find((b) => b.file_hash === fileHash);
  if (existing) {
    return {
      allowed: true,
      isReupload: true,
      existingBatch: existing,
      remaining: ledger.quotaRemaining,
    };
  }

  // Check quota headroom
  const allowed = rowCount <= ledger.quotaRemaining;
  return {
    allowed,
    isReupload: false,
    remaining: ledger.quotaRemaining,
  };
}

/**
 * Commits an ingested batch to the quota ledger.
 * If fileHash already exists: charges 0 quota.
 * If new: debits rowCount from quotaRemaining.
 */
export function commitIngestedBatch(
  filename: string,
  fileHash: string,
  rowCount: number,
  workspaceId = DEMO_WORKSPACE.id
): {
  success: boolean;
  isReupload: boolean;
  batch: IngestedBatch;
  remaining: number;
  quotaConsumed: number;
} {
  const ledger = getQuotaLedger(workspaceId);

  // Check re-upload
  const existing = ledger.batches.find((b) => b.file_hash === fileHash);
  if (existing) {
    return {
      success: true,
      isReupload: true,
      batch: existing,
      remaining: ledger.quotaRemaining,
      quotaConsumed: 0,
    };
  }

  // Check quota limit
  if (rowCount > ledger.quotaRemaining) {
    return {
      success: false,
      isReupload: false,
      batch: {
        id: `failed-${Date.now()}`,
        filename,
        file_hash: fileHash,
        row_count: rowCount,
        uploaded_at: new Date().toISOString(),
      },
      remaining: ledger.quotaRemaining,
      quotaConsumed: 0,
    };
  }

  const newBatch: IngestedBatch = {
    id: `batch-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    filename,
    file_hash: fileHash,
    row_count: rowCount,
    uploaded_at: new Date().toISOString(),
    has_exported: false,
  };

  ledger.batches.push(newBatch);
  ledger.quotaUsed += rowCount;
  ledger.quotaRemaining = Math.max(0, ledger.monthlyLimit - ledger.quotaUsed);

  saveQuotaLedger(ledger, workspaceId);

  return {
    success: true,
    isReupload: false,
    batch: newBatch,
    remaining: ledger.quotaRemaining,
    quotaConsumed: rowCount,
  };
}

/**
 * 15-Minute Grace Period:
 * If a user uploaded the wrong file, they can discard the batch within 15 minutes
 * and have the full row count refunded, provided they have not yet exported it.
 */
export function discardActiveBatch(
  batchId: string,
  workspaceId = DEMO_WORKSPACE.id
): {
  success: boolean;
  refundedRows: number;
  remaining: number;
} {
  const ledger = getQuotaLedger(workspaceId);
  const batchIdx = ledger.batches.findIndex((b) => b.id === batchId);

  if (batchIdx === -1) {
    return { success: false, refundedRows: 0, remaining: ledger.quotaRemaining };
  }

  const batch = ledger.batches[batchIdx];

  // If already exported, cannot discard
  if (batch.has_exported) {
    return { success: false, refundedRows: 0, remaining: ledger.quotaRemaining };
  }

  const refunded = batch.row_count;
  ledger.batches.splice(batchIdx, 1);
  ledger.quotaUsed = Math.max(0, ledger.quotaUsed - refunded);
  ledger.quotaRemaining = Math.min(ledger.monthlyLimit, ledger.monthlyLimit - ledger.quotaUsed);

  saveQuotaLedger(ledger, workspaceId);

  return {
    success: true,
    refundedRows: refunded,
    remaining: ledger.quotaRemaining,
  };
}

export function canDiscardBatch(batch: IngestedBatch | null | undefined): boolean {
  if (!batch) return false;
  if (batch.has_exported) return false;
  const ageMs = Date.now() - new Date(batch.uploaded_at).getTime();
  return ageMs <= 15 * 60 * 1000; // 15 minutes grace period
}

export function getLatestActiveBatch(workspaceId = DEMO_WORKSPACE.id): IngestedBatch | null {
  const ledger = getQuotaLedger(workspaceId);
  if (ledger.batches.length === 0) return null;
  return ledger.batches[ledger.batches.length - 1];
}

export function resetQuotaLedger(workspaceId = DEMO_WORKSPACE.id): void {
  const fresh: QuotaLedger = {
    monthlyLimit: DEMO_WORKSPACE.quota_limit,
    quotaUsed: 0,
    quotaRemaining: DEMO_WORKSPACE.quota_limit,
    batches: [],
  };
  saveQuotaLedger(fresh, workspaceId);
}

/**
 * Initializes or retrieves ephemeral session records.
 * Isolated strictly to the visitor's browser tab via sessionStorage.
 */
export function getEphemeralRecords(): DataRecord[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY_RECORDS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to read sessionStorage records:', err);
  }

  // Initial seed: cleanse default 15 sample records
  return getInitialSampleRecords();
}

export function saveEphemeralRecords(records: DataRecord[]): void {
  try {
    sessionStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(records));
  } catch (err) {
    console.warn('Failed to save to sessionStorage:', err);
  }
}

export function updateEphemeralRecord(recordId: string, updates: Partial<DataRecord>): DataRecord[] {
  const current = getEphemeralRecords();
  const next = current.map((r) => (r.id === recordId ? { ...r, ...updates } : r));
  saveEphemeralRecords(next);
  return next;
}

export function getEphemeralBatchRuns(): BatchRun[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY_RUNS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.warn('Failed to read sessionStorage runs:', err);
  }
  return [];
}

export function saveEphemeralBatchRun(run: BatchRun): void {
  try {
    const runs = getEphemeralBatchRuns();
    runs.unshift(run);
    sessionStorage.setItem(STORAGE_KEY_RUNS, JSON.stringify(runs.slice(0, 10)));
  } catch (err) {
    console.warn('Failed to save batch run:', err);
  }
}

export function clearEphemeralSession(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY_RECORDS);
    sessionStorage.removeItem(STORAGE_KEY_RUNS);
    sessionStorage.removeItem(STORAGE_KEY_DATASET_NAME);
    resetQuotaLedger();
  } catch (err) {
    console.warn('Failed to clear sessionStorage:', err);
  }
}

export function getInitialSampleRecords(): DataRecord[] {
  const cleansed = SAMPLE_LEAD_DATA.map((row) => cleanseRecord(row));
  const dupClusters = detectDuplicates(cleansed);
  for (const [clusterKey, ids] of dupClusters) {
    const isCompany = clusterKey.startsWith('company:');
    const isPhone = clusterKey.startsWith('phone_lastname:');
    const matchType = isCompany ? 'entity' : (isPhone ? 'phone_lastname' : 'email');
    const score = isCompany ? 97.5 : (isPhone ? 95.8 : 99.4);

    cleansed.forEach((r) => {
      if (ids.includes(r.record_id)) {
        r.is_duplicate = true;
        r.duplicate_cluster_id = clusterKey;
        r.duplicate_type = matchType;
        r.match_score = score;
        if (!r.flag_tags.includes('DUPLICATE')) {
          r.flag_tags.push('DUPLICATE');
        }
      }
    });
  }

  return cleansed.map((r) => ({
    id: `rec-${r.record_id}`,
    batch_run_id: 'seed-run-001',
    workspace_id: DEMO_WORKSPACE.id,
    record_id: r.record_id,
    first_name: r.first_name,
    last_name: r.last_name,
    email: r.email,
    phone: r.phone,
    company: r.company,
    job_title: r.job_title,
    country: r.country,
    region: r.region,
    first_name_clean: r.first_name_clean,
    last_name_clean: r.last_name_clean,
    email_clean: r.email_clean,
    phone_clean: r.phone_clean,
    company_clean: r.company_clean,
    job_title_clean: r.job_title_clean,
    domain: r.domain,
    seniority_tier: r.seniority_tier,
    department: r.department,
    inferred_company: r.inferred_company,
    entity_type: r.entity_type,
    triage_status: r.triage_status,
    quarantine_reason: r.quarantine_reason,
    flag_tags: r.flag_tags,
    health_score: r.health_score,
    is_duplicate: r.is_duplicate,
    duplicate_cluster_id: r.duplicate_cluster_id || null,
    duplicate_type: r.duplicate_type || null,
    match_score: r.match_score || null,
    created_at: new Date().toISOString(),
  }));
}
