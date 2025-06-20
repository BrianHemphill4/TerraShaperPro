import Stripe from 'stripe';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config({ path: '../../../.env' });

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('STRIPE_SECRET_KEY is not set in environment variables. Using dummy key for development.');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy', {
  apiVersion: '2023-10-16',
  typescript: true,
});

export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';