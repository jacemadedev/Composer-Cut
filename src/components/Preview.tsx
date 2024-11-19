import { useEffect, useRef, useState } from 'react';
import { useStore } from '../store';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { ThreePreview } from './three/ThreePreview';

interface PreviewProps {
  videoUrl: string | null;
}

export function Preview({ videoUrl }: PreviewProps) {
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const animationFrameRef = useRef<number>();
  const startTimeRef = useRef<number>();
  
  const screenshots = useStore((state) => state.screenshots);
  const selectedScreenshot = useStore((state) => state.selectedScreenshot);
  const currentScreenshot = screenshots.find(s => s.id === selectedScreenshot) || screenshots[0];

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      startTimeRef.current = undefined;
    }
  };

  const resetAnimation = () => {
    setProgress(0);
    startTimeRef.current = undefined;
    if (!isPlaying) {
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    if (!currentScreenshot || videoUrl || !isPlaying) return;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const duration = currentScreenshot.settings.duration * 1000;
      setProgress((elapsed % duration) / duration);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [currentScreenshot, videoUrl, isPlaying]);

  if (!currentScreenshot) return null;

  return (
    <div className="flex-1 bg-black/40 backdrop-blur-xl rounded-lg border border-white/10 flex flex-col h-full">
      <div className="flex-1 relative">
        {videoUrl ? (
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <video
              src={videoUrl}
              controls
              className="max-w-full max-h-full rounded-lg"
            />
          </div>
        ) : (
          <div className="absolute inset-0">
            <ThreePreview
              imageUrl={currentScreenshot.preview}
              settings={currentScreenshot.settings}
              progress={progress}
            />
          </div>
        )}
      </div>
      
      {!videoUrl && (
        <div className="flex-none p-4 border-t border-white/10">
          <div className="max-w-sm mx-auto space-y-2">
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={resetAnimation}
                className="btn btn-circle btn-sm btn-ghost"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <button
                onClick={togglePlayback}
                className="btn btn-circle btn-sm btn-primary"
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-100"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
              <span className="text-xs text-white/70">
                {Math.round(progress * currentScreenshot.settings.duration * 10) / 10}s
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}