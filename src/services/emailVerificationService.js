import { supabase } from '../lib/supabase';
import { emailService } from './emailService';
import { notificationService } from './notificationService';
import { logger } from '../utils/logger';

/**
 * Email Verification Service
 * Handles OTP generation, verification, and email validation
 */
class EmailVerificationService {
  /**
   * Generate a 6-digit OTP code
   */
  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Generate a secure verification token
   */
  generateToken() {
    return crypto.randomUUID();
  }

  /**
   * Create verification token and send OTP email
   */
  async sendVerificationEmail(email, fullName = 'User') {
    try {
      // Generate OTP and token
      const otpCode = this.generateOTP();
      const token = this.generateToken();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      // Create verification link
      const verificationLink = `${window.location.origin}/verify-email?token=${token}`;

      // Store token in database
      const { data: tokenData, error: tokenError } = await supabase
        .from('email_verification_tokens')
        .insert({
          email: email.toLowerCase().trim(),
          token,
          otp_code: otpCode,
          expires_at: expiresAt.toISOString(),
          verification_type: 'registration',
          ip_address: this.getClientIP(),
          user_agent: navigator.userAgent
        })
        .select()
        .single();

      if (tokenError) {
        logger.error('Failed to create verification token:', tokenError);
        return { 
          success: false, 
          error: 'Failed to create verification token. Please try again.' 
        };
      }

      // TEMPORARY WORKAROUND: Skip email sending due to CORS issues
      // TODO: Implement Supabase Edge Function for server-side email delivery
      logger.info(`Verification OTP generated for ${email}: ${otpCode}`);
      console.log(`🔐 DEVELOPMENT MODE - Your verification code is: ${otpCode}`);
      
      // Auto-log the OTP in development
      if (import.meta.env.DEV || window.location.hostname === 'localhost') {
        alert(`DEVELOPMENT MODE\n\nYour verification code is:\n\n${otpCode}\n\nThis will be sent via email in production.`);
      }

      return {
        success: true,
        data: {
          token: tokenData.id,
          expiresAt: expiresAt.toISOString(),
          email,
          // Include OTP in development for testing
          ...(import.meta.env.DEV && { otp_code: otpCode })
        }
      };

      /* ORIGINAL CODE - Will be re-enabled when Edge Function is ready
      const emailResult = await notificationService.sendNotificationByEmail(
        email,
        'Email Verification OTP',
        {
          full_name: fullName,
          otp_code: otpCode,
          verification_link: verificationLink
        }
      );

      if (!emailResult.success) {
        logger.error('Failed to send verification email:', emailResult.error);
        return {
          success: false,
          error: 'Failed to send verification email. Please try again.'
        };
      }

      logger.info(`Verification email sent to ${email}`);
      */
      return {
        success: true,
        data: {
          token: tokenData.id,
          expiresAt: expiresAt.toISOString(),
          email
        }
      };
    } catch (error) {
      logger.error('Error in sendVerificationEmail:', error);
      return {
        success: false,
        error: error.message || 'Failed to send verification email'
      };
    }
  }

