# Oikkoboddho Bangladesh - Deployment Guide

## 🚀 Production Deployment

### Prerequisites
- Vercel account (free tier available)
- Supabase project (already configured: `xmntrmndcpdetgpvrbaw`)
- Telegram Bot Token and Channel ID

### Environment Variables

Create these environment variables in your deployment platform:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xmntrmndcpdetgpvrbaw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtbnRybW5kY3BkZXRncHZyYmF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NzE4NzIsImV4cCI6MjA1MDU0Nzg3Mn0.rvdJCdNlKFdLfNLbFqGDmBPHfKKZwHBPZEfMPJQKTNs

# Telegram
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_channel_id_here

# Payload CMS (for admin panel)
PAYLOAD_SECRET=your_secure_random_string_here
DATABASE_URI=file:./payload.db
```

### Deploy to Vercel

1. **Install Vercel CLI** (optional):
   ```bash
   npm i -g vercel
   ```

2. **Deploy via CLI**:
   ```bash
   vercel
   ```

3. **Or Deploy via GitHub**:
   - Push your code to GitHub
   - Import repository in Vercel dashboard
   - Add environment variables
   - Deploy

4. **Configure Environment Variables in Vercel**:
   - Go to Project Settings → Environment Variables
   - Add all variables from above
   - Redeploy

### Post-Deployment Setup

1. **Initialize Payload Admin**:
   - Visit `https://your-domain.vercel.app/admin`
   - Create super admin account:
     - Email: `oikkoboddhobangladesh.online@gmail.com`
     - Password: `Bangladesh@2026`

2. **Test Features**:
   - ✅ SOS Report submission
   - ✅ Video link sharing (Facebook/YouTube)
   - ✅ Telegram notifications
   - ✅ Map display with incidents
   - ✅ Quick Response Team tracking

## 📱 Features Implemented

### Core Features
- **SOS Reporting**: Users can report incidents with location, description, and media
- **Video Link Sharing**: Support for Facebook and YouTube links with auto-embed
- **Platform Detection**: Automatic icon display for Facebook/YouTube links
- **Telegram Integration**: Automatic notifications to designated channel
- **Real-time Map**: Live incident markers with embedded video previews
- **Quick Response Team**: Renamed from "Red Team" for better clarity

### Admin Panel
- **Payload CMS**: Full admin dashboard at `/admin`
- **Collections**: Users, Incidents, CCTV Locations, Media
- **SQLite Database**: Lightweight, file-based storage

## 🔧 Technical Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: Supabase (PostgreSQL) + Payload SQLite
- **Maps**: MapLibre GL JS with OpenFreeMap
- **Styling**: Tailwind CSS
- **CMS**: Payload CMS
- **Notifications**: Telegram Bot API

## 🎨 UI/UX Improvements

- Hidden Next.js dev indicator for cleaner production UI
- Platform-specific icons (Facebook/YouTube) in report form
- Auto-embed video previews in map popups
- Responsive glassmorphism design
- Dark mode support

## 📝 Notes

- The app uses `reports` table in Supabase for incident storage
- Video links are appended to description for database compatibility
- Separate `video_link` field sent to Telegram API for clean notifications
- All builds are production-ready with no TypeScript errors

## 🆘 Support

For issues or questions, contact the development team.

---

**Last Updated**: February 12, 2026
**Version**: 1.0.0 Production Ready
