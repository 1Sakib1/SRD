# LitterPin - AI-Powered Environmental Clean-up Platform

**A Global Urban Waste Management Platform**

[![Status](https://img.shields.io/badge/Status-Live-success)](https://litterpin.org)
[![License](https://img.shields.io/badge/License-MIT-blue)](LICENSE)
[![React](https://img.shields.io/badge/React-18.3.1-61dafb)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-Latest-3178c6)](https://www.typescriptlang.org/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](https://vercel.com)

A comprehensive, production-ready web application that empowers communities worldwide to actively participate in urban waste management through innovative technology, real-time data visualization, AI integration, and gamified rewards.

---

## 🚀 Quick Links

- **🌐 Live Application:** [litterpin.org](https://litterpin.org/)
- **📖 User Manual:** [Read the Guide](USER_MANUAL.md)
- **🛠️ Deployment Guide:** [Build & Deploy Guide](DEPLOYMENT.md)
- **🐛 Report Issues:** [GitHub Issues](https://github.com/1Sakib1/SRD/issues)

---

## 🌟 Key Features

| Feature | Description |
|---------|-------------|
| **AI Integration** | Intelligent AI assistant for rapid support and dynamic issue categorization |
| **Interactive Heat Maps** | Real-time global visualizations updating seamlessly across the network |
| **Eco Points Economy** | Gamified rewards system: 1 Report = 10 points. 1,000 points = $1.00 AUD |
| **Community Voting** | Verify cleanup status via crowdsourced "Still there" or "Gone" voting |
| **Dual Authentication** | Secure role-based login systems for community members and administrators |
| **Cloud Infrastructure** | High-performance Supabase PostgreSQL and Edge Functions backend |
| **Responsive Design** | Pixel-perfect fluid UI optimized for desktop, tablet, and mobile browsers |

### 🗺️ Real-Time Community Map
- Real-time visualization of global rubbish reports
- Dynamic clustering and intensity-based heat markers
- In-map photo previews for visual evidence
- Interactive popup voting system to maintain accurate map state
- Fluid transition between dedicated full-screen map mode and dashboard widgets

### 📊 Dashboards

**Community Member Dashboard:**
- Track personal impact (reports submitted, eco points earned, credits unlocked)
- View interactive history with status tracking
- Monitor the community leaderboard

**Admin Dashboard:**
- Complete oversight of system-wide analytics
- Streamlined report management workflow (Pending → Reviewed → Resolved)
- User statistics, growth metrics, and behavior analytics
- Automated CSV/JSON weekly report generation

---

## 💻 Tech Stack

### Frontend
- **React 18.3.1** & **TypeScript**
- **Vite** - High-performance build tooling
- **Tailwind CSS v4** - Utility-first styling
- **React Router v7** - Modern routing architecture
- **Leaflet.js & react-leaflet** - Interactive map rendering
- **Framer Motion** - Fluid animations

### Backend & Infrastructure
- **Supabase PostgreSQL** - Relational database
- **Supabase Edge Functions** - Serverless API layer
- **Hono.js** - Ultra-fast web framework for Edge Functions
- **Vercel** - Edge-optimized hosting and CI/CD
- **Resend API** - Transactional email service

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** v18 or higher
- **npm** or **pnpm**
- **Supabase Account** (for backend services)

### Local Development

```bash
# 1. Clone the repository
git clone https://github.com/1Sakib1/SRD.git
cd SRD

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```
The application will be available at `http://localhost:5173`.

### Environment Setup

Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
RESEND_API_KEY=your-resend-api-key
```

---

## 💰 Eco Points System

LitterPin rewards users for keeping their communities clean.

- **1 Report Submitted** = 10 Eco Points
- **100 Reports Submitted** = 1,000 Eco Points = **$1.00 AUD Credit**

*Credits can be tracked directly from the dashboard and leaderboard.*

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

© 2026 LitterPin. All rights reserved.
