import { Screenshot, VideoQuality } from '../types';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { Pass } from 'three/examples/jsm/postprocessing/Pass.js';
import { checkVideoExportLimit, incrementVideoExportCount } from '../services/subscriptionService';
import { supabase } from '../lib/supabase';

const QUALITY_PRESETS: Record<string, VideoQuality> = {
  ultra: {
    resolution: { width: 3840, height: 2160 },
    fps: 60,
    scalingSteps: 1,
    bitrate: 1.0,
  },
  high: {
    resolution: { width: 2560, height: 1440 },
    fps: 60,
    scalingSteps: 1,
    bitrate: 0.8,
  },
  medium: {
    resolution: { width: 1920, height: 1080 },
    fps: 30,
    scalingSteps: 1,
    bitrate: 0.6,
  },
  low: {
    resolution: { width: 1280, height: 720 },
    fps: 24,
    scalingSteps: 1,
    bitrate: 0.4,
  },
};

// Optimized blur shader
const BlurShader = {
  uniforms: {
    tDiffuse: { value: null },
    resolution: { value: new THREE.Vector2() },
    blurRadius: { value: 0 },
    blurIntensity: { value: 0 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform vec2 resolution;
    uniform float blurRadius;
    uniform float blurIntensity;
    varying vec2 vUv;

    float gaussian(float x, float sigma) {
      return exp(-(x * x) / (2.0 * sigma * sigma));
    }

    void main() {
      vec2 center = vec2(0.5);
      float dist = distance(vUv, center);
      float blurFactor = smoothstep(blurRadius * 0.5, blurRadius, dist) * blurIntensity;
      
      if (blurFactor < 0.01) {
        gl_FragColor = texture2D(tDiffuse, vUv);
        return;
      }

      vec4 color = vec4(0.0);
      float total = 0.0;
      
      float sigma = blurFactor * 4.0;
      int samples = int(sigma * 2.0);
      samples = min(samples, 12); // Limit samples for performance
      
      vec2 pixelSize = 1.0 / resolution;
      
      for (int x = -12; x <= 12; x++) {
        if (x > samples || x < -samples) continue;
        for (int y = -12; y <= 12; y++) {
          if (y > samples || y < -samples) continue;
          
          vec2 offset = vec2(float(x), float(y)) * pixelSize;
          float weight = gaussian(length(offset) / blurFactor, 1.0);
          color += texture2D(tDiffuse, vUv + offset) * weight;
          total += weight;
        }
      }
      
      gl_FragColor = color / total;
    }
  `
};

let renderer: THREE.WebGLRenderer | null = null;
let composer: EffectComposer | null = null;
let scene: THREE.Scene | null = null;
let camera: THREE.PerspectiveCamera | null = null;

function initThreeJS(width: number, height: number) {
  if (!renderer) {
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      preserveDrawingBuffer: true,
    });
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.setSize(width, height);
    renderer.setPixelRatio(1);
  }

  if (!scene) {
    scene = new THREE.Scene();
  }

  if (!camera) {
    camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(0, 0, 5);
  }

  if (!composer && renderer) {
    composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);
  }

  return { renderer, composer, scene, camera };
}

function cleanupThreeJS() {
  if (composer) {
    composer.passes.forEach((pass: Pass) => {
      if (pass.dispose) pass.dispose();
    });
    composer = null;
  }
  
  if (renderer) {
    renderer.dispose();
    renderer = null;
  }
  scene = null;
  camera = null;
}

function getEasing(progress: number, type: 'smooth' | 'linear'): number {
  if (type === 'linear') return progress;
  return progress < 0.5
    ? 2 * progress * progress
    : -1 + (4 - 2 * progress) * progress;
}

function getVideoBitrate(quality: VideoQuality): number {
  const baseRate = 8000000; // 8 Mbps base rate
  return Math.floor(baseRate * quality.bitrate);
}

async function renderFrame(
  screenshot: Screenshot,
  rawProgress: number,
  quality: VideoQuality
): Promise<ImageData> {
  const { renderer, composer, scene, camera } = initThreeJS(
    quality.resolution.width,
    quality.resolution.height
  );

  if (!renderer || !composer || !scene || !camera) {
    throw new Error('Failed to initialize Three.js');
  }

  scene.background = new THREE.Color(screenshot.settings.backgroundColor);

  // Create and load texture
  const texture = await new Promise<THREE.Texture>((resolve, reject) => {
    const loader = new THREE.TextureLoader();
    loader.load(
      screenshot.preview,
      (texture) => {
        texture.encoding = THREE.sRGBEncoding;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.needsUpdate = true;
        resolve(texture);
      },
      undefined,
      reject
    );
  });

  // Calculate dimensions
  const aspect = texture.image.width / texture.image.height;
  const viewportHeight = Math.tan(THREE.MathUtils.degToRad(75 / 2)) * camera.position.z * 2;
  const viewportWidth = viewportHeight * (quality.resolution.width / quality.resolution.height);
  const width = Math.min(viewportWidth * 0.8, viewportHeight * 0.8 * aspect);
  const height = width / aspect;

  const geometry = new THREE.PlaneGeometry(width, height);
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    toneMapped: false,
  });

  // Set encoding after material creation
  (material as any).colorSpace = THREE.SRGBColorSpace;

  const mesh = new THREE.Mesh(geometry, material);

  // Reset transformations
  mesh.position.set(0, 0, 0);
  mesh.rotation.set(0, 0, 0);
  mesh.scale.setScalar(screenshot.settings.zoom);

  // Apply base perspective transformations
  mesh.rotation.x = screenshot.settings.xRotation;
  mesh.rotation.y = screenshot.settings.yRotation;
  mesh.rotation.z = screenshot.settings.tilt;

  const progress = getEasing(rawProgress, screenshot.settings.animationType);
  const animatedProgress = progress * screenshot.settings.animationSpeed;

  // Apply animation transformations
  switch (screenshot.settings.perspective) {
    case 'rise': {
      mesh.position.y = -2 + animatedProgress * 4;
      mesh.rotation.x += animatedProgress * 0.15;
      mesh.scale.multiplyScalar(1 + animatedProgress * 0.2);
      break;
    }
    case 'push-forward': {
      mesh.position.z = -2 + animatedProgress * 4;
      mesh.scale.multiplyScalar(1 + animatedProgress * 0.5);
      break;
    }
    case 'rise-left': {
      mesh.position.x = 2 - animatedProgress * 4;
      mesh.position.y = -1 + animatedProgress * 2;
      mesh.rotation.y -= animatedProgress * 0.15;
      mesh.scale.multiplyScalar(1 + animatedProgress * 0.2);
      break;
    }
    case 'rise-right': {
      mesh.position.x = -2 + animatedProgress * 4;
      mesh.position.y = -1 + animatedProgress * 2;
      mesh.rotation.y += animatedProgress * 0.15;
      mesh.scale.multiplyScalar(1 + animatedProgress * 0.2);
      break;
    }
    case 'reveal-up': {
      mesh.position.y = -2 + animatedProgress * 4;
      mesh.scale.multiplyScalar(1 + animatedProgress * 0.1);
      break;
    }
    case 'reveal-down': {
      mesh.position.y = 2 - animatedProgress * 4;
      mesh.scale.multiplyScalar(1 + animatedProgress * 0.1);
      break;
    }
    case 's-curve-left': {
      const t = animatedProgress;
      mesh.position.x = 2 - t * 4;
      mesh.position.y = Math.sin(t * Math.PI * 2) * 0.5;
      mesh.rotation.z = Math.sin(t * Math.PI) * 0.2;
      mesh.scale.multiplyScalar(1 + Math.sin(t * Math.PI) * 0.2);
      break;
    }
    case 's-curve-right': {
      const t = animatedProgress;
      mesh.position.x = -2 + t * 4;
      mesh.position.y = Math.sin(t * Math.PI * 2) * 0.5;
      mesh.rotation.z = -Math.sin(t * Math.PI) * 0.2;
      mesh.scale.multiplyScalar(1 + Math.sin(t * Math.PI) * 0.2);
      break;
    }
    case 's-curve-up': {
      const t = animatedProgress;
      mesh.position.y = -2 + t * 4;
      mesh.position.x = Math.sin(t * Math.PI * 2) * 0.5;
      mesh.rotation.z = Math.cos(t * Math.PI) * 0.2;
      mesh.scale.multiplyScalar(1 + Math.sin(t * Math.PI) * 0.2);
      break;
    }
    case 's-curve-down': {
      const t = animatedProgress;
      mesh.position.y = 2 - t * 4;
      mesh.position.x = Math.sin(t * Math.PI * 2) * 0.5;
      mesh.rotation.z = -Math.cos(t * Math.PI) * 0.2;
      mesh.scale.multiplyScalar(1 + Math.sin(t * Math.PI) * 0.2);
      break;
    }
  }

  scene.add(mesh);

  // Apply blur effect if enabled
  if (screenshot.settings.blurEffect.enabled) {
    const blurPass = new ShaderPass(BlurShader);
    blurPass.uniforms.resolution.value.set(quality.resolution.width, quality.resolution.height);
    blurPass.uniforms.blurRadius.value = screenshot.settings.blurEffect.radius;
    blurPass.uniforms.blurIntensity.value = screenshot.settings.blurEffect.intensity;
    composer.addPass(blurPass);
  }

  composer.render();

  // Get frame data
  const gl = renderer.getContext();
  const pixels = new Uint8Array(quality.resolution.width * quality.resolution.height * 4);
  gl.readPixels(0, 0, quality.resolution.width, quality.resolution.height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

  // Flip pixels vertically
  const flippedPixels = new Uint8Array(pixels.length);
  const rowSize = quality.resolution.width * 4;
  for (let y = 0; y < quality.resolution.height; y++) {
    const srcRow = (quality.resolution.height - y - 1) * rowSize;
    const dstRow = y * rowSize;
    for (let x = 0; x < rowSize; x++) {
      flippedPixels[dstRow + x] = pixels[srcRow + x];
    }
  }

  // Cleanup
  scene.remove(mesh);
  geometry.dispose();
  material.dispose();
  texture.dispose();

  if (screenshot.settings.blurEffect.enabled) {
    composer.passes.pop(); // Remove blur pass
  }

  return new ImageData(
    new Uint8ClampedArray(flippedPixels),
    quality.resolution.width,
    quality.resolution.height
  );
}

async function framesToVideo(
  frames: ImageData[],
  screenshots: Screenshot[],
  quality: VideoQuality
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = quality.resolution.width;
  canvas.height = quality.resolution.height;
  
  const ctx = canvas.getContext('2d', {
    alpha: false,
    desynchronized: true,
  });

  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  const stream = canvas.captureStream(quality.fps);

  // Find supported video format
  const supportedTypes = [
    'video/mp4;codecs=h264',
    'video/mp4;codecs=avc1.42E01E',
    'video/mp4;codecs=avc1.4D401E',
    'video/mp4;codecs=avc1.64001E',
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm',
    'video/mp4'
  ];

  const mimeType = supportedTypes.find(type => MediaRecorder.isTypeSupported(type)) || 'video/mp4';

  if (!mimeType) {
    throw new Error('No supported video format found');
  }

  const mediaRecorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: getVideoBitrate(quality)
  });

  const chunks: Blob[] = [];
  mediaRecorder.ondataavailable = (e) => chunks.push(e.data);

  return new Promise((resolve, reject) => {
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: mimeType });
      resolve(blob);
    };

    mediaRecorder.onerror = (event: Event) => {
      const error = (event as any).error;
      reject(error);
    };
    
    mediaRecorder.start();

    let frameIndex = 0;
    const startTime = performance.now();
    const totalDuration = screenshots.reduce((sum, s) => sum + s.settings.duration * 1000, 0);

    function renderNextFrame() {
      const currentTime = performance.now() - startTime;
      
      if (currentTime >= totalDuration) {
        mediaRecorder.stop();
        return;
      }

      if (frameIndex < frames.length) {
        ctx!.putImageData(frames[frameIndex], 0, 0);
        frameIndex = Math.min(
          Math.floor((currentTime / totalDuration) * frames.length),
          frames.length - 1
        );
      }

      requestAnimationFrame(renderNextFrame);
    }

    renderNextFrame();
  });
}

export async function generateVideo(
  screenshots: Screenshot[],
  onProgress?: (status: string) => void,
  _onUpgradeRequired?: () => void
): Promise<Blob> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      throw new Error('Authentication required');
    }

    // Check subscription limit before generating
    const canExport = await checkVideoExportLimit(session.user.id);
    if (!canExport) {
      throw new Error('Video export limit reached for your current plan');
    }

    if (!screenshots?.length) {
      throw new Error('Please add at least one screenshot');
    }

    const quality = QUALITY_PRESETS[screenshots[0].settings.quality];
    const totalDuration = screenshots.reduce((sum, s) => sum + s.settings.duration, 0);
    const totalFrames = Math.ceil(totalDuration * quality.fps);
    
    if (totalFrames <= 0) {
      throw new Error('Invalid video duration');
    }

    const frames: ImageData[] = [];
    const BATCH_SIZE = 10;
    
    let currentFrame = 0;
    for (const screenshot of screenshots) {
      const screenshotFrames = Math.ceil(screenshot.settings.duration * quality.fps);
      
      for (let i = 0; i < screenshotFrames; i += BATCH_SIZE) {
        const batchEnd = Math.min(i + BATCH_SIZE, screenshotFrames);
        onProgress?.(`Processing frames ${currentFrame + i + 1} to ${currentFrame + batchEnd} of ${totalFrames}...`);
        
        const batchPromises = [];
        for (let j = i; j < batchEnd; j++) {
          const progress = j / (screenshotFrames - 1);
          batchPromises.push(renderFrame(screenshot, progress, quality));
        }
        
        const batchFrames = await Promise.all(batchPromises);
        frames.push(...batchFrames);
        
        // Allow UI updates
        await new Promise(resolve => setTimeout(resolve, 0));
      }
      
      currentFrame += screenshotFrames;
    }
    
    // Final cleanup
    cleanupThreeJS();
    
    onProgress?.('Encoding video...');
    const videoBlob = await framesToVideo(frames, screenshots, quality);

    // Increment export count after successful generation
    await incrementVideoExportCount(session.user.id);
    
    return videoBlob;
  } catch (error) {
    console.error('Video generation error:', error);
    throw new Error(error instanceof Error ? error.message : 'Video generation failed');
  }
}