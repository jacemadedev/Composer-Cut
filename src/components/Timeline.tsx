import { Play, SkipBack, SkipForward } from 'lucide-react';
import { useStore } from '../store';

export function Timeline() {
  const screenshots = useStore((state) => state.screenshots);
  const selectedScreenshot = useStore((state) => state.selectedScreenshot);
  const currentIndex = screenshots.findIndex(s => s.id === selectedScreenshot);

  const handlePrevious = () => {
    const newIndex = Math.max(0, currentIndex - 1);
    useStore.getState().selectScreenshot(screenshots[newIndex].id);
  };

  const handleNext = () => {
    const newIndex = Math.min(screenshots.length - 1, currentIndex + 1);
    useStore.getState().selectScreenshot(screenshots[newIndex].id);
  };

  return (
    <div className="bg-[#25262b] rounded-lg p-4">
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={handlePrevious}
          disabled={currentIndex <= 0}
          className="btn btn-circle btn-sm"
        >
          <SkipBack className="h-4 w-4" />
        </button>
        <button className="btn btn-circle btn-primary btn-sm">
          <Play className="h-4 w-4" />
        </button>
        <button
          onClick={handleNext}
          disabled={currentIndex >= screenshots.length - 1}
          className="btn btn-circle btn-sm"
        >
          <SkipForward className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-4 relative">
        <div className="h-2 bg-[#2c2d31] rounded-full">
          <div
            className="absolute h-full bg-primary rounded-full"
            style={{
              width: `${((currentIndex + 1) / screenshots.length) * 100}%`,
              transition: 'width 0.3s ease-in-out',
            }}
          />
        </div>
        <div className="mt-2 flex justify-between text-xs text-gray-400">
          <span>0:00</span>
          <span>{screenshots[0]?.settings.duration}s</span>
        </div>
      </div>
    </div>
  );
}