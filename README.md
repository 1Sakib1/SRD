# 🌍 Smart Rubbish Detection System

**A Global Urban Waste Management Platform**

[![Status](https://img.shields.io/badge/Status-Production_Ready-success)](https://github.com/1Sakib1/SRD)
[![License](https://img.shields.io/badge/License-MIT-blue)](LICENSE)
[![React](https://img.shields.io/badge/React-18.3.1-61dafb)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-Latest-3178c6)](https://www.typescriptlang.org/)
[![Vercel](https://img.shields.io/badge/Deploy-Ready-black?logo=vercel)](https://vercel.com)

> **Victoria University Sydney - IT Capstone Project 2026**

A comprehensive web application that empowers communities worldwide to actively participate in urban waste management through innovative technology, real-time data visualization, and gamified rewards.

---

## 📑 Quick Links

- **🌐 Live Application:** [View on Vercel](https://smart-rubbish.vercel.app/)
- **📘 User Manual:** [Read the Guide](USER_MANUAL.md)
- **🚀 Deployment Guide:** [Build & Deploy Guide](DEPLOYMENT.md)
- **👥 Admin Credentials:** [See Below](#-admin-accounts)
- **🐛 Report Issues:** [GitHub Issues](https://github.com/1Sakib1/SRD/issues)

---

## ✨ Key Features

### 🎯 Core Functionality

| Feature | Description |
|---------|-------------|
| **Dual Authentication** | Separate login systems for community members and administrators |
| **GPS Auto-Detection** | Automatic location capture with browser geolocation API |
| **Real-Time Heat Maps** | Interactive visualizations updating every 30 seconds |
| **Photo Upload** | Optional image evidence for better verification |
| **Eco Points Rewards** | Earn $1 AUD credit per 100 eco points (+10 per report) |
| **Cloud Storage** | All data stored securely in Supabase cloud infrastructure |
| **Weekly Reports** | Automated CSV/JSON exports for council reporting |
| **User Management** | Comprehensive admin tools for user oversight |
| **Responsive Design** | Fully optimized for desktop, tablet, and mobile |

### 🗺️ Interactive Heat Map
- Real-time visualization of rubbish reports
- Centered on Sydney CBD with 12 pre-loaded demo locations
- Combines demo data with actual user submissions
- Updates automatically every 30 seconds
- Click markers for detailed location information
- Intensity-based color coding (red = high density)

### 📊 Dashboards

**Community Member Dashboard:**
- Personal statistics (reports, eco points, credits)
- Report history with status tracking
- Heat map of all city reports
- Notification center

**Admin Dashboard:**
- System-wide analytics
- Report management (Pending → Reviewed → Resolved)
- User statistics and growth metrics
- Weekly report generation (CSV/JSON)
- Developer tools and user management
- Real-time heat map monitoring

### 🎓 Educational Content
- **Awareness Page:** Recycling guidelines, environmental impact, global statistics
- **About Us:** Team profiles, technology stack, project information

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** v18 or higher
- **npm** or **pnpm** package manager
- **Supabase Account** (for cloud backend)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/1Sakib1/Smart-Rubbish-Detection.git
cd Smart-Rubbish-Detection

# 2. Install dependencies
npm install
# or
pnpm install

# 3. Configure Supabase (see Configuration section below)

# 4. Start development server
npm run dev
# or
pnpm dev

# 5. Open in browser
# Navigate to http://localhost:5173
```

### Configuration

**Supabase Setup:**

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Update `/utils/supabase/info.tsx`:
   ```typescript
   export const projectId = 'your-project-id';
   export const publicAnonKey = 'your-anon-key';
   ```
3. The KV Store table (`kv_store_3e3b490b`) is automatically created

**Environment Variables (Optional):**
```env
RESEND_API_KEY=your-resend-api-key  # For email notifications
```

---

## 🌐 Deployment

### Vercel Deployment (Recommended)

This project is optimized for Vercel deployment:

1. **Push to GitHub** (follow instructions at the end)
2. **Import to Vercel:**
   - Visit [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Connect your GitHub repository
   - Vercel auto-detects Vite configuration
3. **Add Environment Variables:**
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `RESEND_API_KEY` (optional)
4. **Deploy:** Click "Deploy" and wait ~2 minutes

**Vercel Configuration:** Included in `vercel.json`

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

### Alternative Platforms
- **Netlify:** Use `netlify.toml` configuration
- **GitHub Pages:** Use provided GitHub Actions workflow
- **Railway/Render:** Compatible with included configurations

---

## 🔑 Admin Accounts

The system includes **4 pre-configured admin accounts**:

| # | Email | Password |
|---|-------|----------|
| 1 | `adminsrd1@srd.com.au` | `Admin@123` |
| 2 | `adminsrd2@srd.com.au` | `Admin@123` |
| 3 | `adminsrd3@srd.com.au` | `Admin@123` |
| 4 | `adminsrd4@srd.com.au` | `Admin@123` |

**Admin Features:**
- ✅ View and manage all reports
- ✅ Change report status (Pending/Reviewed/Resolved)
- ✅ Generate weekly council reports (CSV/JSON)
- ✅ Access user management tools
- ✅ View system-wide analytics
- ✅ Monitor heat maps in real-time

---

## 💰 Eco Points System

### How It Works

```
Submit Report → +10 Eco Points → Accumulate 100 Points → $1 AUD Credit
```

**Rewards Structure:**
- **1 Report** = 10 points = $0.10 credit
- **10 Reports** = 100 points = $1.00 credit
- **100 Reports** = 1,000 points = $10.00 credit

**Future Implementation:**
- Redeem credits at local eco-friendly businesses
- Donate to environmental causes
- Unlock premium features

---

## 🛠️ Technology Stack

### Frontend
- **React 18.3.1** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling
- **React Router v7** - Navigation
- **Leaflet.js** - Interactive maps
- **Motion (Framer Motion)** - Animations
- **Lucide React** - Icons
- **Radix UI / shadcn/ui** - Component library
- **React Hook Form** - Form management
- **date-fns** - Date utilities

### Backend
- **Supabase Edge Functions** - Serverless API
- **Hono.js** - Lightweight web framework
- **Supabase PostgreSQL** - Database
- **Supabase KV Store** - Key-value storage
- **Supabase Auth** - Authentication
- **Resend API** - Email service

### DevOps
- **Vite** - Build tool
- **Vercel** - Hosting platform
- **GitHub Actions** - CI/CD
- **ESLint** - Code linting
- **TypeScript Compiler** - Type checking

---

## 📁 Project Structure

```
Smart-Rubbish-Detection/
├── public/
│   ├── favicon.svg
│   └── 404.html
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── ui/                    # shadcn/ui components
│   │   │   ├── Header.tsx             # Navigation header
│   │   │   ├── HeatMap.tsx            # Interactive map
│   │   │   ├── NotificationBell.tsx   # Notification system
│   │   │   └── ProtectedRoute.tsx     # Route protection
│   │   ├── context/
│   │   │   └── AuthContext.tsx        # Authentication state
│   │   ├── pages/
│   │   │   ├── Landing.tsx            # Landing page
│   │   │   ├── Auth.tsx               # Login/Register
│   │   │   ├── Dashboard.tsx          # User dashboard
│   │   │   ├── AdminDashboard.tsx     # Admin panel
│   │   │   ├── ReportRubbish.tsx      # Report submission
│   │   │   ├── Awareness.tsx          # Educational content
│   │   │   ├── AboutUs.tsx            # Team info
│   │   │   ├── DebugUsers.tsx         # User management
│   │   │   └── NotFound.tsx           # 404 page
│   │   ├── utils/
│   │   │   ├── storage.ts             # Local storage utilities
│   │   │   ├── cloudStorage.ts        # Cloud API calls
│   │   │   ├── geocoding.ts           # Location services
│   │   │   ├── reportGenerator.ts     # Weekly reports
│   │   │   └── mockData.ts            # Demo data
│   │   ├── App.tsx                    # Main component
│   │   └── routes.tsx                 # Route definitions
│   ├── styles/
│   │   ├── index.css                  # Global styles
│   │   ├── tailwind.css               # Tailwind config
│   │   ├── theme.css                  # Theme variables
│   │   └── fonts.css                  # Font imports
│   └── main.tsx                       # Entry point
├── supabase/
│   ├── functions/
│   │   └── server/
│   │       ├── index.tsx              # API endpoints
│   │       ├── auth.tsx               # Auth logic
│   │       └── kv_store.tsx           # KV utilities
│   └── migrations/
│       └── 001_initial_schema.sql     # Database schema
├── utils/
│   └── supabase/
│       └── info.tsx                   # Supabase config
├── .github/
│   └── workflows/
│       └── deploy.yml                 # GitHub Actions
├── ISSUE_TEMPLATE/                    # GitHub issue templates
├── guidelines/                        # Development guidelines
├── .gitignore
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vercel.json
├── README.md
├── USER_MANUAL.md                     # Comprehensive guide
├── CONTRIBUTING.md                    # Contribution guide
├── ADMIN_CREDENTIALS.md               # Admin access info
├── ATTRIBUTIONS.md                    # Credits
└── LICENSE
```

---

## 👥 Development Team

**Victoria University Sydney - NIT3004 IT Capstone Project 2026**

| Name | Role | Email |
|------|------|-------|
| **Nazmus Sakib** | Project Leader & Full Stack Developer | s8116515@live.vu.edu.au |
| **Md Abudozana Niloy** | Full Stack Developer | s8138202@live.vu.edu.au |
| **Suvekshya Shrestha** | UI/UX Designer & Developer | s8103527@live.vu.edu.au |
| **Bisesta Shah** | Backend Developer | s8103504@live.vu.edu.au |

---

## 📊 Sample Data

The application includes **12 pre-loaded demo locations** across iconic Sydney sites:

| Location | Type | Coordinates |
|----------|------|-------------|
| Sydney Opera House | Litter | -33.8568, 151.2153 |
| Bondi Beach | Overflowing Bins | -33.8915, 151.2767 |
| The Rocks | Illegal Dumping | -33.8599, 151.2090 |
| Darling Harbour | Litter | -33.8737, 151.2006 |
| Circular Quay | Litter | -33.8616, 151.2111 |
| Royal Botanic Gardens | Litter | -33.8642, 151.2166 |
| Hyde Park | Litter | -33.8731, 151.2107 |
| Chinatown | Overflowing Bins | -33.8781, 151.2052 |
| Pyrmont | Illegal Dumping | -33.8688, 151.1932 |
| Barangaroo Reserve | Litter | -33.8593, 151.2015 |
| Sydney Tower Eye | Litter | -33.8704, 151.2093 |
| Newtown | Overflowing Bins | -33.8974, 151.1794 |

These demo points are combined with real user-submitted reports on the heat map.

---

## 🔒 Security & Privacy

### Data Protection
- ✅ HTTPS encryption for all data transmission
- ✅ Passwords hashed with bcrypt (never stored in plain text)
- ✅ JWT-based authentication tokens
- ✅ Input validation and sanitization
- ✅ XSS and CSRF protection
- ✅ Rate limiting on API endpoints
- ✅ Secure cloud storage (Supabase)

### Data Collection
**We Collect:**
- Email address (for authentication)
- Full name (for user profiles)
- Location data (only when submitting reports)
- Photos (optional, only when uploaded)
- Report descriptions

**We Don't Collect:**
- Browsing history
- Device information
- Marketing/tracking data
- Third-party cookies

### Privacy Compliance
- Users can only access their own data
- Admins have elevated permissions for moderation
- No data sharing with third parties
- Automatic data backups and recovery

---

## 🤝 Contributing

We welcome contributions from the community! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

### Quick Contribution Guide

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/AmazingFeature
   ```
5. **Open a Pull Request**

### Development Guidelines
- Follow TypeScript best practices
- Use functional React components with hooks
- Write descriptive commit messages
- Add comments for complex logic
- Test on multiple browsers
- Ensure mobile responsiveness

---

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

**TL;DR:** You can use, modify, and distribute this project freely, with attribution.

---

## 🙏 Acknowledgments

### Organizations
- **Victoria University Sydney** - Academic support and resources
- **City of Sydney Council** - Inspiration and requirements
- **NSW Environment Protection Authority** - Environmental guidelines
- **Planet Ark** - Recycling information

### Technologies
- [**Supabase**](https://supabase.com) - Cloud infrastructure
- [**Vercel**](https://vercel.com) - Hosting platform
- [**OpenStreetMap**](https://www.openstreetmap.org) - Map data
- [**Leaflet**](https://leafletjs.com) - Map rendering
- [**Unsplash**](https://unsplash.com) - High-quality images
- [**shadcn/ui**](https://ui.shadcn.com) - UI components
- [**Lucide**](https://lucide.dev) - Icon library

### Open Source Community
Thank you to all the maintainers of the open-source libraries that make this project possible.

---

## 📞 Support & Contact

### For Users
- 📖 **Documentation:** [USER_MANUAL.md](USER_MANUAL.md)
- 🐛 **Report Bugs:** [GitHub Issues](https://github.com/1Sakib1/SRD/issues)
- 💡 **Feature Requests:** [GitHub Issues](https://github.com/1Sakib1/Smart-Rubbish-Detection/issues)

### For Developers
- 📧 **Project Leader:** Nazmus Sakib - s8116515@live.vu.edu.au
- 💬 **Discussions:** [GitHub Discussions](https://github.com/1Sakib1/Smart-Rubbish-Detection/discussions)
- 🔗 **LinkedIn:** Connect with team members

### For Academic Inquiries
- 🎓 **Victoria University Sydney**
- 📚 **Course:** NIT3004 - IT Capstone Project
- 📆 **Year:** 2026

---

## 📈 Project Status

**Current Version:** 1.0.0 (Production)

✅ **Completed Features:**
- Dual authentication system
- GPS auto-detection with fallback
- Real-time heat maps (30s refresh)
- Photo upload support
- Eco points reward system
- Cloud data storage
- Weekly council reports (CSV/JSON)
- Admin dashboard
- User management
- Responsive design
- Email notifications
- Input validation
- Duplicate prevention
- Educational content
- About Us page

🚧 **Future Enhancements:**
- Mobile app (iOS/Android)
- Push notifications
- Credit redemption system
- Multi-language support
- Dark mode
- Advanced analytics
- API for third-party integration
- Social sharing features

---

## 🎨 Design Philosophy

### Color Palette
- **Primary Green:** `#16a34a` - Sustainability and growth
- **Background:** `#ffffff` / `#f9fafb` - Clean and modern
- **Text:** `#111827` / `#6b7280` - Readable hierarchy
- **Accents:** Strategic use for CTAs and alerts

### Typography
- **Headings:** System font stack (optimized for each OS)
- **Body:** Consistent 16px base size
- **Monospace:** For code and technical info

### Spacing
- **Grid System:** 8px base unit
- **Responsive:** Mobile-first approach
- **Touch Targets:** Minimum 44x44px for mobile

---

## 📸 Screenshots

**Landing Page:**
Modern, eco-friendly design with clear call-to-action and social proof statistics.

**Report Rubbish:**
Two-column layout with comprehensive form and interactive heat map showing real-time data.

**Dashboard:**
Personal statistics, report history, and heat map visualization.

**Admin Dashboard:**
System-wide analytics, report management, and weekly report generation.

---

## 🌟 Star History

If you find this project useful, please consider giving it a ⭐ on GitHub!

---

## 📄 Additional Documentation

- 📘 [**User Manual**](USER_MANUAL.md) - Comprehensive guide for all users
- 🚀 [**Deployment Notes**](DEPLOYMENT_NOTES.md) - Build and deployment troubleshooting
- 🔐 [**Admin Credentials**](ADMIN_CREDENTIALS.md) - Admin access information
- 🤝 [**Contributing Guide**](CONTRIBUTING.md) - How to contribute
- 🏆 [**Attributions**](ATTRIBUTIONS.md) - Credits and acknowledgments
- ⚖️ [**License**](LICENSE) - MIT License details

---

**Built with ❤️ for a cleaner, greener world**

© 2026 Victoria University Sydney - IT Capstone Project Team
