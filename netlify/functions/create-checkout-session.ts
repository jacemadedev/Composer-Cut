import { Handler } from '@netlify/functions';
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-09-30.acacia',
});

export const handler: Handler = async (event) => {
  console.log('Starting checkout session creation...');

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    if (!event.body) {
      throw new Error('Missing request body');
    }

    const { priceId, userId, userEmail } = JSON.parse(event.body);

    if (!priceId || !userId || !userEmail) {
      throw new Error('Missing required fields');
    }

    console.log('Creating/retrieving customer for:', userEmail);

    // Create or retrieve customer
    const customers = await stripe.customers.list({
      email: userEmail,
      limit: 1,
    });
    
    let customerId: string;
    
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      console.log('Found existing customer:', customerId);
    } else {
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: {
          userId: userId
        }
      });
      customerId = customer.id;
      console.log('Created new customer:', customerId);
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.URL || 'http://localhost:5173'}/?success=true`,
      cancel_url: `${process.env.URL || 'http://localhost:5173'}/pricing?canceled=true`,
      metadata: {
        userId,
        priceId
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      customer_update: {
        address: 'auto'
      }
    });

    console.log('Created checkout session:', {
      sessionId: session.id,
      customerId,
      userId,
      priceId
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionId: session.id }),
    };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to create checkout session'
      }),
    };
  }
}; 