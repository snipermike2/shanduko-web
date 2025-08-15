# Shanduko Web PWA

A progressive web application for community-driven water quality monitoring in Zimbabwe, focusing on Lake Chivero.

## Features

- 📊 **Real-time Dashboard** - Live water quality metrics with anomaly detection
- 🗺️ **Interactive Map** - Heatmap visualization and clustered anomaly markers
- 📝 **Community Reports** - Submit and verify water quality issues with photos
- 🎓 **Educational Quizzes** - Daily knowledge tests with XP rewards
- 🏆 **Gamification** - Points, badges, streaks, and leaderboards
- 📱 **PWA Support** - Install as mobile app with offline functionality
- 🌐 **Multi-mode** - Cloud backend via Supabase or local demo data

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Supabase (Auth, Database, Storage)
- **Maps**: Mapbox GL JS with Leaflet fallback
- **Charts**: Recharts
- **PWA**: Service Worker, Web App Manifest

## Quick Setup

1. **Clone and install dependencies**:
   ```bash
   git clone <repository-url>
   cd shanduko-web
   npm install
   ```

2. **Environment setup**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your keys (optional - works in demo mode without)
   ```

3. **Run in development**:
   ```bash
   npm run dev
   ```

4. **Visit**: http://localhost:3000

## Environment Variables

Create `.env.local` with:

```bash
# Supabase (optional - app works in demo mode without these)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Mapbox (optional - falls back to Leaflet)
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_access_token
```

## Supabase Setup (Optional)

If you want to use the cloud backend:

1. Create a new Supabase project
2. Run the SQL from `supabase.sql` in the SQL editor
3. Configure storage bucket permissions
4. Add your environment variables

## Available Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Production server
npm run lint         # Lint code
npm run type-check   # TypeScript check
```

## Demo Mode vs Cloud Mode

The app works in two modes:

### Demo Mode (Default)
- Works without any setup
- Uses local storage for data persistence
- Perfect for development and testing
- Switch via Settings > "Use Cloud Backend"

### Cloud Mode
- Requires Supabase configuration
- Real-time data sync across devices
- User authentication with magic links
- Persistent data storage

## Smoke Test Checklist

After setup, verify these features work:

- [ ] Dashboard loads with metric cards and charts
- [ ] Map renders with heatmap and markers
- [ ] Reports list displays and new report form works
- [ ] Learn page shows quiz (can complete once daily)
- [ ] Leaderboard shows rankings
- [ ] Settings allow preference changes
- [ ] PWA install prompt appears on mobile
- [ ] App works offline after first visit
- [ ] XP and badges system functions (if gamification enabled)
- [ ] Photo upload works in reports
- [ ] Map location picker functions

## Project Structure

```
app/
├── (tabs)/              # Main app routes
│   ├── dashboard/       # Water quality metrics & charts
│   ├── map/            # Interactive map with heatmap
│   ├── reports/        # Community reports system
│   ├── learn/          # Educational quizzes
│   ├── leaderboard/    # User rankings
│   └── settings/       # User preferences
components/
├── ui/                 # Reusable UI components
├── layout/             # Navigation & shell
├── MetricCard.tsx      # Dashboard metric display
├── Chart.tsx           # Time-series charts
├── Map.tsx             # Interactive map component
└── ...
lib/
├── api.ts              # Data layer & API calls
├── supabaseClient.ts   # Supabase configuration
├── demoData.ts         # Local demo data generation
└── utils.ts            # Utility functions
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly using the smoke test checklist
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
- Check the smoke test checklist
- Review environment variable setup
- Ensure Supabase configuration if using cloud mode
- Check browser console for errors