import { Handler } from '@netlify/functions';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Check for required environment variables
const requiredEnvVars = [
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'SUPABASE_SERVICE_ROLE_KEY',
  'VITE_SUPABASE_URL'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

// Create Stripe instance
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-09-30.acacia',
});

// Create Supabase client with service role key
const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Note: not VITE_ prefix
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    }
  }
);

// Log environment variables (excluding sensitive values)
console.log('Environment variables check:', {
  hasStripeKey: !!process.env.STRIPE_SECRET_KEY,
  hasWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
  hasSupabaseUrl: !!process.env.VITE_SUPABASE_URL,
  hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
});

// Add this mapping at the top of the file
const STRIPE_PRICE_TO_PLAN_MAP: Record<string, string> = {
  'price_1QEuCnHMs7qfi0lLWJ0MnmKO': 'founder',
  'price_1QEuEYHMs7qfi0lLdzybnbJW': 'pro'
};

export const handler: Handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const sig = event.headers['stripe-signature'];
    if (!sig) {
      return { 
        statusCode: 400, 
        body: JSON.stringify({ error: 'Missing stripe-signature header' })
      };
    }

    // Log the raw body and signature for debugging
    console.log('Webhook raw body:', event.body);
    console.log('Stripe signature:', sig);

    let stripeEvent: Stripe.Event;
    
    try {
      stripeEvent = stripe.webhooks.constructEvent(
        event.body!,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return {
        statusCode: 400,
        body: JSON.stringify({ error: `Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}` })
      };
    }

    // Rest of your webhook handler code...
    console.log('Webhook verified successfully:', stripeEvent.type);

    switch (stripeEvent.type) {
      case 'checkout.session.completed': {
        const session = stripeEvent.data.object as Stripe.Checkout.Session;
        const customerId = session.customer as string;
        const userId = session.metadata?.userId;
        const stripePriceId = session.metadata?.priceId;

        console.log('Checkout session completed:', {
          customerId,
          userId,
          stripePriceId
        });

        if (!userId || !stripePriceId) {
          throw new Error('Missing userId or priceId in session metadata');
        }

        // Map Stripe price ID to internal plan ID
        const planId = STRIPE_PRICE_TO_PLAN_MAP[stripePriceId];
        if (!planId) {
          throw new Error(`Unknown Stripe price ID: ${stripePriceId}`);
        }

        console.log('Mapped price to plan:', { stripePriceId, planId });

        // Get subscription details from Stripe
        const subscriptions = await stripe.subscriptions.list({
          customer: customerId,
          limit: 1,
          expand: ['data.items.data.price']
        });

        if (!subscriptions.data[0]) {
          throw new Error('No subscription found for customer');
        }

        const subscription = subscriptions.data[0];
        const currentPeriodEnd = new Date(subscription.current_period_end * 1000);

        // Cancel any existing active subscriptions
        const { data: existingSubs } = await supabase
          .from('user_subscriptions')
          .select('*')
          .eq('user_id', userId)
          .eq('status', 'active');

        if (existingSubs?.length) {
          console.log('Canceling existing subscriptions:', existingSubs);
          await Promise.all(existingSubs.map(async (sub) => {
            const { error } = await supabase
              .from('user_subscriptions')
              .update({ status: 'canceled' })
              .eq('id', sub.id);

            if (error) {
              console.error('Error canceling subscription:', error);
            }
          }));
        }

        // Create new subscription with internal plan ID
        const { error: upsertError } = await supabase
          .from('user_subscriptions')
          .upsert({
            id: subscription.id,
            user_id: userId,
            plan_id: planId, // Use our internal plan ID
            status: subscription.status,
            current_period_end: currentPeriodEnd.toISOString(),
            video_exports_count: 0,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscription.id
          });

        if (upsertError) {
          console.error('Error creating subscription:', upsertError);
          throw new Error(`Failed to create subscription: ${upsertError.message}`);
        }

        console.log('Successfully created subscription:', {
          userId,
          planId,
          subscriptionId: subscription.id
        });
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = stripeEvent.data.object as Stripe.Subscription;
        
        const { error: updateError } = await supabase
          .from('user_subscriptions')
          .update({
            status: subscription.status,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id);

        if (updateError) {
          console.error('Supabase update error:', updateError);
          throw new Error(`Failed to update subscription: ${updateError.message}`);
        }

        console.log('Successfully updated subscription:', subscription.id);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = stripeEvent.data.object as Stripe.Subscription;
        
        const { error: updateError } = await supabase
          .from('user_subscriptions')
          .update({
            status: 'canceled',
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id);

        if (updateError) {
          console.error('Supabase update error:', updateError);
          throw new Error(`Failed to update subscription: ${updateError.message}`);
        }

        console.log('Successfully canceled subscription:', subscription.id);
        break;
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ received: true })
    };
  } catch (error) {
    console.error('Webhook error:', error);
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
}; 