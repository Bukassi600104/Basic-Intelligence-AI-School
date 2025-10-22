// Authentication helper service with redirect logic
import { supabase } from '../lib/supabase';

/**
 * Redirects user to appropriate dashboard based on their role
 * @param {function} navigate React Router navigate function
 * @param {string} userId User's ID
 */
export async function redirectAfterLogin(navigate, userId) {
  try {
    // Fetch user's role from user_profiles
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (error) {
      console.warn('Could not fetch user profile for redirect:', error.message);
      // Default fallback route if we can't determine role
      navigate('/dashboard');
      return;
    }

    // Redirect based on role
    if (profile?.role === 'admin') {
      navigate('/admin-dashboard');
    } else {
      navigate('/student-dashboard'); // Student dashboard route
    }
  } catch (err) {
    console.error('Error during redirect:', err);
    navigate('/dashboard'); // Fallback route on error
  }
}

/**
 * Changes the current user's password
 * @param {string} newPassword New password to set
 * @returns {Promise} Result of password change
 */
export async function changePassword(newPassword) {
  return await supabase.auth.updateUser({ password: newPassword });
}

/**
 * Gets the current authenticated session
 * @returns {Promise} Current session
 */
export async function getSession() {
  return await supabase.auth.getSession();
}

/**
 * Sets up auth state change listener
 * @param {function} callback Function to call on auth state change
 * @returns {function} Unsubscribe function
 */
export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange(callback);
}