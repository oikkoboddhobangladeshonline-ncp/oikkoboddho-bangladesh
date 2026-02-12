# GitHub & Vercel Deployment Guide

## 🎯 Complete Guide: GitHub Connection + Vercel Deployment

This guide will help you connect this project to a different GitHub account and deploy it on Vercel for free.

---

## Part 1: Prepare Your Project

### Step 1: Create `.gitignore` File
First, ensure sensitive files are not committed to GitHub.

The project already has a `.gitignore` file, but verify it includes:
```
# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local
.env

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts

# payload
/payload.db
/payload.db-shm
/payload.db-wal
```

### Step 2: Create a README for GitHub
A good README helps others understand your project.

---

## Part 2: Connect to Different GitHub Account

### Option A: Using GitHub CLI (Recommended - Easiest)

#### 1. Install GitHub CLI (if not installed)
```bash
# On macOS
brew install gh
```

#### 2. Logout from Current Account (if logged in)
```bash
gh auth logout
```

#### 3. Login to Your Different GitHub Account
```bash
gh auth login
```

Follow the prompts:
- Choose: **GitHub.com**
- Choose: **HTTPS** (recommended)
- Authenticate with: **Login with a web browser**
- Copy the one-time code and press Enter
- Browser will open - login with your different GitHub account
- Authorize the GitHub CLI

#### 4. Create a New Repository
```bash
cd /Users/saaduddinsony/Downloads/Antigravity/APP
gh repo create oikkoboddho-bangladesh --public --source=. --remote=origin --push
```

This will:
- Create a new public repository named "oikkoboddho-bangladesh"
- Set it as the origin remote
- Push your code automatically

**Alternative command with description:**
```bash
gh repo create oikkoboddho-bangladesh \
  --public \
  --description "Oikkoboddho Bangladesh - Quick Response Team PWA" \
  --source=. \
  --remote=origin \
  --push
```

---

### Option B: Using Git Commands (Manual Method)

#### 1. Check Current Git Configuration
```bash
cd /Users/saaduddinsony/Downloads/Antigravity/APP
git config user.name
git config user.email
```

#### 2. Update Git Configuration for This Project
```bash
# Set your different GitHub account details for this project only
git config user.name "Your New GitHub Username"
git config user.email "your-new-github-email@example.com"
```

#### 3. Initialize Git (if not already initialized)
```bash
git init
```

#### 4. Create Repository on GitHub Manually
1. Go to https://github.com
2. **Logout** from current account
3. **Login** with your different GitHub account
4. Click the **"+"** icon (top right) → **"New repository"**
5. Repository name: `oikkoboddho-bangladesh`
6. Description: `Oikkoboddho Bangladesh - Quick Response Team PWA`
7. Choose: **Public** (for free Vercel deployment)
8. **DO NOT** initialize with README, .gitignore, or license
9. Click **"Create repository"**

#### 5. Connect Local Project to GitHub
```bash
# Add the remote repository
git remote add origin https://github.com/YOUR-USERNAME/oikkoboddho-bangladesh.git

# Or if remote already exists, update it:
git remote set-url origin https://github.com/YOUR-USERNAME/oikkoboddho-bangladesh.git

# Stage all files
git add .

# Commit
git commit -m "Initial commit: Oikkoboddho Bangladesh Quick Response PWA"

# Push to GitHub
git branch -M main
git push -u origin main
```

**Note:** Replace `YOUR-USERNAME` with your actual GitHub username.

#### 6. Authenticate When Pushing
When you push, GitHub will ask for credentials:
- **Username:** Your new GitHub username
- **Password:** Use a **Personal Access Token** (not your password)

