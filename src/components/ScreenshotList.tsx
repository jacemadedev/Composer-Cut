import { X, Settings } from 'lucide-react';
import { useStore } from '../store';
import { VideoSettings } from './VideoSettings';

export function ScreenshotList() {
  const { screenshots, removeScreenshot, selectedScreenshot, selectScreenshot } = useStore();

  if (screenshots.length === 0) {
    return (
      <div className="text-center py-4 text-base-content/70">
        No screenshots added yet
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {screenshots.map((screenshot) => (
          <div
            key={screenshot.id}
            className={`relative group aspect-video bg-base-200 rounded-lg overflow-hidden cursor-pointer
              ${selectedScreenshot === screenshot.id ? 'ring-2 ring-primary' : ''}`}
            onClick={() => selectScreenshot(screenshot.id)}
          >
            <img
              src={screenshot.preview}
              alt="Screenshot preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors">
              <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    selectScreenshot(screenshot.id);
                  }}
                  className="btn btn-circle btn-sm btn-primary"
                >
                  <Settings className="h-4 w-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeScreenshot(screenshot.id);
                  }}
                  className="btn btn-circle btn-sm btn-error"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedScreenshot && (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Screenshot Settings</h3>
              <button
                onClick={() => selectScreenshot(null)}
                className="btn btn-ghost btn-sm"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <VideoSettings screenshotId={selectedScreenshot} />
          </div>
        </div>
      )}
    </div>
  );
}