// Admin account creation script - run with service role key
// Usage: node scripts/create_admin.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Load environment variables from .env file
dotenv.config();

// If .env file doesn't exist, try to load from vercel.json
let supabaseUrl = process.env.VITE_SUPABASE_URL;
let serviceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const projectRoot = path.resolve(__dirname, '..');
    const vercelConfigPath = path.join(projectRoot, 'vercel.json');
    const vercelConfig = JSON.parse(readFileSync(vercelConfigPath, 'utf8'));
    
    supabaseUrl = vercelConfig.env?.VITE_SUPABASE_URL?.value;
    serviceRoleKey = vercelConfig.env?.VITE_SUPABASE_SERVICE_ROLE_KEY?.value;
  } catch (err) {
    console.error('Failed to load config from vercel.json:', err.message);
  }
}

// Validate required configuration
if (!supabaseUrl || !serviceRoleKey) {
  console.error('Error: VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY environment variables must be set.');
  console.error('Add these to your .env file or provide them as command-line arguments.');
  process.exit(1);
}

// Initialize Supabase client with service role key (admin privileges)
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function createAdmin() {
  const email = 'bukassi@gmail.com';
  const password = '12345678';

  try {
    console.log('Creating admin account...');
    
    // Check if user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const userExists = existingUsers.users.some(user => user.email === email);
    
    if (userExists) {
      console.log(`User with email ${email} already exists.`);
      console.log('Updating user role to admin...');
      
      // Find user by email
      const user = existingUsers.users.find(user => user.email === email);
      
      // Update user metadata to include admin role
      const { data: updatedUser, error: updateError } = await supabase.auth.admin.updateUserById(
        user.id,
        { user_metadata: { role: 'admin' } }
      );
      
      if (updateError) throw updateError;
      
      console.log('✅ User metadata updated successfully.');
      
      // Update user_profiles table
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({ 
          role: 'admin',
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
      
      if (profileError) throw profileError;
      
      console.log('✅ User profile updated to admin role.');
      
      // Reset password if requested
      const resetPassword = true; // Set to false if you don't want to reset password
      
      if (resetPassword) {
        const { error: pwError } = await supabase.auth.admin.updateUserById(
          user.id,
          { password }
        );
        
        if (pwError) throw pwError;
        console.log('✅ Password reset successfully.');
      }
      
    } else {
      // Create new admin user
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Skip email verification
        user_metadata: { role: 'admin' }
      });

      if (createError) throw createError;
      
      console.log('✅ User created with ID:', newUser.user.id);

      // Ensure user profile exists with admin role
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          id: newUser.user.id,
          email,
          full_name: 'Admin User',
          role: 'admin',
          is_active: true,
          membership_status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });

      if (profileError) throw profileError;
      
      console.log('✅ Admin profile created successfully');
    }
    
    console.log('----------------------------------------');
    console.log('Admin account details:');
    console.log('Email: bukassi@gmail.com');
    console.log('Password: 12345678');
    console.log('----------------------------------------');
    console.log('You can now log in at your application URL');

  } catch (err) {
    console.error('❌ Error creating/updating admin account:', err.message);
    process.exit(1);
  }
}

createAdmin();