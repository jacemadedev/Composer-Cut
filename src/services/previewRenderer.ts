import { VideoSettings } from '../types';

function getEasing(progress: number, type: 'smooth' | 'linear'): number {
  if (type === 'linear') return progress;
  return 0.5 - Math.cos(progress * Math.PI) / 2;
}

export function applyPerspectiveMovement(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  rawProgress: number,
  settings: VideoSettings
) {
  const progress = getEasing(rawProgress, settings.animationType);
  const animatedProgress = progress * settings.animationSpeed;
  
  ctx.transform(
    1, 0,
    Math.tan(settings.xRotation), Math.cos(settings.tilt),
    Math.tan(settings.yRotation), 0
  );
  
  const baseScale = settings.zoom;
  
  switch (settings.perspective) {
    case 'rise': {
      const scale = baseScale + (animatedProgress * 0.2);
      const moveY = -animatedProgress * 200;
      const rotation = settings.tilt + (animatedProgress * 0.15);

      ctx.rotate(rotation);
      ctx.scale(scale, scale);
      ctx.transform(1, 0, 0, 1, 0, moveY);
      break;
    }

    case 'rise-left': {
      const scale = baseScale + (animatedProgress * 0.2);
      const moveX = -animatedProgress * 150;
      const moveY = -animatedProgress * 150;
      const rotation = settings.tilt + (animatedProgress * 0.1);

      ctx.rotate(rotation);
      ctx.scale(scale, scale);
      ctx.transform(1, 0, 0, 1, moveX, moveY);
      break;
    }

    case 'rise-right': {
      const scale = baseScale + (animatedProgress * 0.2);
      const moveX = animatedProgress * 150;
      const moveY = -animatedProgress * 150;
      const rotation = settings.tilt + (animatedProgress * 0.1);

      ctx.rotate(rotation);
      ctx.scale(scale, scale);
      ctx.transform(1, 0, 0, 1, moveX, moveY);
      break;
    }

    case 'push-forward': {
      const scale = baseScale + (animatedProgress * 0.5);
      const moveZ = animatedProgress * 100;

      ctx.scale(scale + moveZ/200, scale + moveZ/200);
      ctx.transform(1, 0, 0, 1, 0, 0);
      break;
    }

    case 'reveal-up': {
      const scale = baseScale + (animatedProgress * 0.1);
      const moveY = -animatedProgress * 200;

      ctx.scale(scale, scale);
      ctx.transform(1, 0, 0, 1, 0, moveY);
      break;
    }

    case 'reveal-down': {
      const scale = baseScale + (animatedProgress * 0.1);
      const moveY = animatedProgress * 200;

      ctx.scale(scale, scale);
      ctx.transform(1, 0, 0, 1, 0, moveY);
      break;
    }
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  
  ctx.drawImage(
    img,
    -img.width / 2,
    -img.height / 2,
    img.width,
    img.height
  );
}