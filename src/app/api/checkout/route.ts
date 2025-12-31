import { stripe } from '@/lib/stripe';
import { NextResponse } from 'next/server';

const PRO_PRICE_ID = 'price_1Q...'; // Placeholder, user needs to set this or create product via API (complex).
// Actually, for MVP, we can create a product on the fly or ask user to provide Price ID.
// Better: Create product inline? No, `line_items` with `price_data`.

export async function POST(req: Request) {
    try {
        const { userId, userEmail } = await req.json();

        if (!userId) {
            return new NextResponse('Unauthorized', { status: 401 });
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
                        product_data: {
                            name: 'Vosiqs+ Pro',
                            description: 'Unlimited playlists, unlimited re-rolls, and more.',
                        },
                        unit_amount: 799,
                        recurring: {
                            interval: 'month',
                        },
                    },
                    quantity: 1,
                },
            ],
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
