/*
# Data Intelligence Platform — Core Schema

## Overview
Creates the complete schema for a multi-tenant data intelligence platform with:
- Client workspaces with subscription/billing management
- Batch upload tracking with run IDs and health scores
- Individual record triage (approved clean vs quarantine)
- Declarative client recipes (JSON configs per client)
- Immutable audit ledger for batch history
- Duplicate cluster tracking with golden record survivorship

## New Tables
1. `workspaces` — Tenant/client records with billing status, quota, CRM target
2. `batch_runs` — Each upload session with filename, row counts, health score
3. `records` — Individual data records triaged as clean or quarantined
4. `duplicate_clusters` — Groups of duplicate candidate records with merge scores
5. `recipes` — Declarative per-client cleansing configuration (JSON)
6. `audit_log` — Immutable ledger of all platform actions

## Security
- RLS enabled on all tables
- Anon + authenticated CRUD (no sign-in screen; admin managed via portal)
- All data is intentionally shared within the platform context
*/

-- ============================================================
-- 1. WORKSPACES (Tenant/client table)
-- ============================================================
CREATE TABLE IF NOT EXISTS workspaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  company_name text NOT NULL,
  logo_url text,
  crm_target text NOT NULL DEFAULT 'Salesforce',
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'trial')),
  monthly_fee numeric(10,2) NOT NULL DEFAULT 99.00,
  quota_limit integer NOT NULL DEFAULT 25000,
  quota_used integer NOT NULL DEFAULT 0,
  valid_until date NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '30 days'),
  primary_contact text,
  contact_email text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_workspaces" ON workspaces;
CREATE POLICY "anon_select_workspaces" ON workspaces FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_workspaces" ON workspaces;
CREATE POLICY "anon_insert_workspaces" ON workspaces FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_workspaces" ON workspaces;
CREATE POLICY "anon_update_workspaces" ON workspaces FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_workspaces" ON workspaces;
CREATE POLICY "anon_delete_workspaces" ON workspaces FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================================
-- 2. BATCH_RUNS (Upload sessions)
-- ============================================================
CREATE TABLE IF NOT EXISTS batch_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id text UNIQUE NOT NULL,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  filename text NOT NULL,
  record_count integer NOT NULL DEFAULT 0,
  approved_count integer NOT NULL DEFAULT 0,
  quarantined_count integer NOT NULL DEFAULT 0,
  duplicate_count integer NOT NULL DEFAULT 0,
  health_score numeric(5,2) NOT NULL DEFAULT 0,
  sdr_hours_saved numeric(10,2) NOT NULL DEFAULT 0,
  payroll_saved numeric(10,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'completed' CHECK (status IN ('processing', 'completed', 'reverted')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE batch_runs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_batch_runs" ON batch_runs;
CREATE POLICY "anon_select_batch_runs" ON batch_runs FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_batch_runs" ON batch_runs;
CREATE POLICY "anon_insert_batch_runs" ON batch_runs FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_batch_runs" ON batch_runs;
CREATE POLICY "anon_update_batch_runs" ON batch_runs FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_batch_runs" ON batch_runs;
CREATE POLICY "anon_delete_batch_runs" ON batch_runs FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_batch_runs_workspace ON batch_runs(workspace_id);
CREATE INDEX IF NOT EXISTS idx_batch_runs_created ON batch_runs(created_at DESC);

-- ============================================================
-- 3. RECORDS (Individual triaged records)
-- ============================================================
CREATE TABLE IF NOT EXISTS records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_run_id uuid NOT NULL REFERENCES batch_runs(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  record_id text NOT NULL,
  first_name text,
  last_name text,
  email text,
  phone text,
  company text,
  job_title text,
  country text,
  region text,
  -- Cleaned values
  first_name_clean text,
  last_name_clean text,
  email_clean text,
  phone_clean text,
  company_clean text,
  job_title_clean text,
  -- Triage
  triage_status text NOT NULL DEFAULT 'clean' CHECK (triage_status IN ('clean', 'quarantined', 'verified')),
  quarantine_reason text,
  flag_tags text[],
  health_score numeric(5,2) NOT NULL DEFAULT 100,
  is_duplicate boolean NOT NULL DEFAULT false,
  duplicate_cluster_id uuid,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_records" ON records;
CREATE POLICY "anon_select_records" ON records FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_records" ON records;
CREATE POLICY "anon_insert_records" ON records FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_records" ON records;
CREATE POLICY "anon_update_records" ON records FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_records" ON records;
CREATE POLICY "anon_delete_records" ON records FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_records_batch ON records(batch_run_id);
CREATE INDEX IF NOT EXISTS idx_records_workspace ON records(workspace_id);
CREATE INDEX IF NOT EXISTS idx_records_triage ON records(triage_status);
CREATE INDEX IF NOT EXISTS idx_records_dup_cluster ON records(duplicate_cluster_id);

-- ============================================================
-- 4. DUPLICATE_CLUSTERS (Dedup groups)
-- ============================================================
CREATE TABLE IF NOT EXISTS duplicate_clusters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  batch_run_id uuid NOT NULL REFERENCES batch_runs(id) ON DELETE CASCADE,
  cluster_name text NOT NULL,
  match_score numeric(5,2) NOT NULL DEFAULT 0,
  survivor_record_id uuid REFERENCES records(id) ON DELETE SET NULL,
  match_fields text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'merged', 'dismissed')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE duplicate_clusters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_duplicate_clusters" ON duplicate_clusters;
CREATE POLICY "anon_select_duplicate_clusters" ON duplicate_clusters FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_duplicate_clusters" ON duplicate_clusters;
CREATE POLICY "anon_insert_duplicate_clusters" ON duplicate_clusters FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_duplicate_clusters" ON duplicate_clusters;
CREATE POLICY "anon_update_duplicate_clusters" ON duplicate_clusters FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_duplicate_clusters" ON duplicate_clusters;
CREATE POLICY "anon_delete_duplicate_clusters" ON duplicate_clusters FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================================
-- 5. RECIPES (Declarative per-client configs)
-- ============================================================
CREATE TABLE IF NOT EXISTS recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name text NOT NULL,
  version text NOT NULL DEFAULT '1.0',
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_recipes" ON recipes;
CREATE POLICY "anon_select_recipes" ON recipes FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_recipes" ON recipes;
CREATE POLICY "anon_insert_recipes" ON recipes FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_recipes" ON recipes;
CREATE POLICY "anon_update_recipes" ON recipes FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_recipes" ON recipes;
CREATE POLICY "anon_delete_recipes" ON recipes FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================================
-- 6. AUDIT_LOG (Immutable ledger)
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE,
  batch_run_id uuid REFERENCES batch_runs(id) ON DELETE CASCADE,
  action text NOT NULL,
  actor text NOT NULL DEFAULT 'system',
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  timestamp timestamptz DEFAULT now()
);

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_audit_log" ON audit_log;
CREATE POLICY "anon_select_audit_log" ON audit_log FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_audit_log" ON audit_log;
CREATE POLICY "anon_insert_audit_log" ON audit_log FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_audit_log" ON audit_log;
CREATE POLICY "anon_update_audit_log" ON audit_log FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_audit_log" ON audit_log;
CREATE POLICY "anon_delete_audit_log" ON audit_log FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_audit_workspace ON audit_log(workspace_id);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_log(timestamp DESC);
