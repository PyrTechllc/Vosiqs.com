import { stripe } from '@/lib/stripe';
import { adminDb } from '@/lib/firebase-admin';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { userId } = await req.json();

        if (!userId) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        if (!adminDb) {
            return new NextResponse('Server configuration error', { status: 500 });
        }

        // Look up the user's Stripe customer ID from Firestore
        const userDoc = await adminDb.collection('users').doc(userId).get();
        const userData = userDoc.data();
        const stripeCustomerId = userData?.stripeCustomerId;

        if (!stripeCustomerId) {
            return NextResponse.json(
                { error: 'No active subscription found.' },
                { status: 404 }
            );
        }

        // Create a Stripe Billing Portal session
        const portalSession = await stripe.billingPortal.sessions.create({
            customer: stripeCustomerId,
            return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002'}/app`,
        });

        return NextResponse.json({ url: portalSession.url });
    } catch (error) {
        console.error('Billing Portal Error:', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
