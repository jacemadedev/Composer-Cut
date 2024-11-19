import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clapperboard } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getCurrentPlan } from '../services/subscriptionService';
import { cn } from '../lib/utils';

interface PlanInfo {
  name: string;
  exportsUsed: number;
  exportsLimit: number;
  expiresAt: string;
}

// Add missing component types
interface SubscriptionOverviewProps {
  planInfo: PlanInfo | null;
}

interface UsageStatsProps {
  planInfo: PlanInfo | null;
}

interface SubscriptionActionsProps {
  planInfo: PlanInfo | null;
  onUpgrade: () => void;
  onCancel: () => void;
  cancelLoading: boolean;
}

// Add the missing components
function SubscriptionOverview({ planInfo }: SubscriptionOverviewProps) {
  if (!planInfo) return null;
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-white">Current Plan</h3>
      <div className="bg-white/5 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-white">{planInfo.name}</p>
            <p className="text-sm text-gray-400">
              Renews {new Date(planInfo.expiresAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function UsageStats({ planInfo }: UsageStatsProps) {
  if (!planInfo) return null;
  
  const usagePercentage = (planInfo.exportsUsed / planInfo.exportsLimit) * 100;
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-white">Usage</h3>
      <div className="bg-white/5 rounded-lg p-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Exports Used</span>
            <span className="text-white">{planInfo.exportsUsed} / {planInfo.exportsLimit}</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div
              className="bg-primary rounded-full h-2 transition-all"
              style={{ width: `${usagePercentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function SubscriptionActions({ planInfo, onUpgrade, onCancel, cancelLoading }: SubscriptionActionsProps) {
  if (!planInfo) return null;
  
  return (
    <div className="space-y-4">
      <button onClick={onUpgrade} className="btn btn-primary w-full">
        Upgrade Plan
      </button>
      {planInfo.name !== 'Free' && (
        <button
          onClick={onCancel}
          disabled={cancelLoading}
          className="btn btn-outline btn-error w-full"
        >
          {cancelLoading ? 'Canceling...' : 'Cancel Subscription'}
        </button>
      )}
    </div>
  );
}

// Add a ProfileSettings component for the General tab
function ProfileSettings() {
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({
        data: { full_name: fullName }
      });
      if (error) throw error;
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-white">Profile Settings</h3>
      <div className="space-y-4">
        <div>
          <label className="text-sm text-gray-400">Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="mt-1 input input-bordered w-full"
            placeholder="Enter your name"
          />
        </div>
        <button 
          onClick={handleUpdateProfile}
          disabled={loading}
          className="btn btn-primary"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}

// Add a BillingHistory component
function BillingHistory() {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-white">Billing History</h3>
      <div className="text-sm text-gray-400">
        No billing history available.
      </div>
    </div>
  );
}

export function Account() {
  const navigate = useNavigate();
  const [planInfo, setPlanInfo] = useState<PlanInfo | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('General');

  const loadPlanInfo = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate('/auth');
        return;
      }

      const plan = await getCurrentPlan(session.user.id);
      setPlanInfo(plan);
    } catch (error) {
      console.error('Error loading plan info:', error);
    }
  }, [navigate]);

  useEffect(() => {
    loadPlanInfo();
  }, [loadPlanInfo]);

  const handleCancelSubscription = async () => {
    try {
      setCancelLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch('/api/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: session.user.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to cancel subscription');
      }

      // Refresh plan info
      await loadPlanInfo();
    } catch (error) {
      console.error('Error canceling subscription:', error);
    } finally {
      setCancelLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
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

      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white/5 rounded-lg shadow-lg">
          <div className="border-b border-white/10">
            <nav className="flex gap-4 px-6">
              {['General', 'Subscription', 'Billing History'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "py-4 px-2 text-sm font-medium border-b-2 transition-colors",
                    activeTab === tab
                      ? "border-primary text-primary"
                      : "border-transparent text-gray-400 hover:text-white"
                  )}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'General' && <ProfileSettings />}
            {activeTab === 'Subscription' && (
              <div className="space-y-6">
                <SubscriptionOverview planInfo={planInfo} />
                <UsageStats planInfo={planInfo} />
                <SubscriptionActions 
                  planInfo={planInfo}
                  onUpgrade={() => navigate('/pricing')}
                  onCancel={handleCancelSubscription}
                  cancelLoading={cancelLoading}
                />
              </div>
            )}
            {activeTab === 'Billing History' && <BillingHistory />}
          </div>
        </div>
      </div>
    </div>
  );
} 