import { supabase } from '../lib/supabase';
import { emailService } from './emailService';
import { logger } from '../utils/logger';

export const notificationService = {
  // Send notification to user
  async sendNotification({ 
    userId, 
    templateName, 
    variables = {}, 
    recipientType = 'email' 
  }) {
    try {
      // Get user data
      const { data: user, error: userError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError) {
        throw new Error(`User not found: ${userError.message}`);
      }

      // Get notification template
      const { data: template, error: templateError } = await supabase
        .from('notification_templates')
        .select('*')
        .eq('name', templateName)
        .eq('is_active', true)
        .single();

      if (templateError) {
        throw new Error(`Template not found: ${templateError.message}`);
      }

      // Create notification log entry
      const { data: logEntry, error: logError } = await supabase
        .from('notification_logs')
        .insert({
          template_id: template.id,
          recipient_type: recipientType,
          recipient_email: user.email,
          recipient_phone: user.whatsapp_phone,
          subject: template.subject,
          content: template.content,
          status: 'pending'
        })
        .select()
        .single();

      if (logError) {
        throw new Error(`Failed to create log entry: ${logError.message}`);
      }

      // Process variables in template content
      const processedContent = this.processTemplate(template.content, {
        ...variables,
        full_name: user.full_name,
        email: user.email,
        member_id: user.member_id,
        membership_tier: user.membership_tier,
        subscription_expiry: user.subscription_expiry || 'Not set',
        dashboard_url: `${window.location.origin}/student-dashboard`
      });

      const processedSubject = this.processTemplate(template.subject, {
        ...variables,
        full_name: user.full_name
      });

      let notificationResult = { success: false, error: null };

      // Send notification based on type
      if (recipientType === 'email' || recipientType === 'both') {
        notificationResult = await this.sendEmailNotification({
          email: user.email,
          subject: processedSubject,
          content: processedContent,
          logId: logEntry.id
        });
      }

      if (recipientType === 'whatsapp' || recipientType === 'both') {
        if (user.whatsapp_phone) {
          const whatsappResult = await this.sendWhatsAppNotification({
            phone: user.whatsapp_phone,
            message: processedContent,
            logId: logEntry.id
          });
          
          // If email failed but WhatsApp succeeded, consider it a partial success
          if (!notificationResult.success && whatsappResult.success) {
            notificationResult = { success: true, error: null };
          }
        } else {
          logger.warn(`No WhatsApp number for user ${user.id}`);
        }
      }

      // Update log entry status
      await supabase
        .from('notification_logs')
        .update({
          status: notificationResult.success ? 'sent' : 'failed',
          error_message: notificationResult.error,
          sent_at: new Date().toISOString()
        })
        .eq('id', logEntry.id);

      return notificationResult;

    } catch (error) {
      logger.error('Notification service error:', error);
      return { success: false, error: error.message };
    }
  },

  // Send bulk notifications
  async sendBulkNotifications({ 
    userIds = [], 
    templateName, 
    variables = {}, 
    recipientType = 'email' 
  }) {
    const results = {
      total: userIds.length,
      successful: 0,
      failed: 0,
      details: []
    };

    for (const userId of userIds) {
      try {
        const result = await this.sendNotification({
          userId,
          templateName,
          variables,
          recipientType
        });

        results.details.push({
          userId,
          success: result.success,
          error: result.error
        });

        if (result.success) {
          results.successful++;
        } else {
          results.failed++;
        }
      } catch (error) {
        results.details.push({
          userId,
          success: false,
          error: error.message
        });
        results.failed++;
      }
    }

    return results;
  },

  // Send email notification
  async sendEmailNotification({ email, subject, content, logId }) {
    try {
      const result = await emailService.sendEmail({
        to: email,
        subject: subject,
        html: content.replace(/\n/g, '<br>')
      });

      if (result.success) {
        // Update log as delivered for email
        await supabase
          .from('notification_logs')
          .update({
            delivered_at: new Date().toISOString()
          })
          .eq('id', logId);

        return { success: true, error: null };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Send WhatsApp notification (placeholder - integrate with actual WhatsApp API)
  async sendWhatsAppNotification({ phone, message, logId }) {
    try {
      // TODO: Integrate with actual WhatsApp Business API or Twilio
      // For now, we'll simulate successful delivery
      logger.info(`WhatsApp message would be sent to ${phone}: ${message}`);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update log as delivered for WhatsApp
      await supabase
        .from('notification_logs')
        .update({
          delivered_at: new Date().toISOString()
        })
        .eq('id', logId);

      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Process template variables
  processTemplate(template, variables) {
    let processed = template;
    
    Object.keys(variables).forEach(key => {
      const placeholder = `{{${key}}}`;
      const value = variables[key] || '';
      processed = processed.replace(new RegExp(placeholder, 'g'), value);
    });

    return processed;
  },

  // Get notification templates
  async getTemplates(category = null) {
    try {
      let query = supabase
        .from('notification_templates')
        .select('*')
        .eq('is_active', true);

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query.order('name');

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: data || [], error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  },

  // Create new template
  async createTemplate(templateData) {
    try {
      const { data, error } = await supabase
        .from('notification_templates')
        .insert(templateData)
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  },

  // Update template
  async updateTemplate(templateId, updates) {
    try {
      const { data, error } = await supabase
        .from('notification_templates')
        .update(updates)
        .eq('id', templateId)
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  },

  // Get notification logs
  async getNotificationLogs(filters = {}) {
    try {
      let query = supabase
        .from('notification_logs')
        .select(`
          *,
          notification_templates(name, category),
          user_profiles:created_by(full_name)
        `)
        .order('created_at', { ascending: false });

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.recipientType) {
        query = query.eq('recipient_type', filters.recipientType);
      }

      if (filters.startDate && filters.endDate) {
        query = query.gte('created_at', filters.startDate)
                    .lte('created_at', filters.endDate);
      }

      const { data, error } = await query;

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: data || [], error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  },

  // Get notification statistics
  async getNotificationStats(timeRange = '30days') {
    try {
      let dateFilter = new Date();
      
      switch (timeRange) {
        case '7days':
          dateFilter.setDate(dateFilter.getDate() - 7);
          break;
        case '30days':
          dateFilter.setDate(dateFilter.getDate() - 30);
          break;
        case '90days':
          dateFilter.setDate(dateFilter.getDate() - 90);
          break;
        default:
          dateFilter.setDate(dateFilter.getDate() - 30);
      }

      const { data, error } = await supabase
        .from('notification_logs')
        .select('status, recipient_type, created_at')
        .gte('created_at', dateFilter.toISOString());

      if (error) {
        return { data: null, error: error.message };
      }

      const stats = {
        total: data.length,
        sent: data.filter(log => log.status === 'sent').length,
        delivered: data.filter(log => log.status === 'delivered').length,
        failed: data.filter(log => log.status === 'failed').length,
        pending: data.filter(log => log.status === 'pending').length,
        byType: {
          email: data.filter(log => log.recipient_type === 'email').length,
          whatsapp: data.filter(log => log.recipient_type === 'whatsapp').length,
          both: data.filter(log => log.recipient_type === 'both').length
        }
      };

      return { data: stats, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  }
};
