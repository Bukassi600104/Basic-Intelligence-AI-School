/**
 * Backfill Script for Google Drive Thumbnail URLs
 * 
 * This script updates existing content_library records to populate
 * google_drive_thumbnail_url from existing google_drive_id or google_drive_embed_url
 * 
 * Run this AFTER applying the database migration and deploying code changes
 * 
 * Usage:
 * 1. Set your Supabase credentials in .env file
 * 2. Run: node scripts/backfill-thumbnails.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing Supabase credentials in .env file');
  console.error('Required: VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Extract Google Drive FILE_ID from various URL formats
 */
function extractGoogleDriveId(url) {
  if (!url || typeof url !== 'string') {
    return null;
  }

  const patterns = [
    /\/file\/d\/([a-zA-Z0-9_-]+)/,
    /\/d\/([a-zA-Z0-9_-]+)/,
    /[?&]id=([a-zA-Z0-9_-]+)/,
    /\/open\?id=([a-zA-Z0-9_-]+)/,
    /\/uc\?id=([a-zA-Z0-9_-]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Generate Google Drive thumbnail URL
 */
function generateThumbnailUrl(fileId, size = 400) {
  if (!fileId) return null;
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w${size}`;
}

/**
 * Main backfill function
 */
async function backfillThumbnails() {
  console.log('🚀 Starting thumbnail backfill process...\n');

  try {
    // Fetch all content records that have google_drive_id or google_drive_embed_url
    // but are missing google_drive_thumbnail_url
    const { data: content, error: fetchError } = await supabase
      .from('content_library')
      .select('id, title, google_drive_id, google_drive_embed_url, google_drive_thumbnail_url')
      .or('google_drive_id.not.is.null,google_drive_embed_url.not.is.null')
      .is('google_drive_thumbnail_url', null);

    if (fetchError) {
      throw new Error(`Failed to fetch content: ${fetchError.message}`);
    }

    if (!content || content.length === 0) {
      console.log('✅ No content records need updating. All thumbnails are already set!');
      return;
    }

    console.log(`📊 Found ${content.length} records to update\n`);

    let successCount = 0;
    let failCount = 0;
    const failedRecords = [];

    // Process each record
    for (const item of content) {
      console.log(`Processing: "${item.title}" (ID: ${item.id})`);

      // Try to extract FILE_ID from google_drive_id first, then google_drive_embed_url
      let fileId = item.google_drive_id;
      
      if (!fileId && item.google_drive_embed_url) {
        fileId = extractGoogleDriveId(item.google_drive_embed_url);
      }

      if (!fileId) {
        console.log(`  ⚠️  Could not extract FILE_ID`);
        failCount++;
        failedRecords.push({
          id: item.id,
          title: item.title,
          reason: 'Could not extract FILE_ID from URLs'
        });
        continue;
      }

      // Generate thumbnail URL
      const thumbnailUrl = generateThumbnailUrl(fileId);

      // Update the record
      const { error: updateError } = await supabase
        .from('content_library')
        .update({ google_drive_thumbnail_url: thumbnailUrl })
        .eq('id', item.id);

      if (updateError) {
        console.log(`  ❌ Failed to update: ${updateError.message}`);
        failCount++;
        failedRecords.push({
          id: item.id,
          title: item.title,
          reason: updateError.message
        });
      } else {
        console.log(`  ✅ Updated successfully`);
        console.log(`     Thumbnail: ${thumbnailUrl}`);
        successCount++;
      }

      console.log('');
    }

    // Summary
    console.log('━'.repeat(60));
    console.log('📈 BACKFILL SUMMARY');
    console.log('━'.repeat(60));
    console.log(`Total records processed: ${content.length}`);
    console.log(`✅ Successfully updated: ${successCount}`);
    console.log(`❌ Failed: ${failCount}`);
    console.log('');

    if (failedRecords.length > 0) {
      console.log('❌ Failed Records:');
      failedRecords.forEach((record, index) => {
        console.log(`${index + 1}. ID: ${record.id} | Title: "${record.title}"`);
        console.log(`   Reason: ${record.reason}\n`);
      });

      // Export failed records to CSV
      const csv = 'ID,Title,Reason\n' + 
        failedRecords.map(r => `${r.id},"${r.title}","${r.reason}"`).join('\n');
      
      const fs = await import('fs');
      fs.writeFileSync('failed-thumbnail-backfill.csv', csv);
      console.log('📄 Failed records exported to: failed-thumbnail-backfill.csv\n');
    }

    console.log('✅ Backfill process completed!');

  } catch (error) {
    console.error('❌ Fatal error during backfill:', error.message);
    process.exit(1);
  }
}

// Run the backfill
backfillThumbnails()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Unhandled error:', error);
    process.exit(1);
  });