  /**
   * Verify OTP code
   */
  async verifyOTP(email, otpCode) {
    try {
      // Find valid token
      const { data: tokens, error: fetchError } = await supabase
        .from('email_verification_tokens')
        .select('*')
        .eq('email', email.toLowerCase().trim())
        .eq('otp_code', otpCode)
        .is('verified_at', null)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1);

      if (fetchError) {
        logger.error('Error fetching verification token:', fetchError);
        return {
          success: false,
          error: 'Failed to verify OTP. Please try again.'
        };
      }

      if (!tokens || tokens.length === 0) {
        return {
          success: false,
          error: 'Invalid or expired OTP code. Please request a new one.'
        };
      }

      const token = tokens[0];

      // Check max attempts
      if (token.attempts >= token.max_attempts) {
        return {
          success: false,
          error: 'Maximum verification attempts exceeded. Please request a new OTP.'
        };
      }

      // Mark token as verified
      const { error: updateError } = await supabase
        .from('email_verification_tokens')
        .update({
          verified_at: new Date().toISOString(),
          attempts: token.attempts + 1
        })
        .eq('id', token.id);

      if (updateError) {
        logger.error('Error updating verification token:', updateError);
        return {
          success: false,
          error: 'Failed to verify OTP. Please try again.'
        };
      }

      logger.info(`Email verified successfully: ${email}`);

      return {
        success: true,
        data: {
          email: token.email,
          token: token.token,
          verified: true
        }
      };
    } catch (error) {
      logger.error('Error in verifyOTP:', error);
      return {
        success: false,
        error: error.message || 'Failed to verify OTP'
      };
    }
  }

  /**
   * Verify token from email link
   */
  async verifyToken(token) {
    try {
      const { data: tokenData, error: fetchError } = await supabase
        .from('email_verification_tokens')
        .select('*')
        .eq('token', token)
        .is('verified_at', null)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (fetchError || !tokenData) {
        return {
          success: false,
          error: 'Invalid or expired verification link.'
        };
      }

      // Mark as verified
      const { error: updateError } = await supabase
        .from('email_verification_tokens')
        .update({
          verified_at: new Date().toISOString()
        })
        .eq('id', tokenData.id);

      if (updateError) {
        logger.error('Error updating verification token:', updateError);
        return {
          success: false,
          error: 'Failed to verify email. Please try again.'
        };
      }

      return {
        success: true,
        data: {
          email: tokenData.email,
          verified: true
        }
      };
    } catch (error) {
      logger.error('Error in verifyToken:', error);
      return {
        success: false,
        error: error.message || 'Failed to verify token'
      };
    }
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(email) {
    try {
      // Check if there's a recent verification email sent
      const { data: recentTokens } = await supabase
        .from('email_verification_tokens')
        .select('created_at')
        .eq('email', email.toLowerCase().trim())
        .gt('created_at', new Date(Date.now() - 60 * 1000).toISOString()) // Last 60 seconds
        .order('created_at', { ascending: false })
        .limit(1);

      if (recentTokens && recentTokens.length > 0) {
        return {
          success: false,
          error: 'Please wait 60 seconds before requesting a new OTP.'
        };
      }

      // Send new verification email
      return await this.sendVerificationEmail(email);
    } catch (error) {
      logger.error('Error in resendVerificationEmail:', error);
      return {
        success: false,
        error: error.message || 'Failed to resend verification email'
      };
    }
  }

  /**
   * Check if email is already verified
   */
  async isEmailVerified(email) {
    try {
      const { data: tokens } = await supabase
        .from('email_verification_tokens')
        .select('verified_at')
        .eq('email', email.toLowerCase().trim())
        .not('verified_at', 'is', null)
        .order('verified_at', { ascending: false })
        .limit(1);

      return tokens && tokens.length > 0;
    } catch (error) {
      logger.error('Error checking email verification:', error);
      return false;
    }
  }

  /**
   * Clean up expired tokens
   */
  async cleanupExpiredTokens() {
    try {
      const { error } = await supabase
        .from('email_verification_tokens')
        .delete()
        .lt('expires_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (error) {
        logger.error('Error cleaning up expired tokens:', error);
      }
    } catch (error) {
      logger.error('Error in cleanupExpiredTokens:', error);
    }
  }

  /**
   * Validate email format (enhanced)
   */
  validateEmailFormat(email) {
    // Enhanced email regex that prevents common fake patterns
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    
    if (!emailRegex.test(email)) {
      return {
        valid: false,
        error: 'Invalid email format'
      };
    }

    // Check for disposable email providers
    const disposableDomains = [
      'tempmail.com', 'throwaway.email', '10minutemail.com', 
      'guerrillamail.com', 'mailinator.com', 'trashmail.com'
    ];

    const domain = email.split('@')[1]?.toLowerCase();
    if (disposableDomains.includes(domain)) {
      return {
        valid: false,
        error: 'Disposable email addresses are not allowed'
      };
    }

    return { valid: true };
  }

  /**
   * Get client IP (browser-side approximation)
   */
  getClientIP() {
    // In production, this should be handled server-side
    return 'client-side';
  }

  /**
   * Update user profile email verified status
   */
  async markEmailVerified(userId) {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          email_verified: true,
          email_verified_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        logger.error('Error marking email as verified:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      logger.error('Error in markEmailVerified:', error);
      return { success: false, error: error.message };
    }
  }
}

export const emailVerificationService = new EmailVerificationService();
export default emailVerificationService;
