import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(req: Request) {
    const body = await req.text();
    const signature = (await headers()).get('Stripe-Signature') as string;

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
        } else if (!userId) {
            console.error("Missing userId in session metadata");
        } else {
            console.error("Firebase Admin not initialized - cannot update user");
        }
    }

    return new NextResponse(null, { status: 200 });
}
