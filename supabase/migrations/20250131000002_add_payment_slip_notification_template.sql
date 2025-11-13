-- Migration: Add Payment Slip Upload Notification Template
-- This migration adds the missing template for payment slip notifications

INSERT INTO public.notification_templates (name, subject, content, category, is_active, is_system_template)
VALUES (
  'Payment Slip Upload Notification',
  'Payment Slip Uploaded - {{member_name}}',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #2563eb;">Payment Slip Received</h2>
    <p>Hi Admin,</p>
    <p>A new member has uploaded their payment slip:</p>
    
    <div style="background-color: #f9fafb; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0;">
      <p style="margin: 0; color: #92400e;"><strong>Member Details:</strong></p>
      <p style="margin: 5px 0 0 0;">Name: {{member_name}}</p>
      <p style="margin: 5px 0 0 0;">Email: {{email}}</p>
      <p style="margin: 5px 0 0 0;">Phone: {{phone}}</p>
      <p style="margin: 5px 0 0 0;">Location: {{location}}</p>
      <p style="margin: 5px 0 0 0;">Plan: {{plan}}</p>
      <p style="margin: 5px 0 0 0;">Amount: {{amount}}</p>
    </div>
    
    <div style="background-color: #dbeafe; padding: 15px; margin: 20px 0; border-radius: 5px;">
      <p style="margin: 0;"><strong>Action Required:</strong></p>
      <p>Please review the payment slip and activate this member''s account.</p>
      <p>You can access the admin dashboard to approve this payment:</p>
      <p><a href="{{dashboard_url}}/admin-users" style="color: #2563eb;">Review Payment</a></p>
    </div>
    
    <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
      This is an automated notification from the Basic Intelligence registration system.
    </p>
  </div>',
  'payment',
  true,
  true
)
ON CONFLICT (name) DO UPDATE SET
  subject = EXCLUDED.subject,
  content = EXCLUDED.content,
  updated_at = NOW();