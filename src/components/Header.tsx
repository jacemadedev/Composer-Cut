import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Crown } from 'lucide-react';

export function Header() {
  const [planName, setPlanName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkSubscription() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;

        const { data: subscription } = await supabase
          .from('user_subscriptions')
          .select('*, subscription_plans(name)')
          .eq('user_id', session.user.id)
          .eq('status', 'active')
          .single();

        if (subscription?.subscription_plans) {
          setPlanName(subscription.subscription_plans.name);
        }
      } catch (error) {
        console.error('Error checking subscription:', error);
      } finally {
        setLoading(false);
      }
    }

    checkSubscription();
  }, []);

  return (
    <header className="border-b border-base-300">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Your existing header content */}
        
        {!loading && planName && (
          <div className="flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-full">
            <Crown className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">{planName} Plan</span>
          </div>
        )}
      </div>
    </header>
  );
} 