import { supabase } from '../lib/supabase';
import { notificationService } from './notificationService';

export const subscriptionService = {
  // Subscription plans configuration
  SUBSCRIPTION_PLANS: {
    basic: {
      name: 'Basic Plan',
      price: 5000, // in Naira
      duration: 30, // days
      features: ['Access to basic courses', 'Community access', 'Email support']
    },
    premium: {
      name: 'Premium Plan',
      price: 15000,
      duration: 30,
      features: ['All courses access', 'Priority support', 'Advanced content', 'Community access']
    },
    pro: {
      name: 'Pro Plan',
      price: 25000,
      duration: 30,
      features: ['All courses access', '1-on-1 mentoring', 'Priority support', 'Exclusive content']
    }
  },

  // Get all available subscription plans
  getSubscriptionPlans() {
    return this.SUBSCRIPTION_PLANS;
  },

  // Get current subscription for a member
  async getCurrentSubscription(memberId) {
    try {
      const { data: member, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', memberId)
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      const currentPlan = member.subscription_plan || 'basic';
      const subscriptionEndDate = member.subscription_end_date;
      
      // Calculate days remaining
      let daysRemaining = 0;
      if (subscriptionEndDate) {
        const today = new Date();
        const endDate = new Date(subscriptionEndDate);
        daysRemaining = Math.max(0, Math.ceil((endDate - today) / (1000 * 60 * 60 * 24)));
      }

      return {
        success: true,
        data: {
          currentPlan,
          currentPlanName: this.SUBSCRIPTION_PLANS[currentPlan]?.name || 'Unknown Plan',
          subscriptionEndDate,
          daysRemaining,
          isActive: member.membership_status === 'active' && daysRemaining > 0
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Create renewal request
  async createRenewalRequest(memberId) {
    try {
      // Get current subscription details
      const currentSub = await this.getCurrentSubscription(memberId);
      if (!currentSub.success) {
        return currentSub;
      }

      const currentPlan = currentSub.data.currentPlan;
      const planDetails = this.SUBSCRIPTION_PLANS[currentPlan];

      // Create subscription request
      const { data: request, error } = await supabase
        .from('subscription_requests')
        .insert({
          member_id: memberId,
          request_type: 'renewal',
          current_plan: currentPlan,
          requested_plan: currentPlan, // Same plan for renewal
          payment_amount: planDetails.price,
          payment_status: 'pending',
          status: 'pending'
        })
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return {
        success: true,
        data: request,
        message: 'Renewal request created successfully. Please complete payment.'
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Create upgrade request
  async createUpgradeRequest(memberId, newPlan) {
    try {
      // Validate the new plan
      if (!this.SUBSCRIPTION_PLANS[newPlan]) {
        return { success: false, error: 'Invalid subscription plan' };
      }

      // Get current subscription details
      const currentSub = await this.getCurrentSubscription(memberId);
      if (!currentSub.success) {
        return currentSub;
      }

      const currentPlan = currentSub.data.currentPlan;
      const newPlanDetails = this.SUBSCRIPTION_PLANS[newPlan];

      // Create subscription request
      const { data: request, error } = await supabase
        .from('subscription_requests')
        .insert({
          member_id: memberId,
          request_type: 'upgrade',
          current_plan: currentPlan,
          requested_plan: newPlan,
          payment_amount: newPlanDetails.price,
          payment_status: 'pending',
          status: 'pending'
        })
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return {
        success: true,
        data: request,
        message: 'Upgrade request created successfully. Please complete payment.'
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Update payment status for a subscription request
  async updatePaymentStatus(requestId, paymentStatus, paymentReference = null) {
    try {
      const updateData = {
        payment_status: paymentStatus,
        updated_at: new Date().toISOString()
      };

      if (paymentReference) {
        updateData.payment_reference = paymentReference;
      }

      const { data: request, error } = await supabase
        .from('subscription_requests')
        .update(updateData)
        .eq('id', requestId)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: request };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Admin: Get all pending subscription requests
  async getPendingRequests() {
    try {
      const { data: requests, error } = await supabase
        .from('subscription_requests')
        .select(`
          *,
          user_profiles (
            id,
            full_name,
            email,
            member_id,
            membership_status
          )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: requests };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Admin: Approve subscription request
  async approveRequest(requestId, adminId) {
    try {
      // Get the request details
      const { data: request, error: requestError } = await supabase
        .from('subscription_requests')
        .select('*')
        .eq('id', requestId)
        .single();

      if (requestError) {
        return { success: false, error: 'Request not found' };
      }

      if (request.status !== 'pending') {
        return { success: false, error: 'Request already processed' };
      }

      // Update the request status
      const { error: updateError } = await supabase
        .from('subscription_requests')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: adminId
        })
        .eq('id', requestId);

      if (updateError) {
        return { success: false, error: updateError.message };
      }

      // Update the member's subscription
      const memberId = request.member_id;
      let updateData = {};

      if (request.request_type === 'renewal') {
        // Renewal: Extend the subscription end date
        const { data: member } = await supabase
          .from('user_profiles')
          .select('subscription_end_date')
          .eq('id', memberId)
          .single();

        let newEndDate;
        if (member.subscription_end_date) {
          const currentEndDate = new Date(member.subscription_end_date);
          newEndDate = new Date(currentEndDate);
          newEndDate.setDate(newEndDate.getDate() + 30); // Add 30 days
        } else {
          newEndDate = new Date();
          newEndDate.setDate(newEndDate.getDate() + 30);
        }

        updateData = {
          subscription_plan: request.current_plan,
          subscription_end_date: newEndDate.toISOString(),
          membership_status: 'active'
        };
      } else if (request.request_type === 'upgrade') {
        // Upgrade: Change plan and adjust end date
        const { data: member } = await supabase
          .from('user_profiles')
          .select('subscription_end_date')
          .eq('id', memberId)
          .single();

        let newEndDate;
        if (member.subscription_end_date) {
          // Keep the same end date, just change the plan
          newEndDate = member.subscription_end_date;
        } else {
          newEndDate = new Date();
          newEndDate.setDate(newEndDate.getDate() + 30);
        }

        updateData = {
          subscription_plan: request.requested_plan,
          subscription_end_date: newEndDate.toISOString(),
          membership_status: 'active'
        };
      }

      // Update member profile
      const { error: memberError } = await supabase
        .from('user_profiles')
        .update(updateData)
        .eq('id', memberId);

      if (memberError) {
        return { success: false, error: memberError.message };
      }

      // Send confirmation notification
      if (request.request_type === 'renewal') {
        await notificationService.sendRenewalConfirmation(memberId);
      } else if (request.request_type === 'upgrade') {
        await notificationService.sendUpgradeConfirmation(memberId, request.requested_plan);
      }

      return {
        success: true,
        message: `Subscription ${request.request_type} approved successfully`
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Admin: Reject subscription request
  async rejectRequest(requestId, adminId, reason) {
    try {
      const { error } = await supabase
        .from('subscription_requests')
        .update({
          status: 'rejected',
          rejection_reason: reason,
          approved_at: new Date().toISOString(),
          approved_by: adminId
        })
        .eq('id', requestId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, message: 'Request rejected successfully' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Get subscription request history for a member
  async getMemberRequestHistory(memberId) {
    try {
      const { data: requests, error } = await supabase
        .from('subscription_requests')
        .select('*')
        .eq('member_id', memberId)
        .order('created_at', { ascending: false });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: requests };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Check if member has pending requests
  async hasPendingRequests(memberId) {
    try {
      const { data: requests, error } = await supabase
        .from('subscription_requests')
        .select('id')
        .eq('member_id', memberId)
        .eq('status', 'pending')
        .limit(1);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, hasPending: requests.length > 0 };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Get subscription statistics for admin dashboard
  async getSubscriptionStats() {
    try {
      // Get total members
      const { data: members, error: membersError } = await supabase
        .from('user_profiles')
        .select('id, membership_status, subscription_plan, subscription_end_date');

      if (membersError) {
        return { success: false, error: membersError.message };
      }

      // Get pending requests
      const { data: pendingRequests, error: requestsError } = await supabase
        .from('subscription_requests')
        .select('id, request_type, status')
        .eq('status', 'pending');

      if (requestsError) {
        return { success: false, error: requestsError.message };
      }

      const today = new Date();
      const activeMembers = members.filter(member => 
        member.membership_status === 'active' && 
        member.subscription_end_date && 
        new Date(member.subscription_end_date) > today
      );

      const expiringSoon = activeMembers.filter(member => {
        const endDate = new Date(member.subscription_end_date);
        const daysUntilExpiry = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
        return daysUntilExpiry <= 10;
      });

      const stats = {
        totalMembers: members.length,
        activeMembers: activeMembers.length,
        expiringSoon: expiringSoon.length,
        pendingRequests: pendingRequests.length,
        renewalRequests: pendingRequests.filter(req => req.request_type === 'renewal').length,
        upgradeRequests: pendingRequests.filter(req => req.request_type === 'upgrade').length
      };

      return { success: true, data: stats };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};
