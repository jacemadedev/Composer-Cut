import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Info, Image as ImageIcon, Film, Sparkles } from 'lucide-react';
import { useStore } from '../store';
import { motion } from 'framer-motion';

const FeatureCard = ({ icon: Icon, title, description }: { 
  icon: typeof Upload, 
  title: string, 
  description: string 
}) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    className="p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10"
  >
    <Icon className="h-6 w-6 text-indigo-300 mb-3" />
    <h3 className="font-medium text-white mb-1">{title}</h3>
    <p className="text-sm text-indigo-200">{description}</p>
  </motion.div>
);

export function Dropzone() {
  const screenshots = useStore((state) => state.screenshots);
  const addScreenshots = useStore((state) => state.addScreenshots);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      addScreenshots(acceptedFiles);
    },
    [addScreenshots]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
    },
  });

  const totalDuration = screenshots.reduce((sum, s) => sum + s.settings.duration, 0);

  return (
    <div className="relative min-h-[calc(100vh-3.5rem)]">
      {/* Dark gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900 to-black" />

      {/* Grid pattern */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Animated glowing orbs */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-[600px] h-[600px] rounded-full"
            style={{
              background: `
                radial-gradient(circle at center,
                  ${i % 2 === 0 ? 'rgba(147, 51, 234, 0.15)' : 'rgba(79, 70, 229, 0.15)'} 0%,
                  transparent 70%
                )
              `,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [
                Math.random() * 100 - 50,
                Math.random() * 100 - 50,
                Math.random() * 100 - 50,
              ],
              y: [
                Math.random() * 100 - 50,
                Math.random() * 100 - 50,
                Math.random() * 100 - 50,
              ],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 20 + Math.random() * 10,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* Subtle noise texture */}
      <div 
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          transform: 'scale(1.5)',
        }}
      />

      {/* Vignette effect */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at center, transparent 0%, rgba(0, 0, 0, 0.3) 100%)',
        }}
      />

      {/* Content */}
      <div className="relative max-w-6xl mx-auto space-y-12 p-8">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl font-bold text-white">
            Transform Screenshots into Videos
          </h1>
          <p className="text-xl text-indigo-200 max-w-2xl mx-auto">
            Create stunning video presentations with dynamic animations and professional transitions
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <FeatureCard
            icon={ImageIcon}
            title="Multiple Screenshots"
            description="Upload up to 10 high-quality screenshots"
          />
          <FeatureCard
            icon={Film}
            title="Dynamic Animations"
            description="Choose from various professional transitions"
          />
          <FeatureCard
            icon={Sparkles}
            title="Instant Export"
            description="Download your video in seconds"
          />
        </motion.div>

        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div
            {...getRootProps()}
            className={`
              relative overflow-hidden rounded-2xl border-2 border-dashed transition-all
              ${isDragActive 
                ? 'border-primary bg-primary/5' 
                : 'border-white/20 hover:border-primary'
              }
            `}
          >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-xl" />
            
            <div className="relative p-12">
              <input {...getInputProps()} />
              <div className="flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-medium text-white">
                    {isDragActive ? 'Drop your screenshots here...' : 'Upload Screenshots'}
                  </h3>
                  <p className="text-indigo-200">
                    Drag & drop screenshots here, or click to select files
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-start gap-3 text-sm text-indigo-200 bg-black/40 backdrop-blur-xl p-4 rounded-lg border border-white/10">
            <Info className="h-5 w-5 flex-shrink-0" />
            <div className="space-y-1">
              <p>Maximum 10 screenshots allowed</p>
              <p>Maximum 10 seconds per screenshot</p>
              <p>Maximum 30 seconds total duration (currently using {totalDuration}s)</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}