import { Handler } from '@netlify/functions';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-09-30.acacia',
});

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { userId } = JSON.parse(event.body || '{}');
    if (!userId) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing userId' }) };
    }

    // Get active subscription from Supabase
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('stripe_subscription_id')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (!subscription?.stripe_subscription_id) {
      return { statusCode: 404, body: JSON.stringify({ error: 'No active subscription found' }) };
    }

    // Cancel subscription in Stripe
    await stripe.subscriptions.cancel(subscription.stripe_subscription_id);

    // Update subscription status in Supabase
    await supabase
      .from('user_subscriptions')
      .update({ status: 'canceled' })
      .eq('stripe_subscription_id', subscription.stripe_subscription_id);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Subscription canceled successfully' })
    };
  } catch (error) {
    console.error('Error canceling subscription:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to cancel subscription' })
    };
  }
}; 