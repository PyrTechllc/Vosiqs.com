import { stripe } from '@/lib/stripe';
import { NextResponse } from 'next/server';

const PRO_PRICE_ID = 'price_1Q...'; // Placeholder, user needs to set this or create product via API (complex).
// Actually, for MVP, we can create a product on the fly or ask user to provide Price ID.
// Better: Create product inline? No, `line_items` with `price_data`.

export async function POST(req: Request) {
    try {
        const { userId, userEmail, plan = 'monthly' } = await req.json();

        if (!userId) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        let priceData;
        let subscriptionData = {};

        if (plan === 'weekly') {
            priceData = {
                unit_amount: 399, // $3.99
                recurring: { interval: 'week' },
                product_data: {
                    name: 'Vosiqs+ Pro (Weekly)',
                    description: 'Unlimited playlists, downloads, and no ads. Billed weekly.',
                }
            };
        } else {
            // Default to Monthly
            priceData = {
                unit_amount: 599, // $5.99
                recurring: { interval: 'month' },
                product_data: {
                    name: 'Vosiqs+ Pro (Monthly)',
                    description: 'Unlimited playlists, downloads, and no ads. Billed monthly.',
                }
            };
            // Add 7-day trial for monthly plan
            subscriptionData = {
                trial_period_days: 7,
            };
        }

        const checkoutSession = await stripe.checkout.sessions.create({
            success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/app?success=true`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/app?canceled=true`,
            payment_method_types: ['card'],
            mode: 'subscription',
            billing_address_collection: 'auto',
            customer_email: userEmail,
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: priceData.product_data,
                        unit_amount: priceData.unit_amount,
                        recurring: priceData.recurring as any,
                    },
                    quantity: 1,
                },
            ],
            subscription_data: Object.keys(subscriptionData).length > 0 ? subscriptionData : undefined,
            metadata: {
                userId,
            },
        });

        return NextResponse.json({ url: checkoutSession.url });
    } catch (error) {
        console.error('Stripe Checkout Error:', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
