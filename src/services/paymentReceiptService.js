import { supabase } from '../lib/supabase';
import { logger } from '../utils/logger';

const BUCKET_NAME = 'payment-receipts';

export const paymentReceiptService = {
  async uploadReceipt(file, identifier) {
    if (!file) {
      return { success: false, error: 'No file provided' };
    }

    try {
      const fileExt = file.name.split('.').pop();
      const safeIdentifier = identifier?.replace(/[^a-zA-Z0-9-_]/g, '') || 'payment';
      const fileName = `${safeIdentifier}-${Date.now()}.${fileExt}`;
      const filePath = `receipts/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        logger.error('Payment receipt upload error:', uploadError);
        return { success: false, error: uploadError.message };
      }

      const { data: { publicUrl } } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);

      return { success: true, url: publicUrl, path: filePath };
    } catch (error) {
      logger.error('Payment receipt upload exception:', error);
      return { success: false, error: error.message };
    }
  }
};
