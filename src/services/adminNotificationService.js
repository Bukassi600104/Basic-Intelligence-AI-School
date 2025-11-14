import { emailService } from './emailService';
import { logger } from '../utils/logger';

const DEFAULT_ADMIN_EMAIL = 'bukassi@gmail.com';

const formatCurrency = (amount) => {
  const numericAmount = Number(amount) || 0;
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN'
  }).format(numericAmount);
};

const getAdminEmail = () => {
  const env = import.meta?.env || {};
  return (
    env.VITE_ADMIN_NOTIFICATION_EMAIL ||
    env.VITE_ADMIN_EMAIL ||
    env.VITE_SUPPORT_EMAIL ||
    DEFAULT_ADMIN_EMAIL
  );
};

export const adminNotificationService = {
  async notifyNewRegistration({
    fullName,
    email,
    phone,
    location,
    plan,
    amount,
    receiptUrl,
    dashboardUrl,
    registrationTime
  }) {
    try {
      const adminEmail = getAdminEmail();
      const registrationTimeFormatted = new Date(registrationTime).toLocaleString('en-NG', {
        timeZone: 'Africa/Lagos',
        dateStyle: 'full',
        timeStyle: 'long'
      });

      const formattedAmount = formatCurrency(amount);
      const baseDashboardUrl =
        dashboardUrl?.replace(/\/$/, '') ||
        (typeof window !== 'undefined' ? window.location.origin : '');
      const safeDashboardUrl = baseDashboardUrl
        ? `${baseDashboardUrl}/admin-users`
        : 'https://basicai.fit/admin-users';

      const receiptSection = receiptUrl
        ? `<p style="margin: 8px 0 0 0;"><strong>📄 Payment Receipt:</strong> <a href="${receiptUrl}" style="color: #2563eb;">View Receipt</a></p>`
        : `<p style="margin: 8px 0 0 0; color: #92400e;"><em>No receipt uploaded yet.</em></p>`;

      const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { padding: 30px; }
    .info-box { background-color: #f9fafb; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 5px; }
    .info-box p { margin: 8px 0; }
    .info-box strong { color: #065f46; }
    .action-box { background-color: #dbeafe; padding: 20px; margin: 20px 0; border-radius: 8px; text-align: center; }
    .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
    .button:hover { background: #5568d3; }
    .footer { background-color: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
    .receipt-section { background-color: #fef3c7; padding: 15px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #f59e0b; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 New Member Registration</h1>
      <p>Basic Intelligence AI School</p>
    </div>
    
    <div class="content">
      <h2 style="color: #667eea; margin-top: 0;">Registration Details</h2>
      
      <div class="info-box">
        <p><strong>👤 Full Name:</strong> ${fullName}</p>
        <p><strong>📧 Email:</strong> ${email}</p>
        <p><strong>📱 Phone:</strong> ${phone || 'Not provided'}</p>
        <p><strong>📍 Location:</strong> ${location || 'Not provided'}</p>
        <p><strong>💳 Plan:</strong> ${plan}</p>
        <p><strong>💰 Amount:</strong> ${formattedAmount}</p>
        <p><strong>⏰ Registration Time:</strong> ${registrationTimeFormatted}</p>
        ${receiptSection}
      </div>
      
      <div class="action-box">
        <h3 style="margin-top: 0; color: #1e40af;">Action Required</h3>
        <p style="margin-bottom: 15px;">Please review this registration to confirm payment and activate the member account.</p>
        <a href="${safeDashboardUrl}" class="button">Review Registration →</a>
      </div>
      
      <div style="background-color: #f0fdf4; padding: 15px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #22c55e;">
        <p style="margin: 0;"><strong>✅ Next Steps:</strong></p>
        <ol style="margin: 10px 0; padding-left: 20px;">
          <li>Verify the payment receipt</li>
          <li>Confirm payment amount matches the plan</li>
          <li>Approve the member account in admin dashboard</li>
          <li>Member will receive full access within 48 hours</li>
        </ol>
      </div>
    </div>
    
    <div class="footer">
      <p><strong>System Notification</strong></p>
      <p>This is an automated notification from the Basic Intelligence registration system.</p>
      <p>Do not reply to this email.</p>
    </div>
  </div>
</body>
</html>`;

      logger.info('Sending admin registration notification', {
        memberName: fullName,
        email,
        adminEmail
      });

      const result = await emailService.sendEmail({
        to: adminEmail,
        subject: `New Member Registration - ${fullName}`,
        html
      });

      if (!result.success) {
        logger.error('Failed to send admin registration notification', {
          error: result.error,
          memberName: fullName,
          email
        });
      }

      return result;
    } catch (error) {
      logger.error('Error in notifyNewRegistration:', error);
      return { success: false, error: error.message };
    }
  }
};
