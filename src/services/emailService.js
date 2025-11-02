import { supabase } from '../lib/supabase';
import { logger } from '../utils/logger';
// Note: Resend SDK removed - emails should be sent via Supabase Edge Functions (server-side)
// import { Resend } from 'resend';

export const emailService = {
  // Send email to single member
  async sendEmailToMember(memberId, subject, content, template = 'default') {
    try {
      // Get member details
      const { data: member, error: memberError } = await supabase
        .from('user_profiles')
        .select('email, full_name, member_id')
        .eq('id', memberId)
        .single();

      if (memberError || !member) {
        return { success: false, error: 'Member not found' };
      }

      // Send via Resend API with test domain (change to your verified domain in production)
      const emailResult = await this.sendEmailViaResend({
        to: member.email,
        subject,
        html: this.generateEmailTemplate(content, template, member),
        from: 'Basic Intelligence <onboarding@resend.dev>'
      });

      // Log the email in our database
      await this.logEmail({
        member_id: memberId,
        email: member.email,
        subject,
        content,
        template,
        status: emailResult.success ? 'sent' : 'failed',
        error_message: emailResult.error
      });

      return emailResult;
    } catch (error) {
      logger.error('Error sending email to member:', error);
      return { success: false, error: error.message };
    }
  },

  // Send email to multiple members
  async sendBulkEmail(memberIds, subject, content, template = 'default') {
    try {
      const results = [];
      
      for (const memberId of memberIds) {
        const result = await this.sendEmailToMember(memberId, subject, content, template);
        results.push({
          memberId,
          success: result.success,
          error: result.error
        });
      }

      return {
        success: true,
        results,
        summary: {
          total: memberIds.length,
          sent: results.filter(r => r.success).length,
          failed: results.filter(r => !r.success).length
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Send email to all members with specific filters
  async sendEmailToAllMembers(filters = {}, subject, content, template = 'default') {
    try {
      let query = supabase
        .from('user_profiles')
        .select('id, email, full_name, member_id, membership_status, role');

      // Apply filters
      if (filters.membershipStatus) {
        query = query.eq('membership_status', filters.membershipStatus);
      }
      if (filters.role) {
        query = query.eq('role', filters.role);
      }
      if (filters.activeOnly) {
        query = query.eq('membership_status', 'active');
      }

      const { data: members, error } = await query;

      if (error) {
        return { success: false, error: error.message };
      }

      const memberIds = members.map(member => member.id);
      return await this.sendBulkEmail(memberIds, subject, content, template);
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Simple send email method (used by notificationService)
  async sendEmail({ to, subject, html, from = 'Basic Intelligence <onboarding@resend.dev>' }) {
    try {
      return await this.sendEmailViaResend({ to, subject, html, from });
    } catch (error) {
      logger.error('Error in sendEmail:', error);
      return { success: false, error: error.message };
    }
  },

  // Email sending via Supabase Edge Function (server-side)
  // IMPORTANT: Resend API should NEVER be called from the client due to CORS and security
  async sendEmailViaResend(emailData) {
    try {
      logger.info('Sending email via Supabase Edge Function:', {
        to: emailData.to,
        subject: emailData.subject,
        from: emailData.from
      });

      // Call Supabase Edge Function to send email via Resend
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: emailData.to,
          from: emailData.from,
          subject: emailData.subject,
          html: emailData.html
        }
      });

      if (error) {
        logger.error('Edge Function error:', error);
        return { success: false, error: error.message || 'Failed to call Edge Function' };
      }

      logger.info('Email sent successfully via Edge Function:', { id: data?.id });
      return { success: true, data };
    } catch (error) {
      logger.error('Error in email service:', error);
      return { success: false, error: error.message || 'Failed to send email' };
    }
  },

  // Generate email templates
  generateEmailTemplate(content, template, member) {
    const templates = {
      default: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Basic Intelligence Community</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            .button { background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Basic Intelligence Community</h1>
              <p>Premium AI Education Platform</p>
            </div>
            <div class="content">
              <h2>Hello ${member.full_name || 'Member'}!</h2>
              ${content}
              <br><br>
              <p>Best regards,<br>The Basic Intelligence Team</p>
            </div>
            <div class="footer">
              <p>Basic Intelligence Community School<br>
              ${member.member_id ? `Member ID: ${member.member_id}` : ''}</p>
              <p><a href="https://basicai.fit" style="color: #667eea;">Visit our website</a></p>
            </div>
          </div>
        </body>
        </html>
      `,
      
      announcement: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Important Announcement</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            .urgent { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📢 Important Announcement</h1>
              <p>Basic Intelligence Community Update</p>
            </div>
            <div class="content">
              <div class="urgent">
                <strong>Important Update for ${member.full_name || 'Valued Member'}</strong>
              </div>
              ${content}
              <br><br>
              <p>Thank you for being part of our community!<br>The Basic Intelligence Team</p>
            </div>
            <div class="footer">
              <p>Basic Intelligence Community School</p>
              <p><a href="https://basicai.fit" style="color: #f5576c;">Learn more</a></p>
            </div>
          </div>
        </body>
        </html>
      `,
      
      course_update: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Course Content Available</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            .feature { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #4facfe; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎓 New Learning Content</h1>
              <p>Expand Your AI Skills</p>
            </div>
            <div class="content">
              <h2>Hello ${member.full_name || 'AI Enthusiast'}!</h2>
              <p>We're excited to share new learning materials with you:</p>
              ${content}
              <br>
              <div style="text-align: center;">
                <a href="https://basicai.fit/student-dashboard" style="background: #4facfe; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Access Your Dashboard</a>
              </div>
              <br>
              <p>Happy learning!<br>The Basic Intelligence Team</p>
            </div>
            <div class="footer">
              <p>Basic Intelligence Community School</p>
              <p><a href="https://basicai.fit/courses" style="color: #4facfe;">Browse all courses</a></p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    return templates[template] || templates.default;
  },

  // Log email in database
  async logEmail(emailData) {
    try {
      const { error } = await supabase
        .from('email_logs')
        .insert({
          member_id: emailData.member_id,
          email: emailData.email,
          subject: emailData.subject,
          content: emailData.content,
          template: emailData.template,
          status: emailData.status,
          error_message: emailData.error_message,
          sent_at: new Date().toISOString()
        });

      if (error) {
        logger.error('Error logging email:', error);
      }
    } catch (error) {
      logger.error('Error logging email:', error);
    }
  },

  // Get email history for a member
  async getEmailHistory(memberId, limit = 10) {
    try {
      const { data, error } = await supabase
        .from('email_logs')
        .select('*')
        .eq('member_id', memberId)
        .order('sent_at', { ascending: false })
        .limit(limit);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Get email statistics
  async getEmailStats() {
    try {
      const { data, error } = await supabase
        .from('email_logs')
        .select('status, sent_at');

      if (error) {
        return { success: false, error: error.message };
      }

      const stats = {
        total: data.length,
        sent: data.filter(email => email.status === 'sent').length,
        failed: data.filter(email => email.status === 'failed').length,
        today: data.filter(email => {
          const today = new Date().toDateString();
          const sentDate = new Date(email.sent_at).toDateString();
          return sentDate === today;
        }).length
      };

      return { success: true, data: stats };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};
