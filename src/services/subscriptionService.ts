import { supabase } from '../lib/supabase';

export async function checkVideoExportLimit(userId: string): Promise<boolean> {
  try {
    const { data: subscription, error } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        subscription_plans (
          video_exports_limit
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (error) {
      console.error('Subscription check error:', error);
      const { error: createError } = await supabase
        .from('user_subscriptions')
        .insert({
          id: `free_${userId}`,
          user_id: userId,
          plan_id: 'free',
          status: 'active',
          current_period_end: new Date('2099-12-31').toISOString(),
          video_exports_count: 0
        });

      if (createError) {
        console.error('Error creating free subscription:', createError);
        return false;
      }

      return true;
    }

    if (!subscription?.subscription_plans) {
      console.log('No subscription plan found');
      return false;
    }

    const limit = subscription.subscription_plans.video_exports_limit;
    const used = subscription.video_exports_count || 0;

    console.log('Export limit check:', { limit, used });
    return used < limit;
  } catch (error) {
    console.error('Error checking video export limit:', error);
    return false;
  }
}

export async function getCurrentPlan(userId: string) {
  try {
    const { data: subscription, error } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        subscription_plans (
          name,
          video_exports_limit
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (error || !subscription) {
      console.log('No subscription found:', error);
      return null;
    }

    return {
      name: subscription.subscription_plans?.name,
      exportsUsed: subscription.video_exports_count,
      exportsLimit: subscription.subscription_plans?.video_exports_limit,
      expiresAt: subscription.current_period_end,
    };
  } catch (error) {
    console.error('Error getting current plan:', error);
    return null;
  }
}

export async function incrementVideoExportCount(userId: string): Promise<void> {
  try {
    const { data: subscription, error: checkError } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        subscription_plans (
          video_exports_limit
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (checkError || !subscription?.subscription_plans) {
      throw new Error('No active subscription found');
    }

    const currentCount = subscription.video_exports_count || 0;
    const limit = subscription.subscription_plans.video_exports_limit;

    if (currentCount >= limit) {
      throw new Error('Export limit reached for your current plan');
    }

    const { error: updateError } = await supabase
      .from('user_subscriptions')
      .update({ 
        video_exports_count: currentCount + 1 
      })
      .eq('id', subscription.id)
      .eq('user_id', userId);

    if (updateError) {
      throw new Error('Failed to update export count');
    }
  } catch (error) {
    console.error('Error incrementing video export count:', error);
    throw error;
  }
}

export async function verifySubscription(userId: string): Promise<void> {
  try {
    const { data: subscription, error } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        subscription_plans (
          name,
          video_exports_limit
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    console.log('Current subscription:', {
      subscription,
      error
    });

    if (!subscription) {
      console.warn('No active subscription found for user:', userId);
    }
  } catch (error) {
    console.error('Error verifying subscription:', error);
  }
} 