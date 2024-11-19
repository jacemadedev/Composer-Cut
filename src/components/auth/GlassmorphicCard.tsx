import React from 'react';
import { motion } from 'framer-motion';

interface GlassmorphicCardProps {
  children: React.ReactNode;
}

export function GlassmorphicCard({ children }: GlassmorphicCardProps) {
  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
      className="w-full max-w-md"
    >
      <div className="relative">
        {/* Glassmorphic effect */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-xl rounded-2xl" />
        
        {/* Subtle border glow */}
        <div 
          className="absolute inset-0 rounded-2xl opacity-50"
          style={{
            padding: '1px',
            background: 'linear-gradient(145deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
            boxShadow: '0 0 20px rgba(147, 51, 234, 0.15)',
          }}
        >
          <div className="absolute inset-0 rounded-2xl bg-black/60 backdrop-blur-xl" />
        </div>

        {/* Content */}
        <div className="relative p-8 rounded-2xl space-y-6">
          {children}
        </div>
      </div>
    </motion.div>
  );
}