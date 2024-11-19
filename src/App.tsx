import React from 'react';
import { Clapperboard } from 'lucide-react';
import { Dropzone } from './components/Dropzone';
import { Editor } from './components/Editor';
import { useStore } from './store';
import { Auth } from './components/Auth';
import { useAuth } from './hooks/useAuth';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Pricing } from './pages/Pricing';
import { UpgradeModal } from './components/UpgradeModal';
import { Session } from '@supabase/supabase-js';
import { Screenshot } from './types';
import { Account } from './pages/Account';
import { UserProfile } from './components/UserProfile';

interface AppContentProps {
  session: Session;
  showUpgradeModal: boolean;
  setShowUpgradeModal: React.Dispatch<React.SetStateAction<boolean>>;
  screenshots: Screenshot[];
  isGenerating: boolean;
  setIsGenerating: React.Dispatch<React.SetStateAction<boolean>>;
  videoUrl: string | null;
  setVideoUrl: React.Dispatch<React.SetStateAction<string | null>>;
  progress: string;
  setProgress: React.Dispatch<React.SetStateAction<string>>;
  error: string;
  setError: React.Dispatch<React.SetStateAction<string>>;
}

export default function App() {
  const screenshots = useStore((state) => state.screenshots);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [videoUrl, setVideoUrl] = React.useState<string | null>(null);
  const [progress, setProgress] = React.useState<string>('');
  const [error, setError] = React.useState<string>('');
  const { session, loading } = useAuth();
  const [showUpgradeModal, setShowUpgradeModal] = React.useState(false);

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
  }, []);

  if (loading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="loading loading-spinner loading-lg text-primary"></div>
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  return (
    <Router>
      <AppContent 
        session={session}
        showUpgradeModal={showUpgradeModal}
        setShowUpgradeModal={setShowUpgradeModal}
        screenshots={screenshots}
        isGenerating={isGenerating}
        setIsGenerating={setIsGenerating}
        videoUrl={videoUrl}
        setVideoUrl={setVideoUrl}
        progress={progress}
        setProgress={setProgress}
        error={error}
        setError={setError}
      />
    </Router>
  );
}

function AppContent({
  session,
  showUpgradeModal,
  setShowUpgradeModal,
  screenshots,
  isGenerating,
  setIsGenerating,
  videoUrl,
  setVideoUrl,
  progress,
  setProgress,
  error,
  setError
}: AppContentProps) {
  return (
    <Routes>
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/account" element={<Account />} />
      <Route path="/" element={
        <div className="h-screen flex flex-col overflow-hidden bg-black">
          <Header session={session} />

          <main className="flex-1 overflow-hidden">
            {screenshots.length === 0 ? (
              <Dropzone />
            ) : (
              <Editor
                isGenerating={isGenerating}
                setIsGenerating={setIsGenerating}
                videoUrl={videoUrl}
                setVideoUrl={setVideoUrl}
                progress={progress}
                setProgress={setProgress}
                error={error}
                setError={setError}
              />
            )}
          </main>

          <UpgradeModal 
            isOpen={showUpgradeModal} 
            onClose={() => setShowUpgradeModal(false)} 
          />
        </div>
      } />
    </Routes>
  );
}

interface HeaderProps {
  session: Session;
}

const Header = ({ session }: HeaderProps) => {
  return (
    <div className="flex h-14 items-center justify-between px-4 bg-black/50 backdrop-blur-lg border-b border-white/10 flex-none">
      <div className="flex items-center gap-2">
        <Clapperboard className="h-5 w-5 text-primary" />
        <span className="text-sm font-medium text-white">WondrCut</span>
      </div>
      <div className="flex items-center gap-4">
        <UserProfile user={session.user} />
      </div>
    </div>
  );
};