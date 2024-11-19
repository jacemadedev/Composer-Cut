import { create } from 'zustand';
import { Screenshot, VideoSettings } from './types';

const MAX_SCREENSHOTS = 10;
const MAX_DURATION_PER_SCREENSHOT = 10;
const MAX_TOTAL_DURATION = 30;

interface AppState {
  screenshots: Screenshot[];
  selectedScreenshot: string | null;
  addScreenshots: (files: File[]) => void;
  removeScreenshot: (id: string) => void;
  updateScreenshotSettings: (id: string, settings: Partial<VideoSettings>) => void;
  reorderScreenshots: (startIndex: number, endIndex: number) => void;
  selectScreenshot: (id: string | null) => void;
}

const defaultSettings: VideoSettings = {
  duration: 5,
  perspective: 'rise',
  quality: 'high',
  format: 'mp4',
  zoom: 3.0,
  tilt: -17 * (Math.PI / 180),
  xRotation: 17 * (Math.PI / 180),
  yRotation: 16 * (Math.PI / 180),
  backgroundColor: '#f8f9fa',
  animationSpeed: 1.0,
  animationType: 'smooth',
  blurEffect: {
    enabled: false,
    intensity: 0.5,
    radius: 0.4
  }
};

export const useStore = create<AppState>((set) => ({
  screenshots: [],
  selectedScreenshot: null,

  addScreenshots: (files) =>
    set((state) => {
      const currentTotalDuration = state.screenshots.reduce((sum, s) => sum + s.settings.duration, 0);
      const remainingDuration = MAX_TOTAL_DURATION - currentTotalDuration;
      
      if (state.screenshots.length >= MAX_SCREENSHOTS) {
        alert(`Maximum ${MAX_SCREENSHOTS} screenshots allowed`);
        return state;
      }

      const availableSlots = MAX_SCREENSHOTS - state.screenshots.length;
      const filesToAdd = files.slice(0, availableSlots);

      const newScreenshots = filesToAdd.map((file) => ({
        id: Math.random().toString(36).substring(7),
        file,
        preview: URL.createObjectURL(file),
        settings: {
          ...defaultSettings,
          duration: Math.min(defaultSettings.duration, remainingDuration)
        },
      }));

      return {
        screenshots: [...state.screenshots, ...newScreenshots],
      };
    }),

  removeScreenshot: (id) =>
    set((state) => ({
      screenshots: state.screenshots.filter((s) => s.id !== id),
      selectedScreenshot: state.selectedScreenshot === id ? null : state.selectedScreenshot,
    })),

  updateScreenshotSettings: (id, settings) =>
    set((state) => {
      if (settings.duration !== undefined) {
        const otherDurations = state.screenshots
          .filter(s => s.id !== id)
          .reduce((sum, s) => sum + s.settings.duration, 0);
        
        const maxAllowedDuration = Math.min(
          MAX_DURATION_PER_SCREENSHOT,
          MAX_TOTAL_DURATION - otherDurations
        );

        settings.duration = Math.min(settings.duration, maxAllowedDuration);
      }

      return {
        screenshots: state.screenshots.map((screenshot) =>
          screenshot.id === id
            ? {
                ...screenshot,
                settings: { ...screenshot.settings, ...settings },
              }
            : screenshot
        ),
      };
    }),

  reorderScreenshots: (startIndex, endIndex) =>
    set((state) => {
      const newScreenshots = [...state.screenshots];
      const [removed] = newScreenshots.splice(startIndex, 1);
      newScreenshots.splice(endIndex, 0, removed);
      return { screenshots: newScreenshots };
    }),

  selectScreenshot: (id) =>
    set({ selectedScreenshot: id }),
}));