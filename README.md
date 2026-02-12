# 🇧🇩 Oikkoboddho Bangladesh - Quick Response Team PWA

A Progressive Web Application (PWA) for emergency incident reporting and quick response coordination in Bangladesh.

## 🚀 Features

### Core Functionality
- **🆘 SOS Reporting**: Real-time incident reporting with location tracking
- **📹 Video Link Sharing**: Share Facebook and YouTube links with automatic platform detection
- **🗺️ Interactive Map**: Live incident markers with embedded video previews
- **📱 Mobile-First Design**: Optimized for mobile devices with offline support
- **🔔 Telegram Integration**: Automatic notifications to designated channels
- **👥 Quick Response Team**: Real-time team member tracking and coordination

### Technical Features
- **Real-time Updates**: Live incident updates using Supabase subscriptions
- **Bilingual Support**: Full Bengali and English translations
- **Geolocation**: Automatic location detection and manual location selection
- **Media Upload**: Support for image attachments with incidents
- **Admin Panel**: Payload CMS for content management
- **Dark Mode**: Automatic theme switching based on system preferences

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Maps**: MapLibre GL JS with OpenFreeMap
- **Styling**: Tailwind CSS
- **CMS**: Payload CMS
- **Notifications**: Telegram Bot API
- **Deployment**: Vercel

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- Telegram Bot Token

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/oikkoboddhobangladeshonline-ncp/oikkoboddho-bangladesh.git
cd oikkoboddho-bangladesh
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**

Create a `.env.local` file:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Telegram
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_channel_id

# Payload CMS
PAYLOAD_SECRET=your_random_secret_32_chars_min
DATABASE_URI=file:./payload.db
```

4. **Run development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🚀 Deployment

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/oikkoboddhobangladeshonline-ncp/oikkoboddho-bangladesh)

1. Click the "Deploy" button above
2. Connect your GitHub account
3. Add environment variables
4. Deploy!

### Manual Deployment

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 📱 Usage

### For Citizens

1. **Report an Incident**
   - Click the SOS button
   - Describe the incident
   - Optionally add a video link (Facebook/YouTube)
   - Upload a photo if available
   - Submit

2. **Track Incidents**
   - View all incidents on the map
   - Click markers to see details
   - Watch embedded videos in popups

### For Administrators

1. **Access Admin Panel**
   - Visit `/admin`
   - Login with credentials
   - Manage incidents, users, and CCTV locations

2. **Monitor Telegram Channel**
   - Receive instant notifications
   - View incident details and locations
   - Coordinate response teams

## 🗂️ Project Structure

```
├── app/                    # Next.js app directory
│   ├── (payload)/         # Payload CMS routes
│   ├── api/               # API routes
│   ├── layout.js          # Root layout
│   └── page.js            # Home page
├── components/            # React components
│   ├── MapDisplay.js      # Main map component
│   ├── ReportForm.js      # Incident report form
│   └── ...
├── lib/                   # Utilities
│   ├── supabase.js        # Supabase client
│   └── translations.js    # i18n translations
├── public/                # Static assets
├── collections/           # Payload CMS collections
└── payload.config.ts      # Payload CMS config
```

## 🔧 Configuration

### Supabase Setup

Create the following tables in your Supabase project:

**reports** table:
```sql
CREATE TABLE reports (
  id BIGSERIAL PRIMARY KEY,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  description TEXT,
  image_url TEXT,
  reporter_info TEXT,
  status TEXT DEFAULT 'open',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Telegram Bot Setup

1. Create a bot with @BotFather
2. Get your bot token
3. Create a channel and add the bot as admin
4. Get the channel ID using `getUpdates` API

## 🌐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `TELEGRAM_BOT_TOKEN` | Telegram bot token | Yes |
| `TELEGRAM_CHAT_ID` | Telegram channel/chat ID | Yes |
| `PAYLOAD_SECRET` | Secret for Payload CMS | Yes |
| `DATABASE_URI` | Database connection string | Yes |

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👥 Team

**Oikkoboddho Bangladesh**  
Quick Response Team

## 📞 Support

For support, email oikkoboddhobangladesh.online@gmail.com

---

**Made with ❤️ for Bangladesh** 🇧🇩
