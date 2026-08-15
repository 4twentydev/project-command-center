ALTER TABLE contact_inquiries ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;
--> statement-breakpoint
UPDATE contact_inquiries SET archived_at = updated_at WHERE status = 'archived' AND archived_at IS NULL;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS contact_inquiries_archived_at_idx ON contact_inquiries (archived_at) WHERE archived_at IS NOT NULL;
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'contact_inquiries_archived_at_check' AND conrelid = 'contact_inquiries'::regclass) THEN
    ALTER TABLE contact_inquiries ADD CONSTRAINT contact_inquiries_archived_at_check CHECK ((status = 'archived') = (archived_at IS NOT NULL));
  END IF;
END $$;
