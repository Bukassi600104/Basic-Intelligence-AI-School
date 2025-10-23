-- Migration: Payment Confirmation Workflow
-- Adds necessary fields and templates for the new signup and payment confirmation workflow

-- 1. Add subscription_expiry field to user_profiles if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='user_profiles' AND column_name='subscription_expiry'
    ) THEN
        ALTER TABLE public.user_profiles 
        ADD COLUMN subscription_expiry TIMESTAMPTZ;
    END IF;
END $$;

-- 2. Add payment_slip_url to subscription_requests table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='subscription_requests' AND column_name='payment_slip_url'
    ) THEN
        ALTER TABLE public.subscription_requests 
        ADD COLUMN payment_slip_url TEXT;
    END IF;
END $$;

-- 3. Insert welcome notification template for new signups
INSERT INTO public.notification_templates (name, subject, content, category, is_active, is_system_template)
VALUES (
    'user_welcome_pending_activation',
    'Welcome to Basic Intelligence Community - Account Pending Activation',
    '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Welcome to Basic Intelligence Community, {{full_name}}!</h2>
        <p>Thank you for registering with us. We''re excited to have you join our AI learning community.</p>
        
        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #92400e;"><strong>⏳ Your Account Status:</strong> Pending Activation</p>
            <p style="margin: 10px 0 0 0; color: #92400e;">Your account will be activated within <strong>48 hours</strong> after we confirm your payment.</p>
        </div>
        
        <h3 style="color: #2563eb;">Next Steps:</h3>
        <ol style="line-height: 1.8;">
            <li>Check your dashboard for payment instructions</li>
            <li>Make payment using the provided account details</li>
            <li>Upload your payment slip in the dashboard</li>
            <li>Click "I have made payment" to notify us</li>
        </ol>
        
        <p>Once we verify your payment, you''ll receive an email notification and your account will be activated immediately.</p>
        
        <div style="background-color: #dbeafe; padding: 15px; margin: 20px 0; border-radius: 5px;">
            <p style="margin: 0;"><strong>Your Account Details:</strong></p>
            <p style="margin: 5px 0 0 0;">Email: {{email}}</p>
            <p style="margin: 5px 0 0 0;">Member ID: {{member_id}}</p>
            <p style="margin: 5px 0 0 0;">Selected Plan: {{membership_tier}}</p>
        </div>
        
        <p>If you have any questions, please contact our support team.</p>
        
        <p style="margin-top: 30px;">Best regards,<br>The Basic Intelligence Team</p>
    </div>',
    'activation',
    true,
    true
)
ON CONFLICT (name) DO UPDATE SET
    subject = EXCLUDED.subject,
    content = EXCLUDED.content,
    updated_at = NOW();

-- 4. Insert account activation confirmation template
INSERT INTO public.notification_templates (name, subject, content, category, is_active, is_system_template)
VALUES (
    'account_activated_confirmation',
    'Your Account Has Been Activated! 🎉',
    '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #10b981; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0;">
            <h2 style="margin: 0;">🎉 Account Activated!</h2>
        </div>
        
        <div style="padding: 20px; background-color: #f9fafb;">
            <p>Dear {{full_name}},</p>
            <p>Great news! Your payment has been confirmed and your account is now <strong>active</strong>.</p>
            
            <div style="background-color: white; padding: 20px; margin: 20px 0; border-radius: 5px; border: 2px solid #10b981;">
                <h3 style="color: #2563eb; margin-top: 0;">Your Login Details:</h3>
                <p style="margin: 5px 0;"><strong>Email:</strong> {{email}}</p>
                <p style="margin: 5px 0;"><strong>Member ID:</strong> {{member_id}}</p>
                <p style="margin: 5px 0;"><strong>Membership Plan:</strong> {{membership_tier}}</p>
                <p style="margin: 5px 0;"><strong>Subscription Expires:</strong> {{subscription_expiry}}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="{{dashboard_url}}" style="background-color: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                    Access Your Dashboard
                </a>
            </div>
            
            <h3 style="color: #2563eb;">What You Can Do Now:</h3>
            <ul style="line-height: 1.8;">
                <li>Access all learning materials for your plan</li>
                <li>Download PDFs and watch video tutorials</li>
                <li>Access prompt libraries and resources</li>
                <li>Track your learning progress</li>
            </ul>
            
            <p style="margin-top: 30px;">Welcome to the community! 🚀</p>
            <p style="margin-top: 10px;">Best regards,<br>The Basic Intelligence Team</p>
        </div>
    </div>',
    'activation',
    true,
    true
)
ON CONFLICT (name) DO UPDATE SET
    subject = EXCLUDED.subject,
    content = EXCLUDED.content,
    updated_at = NOW();

-- 5. Insert admin notification for new signup/renewal requests
INSERT INTO public.notification_templates (name, subject, content, category, is_active, is_system_template)
VALUES (
    'admin_payment_request_notification',
    'New Payment Request - {{request_type}} from {{full_name}}',
    '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">⚡ New Payment Request</h2>
        
        <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Request Type:</strong> {{request_type}}</p>
        </div>
        
        <h3>Member Details:</h3>
        <table style="width: 100%; border-collapse: collapse;">
            <tr>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Name:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">{{full_name}}</td>
            </tr>
            <tr>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Email:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">{{email}}</td>
            </tr>
            <tr>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Member ID:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">{{member_id}}</td>
            </tr>
            <tr>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Current Plan:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">{{current_plan}}</td>
            </tr>
            <tr>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Requested Plan:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">{{requested_plan}}</td>
            </tr>
            <tr>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Amount:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">₦{{payment_amount}}</td>
            </tr>
        </table>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{dashboard_url}}/admin-users" style="background-color: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                Review Request
            </a>
        </div>
        
        <p style="color: #6b7280; font-size: 14px;">This is an automated notification from your Basic Intelligence admin system.</p>
    </div>',
    'subscription',
    true,
    true
)
ON CONFLICT (name) DO UPDATE SET
    subject = EXCLUDED.subject,
    content = EXCLUDED.content,
    updated_at = NOW();

-- 6. Create index for faster queries on subscription_expiry
CREATE INDEX IF NOT EXISTS idx_user_profiles_subscription_expiry 
ON public.user_profiles(subscription_expiry) 
WHERE subscription_expiry IS NOT NULL;

-- 7. Create function to auto-lock expired accounts
CREATE OR REPLACE FUNCTION public.check_and_lock_expired_subscriptions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.user_profiles
    SET 
        membership_status = 'expired'::public.membership_status,
        updated_at = NOW()
    WHERE 
        subscription_expiry < NOW()
        AND membership_status = 'active'::public.membership_status
        AND role = 'student'::public.user_role;
END;
$$;

COMMENT ON FUNCTION public.check_and_lock_expired_subscriptions() IS 'Automatically locks accounts when subscription expires';
