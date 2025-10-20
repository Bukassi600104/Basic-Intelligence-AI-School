// Script to update notification templates to include password in welcome messages
import { supabase } from './src/lib/supabase.js';

async function updateNotificationTemplates() {
  try {
    console.log('Updating notification templates...');

    // Update Welcome Email template
    const { data: emailUpdate, error: emailError } = await supabase
      .from('notification_templates')
      .update({
        content: `Dear {{full_name}},

Welcome to Basic Intelligence AI School! We are excited to have you join our community of AI learners and professionals.

Your account has been created successfully:
- Email: {{email}}
- Password: {{temporary_password}}
- Member ID: {{member_id}}
- Membership Tier: {{membership_tier}}
- Subscription Expiry: {{subscription_expiry}}

**Important Security Notice:**
- This is your temporary password
- Please change your password immediately after first login
- Keep your login credentials secure

You can access your dashboard here: {{dashboard_url}}

If you have any questions, please don't hesitate to contact our support team.

Best regards,
Basic Intelligence AI School Team`,
        updated_at: new Date().toISOString()
      })
      .eq('name', 'Welcome Email');

    if (emailError) {
      console.error('Error updating Welcome Email template:', emailError);
    } else {
      console.log('✅ Welcome Email template updated successfully');
    }

    // Update Welcome WhatsApp template
    const { data: whatsappUpdate, error: whatsappError } = await supabase
      .from('notification_templates')
      .update({
        content: `Welcome {{full_name}} to Basic Intelligence AI School! 🎉

Your account has been created:
📧 Email: {{email}}
🔑 Password: {{temporary_password}}
🆔 Member ID: {{member_id}}
🎯 Tier: {{membership_tier}}
📅 Expiry: {{subscription_expiry}}

🔒 Security: Please change your password after first login.

Access your dashboard: {{dashboard_url}}

Need help? Contact our support team.`,
        updated_at: new Date().toISOString()
      })
      .eq('name', 'Welcome WhatsApp');

    if (whatsappError) {
      console.error('Error updating Welcome WhatsApp template:', whatsappError);
    } else {
      console.log('✅ Welcome WhatsApp template updated successfully');
    }

    // Verify the updates
    const { data: templates, error: fetchError } = await supabase
      .from('notification_templates')
      .select('name, content')
      .in('name', ['Welcome Email', 'Welcome WhatsApp']);

    if (fetchError) {
      console.error('Error fetching updated templates:', fetchError);
    } else {
      console.log('✅ Templates updated successfully:');
      templates.forEach(template => {
        console.log(`\n--- ${template.name} ---`);
        console.log(template.content.substring(0, 200) + '...');
      });
    }

    console.log('\n🎉 Notification templates update completed!');
    console.log('The generated password will now be included in welcome messages sent to new users.');

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the update
updateNotificationTemplates();
