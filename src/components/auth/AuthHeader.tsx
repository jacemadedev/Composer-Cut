import { motion } from 'framer-motion';
import { Clapperboard } from 'lucide-react';

export function AuthHeader() {
  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="text-center mb-8 space-y-4"
    >
      <div className="flex items-center justify-center gap-3 text-white">
        <Clapperboard className="h-8 w-8" />
        <h1 className="text-4xl font-bold">WondrCut</h1>
      </div>
      <p className="text-lg text-indigo-200 max-w-md">
        Transform your screenshots into stunning video presentations with dynamic animations
      </p>
    </motion.div>
  );
}