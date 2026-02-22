import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { adminDb } from '@/lib/firebase-admin';
import Stripe from 'stripe';

export async function POST(req: Request) {
    const body = await req.text();
    const signature = (await headers()).get('Stripe-Signature') as string;

    let event: Stripe.Event;

    try {
        if (!process.env.STRIPE_WEBHOOK_SECRET) {
            console.error('Missing STRIPE_WEBHOOK_SECRET');
            return new NextResponse('Webhook Error: System Configuration', { status: 500 });
        }

        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (error: any) {
        console.error('Webhook signature verification failed:', error.message);
        return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
    }

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                const userId = session.metadata?.userId;
                const customerId = session.customer as string;

                if (userId && adminDb) {
                    await adminDb.collection('users').doc(userId).set({
                        isPro: true,
                        stripeCustomerId: customerId,
                        proSince: new Date(),
                    }, { merge: true });
                    console.log(`User ${userId} upgraded to Pro`);
                } else if (!userId) {
                    console.error('Missing userId in session metadata');
                } else {
                    console.error('Firebase Admin not initialized');
                }
                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription;
                const customerId = subscription.customer as string;

                if (adminDb) {
                    // Find user by stripeCustomerId
                    const usersSnapshot = await adminDb
                        .collection('users')
                        .where('stripeCustomerId', '==', customerId)
                        .limit(1)
                        .get();

                    if (!usersSnapshot.empty) {
                        const userDoc = usersSnapshot.docs[0];
                        await userDoc.ref.update({
                            isPro: false,
                            proCanceledAt: new Date(),
                        });
                        console.log(`User ${userDoc.id} downgraded (subscription canceled)`);
                    }
                }
                break;
            }

            case 'customer.subscription.updated': {
                const subscription = event.data.object as Stripe.Subscription;
                const customerId = subscription.customer as string;
                const status = subscription.status;

                if (adminDb && (status === 'past_due' || status === 'unpaid')) {
                    const usersSnapshot = await adminDb
                        .collection('users')
                        .where('stripeCustomerId', '==', customerId)
                        .limit(1)
                        .get();

                    if (!usersSnapshot.empty) {
                        const userDoc = usersSnapshot.docs[0];
                        await userDoc.ref.update({ isPro: false });
                        console.log(`User ${userDoc.id} downgraded (status: ${status})`);
                    }
                }
                break;
            }

            case 'invoice.payment_failed': {
                const invoice = event.data.object as Stripe.Invoice;
                console.error(`Payment failed for customer ${invoice.customer}`, {
                    invoiceId: invoice.id,
                    amount: invoice.amount_due,
                });
                break;
            }

            default:
                // Unhandled event type — no action needed
                break;
        }
    } catch (error: any) {
        console.error(`Error processing webhook event ${event.type}:`, error);
        return new NextResponse('Webhook handler error', { status: 500 });
    }

    return new NextResponse(null, { status: 200 });
}
