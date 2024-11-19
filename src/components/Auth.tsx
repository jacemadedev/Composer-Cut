import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { AuthHeader } from './auth/AuthHeader';
import { AuthFooter } from './auth/AuthFooter';
import { GlassmorphicCard } from './auth/GlassmorphicCard';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Mail, KeyRound, ArrowRight } from 'lucide-react';

export function Auth() {
  const [authMode, setAuthMode] = useState<'magic_link' | 'sign_in'>('magic_link');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleMagicLinkSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      
      const { error: signInError } = await supabase.auth.signInWithOtp({
        email,
      });

      if (signInError) throw signInError;
      setSuccess(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to send magic link');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;
    } catch (error) {
      if (error instanceof Error && error.message.includes('Invalid login credentials')) {
        setAuthMode('magic_link');
        setError('No password set for this account. Use magic link to sign in.');
      } else {
        setError(error instanceof Error ? error.message : 'Failed to sign in');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20" />
        <div className="absolute inset-0" 
          style={{
            backgroundImage: `
              radial-gradient(circle at 15% 50%, rgba(147, 51, 234, 0.1) 0%, transparent 25%),
              radial-gradient(circle at 85% 30%, rgba(79, 70, 229, 0.1) 0%, transparent 25%)
            `
          }}
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
          className="absolute inset-0"
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M54.627 0l.83.828-1.415 1.415L51.8 0h2.827zM5.373 0l-.83.828L5.96 2.243 8.2 0H5.374zM48.97 0l3.657 3.657-1.414 1.414L46.143 0h2.828zM11.03 0L7.372 3.657 8.787 5.07 13.857 0H11.03zm32.284 0L49.8 6.485 48.384 7.9l-7.9-7.9h2.83zM16.686 0L10.2 6.485 11.616 7.9l7.9-7.9h-2.83zM22.344 0L13.858 8.485 15.272 9.9l7.9-7.9h-.828zm5.656 0L19.515 8.485 17.343 10.657 28 0h-2.83zM32.656 0L26.172 6.485 24 8.657 34.657 0h-2zM44.97 0L40.5 4.472 36.03 0h8.94zM12.807 0L9.5 3.308 6.193 0h6.614zM48.743 0L42.5 6.243 36.257 0h12.486zM15.857 0L9.5 6.357 3.143 0h12.714zM49.5 0L42.5 7 35.5 0h14zm3.714 0L47.5 5.714 41.786 0h11.428zM53.857 0L47.5 6.357 41.143 0h12.714zM56.743 0L50.5 6.243 44.257 0h12.486zm-18.457 0l.828 1.172-1.414 1.414L36.857 0h3.258zM60 0L50.5 9.5 41 0h19zm-21.857 0l.857 1.857L37.143 0h1zm3.857 0l1.857 4.857L44 0h-2zm5.857 0l2.857 7.857L52 0h-2.286zm5.857 0l3.857 10.857L56 0h-2.286z" fill="%23FFF" fill-opacity="0.02" fill-rule="evenodd"/%3E%3C/svg%3E")'
          }}
        />
      </div>

      <AuthHeader />
      
      <GlassmorphicCard>
        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center space-y-4"
            >
              <div className="flex justify-center">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-medium text-white">Check your email</h3>
              <p className="text-gray-400">
                We've sent you a magic link to sign in to your account.
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-200 text-sm"
                >
                  {error}
                </motion.div>
              )}

              <div className="flex justify-center space-x-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setAuthMode('magic_link')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    authMode === 'magic_link' 
                      ? 'bg-primary text-white' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Magic Link
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setAuthMode('sign_in')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    authMode === 'sign_in' 
                      ? 'bg-primary text-white' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Password
                </motion.button>
              </div>

              <form onSubmit={authMode === 'magic_link' ? handleMagicLinkSignIn : handlePasswordSignIn}>
                <div className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                      required
                    />
                  </div>

                  {authMode === 'sign_in' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="relative"
                    >
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                        required
                      />
                    </motion.div>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="w-full btn btn-primary relative overflow-hidden group"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {loading ? (
                        <span className="loading loading-spinner loading-sm" />
                      ) : (
                        <>
                          {authMode === 'magic_link' ? 'Send Magic Link' : 'Sign In'}
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </span>
                  </motion.button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassmorphicCard>

      <AuthFooter />
    </div>
  );
}