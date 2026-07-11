import React, { useState, useEffect } from 'react';
import { useApp } from '../AppContext';
import { TrendingUp, Mail, User, Shield, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { MotionGraphics } from './MotionGraphics';

interface AuthProps {
  type: 'signin' | 'register';
}

export const AuthPages: React.FC<AuthProps> = ({ type }) => {
  const { registerUser, loginUser, loginWithGoogleUser, isLoading, setActiveView } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please provide a valid email address.');
      return;
    }

    if (type === 'register' && !name) {
      setError('Please enter your name.');
      return;
    }

    if (type === 'register') {
      registerUser(name, email);
    } else {
      loginUser(email);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    try {
      // Reconstruct callback based on current origin
      const redirectUri = `${window.location.origin}/auth/callback`;
      const response = await fetch(`/api/auth/google/url?redirectUri=${encodeURIComponent(redirectUri)}`);
      if (!response.ok) {
        throw new Error('Failed to contact auth server');
      }
      const { url } = await response.json();

      const width = 500;
      const height = 650;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;

      const popup = window.open(
        url,
        'google_oauth_popup',
        `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes`
      );

      if (!popup) {
        setError('Popup blocked! Please enable popups for this site to continue with Google.');
      }
    } catch (err: any) {
      console.error('Google Sign-In failed:', err);
      setError('Unable to initialize Google Sign-In. Please try again.');
    }
  };

  // Listen for login success event from popup window
  useEffect(() => {
    const handleAuthMessage = (event: MessageEvent) => {
      const origin = event.origin;
      // Allow local and preview run domains
      if (!origin.endsWith('.run.app') && !origin.includes('localhost') && !origin.includes('127.0.0.1')) {
        return;
      }

      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        const { name: googleName, email: googleEmail, picture } = event.data.user;
        loginWithGoogleUser(googleName, googleEmail, picture);
      }
    };

    window.addEventListener('message', handleAuthMessage);
    return () => window.removeEventListener('message', handleAuthMessage);
  }, [loginWithGoogleUser]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden" style={{ background: 'var(--color-trado-bg)' }}>
      {/* Background radial effects and premium motion graphics background */}
      <MotionGraphics />
      
      <div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] rounded-full opacity-[0.05] blur-[150px] pointer-events-none z-0" style={{ background: 'var(--color-trado-accent)' }}></div>
      <div className="absolute bottom-[-20%] right-[-20%] w-[50%] h-[50%] rounded-full opacity-[0.04] blur-[150px] pointer-events-none z-0" style={{ background: 'var(--color-trado-accent)' }}></div>

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div 
          onClick={() => setActiveView('landing')}
          className="flex items-center justify-center gap-2 mb-8 cursor-pointer group"
        >
          <div className="h-10 w-10 rounded-lg flex items-center justify-center group-hover:scale-105 transition" style={{ background: 'var(--color-trado-accent)', boxShadow: '0 0 18px rgba(79,107,255,0.5)' }}>
            <TrendingUp className="h-6 w-6 text-white stroke-[2.5]" />
          </div>
          <span className="font-display font-bold text-2xl tracking-tight" style={{ color: 'var(--color-trado-text)' }}>
            Trado
          </span>
        </div>

        {/* Card */}
        <div className="glassmorphism p-8 rounded-2xl border-white/[0.05] glow-border backdrop-blur-xl">
          <h2 className="text-2xl font-display font-bold text-white mb-2 text-center">
            {type === 'register' ? 'Create Your Account' : 'Welcome Back'}
          </h2>
          <p className="text-gray-400 text-sm text-center mb-6">
            {type === 'register' 
              ? 'Get ₹1,000,000 virtual capital instantly and start learning.' 
              : 'Sign in to access your virtual trading simulator.'}
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-950/40 border border-brand-red/30 flex items-center gap-2 text-sm text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Google Sign-In Integration */}
          <div className="mb-5">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full bg-white/[0.03] hover:bg-white/[0.07] active:bg-white/[0.02] border border-white/[0.08] hover:border-white/[0.15] text-white font-medium py-3 rounded-xl transition duration-200 flex items-center justify-center gap-3 text-sm shadow-md hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6-4.52z" fill="#EA4335" />
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>

          <div className="relative flex py-2 items-center mb-5">
            <div className="flex-grow border-t border-white/[0.06]"></div>
            <span className="flex-shrink mx-4 text-xs text-gray-500 font-mono uppercase tracking-wider">or email gateway</span>
            <div className="flex-grow border-t border-white/[0.06]"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {type === 'register' && (
              <div>
                <label className="block text-xs font-mono text-gray-400 uppercase tracking-wider mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-500" />
                  <input
                    type="text"
                    required
                    placeholder="Jane Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border border-white/[0.08] focus:outline-none rounded-xl py-3 pl-10 pr-4 text-sm transition font-sans" style={{ background: 'rgba(21,27,38,0.9)', color: 'var(--color-trado-text)' }} onFocus={e => (e.currentTarget.style.borderColor = 'rgba(79,107,255,0.6)')} onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-mono text-gray-400 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-500" />
                <input
                  type="email"
                  required
                  placeholder="jane@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-white/[0.08] focus:outline-none rounded-xl py-3 pl-10 pr-4 text-sm transition font-sans" style={{ background: 'rgba(21,27,38,0.9)', color: 'var(--color-trado-text)' }} onFocus={e => (e.currentTarget.style.borderColor = 'rgba(79,107,255,0.6)')} onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full text-white font-medium py-3 rounded-xl transition duration-200 flex items-center justify-center gap-2 cursor-pointer"
              style={{ background: 'var(--color-trado-accent)', boxShadow: '0 0 20px rgba(79,107,255,0.25)' }}
              onMouseEnter={e => { if (!isLoading) { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.01)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 28px rgba(79,107,255,0.5)'; }}}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 20px rgba(79,107,255,0.25)'; }}
            >
              {isLoading ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : type === 'register' ? (
                'Create Virtual Account'
              ) : (
                'Access Dashboard'
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-gray-500">
            {type === 'register' ? (
              <p>
                Already have a virtual wallet?{' '}
                <button
                  onClick={() => {
                    setError('');
                    setActiveView('signin');
                  }}
                  className="text-brand-red hover:underline font-medium"
                >
                  Sign In
                </button>
              </p>
            ) : (
              <p>
                New to stock simulator?{' '}
                <button
                  onClick={() => {
                    setError('');
                    setActiveView('register');
                  }}
                  className="text-brand-red hover:underline font-medium"
                >
                  Register Instantly
                </button>
              </p>
            )}
          </div>
        </div>

        {/* Security / Education Badge */}
        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-gray-600">
          <Shield className="h-4 w-4" />
          <span>Educational Simulator Environment (No Real Money)</span>
        </div>
      </motion.div>
    </div>
  );
};
