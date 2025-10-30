-- Add email template for admin-created user accounts
-- Date: October 30, 2025

-- Insert Admin Created Account template
INSERT INTO notification_templates (name, subject, content, category, is_active, created_at, updated_at)
VALUES (
  'Admin Created Account',
  'Your Basic Intelligence Account Has Been Created',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2 style="color: #4F46E5;">Welcome to Basic Intelligence!</h2>
    <p>Hi {{full_name}},</p>
    <p>An administrator has created an account for you on Basic Intelligence, your gateway to AI education excellence!</p>
    
    <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <h3 style="color: #4F46E5; margin-top: 0;">Your Login Credentials</h3>
      <p style="margin: 10px 0;"><strong>Email:</strong> {{email}}</p>
      <p style="margin: 10px 0;"><strong>Temporary Password:</strong> <code style="background: #E5E7EB; padding: 4px 8px; border-radius: 4px; font-size: 14px;">{{temporary_password}}</code></p>
      <p style="margin: 10px 0; color: #DC2626; font-weight: 600;">⚠️ You will be required to change this password on your first login.</p>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="{{login_url}}" style="background: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
        Login to Your Account
      </a>
    </div>

    <h3 style="color: #1F2937;">What You Can Do:</h3>
    <ul style="line-height: 1.8; color: #4B5563;">
      <li>Access exclusive AI learning resources and courses</li>
      <li>Download our comprehensive prompt library</li>
      <li>Track your learning progress</li>
      <li>Connect with our AI learning community</li>
    </ul>

    <div style="background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px; margin: 20px 0;">
      <p style="margin: 0; color: #92400E;">
        <strong>Security Tip:</strong> For your security, please change your temporary password immediately after logging in. Choose a strong, unique password.
      </p>
    </div>

    <p>If you have any questions or need assistance, please don''t hesitate to reach out to our support team.</p>
    
    <p>We''re excited to have you join our community!</p>
    <p><strong>The Basic Intelligence Team</strong></p>
    
    <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;">
    <p style="color: #6B7280; font-size: 12px;">
      This is an automated message from Basic Intelligence. If you did not expect this email, please contact our support team immediately.
    </p>
  </div>',
  'authentication',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (name) DO UPDATE
SET 
  subject = EXCLUDED.subject,
  content = EXCLUDED.content,
  updated_at = NOW();

-- Verify the template was created
SELECT name, subject, category, is_active 
FROM notification_templates 
WHERE name = 'Admin Created Account';
