import { useNavigate } from 'react-router-dom';
import { Rocket } from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-base-200 rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex flex-col items-center text-center">
          <div className="bg-primary/10 p-3 rounded-full">
            <Rocket className="h-6 w-6 text-primary" />
          </div>
          <h3 className="mt-4 text-xl font-bold text-white">Upgrade Required</h3>
          <p className="mt-2 text-gray-400">
            To export videos, you'll need to choose a subscription plan. Unlock unlimited access to all features today!
          </p>
          <div className="mt-6 flex gap-3 w-full">
            <button
              onClick={() => {
                onClose();
                navigate('/pricing');
              }}
              className="btn btn-primary flex-1"
            >
              View Plans
            </button>
            <button onClick={onClose} className="btn btn-ghost flex-1">
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 