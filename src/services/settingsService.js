import { supabase } from '../lib/supabase';
import { logger } from '../utils/logger';

export const settingsService = {
  // Get all admin settings
  async getAllSettings() {
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('*')
        .order('category, setting_key');

      if (error) {
        return { data: null, error: error.message };
      }

      // Transform settings into a structured object
      const settings = {};
      data?.forEach(setting => {
        if (!settings[setting.category]) {
          settings[setting.category] = {};
        }
        settings[setting.category][setting.setting_key] = setting.setting_value;
      });

      return { data: settings, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  },

  // Get settings by category
  async getSettingsByCategory(category) {
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('*')
        .eq('category', category)
        .order('setting_key');

      if (error) {
        return { data: null, error: error.message };
      }

      const settings = {};
      data?.forEach(setting => {
        settings[setting.setting_key] = setting.setting_value;
      });

      return { data: settings, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  },

  // Get a specific setting
  async getSetting(key) {
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('*')
        .eq('setting_key', key)
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: data.setting_value, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  },

  // Update a setting
  async updateSetting(key, value, type = 'string', category = 'general', description = null) {
    try {
      const { data, error } = await supabase
        .rpc('set_admin_setting', {
          setting_key_param: key,
          setting_value_param: value,
          setting_type_param: type,
          category_param: category,
          description_param: description
        });

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: { id: data, key, value }, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  },

  // Update multiple settings
  async updateMultipleSettings(settingsUpdates) {
    try {
      const results = [];
      
      for (const [key, value] of Object.entries(settingsUpdates)) {
        const { data, error } = await this.updateSetting(key, value);
        
        if (error) {
          return { data: null, error: `Failed to update ${key}: ${error}` };
        }
        
        results.push(data);
      }

      return { data: results, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  },

  // Update settings by category
  async updateCategorySettings(category, settings) {
    try {
      const updates = {};
      Object.entries(settings).forEach(([key, value]) => {
        updates[key] = value;
      });

      return await this.updateMultipleSettings(updates);
    } catch (error) {
      return { data: null, error: error.message };
    }
  },

  // Get system settings for public use (no auth required)
  async getPublicSettings() {
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('setting_key, setting_value')
        .in('setting_key', [
          'site_name',
          'site_description',
          'contact_email',
          'support_phone',
          'membership_plans'
        ]);

      if (error) {
        return { data: null, error: error.message };
      }

      const settings = {};
      data?.forEach(setting => {
        settings[setting.setting_key] = setting.setting_value;
      });

      return { data: settings, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  },

  // Reset settings to defaults
  async resetSettingsToDefaults() {
    try {
      const defaultSettings = {
        'site_name': 'Basic Intelligence Community School',
        'site_description': 'Premium intelligence and analytical training platform',
        'contact_email': 'admin@basicintelligence.com',
        'support_phone': '+2349062284074',
        'membership_plans': {
          basic: { price: 5000, features: ['Basic PDF Access', 'Community Access'] },
          premium: { price: 15000, features: ['Full PDF Library', 'Video Content', 'Priority Support'] },
          pro: { price: 25000, features: ['Everything', 'One-on-One Sessions', 'Custom Content'] }
        },
        'notifications': {
          email_notifications: true,
          sms_notifications: false,
          push_notifications: true
        },
        'security_settings': {
          session_timeout: 24,
          max_concurrent_sessions: 3,
          password_min_length: 8
        },
        'system_settings': {
          maintenance_mode: false,
          registration_enabled: true,
          payment_enabled: true
        }
      };

      const results = [];
      
      for (const [key, value] of Object.entries(defaultSettings)) {
        const { data, error } = await this.updateSetting(key, value);
        
        if (error) {
          return { data: null, error: `Failed to reset ${key}: ${error}` };
        }
        
        results.push(data);
      }

      return { data: results, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  },

  // Get settings for dashboard display
  async getDashboardSettings() {
    try {
      const { data, error } = await this.getAllSettings();
      
      if (error) {
        return { data: null, error: error.message };
      }

      // Transform for easier consumption in components
      const dashboardSettings = {
        general: {
          siteName: data?.general?.site_name || 'Basic Intelligence Community School',
          siteDescription: data?.general?.site_description || 'Premium intelligence and analytical training platform',
          contactEmail: data?.general?.contact_email || 'admin@basicintelligence.com',
          supportPhone: data?.general?.support_phone || '+2349062284074'
        },
        membership: {
          plans: data?.membership?.membership_plans || {
            basic: { price: 5000, features: ['Basic PDF Access', 'Community Access'] },
            premium: { price: 15000, features: ['Full PDF Library', 'Video Content', 'Priority Support'] },
            pro: { price: 25000, features: ['Everything', 'One-on-One Sessions', 'Custom Content'] }
          }
        },
        notifications: data?.notifications?.notifications || {
          email_notifications: true,
          sms_notifications: false,
          push_notifications: true
        },
        security: data?.security?.security_settings || {
          session_timeout: 24,
          max_concurrent_sessions: 3,
          password_min_length: 8
        },
        system: data?.system?.system_settings || {
          maintenance_mode: false,
          registration_enabled: true,
          payment_enabled: true
        }
      };

      return { data: dashboardSettings, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  }
};
