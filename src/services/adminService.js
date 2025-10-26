import { supabase } from '../lib/supabase';
import { supabaseAdmin } from '../lib/supabaseAdmin';
import { passwordService } from './passwordService';
import { notificationService } from './notificationService';
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

  // Create new user (admin only) with enhanced features
  createUser: async (userData) => {
    try {
      // Validate required fields
      if (!userData?.email || !userData?.full_name) {
        logger.error('Validation failed: Missing required fields');
        return { data: null, error: 'Email and full name are required fields' };
      }

      logger.info('=== STARTING USER CREATION ===');
      logger.info('Email:', userData.email);
      logger.info('Role:', userData?.role || 'student');
      logger.info('Membership tier:', userData?.membership_tier || 'starter');

      const isAdmin = userData?.role === 'admin';

      // STEP 1: Check if email already exists in ANY table
      logger.info('Step 1: Checking for existing users...');
      
      if (isAdmin) {
        const { data: existingAdmin } = await supabase
          .from('admin_users')
          .select('id')
          .eq('email', userData.email)
          .single();

        if (existingAdmin) {
          logger.warn('Admin with this email already exists');
          return { data: null, error: 'Admin with this email already exists' };
        }
      } else {
        const { data: existingUser } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('email', userData.email)
          .single();

        if (existingUser) {
          logger.warn('User with this email already exists');
          return { data: null, error: 'User with this email already exists' };
        }
      }

      // Check auth.users via admin API
      if (supabaseAdmin) {
        try {
          const { data: existingAuthUser } = await supabaseAdmin.auth.admin.getUserByIdentifier(userData.email);
          if (existingAuthUser) {
            logger.warn('User exists in auth system');
            return { data: null, error: 'User with this email already exists in authentication system' };
          }
        } catch (authCheckError) {
          logger.info('No existing auth user found (good)');
        }
      } else {
        logger.error('❌ CRITICAL: Admin service key not configured!');
        return { data: null, error: 'Server configuration error: Admin service key not configured. Contact support.' };
      }

      // STEP 2: Generate secure password
      logger.info('Step 2: Generating secure password...');
      const passwordResult = await passwordService.generateAndSetPassword();
      if (!passwordResult.success) {
        logger.error('Password generation failed');
        return { data: null, error: 'Failed to generate secure password' };
      }

      const tempPassword = passwordResult.password;
      logger.info('✅ Password generated successfully');

      // STEP 3: Create auth user with comprehensive metadata
      logger.info('Step 3: Creating authentication user...');
      logger.info('User metadata:', {
        full_name: userData.full_name,
        phone: userData.phone || null,
        location: userData.location || null,
        role: userData?.role || 'student',
        membership_tier: userData?.membership_tier || 'starter',
        membership_status: userData?.membership_status || 'pending',
        created_by_admin: true
      });

      const { data: authUserData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: userData.email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          full_name: userData.full_name,
          phone: userData.phone || null,
          location: userData.location || null,
          role: userData?.role || 'student',
          membership_tier: userData?.membership_tier || 'starter',
          membership_status: userData?.membership_status || 'pending',
          created_by_admin: true  // CRITICAL: This triggers must_change_password
        }
      });

      if (authError) {
        logger.error('❌ AUTH USER CREATION FAILED');
        logger.error('Error object:', authError);
        logger.error('Error message:', authError?.message);
        logger.error('Error code:', authError?.code);
        logger.error('Error status:', authError?.status);
        logger.error('Error details:', authError?.details);
        logger.error('Full error JSON:', JSON.stringify(authError, null, 2));
        
        // Return detailed error with troubleshooting hints
        const errorMessage = authError?.message || authError?.msg || 'Unknown authentication error';
        return { 
          data: null, 
          error: `Authentication failed: ${errorMessage}. 
          
Troubleshooting:
1. Check Supabase Dashboard → Database → Logs for trigger errors
2. Verify PHASE_2_NUCLEAR_FIX.sql was run successfully
3. Check that handle_new_user() trigger exists and is enabled
4. Review browser console for additional error details` 
        };
      }

      const authUser = authUserData;
      logger.info('✅ Auth user created:', authUser.user.id);

      let data = null;
      let error = null;

      // STEP 4: Handle profile creation based on role
      if (isAdmin) {
        logger.info('Step 4: Creating admin profile in admin_users table...');
        
        const newAdminData = {
          auth_user_id: authUser.user.id,
          email: userData.email,
          full_name: userData.full_name,
          phone: userData.phone || null,
          is_active: userData?.is_active !== undefined ? userData.is_active : true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const result = await supabaseAdmin
          .from('admin_users')
          .insert([newAdminData])
          .select()
          .single();
        
        data = result.data;
        error = result.error;

        if (!error && data) {
          logger.info('✅ Admin profile created');
          data = {
            ...data,
            id: data.auth_user_id,
            role: 'admin',
            member_id: data.admin_id
          };
        }
      } else {
        // For students, wait for trigger to create profile
        logger.info('Step 4: Waiting for handle_new_user() trigger to create profile...');
        
        // Increased wait time for trigger to complete
        await new Promise(resolve => setTimeout(resolve, 2500)); // 2.5 seconds
        
        logger.info('Step 5: Fetching auto-created profile...');
        
        // Try up to 3 times with delays (handle race conditions)
        let attempts = 0;
        const maxAttempts = 3;
        
        while (attempts < maxAttempts && !data) {
          attempts++;
          logger.info(`Fetch attempt ${attempts}/${maxAttempts}...`);
          
          const result = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', authUser.user.id)
            .single();
          
          data = result.data;
          error = result.error;
          
          if (data) {
            logger.info('✅ Profile found:', data.id);
            break;
          }
          
          if (attempts < maxAttempts) {
            logger.warn(`Profile not found yet, waiting 1s before retry ${attempts}...`);
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }

      // STEP 5: Verify profile was created
      if (error || !data) {
        logger.error('❌ PROFILE CREATION FAILED');
        logger.error('Profile error:', error);
        logger.error('Profile data:', data);
        
        // Clean up auth user since profile creation failed
        logger.warn('Cleaning up auth user due to profile creation failure...');
        try {
          await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
          logger.info('Auth user cleanup successful');
        } catch (cleanupError) {
          logger.error('Auth user cleanup failed:', cleanupError);
        }
        
        return { 
          data: null, 
          error: `Profile creation failed: ${error?.message || 'Trigger did not create profile'}. 

Troubleshooting:
1. Check Supabase Dashboard → Database → Logs
2. Look for errors from handle_new_user() trigger
3. Verify trigger exists: SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created'
4. Run PHASE_1_DIAGNOSTIC.sql to check database state` 
        };
      }

      logger.info('✅ Profile verified successfully');

      // STEP 6: Send welcome email with credentials
      logger.info('Step 6: Sending welcome email...');
      try {
        await notificationService.sendNotification({
          userId: authUser.user.id,
          templateName: 'Welcome Email',
          variables: {
            temporary_password: tempPassword,
            membership_tier: userData?.membership_tier || 'starter',
          },
          recipientType: 'email'
        });
        logger.info('✅ Welcome email sent');
      } catch (emailError) {
        logger.warn('⚠️ Welcome email failed (non-critical):', emailError);
        // Don't fail user creation if email fails
      }

      // STEP 7: Return success with temp password
      logger.info('=== USER CREATION SUCCESSFUL ===');
      logger.info('User ID:', data.id);
      logger.info('Email:', data.email);
      logger.info('Must change password:', data.must_change_password);

      return { 
        data: { 
          ...data, 
          temp_password: tempPassword 
        }, 
        error: null 
      };

    } catch (error) {
      logger.error('❌ UNEXPECTED ERROR IN createUser:', error);
      logger.error('Error name:', error?.name);
      logger.error('Error message:', error?.message);
      logger.error('Error stack:', error?.stack);
      
      return { 
        data: null, 
        error: `Unexpected error: ${error?.message || 'Unknown error occurred'}. Check browser console for details.` 
      };
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
  },

  // Delete user (admin only) - Complete deletion using database function with fallback
  deleteUser: async (userId) => {
    try {
      // Validate user ID
      if (!userId || userId.trim() === '') {
        return { data: null, error: 'Valid user ID is required' };
      }

      // Check if this is an admin or regular user
      const { data: adminUser } = await supabase
        .from('admin_users')
        .select('admin_id, email, full_name, auth_user_id')
        .eq('auth_user_id', userId)
        .single();

      if (adminUser) {
        // Deleting an admin user
        const { error: deleteError } = await supabase
          .from('admin_users')
          .delete()
          .eq('auth_user_id', userId);

        if (deleteError) {
          logger.error('Delete admin user error:', deleteError);
          return { data: null, error: deleteError.message || 'Failed to delete admin user' };
        }

        // Delete from auth.users
        if (supabaseAdmin) {
          const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(userId);
          if (deleteAuthError) {
            logger.error('Delete auth user error:', deleteAuthError);
          }
        }

        logger.info(`Admin deleted: ${adminUser.email} (${adminUser.admin_id})`);
        return { 
          data: { 
            message: 'Admin user deleted successfully',
            deleted_email: adminUser.email,
            deleted_full_name: adminUser.full_name,
            admin_id: adminUser.admin_id
          }, 
          error: null 
        };
      }

      // Not an admin, check regular user_profiles
      const { data: user, error: userError } = await supabase
        .from('user_profiles')
        .select('id, email, full_name, member_id')
        .eq('id', userId)
        .single();

      if (userError) {
        return { data: null, error: 'User not found in either admin_users or user_profiles' };
      }

      // First, try to use the database function for complete deletion
      try {
        const { data: dbResult, error: dbError } = await supabase
          .rpc('admin_delete_user', { user_id: userId });

        if (!dbError && dbResult?.success === true) {
          logger.info(`Admin completely deleted user via database function: ${dbResult?.deleted_email} (${dbResult?.deleted_full_name})`);
          
          return { 
            data: { 
              message: dbResult?.message,
              deleted_email: dbResult?.deleted_email,
              deleted_full_name: dbResult?.deleted_full_name,
              member_id: user.member_id,
              tables_affected: dbResult?.tables_affected,
              method: 'database_function'
            }, 
            error: null 
          };
        }

        if (dbError) {
          logger.warn(`Database function failed, falling back to manual deletion:`, dbError);
        }
      } catch (dbFunctionError) {
        logger.warn(`Database function call failed, falling back to manual deletion:`, dbFunctionError);
      }

      // Fallback: Manual deletion
      // Step 1: Delete user from user_profiles table
      const { error: deleteProfileError } = await supabase
        ?.from('user_profiles')
        ?.delete()
        ?.eq('id', userId);

      if (deleteProfileError) {
        logger.error('Delete user profile error:', deleteProfileError);
        return { data: null, error: deleteProfileError?.message || 'Failed to delete user profile' };
      }

      // Step 2: Delete user from auth.users table using admin API
      if (supabaseAdmin) {
        const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(userId);
        
        if (deleteAuthError) {
          logger.error('Delete auth user error:', deleteAuthError);
          // Even if auth deletion fails, we've already deleted the profile
          // Log the error but don't fail the operation
          logger.warn(`Auth user deletion failed for ${user?.email}, but profile was deleted`);
        }
      } else {
        logger.warn('Admin client not available, auth user not deleted');
      }

      // Step 3: Clean up associated records (optional but recommended)
      try {
        // Delete user's payments
        await supabase?.from('payments')?.delete()?.eq('user_id', userId);
        
        // Delete user's course enrollments
        await supabase?.from('course_enrollments')?.delete()?.eq('user_id', userId);
        
        // Delete user's testimonials
        await supabase?.from('testimonials')?.delete()?.eq('user_id', userId);
        
        // Delete user's content access logs
        await supabase?.from('user_content_access')?.delete()?.eq('user_id', userId);
        
        // Delete user's notification logs
        await supabase?.from('notification_logs')?.delete()?.eq('created_by', userId);
        
        // Clear user references in other tables
        await supabase?.from('courses')?.update({ instructor_id: null })?.eq('instructor_id', userId);
        await supabase?.from('content_library')?.update({ uploader_id: null })?.eq('uploader_id', userId);
        await supabase?.from('system_settings')?.update({ updated_by: null })?.eq('updated_by', userId);
        
        logger.info(`Cleaned up associated records for user: ${user?.email}`);
      } catch (cleanupError) {
        logger.warn('Cleanup of associated records failed:', cleanupError);
        // Continue even if cleanup fails
      }

      logger.info(`Admin completely deleted user (manual fallback): ${user?.email} (${user?.full_name})`);
      return { 
        data: { 
          message: 'User and all associated data deleted successfully',
          deleted_email: user?.email,
          deleted_full_name: user?.full_name,
          method: 'manual_fallback'
        }, 
        error: null 
      };
    } catch (error) {
      logger.error('Delete user service error:', error);
      return { data: null, error: error?.message || 'Unexpected error occurred while deleting user' };
    }
  },

  // Bulk delete users (admin only) - Complete deletion from both auth and user_profiles
  bulkDeleteUsers: async (userIds) => {
    try {
      if (!userIds || userIds?.length === 0) {
        return { data: null, error: 'No users selected for deletion' };
      }

      // Get user info for logging and auth deletion
      const { data: users, error: usersError } = await supabase
        ?.from('user_profiles')
        ?.select('id, email, full_name')
        ?.in('id', userIds);

      if (usersError) {
        return { data: null, error: 'Failed to fetch user information' };
      }

      // Step 1: Delete users from user_profiles table
      const { error: deleteProfileError } = await supabase
        ?.from('user_profiles')
        ?.delete()
        ?.in('id', userIds);

      if (deleteProfileError) {
        logger.error('Bulk delete users error:', deleteProfileError);
        return { data: null, error: deleteProfileError?.message || 'Failed to delete users' };
      }

      // Step 2: Delete users from auth.users table using admin API
      if (supabaseAdmin) {
        // Delete auth users one by one (Supabase doesn't support bulk auth deletion)
        const authDeletionPromises = users.map(async (user) => {
          try {
            const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
            if (deleteAuthError) {
              logger.warn(`Auth user deletion failed for ${user?.email}:`, deleteAuthError);
              return { success: false, email: user.email, error: deleteAuthError.message };
            }
            return { success: true, email: user.email };
          } catch (error) {
            logger.warn(`Auth user deletion failed for ${user?.email}:`, error);
            return { success: false, email: user.email, error: error.message };
          }
        });

        const authResults = await Promise.all(authDeletionPromises);
        const failedAuthDeletions = authResults.filter(result => !result.success);
        
        if (failedAuthDeletions.length > 0) {
          logger.warn(`Failed to delete ${failedAuthDeletions.length} auth users:`, failedAuthDeletions);
        }
      } else {
        logger.warn('Admin client not available, auth users not deleted');
      }

      // Step 3: Clean up associated records for all users
      try {
        // Delete users' payments
        await supabase?.from('payments')?.delete()?.in('user_id', userIds);
        
        // Delete users' course enrollments
        await supabase?.from('course_enrollments')?.delete()?.in('user_id', userIds);
        
        // Delete users' reviews
        await supabase?.from('member_reviews')?.delete()?.in('user_id', userIds);
        
        // Delete users' referral records
        await supabase?.from('referrals')?.delete()?.in('referrer_id', userIds);
        await supabase?.from('referrals')?.delete()?.in('referred_id', userIds);
        
        // Delete users' notification logs
        await supabase?.from('notification_logs')?.delete()?.in('created_by', userIds);
        
        logger.info(`Cleaned up associated records for ${users?.length} users`);
      } catch (cleanupError) {
        logger.warn('Bulk cleanup of associated records failed:', cleanupError);
        // Continue even if cleanup fails
      }

      logger.info(`Admin completely bulk deleted ${users?.length} users`);
      return { data: { message: `${users?.length} users and all associated data deleted successfully` }, error: null };
    } catch (error) {
      logger.error('Bulk delete users service error:', error);
      return { data: null, error: error?.message || 'Unexpected error occurred while deleting users' };
    }
  },

  // Update user active status (make inactive/active)
  updateUserActiveStatus: async (userId, isActive) => {
    try {
      const { data, error } = await supabase
        ?.from('user_profiles')
        ?.update({ 
          is_active: isActive,
          updated_at: new Date()?.toISOString()
        })
        ?.eq('id', userId)
        ?.select()
        ?.single();

      if (error) {
        return { data: null, error: error?.message };
      }

      logger.info(`Admin updated user active status: ${userId} -> ${isActive ? 'active' : 'inactive'}`);
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  },

  // Bulk update user active status
  bulkUpdateUserActiveStatus: async (userIds, isActive) => {
    try {
      if (!userIds || userIds?.length === 0) {
        return { data: null, error: 'No users selected' };
      }

      const { error } = await supabase
        ?.from('user_profiles')
        ?.update({ 
          is_active: isActive,
          updated_at: new Date()?.toISOString()
        })
        ?.in('id', userIds);

      if (error) {
        return { data: null, error: error?.message };
      }

      logger.info(`Admin bulk updated ${userIds?.length} users to ${isActive ? 'active' : 'inactive'}`);
      return { data: { message: `${userIds?.length} users updated successfully` }, error: null };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  },

  // Activate user account (for pending users after payment confirmation)
  activateUserAccount: async (userId, daysToAdd = 30, adminId) => {
    try {
      if (!userId) {
        return { data: null, error: 'User ID is required' };
      }

      // Get user details first
      const { data: user, error: fetchError } = await supabase
        ?.from('user_profiles')
        ?.select('*')
        ?.eq('id', userId)
        ?.single();

      if (fetchError || !user) {
        return { data: null, error: 'User not found' };
      }

      // Calculate subscription expiry date
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + daysToAdd);

      // Update user profile
      const { data: updatedUser, error: updateError } = await supabase
        ?.from('user_profiles')
        ?.update({
          membership_status: 'active',
          subscription_expiry: expiryDate.toISOString(),
          is_active: true,
          updated_at: new Date().toISOString()
        })
        ?.eq('id', userId)
        ?.select()
        ?.single();

      if (updateError) {
        return { data: null, error: updateError?.message };
      }

      // Send activation confirmation email
      try {
        await notificationService.sendNotification({
          userId: userId,
          templateName: 'account_activated_confirmation',
          variables: {
            full_name: user.full_name,
            email: user.email,
            member_id: user.member_id || 'Pending',
            membership_tier: user.membership_tier,
            subscription_expiry: expiryDate.toLocaleDateString('en-GB'),
            dashboard_url: `${window.location.origin}/student-dashboard`
          },
          recipientType: 'email'
        });
      } catch (emailError) {
        logger.warn('Failed to send activation email:', emailError);
        // Don't fail the activation if email fails
      }

      logger.info(`Admin ${adminId} activated user ${userId} for ${daysToAdd} days`);
      return { data: updatedUser, error: null };
    } catch (error) {
      logger.error('activateUserAccount error:', error);
      return { data: null, error: error?.message || 'Failed to activate user account' };
    }
  },

  // Add subscription days (for renewals/upgrades)
  addSubscriptionDays: async (userId, daysToAdd, adminId) => {
    try {
      if (!userId || !daysToAdd) {
        return { data: null, error: 'User ID and days are required' };
      }

      // Get current user data
      const { data: user, error: fetchError } = await supabase
        ?.from('user_profiles')
        ?.select('subscription_expiry, full_name, email, member_id')
        ?.eq('id', userId)
        ?.single();

      if (fetchError || !user) {
        return { data: null, error: 'User not found' };
      }

      // Calculate new expiry date (add to existing if active, otherwise from now)
      let newExpiryDate;
      if (user.subscription_expiry && new Date(user.subscription_expiry) > new Date()) {
        newExpiryDate = new Date(user.subscription_expiry);
      } else {
        newExpiryDate = new Date();
      }
      newExpiryDate.setDate(newExpiryDate.getDate() + daysToAdd);

      // Update subscription expiry
      const { data: updatedUser, error: updateError } = await supabase
        ?.from('user_profiles')
        ?.update({
          subscription_expiry: newExpiryDate.toISOString(),
          membership_status: 'active', // Ensure active when adding days
          updated_at: new Date().toISOString()
        })
        ?.eq('id', userId)
        ?.select()
        ?.single();

      if (updateError) {
        return { data: null, error: updateError?.message };
      }

      logger.info(`Admin ${adminId} added ${daysToAdd} days to user ${userId}`);
      return { data: updatedUser, error: null };
    } catch (error) {
      logger.error('addSubscriptionDays error:', error);
      return { data: null, error: error?.message || 'Failed to add subscription days' };
    }
  },

  // Upgrade user membership tier
  upgradeUserTier: async (userId, newTier, adminId) => {
    try {
      if (!userId || !newTier) {
        return { data: null, error: 'User ID and tier are required' };
      }

      // Validate tier
      const validTiers = ['starter', 'pro', 'elite'];
      if (!validTiers.includes(newTier)) {
        return { data: null, error: 'Invalid membership tier' };
      }

      // Update membership tier
      const { data: updatedUser, error: updateError } = await supabase
        ?.from('user_profiles')
        ?.update({
          membership_tier: newTier,
          updated_at: new Date().toISOString()
        })
        ?.eq('id', userId)
        ?.select()
        ?.single();

      if (updateError) {
        return { data: null, error: updateError?.message };
      }

      logger.info(`Admin ${adminId} upgraded user ${userId} to ${newTier}`);
      return { data: updatedUser, error: null };
    } catch (error) {
      logger.error('upgradeUserTier error:', error);
      return { data: null, error: error?.message || 'Failed to upgrade user tier' };
    }
  }
};
