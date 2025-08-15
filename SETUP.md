# Shanduko Web PWA - Complete Setup Guide

## 🚀 Quick Start (Works Immediately)

```bash
# 1. Install dependencies
npm install

# 2. Run development server
npm run dev

# 3. Open http://localhost:3000
```

**That's it!** The app works in demo mode without any configuration.

## ⚙️ Optional: Supabase Cloud Backend Setup

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Note your Project URL and anon key

### 2. Setup Database
```sql
-- Run this SQL in Supabase SQL Editor:
-- Copy and paste the entire contents of supabase.sql
```

### 3. Configure Storage
1. Go to Storage in Supabase dashboard
2. Create bucket named "reports"
3. Set bucket to public
4. Set RLS policies (already in supabase.sql)

### 4. Environment Variables
```bash
cp .env.example .env.local
# Edit .env.local with your Supabase credentials
```

### 5. Optional: Mapbox Setup
1. Get token from [mapbox.com](https://mapbox.com)
2. Add to .env.local
3. Falls back to OpenStreetMap if not provided

## 🧪 Smoke Test Checklist

Run through these to verify everything works:

### Core Features
- [ ] Dashboard loads with metric cards and animated charts
- [ ] Map displays with markers and optional heatmap
- [ ] Reports page shows list and allows new submissions
- [ ] Learn page displays quiz (can complete once daily)
- [ ] Leaderboard shows user rankings
- [ ] Settings page allows customization

### PWA Features
- [ ] Install prompt appears on mobile browsers
- [ ] App works offline after first visit
- [ ] App installs as standalone application
- [ ] Service worker caches resources

### Demo vs Cloud Mode
- [ ] Demo mode: Data persists in localStorage
- [ ] Cloud mode: Data syncs with Supabase
- [ ] Mode switching works in Settings
- [ ] No errors in browser console

### Interactive Features
- [ ] Photo upload works in report form
- [ ] Map location picker functions
- [ ] Quiz awards XP and tracks daily attempts
- [ ] Anomaly detection shows warnings
- [ ] Feature toggles work in settings

### Responsive Design
- [ ] Mobile: Bottom tab navigation
- [ ] Desktop: Side navigation
- [ ] Charts and maps resize properly
- [ ] Touch interactions work on mobile

## 🏗️ Architecture Overview

### Frontend (Next.js 14)
- **App Router**: File-based routing
- **TypeScript**: Type safety throughout
- **Tailwind CSS**: Utility-first styling
- **PWA**: Manifest + Service Worker

### Data Layer
- **Demo Mode**: localStorage + JSON files
- **Cloud Mode**: Supabase (PostgreSQL + Auth + Storage)
- **API Layer**: lib/api.ts handles both modes

### Components
- **Layout**: Responsive shell with navigation
- **Charts**: Recharts with animations
- **Maps**: Mapbox GL JS with Leaflet fallback
- **Forms**: Photo upload, location picker
- **Gamification**: Points, badges, streaks

### Features
- **Real-time**: Auto-refresh every 30s
- **Offline**: Service Worker caching
- **Responsive**: Mobile-first design
- **Accessible**: WCAG compliance
- **Performance**: Optimized bundles

## 📱 Production Deployment

### Vercel (Recommended)
```bash
npm run build
# Deploy to Vercel
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Variables for Production
```bash
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## 🐛 Troubleshooting

### Common Issues

**Map doesn't load:**
- Check console for Mapbox/Leaflet errors
- Verify NEXT_PUBLIC_MAPBOX_TOKEN (or rely on Leaflet fallback)

**Supabase connection fails:**
- Verify environment variables
- Check Supabase project status
- Review RLS policies in database

**PWA install doesn't work:**
- Ensure HTTPS (required for PWA)
- Check manifest.webmanifest is accessible
- Verify service worker registration

**Charts don't animate:**
- Check "Animated Charts" toggle in Settings
- Verify Recharts import is working
- Check for JavaScript errors

### Performance Issues
- Run `npm run build` to check bundle size
- Use Next.js Image component for optimized images
- Enable Supabase connection pooling for high traffic

## 🔧 Development Commands

```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint check
npm run type-check   # TypeScript check
```

## 📊 Monitoring

### Analytics
- Add Google Analytics 4
- Track PWA install events
- Monitor quiz completion rates
- Track report submission patterns

### Error Monitoring
- Add Sentry for error tracking
- Monitor Supabase API usage
- Track offline functionality

## 🎯 Next Steps

After successful deployment:

1. **User Testing**: Gather feedback from real users
2. **Performance**: Monitor Core Web Vitals
3. **Features**: Add push notifications
4. **Scaling**: Optimize for higher user loads
5. **Analytics**: Track usage patterns

## 💡 Tips

- Start with demo mode for development
- Use Supabase for production persistence
- Test PWA features on actual mobile devices
- Monitor console for any errors
- Keep the quiz questions fresh and updated

---

**Need Help?**
Check the browser console for detailed error messages and refer to the component source code for implementation details.