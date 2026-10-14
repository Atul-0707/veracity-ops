export type WorkspaceStatus = 'active' | 'suspended' | 'trial';

export interface Workspace {
  id: string;
  slug: string;
  company_name: string;
  logo_url: string | null;
  crm_target: string;
  status: WorkspaceStatus;
  monthly_fee: number;
  quota_limit: number;
  quota_used: number;
  valid_until: string;
  primary_contact: string | null;
  contact_email: string | null;
  created_at: string;
  updated_at: string;
}

export interface IngestedBatch {
  id: string;
  filename: string;
  file_hash: string;
  row_count: number;
  uploaded_at: string;
  has_exported?: boolean;
}

export interface QuotaLedger {
  monthlyLimit: number;
  quotaUsed: number;
  quotaRemaining: number;
  batches: IngestedBatch[];
}

export type BatchRunStatus = 'processing' | 'completed' | 'reverted';

export interface BatchRun {
  id: string;
  run_id: string;
  workspace_id: string;
  filename: string;
  record_count: number;
  approved_count: number;
  quarantined_count: number;
  duplicate_count: number;
  health_score: number;
  sdr_hours_saved: number;
  payroll_saved: number;
  status: BatchRunStatus;
  created_at: string;
}

export type TriageStatus = 'clean' | 'quarantined' | 'verified';

export interface DataRecord {
  id: string;
  batch_run_id: string;
  workspace_id: string;
  record_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  company: string | null;
  job_title: string | null;
  country: string | null;
  region: string | null;
  first_name_clean: string | null;
  last_name_clean: string | null;
  email_clean: string | null;
  phone_clean: string | null;
  company_clean: string | null;
  job_title_clean: string | null;
  domain?: string | null;
  seniority_tier?: string | null;
  department?: string | null;
  inferred_company?: boolean;
  triage_status: TriageStatus;
  quarantine_reason: string | null;
  flag_tags: string[] | null;
  health_score: number;
  is_duplicate: boolean;
  duplicate_cluster_id: string | null;
  duplicate_type?: 'email' | 'phone_lastname' | 'entity' | null;
  duplicate_reason?: string | null;
  match_score?: number | null;
  entity_type?: 'individual' | 'organization';
  dataset_domain?: 'CRM_LEADS' | 'FINANCIAL_PORTFOLIO' | 'GENERIC';
  created_at: string;
}

export type ClusterStatus = 'pending' | 'merged' | 'dismissed';

export interface DuplicateCluster {
  id: string;
  workspace_id: string;
  batch_run_id: string;
  cluster_name: string;
  match_score: number;
  survivor_record_id: string | null;
  match_fields: string[];
  status: ClusterStatus;
  created_at: string;
}

export interface Recipe {
  id: string;
  workspace_id: string;
  name: string;
  version: string;
  config: RecipeConfig;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RecipeConfig {
  targetFilters?: {
    countries?: string[];
    requireEmail?: boolean;
    requirePhone?: boolean;
  };
  standards?: {
    stripZeroWidthBytes?: boolean;
    canonicalizeName?: boolean;
    phoneFormat?: string;
    dedupStrategy?: string;
  };
  customFields?: {
    field: string;
    required?: boolean;
    fallback?: string;
    allowedValues?: string[];
  }[];
}

export interface AuditLogEntry {
  id: string;
  workspace_id: string | null;
  batch_run_id: string | null;
  action: string;
  actor: string;
  details: Record<string, unknown>;
  timestamp: string;
}

export type ModuleId = 'instant' | 'health' | 'import' | 'cleanse' | 'dedupe' | 'enrich' | 'quarantine';
export type Persona = 'executive' | 'ops';
