# 🎵 Vosiqs

A modern web application for creating and managing AI-powered music playlists with YouTube integration.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

**Option A - Using the Helper Script (Recommended):**

1. Download your Firebase service account JSON file (see [SETUP_GUIDE.md](./SETUP_GUIDE.md))
2. Run the setup script:
   ```bash
   npm run setup-firebase path/to/your-service-account.json
   ```
3. Follow the prompts to add credentials to `.env.local`

**Option B - Manual Setup:**

1. Copy the example file:
   ```bash
   cp env.example .env.local
   ```
2. Fill in all the values in `.env.local` (see [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed instructions)

### 3. Verify Your Setup

```bash
npm run verify-env
```

This will check that all required environment variables are properly configured.

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:9002](http://localhost:9002) in your browser.

## 📚 Documentation

- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Complete setup instructions for all services
- **[SETUP_CHECKLIST.md](./SETUP_CHECKLIST.md)** - Track your setup progress
- **[env.example](./env.example)** - Template for environment variables

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run verify-env` - Verify environment variables
- `npm run setup-firebase` - Helper script for Firebase Admin setup
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

## 🔑 Required Services

- **Firebase** - Authentication, Firestore database
- **Stripe** - Payment processing
- **YouTube Data API** - Video search and metadata
- **Google AI (Gemini)** - AI-powered features

See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed setup instructions for each service.

## 🏗️ Tech Stack

- **Framework:** Next.js 16 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI
- **Database:** Firebase Firestore
- **Authentication:** Firebase Auth
- **Payments:** Stripe
- **AI:** Google Gemini

## 📁 Project Structure

```
src/
├── app/              # Next.js app router pages
├── components/       # React components
├── firebase/         # Firebase client configuration
├── lib/              # Utility functions and configurations
├── ai/               # AI-related code (Gemini integration)
└── hooks/            # Custom React hooks
```

## 🔒 Security

- Never commit `.env.local` to version control
- Keep your API keys and secrets secure
- Use environment variables for all sensitive data
- The `.gitignore` file is already configured to exclude sensitive files

## 🐛 Troubleshooting

If you encounter issues:

1. Run `npm run verify-env` to check your environment variables
2. Check the console for specific error messages
3. Refer to [SETUP_GUIDE.md](./SETUP_GUIDE.md) for service-specific troubleshooting
4. Make sure all required services are enabled in their respective consoles

## 📝 License

Private project - All rights reserved

