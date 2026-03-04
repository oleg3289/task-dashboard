# 📊 Task Dashboard - Company Workflow Tracker

A modern, mobile-friendly dashboard for tracking company workflows and agent assignments. Hosted on GitHub Pages for easy access from any device.

## 🌐 Live Demo

🔗 **Accessible at:** [https://olegsytnik.github.io/task-dashboard](https://olegsytnik.github.io/task-dashboard)

_Replace with your GitHub username above_

## 📱 Mobile Optimized

- Responsive design that works perfectly on phones
- Touch-friendly interface 
- Auto-refresh every 10 seconds
- Works offline-first

## 🚀 Features

✅ **Agile Workflow Tracking** - Stories with hierarchical ticket breakdowns  
✅ **Real Agent Assignments** - Company team with proper roles and skills  
✅ **Automatic Refresh** - Polling updates without manual intervention  
✅ **GitHub Hosting** - Deploys automatically to GitHub Pages  
✅ **Mobile Responsive** - Optimized for phone viewing  

## 📋 Current Status

**Dashboard shows:**
- **8 Agents** with specialized roles (Makima, Reze, Aki, Power, Denji, Kobeni, Himeno, Kishibe)
- **3 Stories** with ticket breakdowns
- Auto-refresh functionality active

## 🛠 Deployment Instructions

### Automatic GitHub Pages Deployment
1. Push to `main` branch
2. GitHub Actions automatically builds and deploys
3. Access at `https://yourusername.github.io/task-dashboard`

### Manual Deployment
```bash
npm run build
# Upload 'out/' folder to any static hosting service
```

## 🔧 Development

```bash
npm install
npm run dev
# Open http://localhost:3000
```

## 📁 Project Structure

```
├── public/data/           # Static JSON data files
│   ├── agents.json       # Company agent profiles
│   └── stories.json      # Current workflow stories
├── src/
│   ├── app/              # Next.js app directory
│   ├── components/ui/     # Reusable UI components
│   └── hooks/            # Custom React hooks
└── .github/workflows/    # GitHub Actions config
```

## 🎯 Technology Stack

- **Next.js 14** - React framework
- **Tailwind CSS** - Styling
- **TypeScript** - Type safety
- **GitHub Pages** - Hosting
- **GitHub Actions** - CI/CD

## 📞 Support

This dashboard is part of the company workflow tracking system. For issues or updates, contact the founding team.

---

**Built with ❤️ for efficient company operations**# Tabbed interface update Wed Mar  4 11:44:10 CET 2026
