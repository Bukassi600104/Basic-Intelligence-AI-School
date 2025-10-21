-- Add performance optimizations based on query analysis
BEGIN;

-- 1. Create extension for full text search (if needed)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. Add indexes for notification_logs table
DO $$
BEGIN
    -- Recipient lookup and sorting
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_notification_logs_recipient_created') THEN
        CREATE INDEX idx_notification_logs_recipient_created
        ON notification_logs(recipient_id, created_at DESC);
    END IF;

    -- Status filtering
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_notification_logs_recipient_status') THEN
        CREATE INDEX idx_notification_logs_recipient_status
        ON notification_logs(recipient_id, status);
    END IF;

    -- Email lookups
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_notification_logs_email_status') THEN
        CREATE INDEX idx_notification_logs_email_status
        ON notification_logs(recipient_email, status);
    END IF;
END $$;

-- 3. Add indexes for notification_templates table
DO $$
BEGIN
    -- Template lookup
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_notification_templates_id_active') THEN
        CREATE INDEX idx_notification_templates_id_active
        ON notification_templates(id)
        WHERE is_active = true;
    END IF;

    -- Category queries
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_notification_templates_category_active') THEN
        CREATE INDEX idx_notification_templates_category_active
        ON notification_templates(category)
        WHERE is_active = true;
    END IF;

    -- Full text search
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_notification_templates_search') THEN
        CREATE INDEX idx_notification_templates_search
        ON notification_templates USING gin(
            to_tsvector('english', coalesce(name, '') || ' ' || coalesce(content, ''))
        )
        WHERE is_active = true;
    END IF;
END $$;

COMMIT;

-- 4. Update statistics (outside transaction)
ANALYZE notification_logs;
ANALYZE notification_templates;