export interface Screenshot {
  id: string;
  file: File;
  preview: string;
  settings: VideoSettings;
}

export type VideoQuality = {
  resolution: {
    width: number;
    height: number;
  };
  fps: number;
  scalingSteps: number;
  bitrate: number;
};

export type PerspectiveType = 
  | 'rise'
  | 'push-forward'
  | 'reveal-up'
  | 'reveal-down'
  | 'rise-left'
  | 'rise-right'
  | 's-curve-left'
  | 's-curve-right'
  | 's-curve-up'
  | 's-curve-down';

export interface VideoSettings {
  duration: number;
  perspective: PerspectiveType;
  quality: string;
  format: 'webm' | 'mp4';
  zoom: number;
  tilt: number;
  xRotation: number;
  yRotation: number;
  backgroundColor: string;
  animationSpeed: number;
  animationType: 'smooth' | 'linear';
  blurEffect: {
    enabled: boolean;
    intensity: number;
    radius: number;
  };
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  videoExportsLimit: number;
  price: number;
}

export interface UserSubscription {
  id: string;
  userId: string;
  planId: string;
  status: 'active' | 'canceled' | 'past_due';
  currentPeriodEnd: string;
  videoExportsCount: number;
}