**To create a Personal Access Token:**
1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it a name: "Vercel Deployment"
4. Select scopes: `repo` (full control of private repositories)
5. Click "Generate token"
6. **Copy the token** (you won't see it again!)
7. Use this token as your password when pushing

---

## Part 3: Deploy to Vercel (Free)

### Step 1: Sign Up / Login to Vercel

1. Go to https://vercel.com
2. Click **"Sign Up"** or **"Login"**
3. Choose **"Continue with GitHub"**
4. Login with the **same GitHub account** you just pushed the code to
5. Authorize Vercel to access your GitHub account

### Step 2: Import Your Project

1. After logging in, click **"Add New..."** → **"Project"**
2. You'll see a list of your GitHub repositories
3. Find **"oikkoboddho-bangladesh"** and click **"Import"**

### Step 3: Configure Project Settings

Vercel will auto-detect Next.js. Configure as follows:

**Framework Preset:** Next.js (auto-detected)

**Root Directory:** `./` (leave as default)

**Build Command:** 
```bash
npm run build
```

**Output Directory:** `.next` (auto-detected)

**Install Command:**
```bash
npm install
```

### Step 4: Add Environment Variables

Click **"Environment Variables"** and add these:

| Name | Value | Environment |
|------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xmntrmndcpdetgpvrbaw.supabase.co` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtbnRybW5kY3BkZXRncHZyYmF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NzE4NzIsImV4cCI6MjA1MDU0Nzg3Mn0.rvdJCdNlKFdLfNLbFqGDmBPHfKKZwHBPZEfMPJQKTNs` | Production, Preview, Development |
| `TELEGRAM_BOT_TOKEN` | Your bot token from @BotFather | Production, Preview, Development |
| `TELEGRAM_CHAT_ID` | Your channel/chat ID | Production, Preview, Development |
| `PAYLOAD_SECRET` | Generate a random string (min 32 chars) | Production, Preview, Development |
| `DATABASE_URI` | `file:./payload.db` | Production, Preview, Development |

**To generate PAYLOAD_SECRET:**
```bash
openssl rand -base64 32
```

**To get TELEGRAM_BOT_TOKEN:**
1. Open Telegram
2. Search for @BotFather
3. Send `/newbot`
4. Follow instructions to create your bot
5. Copy the token provided

**To get TELEGRAM_CHAT_ID:**
1. Create a Telegram channel or group
2. Add your bot as admin
3. Send a message to the channel
4. Visit: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
5. Find the `chat` object and copy the `id`

### Step 5: Deploy

1. Click **"Deploy"**
2. Wait 2-3 minutes for the build to complete
3. Once done, you'll see: **"Congratulations! Your project has been deployed."**
4. Click **"Visit"** to see your live site

### Step 6: Get Your Live URL

Your app will be live at:
```
https://oikkoboddho-bangladesh.vercel.app
```

Or a custom domain like:
```
https://oikkoboddho-bangladesh-[random].vercel.app
```

---

## Part 4: Post-Deployment Setup

### 1. Initialize Payload Admin

Visit your deployed site:
```
https://your-app.vercel.app/admin
```

Create your super admin account:
- **Email:** `oikkoboddhobangladesh.online@gmail.com`
- **Password:** `Bangladesh@2026` (or your preferred password)

### 2. Test All Features

- ✅ SOS Report submission
- ✅ Video link sharing (Facebook/YouTube)
- ✅ Map display
- ✅ Telegram notifications
- ✅ Admin panel access

### 3. Configure Custom Domain (Optional)

In Vercel Dashboard:
1. Go to your project → **Settings** → **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions
4. Wait for DNS propagation (5-60 minutes)

---

## Part 5: Future Updates

### To Update Your Deployed App:

```bash
# Make your changes locally
# Then commit and push:

git add .
git commit -m "Description of your changes"
git push origin main
```

Vercel will **automatically deploy** your changes within 1-2 minutes!

---

## Troubleshooting

### Issue: Build Fails on Vercel

**Solution:** Check build logs in Vercel dashboard. Common issues:
- Missing environment variables
- TypeScript errors (we've fixed these)
- Dependency issues

### Issue: Can't Push to GitHub

**Solution:** 
```bash
# Check remote URL
git remote -v

# Update if needed
git remote set-url origin https://github.com/YOUR-USERNAME/oikkoboddho-bangladesh.git

# Use Personal Access Token as password
```

### Issue: Telegram Notifications Not Working

**Solution:**
- Verify `TELEGRAM_BOT_TOKEN` is correct
- Verify `TELEGRAM_CHAT_ID` is correct
- Ensure bot is admin in the channel
- Check Vercel logs for errors

### Issue: Database Not Persisting

**Solution:** Vercel's free tier has ephemeral filesystem. For persistent storage:
- Use Supabase for all data (recommended)
- Or upgrade to Vercel Pro for persistent storage
- Or use external database service

---

## Cost Breakdown

### Free Tier Includes:
- ✅ Unlimited deployments
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ 100 GB bandwidth/month
- ✅ Serverless functions
- ✅ Preview deployments for PRs
- ✅ Custom domains

### You Pay $0 for:
- GitHub (public repository)
- Vercel (free tier)
- Supabase (free tier - 500 MB database, 1 GB file storage)
- Telegram Bot API (free)

---

## Quick Command Reference

```bash
# Check Git status
git status

# Check current remote
git remote -v

# Pull latest changes
git pull origin main

# Push changes
git push origin main

# View commit history
git log --oneline

# Create new branch
git checkout -b feature-name

# Switch branches
git checkout main
```

---

## Support & Resources

- **Vercel Docs:** https://vercel.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **GitHub Docs:** https://docs.github.com
- **Supabase Docs:** https://supabase.com/docs

---

**🎉 You're all set! Your app will be live on Vercel with automatic deployments from GitHub.**

**Last Updated:** February 12, 2026
