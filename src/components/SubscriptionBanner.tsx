import { Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';

interface PlanInfo {
  name: string;
  exportsUsed: number;
  exportsLimit: number;
  expiresAt: string;
}

interface SubscriptionBannerProps {
  planInfo: PlanInfo | null;
}

export function SubscriptionBanner({ planInfo }: SubscriptionBannerProps) {
  const navigate = useNavigate();
  
  if (!planInfo) return null;
  
  const isNearLimit = planInfo.exportsUsed >= planInfo.exportsLimit * 0.8;
  
  return (
    <div className={cn(
      "px-4 py-2 text-sm flex items-center justify-between",
      isNearLimit ? "bg-yellow-500/10 text-yellow-200" : "bg-primary/10 text-primary"
    )}>
      <div className="flex items-center gap-2">
        <Crown className="w-4 h-4" />
        <span>
          {isNearLimit 
            ? `You've used ${planInfo.exportsUsed} of ${planInfo.exportsLimit} exports this month`
            : `${planInfo.name} Plan - ${planInfo.exportsLimit - planInfo.exportsUsed} exports remaining`}
        </span>
      </div>
      {isNearLimit && (
        <button
          onClick={() => navigate('/pricing')}
          className="text-xs font-medium hover:underline"
        >
          Upgrade Plan
        </button>
      )}
    </div>
  );
} 