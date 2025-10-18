import { supabase } from '../lib/supabase';
import { logger } from '../utils/logger';

export const adminService = {
  // Get dashboard statistics
  getDashboardStats: async () => {
    try {
      // Ensure all queries return proper promises with error handling
      const [
        usersResult,
        paymentsResult,
        coursesResult,
        enrollmentsResult,
        contentResult
      ] = await Promise.all([
        supabase?.from('user_profiles')?.select('id, membership_status, created_at')?.then(result => result || { data: [], error: null })?.catch(error => ({ data: [], error: error?.message || 'Unknown error' })),
        
        supabase?.from('payments')?.select('id, status, amount_naira, created_at')?.then(result => result || { data: [], error: null })?.catch(error => ({ data: [], error: error?.message || 'Unknown error' })),
        
        supabase?.from('courses')?.select('id, status, created_at')?.then(result => result || { data: [], error: null })?.catch(error => ({ data: [], error: error?.message || 'Unknown error' })),
        
        supabase?.from('course_enrollments')?.select('id, status, enrolled_at')?.then(result => result || { data: [], error: null })?.catch(error => ({ data: [], error: error?.message || 'Unknown error' })),
        
        supabase?.from('content_library')?.select('id, content_type, access_level, created_at')?.then(result => result || { data: [], error: null })?.catch(error => ({ data: [], error: error?.message || 'Unknown error' }))
      ]);

      const users = usersResult?.data || [];
      const payments = paymentsResult?.data || [];
      const courses = coursesResult?.data || [];
      const enrollments = enrollmentsResult?.data || [];
      const contentItems = contentResult?.data || [];

      // Calculate statistics
      const totalUsers = users?.length || 0;
      const activeMembers = users?.filter(u => u?.membership_status === 'active')?.length || 0;
      const pendingPayments = payments?.filter(p => p?.status === 'pending')?.length || 0;
      const completedPayments = payments?.filter(p => p?.status === 'completed') || [];
      const totalRevenue = completedPayments?.reduce((sum, p) => sum + (p?.amount_naira || 0), 0);
      
      // Recent registrations (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo?.setDate(thirtyDaysAgo?.getDate() - 30);
      const recentRegistrations = users?.filter(u => 
        new Date(u?.created_at) > thirtyDaysAgo
      )?.length || 0;

      // Course statistics
      const publishedCourses = courses?.filter(c => c?.status === 'published')?.length || 0;
      const draftCourses = courses?.filter(c => c?.status === 'draft')?.length || 0;
      const archivedCourses = courses?.filter(c => c?.status === 'archived')?.length || 0;

      // This month revenue
      const currentMonth = new Date()?.getMonth();
      const currentYear = new Date()?.getFullYear();
      const thisMonthPayments = completedPayments?.filter(p => {
        const paymentDate = new Date(p?.created_at);
        return paymentDate?.getMonth() === currentMonth && paymentDate?.getFullYear() === currentYear;
      });
      const thisMonthRevenue = thisMonthPayments?.reduce((sum, p) => sum + (p?.amount_naira || 0), 0);

      const stats = {
        totalUsers,
        activeMembers,
        pendingPayments,
        totalRevenue,
        recentRegistrations,
        publishedCourses,
        draftCourses,
        archivedCourses,
        totalCourses: courses?.length || 0,
        thisMonthRevenue,
        totalEnrollments: enrollments?.length || 0,
        activeEnrollments: enrollments?.filter(e => e?.status === 'in_progress')?.length || 0,
        totalContent: contentItems?.length || 0,
        videoContent: contentItems?.filter(c => c?.content_type === 'video')?.length || 0,
        pdfContent: contentItems?.filter(c => c?.content_type === 'pdf')?.length || 0
      };

      return { data: stats, error: null };
    } catch (error) {
      logger.error('getDashboardStats error:', error);
      return { data: null, error: error?.message || 'Failed to fetch dashboard statistics' };
    }
  },

  // Get recent activities for dashboard
  getRecentActivities: async (limit = 10) => {
    try {
      // Ensure all queries return proper promises with error handling
      const recentUsersQuery = supabase?.from('user_profiles')?.select('full_name, created_at, membership_tier')?.order('created_at', { ascending: false })?.limit(5);
      const recentPaymentsQuery = supabase?.from('payments')?.select(`
          amount_naira,
          status,
          created_at,
          user:user_profiles!user_id(full_name)
        `)?.order('created_at', { ascending: false })?.limit(5);
      const recentEnrollmentsQuery = supabase?.from('course_enrollments')?.select(`
          enrolled_at,
          status,
          user:user_profiles!user_id(full_name),
          course:courses!course_id(title)
        `)?.order('enrolled_at', { ascending: false })?.limit(5);

      // Execute all queries with proper error handling
      const [recentUsersResult, recentPaymentsResult, recentEnrollmentsResult] = await Promise.all([
        recentUsersQuery?.then(result => result || { data: [], error: null })?.catch(error => ({ data: [], error: error?.message || 'Unknown error' })),
        
        recentPaymentsQuery?.then(result => result || { data: [], error: null })?.catch(error => ({ data: [], error: error?.message || 'Unknown error' })),
        
        recentEnrollmentsQuery?.then(result => result || { data: [], error: null })?.catch(error => ({ data: [], error: error?.message || 'Unknown error' }))
      ]);

      const recentUsers = recentUsersResult?.data || [];
      const recentPayments = recentPaymentsResult?.data || [];
      const recentEnrollments = recentEnrollmentsResult?.data || [];

      // Combine and format activities
      const activities = [
        ...(recentUsers?.map(user => ({
          type: 'user_registration',
          message: `${user?.full_name} registered as ${user?.membership_tier} member`,
          timestamp: user?.created_at,
          icon: 'UserPlus',
          color: 'text-green-600'
        })) || []),
        
        ...(recentPayments?.map(payment => ({
          type: 'payment',
          message: `${payment?.user?.full_name} made a payment of ₦${payment?.amount_naira?.toLocaleString()} - ${payment?.status}`,
          timestamp: payment?.created_at,
          icon: payment?.status === 'completed' ? 'CheckCircle' : 'Clock',
          color: payment?.status === 'completed' ? 'text-green-600' : 'text-yellow-600'
        })) || []),

        ...(recentEnrollments?.map(enrollment => ({
          type: 'enrollment',
          message: `${enrollment?.user?.full_name} enrolled in "${enrollment?.course?.title}"`,
          timestamp: enrollment?.enrolled_at,
          icon: 'BookOpen',
          color: 'text-blue-600'
        })) || [])
      ];

      // Sort by timestamp and limit
      const sortedActivities = activities?.sort((a, b) => new Date(b?.timestamp) - new Date(a?.timestamp))?.slice(0, limit);

      return { data: sortedActivities, error: null };
    } catch (error) {
      logger.error('getRecentActivities error:', error);
      return { data: [], error: error?.message || 'Failed to fetch recent activities' };
    }
  },

  // Get system alerts
  getSystemAlerts: async () => {
    try {
      const alerts = [];

      // Execute all queries with proper error handling
      const [pendingPaymentsResult, usersWithoutMemberIdsResult, draftCoursesResult] = await Promise.all([
        supabase?.from('payments')?.select('id')?.eq('status', 'pending')?.then(result => result || { data: [], error: null })?.catch(error => ({ data: [], error: error?.message || 'Unknown error' })),
        
        supabase?.from('user_profiles')?.select('id')?.is('member_id', null)?.then(result => result || { data: [], error: null })?.catch(error => ({ data: [], error: error?.message || 'Unknown error' })),
        
        supabase?.from('courses')?.select('id')?.eq('status', 'draft')?.then(result => result || { data: [], error: null })?.catch(error => ({ data: [], error: error?.message || 'Unknown error' }))
      ]);

      const pendingPayments = pendingPaymentsResult?.data || [];
      const usersWithoutMemberIds = usersWithoutMemberIdsResult?.data || [];
      const draftCourses = draftCoursesResult?.data || [];

      if (pendingPayments?.length > 0) {
        alerts?.push({
          type: 'warning',
          title: 'Pending Payments',
          message: `${pendingPayments?.length} payments awaiting verification`,
          action: 'Review Payments',
          actionUrl: '/admin-users?tab=payments&filter=pending'
        });
      }

      if (usersWithoutMemberIds?.length > 0) {
        alerts?.push({
          type: 'info',
          title: 'Member IDs Missing',
          message: `${usersWithoutMemberIds?.length} users need member ID assignment`,
          action: 'Assign IDs',
          actionUrl: '/admin-users?action=assign_ids'
        });
      }

      if (draftCourses?.length > 0) {
        alerts?.push({
          type: 'info',
          title: 'Draft Courses',
          message: `${draftCourses?.length} courses are ready to publish`,
          action: 'Manage Courses',
          actionUrl: '/admin-courses?filter=draft'
        });
      }

      return { data: alerts, error: null };
    } catch (error) {
      logger.error('getSystemAlerts error:', error);
      return { data: [], error: error?.message || 'Failed to fetch system alerts' };
    }
  },

  // Get system status
  getSystemStatus: () => {
    return {
      data: {
        database: 'operational',
        storage: 'operational',
        authentication: 'operational',
        lastUpdate: new Date()?.toISOString()
      },
      error: null
    };
  },

  // Update user membership status
  updateUserMembership: async (userId, updates) => {
    try {
      const { data, error } = await supabase?.from('user_profiles')?.update({
          ...updates,
          updated_at: new Date()?.toISOString()
        })?.eq('id', userId)?.select()?.single();

      return { data, error: error?.message };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  },

  // Assign member ID to user
  assignMemberId: async (userId) => {
    try {
      // Generate member ID based on user profile
      const { data: userProfile } = await supabase?.from('user_profiles')?.select('full_name, created_at')?.eq('id', userId)?.single();

      if (userProfile) {
        const memberIdPrefix = 'BKO';
        const timestamp = new Date(userProfile.created_at)?.getTime()?.toString()?.slice(-6);
        const memberId = `${memberIdPrefix}-${timestamp}`;

        const { data, error } = await supabase?.from('user_profiles')?.update({ 
            member_id: memberId,
            updated_at: new Date()?.toISOString()
          })?.eq('id', userId)?.select()?.single();

        return { data, error: error?.message };
      }

      return { data: null, error: 'User profile not found' };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  },

  // Update payment status
  updatePaymentStatus: async (paymentId, status, adminNotes = null) => {
    try {
      const { data, error } = await supabase?.from('payments')?.update({
          status,
          admin_notes: adminNotes,
          updated_at: new Date()?.toISOString()
        })?.eq('id', paymentId)?.select()?.single();

      return { data, error: error?.message };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  },

  // Create new user (admin only)
  createUser: async (userData) => {
    try {
      // Generate UUID for the user
      const userId = crypto.randomUUID();
      
      // Validate required fields
      if (!userData?.email || !userData?.full_name) {
        return { data: null, error: 'Email and full name are required fields' };
      }

      // Check if email already exists
      const { data: existingUser } = await supabase
        ?.from('user_profiles')
        ?.select('id')
        ?.eq('email', userData?.email)
        ?.single();

      if (existingUser) {
        return { data: null, error: 'User with this email already exists' };
      }

      // Prepare user data with proper defaults and UUID
      const newUserData = {
        id: userId,
        email: userData?.email,
        full_name: userData?.full_name,
        role: userData?.role || 'student',
        membership_tier: userData?.membership_tier || 'starter',
        membership_status: userData?.membership_status || 'pending',
        is_active: userData?.is_active !== undefined ? userData?.is_active : true,
        bio: userData?.bio || null,
        phone: userData?.phone || null,
        location: userData?.location || null,
        avatar_url: userData?.avatar_url || null,
        created_at: new Date()?.toISOString(),
        updated_at: new Date()?.toISOString(),
        joined_at: new Date()?.toISOString(),
        last_active_at: new Date()?.toISOString()
      };

      const { data, error } = await supabase
        ?.from('user_profiles')
        ?.insert([newUserData])
        ?.select()
        ?.single();

      if (error) {
        logger.error('Create user database error:', error);
        return { data: null, error: error?.message || 'Failed to create user in database' };
      }

      return { data, error: null };
    } catch (error) {
      logger.error('Create user service error:', error);
      return { data: null, error: error?.message || 'Unexpected error occurred while creating user' };
    }
  },

  // Generate reports (placeholder for now)
  generateReport: async (reportType, dateRange = null) => {
    try {
      // This is a placeholder implementation
      const reportData = {
        type: reportType,
        generated_at: new Date()?.toISOString(),
        date_range: dateRange,
        data: {
          message: 'Report generation coming soon'
        }
      };

      return { data: reportData, error: null };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  },

  // Enhanced dashboard metrics for new admin dashboard
  getDashboardMetrics: async () => {
    try {
      // Use the database functions we created
      const [
        totalUsersResult,
        pendingPaymentsResult,
        activeMembersResult,
        totalRevenueResult,
        recentActivitiesResult,
        pendingMediaResult,
        draftCoursesResult
      ] = await Promise.all([
        supabase?.rpc('get_total_users'),
        supabase?.rpc('get_pending_payments_count'),
        supabase?.rpc('get_active_members_count'),
        supabase?.rpc('get_total_revenue_this_month'),
        supabase?.rpc('get_recent_admin_activities', { limit_count: 5 }),
        supabase?.from('content_library')?.select('id')?.eq('status', 'active')?.then(result => ({ data: result?.data?.length || 0 })),
        supabase?.from('courses')?.select('id')?.eq('status', 'draft')?.then(result => ({ data: result?.data?.length || 0 }))
      ]);

      // Format the data for the enhanced dashboard
      const dashboardData = {
        totalUsers: totalUsersResult?.data || 0,
        pendingPayments: pendingPaymentsResult?.data || 0,
        activeMembers: activeMembersResult?.data || 0,
        totalRevenue: totalRevenueResult?.data || 0,
        recentActivities: recentActivitiesResult?.data?.map(activity => ({
          type: activity.activity_type,
          description: activity.description,
          createdAt: activity.created_at,
          adminName: activity.admin_name,
          targetName: activity.target_name
        })) || [],
        pendingTasks: {
          payments: pendingPaymentsResult?.data || 0,
          media: pendingMediaResult?.data || 0,
          courses: draftCoursesResult?.data || 0
        }
      };

      return dashboardData;
    } catch (error) {
      logger.error('getDashboardMetrics error:', error);
      // Fallback to existing stats if new functions aren't available yet
      const statsResult = await adminService.getDashboardStats();
      return {
        totalUsers: statsResult?.data?.totalUsers || 0,
        pendingPayments: statsResult?.data?.pendingPayments || 0,
        activeMembers: statsResult?.data?.activeMembers || 0,
        totalRevenue: statsResult?.data?.thisMonthRevenue || 0,
        recentActivities: [],
        pendingTasks: {
          payments: statsResult?.data?.pendingPayments || 0,
          media: 0,
          courses: statsResult?.data?.draftCourses || 0
        }
      };
    }
  }
};
