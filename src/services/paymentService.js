import { supabase } from '../lib/supabase';

export const paymentService = {
  // Get all payments (admin only)
  async getAllPayments() {
    try {
      const { data, error } = await supabase
        ?.from('payments')
        ?.select(`
          *,
          user:user_profiles!user_id(
            id,
            full_name,
            email,
            member_id,
            phone
          ),
          course:courses!course_id(
            id,
            title,
            price_naira
          )
        `)
        ?.order('created_at', { ascending: false })
      
      if (error) {
        return { data: null, error: error?.message };
      }
      
      return { data: data || [], error: null }
    } catch (error) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('NetworkError')) {
        return { data: null, error: 'Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.' }
      }
      return { data: null, error: error?.message || 'Failed to fetch payments' }
    }
  },

  // Get payments by status
  async getPaymentsByStatus(status) {
    try {
      const { data, error } = await supabase
        ?.from('payments')
        ?.select(`
          *,
          user:user_profiles!user_id(
            id,
            full_name,
            email,
            member_id,
            phone
          ),
          course:courses!course_id(
            id,
            title,
            price_naira
          )
        `)
        ?.eq('status', status)
        ?.order('created_at', { ascending: false })
      
      if (error) {
        return { data: null, error: error?.message };
      }
      
      return { data: data || [], error: null }
    } catch (error) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('NetworkError')) {
        return { data: null, error: 'Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.' }
      }
      return { data: null, error: error?.message || `Failed to fetch ${status} payments` }
    }
  },

  // Get pending payments
  async getPendingPayments() {
    return this.getPaymentsByStatus('pending')
  },

  // Create payment record
  async createPayment(paymentData) {
    try {
      const { data, error } = await supabase
        ?.from('payments')
        ?.insert([{
          ...paymentData,
          // Set user to pending status when payment is created
          user_id: paymentData.user_id
        }])
        ?.select(`
          *,
          user:user_profiles!user_id(
            id,
            full_name,
            email,
            member_id,
            phone,
            membership_status
          ),
          course:courses!course_id(
            id,
            title,
            price_naira
          )
        `)
        ?.single()
      
      if (error) {
        return { data: null, error: error?.message };
      }
      
      // Update user profile to pending status
      if (data?.user?.id) {
        await supabase
          ?.from('user_profiles')
          ?.update({
            membership_status: 'pending',
            updated_at: new Date()?.toISOString()
          })
          ?.eq('id', data?.user?.id);
      }
      
      return { data, error: null }
    } catch (error) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('NetworkError')) {
        return { data: null, error: 'Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.' }
      }
      return { data: null, error: error?.message || 'Failed to create payment record' }
    }
  },

  // Update payment status
  async updatePaymentStatus(paymentId, status, adminNotes = null) {
    try {
      const updateData = { 
        status, 
        updated_at: new Date()?.toISOString()
      };
      
      if (adminNotes) {
        updateData.admin_notes = adminNotes;
      }

      const { data, error } = await supabase
        ?.from('payments')
        ?.update(updateData)
        ?.eq('id', paymentId)
        ?.select(`
          *,
          user:user_profiles!user_id(
            id,
            full_name,
            email,
            member_id,
            phone
          ),
          course:courses!course_id(
            id,
            title,
            price_naira
          )
        `)
        ?.single()
      
      if (error) {
        return { data: null, error: error?.message };
      }
      
      return { data, error: null }
    } catch (error) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('NetworkError')) {
        return { data: null, error: 'Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.' }
      }
      return { data: null, error: error?.message || 'Failed to update payment status' }
    }
  },

  // Approve payment
  async approvePayment(paymentId, adminNotes = 'Payment approved by admin') {
    try {
      // Update payment status
      const { data: payment, error: paymentError } = await this.updatePaymentStatus(
        paymentId, 
        'completed', 
        adminNotes
      );
      
      if (paymentError) {
        return { data: null, error: paymentError };
      }

      // Generate member ID if user doesn't have one
      if (payment?.user && !payment?.user?.member_id) {
        const memberIdPrefix = 'BASIC-';
        const memberIdSuffix = payment?.user?.id?.substring(0, 8)?.toUpperCase();
        const memberId = `${memberIdPrefix}${memberIdSuffix}`;

        // Update user profile with member ID and active status
        const { error: userUpdateError } = await supabase
          ?.from('user_profiles')
          ?.update({
            member_id: memberId,
            membership_status: 'active',
            updated_at: new Date()?.toISOString()
          })
          ?.eq('id', payment?.user?.id)

        if (userUpdateError) {
          // Log error but don't fail the payment approval console.log('Failed to update user member ID:', userUpdateError?.message);
        }
      }
      
      return { data: payment, error: null }
    } catch (error) {
      return { data: null, error: error?.message || 'Failed to approve payment' }
    }
  },

  // Reject payment
  async rejectPayment(paymentId, reason = 'Payment rejected by admin') {
    return this.updatePaymentStatus(paymentId, 'failed', reason)
  },

  // Get user's payments
  async getUserPayments(userId) {
    try {
      const { data, error } = await supabase
        ?.from('payments')
        ?.select(`
          *,
          course:courses!course_id(
            id,
            title,
            price_naira,
            image_url
          )
        `)
        ?.eq('user_id', userId)
        ?.order('created_at', { ascending: false })
      
      if (error) {
        return { data: null, error: error?.message };
      }
      
      return { data: data || [], error: null }
    } catch (error) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('NetworkError')) {
        return { data: null, error: 'Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.' }
      }
      return { data: null, error: error?.message || 'Failed to fetch user payments' }
    }
  },

  // Get payment by ID
  async getPaymentById(paymentId) {
    try {
      const { data, error } = await supabase
        ?.from('payments')
        ?.select(`
          *,
          user:user_profiles!user_id(
            id,
            full_name,
            email,
            member_id,
            phone,
            location
          ),
          course:courses!course_id(
            id,
            title,
            price_naira,
            image_url
          )
        `)
        ?.eq('id', paymentId)
        ?.single()
      
      if (error) {
        return { data: null, error: error?.message };
      }
      
      return { data, error: null }
    } catch (error) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('NetworkError')) {
        return { data: null, error: 'Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.' }
      }
      return { data: null, error: error?.message || 'Failed to fetch payment details' }
    }
  },

  // Get payment statistics
  async getPaymentStats() {
    try {
      const { data: payments, error } = await supabase
        ?.from('payments')
        ?.select('status, amount_naira, created_at')
      
      if (error) {
        return { data: null, error: error?.message };
      }

      const stats = {
        total: payments?.length || 0,
        pending: payments?.filter(p => p?.status === 'pending')?.length || 0,
        completed: payments?.filter(p => p?.status === 'completed')?.length || 0,
        failed: payments?.filter(p => p?.status === 'failed')?.length || 0,
        refunded: payments?.filter(p => p?.status === 'refunded')?.length || 0,
        totalRevenue: payments
          ?.filter(p => p?.status === 'completed')
          ?.reduce((sum, p) => sum + (p?.amount_naira || 0), 0) || 0,
        thisMonth: {
          total: 0,
          revenue: 0
        }
      };

      // Calculate this month stats
      const now = new Date();
      const startOfMonth = new Date(now?.getFullYear(), now?.getMonth(), 1);
      
      const thisMonthPayments = payments?.filter(p => {
        const paymentDate = new Date(p?.created_at);
        return paymentDate >= startOfMonth;
      }) || [];

      stats.thisMonth.total = thisMonthPayments?.length;
      stats.thisMonth.revenue = thisMonthPayments
        ?.filter(p => p?.status === 'completed')
        ?.reduce((sum, p) => sum + (p?.amount_naira || 0), 0) || 0;
      
      return { data: stats, error: null }
    } catch (error) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('NetworkError')) {
        return { data: null, error: 'Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.' }
      }
      return { data: null, error: error?.message || 'Failed to fetch payment statistics' }
    }
  },

  // Delete payment (admin only - use with caution)
  async deletePayment(paymentId) {
    try {
      const { error } = await supabase
        ?.from('payments')
        ?.delete()
        ?.eq('id', paymentId)
      
      if (error) {
        return { error: error?.message };
      }
      
      return { error: null }
    } catch (error) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('NetworkError')) {
        return { error: 'Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.' }
      }
      return { error: error?.message || 'Failed to delete payment' }
    }
  }
}
