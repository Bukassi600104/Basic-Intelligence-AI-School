import { logger } from '../utils/logger';
import { paymentReceiptService } from './paymentReceiptService';

const ADMIN_WHATSAPP = '+2349062284074';

export const whatsappService = {
  async sendPaymentReceipt({ 
    fullName, 
    email, 
    phone, 
    plan, 
    amount,
    imageFile 
  }) {
    try {
      let receiptUrl = '';
      
      if (imageFile) {
        const uploadResult = await paymentReceiptService.uploadReceipt(
          imageFile, 
          `${email}-${Date.now()}`
        );
        
        if (uploadResult.success && uploadResult.url) {
          receiptUrl = uploadResult.url;
        }
      }
      
      const message = encodeURIComponent(
        `🎉 NEW REGISTRATION PAYMENT 🎉\n\n` +
        `👤 Name: ${fullName}\n` +
        `📧 Email: ${email}\n` +
        `📱 Phone: ${phone}\n` +
        `💳 Plan: ${plan}\n` +
        `💰 Amount: ₦${amount}\n\n` +
        `⏰ Time: ${new Date().toLocaleString('en-NG', { timeZone: 'Africa/Lagos' })}\n\n` +
        (receiptUrl ? `📄 Receipt: ${receiptUrl}\n\n` : '') +
        `Please verify the payment and approve the registration.`
      );
      
      const whatsappUrl = `https://wa.me/${ADMIN_WHATSAPP.replace('+', '')}?text=${message}`;
      
      window.open(whatsappUrl, '_blank');
      
      logger.info('Payment receipt WhatsApp notification sent', {
        fullName,
        email,
        receiptUrl,
        adminWhatsApp: ADMIN_WHATSAPP
      });
      
      return { success: true, receiptUrl };
    } catch (error) {
      logger.error('Failed to send WhatsApp notification:', error);
      return { success: false, error: error.message };
    }
  },

  sendSupportMessage(message, userInfo = {}) {
    try {
      let messageText = message;
      
      if (userInfo.fullName || userInfo.email) {
        messageText = `${message}\n\n---\nFrom: ${userInfo.fullName || 'User'}\nEmail: ${userInfo.email || 'N/A'}`;
      }
      
      const encodedMessage = encodeURIComponent(messageText);
      const whatsappUrl = `https://wa.me/${ADMIN_WHATSAPP.replace('+', '')}?text=${encodedMessage}`;
      
      window.open(whatsappUrl, '_blank');
      
      return { success: true };
    } catch (error) {
      logger.error('Failed to send WhatsApp message:', error);
      return { success: false, error: error.message };
    }
  }
};
