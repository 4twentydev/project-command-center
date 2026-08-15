UPDATE contact_inquiries SET status = 'new' WHERE status NOT IN ('new', 'contacted', 'qualified', 'proposal', 'won', 'lost', 'archived');
--> statement-breakpoint
UPDATE contact_inquiries SET notification_status = 'not_configured' WHERE notification_status NOT IN ('not_configured', 'queued', 'sent', 'delivered', 'bounced', 'complained', 'failed');
--> statement-breakpoint
UPDATE consultations SET status = 'draft' WHERE status NOT IN ('draft', 'discovery', 'scoped', 'archived');
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'contact_inquiries_status_check' AND conrelid = 'contact_inquiries'::regclass) THEN
    ALTER TABLE contact_inquiries ADD CONSTRAINT contact_inquiries_status_check CHECK (status IN ('new', 'contacted', 'qualified', 'proposal', 'won', 'lost', 'archived'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'contact_inquiries_notification_status_check' AND conrelid = 'contact_inquiries'::regclass) THEN
    ALTER TABLE contact_inquiries ADD CONSTRAINT contact_inquiries_notification_status_check CHECK (notification_status IN ('not_configured', 'queued', 'sent', 'delivered', 'bounced', 'complained', 'failed'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'contact_inquiries_email_check' AND conrelid = 'contact_inquiries'::regclass) THEN
    ALTER TABLE contact_inquiries ADD CONSTRAINT contact_inquiries_email_check CHECK (char_length(email) BETWEEN 3 AND 320 AND email = btrim(email) AND email ~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'contact_inquiries_intake_object_check' AND conrelid = 'contact_inquiries'::regclass) THEN
    ALTER TABLE contact_inquiries ADD CONSTRAINT contact_inquiries_intake_object_check CHECK (intake IS NULL OR jsonb_typeof(intake) = 'object');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'consultations_status_check' AND conrelid = 'consultations'::regclass) THEN
    ALTER TABLE consultations ADD CONSTRAINT consultations_status_check CHECK (status IN ('draft', 'discovery', 'scoped', 'archived'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'consultations_service_slug_check' AND conrelid = 'consultations'::regclass) THEN
    ALTER TABLE consultations ADD CONSTRAINT consultations_service_slug_check CHECK (service_slug IN ('manufacturing-software', 'workflow-automation', 'small-business-websites', 'cnc-signage-systems'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'consultations_id_uuid_check' AND conrelid = 'consultations'::regclass) THEN
    ALTER TABLE consultations ADD CONSTRAINT consultations_id_uuid_check CHECK (id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'consultations_client_identity_check' AND conrelid = 'consultations'::regclass) THEN
    ALTER TABLE consultations ADD CONSTRAINT consultations_client_identity_check CHECK (btrim(client_name) <> '' OR btrim(business) <> '') NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'consultations_email_check' AND conrelid = 'consultations'::regclass) THEN
    ALTER TABLE consultations ADD CONSTRAINT consultations_email_check CHECK (email = '' OR (char_length(email) <= 320 AND email = btrim(email) AND email ~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$')) NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'consultations_responses_object_check' AND conrelid = 'consultations'::regclass) THEN
    ALTER TABLE consultations ADD CONSTRAINT consultations_responses_object_check CHECK (jsonb_typeof(responses) = 'object');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'workspaces_data_object_check' AND conrelid = 'workspaces'::regclass) THEN
    ALTER TABLE workspaces ADD CONSTRAINT workspaces_data_object_check CHECK (jsonb_typeof(data) = 'object');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'workspace_snapshots_data_object_check' AND conrelid = 'workspace_snapshots'::regclass) THEN
    ALTER TABLE workspace_snapshots ADD CONSTRAINT workspace_snapshots_data_object_check CHECK (jsonb_typeof(data) = 'object');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'workspace_snapshots_workspace_id_fkey' AND conrelid = 'workspace_snapshots'::regclass) THEN
    ALTER TABLE workspace_snapshots ADD CONSTRAINT workspace_snapshots_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'push_subscriptions_subscription_object_check' AND conrelid = 'push_subscriptions'::regclass) THEN
    ALTER TABLE push_subscriptions ADD CONSTRAINT push_subscriptions_subscription_object_check CHECK (jsonb_typeof(subscription) = 'object');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'marketing_workspaces_data_object_check' AND conrelid = 'marketing_workspaces'::regclass) THEN
    ALTER TABLE marketing_workspaces ADD CONSTRAINT marketing_workspaces_data_object_check CHECK (jsonb_typeof(data) = 'object');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'conversion_events_name_check' AND conrelid = 'conversion_events'::regclass) THEN
    ALTER TABLE conversion_events ADD CONSTRAINT conversion_events_name_check CHECK (event_name IN ('service_page_view', 'case_study_view', 'workflow_audit_cta_click', 'contact_form_start', 'contact_form_submission', 'email_link_click', 'phone_link_click', 'external_booking_link_click', 'workflow_audit_view', 'workflow_audit_form_start', 'workflow_audit_validation_error', 'workflow_audit_submission_success', 'workflow_audit_booking_click'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'conversion_events_metadata_object_check' AND conrelid = 'conversion_events'::regclass) THEN
    ALTER TABLE conversion_events ADD CONSTRAINT conversion_events_metadata_object_check CHECK (jsonb_typeof(metadata) = 'object');
  END IF;
END
$$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS contact_inquiries_ip_hash_created_at_idx ON contact_inquiries (ip_hash, created_at DESC);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS contact_inquiries_audit_rate_limit_idx ON contact_inquiries (ip_hash, LOWER(project_type), created_at DESC);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS contact_inquiries_due_follow_up_idx ON contact_inquiries (follow_up_at ASC, id ASC) WHERE follow_up_at IS NOT NULL AND status NOT IN ('won', 'lost', 'archived');
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS contact_inquiries_status_created_at_idx ON contact_inquiries (status, created_at DESC, id DESC);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS contact_inquiries_created_at_id_idx ON contact_inquiries (created_at DESC, id DESC);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS contact_inquiries_notification_id_idx ON contact_inquiries (notification_id) WHERE notification_id IS NOT NULL;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS workspace_snapshots_workspace_created_at_idx ON workspace_snapshots (workspace_id, created_at DESC);
--> statement-breakpoint
DROP INDEX IF EXISTS consultations_updated_at_idx;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS consultations_updated_at_id_idx ON consultations (updated_at DESC, id DESC);
