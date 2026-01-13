# Stripe Production Setup Guide

To move Vosiqs.com from Test Mode to Live Mode and enable the $5.99/mo and $59.99/yr plans, follow these steps:

## 1. Activate Your Stripe Account
1.  Log in to your [Stripe Dashboard](https://dashboard.stripe.com/).
2.  Click **"Activate payments"** if you haven't already.
3.  Fill in your business details and bank account information to enable live payouts.

## 2. Get Live API Keys
1.  Turn off the **"Test mode"** toggle in the top right corner.
2.  Go to **Developers** > **API keys**.
3.  Copy the **Publishable key** (`pk_live_...`).
4.  Copy the **Secret key** (`sk_live_...`).

## 3. Configuration
Update your environment variables.
- **If running locally**: Update `.env.local`.
- **If deployed (Vercel)**: Go to Settings > Environment Variables.

| Variable Name | Value |
| :--- | :--- |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Your **Live** Publishable Key (`pk_live_...`) |
| `STRIPE_SECRET_KEY` | Your **Live** Secret Key (`sk_live_...`) |

## 4. Configure Webhooks (Critical for upgrading users!)
1.  In Stripe Dashboard (Live Mode), go to **Developers** > **Webhooks**.
2.  Click **"Add endpoint"**.
3.  **Endpoint URL**: `https://vosiqs.com/api/webhooks/stripe`
    *   *Note: If testing locally, use Stripe CLI to forward events.*
4.  **Select events**: Search for and select **`checkout.session.completed`**.
5.  Click **"Add endpoint"**.
6.  Reveal the **Signing secret** (`whsec_...`) for this new endpoint.
7.  Add this to your environment variables:

| Variable Name | Value |
| :--- | :--- |
| `STRIPE_WEBHOOK_SECRET` | Your **Live** Webhook Signing Secret (`whsec_...`) |

## 5. Verify Products
Since we are using "inline prices" in the code (creating prices on the fly), you **do not** need to create Products manually in the Stripe Dashboard. The app will automatically tell Stripe to charge $5.99 or $59.99.
- Ensure your Stripe account default currency is **USD**.

## 6. Deployment
Once your environment variables are updated in Vercel, redeploy your application to apply the changes.
