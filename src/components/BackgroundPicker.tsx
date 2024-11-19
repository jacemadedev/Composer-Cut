import { useState } from 'react';
import { cn } from '../lib/utils';

interface BackgroundPickerProps {
  value: string;
  onChange: (value: string) => void;
}

const SOLID_COLORS = [
  '#000000', '#1A1A1A', '#333333', '#666666', '#999999', '#CCCCCC', '#E6E6E6', '#FFFFFF',
  '#F5F5F5', '#E0E0E0', '#BDBDBD', '#9E9E9E', '#757575', '#424242', '#212121',
  '#FF0000', '#FF4D00', '#66B3FF', '#99CCFF', '#0066FF', '#0033CC', '#00FFFF', '#0099FF',
  '#3300FF', '#000066', '#660099', '#CC00CC', '#FF00FF', '#FF00CC', '#9933FF', '#6600FF',
  '#66FFCC', '#33FF99', '#99FF99', '#CCFFCC', '#00FF00', '#33CC33', '#006600', '#003300',
  '#FFFF99', '#FFFFCC', '#FFFF00', '#FFCC00', '#FF9900', '#FF6600', '#CC3300', '#990000'
];

const GRADIENTS = [
  'linear-gradient(45deg, #000000, #434343)',
  'linear-gradient(45deg, #12c2e9, #c471ed, #f64f59)',
  'linear-gradient(45deg, #8E2DE2, #4A00E0)',
  'linear-gradient(45deg, #00c6ff, #0072ff)',
  'linear-gradient(45deg, #ee0979, #ff6a00)',
  'linear-gradient(45deg, #834d9b, #d04ed6)',
  'linear-gradient(45deg, #4facfe, #00f2fe)',
  'linear-gradient(45deg, #43e97b, #38f9d7)',
  'linear-gradient(45deg, #fa709a, #fee140)',
  'linear-gradient(45deg, #667eea, #764ba2)',
  'linear-gradient(45deg, #f77062, #fe5196)',
  'linear-gradient(45deg, #c471f5, #fa71cd)',
  'linear-gradient(45deg, #48c6ef, #6f86d6)',
  'linear-gradient(45deg, #0ba360, #3cba92)',
  'linear-gradient(45deg, #ff758c, #ff7eb3)',
  'linear-gradient(45deg, #2af598, #009efd)'
];

export function BackgroundPicker({ value, onChange }: BackgroundPickerProps) {
  const [activeTab, setActiveTab] = useState<'solid' | 'gradient' | 'wallpaper' | 'gif' | 'image'>('solid');

  return (
    <div className="space-y-4">
      <div className="tabs tabs-boxed bg-base-200">
        <button
          className={cn('tab tab-sm', activeTab === 'solid' && 'tab-active')}
          onClick={() => setActiveTab('solid')}
        >
          Solid
        </button>
        <button
          className={cn('tab tab-sm', activeTab === 'gradient' && 'tab-active')}
          onClick={() => setActiveTab('gradient')}
        >
          Gradient
        </button>
        <button
          className={cn('tab tab-sm', activeTab === 'wallpaper' && 'tab-active')}
          onClick={() => setActiveTab('wallpaper')}
        >
          Wallpaper
        </button>
        <button
          className={cn('tab tab-sm', activeTab === 'gif' && 'tab-active')}
          onClick={() => setActiveTab('gif')}
        >
          GIF
        </button>
        <button
          className={cn('tab tab-sm', activeTab === 'image' && 'tab-active')}
          onClick={() => setActiveTab('image')}
        >
          Image
        </button>
      </div>

      {activeTab === 'solid' && (
        <div className="grid grid-cols-8 gap-1">
          {SOLID_COLORS.map((color) => (
            <button
              key={color}
              className={cn(
                'w-full aspect-square rounded-md transition-transform hover:scale-110',
                value === color && 'ring-2 ring-primary ring-offset-2 ring-offset-base-100'
              )}
              style={{ backgroundColor: color }}
              onClick={() => onChange(color)}
            />
          ))}
        </div>
      )}

      {activeTab === 'gradient' && (
        <div className="grid grid-cols-4 gap-2">
          {GRADIENTS.map((gradient) => (
            <button
              key={gradient}
              className={cn(
                'w-full aspect-square rounded-md transition-transform hover:scale-110',
                value === gradient && 'ring-2 ring-primary ring-offset-2 ring-offset-base-100'
              )}
              style={{ background: gradient }}
              onClick={() => onChange(gradient)}
            />
          ))}
        </div>
      )}

      {(activeTab === 'wallpaper' || activeTab === 'gif' || activeTab === 'image') && (
        <div className="text-center py-4 text-base-content/60">
          Coming soon...
        </div>
      )}
    </div>
  );
}