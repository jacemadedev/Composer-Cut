import React from 'react';
import { VideoSettings } from './VideoSettings';
import { useStore } from '../store';
import { motion } from 'framer-motion';
import { Settings2 } from 'lucide-react';

export function Sidebar() {
  const selectedScreenshot = useStore((state) => state.selectedScreenshot);
  const screenshots = useStore((state) => state.screenshots);
  const [hasInteracted, setHasInteracted] = React.useState(false);

  // Show the hint only for the first screenshot and only if user hasn't interacted yet
  const showHint = screenshots.length > 0 && !selectedScreenshot && !hasInteracted;

  return (
    <div className="relative h-full flex flex-col">
      {/* Grid pattern */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
        }}
      />

      {/* Content */}
      <div className="relative flex-1 overflow-y-auto custom-scrollbar">
        <div className="space-y-6">
          {showHint && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-white/70 px-1 flex items-center gap-2"
            >
              <Settings2 className="h-4 w-4 text-primary animate-pulse" />
              <span>Click a screenshot to customize its animation</span>
            </motion.div>
          )}
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 gap-2"
          >
            {screenshots.map((screenshot, index) => (
              <motion.div
                key={screenshot.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`
                  relative aspect-video rounded-lg overflow-hidden cursor-pointer
                  transition-all duration-200 transform hover:scale-105 group
                  ${selectedScreenshot === screenshot.id 
                    ? 'ring-2 ring-primary shadow-lg shadow-primary/20' 
                    : 'hover:ring-2 hover:ring-white/20'
                  }
                `}
                onClick={() => {
                  useStore.getState().selectScreenshot(screenshot.id);
                  setHasInteracted(true);
                }}
              >
                <img
                  src={screenshot.preview}
                  alt="Screenshot thumbnail"
                  className="w-full h-full object-cover"
                />
                <div className={`
                  absolute inset-0 transition-colors duration-200
                  ${selectedScreenshot === screenshot.id 
                    ? 'bg-gradient-to-t from-primary/20 to-transparent' 
                    : 'bg-black/20 group-hover:bg-black/30'
                  }
                `} />
                
                {/* Click indicator */}
                {!hasInteracted && index === 0 && !selectedScreenshot && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-2 text-white text-sm font-medium">
                      <Settings2 className="h-4 w-4" />
                      <span>Click to edit</span>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
          
          {selectedScreenshot && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <VideoSettings screenshotId={selectedScreenshot} />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}