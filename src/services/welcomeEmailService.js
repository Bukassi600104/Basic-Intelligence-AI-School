import { emailService } from './emailService';
import { logger } from '../utils/logger';

const buildWelcomeEmailHtml = ({ fullName, email, memberId, planLabel, dashboardUrl }) => `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937; background-color: #f9fafb; }
    .container { max-width: 640px; margin: 0 auto; padding: 24px; }
    .card { background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08); }
    .header { background: linear-gradient(135deg, #f97316 0%, #fb923c 100%); color: white; padding: 32px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
    .header p { margin: 12px 0 0; font-size: 16px; opacity: 0.9; }
    .content { padding: 32px; }
    .content h2 { font-size: 22px; color: #0f172a; margin-top: 0; }
    .list { background-color: #f1f5f9; border-radius: 12px; padding: 16px 24px; margin: 24px 0; }
    .list p { margin: 8px 0; }
    .button { display: inline-block; background-color: #f97316; color: white; padding: 14px 32px; border-radius: 999px; text-decoration: none; font-weight: 600; margin: 24px 0; }
    .info-card { border-radius: 12px; border: 1px solid #e2e8f0; padding: 20px; margin: 24px 0; background-color: #f8fafc; }
    .info-card h3 { margin: 0 0 12px 0; color: #ef4444; font-size: 18px; }
    .footer { padding: 24px 32px 32px; background-color: #1f2937; color: #e5e7eb; text-align: center; font-size: 13px; }
    .footer a { color: #f97316; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <h1>Welcome to Basic Intelligence AI School!</h1>
        <p>Your journey into advanced AI education begins now 🚀</p>
      </div>
      <div class="content">
        <h2>Hello ${fullName || 'there'},</h2>
        <p>
          We're excited to welcome you to the Basic Intelligence community! Your account has been
          created successfully and our team is currently reviewing your registration details.
        </p>
        <div class="info-card">
          <h3>📋 Your Registration Summary</h3>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Member ID:</strong> ${memberId || 'Pending Assignment'}</p>
          <p><strong>Membership Tier:</strong> ${planLabel}</p>
          <p><strong>Status:</strong> Pending approval (verification in progress)</p>
        </div>
        <p>
          While your payment is being confirmed, you already have limited access to your dashboard.
          Here's what to expect next:
        </p>
        <div class="list">
          <p>✅ Log in to your dashboard immediately</p>
          <p>⏳ Track the 48-hour approval countdown in real time</p>
          <p>🧾 Admin team confirms your payment</p>
          <p>🎉 Full access is unlocked once approval is complete</p>
        </div>
        <p>
          You can access your personalized dashboard via the button below. The dashboard shows your
          membership status, upcoming milestones, and access to learning resources once approved.
        </p>
        <div style="text-align: center;">
          <a class="button" href="${dashboardUrl}" target="_blank" rel="noopener noreferrer">
            Go to Your Dashboard →
          </a>
        </div>
        <p>
          If you have any questions or need support, simply reply to this email or contact our help
          desk — we're here to ensure you have the best learning experience.
        </p>
        <p style="margin-top: 32px;">
          Warm regards,<br />
          <strong>The Basic Intelligence Team</strong><br />
          Empowering Africa with practical AI knowledge
        </p>
      </div>
      <div class="footer">
        <p>Basic Intelligence AI School • Transforming AI Education</p>
        <p><a href="${dashboardUrl}" target="_blank" rel="noopener noreferrer">Visit your dashboard</a></p>
      </div>
    </div>
  </div>
</body>
</html>`;

export const welcomeEmailService = {
  async sendWelcomeEmail({ to, fullName, email, memberId, planLabel, dashboardUrl }) {
    try {
      const html = buildWelcomeEmailHtml({
        fullName,
        email,
        memberId,
        planLabel,
        dashboardUrl
      });

      const result = await emailService.sendEmail({
        to,
        subject: 'Welcome to Basic Intelligence AI School!',
        html
      });

      if (!result.success) {
        logger.error('Failed to send welcome email', {
          error: result.error,
          recipient: to
        });
      }

      return result;
    } catch (error) {
      logger.error('Error sending welcome email:', error);
      return { success: false, error: error.message };
    }
  }
};
