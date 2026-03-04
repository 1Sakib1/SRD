# 🔑 Admin Account Credentials

## Smart Rubbish Detection System - Administrator Access

This document contains the official administrator credentials for the Smart Rubbish Detection System.

---

## 👑 Admin Accounts

The system includes **4 pre-configured administrator accounts** with full system access:

### Admin Account 1
- **Email**: `adminsrd1@srd.com.au`
- **Password**: `Admin@123`
- **Name**: Admin SRD One

### Admin Account 2
- **Email**: `adminsrd2@srd.com.au`
- **Password**: `Admin@123`
- **Name**: Admin SRD Two

### Admin Account 3
- **Email**: `adminsrd3@srd.com.au`
- **Password**: `Admin@123`
- **Name**: Admin SRD Three

### Admin Account 4
- **Email**: `adminsrd4@srd.com.au`
- **Password**: `Admin@123`
- **Name**: Admin SRD Four

---

## 🔐 Security Notes

- **All admin accounts share the same password** (`Admin@123`) for convenience during development and demonstration.
- **Domain**: `srd.com.au` (Smart Rubbish Detection)
- **Auto-Creation**: Admin accounts are automatically created in the database on first login attempt.
- **Password Hashing**: Passwords are hashed before storage for security.

---

## 🚀 How to Login

1. Navigate to the application: [https://your-app-url.com](https://your-app-url.com)
2. Click on **"Login as Admin"** button
3. Enter one of the admin email addresses above
4. Enter password: `Admin@123`
5. You'll be redirected to the **Admin Dashboard**

---

## 🎯 Admin Privileges

Administrators have access to:

- ✅ **Admin Dashboard** - Complete system overview
- ✅ **Report Management** - View, update status, and export all reports
- ✅ **User Management** - View all registered users, eco points, and credits
- ✅ **System Statistics** - Track community engagement and environmental impact
- ✅ **Developer Tools** - Access to debug interfaces and system monitoring
- ✅ **Export Functionality** - Generate CSV reports for data analysis

---

## 📊 Admin Dashboard Features

### Report Management
- View all submitted rubbish reports
- Update report status (Pending → Reviewed → Resolved)
- Filter reports by status
- Export weekly/monthly reports to CSV

### User Management
- View all registered users (admins + community members)
- Monitor eco points accumulation
- Track credit redemption
- Search and filter users by role
- Export user data to CSV

### Analytics & Statistics
- Total reports submitted
- Pending vs. resolved reports
- Total users registered
- Community eco points earned
- Environmental impact metrics

---

## 🔄 Password Reset

If you need to change the admin password:

1. The password is defined in `/supabase/functions/server/auth.tsx`
2. Look for: `const ADMIN_PASSWORD = 'Admin@123';`
3. Change the value to your desired password
4. Redeploy the Supabase Edge Function
5. Update this documentation

---

## 🛡️ Production Security Recommendations

For production deployment, consider:

1. **Unique Passwords**: Assign different passwords to each admin account
2. **Strong Passwords**: Use complex passwords with 12+ characters
3. **Two-Factor Authentication**: Implement 2FA for admin accounts
4. **Password Rotation**: Change admin passwords regularly
5. **Access Logging**: Monitor admin login attempts and activities
6. **IP Whitelisting**: Restrict admin access to specific IP addresses

---

## 📧 Support Contact

For admin account issues or password resets:

- **Project Leader**: Nazmus Sakib - s8116515@live.vu.edu.au
- **Technical Support**: Md Abudozana Niloy - s8138202@live.vu.edu.au

---

## 📝 Change Log

| Date | Change | Updated By |
|------|--------|------------|
| 2026-03-04 | Changed admin emails from admin1-4@sydney.gov.au to adminsrd1-4@srd.com.au | System Update |
| 2026-03-04 | Standardized all admin passwords to Admin@123 | System Update |

---

**Victoria University Sydney IT Capstone Project 2026**

*Building a cleaner, greener future together* 🌍
