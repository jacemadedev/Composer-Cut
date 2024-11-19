import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface FeatureHighlightProps {
  Icon: LucideIcon;
  title: string;
  description: string;
}

export function FeatureHighlight({ Icon, title, description }: FeatureHighlightProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="p-4 rounded-xl bg-white/5 backdrop-blur-sm"
    >
      <Icon className="h-6 w-6 text-indigo-300 mb-2" />
      <h3 className="text-white font-medium">{title}</h3>
      <p className="text-sm text-indigo-200">{description}</p>
    </motion.div>
  );
}