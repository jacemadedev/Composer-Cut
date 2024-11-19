import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Clapperboard } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';
import { verifySubscription } from '../services/subscriptionService';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const plans = [
  {
    name: 'Free',
    price: 0,
    priceId: 'free',
    description: 'Try it out',
    features: [
      '3 video exports total',
      'Basic video effects',
      'HD quality exports',
      'Community support'
    ]
  },
  {
    name: 'Founder',
    price: 9,
    priceId: import.meta.env.VITE_STRIPE_FOUNDER_PRICE_ID,
    description: 'Perfect for getting started',
    features: [
      '50 video exports per month',
      'All video effects',
      'HD quality exports',
      'Email support'
    ]
  },
  {
    name: 'Pro',
    price: 29,
    priceId: import.meta.env.VITE_STRIPE_PRO_PRICE_ID,
    description: 'For power users',
    features: [
      '500 video exports per month',
      'All video effects',
      '4K quality exports',
      'Priority support',
      'Custom branding'
    ]
  }
];

const PLAN_TO_PRICE_MAP: Record<string, string> = {
  'founder': import.meta.env.VITE_STRIPE_FOUNDER_PRICE_ID,
  'pro': import.meta.env.VITE_STRIPE_PRO_PRICE_ID,
  'free': 'free'
};

// Update the features array with proper typing
const features: Array<{
  name: string;
  availability: {
    'Free': string;
    'Founder': string;
    'Pro': string;
  };
}> = [
  {
    name: 'Video Exports',
    availability: {
      'Free': '3 total',
      'Founder': '50/month',
      'Pro': '500/month'
    }
  },
  {
    name: 'Video Quality',
    availability: {
      'Free': 'HD',
      'Founder': 'HD',
      'Pro': '4K'
    }
  },
  {
    name: 'Support',
    availability: {
      'Free': 'Community',
      'Founder': 'Email',
      'Pro': 'Priority'
    }
  },
  {
    name: 'Custom Branding',
    availability: {
      'Free': '✕',
      'Founder': '✕',
      'Pro': '✓'
    }
  }
] as const;

async function verifyPriceIds() {
  try {
    const response = await fetch('/api/verify-prices', {
      method: 'GET',
    });
    const data = await response.json();
    console.log('Price verification:', data);
  } catch (error) {
    console.error('Price verification failed:', error);
  }
}

export function Pricing() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentPlanId, setCurrentPlanId] = useState<string | null>(null);

  useEffect(() => {
    verifyPriceIds();
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: sub } = await supabase
        .from('user_subscriptions')
        .select('*, subscription_plans(*)')
        .eq('user_id', session.user.id)
        .eq('status', 'active')
        .single();

      const stripePriceId = sub?.plan_id ? PLAN_TO_PRICE_MAP[sub.plan_id] : null;
      setCurrentPlanId(stripePriceId);
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const handleSubscribe = async (priceId: string) => {
    try {
      if (priceId === 'free') {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          navigate('/auth');
          return;
        }

        // Check if user already has a subscription
        const { data: existingSub } = await supabase
          .from('user_subscriptions')
          .select('*')
          .eq('user_id', session.user.id)
          .single();

        if (existingSub) {
          setError('You already have an active subscription');
          return;
        }

        // Create free subscription
        const { error: subError } = await supabase
          .from('user_subscriptions')
          .insert({
            id: `free_${session.user.id}`,
            user_id: session.user.id,
            plan_id: 'free',
            status: 'active',
            current_period_end: new Date('2099-12-31').toISOString(),
            video_exports_count: 0
          });

        if (subError) {
          console.error('Error creating free subscription:', subError);
          throw new Error('Failed to create free subscription');
        }

        // Verify subscription was created
        await verifySubscription(session.user.id);
        navigate('/');
        return;
      }

      // Existing Stripe checkout logic for paid plans
      setLoading(priceId);
      setError(null);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/auth');
        return;
      }

      console.log('Creating checkout session for:', {
        priceId,
        userId: session.user.id,
        userEmail: session.user.email,
      });

      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          userId: session.user.id,
          userEmail: session.user.email,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const { sessionId } = await response.json();
      
      if (!sessionId) {
        throw new Error('No session ID returned from server');
      }

      console.log('Redirecting to checkout with session:', sessionId);
      
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      const { error: stripeError } = await stripe.redirectToCheckout({ sessionId });
      
      if (stripeError) {
        throw new Error(stripeError.message);
      }
    } catch (error) {
      console.error('Subscription error:', error);
      setError(error instanceof Error ? error.message : 'Failed to subscribe');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="flex h-14 items-center justify-between px-4 bg-black/50 backdrop-blur-lg border-b border-white/10">
        <div className="flex items-center gap-2">
          <Clapperboard className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium text-white">WondrCut</span>
        </div>
        <button
          onClick={() => navigate('/')}
          className="btn btn-ghost btn-sm text-white"
        >
          Back to Editor
        </button>
      </div>

      {/* Pricing Content */}
      <div className="max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-8 p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200">
            {error}
          </div>
        )}
        
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-3 text-xl text-gray-300">
            Choose the plan that's right for you
          </p>
        </div>

        <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0 xl:grid-cols-3">
          {plans.map((plan) => {
            const isCurrentPlan = currentPlanId === plan.priceId;
            const isFreePlan = plan.priceId === 'free';
            
            return (
              <div
                key={plan.name}
                className={cn(
                  "relative bg-white/5 rounded-lg shadow-lg divide-y divide-gray-800",
                  isCurrentPlan && "ring-2 ring-primary",
                  plan.name === 'Pro' && "border-2 border-primary"
                )}
              >
                {isCurrentPlan && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <span className="bg-primary text-black text-xs font-bold px-3 py-1 rounded-full">
                      Current Plan
                    </span>
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                  <p className="mt-2 text-gray-300">{plan.description}</p>
                  <p className="mt-8">
                    <span className="text-4xl font-bold text-white">
                      {isFreePlan ? 'Free' : `$${plan.price}`}
                    </span>
                    {!isFreePlan && <span className="text-gray-300">/month</span>}
                  </p>
                  {isCurrentPlan ? (
                    <div className="p-6">
                      <button
                        onClick={() => navigate('/account')}
                        className="w-full btn btn-outline"
                      >
                        Manage Subscription
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleSubscribe(plan.priceId)}
                      disabled={loading === plan.priceId}
                      className={cn(
                        "mt-8 w-full btn",
                        plan.name === 'Pro' ? 'btn-primary' : 'btn-outline',
                        loading === plan.priceId && 'loading'
                      )}
                    >
                      {loading === plan.priceId ? 'Processing...' : 
                       isFreePlan ? 'Start Free' : 'Subscribe Now'}
                    </button>
                  )}
                </div>
                <div className="px-6 pt-6 pb-8">
                  <h4 className="text-sm font-medium text-white">What's included:</h4>
                  <ul className="mt-6 space-y-4">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex">
                        <Check className="flex-shrink-0 w-5 h-5 text-primary" />
                        <span className="ml-3 text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-24">
          <h3 className="text-2xl font-bold text-white text-center mb-12">
            Compare Plans
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="py-4 px-6 text-left">Feature</th>
                  {plans.map(plan => (
                    <th key={plan.name} className="py-4 px-6 text-center">
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {features.map(feature => (
                  <tr key={feature.name} className="border-b border-white/10">
                    <td className="py-4 px-6">{feature.name}</td>
                    {plans.map(plan => (
                      <td key={plan.name} className="py-4 px-6 text-center">
                        {feature.availability[plan.name as keyof typeof feature.availability]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 