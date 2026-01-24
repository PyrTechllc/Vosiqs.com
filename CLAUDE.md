# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Start development server (runs on port 9002 with Turbopack)
npm run dev

# Type checking
npm run typecheck

# Linting
npm run lint

# Build for production
npm run build

# Environment setup
npm run verify-env              # Verify all environment variables
npm run setup-firebase <path>   # Setup Firebase Admin from service account JSON
```

## Architecture Overview

### Next.js App Router Structure

This is a Next.js 16 application using the App Router pattern with TypeScript. Key routes:

- `/` - Landing page
- `/app` - Main application (playlist generation)
- `/app/library` - User's saved playlists
- `/api/checkout` - Stripe checkout session creation
- `/api/webhooks/stripe` - Stripe webhook for subscription events

Root layout (src/app/layout.tsx) wraps app with FirebaseProvider and uses dark mode by default.

### Firebase Configuration

**Critical Pattern:** Dual Firebase SDK setup (Client + Admin)

**Client SDK (src/firebase/):**
- Client-only initialization with SSR safety checks (`typeof window !== 'undefined'`)
- FirebaseProvider context wraps app, provides `useFirebase()` hook
- Configuration uses NEXT_PUBLIC_ environment variables
- Instantiated on module load in browser environment only

**Admin SDK (src/lib/firebase-admin.ts):**
- Uses service account credentials from environment variables
- **Important:** Handles `\n` replacement in FIREBASE_PRIVATE_KEY for proper formatting
- Gracefully degrades if credentials missing (logs warning, exports null)
- Used exclusively in server actions and API routes

### Authentication Flow

- Google OAuth with **YouTube scopes** (`youtube.readonly`, `youtube.force-ssl`)
- YouTube access token stored in sessionStorage for API calls
- `useUser()` hook provides `{ user, isLoading }` throughout app
- Auth implementation in src/firebase/auth/

### Server Actions Pattern

**Preferred over API routes** for data mutations. See src/app/actions.ts for examples.

Pattern:
```typescript
'use server';
export async function myAction(params) {
  // Direct database access with adminDb
  // Type-safe returns: Data | { error: string }
}
```

**Main action:** `generatePlaylistAction(prompt, youtubeToken)`
1. Validates input
2. Fetches YouTube history if token provided (liked videos, subscriptions)
3. Calls AI generation flow with context
4. Searches YouTube with refined query
5. Returns Playlist or error object

### AI Integration (Gemini)

Located in src/ai/:

- Uses `@google/generative-ai` SDK directly (not Genkit flows in production)
- Model: `gemini-1.5-flash`
- Main flow: `generatePlaylist(prompt, userContext)`
- Constructs detailed prompt including user's YouTube history for personalization
- Returns structured JSON: `{ name, description, refinedQuery }`
- Parses response with markdown code block stripping

**Context enhancement:** When YouTube token available, AI considers user's liked videos and subscriptions for personalized recommendations.

### Stripe Integration

**Checkout Flow (src/app/api/checkout/route.ts):**
- Plans: Weekly ($3.99), Monthly ($5.99 with 7-day trial)
- Creates sessions with inline `price_data` (no hardcoded Price IDs)
- Includes `userId` in metadata for webhook processing

**Webhook (src/app/api/webhooks/stripe/route.ts):**
- Listens for `checkout.session.completed`
- Updates Firestore: `users/{userId}` with `isPro: true` and `proSince`
- Validates signature with STRIPE_WEBHOOK_SECRET

### Database Structure (Firestore)

```
users/
  {userId}/
    - isPro: boolean
    - usage: { prompts: number, rerolls: number, lastReset: Timestamp }
    - proSince: Date
    playlists/ (subcollection)
      {playlistId}/
        - name, description, prompt, videos[], createdAt
```

**Key Functions (src/lib/firestore-utils.ts):**

All marked 'use server':

- `checkAndIncrementUsage(userId, type)` - Rate limiting with 7-hour reset, free tier: 10 prompts
- `savePlaylist(userId, playlist)` - Limits: 10 (free), 100 (pro)
- `getPlaylists(userId)` - Returns user's playlists ordered by createdAt desc
- `deletePlaylist(userId, playlistId)`

**Pattern:** Atomic increments with `FieldValue.increment(1)`, server timestamps

### Component Organization

- **src/components/ui/** - Radix UI primitives (shadcn/ui pattern)
- **src/components/vosiqs/** - Application-specific components

**Key Shared Components:**
- AppLayout - Wraps pages with responsive sidebar
- Header - Model selector, upgrade CTA, user menu
- Sidebar - Navigation (Home, Library, New Playlist)
- PromptForm - Main input for playlist generation
- PlaylistView - Video grid with reroll/save actions
- PricingModal - Plan selection and checkout

### Environment Variables

See env.example for complete list. Required services:
- Firebase Client SDK (NEXT_PUBLIC_FIREBASE_*)
- Firebase Admin SDK (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY)
- Stripe (STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET)
- YouTube Data API (YOUTUBE_API_KEY)
- Google Gemini (GOOGLE_GENAI_API_KEY)

Run `npm run verify-env` to validate setup.

## Key Architectural Patterns

1. **Server Actions over API routes** - Use 'use server' for mutations
2. **SSR Safety** - Firebase client initialization only in browser
3. **Graceful Degradation** - App handles missing Admin SDK (logs warnings)
4. **Type Safety** - Discriminated unions for error handling (Data | { error: string })
5. **Context for Auth** - YouTube token in sessionStorage, Firebase auth via Context
6. **Rate Limiting** - Server-side for authenticated users, client localStorage for guests
7. **Subcollections** - User playlists stored under users/{userId}/playlists
8. **Progressive Enhancement** - Works without YouTube token (falls back to API key)

## Common Patterns to Follow

**Error Handling in Server Actions:**
```typescript
try {
  // operation
  return data;
} catch (error) {
  console.error('Description:', error);
  return { error: 'User-friendly message' };
}
```

**Checking Admin SDK Availability:**
```typescript
if (!adminDb) {
  console.error('Firebase Admin not initialized');
  return { error: 'Service unavailable' };
}
```

**Using Firebase Context:**
```typescript
const { auth, db } = useFirebase();
const { user, isLoading } = useUser();
```

## YouTube Integration

- Main API calls in src/lib/youtube.ts
- Uses OAuth token when available (from auth flow), falls back to API key
- Functions: `searchYouTube()`, `getUserLikedVideos()`, `getUserSubscriptions()`
- Token stored in sessionStorage after OAuth completion
