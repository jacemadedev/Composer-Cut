import { useState } from 'react';
import { FastForward, Palette, Video, Settings2, Info, ChevronDown, Focus as FocusIcon } from 'lucide-react';
import { useStore } from '../store';
import { cn } from '../lib/utils';
import { MovementSelector } from './movement/MovementSelector';
import { PerspectiveType } from '../types';

interface VideoSettingsProps {
  screenshotId: string;
}

export function VideoSettings({ screenshotId }: VideoSettingsProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    movement: true,
    options: false,
    animation: false,
    background: false,
    perspective: false,
    blur: false
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const screenshot = useStore((state) =>
    state.screenshots.find((s) => s.id === screenshotId)
  );
  const updateSettings = useStore((state) => state.updateScreenshotSettings);

  if (!screenshot) return null;

  const { settings } = screenshot;
  const tiltDegrees = Math.round(settings.tilt * (180 / Math.PI));
  const xRotationDegrees = Math.round(settings.xRotation * (180 / Math.PI));
  const yRotationDegrees = Math.round(settings.yRotation * (180 / Math.PI));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const SectionHeader = ({ icon: Icon, title, section }: { icon: any, title: string, section: string }) => (
    <button 
      onClick={() => toggleSection(section)}
      className="flex items-center gap-2 w-full"
    >
      <Icon className="h-4 w-4 text-primary" />
      <h2 className="text-sm font-medium flex-1">{title}</h2>
      <ChevronDown className={cn(
        "h-4 w-4 transition-transform",
        expandedSections[section] ? "transform rotate-180" : ""
      )} />
    </button>
  );

  const handlePerspectiveChange = (value: PerspectiveType) => {
    updateSettings(screenshotId, { perspective: value });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <SectionHeader icon={Video} title="Movement Direction" section="movement" />
        {expandedSections.movement && (
          <MovementSelector
            value={settings.perspective}
            onChange={handlePerspectiveChange}
          />
        )}
      </div>

      <div className="space-y-4">
        <SectionHeader icon={FocusIcon} title="Depth of Field Blur" section="blur" />
        {expandedSections.blur && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.blurEffect.enabled}
                onChange={(e) =>
                  updateSettings(screenshotId, {
                    blurEffect: { ...settings.blurEffect, enabled: e.target.checked }
                  })
                }
                className="toggle toggle-primary toggle-sm"
              />
              <span className="text-sm">Enable blur effect</span>
            </div>

            {settings.blurEffect.enabled && (
              <>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>Blur Intensity</span>
                    <span>{Math.round(settings.blurEffect.intensity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={settings.blurEffect.intensity}
                    onChange={(e) =>
                      updateSettings(screenshotId, {
                        blurEffect: { ...settings.blurEffect, intensity: Number(e.target.value) }
                      })
                    }
                    className="range range-sm range-primary w-full"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>Focus Area Size</span>
                    <span>{Math.round((1 - settings.blurEffect.radius) * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="0.9"
                    step="0.1"
                    value={settings.blurEffect.radius}
                    onChange={(e) =>
                      updateSettings(screenshotId, {
                        blurEffect: { ...settings.blurEffect, radius: Number(e.target.value) }
                      })
                    }
                    className="range range-sm range-primary w-full"
                  />
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <SectionHeader icon={Settings2} title="Video Options" section="options" />
        {expandedSections.options && (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Duration (seconds)</span>
                <div className="tooltip tooltip-left" data-tip="Max 10 seconds per screenshot, 30 seconds total">
                  <Info className="h-4 w-4 text-base-content/40" />
                </div>
              </div>
              <input
                type="number"
                min="1"
                max="10"
                value={settings.duration}
                onChange={(e) =>
                  updateSettings(screenshotId, { duration: Number(e.target.value) })
                }
                className="input input-sm w-full bg-base-200 border-base-300"
              />
            </div>

            <div className="space-y-2">
              <span className="text-xs text-gray-400">Quality</span>
              <select
                value={settings.quality}
                onChange={(e) =>
                  updateSettings(screenshotId, {
                    quality: e.target.value as 'ultra' | 'high' | 'medium' | 'low',
                  })
                }
                className="select select-sm w-full bg-base-200 border-base-300 text-sm"
              >
                <option value="ultra">Ultra (4K/60fps)</option>
                <option value="high">High (1080p/60fps)</option>
                <option value="medium">Medium (720p/30fps)</option>
                <option value="low">Low (480p/24fps)</option>
              </select>
            </div>

            <div className="space-y-2">
              <span className="text-xs text-gray-400">Format</span>
              <select
                value={settings.format}
                onChange={(e) =>
                  updateSettings(screenshotId, {
                    format: e.target.value as 'webm' | 'mp4',
                  })
                }
                className="select select-sm w-full bg-base-200 border-base-300 text-sm"
              >
                <option value="webm">WebM (Better Quality)</option>
                <option value="mp4">MP4 (Better Compatibility)</option>
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <SectionHeader icon={FastForward} title="Animation" section="animation" />
        {expandedSections.animation && (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>Speed Multiplier</span>
                <span>{settings.animationSpeed}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={settings.animationSpeed}
                onChange={(e) =>
                  updateSettings(screenshotId, { animationSpeed: Number(e.target.value) })
                }
                className="range range-sm range-primary w-full"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>Slower</span>
                <span>Faster</span>
              </div>
            </div>
            <div className="space-y-2">
              <span className="text-xs text-gray-400">Animation Type</span>
              <select
                value={settings.animationType}
                onChange={(e) =>
                  updateSettings(screenshotId, {
                    animationType: e.target.value as 'smooth' | 'linear',
                  })
                }
                className="select select-sm w-full bg-base-200 border-base-300 text-sm"
              >
                <option value="smooth">Smooth (Eased)</option>
                <option value="linear">Linear (Constant)</option>
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <SectionHeader icon={Palette} title="Background Color" section="background" />
        {expandedSections.background && (
          <input
            type="color"
            value={settings.backgroundColor}
            onChange={(e) =>
              updateSettings(screenshotId, { backgroundColor: e.target.value })
            }
            className="w-full h-10 rounded-md cursor-pointer bg-base-200 border border-base-300"
          />
        )}
      </div>

      <div className="space-y-4">
        <SectionHeader icon={Video} title="3D Perspective" section="perspective" />
        {expandedSections.perspective && (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>Zoom Level</span>
                <span>{settings.zoom.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="1.2"
                max="5.0"
                step="0.1"
                value={settings.zoom}
                onChange={(e) =>
                  updateSettings(screenshotId, { zoom: Number(e.target.value) })
                }
                className="range range-sm range-primary w-full"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>Main Tilt</span>
                <span>{tiltDegrees}°</span>
              </div>
              <input
                type="range"
                min="-50"
                max="50"
                value={tiltDegrees}
                onChange={(e) => {
                  const degrees = Number(e.target.value);
                  const radians = degrees * (Math.PI / 180);
                  updateSettings(screenshotId, { tilt: radians });
                }}
                className="range range-sm range-primary w-full"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>X-Axis Rotation</span>
                <span>{xRotationDegrees}°</span>
              </div>
              <input
                type="range"
                min="-30"
                max="30"
                value={xRotationDegrees}
                onChange={(e) => {
                  const degrees = Number(e.target.value);
                  const radians = degrees * (Math.PI / 180);
                  updateSettings(screenshotId, { xRotation: radians });
                }}
                className="range range-sm range-primary w-full"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>Y-Axis Rotation</span>
                <span>{yRotationDegrees}°</span>
              </div>
              <input
                type="range"
                min="-30"
                max="30"
                value={yRotationDegrees}
                onChange={(e) => {
                  const degrees = Number(e.target.value);
                  const radians = degrees * (Math.PI / 180);
                  updateSettings(screenshotId, { yRotation: radians });
                }}
                className="range range-sm range-primary w-full"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}