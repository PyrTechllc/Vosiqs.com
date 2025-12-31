# 🎯 Vosiqs Setup Checklist

Use this checklist to track your environment setup progress.

## 🔥 Firebase Setup

### Client SDK (Frontend)
- [ ] Created/Selected Firebase project
- [ ] Added web app to Firebase project
- [ ] Copied `NEXT_PUBLIC_FIREBASE_API_KEY`
- [ ] Copied `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- [ ] Copied `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- [ ] Copied `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- [ ] Copied `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- [ ] Copied `NEXT_PUBLIC_FIREBASE_APP_ID`
- [ ] Copied `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`

### Admin SDK (Backend)
- [ ] Downloaded service account JSON file
- [ ] Ran helper script OR manually extracted credentials
- [ ] Added `FIREBASE_PROJECT_ID` to .env.local
- [ ] Added `FIREBASE_CLIENT_EMAIL` to .env.local
- [ ] Added `FIREBASE_PRIVATE_KEY` to .env.local

### Firebase Services
- [ ] Enabled Firestore Database
- [ ] Enabled Authentication
- [ ] Configured Authentication sign-in methods
- [ ] Set up Firestore security rules (if needed)

## 💳 Stripe Setup
- [ ] Created Stripe account
- [ ] Copied `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- [ ] Copied `STRIPE_SECRET_KEY`
- [ ] Set up webhook endpoint (local or production)
- [ ] Copied `STRIPE_WEBHOOK_SECRET`
- [ ] Tested with test card (4242 4242 4242 4242)

## 📺 YouTube API Setup
- [ ] Created/Selected Google Cloud project
- [ ] Enabled YouTube Data API v3
- [ ] Created API key
- [ ] (Optional) Restricted API key
- [ ] Added `YOUTUBE_API_KEY` to .env.local

## 🤖 Google AI (Gemini) Setup
- [ ] Visited Google AI Studio
- [ ] Created API key
- [ ] Added `GOOGLE_GENAI_API_KEY` to .env.local

## ✅ Final Verification
- [ ] All environment variables added to `.env.local`
- [ ] Restarted development server
- [ ] Tested Firebase Authentication
- [ ] Tested Firestore (save/load data)
- [ ] Tested YouTube search
- [ ] Tested AI features
- [ ] Tested Stripe checkout
- [ ] No console errors related to missing credentials

## 📝 Notes

Write any issues or observations here:

---

**Last Updated:** _________________

**Status:** 
- [ ] Setup in progress
- [ ] Setup complete
- [ ] Ready for production
