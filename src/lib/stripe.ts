import Stripe from 'stripe';

const stripeSecret = process.env.STRIPE_SECRET_KEY || 'sk_test_mock_fallback_key';

export const stripe = new Stripe(stripeSecret, {
  apiVersion: '2025-02-24.acacia',
  appInfo: {
    name: 'Back Stage App',
    version: '0.1.0'
  }
});
