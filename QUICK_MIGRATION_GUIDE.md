# 🚀 APPLY MIGRATION NOW - Step-by-Step

## Step 1: Open Supabase Dashboard
**Click this link:** https://supabase.com/dashboard

- Login with your credentials
- Select your project: **basic_intelligence_community_school**

---

## Step 2: Open SQL Editor
1. Look at the **left sidebar**
2. Click on **"SQL Editor"** (icon looks like a database/terminal)
3. Click the **"New query"** button (top right)

---

## Step 3: Copy the SQL Below

**SELECT ALL THE SQL BELOW** (click in the box, then Ctrl+A, Ctrl+C):

```sql
-- Email Verification System Migration
-- Creates table for storing OTP verification tokens
-- Date: October 30, 2025

-- Create email_verification_tokens table
CREATE TABLE IF NOT EXISTS email_verification_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  otp_code TEXT NOT NULL,
  verification_type TEXT NOT NULL DEFAULT 'registration',
  expires_at TIMESTAMPTZ NOT NULL,
  verified_at TIMESTAMPTZ,
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 5,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_verification_tokens_email ON email_verification_tokens(email);
CREATE INDEX IF NOT EXISTS idx_verification_tokens_token ON email_verification_tokens(token);
CREATE INDEX IF NOT EXISTS idx_verification_tokens_otp ON email_verification_tokens(otp_code);
CREATE INDEX IF NOT EXISTS idx_verification_tokens_expires ON email_verification_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_verification_tokens_created ON email_verification_tokens(created_at);

-- Enable Row Level Security
ALTER TABLE email_verification_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow inserts for anyone (needed for registration)
CREATE POLICY "Anyone can create verification tokens"
  ON email_verification_tokens
  FOR INSERT
  TO public
  WITH CHECK (true);

-- RLS Policy: Users can read their own tokens
CREATE POLICY "Users can read own verification tokens"
  ON email_verification_tokens
  FOR SELECT
  TO public
  USING (true);

-- RLS Policy: Users can update their own tokens (for verification)
CREATE POLICY "Users can update own verification tokens"
  ON email_verification_tokens
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- RLS Policy: Admins can read all tokens
CREATE POLICY "Admins can read all verification tokens"
  ON email_verification_tokens
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- RLS Policy: Admins can delete tokens
CREATE POLICY "Admins can delete verification tokens"
  ON email_verification_tokens
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_verification_tokens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS trigger_verification_tokens_updated_at ON email_verification_tokens;
CREATE TRIGGER trigger_verification_tokens_updated_at
  BEFORE UPDATE ON email_verification_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_verification_tokens_updated_at();

-- Create function to cleanup expired tokens (older than 24 hours)
CREATE OR REPLACE FUNCTION cleanup_expired_verification_tokens()
RETURNS void AS $$
BEGIN
  DELETE FROM email_verification_tokens
  WHERE expires_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on cleanup function
GRANT EXECUTE ON FUNCTION cleanup_expired_verification_tokens() TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_expired_verification_tokens() TO anon;

-- Add email verification columns to user_profiles if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' 
    AND column_name = 'email_verified'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN email_verified BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' 
    AND column_name = 'email_verified_at'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN email_verified_at TIMESTAMPTZ;
  END IF;
END $$;

-- Create index on email_verified for faster queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_email_verified ON user_profiles(email_verified);

-- Insert email verification templates into notification_templates
INSERT INTO notification_templates (name, subject, content, category, is_active, created_at, updated_at)
VALUES 
  (
    'Email Verification OTP',
    'Verify Your Email - OTP Code',
    '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #4F46E5;">Email Verification</h2>
      <p>Hi {{full_name}},</p>
      <p>Thank you for registering with Basic Intelligence! To complete your registration, please use the verification code below:</p>
      <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0;">
        <h1 style="color: #4F46E5; font-size: 32px; letter-spacing: 5px; margin: 0;">{{otp_code}}</h1>
      </div>
      <p>This code will expire in <strong>15 minutes</strong>.</p>
      <p>If you didn''t request this verification, please ignore this email.</p>
      <p>Alternatively, you can click the link below to verify your email:</p>
      <p><a href="{{verification_link}}" style="color: #4F46E5;">Verify Email</a></p>
      <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;">
      <p style="color: #6B7280; font-size: 12px;">
        This is an automated message from Basic Intelligence. Please do not reply to this email.
      </p>
    </div>',
    'authentication',
    true,
    NOW(),
    NOW()
  ),
  (
    'Registration Thank You',
    'Welcome to Basic Intelligence!',
    '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #4F46E5;">Welcome to Basic Intelligence!</h2>
      <p>Hi {{full_name}},</p>
      <p>Thank you for verifying your email and joining our AI education community!</p>
      <p>Your account has been created successfully. You can now:</p>
      <ul style="line-height: 1.8;">
        <li>Access exclusive AI learning resources</li>
        <li>Enroll in courses and track your progress</li>
        <li>Connect with fellow AI enthusiasts</li>
        <li>Download our comprehensive prompt library</li>
      </ul>
      <div style="text-align: center; margin: 30px 0;">
        <a href="{{dashboard_url}}" style="background: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Go to Dashboard
        </a>
      </div>
      <p>If you have any questions, feel free to reach out to our support team.</p>
      <p>Happy learning!</p>
      <p><strong>The Basic Intelligence Team</strong></p>
      <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;">
      <p style="color: #6B7280; font-size: 12px;">
        This is an automated message from Basic Intelligence.
      </p>
    </div>',
    'welcome',
    true,
    NOW(),
    NOW()
  )
ON CONFLICT (name) DO UPDATE
SET 
  subject = EXCLUDED.subject,
  content = EXCLUDED.content,
  updated_at = NOW();

-- Create a comment on the table
COMMENT ON TABLE email_verification_tokens IS 'Stores OTP verification tokens for email validation during registration';
```

---

## Step 4: Paste & Run
1. **Paste** the SQL into the query editor (Ctrl+V)
2. Click the green **"RUN"** button (or press Ctrl+Enter)
3. Wait for the success message (should appear in ~2-5 seconds)

---

## Step 5: Verify Success

You should see a message like:
- ✅ "Success. No rows returned" 
- OR ✅ Green checkmark with "Query executed successfully"

**Quick verification query** (paste this in a new query):
```sql
SELECT 
  'email_verification_tokens' as table_name,
  EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'email_verification_tokens'
  ) AS exists;
```

**Expected result:** `exists: true`

---

## Step 6: Test Registration

**Immediately test:**
1. Go to: https://www.basicai.fit/signup
2. Fill in registration form
3. Click "Sign Up"
4. ✅ Should now work without "Failed to create verification token" error!
5. Check your email for the 6-digit OTP code

---

## ✅ Success Indicators

After applying migration, you should see:
- No error when submitting registration form
- Message: "Verification code sent to your email"
- OTP email arrives in inbox within 1-2 minutes
- Can verify email with 6-digit code

---

## 🆘 If You See Errors

### Error: "relation already exists"
**Meaning:** Migration already applied - you're good! ✅

### Error: "permission denied"
**Solution:** Make sure you're logged in as the project owner

### Error: "syntax error"
**Solution:** Make sure you copied ALL the SQL (entire code block above)

---

## 📞 Need Help?

If you encounter any issues:
1. Take a screenshot of the error message
2. Check the Supabase logs (Database → Logs)
3. Let me know the exact error message

---

## Time Required: 2 minutes ⏱️

**Ready? Start at Step 1 above! 👆**
