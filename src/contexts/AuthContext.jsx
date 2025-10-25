import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { userService } from '../services/userService';

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(false)

  // Initialize Supabase auth listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      authStateHandlers.onChange
    )
    return () => subscription?.unsubscribe()
  }, [])

  // Separate async operations object
  const profileOperations = {
    async load(userId) {
      if (!userId) return
      setProfileLoading(true)
      try {
        // First, check if user is an admin
        const { data: adminData, error: adminError } = await supabase
          .from('admin_users')
          .select('*')
          .eq('auth_user_id', userId)
          .single()
        
        if (adminData && !adminError) {
          // User is an admin - create profile object with admin data
          const adminProfile = {
            id: adminData.auth_user_id,
            email: adminData.email,
            full_name: adminData.full_name,
            phone: adminData.phone,
            role: 'admin',
            member_id: adminData.admin_id, // Use admin_id as member_id for consistency
            is_active: adminData.is_active,
            last_login: adminData.last_login,
            created_at: adminData.created_at,
            updated_at: adminData.updated_at
          }
          console.log('Admin profile loaded:', { 
            id: adminProfile.id, 
            email: adminProfile.email, 
            role: adminProfile.role,
            admin_id: adminData.admin_id
          })
          setUserProfile(adminProfile)
          return
        }
        
        // User is not an admin, check user_profiles (regular members)
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', userId)
          .single()
        
        if (!error && data) {
          console.log('User profile loaded:', { 
            id: data.id, 
            email: data.email, 
            role: data.role,
            membership_status: data.membership_status,
            member_id: data.member_id
          })
          setUserProfile(data)
        } else if (error) {
          console.log('Profile fetch error:', error?.message)
        }
      } catch (error) {
        console.log('Profile operation error:', error?.message)
      } finally {
        setProfileLoading(false)
      }
    },
    
    clear() {
      setUserProfile(null)
      setProfileLoading(false)
    }
  }

  // Protected auth handlers
  const authStateHandlers = {
    // CRITICAL: This MUST remain synchronous
    onChange: (event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
      
      if (session?.user) {
        profileOperations?.load(session?.user?.id) // Fire-and-forget
      } else {
        profileOperations?.clear()
      }
    }
  }

  useEffect(() => {
    // Get initial session
    supabase?.auth?.getSession()?.then(({ data: { session } }) => {
      authStateHandlers?.onChange(null, session)
    })

    // Protected: Never modify this callback signature
    const { data: { subscription } } = supabase?.auth?.onAuthStateChange(
      authStateHandlers?.onChange
    ) || { data: { subscription: null } }

    return () => subscription?.unsubscribe?.()
  }, [])

  // Auth methods
  const signUp = async (email, password, userData = {}) => {
    try {
      setLoading(true)
      const { data, error } = await supabase?.auth?.signUp({
        email,
        password,
        options: {
          data: userData
        }
      })
      
      if (error) {
        return { error: error?.message };
      }
      
      return { data, error: null }
    } catch (error) {
      return { error: error?.message || 'An unexpected error occurred' }
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email, password) => {
    try {
      setLoading(true)
      const { data, error } = await supabase?.auth?.signInWithPassword({
        email,
        password
      })
      
      if (error) {
        return { error: error?.message };
      }
      
      return { data, error: null }
    } catch (error) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('AuthRetryableFetchError')) {
        return { error: 'Cannot connect to authentication service. Your Supabase project may be paused or inactive. Please check your Supabase dashboard and resume your project if needed.' }
      }
      return { error: error?.message || 'An unexpected error occurred' }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      profileOperations?.clear()
      const { error } = await supabase?.auth?.signOut()
      
      if (error) {
        return { error: error?.message };
      }
      
      return { error: null }
    } catch (error) {
      return { error: error?.message || 'An unexpected error occurred' }
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates) => {
    try {
      setProfileLoading(true)
      const { data, error } = await supabase
        ?.from('user_profiles')
        ?.update(updates)
        ?.eq('id', user?.id)
        ?.select()
        ?.single()
      
      if (error) {
        return { error: error?.message };
      }
      
      setUserProfile(data)
      return { data, error: null }
    } catch (error) {
      return { error: error?.message || 'Failed to update profile' }
    } finally {
      setProfileLoading(false)
    }
  }

  // Enhanced membership methods
  const getActiveMembership = async () => {
    if (!user?.id) return null;
    try {
      const { data, error } = await supabase
        ?.from('memberships')
        ?.select('*')
        ?.eq('user_id', user?.id)
        ?.eq('status', 'active')
        ?.single();
      
      if (error) {
        console.log('Membership fetch error:', error?.message);
        return null;
      }
      return data;
    } catch (error) {
      console.log('Membership operation error:', error?.message);
      return null;
    }
  };

  const canAccessContent = (requiredAccessLevel) => {
    if (!userProfile) return false;
    
    // Admin users can access all content
    if (userProfile?.role === 'admin') {
      return true;
    }
    
    // Check membership status for non-admin users
    if (userProfile?.membership_status !== 'active') {
      return false;
    }
    
    // Check tier access
    const userTier = userProfile?.membership_tier;
    if (!userTier) return false;
    
    const tierHierarchy = {
      'starter': ['starter'],
      'pro': ['starter', 'pro'],
      'elite': ['starter', 'pro', 'elite']
    };
    
    return tierHierarchy[userTier]?.includes(requiredAccessLevel) || false;
  };

  // Intent tracking for featured content deep linking
  const saveLoginIntent = (path, contentId = null, isFeatured = false) => {
    const intent = { path };
    if (contentId) intent.contentId = contentId;
    if (isFeatured) intent.featured = isFeatured;
    sessionStorage.setItem('login_intent', JSON.stringify(intent));
  };

  const getLoginIntent = () => {
    try {
      const intentStr = sessionStorage.getItem('login_intent');
      if (!intentStr) return null;
      return JSON.parse(intentStr);
    } catch (error) {
      console.error('Failed to parse login intent:', error);
      return null;
    }
  };

  const clearLoginIntent = () => {
    sessionStorage.removeItem('login_intent');
  };

  const value = {
    user,
    userProfile,
    loading,
    profileLoading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    getActiveMembership,
    canAccessContent,
    saveLoginIntent,
    getLoginIntent,
    clearLoginIntent,
    isAdmin: userProfile?.role === 'admin',
    isStudent: userProfile?.role === 'student',
    // Admin users bypass membership requirements, students need active membership
    isMember: userProfile?.role === 'admin' || userProfile?.membership_status === 'active',
    membershipTier: userProfile?.membership_tier || 'starter',
    membershipStatus: userProfile?.membership_status || 'inactive',
    isPending: userProfile?.membership_status === 'pending',
    isExpired: userProfile?.membership_status === 'expired'
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
