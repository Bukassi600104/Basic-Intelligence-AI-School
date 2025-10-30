# User Creation Wizard - Quick Start Guide

## 🎯 Overview
The User Creation Wizard transforms the user creation process into an intuitive 3-step flow with enhanced email validation.

## 🚀 How to Use

### Step 1: Basic Information
**What You Need:**
- **Email Address*** (required) - Must be valid format (e.g., user@example.com)
- **Full Name*** (required) - Minimum 3 characters
- **Role** (optional) - Choose Student or Admin (default: Student)
- **Membership Tier** (optional) - Choose Starter, Pro, or Elite (default: Starter)

**✅ Validation:**
- Email must follow pattern: `name@domain.tld`
- Full name cannot be empty or too short
- Invalid inputs show red border with error message
- Valid email shows green checkmark

**Navigation:**
- Click "Cancel" to close wizard without saving
- Click "Next Step" to proceed (blocked if validation fails)

---

### Step 2: Contact Details (All Optional)
**What You Can Add:**
- **Membership Status** - Pending, Active, Inactive, or Expired
- **Phone Number** - Must be 10+ digits if provided
- **WhatsApp Phone** - For WhatsApp notifications
- **Location** - User's city/region
- **Bio** - Brief description about the user

**✅ Validation:**
- Phone number must be 10+ digits if entered
- All fields are optional (can skip entirely)

**Navigation:**
- Click "Back" to return to Step 1 (data preserved)
- Click "Next Step" to proceed to review

---

### Step 3: Review & Confirm
**What You See:**
- Summary of all entered information
- Color-coded badges for role, tier, and status
- Password generation information

**What Happens Next:**
1. Click "Create User" button
2. System generates secure temporary password
3. User account is created in database
4. Welcome email sent automatically
5. Popup shows temporary password (copy it!)
6. User appears in users list

**Navigation:**
- Click "Back" to modify information
- Click "Create User" to complete process

---

## 📧 Email Validation Rules

### ✅ Valid Email Formats
```
user@example.com
john.doe@company.co.uk
test_user-123@mail.org
contact@my-site.com
admin@example.co
```

### ❌ Invalid Email Formats
```
test              (no @ or domain)
test@             (no domain)
test@test         (no TLD like .com)
@example.com      (no local part)
user @test.com    (space in email)
user@.com         (invalid domain)
```

### 🔍 Validation Pattern
The wizard uses this regex pattern:
```javascript
/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
```

**Requirements:**
- Local part (before @): Letters, numbers, dots, underscores, hyphens
- @ symbol required
- Domain name: Letters, numbers, dots, hyphens
- TLD (after last dot): Minimum 2 letters

---

## 🎨 Visual Indicators

### Progress Indicator
- **Orange circle with number**: Current step
- **Green checkmark**: Completed step
- **Gray circle**: Upcoming step

### Field States
- **Default**: Gray border
- **Focus**: Orange border with glow
- **Error**: Red border with error message
- **Success**: Green checkmark with success message

### Buttons
- **Cancel**: Gray border button (left side)
- **Back**: Gray border button (left side)
- **Next Step**: Orange gradient button (right side)
- **Create User**: Green gradient button (final step)

---

## 🔐 Password Information

### Automatic Generation
- System generates secure temporary password automatically
- No manual password entry required
- Password meets security requirements

### Password Distribution
1. **Popup Display**: Shows password immediately after creation (copy it!)
2. **Email Notification**: Sent to user's email address
3. **Security Notice**: User must change password on first login

### Best Practices
- Copy password before closing popup
- Store password securely (don't email plain text)
- Share password through secure channel with user
- Inform user to check email for credentials

---

## ⚠️ Important Notes

### Required vs Optional
- Only **Email** and **Full Name** are required
- All other fields can be left empty
- You can skip Step 2 entirely if no contact details needed

### Data Persistence
- Going back preserves your entered data
- Closing wizard loses all data (no auto-save)
- Complete all steps before closing

### Email Uniqueness
- System checks if email already exists during submission
- You'll get error if email is taken
- Use different email and try again

---

## 🐛 Troubleshooting

### "Cannot proceed to next step"
**Cause:** Validation error on current step
**Solution:** 
- Check for red error messages
- Ensure email format is valid
- Verify full name is 3+ characters

### "Please enter a valid email address"
**Cause:** Email doesn't match required format
**Solution:**
- Ensure email has @ symbol
- Add TLD (.com, .org, etc.)
- Remove spaces or special characters

### "Failed to create user"
**Possible Causes:**
- Email already exists in system
- Network connection issue
- Server error

**Solutions:**
- Try different email address
- Check internet connection
- Contact system administrator if persists

### Wizard not opening
**Possible Causes:**
- JavaScript error
- Component not loaded
- Browser compatibility issue

**Solutions:**
- Refresh page (F5 or Ctrl+R)
- Clear browser cache
- Try different browser
- Check browser console for errors

---

## 💡 Tips & Tricks

### Speed Up User Creation
1. **Prepare Data First**: Have user details ready before opening wizard
2. **Use Tab Key**: Navigate fields without mouse
3. **Copy Template**: Use similar users as reference
4. **Bulk Import**: For multiple users, use CSV import (if available)

### Email Best Practices
- Use company/organizational email addresses
- Avoid temporary/disposable email services
- Double-check spelling before proceeding
- Use lowercase for consistency

### Contact Details
- Use international format for phone: +234 XXX XXX XXXX
- Same phone can be used for both Phone and WhatsApp
- Location helps with timezone and regional content
- Bio is shown on user profile (keep it brief)

---

## 📞 Support

### Need Help?
- **Documentation**: See full implementation guide in `USER_CREATION_WIZARD_IMPLEMENTATION.md`
- **Test Plan**: See detailed test cases in `WIZARD_TEST_PLAN.md`
- **Bug Reports**: Contact system administrator with screenshot

### Feature Requests
Have ideas for improving the wizard? Submit feedback through:
- Admin dashboard feedback form
- Direct message to tech team
- GitHub issues (if repository is shared)

---

## 🎓 Video Tutorial
*(Link to video walkthrough if available)*

---

**Version:** 1.0  
**Last Updated:** 2025-01-XX  
**For:** Basic Intelligence Community School Admin Users
