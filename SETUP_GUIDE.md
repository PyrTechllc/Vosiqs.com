# 🚀 Vosiqs Environment Setup Guide

This guide will help you set up all the necessary environment variables to get Vosiqs fully functional.

## 📋 Table of Contents

1. [Firebase Setup](#firebase-setup)
2. [Stripe Setup](#stripe-setup)
3. [YouTube API Setup](#youtube-api-setup)
4. [Google AI (Gemini) Setup](#google-ai-gemini-setup)
5. [Final Steps](#final-steps)

---

## 🔥 Firebase Setup

### Part 1: Firebase Client SDK (Frontend)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click the **gear icon** ⚙️ → **Project settings**
4. Scroll down to **"Your apps"** section
5. If you haven't added a web app yet:
   - Click **"Add app"** → Select **Web** (</> icon)
   - Register your app with a nickname (e.g., "Vosiqs Web")
6. Copy the config values and add to `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Part 2: Firebase Admin SDK (Backend)

1. In Firebase Console → **Project settings** → **Service accounts** tab
2. Click **"Generate new private key"**
3. Click **"Generate key"** - downloads a JSON file
4. **Option A - Using the helper script (Recommended):**
   ```bash
   node scripts/setup-firebase-admin.js path/to/downloaded-file.json
   ```
   Follow the prompts to automatically add credentials to `.env.local`

5. **Option B - Manual setup:**
   - Open the downloaded JSON file
   - Extract these three values:
     - `project_id` → `FIREBASE_PROJECT_ID`
     - `client_email` → `FIREBASE_CLIENT_EMAIL`
     - `private_key` → `FIREBASE_PRIVATE_KEY` (keep the quotes and \n characters)
   
   Add to `.env.local`:
   ```env
   FIREBASE_PROJECT_ID="your-project-id"
   FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com"
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour\nPrivate\nKey\nHere\n-----END PRIVATE KEY-----\n"
   ```

### Part 3: Enable Required Firebase Services

1. **Firestore Database:**
   - Go to **Firestore Database** in Firebase Console
   - Click **"Create database"**
   - Choose **"Start in production mode"** or **"Test mode"** (for development)
   - Select a location close to your users

2. **Authentication:**
   - Go to **Authentication** in Firebase Console
   - Click **"Get started"**
   - Enable your preferred sign-in methods (Email/Password, Google, etc.)

---

## 💳 Stripe Setup

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Create an account or sign in
3. Get your API keys:
   - Go to **Developers** → **API keys**
   - Copy the **Publishable key** and **Secret key**

4. Add to `.env.local`:
   ```env
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_REPLACE_WITH_YOUR_PUBLISHABLE_KEY
   STRIPE_SECRET_KEY=sk_test_REPLACE_WITH_YOUR_SECRET_KEY
   ```

5. **Set up Webhooks:**
   
   **For Local Development:**
   ```bash
   # Install Stripe CLI
   # Windows (using Scoop):
   scoop install stripe
   
   # Or download from: https://stripe.com/docs/stripe-cli
   
   # Login to Stripe
   stripe login
   
   # Forward webhooks to your local server
   stripe listen --forward-to localhost:9002/api/webhooks/stripe
   
   # Copy the webhook signing secret (starts with whsec_) and add to .env.local:
   ```
   
   **For Production:**
   - Go to **Developers** → **Webhooks**
   - Click **"Add endpoint"**
   - Enter your URL: `https://yourdomain.com/api/webhooks/stripe`
   - Select events: `checkout.session.completed`
   - Copy the **Signing secret**

   ```env
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxx
   ```

---

## 📺 YouTube API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the YouTube Data API v3:
   - Go to **APIs & Services** → **Library**
   - Search for "YouTube Data API v3"
   - Click **Enable**
4. Create credentials:
   - Go to **APIs & Services** → **Credentials**
   - Click **"Create Credentials"** → **API key**
   - Copy the API key
   - (Optional) Click **"Restrict Key"** to limit usage to YouTube Data API only

5. Add to `.env.local`:
   ```env
   YOUTUBE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   ```

---

## 🤖 Google AI (Gemini) Setup

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Get API key"** or **"Create API key"**
4. Copy the API key

5. Add to `.env.local`:
   ```env
   GOOGLE_GENAI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   ```

---

## ✅ Final Steps

### 1. Verify Your `.env.local` File

Your complete `.env.local` should look like this:

```env
# Firebase Client SDK
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_REPLACE_WITH_YOUR_PUBLISHABLE_KEY
STRIPE_SECRET_KEY=sk_test_REPLACE_WITH_YOUR_SECRET_KEY
STRIPE_WEBHOOK_SECRET=whsec_REPLACE_WITH_YOUR_WEBHOOK_SECRET

# YouTube API
YOUTUBE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Google AI
GOOGLE_GENAI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# App Settings
NEXT_PUBLIC_APP_URL=http://localhost:9002
NODE_ENV=development
```

### 2. Restart Your Development Server

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

### 3. Test Your Setup

1. **Test Firebase Auth:** Try signing up/logging in
2. **Test Firestore:** Create a playlist and save it
3. **Test YouTube API:** Search for videos
4. **Test Gemini AI:** Use AI-powered features
5. **Test Stripe:** Try the checkout flow (use test card: 4242 4242 4242 4242)

---

## 🔒 Security Notes

- ✅ `.env.local` is already in `.gitignore` - never commit it!
- ✅ Only `NEXT_PUBLIC_*` variables are exposed to the browser
- ✅ Keep your `FIREBASE_PRIVATE_KEY` and `STRIPE_SECRET_KEY` secret
- ✅ Use test keys during development
- ✅ Rotate keys if they're ever exposed

---

## 🐛 Troubleshooting

### "Firebase Admin credentials not found"
- Check that `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY` are all set
- Make sure the private key includes the full content with `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`
- Verify the `\n` characters are escaped properly (should be `\\n` in the .env file)

### "Stripe webhook signature verification failed"
- Make sure you're using the correct webhook secret
- For local development, use the secret from `stripe listen` command
- For production, use the secret from Stripe Dashboard → Webhooks

### "YouTube API quota exceeded"
- YouTube API has daily quotas
- Consider implementing caching
- Apply for quota increase if needed

### Build fails with environment variable errors
- Environment variables are only loaded at runtime, not build time (except `NEXT_PUBLIC_*`)
- The app is designed to build successfully even without credentials
- Credentials are only required when running the app

---

## 📚 Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [YouTube Data API Documentation](https://developers.google.com/youtube/v3)
- [Google AI Studio](https://ai.google.dev/)

---

**Need help?** Check the console logs for specific error messages, they usually point to which service needs configuration.
