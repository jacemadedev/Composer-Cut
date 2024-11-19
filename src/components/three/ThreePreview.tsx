import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { VideoSettings } from '../../types';

interface ThreePreviewProps {
  imageUrl: string;
  settings: VideoSettings;
  progress: number;
}

// Custom shader material for the blur effect
class BlurMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({
      uniforms: {
        tDiffuse: { value: null },
        uBlurIntensity: { value: 0.0 },
        uBlurRadius: { value: 0.4 },
        uResolution: { value: new THREE.Vector2(1, 1) }
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
        uniform float uBlurIntensity;
        uniform float uBlurRadius;
        uniform vec2 uResolution;
        varying vec2 vUv;

        void main() {
          vec2 center = vec2(0.5, 0.5);
          float dist = distance(vUv, center);
          float blurFactor = smoothstep(uBlurRadius * 0.5, uBlurRadius, dist);
          
          vec2 pixel = vec2(1.0) / uResolution;
          float blur = blurFactor * uBlurIntensity;
          
          vec4 sum = vec4(0.0);
          int samples = 9;
          float offset = blur * 4.0;
          
          for(int x = -9; x <= 9; x++) {
            for(int y = -9; y <= 9; y++) {
              vec2 coord = vUv + vec2(float(x), float(y)) * pixel * offset;
              sum += texture2D(tDiffuse, coord);
            }
          }
          
          sum /= float((9 * 2 + 1) * (9 * 2 + 1));
          vec4 original = texture2D(tDiffuse, vUv);
          gl_FragColor = mix(original, sum, blurFactor);
        }
      `
    });
  }
}

function Scene({ imageUrl, settings, progress }: ThreePreviewProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useTexture(imageUrl);
  const { viewport } = useThree();

  // Create blur material
  const blurMaterial = useMemo(() => {
    const material = new BlurMaterial();
    material.uniforms.tDiffuse.value = texture;
    return material;
  }, [texture]);

  // Update material uniforms
  React.useEffect(() => {
    if (blurMaterial && settings.blurEffect.enabled) {
      blurMaterial.uniforms.uBlurIntensity.value = settings.blurEffect.intensity;
      blurMaterial.uniforms.uBlurRadius.value = settings.blurEffect.radius;
      blurMaterial.uniforms.uResolution.value.set(
        texture.image?.width || 1024,
        texture.image?.height || 1024
      );
    }
  }, [blurMaterial, settings.blurEffect, texture]);

  // Configure texture settings
  React.useEffect(() => {
    if (texture) {
      texture.encoding = THREE.sRGBEncoding;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.needsUpdate = true;
    }
  }, [texture]);

  useFrame(() => {
    if (!meshRef.current) return;

    const mesh = meshRef.current;
    const animatedProgress = progress * settings.animationSpeed;

    // Reset transformations
    mesh.position.set(0, 0, 0);
    mesh.rotation.set(0, 0, 0);
    mesh.scale.setScalar(settings.zoom);

    // Apply base perspective transformations
    mesh.rotation.x = settings.xRotation;
    mesh.rotation.y = settings.yRotation;
    mesh.rotation.z = settings.tilt;

    // Apply animation transformations based on perspective type
    switch (settings.perspective) {
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
  });

  const aspect = texture.image ? texture.image.width / texture.image.height : 1;
  const width = Math.min(viewport.width * 0.8, viewport.height * 0.8 * aspect);
  const height = width / aspect;

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[width, height]} />
      {settings.blurEffect.enabled ? (
        <primitive object={blurMaterial} attach="material" />
      ) : (
        <meshBasicMaterial 
          map={texture} 
          transparent={true}
          toneMapped={false}
          encoding={THREE.sRGBEncoding}
        />
      )}
    </mesh>
  );
}

export function ThreePreview({ imageUrl, settings, progress }: ThreePreviewProps) {
  return (
    <div 
      className="w-full h-full absolute inset-0"
      style={{ backgroundColor: settings.backgroundColor }}
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        className="w-full h-full"
        gl={{
          antialias: true,
          alpha: true,
          preserveDrawingBuffer: true,
          outputEncoding: THREE.sRGBEncoding,
        }}
      >
        <color attach="background" args={[settings.backgroundColor]} />
        <Scene imageUrl={imageUrl} settings={settings} progress={progress} />
      </Canvas>
    </div>
  );
}