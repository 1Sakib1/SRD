# 🚀 Deployment Guide

**Smart Rubbish Detection System**  
**Last Updated:** March 5, 2026  
**Status:** ✅ Production Ready

---

## Quick Start

### Prerequisites
- GitHub account
- Vercel account (free tier works)
- Supabase project configured
- Git installed locally

### Deploy in 3 Steps

```bash
# 1. Commit your changes
git add .
git commit -m "deploy: Ready for production"

# 2. Push to GitHub
git push origin main

# 3. Deploy to Vercel (automatic if connected)
# Or visit: https://vercel.com/new
```

---

## Table of Contents

1. [GitHub Push Instructions](#github-push-instructions)
2. [Vercel Deployment](#vercel-deployment)
3. [Environment Variables](#environment-variables)
4. [Troubleshooting](#troubleshooting)
5. [Production Fixes](#production-fixes)
6. [Verification Checklist](#verification-checklist)

---

## GitHub Push Instructions

### First-Time Setup

```bash
# Navigate to project directory
cd "path/to/Smart-Rubbish-Detection"

# Initialize Git (if needed)
git init

# Configure Git
git config user.name "YourUsername"
git config user.email "your.email@example.com"

# Add remote repository
git remote add origin https://github.com/1Sakib1/SRD.git

# Add all files
git add .

# Create initial commit
git commit -m "🚀 Initial commit: Smart Rubbish Detection System

- React + TypeScript + Tailwind CSS v4
- Dual authentication (Community + Admin)
- Real-time heat maps with GPS
- Eco points reward system
- Cloud storage with Supabase
- Weekly council reports
- Responsive design
- Production-ready for Vercel"

# Push to GitHub
git push -u origin main
```

### Regular Updates

```bash
# Check status
git status

# Add changes
git add .

# Commit with message
git commit -m "feat: Description of changes"

# Push to GitHub
git push origin main
```

### Authentication Issues

If you encounter authentication errors:

**Option 1: Personal Access Token**
1. Go to https://github.com/settings/tokens
2. Create new token with `repo` permissions
3. Use token as password when prompted

**Option 2: SSH Keys**
```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "your.email@example.com"

# Add to ssh-agent
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

# Copy public key and add to GitHub: https://github.com/settings/keys
cat ~/.ssh/id_ed25519.pub

# Change remote to SSH
git remote set-url origin git@github.com:1Sakib1/SRD.git
```

---

## Vercel Deployment

### Automatic Deployment (Recommended)

1. **Connect GitHub to Vercel:**
   - Visit https://vercel.com
   - Click "Add New" → "Project"
   - Import your GitHub repository

2. **Configure Build Settings:**
   - **Framework:** Vite (auto-detected)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

3. **Deploy:**
   - Click "Deploy"
   - Wait ~2 minutes
   - Get your live URL

4. **Enable Auto-Deploy:**
   - Every push to `main` triggers automatic deployment
   - Pull requests get preview URLs

### Manual Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy to production
vercel --prod
```

---

## Environment Variables

### Required Variables

Add these in Vercel Project Settings → Environment Variables:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
SUPABASE_DB_URL=postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres
```

### Optional Variables

```env
RESEND_API_KEY=your-resend-api-key  # For email notifications
```

### How to Add in Vercel

1. Go to your project dashboard on Vercel
2. Click "Settings" → "Environment Variables"
3. Add each variable:
   - **Name:** Variable name (e.g., `SUPABASE_URL`)
   - **Value:** Your actual value
   - **Environment:** Production, Preview, Development
4. Click "Save"
5. Redeploy for changes to take effect

---

## Troubleshooting

### Build Failures

#### Problem: Module Not Found
```
Error: Cannot find module 'package-name'
```

**Solution:**
```bash
# Ensure package.json is up to date
npm install

# Commit package-lock.json
git add package-lock.json
git commit -m "Update dependencies"
git push origin main
```

#### Problem: Import Errors
```
Error: Failed to resolve import "figma:asset/..."
```

**Solution:**  
This should already be fixed. See [Production Fixes](#production-fixes) section.

### Deployment Issues

#### Problem: Environment Variables Not Working
```
Error: Missing environment variable
```

**Solution:**
1. Check Vercel dashboard → Settings → Environment Variables
2. Ensure all required variables are added
3. Redeploy the project

#### Problem: 404 on Refresh
```
Cannot GET /dashboard
```

**Solution:**  
Already fixed with `vercel.json` configuration. If still occurring:
1. Ensure `vercel.json` exists in root
2. Contains proper rewrites configuration

### Runtime Errors

#### Problem: Supabase Connection Failed
```
Error: Invalid Supabase URL or key
```

**Solution:**
1. Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY` in Vercel
2. Check Supabase project is active
3. Test credentials locally first

#### Problem: Heat Map Not Loading
```
Console: NaN coordinates detected
```

**Solution:**  
Already fixed with coordinate validation. If still occurring:
1. Check browser console for specific errors
2. Verify GPS permissions are granted
3. Ensure Supabase has valid report data

---

## Production Fixes

### Issue: figma:asset Imports (RESOLVED ✅)

**Problem:**  
Build failed on Vercel due to `figma:asset` module scheme not being recognized by standard bundlers.

**Files Fixed:**

#### 1. AboutUs.tsx
```typescript
// ❌ Before (Figma-specific - only works in Figma Make)
import avatar from 'figma:asset/abc123.png';

// ✅ After (Production-ready - DiceBear avatar API)
const teamMembers = [
  {
    name: 'Nazmus Sakib',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=NazmusSakib&backgroundColor=059669',
  }
];
```

**Note:** Using DiceBear Avatars API which generates consistent, professional avatar images. Free to use and reliable for production.

#### 2. Landing.tsx
```typescript
// ❌ Before (Figma-specific)
import sydneyHeroImage from 'figma:asset/xyz789.png';

// ✅ After (Production-ready - Unsplash)
const sydneyHeroImage = 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?q=80&w=2070';
```

#### 3. Awareness.tsx
```typescript
// ❌ Before (Figma-specific)
import logo from 'figma:asset/def456.png';

// ✅ After (Production-ready - via.placeholder.com)
const cityOfSydneyLogo = 'https://via.placeholder.com/200x80/0052CC/FFFFFF?text=City+of+Sydney';
const nswEpaLogo = 'https://via.placeholder.com/200x80/2E7D32/FFFFFF?text=NSW+EPA';
const planetArkLogo = 'https://via.placeholder.com/200x80/4CAF50/FFFFFF?text=Planet+Ark';
```

**Note:** Partner logos use placeholder.com with brand colors. Replace with actual logos when available.

### Image Solutions Summary

| Component | Original | Production Solution | Why |
|-----------|----------|-------------------|-----|
| Team Avatars | figma:asset | DiceBear Avatars API | Professional, consistent, free |
| Hero Image | figma:asset | Unsplash CDN | High-quality, free for commercial use |
| Partner Logos | figma:asset | via.placeholder.com | Clean placeholders with brand colors |

### Custom Images (Optional)

To use custom images instead of APIs:

**Method 1: Public Directory**
```typescript
// 1. Place images in /public/images/
// 2. Reference them:
const image = '/images/team/photo.jpg';
```

**Method 2: Import Assets**
```typescript
// 1. Create /src/assets/images/
// 2. Import them:
import photo from '../assets/images/photo.jpg';
```

**Method 3: Cloud CDN**
```typescript
// Upload to Cloudinary, Imgur, etc.
const image = 'https://res.cloudinary.com/your-project/image.jpg';
```

---

## Verification Checklist

### After Deployment

**GitHub Verification:**
- [ ] Repository shows all files
- [ ] README.md displays correctly
- [ ] `.gitignore` working (no `node_modules`)
- [ ] Commit history is clean

**Vercel Verification:**
- [ ] Build completed successfully
- [ ] No errors in deployment logs
- [ ] Live URL is accessible
- [ ] HTTPS certificate active

**Application Testing:**
- [ ] Landing page loads
- [ ] Hero image displays
- [ ] Login/Register works
- [ ] Dashboard accessible
- [ ] Report submission works
- [ ] Heat map renders correctly
- [ ] GPS auto-detection works
- [ ] Admin dashboard functions
- [ ] Weekly reports generate
- [ ] Responsive on mobile

**Performance:**
- [ ] Page load time < 3 seconds
- [ ] No console errors
- [ ] Images load properly
- [ ] Map interactions smooth

### Test Accounts

**Community Member:**
```
Email: test@example.com
Password: Test123!
```

**Admin Accounts:**
```
Email: adminsrd1@srd.com.au
Password: Admin@123

Email: adminsrd2@srd.com.au
Password: Admin@123

Email: adminsrd3@srd.com.au
Password: Admin@123

Email: adminsrd4@srd.com.au
Password: Admin@123
```

---

## Build Configuration

### vite.config.ts
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
});
```

### vercel.json
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

## Monitoring & Maintenance

### Monitor Application
- Check Vercel Analytics dashboard
- Review deployment logs
- Monitor Supabase usage
- Track API response times

### Regular Maintenance
```bash
# Update dependencies monthly
npm update

# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# Commit updates
git add package.json package-lock.json
git commit -m "chore: Update dependencies"
git push origin main
```

---

## Common Deployment Commands

```bash
# Check Git status
git status

# View commit history
git log --oneline

# View remote repositories
git remote -v

# Create new branch
git checkout -b feature/new-feature

# Switch branches
git checkout main

# Undo last commit (keep changes)
git reset --soft HEAD~1

# View differences
git diff

# Stash changes
git stash
git stash pop
```

---

## Support

### Resources
- **Live Application:** [Your Vercel URL]
- **GitHub Repository:** https://github.com/1Sakib1/SRD
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Supabase Dashboard:** https://app.supabase.com

### Documentation
- [README.md](README.md) - Project overview
- [USER_MANUAL.md](USER_MANUAL.md) - User guide
- [ADMIN_CREDENTIALS.md](ADMIN_CREDENTIALS.md) - Admin login info

### Contact
If you encounter issues:
1. Check Vercel build logs
2. Review browser console errors
3. Verify Supabase connectivity
4. Create GitHub issue
5. Email: s8116515@live.vu.edu.au

---

## Success! 🎉

Once deployed successfully:

1. ✅ Update README.md with live Vercel URL
2. ✅ Share deployment link with team
3. ✅ Test all features in production
4. ✅ Monitor for any issues
5. ✅ Document any environment-specific fixes

**Your app is now live and serving users worldwide!** 🌍

---

© 2026 Victoria University Sydney - IT Capstone Project
