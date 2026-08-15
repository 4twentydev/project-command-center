CREATE TABLE IF NOT EXISTS workspaces (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS workspace_snapshots (
  id BIGSERIAL PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS push_subscriptions (
  endpoint TEXT PRIMARY KEY,
  subscription JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS contact_inquiries (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  project_type TEXT,
  budget TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  ip_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
--> statement-breakpoint
ALTER TABLE contact_inquiries ADD COLUMN IF NOT EXISTS notes TEXT NOT NULL DEFAULT '';
--> statement-breakpoint
ALTER TABLE contact_inquiries ADD COLUMN IF NOT EXISTS follow_up_at TIMESTAMPTZ;
--> statement-breakpoint
ALTER TABLE contact_inquiries ADD COLUMN IF NOT EXISTS converted_project_id TEXT;
--> statement-breakpoint
ALTER TABLE contact_inquiries ADD COLUMN IF NOT EXISTS notification_id TEXT;
--> statement-breakpoint
ALTER TABLE contact_inquiries ADD COLUMN IF NOT EXISTS notification_status TEXT NOT NULL DEFAULT 'not_configured';
--> statement-breakpoint
ALTER TABLE contact_inquiries ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
--> statement-breakpoint
ALTER TABLE contact_inquiries ADD COLUMN IF NOT EXISTS intake JSONB;
--> statement-breakpoint
ALTER TABLE contact_inquiries ADD COLUMN IF NOT EXISTS submission_key TEXT;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS contact_inquiries_submission_key_idx ON contact_inquiries (submission_key) WHERE submission_key IS NOT NULL;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS conversion_events (
  id BIGSERIAL PRIMARY KEY,
  event_name TEXT NOT NULL,
  path TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  visitor_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS conversion_events_created_at_idx ON conversion_events (created_at DESC);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS conversion_events_visitor_hash_idx ON conversion_events (visitor_hash, created_at DESC);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS consultations (
  id TEXT PRIMARY KEY,
  lead_id BIGINT REFERENCES contact_inquiries(id) ON DELETE SET NULL,
  service_slug TEXT NOT NULL,
  client_name TEXT NOT NULL DEFAULT '',
  business TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  consultation_date DATE,
  status TEXT NOT NULL DEFAULT 'draft',
  responses JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS consultations_updated_at_idx ON consultations (updated_at DESC);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS consultations_lead_id_idx ON consultations (lead_id) WHERE lead_id IS NOT NULL;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS marketing_workspaces (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
