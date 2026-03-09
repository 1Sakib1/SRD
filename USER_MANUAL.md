# 📘 Smart Rubbish Detection System - User Manual

**Victoria University Sydney - IT Capstone Project 2026**

---

## 📑 Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [User Roles](#user-roles)
4. [Features Guide](#features-guide)
5. [Eco Points System](#eco-points-system)
6. [Troubleshooting](#troubleshooting)
7. [FAQ](#faq)

---

## 🌟 Introduction

The Smart Rubbish Detection System is a global urban waste management platform designed to empower communities to report and track rubbish issues in their cities. Originally focused on Sydney, the platform now serves major cities worldwide.

### Key Features
- 🗺️ **Interactive Heat Maps** - Visualize rubbish hotspots in real-time
- 📍 **GPS Auto-Detection** - Automatic location capture
- 🎯 **Eco Points Rewards** - Earn credits for community participation
- 👥 **Dual Authentication** - Separate accounts for community members and admins
- 📊 **Analytics Dashboard** - Track your contributions and city statistics
- 📄 **Weekly Reports** - Automated council reporting system

---

## 🚀 Getting Started

### For Community Members

#### 1. Registration
1. Visit the landing page
2. Click **"Get Started"** or **"Sign Up"**
3. Fill in the registration form:
   - Full Name
   - Email Address
   - Password (minimum 6 characters)
   - Confirm Password
4. Click **"Sign Up"**
5. You'll be automatically logged in

#### 2. First Login
1. Click **"Login"** on the landing page
2. Enter your email and password
3. Click **"Sign In"**

### For Administrators

#### Admin Login Credentials
Use any of these pre-configured admin accounts:

| Email | Password |
|-------|----------|
| `adminsrd1@srd.com.au` | `Admin@123` |
| `adminsrd2@srd.com.au` | `Admin@123` |
| `adminsrd3@srd.com.au` | `Admin@123` |
| `adminsrd4@srd.com.au` | `Admin@123` |

---

## 👥 User Roles

### Community Member
**Access to:**
- ✅ Submit rubbish reports
- ✅ View personal dashboard
- ✅ Track eco points and credits
- ✅ View heat maps
- ✅ Browse awareness content

### Administrator
**Access to:**
- ✅ All community member features
- ✅ Review and manage all reports
- ✅ Change report status (Pending → Reviewed → Resolved)
- ✅ View system-wide analytics
- ✅ Generate weekly council reports (CSV/JSON)
- ✅ Access user management tools
- ✅ Monitor system performance

---

## 🎯 Features Guide

### 1. Reporting Rubbish

#### Step-by-Step Guide:

1. **Navigate to "Report Rubbish"**
   - Click the menu icon (≡) in the header
   - Select **"Report Rubbish"**

2. **Choose Rubbish Type**
   - Litter
   - Illegal Dumping
   - Overflowing Bins
   - Hazardous Waste
   - Other

3. **Add Description**
   - Provide details about the issue
   - Be specific (e.g., "Large pile of household waste including furniture")

4. **Capture Location**
   - Click **"Use Current Location"** for automatic GPS detection
   - Or manually enter an address in the search box
   - Adjust the map marker if needed

5. **Upload Photo (Optional)**
   - Click **"Upload Photo"**
   - Select an image from your device
   - Images help verification and faster resolution

6. **Submit Report**
   - Review all details
   - Click **"Submit Report"**
   - You'll earn **+10 Eco Points** instantly!

#### Location Detection Tips:
- Enable location services in your browser
- For best accuracy, submit reports while at the location
- If GPS doesn't work, use the address search
- The map shows your current location with a blue marker

---

### 2. Dashboard (Community Members)

#### Your Statistics:
- **Total Reports** - Number of reports you've submitted
- **Eco Points** - Points earned from contributions
- **Credits** - Monetary value ($1 AUD per 100 points)
- **Active Cases** - Reports still pending/under review

#### Recent Reports:
- View all your submissions
- Check status updates (Pending/Reviewed/Resolved)
- See timestamps and locations
- Status color coding:
  - 🟡 Yellow = Pending
  - 🔵 Blue = Reviewed
  - 🟢 Green = Resolved

#### Heat Map:
- Visual representation of all reports
- Larger circles = more reports in that area
- Red/Orange = High density areas
- Click markers for location details

---

### 3. Admin Dashboard

#### Report Management:

1. **View All Reports**
   - See every report submitted to the system
   - Filter by status: All / Pending / Reviewed / Resolved

2. **Change Report Status**
   - Click **"Mark Pending"** - Return to pending state
   - Click **"Mark Reviewed"** - Indicate review is complete
   - Click **"Mark Resolved"** - Issue has been fixed

3. **Report Details**
   - View photo evidence
   - Check exact GPS coordinates
   - See submission timestamp
   - View user information

#### Weekly Council Reports:

Generate comprehensive reports for city councils:

1. **CSV Report** (Excel/Google Sheets)
   - Summary statistics
   - Reports by type
   - Top affected areas
   - Top contributors
   
2. **JSON Report** (Machine-readable)
   - Same data as CSV
   - Better for integration with other systems

**How to Generate:**
1. Scroll to "Weekly Council Report" section
2. Click **"Generate CSV Report"** or **"Generate JSON Report"**
3. File downloads automatically
4. Report covers current week (Monday-Sunday)

**Report Contents:**
- Date range and period
- Total reports (Pending/Reviewed/Resolved)
- Reports breakdown by type
- Top 10 affected areas
- Top 10 contributors
- Community member count

#### User Management:
1. Click **"Open User Management"** in Developer Tools
2. View all registered users
3. See eco points and credits
4. Export user data
5. Monitor community growth

---

### 4. Awareness Page

Educational content about waste management:
- ♻️ Recycling guidelines
- 🌍 Environmental impact
- 📊 Global statistics
- 💡 Best practices
- 🏙️ Community initiatives

**Interactive Features:**
- Image galleries
- Statistical cards
- Community impact metrics
- Call-to-action buttons

---

### 5. About Us Page

Meet the development team:
- 👨‍💻 Team member profiles
- 🎓 VU Sydney IT Capstone Project 2026
- 🛠️ Technology stack information
- 📧 Contact details

**Dark Coding Theme:**
Developer-focused design showcasing technical expertise.

---

## 💰 Eco Points System

### How It Works:

1. **Earning Points**
   - Submit a report = **+10 Eco Points**
   - Points awarded instantly upon submission

2. **Converting to Credits**
   - **100 Eco Points = $1 AUD Credit**
   - Conversion happens automatically
   - Credits displayed on your dashboard

3. **Credit Value**
   - Credits can be tracked in real-time
   - Future implementation: Redeem for rewards

### Example:
- Submit 1 report → 10 points → $0.10
- Submit 10 reports → 100 points → $1.00
- Submit 100 reports → 1,000 points → $10.00

---

## 🔧 Troubleshooting

### Location Not Detected

**Problem:** GPS location not working

**Solutions:**
1. Enable location services in browser settings
2. Grant location permission when prompted
3. Try the address search instead
4. Refresh the page and try again

**Browser Settings:**
- **Chrome:** Settings → Privacy → Site Settings → Location
- **Firefox:** Settings → Privacy & Security → Permissions → Location
- **Safari:** Preferences → Websites → Location Services

---

### Photo Upload Issues

**Problem:** Can't upload photo

**Solutions:**
1. Check file size (max 5MB recommended)
2. Use supported formats: JPG, PNG, HEIC
3. Try a different image
4. Check browser permissions for file access

---

### Login Problems

**Problem:** Can't log in

**Solutions:**

1. **Forgot Password:**
   - Currently no password reset (development phase)
   - Contact admin or register new account

2. **Wrong Credentials:**
   - Check email spelling
   - Verify password (case-sensitive)
   - Ensure you're using the correct role login

3. **Admin Login:**
   - Use exact credentials from admin list
   - Email must end with `@srd.com.au`

---

### Empty Weekly Reports

**Problem:** Generated report has no data

**Reason:** Reports are filtered by current week (Monday-Sunday)

**Solutions:**
1. Submit new reports during the current week
2. Check console logs for date range details
3. Reports from previous weeks are excluded
4. Wait for next weekly period

---

### Heat Map Not Loading

**Problem:** Map shows blank or errors

**Solutions:**
1. Refresh the page
2. Check internet connection
3. Clear browser cache
4. Ensure JavaScript is enabled
5. Try a different browser

---

## ❓ FAQ

### General Questions

**Q: Is this app free to use?**
A: Yes, completely free for all users.

**Q: What cities are supported?**
A: Originally Sydney-focused, now expanded to all major global cities.

**Q: Can I edit or delete my reports?**
A: Currently, only admins can modify report status. Deletion is not available.

**Q: How often is the heat map updated?**
A: Every 30 seconds automatically across all pages.

**Q: Are my reports anonymous?**
A: Reports are linked to your account but only visible to admins.

---

### Eco Points Questions

**Q: Do eco points expire?**
A: No, points accumulate indefinitely.

**Q: Can I transfer points to another user?**
A: Not currently implemented.

**Q: What can I do with credits?**
A: Track your contribution value. Future: Redeem for rewards.

**Q: Why didn't I receive points for my report?**
A: Points are awarded only upon successful submission. Check your dashboard.

---

### Technical Questions

**Q: What browsers are supported?**
A: Chrome, Firefox, Safari, Edge (latest versions).

**Q: Is there a mobile app?**
A: Currently web-only, but fully responsive for mobile browsers.

**Q: Where is my data stored?**
A: Securely in Supabase cloud database with encryption.

**Q: Can I export my data?**
A: Admins can generate reports. User data export coming soon.

---

### Admin Questions

**Q: How do I access admin features?**
A: Login with admin credentials (`adminsrd1-4@srd.com.au`).

**Q: Can I create new admin accounts?**
A: Currently fixed to 4 admin accounts. Contact developers for changes.

**Q: What's the difference between Reviewed and Resolved?**
- **Reviewed:** Report has been assessed
- **Resolved:** Issue has been physically fixed

**Q: Can I delete reports?**
A: Status can be changed but deletion is not available (data integrity).

---

## 📞 Support

### Contact Information

**Development Team:**
- Victoria University Sydney
- IT Capstone Project 2026

**Technical Issues:**
- Check the console for error messages
- Review troubleshooting section
- Contact your project supervisor

**Feature Requests:**
- Submit via GitHub Issues (if repository is public)
- Contact development team

---

## 🎓 Project Information

**Institution:** Victoria University Sydney  
**Course:** NIT3004 - IT Capstone Project  
**Year:** 2026  
**Project Type:** Group Project

**Technologies Used:**
- **Frontend:** React, TypeScript, Tailwind CSS v4
- **Backend:** Supabase Edge Functions, Hono
- **Database:** Supabase PostgreSQL + KV Store
- **Maps:** Leaflet.js with OpenStreetMap
- **Hosting:** Vercel
- **Authentication:** Supabase Auth
- **Email:** Resend API

---

## 📝 Version History

**Current Version:** 1.0.0 (Production)

**Features:**
- ✅ Dual authentication system
- ✅ GPS auto-detection
- ✅ Photo upload
- ✅ Real-time heat maps
- ✅ Eco points rewards
- ✅ Weekly council reports
- ✅ Admin dashboard
- ✅ User management
- ✅ Awareness content
- ✅ Responsive design

---

## 🔒 Privacy & Security

**Data Protection:**
- All data encrypted in transit (HTTPS)
- Passwords hashed and never stored in plain text
- Secure cloud storage (Supabase)
- Regular security updates

**What We Collect:**
- Email address
- Full name
- Location data (only when submitting reports)
- Photos (optional, only when uploaded)
- Report descriptions

**What We Don't Collect:**
- Browsing history
- Device information
- Marketing data
- Third-party tracking

---

## 📄 License

This project is licensed under the MIT License. See LICENSE file for details. 
Creative Commons CC

---

## 🙏 Acknowledgments

- Victoria University Sydney faculty
- Capstone project supervisors
- Open-source community
- Unsplash for images
- OpenStreetMap contributors
- Leaflet.js developers

---

**Last Updated:** March 4, 2026  
**Document Version:** 1.0.0

For the latest updates, visit the GitHub repository or check the About Us page.
