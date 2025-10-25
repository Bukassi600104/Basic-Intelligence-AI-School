# Database Scripts

This directory contains utility scripts for database maintenance and migrations.

## Backfill Thumbnails Script

### Purpose
Updates existing `content_library` records to populate `google_drive_thumbnail_url` from existing Google Drive links.

### Prerequisites
1. Database migration `20251025000000_add_thumbnail_url_column.sql` must be applied
2. `.env` file with Supabase credentials

### Usage

```bash
# Install dependencies (if not already installed)
npm install

# Run the backfill script
node scripts/backfill-thumbnails.js
```

### What it does
1. Fetches all content records with Google Drive IDs but missing thumbnail URLs
2. Extracts FILE_ID from `google_drive_id` or `google_drive_embed_url`
3. Generates proper thumbnail URL: `https://drive.google.com/thumbnail?id=FILE_ID&sz=w400`
4. Updates each record in the database
5. Exports failed records to CSV for manual review

### Output
- Console logs showing progress and summary
- `failed-thumbnail-backfill.csv` (if any records fail)

### When to run
- After deploying code changes with Google Drive utilities
- Whenever bulk content is imported with Google Drive links
- As part of database maintenance

### Safety
- Uses service role key for elevated permissions
- Only updates records with NULL `google_drive_thumbnail_url`
- Does not modify existing thumbnail URLs
- Creates audit trail of failures

## Adding New Scripts

When creating new database scripts:

1. Place in this `scripts/` directory
2. Use ES modules (import/export)
3. Load environment variables with dotenv
4. Include error handling and logging
5. Document usage in this README
6. Use service role key for admin operations
