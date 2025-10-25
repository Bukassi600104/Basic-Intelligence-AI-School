/**
 * Member ID Service
 * Handles member ID generation, validation, and management
 * Format: BI#### (e.g., BI0001, BI0002, BI0150)
 * Admin format: ADMIN### (e.g., ADMIN001)
 */

import { supabase } from '../lib/supabase';
import { logger } from '../utils/logger';

export const memberIdService = {
  /**
   * Get preview of next member ID without incrementing counter
   * @returns {Promise<{success: boolean, memberId?: string, error?: string}>}
   */
  getNextMemberIdPreview: async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_next_member_id_preview');

      if (error) {
        logger.error('getNextMemberIdPreview error:', error);
        return { success: false, error: error.message };
      }

      return { success: true, memberId: data };
    } catch (error) {
      logger.error('getNextMemberIdPreview exception:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Generate and assign next member ID
   * This is called automatically by database trigger on user creation
   * @returns {Promise<{success: boolean, memberId?: string, error?: string}>}
   */
  generateNextMemberId: async () => {
    try {
      const { data, error } = await supabase
        .rpc('generate_next_member_id');

      if (error) {
        logger.error('generateNextMemberId error:', error);
        return { success: false, error: error.message };
      }

      return { success: true, memberId: data };
    } catch (error) {
      logger.error('generateNextMemberId exception:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Validate member ID format
   * Valid formats: BI#### (regular members) or ADMIN### (admin)
   * @param {string} memberId - Member ID to validate
   * @returns {boolean}
   */
  isValidFormat: (memberId) => {
    if (!memberId || typeof memberId !== 'string') {
      return false;
    }

    // Check for BI#### format (4 digits)
    const regularPattern = /^BI\d{4}$/;
    // Check for ADMIN### format (3 digits)
    const adminPattern = /^ADMIN\d{3}$/;

    return regularPattern.test(memberId) || adminPattern.test(memberId);
  },

  /**
   * Check if member ID already exists in database
   * @param {string} memberId - Member ID to check
   * @returns {Promise<{success: boolean, exists?: boolean, error?: string}>}
   */
  memberIdExists: async (memberId) => {
    try {
      const { data, error } = await supabase
        .rpc('member_id_exists', { check_member_id: memberId });

      if (error) {
        logger.error('memberIdExists error:', error);
        return { success: false, error: error.message };
      }

      return { success: true, exists: data };
    } catch (error) {
      logger.error('memberIdExists exception:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get member details by member ID
   * @param {string} memberId - Member ID to search for
   * @returns {Promise<{success: boolean, member?: object, error?: string}>}
   */
  getMemberByMemberId: async (memberId) => {
    try {
      const { data, error } = await supabase
        .rpc('get_member_by_member_id', { search_member_id: memberId });

      if (error) {
        logger.error('getMemberByMemberId error:', error);
        return { success: false, error: error.message };
      }

      if (!data || data.length === 0) {
        return { success: false, error: 'Member not found' };
      }

      return { success: true, member: data[0] };
    } catch (error) {
      logger.error('getMemberByMemberId exception:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Search members by partial member ID
   * Useful for autocomplete/typeahead
   * @param {string} searchTerm - Partial member ID to search
   * @returns {Promise<{success: boolean, members?: Array, error?: string}>}
   */
  searchByMemberId: async (searchTerm) => {
    try {
      if (!searchTerm || searchTerm.length < 2) {
        return { success: true, members: [] };
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, member_id, full_name, email, membership_tier, membership_status')
        .ilike('member_id', `%${searchTerm}%`)
        .order('member_id')
        .limit(10);

      if (error) {
        logger.error('searchByMemberId error:', error);
        return { success: false, error: error.message };
      }

      return { success: true, members: data || [] };
    } catch (error) {
      logger.error('searchByMemberId exception:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get current counter value
   * @returns {Promise<{success: boolean, counter?: object, error?: string}>}
   */
  getCounter: async () => {
    try {
      const { data, error } = await supabase
        .from('member_id_counter')
        .select('*')
        .eq('id', 1)
        .single();

      if (error) {
        logger.error('getCounter error:', error);
        return { success: false, error: error.message };
      }

      return { success: true, counter: data };
    } catch (error) {
      logger.error('getCounter exception:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Format member ID for display
   * Adds visual formatting for better readability
   * @param {string} memberId - Member ID to format
   * @returns {string}
   */
  formatForDisplay: (memberId) => {
    if (!memberId) return 'Not Assigned';
    
    // Add spacing for readability
    // BI0001 → BI 0001
    // ADMIN001 → ADMIN 001
    if (memberId.startsWith('BI')) {
      return `BI ${memberId.substring(2)}`;
    } else if (memberId.startsWith('ADMIN')) {
      return `ADMIN ${memberId.substring(5)}`;
    }
    
    return memberId;
  },

  /**
   * Parse formatted member ID back to standard format
   * BI 0001 → BI0001
   * @param {string} formatted - Formatted member ID
   * @returns {string}
   */
  parseFormatted: (formatted) => {
    if (!formatted) return '';
    return formatted.replace(/\s+/g, '');
  },

  /**
   * Get member ID statistics
   * @returns {Promise<{success: boolean, stats?: object, error?: string}>}
   */
  getStatistics: async () => {
    try {
      const { data: allUsers, error: allError } = await supabase
        .from('user_profiles')
        .select('member_id, role, membership_status')
        .not('member_id', 'is', null);

      if (allError) {
        return { success: false, error: allError.message };
      }

      const counter = await memberIdService.getCounter();

      const stats = {
        totalAssigned: allUsers?.length || 0,
        adminIds: allUsers?.filter(u => u.member_id?.startsWith('ADMIN')).length || 0,
        regularIds: allUsers?.filter(u => u.member_id?.startsWith('BI')).length || 0,
        activeMembers: allUsers?.filter(u => u.membership_status === 'active').length || 0,
        nextId: counter.success ? counter.counter.next_id : 'Unknown',
        lastAssigned: counter.success ? counter.counter.last_assigned : 'Unknown'
      };

      return { success: true, stats };
    } catch (error) {
      logger.error('getStatistics exception:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Validate member ID assignment for user
   * Checks if user already has member ID and validates format
   * @param {string} userId - User ID to check
   * @param {string} memberId - Member ID to validate
   * @returns {Promise<{success: boolean, valid: boolean, message?: string, error?: string}>}
   */
  validateAssignment: async (userId, memberId) => {
    try {
      // Check format
      if (!memberIdService.isValidFormat(memberId)) {
        return {
          success: true,
          valid: false,
          message: 'Invalid member ID format. Must be BI#### or ADMIN###'
        };
      }

      // Check if ID exists
      const existsResult = await memberIdService.memberIdExists(memberId);
      if (!existsResult.success) {
        return { success: false, error: existsResult.error };
      }

      if (existsResult.exists) {
        return {
          success: true,
          valid: false,
          message: 'Member ID already in use'
        };
      }

      // Check if user already has a member ID
      const { data: user, error: userError } = await supabase
        .from('user_profiles')
        .select('member_id')
        .eq('id', userId)
        .single();

      if (userError) {
        return { success: false, error: userError.message };
      }

      if (user.member_id && user.member_id !== memberId) {
        return {
          success: true,
          valid: false,
          message: `User already has member ID: ${user.member_id}`
        };
      }

      return { success: true, valid: true };
    } catch (error) {
      logger.error('validateAssignment exception:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Check if member ID can be used for login
   * Member ID must be assigned and user must be active
   * @param {string} memberId - Member ID to check
   * @returns {Promise<{success: boolean, canLogin?: boolean, user?: object, error?: string}>}
   */
  canUseForLogin: async (memberId) => {
    try {
      const result = await memberIdService.getMemberByMemberId(memberId);
      
      if (!result.success || !result.member) {
        return { success: true, canLogin: false };
      }

      const member = result.member;
      const canLogin = member.is_active !== false; // Allow if is_active is true or null

      return {
        success: true,
        canLogin,
        user: member
      };
    } catch (error) {
      logger.error('canUseForLogin exception:', error);
      return { success: false, error: error.message };
    }
  }
};
