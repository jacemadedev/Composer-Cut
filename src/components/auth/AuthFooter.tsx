import { motion } from 'framer-motion';

export function AuthFooter() {
  return (
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.4 }}
      className="mt-8 text-sm text-indigo-200 text-center"
    >
      By signing in, you agree to our Terms of Service and Privacy Policy
    </motion.p>
  );
}