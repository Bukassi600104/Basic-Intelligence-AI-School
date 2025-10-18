import { supabase } from '../lib/supabase';
import { logger } from '../utils/logger';
import { emailService } from './emailService';

export const notificationService = {
  // Automated notification types
  NOTIFICATION_TYPES: {
    ACTIVATION_REMINDER: 'activation_reminder',
    ACTIVATION_CONFIRMATION: 'activation_confirmation',
    SUBSCRIPTION_EXPIRY_10: 'subscription_expiry_10',
    SUBSCRIPTION_EXPIRY_7: 'subscription_expiry_7',
    SUBSCRIPTION_EXPIRY_2: 'subscription_expiry_2',
    RENEWAL_CONFIRMATION: 'renewal_confirmation',
    UPGRADE_CONFIRMATION: 'upgrade_confirmation'
  },

  // Send activation reminder (48 hours after signup)
  async sendActivationReminder(memberId) {
    try {
      const { data: member, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', memberId)
        .single();

      if (error || !member) {
        logger.error('Member not found for activation reminder:', memberId);
        return { success: false, error: 'Member not found' };
      }

      // Check if member is still pending activation
      if (member.membership_status !== 'pending') {
        return { success: false, error: 'Member already activated' };
      }

      const templateContent = `
Dear ${member.full_name || 'Member'},

This is a reminder that your account is still awaiting activation. Please complete your registration process to access all our premium AI education content.

If you have any questions, please contact our support team.

Best regards,
The Basic Intelligence Team
      `;

      const result = await emailService.sendEmailToMember(
        memberId,
        'Account Activation Reminder - Basic Intelligence Community',
        templateContent,
        'announcement'
      );

      // Log the automated notification
      await this.logAutomatedNotification({
        notification_type: this.NOTIFICATION_TYPES.ACTIVATION_REMINDER,
        member_id: memberId,
        subject: 'Account Activation Reminder - Basic Intelligence Community',
        content: templateContent,
        status: result.success ? 'sent' : 'failed',
        metadata: { member_email: member.email }
      });

      return result;
    } catch (error) {
      logger.error('Error sending activation reminder:', error);
      return { success: false, error: error.message };
    }
  },

  // Send activation confirmation
  async sendActivationConfirmation(memberId) {
    try {
      const { data: member, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', memberId)
        .single();

      if (error || !member) {
        logger.error('Member not found for activation confirmation:', memberId);
        return { success: false, error: 'Member not found' };
      }

      const templateContent = `
Dear ${member.full_name || 'Member'},

Congratulations! Your account has been successfully activated. You now have full access to our premium AI education platform.

Explore our courses, connect with other members, and start your AI learning journey today!

Best regards,
The Basic Intelligence Team
      `;

      const result = await emailService.sendEmailToMember(
        memberId,
        'Welcome to Basic Intelligence Community!',
        templateContent,
        'announcement'
      );

      // Log the automated notification
      await this.logAutomatedNotification({
        notification_type: this.NOTIFICATION_TYPES.ACTIVATION_CONFIRMATION,
        member_id: memberId,
        subject: 'Welcome to Basic Intelligence Community!',
        content: templateContent,
        status: result.success ? 'sent' : 'failed',
        metadata: { member_email: member.email }
      });

      return result;
    } catch (error) {
      logger.error('Error sending activation confirmation:', error);
      return { success: false, error: error.message };
    }
  },

  // Send subscription expiry notifications
  async sendSubscriptionExpiryNotification(memberId, daysUntilExpiry) {
    try {
      const { data: member, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', memberId)
        .single();

      if (error || !member) {
        logger.error('Member not found for expiry notification:', memberId);
        return { success: false, error: 'Member not found' };
      }

      let subject, content;
      
      switch (daysUntilExpiry) {
        case 10:
          subject = 'Subscription Expiring in 10 Days';
          content = `
Dear ${member.full_name || 'Member'},

Your current subscription will expire in 10 days. To continue enjoying uninterrupted access to our premium content, please renew your subscription.

You can renew from your dashboard to ensure seamless access.

Best regards,
The Basic Intelligence Team
          `;
          break;
        case 7:
          subject = 'Subscription Expiring in 7 Days';
          content = `
Dear ${member.full_name || 'Member'},

Your subscription is expiring in 7 days. Don't miss out on our premium AI education content!

Renew now to maintain access to all courses and features.

Best regards,
The Basic Intelligence Team
          `;
          break;
        case 2:
          subject = 'Subscription Expiring in 2 Days - Urgent';
          content = `
Dear ${member.full_name || 'Member'},

URGENT: Your subscription expires in 2 days! 

Renew immediately to avoid interruption in your learning journey. You can renew directly from your dashboard.

Best regards,
The Basic Intelligence Team
          `;
          break;
        default:
          subject = 'Subscription Expiry Notice';
          content = `
Dear ${member.full_name || 'Member'},

Your subscription will expire soon. Please renew to continue accessing our premium content.

Best regards,
The Basic Intelligence Team
          `;
      }

      const result = await emailService.sendEmailToMember(
        memberId,
        subject,
        content,
        'announcement'
      );

      // Log the automated notification
      const notificationType = daysUntilExpiry === 10 
        ? this.NOTIFICATION_TYPES.SUBSCRIPTION_EXPIRY_10
        : daysUntilExpiry === 7 
        ? this.NOTIFICATION_TYPES.SUBSCRIPTION_EXPIRY_7
        : this.NOTIFICATION_TYPES.SUBSCRIPTION_EXPIRY_2;

      await this.logAutomatedNotification({
        notification_type: notificationType,
        member_id: memberId,
        subject: subject,
        content: content,
        status: result.success ? 'sent' : 'failed',
        metadata: { 
          member_email: member.email,
          days_until_expiry: daysUntilExpiry
        }
      });

      return result;
    } catch (error) {
      logger.error('Error sending subscription expiry notification:', error);
      return { success: false, error: error.message };
    }
  },

  // Send renewal confirmation
  async sendRenewalConfirmation(memberId) {
    try {
      const { data: member, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', memberId)
        .single();

      if (error || !member) {
        logger.error('Member not found for renewal confirmation:', memberId);
        return { success: false, error: 'Member not found' };
      }

      const templateContent = `
Dear ${member.full_name || 'Member'},

Great news! Your subscription renewal has been confirmed. Your access to our premium AI education platform has been extended.

Thank you for continuing your learning journey with us!

Best regards,
The Basic Intelligence Team
      `;

      const result = await emailService.sendEmailToMember(
        memberId,
        'Subscription Renewal Confirmed',
        templateContent,
        'announcement'
      );

      // Log the automated notification
      await this.logAutomatedNotification({
        notification_type: this.NOTIFICATION_TYPES.RENEWAL_CONFIRMATION,
        member_id: memberId,
        subject: 'Subscription Renewal Confirmed',
        content: templateContent,
        status: result.success ? 'sent' : 'failed',
        metadata: { member_email: member.email }
      });

      return result;
    } catch (error) {
      logger.error('Error sending renewal confirmation:', error);
      return { success: false, error: error.message };
    }
  },

  // Send upgrade confirmation
  async sendUpgradeConfirmation(memberId, newPlan) {
    try {
      const { data: member, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', memberId)
        .single();

      if (error || !member) {
        logger.error('Member not found for upgrade confirmation:', memberId);
        return { success: false, error: 'Member not found' };
      }

      const templateContent = `
Dear ${member.full_name || 'Member'},

Congratulations! Your subscription upgrade to ${newPlan} has been confirmed. You now have access to enhanced features and content.

Enjoy your upgraded learning experience!

Best regards,
The Basic Intelligence Team
      `;

      const result = await emailService.sendEmailToMember(
        memberId,
        'Subscription Upgrade Confirmed',
        templateContent,
        'announcement'
      );

      // Log the automated notification
      await this.logAutomatedNotification({
        notification_type: this.NOTIFICATION_TYPES.UPGRADE_CONFIRMATION,
        member_id: memberId,
        subject: 'Subscription Upgrade Confirmed',
        content: templateContent,
        status: result.success ? 'sent' : 'failed',
        metadata: { 
          member_email: member.email,
          new_plan: newPlan
        }
      });

      return result;
    } catch (error) {
      logger.error('Error sending upgrade confirmation:', error);
      return { success: false, error: error.message };
    }
  },

  // Check for pending activations (48-hour reminder)
  async checkPendingActivations() {
    try {
      const fortyEightHoursAgo = new Date();
      fortyEightHoursAgo.setHours(fortyEightHoursAgo.getHours() - 48);

      const { data: pendingMembers, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('membership_status', 'pending')
        .lt('created_at', fortyEightHoursAgo.toISOString());

      if (error) {
        logger.error('Error fetching pending members:', error);
        return { success: false, error: error.message };
      }

      const results = [];
      for (const member of pendingMembers) {
        const result = await this.sendActivationReminder(member.id);
        results.push({
          memberId: member.id,
          memberEmail: member.email,
          success: result.success,
          error: result.error
        });
      }

      return {
        success: true,
        results,
        summary: {
          total: pendingMembers.length,
          sent: results.filter(r => r.success).length,
          failed: results.filter(r => !r.success).length
        }
      };
    } catch (error) {
      logger.error('Error checking pending activations:', error);
      return { success: false, error: error.message };
    }
  },

  // Check for expiring subscriptions
  async checkExpiringSubscriptions() {
    try {
      const today = new Date();
      
      // 10 days from now
      const tenDaysFromNow = new Date();
      tenDaysFromNow.setDate(today.getDate() + 10);
      
      // 7 days from now
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(today.getDate() + 7);
      
      // 2 days from now
      const twoDaysFromNow = new Date();
      twoDaysFromNow.setDate(today.getDate() + 2);

      // Get active members with subscriptions expiring soon
      const { data: expiringMembers, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('membership_status', 'active')
        .not('subscription_end_date', 'is', null);

      if (error) {
        logger.error('Error fetching expiring members:', error);
        return { success: false, error: error.message };
      }

      const results = [];
      for (const member of expiringMembers) {
        if (!member.subscription_end_date) continue;

        const expiryDate = new Date(member.subscription_end_date);
        const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));

        let shouldSend = false;
        let daysToSend = null;

        if (daysUntilExpiry === 10) {
          shouldSend = true;
          daysToSend = 10;
        } else if (daysUntilExpiry === 7) {
          shouldSend = true;
          daysToSend = 7;
        } else if (daysUntilExpiry === 2) {
          shouldSend = true;
          daysToSend = 2;
        }

        if (shouldSend) {
          const result = await this.sendSubscriptionExpiryNotification(member.id, daysToSend);
          results.push({
            memberId: member.id,
            memberEmail: member.email,
            daysUntilExpiry: daysToSend,
            success: result.success,
            error: result.error
          });
        }
      }

      return {
        success: true,
        results,
        summary: {
          total: results.length,
          sent: results.filter(r => r.success).length,
          failed: results.filter(r => !r.success).length
        }
      };
    } catch (error) {
      logger.error('Error checking expiring subscriptions:', error);
      return { success: false, error: error.message };
    }
  },

  // Log automated notification (fallback to email_logs if automated_notifications table doesn't exist)
  async logAutomatedNotification(notificationData) {
    try {
      // Try to insert into automated_notifications table
      const { error } = await supabase
        .from('automated_notifications')
        .insert({
          notification_type: notificationData.notification_type,
          member_id: notificationData.member_id,
          subject: notificationData.subject,
          content: notificationData.content,
          template: notificationData.template || 'default',
          status: notificationData.status,
          sent_at: new Date().toISOString(),
          metadata: notificationData.metadata || {}
        });

      if (error) {
        // Fallback to email_logs table
        logger.warn('Automated notifications table not available, falling back to email_logs');
        await supabase
          .from('email_logs')
          .insert({
            member_id: notificationData.member_id,
            email: notificationData.metadata?.member_email || '',
            subject: notificationData.subject,
            content: notificationData.content,
            template: notificationData.template || 'default',
            status: notificationData.status,
            error_message: notificationData.error,
            sent_at: new Date().toISOString()
          });
      }
    } catch (error) {
      logger.error('Error logging automated notification:', error);
    }
  },

  // Get notification statistics
  async getNotificationStats() {
    try {
      // Try to get from automated_notifications table
      const { data: automatedData, error: automatedError } = await supabase
        .from('automated_notifications')
        .select('notification_type, status, sent_at');

      if (!automatedError && automatedData) {
        const stats = {
          total: automatedData.length,
          sent: automatedData.filter(n => n.status === 'sent').length,
          failed: automatedData.filter(n => n.status === 'failed').length,
          by_type: {}
        };

        // Group by notification type
        automatedData.forEach(notification => {
          if (!stats.by_type[notification.notification_type]) {
            stats.by_type[notification.notification_type] = {
              total: 0,
              sent: 0,
              failed: 0
            };
          }
          stats.by_type[notification.notification_type].total++;
          if (notification.status === 'sent') {
            stats.by_type[notification.notification_type].sent++;
          } else if (notification.status === 'failed') {
            stats.by_type[notification.notification_type].failed++;
          }
        });

        return { success: true, data: stats };
      }

      // Fallback to email_logs if automated_notifications doesn't exist
      const { data: emailData, error: emailError } = await supabase
        .from('email_logs')
        .select('status, sent_at');

      if (emailError) {
        return { success: false, error: emailError.message };
      }

      const stats = {
        total: emailData.length,
        sent: emailData.filter(email => email.status === 'sent').length,
        failed: emailData.filter(email => email.status === 'failed').length,
        today: emailData.filter(email => {
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
