import { supabaseAdmin } from '../lib/supabaseAdmin';
import { logger } from '../utils/logger';

export const passwordService = {
  // Generate a secure random password
  generatePassword(length = 12) {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    
    // Ensure at least one of each required character type
    password += this.getRandomChar('abcdefghijklmnopqrstuvwxyz'); // lowercase
    password += this.getRandomChar('ABCDEFGHIJKLMNOPQRSTUVWXYZ'); // uppercase
    password += this.getRandomChar('0123456789'); // number
    password += this.getRandomChar('!@#$%^&*'); // special character
    
    // Fill the rest with random characters
    for (let i = password.length; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    // Shuffle the password to make it more random
    return this.shuffleString(password);
  },

  getRandomChar(charset) {
    return charset.charAt(Math.floor(Math.random() * charset.length));
  },

  shuffleString(str) {
    const array = str.split('');
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array.join('');
  },

  // Set password for a user using admin API
  async setUserPassword(userId, password) {
    try {
      const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        { password: password }
      );

      if (error) {
        logger.error('Password update error:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      logger.error('Password service error:', error);
      return { success: false, error: error.message };
    }
  },

  // Generate and set password for user
  async generateAndSetPassword(userId) {
    try {
      const password = this.generatePassword();
      const result = await this.setUserPassword(userId, password);

      if (result.success) {
        return { success: true, password, error: null };
      } else {
        return { success: false, password: null, error: result.error };
      }
    } catch (error) {
      return { success: false, password: null, error: error.message };
    }
  },

  // Validate password strength
  validatePasswordStrength(password) {
    const validations = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*]/.test(password)
    };

    const strength = Object.values(validations).filter(Boolean).length;
    const maxStrength = Object.keys(validations).length;

    return {
      isValid: strength === maxStrength,
      strength: (strength / maxStrength) * 100,
      validations
    };
  },

  // Get password strength label
  getPasswordStrengthLabel(strength) {
    if (strength >= 80) return { label: 'Strong', color: 'text-green-600' };
    if (strength >= 60) return { label: 'Good', color: 'text-blue-600' };
    if (strength >= 40) return { label: 'Fair', color: 'text-yellow-600' };
    return { label: 'Weak', color: 'text-red-600' };
  }
};
