
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase';
import AuthLayout from '../components/AuthLayout';
import AuthInput from '../components/AuthInput';
import { Mail, Lock, LogIn, Globe, User } from 'lucide-react';
import { motion } from 'motion/react';

const LoginPage: React.FC = () => {
  const { user, isAuthenticated, isLoading: isAuthLoading, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Form states
  const [email, setEmail] = useState(location.state?.email || '');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  
  // UI states
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthLoading && isAuthenticated && user) {
      const from = location.state?.from || (user.role === 'admin' ? '/admin' : '/home');
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, user, isAuthLoading, navigate, location.state]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!email || !password) throw new Error("Please enter both email and password.");
      await login(email, password);
    } catch (err: any) {
      setError(err.message || "Authentication failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/#/home`,
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || `Failed to login with ${provider}.`);
    }
  };

  return (
    <AuthLayout 
      title="Welcome Back" 
      subtitle="Sign in to your account to continue shopping"
    >
      <form onSubmit={handleLogin} className="space-y-6">
        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-500 text-xs font-bold text-center"
          >
            {error}
          </motion.div>
        )}

        <AuthInput 
          label="Email Address" 
          type="email" 
          placeholder="name@example.com" 
          icon={Mail} 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <div className="space-y-1">
          <AuthInput 
            label="Password" 
            type="password" 
            placeholder="••••••••" 
            icon={Lock} 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <div className="flex justify-end px-1">
            <Link 
              to="/forgot-password" 
              className="text-[10px] font-bold text-primary uppercase tracking-wider hover:text-primary-dark transition-colors"
            >
              Forgot Password?
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-2 px-1">
          <input 
            type="checkbox" 
            id="remember" 
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary/20"
          />
          <label htmlFor="remember" className="text-xs font-medium text-slate-500 cursor-pointer">
            Remember me
          </label>
        </div>

        <button 
          type="submit" 
          disabled={loading || isAuthLoading} 
          className="w-full bg-primary text-white py-4 rounded-2xl font-bold uppercase tracking-widest text-[11px] shadow-xl shadow-primary/20 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading || isAuthLoading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <>
              <LogIn size={16} />
              Sign In
            </>
          )}
        </button>
      </form>

      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-100"></div>
        </div>
        <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest">
          <span className="bg-white px-4 text-slate-400">Or continue with</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => handleSocialLogin('google')}
          className="flex items-center justify-center gap-3 py-3 px-4 bg-white border border-slate-200 rounded-2xl text-slate-600 text-xs font-bold hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95"
        >
          <Globe size={18} className="text-primary" />
          Google
        </button>
        <button 
          onClick={() => handleSocialLogin('github')}
          className="flex items-center justify-center gap-3 py-3 px-4 bg-white border border-slate-200 rounded-2xl text-slate-600 text-xs font-bold hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95"
        >
          <User size={18} className="text-slate-900" />
          GitHub
        </button>
      </div>

      <div className="mt-10 text-center">
        <p className="text-sm text-slate-500">
          Don't have an account?{' '}
          <Link to="/signup" className="text-primary font-bold hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
