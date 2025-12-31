import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Admin SDK
// Note: This requires GOOGLE_APPLICATION_CREDENTIALS or similar setup in environment.
// For the user, we will assume they configure it.
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
    : undefined;

if (!getApps().length && serviceAccount) {
    try {
        initializeApp({
            credential: cert(serviceAccount)
        });
    } catch (e) {
        console.error("Firebase Admin Init Error", e);
    }
} else if (!getApps().length) {
    // Fallback if no service key (dev mode warning)
    console.warn("Firebase Admin Service Account not found. Webhooks won't update DB.");
}

const adminDb = getApps().length ? getFirestore() : null;

export async function POST(req: Request) {
    const body = await req.text();
    const signature = headers().get('Stripe-Signature') as string;

    let event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (error: any) {
        return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
    }

    const session = event.data.object as any;

    if (event.type === 'checkout.session.completed') {
        const userId = session.metadata?.userId;
        if (userId && adminDb) {
            // Upgrade user
            await adminDb.collection('users').doc(userId).update({
                isPro: true,
                'usage.prompts': 0, // Reset usage? Or just ignore usage check. client checks isPro.
                proSince: new Date()
            });
        } else {
            console.error("Missing userId or Admin DB not initialized");
        }
    }

    return new NextResponse(null, { status: 200 });
}
