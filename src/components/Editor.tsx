import { Download, Loader2, RefreshCw, Upload, Settings2 } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { Preview } from './Preview';
import { generateVideo } from '../services/videoGenerator';
import { useStore } from '../store';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { cn } from '../lib/utils';
import { useState, useEffect } from 'react';
import { UpgradeModal } from './UpgradeModal';
import { supabase } from '../lib/supabase';
import { getCurrentPlan } from '../services/subscriptionService';

interface EditorProps {
  isGenerating: boolean;
  setIsGenerating: (value: boolean) => void;
  videoUrl: string | null;
  setVideoUrl: (url: string | null) => void;
  progress: string;
  setProgress: (value: string) => void;
  error: string;
  setError: (value: string) => void;
}

export function Editor({
  isGenerating,
  setIsGenerating,
  videoUrl,
  setVideoUrl,
  progress,
  setProgress,
  error,
  setError,
}: EditorProps) {
  const screenshots = useStore((state) => state.screenshots);
  const addScreenshots = useStore((state) => state.addScreenshots);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [exportProgress, setExportProgress] = useState<{
    current: number;
    total: number;
    remaining: number;
  } | null>(null);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => {
      addScreenshots(acceptedFiles);
    },
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
    },
  });

  useEffect(() => {
    async function checkExportLimit() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const plan = await getCurrentPlan(session.user.id);
      if (plan) {
        setExportProgress({
          current: plan.exportsUsed,
          total: plan.exportsLimit,
          remaining: plan.exportsLimit - plan.exportsUsed
        });
      }
    }

    checkExportLimit();
  }, []);

  const handleGenerate = async () => {
    try {
      setError('');
      setIsGenerating(true);
      setProgress('Preparing screenshots...');
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      setProgress('Generating video frames...');
      const videoBlob = await generateVideo(screenshots, (status) => {
        setProgress(status);
      }, () => setShowUpgradeModal(true));
      
      setProgress('Finalizing video...');
      const url = URL.createObjectURL(videoBlob);
      setVideoUrl(url);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsGenerating(false);
      setProgress('');
    }
  };

  const handleDownload = () => {
    if (videoUrl) {
      const a = document.createElement('a');
      a.href = videoUrl;
      a.download = `wondrcut-video.${screenshots[0].settings.format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleReset = () => {
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
      setVideoUrl(null);
    }
  };

  return (
    <div className="h-screen grid grid-cols-[340px,1fr] bg-black">
      {/* God rays effect */}
      <div className="jumbo absolute top-0 right-0 w-full h-96 opacity-50" />
      
      {/* Sidebar with fixed header and footer */}
      <div className="relative flex flex-col border-r border-white/10 bg-black/40 backdrop-blur-xl h-screen">
        {/* Fixed Header */}
        <div className="p-4 border-b border-white/10">
          <div {...getRootProps()}>
            <input {...getInputProps()} />
            <button className={cn(
              "w-full btn btn-primary gap-2 relative overflow-hidden group",
              "bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700",
              "border-0 shadow-lg hover:shadow-xl transition-all duration-200"
            )}>
              <Upload className="h-4 w-4" />
              Add More Screenshots
              <div className="absolute inset-0 bg-white/10 group-hover:bg-transparent transition-colors" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/40 to-black/0 pointer-events-none" />
              <Sidebar />
            </div>
          </div>
        </div>

        {/* Fixed Footer - Always visible */}
        {exportProgress && (
          <div className="p-4 bg-black/80 backdrop-blur-lg border-t border-white/10 sticky bottom-0 left-0 w-full">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Exports Remaining</span>
              <span className="text-primary font-medium">{exportProgress.remaining}</span>
            </div>
            <div className="mt-2 w-full bg-white/10 rounded-full h-1">
              <div 
                className="bg-primary h-full rounded-full transition-all duration-300"
                style={{ 
                  width: `${((exportProgress.total - exportProgress.current) / exportProgress.total) * 100}%` 
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Main content area */}
      <div className="relative flex flex-col h-screen">
        <div className="flex-1 p-6 pb-24">
          <div className="h-full rounded-2xl overflow-hidden border border-white/10">
            <Preview videoUrl={videoUrl} />
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="fixed bottom-6 right-6 flex gap-3 z-10">
          {videoUrl ? (
            <>
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={handleReset}
                className="relative group overflow-hidden px-6 h-12 rounded-xl flex items-center gap-2 transition-all"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-indigo-600 group-hover:from-indigo-600 group-hover:to-indigo-700 transition-colors" />
                <div className="absolute inset-0 opacity-50">
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/20 to-white/10" />
                </div>
                <div className="relative flex items-center gap-2 text-white">
                  <RefreshCw className="h-4 w-4" />
                  <span>Back to Preview</span>
                </div>
              </motion.button>
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={handleDownload}
                className="relative group overflow-hidden px-6 h-12 rounded-xl flex items-center gap-2 transition-all"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-indigo-600 group-hover:from-indigo-600 group-hover:to-indigo-700 transition-colors" />
                <div className="absolute inset-0 opacity-50">
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/20 to-white/10" />
                </div>
                <div className="relative flex items-center gap-2 text-white">
                  <Download className="h-4 w-4" />
                  <span>Download Video</span>
                </div>
              </motion.button>
            </>
          ) : (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={handleGenerate}
              disabled={isGenerating}
              className="relative group overflow-hidden px-8 h-12 rounded-xl flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-indigo-600 group-hover:from-indigo-600 group-hover:to-indigo-700 transition-colors" />
              <div className="absolute inset-0 opacity-50">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/10 to-white/5" />
              </div>
              <div className="relative flex items-center gap-2 text-white">
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Settings2 className="h-4 w-4" />
                    <span>Generate Video</span>
                  </>
                )}
              </div>
            </motion.button>
          )}
        </div>
      </div>

      {/* Loading Modal */}
      <input
        type="checkbox"
        id="loading-modal"
        className="modal-toggle"
        checked={isGenerating}
        readOnly
      />
      <div className="modal">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="modal-box relative bg-black/90 border border-white/10 backdrop-blur-xl"
        >
          <h3 className="font-bold text-lg mb-4 text-white">
            {error ? 'Error' : 'Generating Video'}
          </h3>
          <div className="flex flex-col items-center gap-4">
            {error ? (
              <>
                <div className="text-red-400">{error}</div>
                <button 
                  className="btn btn-primary"
                  onClick={() => setError('')}
                >
                  Close
                </button>
              </>
            ) : (
              <>
                <div className="relative">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-indigo-500/20 to-transparent rounded-full" />
                </div>
                <p className="text-center text-white">{progress}</p>
              </>
            )}
          </div>
        </motion.div>
      </div>
      <UpgradeModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)} 
      />
    </div>
  );
}