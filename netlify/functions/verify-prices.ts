import { Handler } from '@netlify/functions';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-09-30.acacia',
});

export const handler: Handler = async () => {
  try {
    const prices = await stripe.prices.list({
      active: true,
      limit: 10,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        prices: prices.data.map(price => ({
          id: price.id,
          active: price.active,
          type: price.type,
          recurring: price.recurring,
        })),
      }),
    };
  } catch (error) {
    console.error('Error verifying prices:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to verify prices' }),
    };
  }
}; 