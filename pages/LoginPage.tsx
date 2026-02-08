
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase';

const LoginPage: React.FC = () => {
  const { user, isAuthenticated, isLoading: isAuthLoading, login, signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [view, setView] = useState<'auth' | 'forgot'>(location.state?.view || 'auth');
  const [authTab, setAuthTab] = useState<'login' | 'signup'>(location.state?.defaultTab || 'login');
  
  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState(location.state?.email || '');
  const [password, setPassword] = useState('');
  
  // UI states
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthLoading && isAuthenticated && user) {
      const from = location.state?.from || (user.role === 'admin' ? '/admin' : '/home');
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, user, isAuthLoading, navigate, location.state]);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (authTab === 'signup') {
        if (!name) throw new Error("Full name is required for signup.");
        await signup(name, email, password);
        setMessage("Signup successful! Please check your email to confirm your account.");
      } else {
        await login(email, password);
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
        setError("Please enter your email address.");
        return;
    }
    setLoading(true);
    setError('');
    setMessage('');
    
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/#/update-password`,
      });
      if (resetError) throw resetError;
      setMessage("Password reset link sent! Please check your email inbox (and spam folder).");
    } catch (err: any) {
      setError(err.message || "Failed to send reset link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "w-full mt-1 bg-surface border border-border rounded-xl p-3 text-sm font-bold text-text-main placeholder-text-muted outline-none focus:border-primary transition-all";

  const renderAuthView = () => (
    <>
      <div className="flex bg-surface p-1 rounded-full mb-8">
        <button
          onClick={() => { setAuthTab('login'); setError(''); setMessage(''); }}
          className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-full transition-all ${authTab === 'login' ? 'bg-white text-text-main shadow-sm' : 'text-text-muted'}`}
        >
          Login
        </button>
        <button
          onClick={() => { setAuthTab('signup'); setError(''); setMessage(''); }}
          className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-full transition-all ${authTab === 'signup' ? 'bg-white text-text-main shadow-sm' : 'text-text-muted'}`}
        >
          Signup
        </button>
      </div>

      <form onSubmit={handleAuthSubmit} className="space-y-5">
        {authTab === 'signup' && (
          <div>
            <label className="text-[10px] font-black uppercase text-text-muted tracking-widest ml-2">Full Name</label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className={inputClasses} placeholder="e.g. John Doe" />
          </div>
        )}
        <div>
          <label className="text-[10px] font-black uppercase text-text-muted tracking-widest ml-2">Email Address</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClasses} placeholder="name@example.com" />
        </div>
        <div>
          <label className="text-[10px] font-black uppercase text-text-muted tracking-widest ml-2">Password</label>
          <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className={inputClasses} placeholder="••••••••" />
        </div>

        <button type="submit" disabled={loading || isAuthLoading} className="w-full bg-primary text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] shadow-xl shadow-primary/20 active:scale-95 transition-all disabled:opacity-50">
          {loading || isAuthLoading ? 'Processing...' : authTab === 'login' ? 'Secure Login' : 'Create Account'}
        </button>
      </form>
      <div className="text-center mt-6">
        <button onClick={() => { setView('forgot'); setError(''); setMessage(''); }} className="text-[10px] font-black uppercase text-text-muted tracking-widest hover:text-primary transition-colors">
            Forgot Password?
        </button>
      </div>
    </>
  );

  const renderForgotView = () => (
    <>
      <div className="text-center mb-8">
        <h2 className="text-xl font-black text-text-main uppercase italic">Recover Access</h2>
        <p className="text-text-muted text-xs mt-1">Enter your email to receive a recovery link.</p>
      </div>
      <form onSubmit={handlePasswordReset} className="space-y-5">
        <div>
          <label className="text-[10px] font-black uppercase text-text-muted tracking-widest ml-2">Email Address</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClasses} placeholder="name@example.com" />
        </div>
        <button type="submit" disabled={loading || !!message} className="w-full bg-accent text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] shadow-xl shadow-accent/20 active:scale-95 transition-all disabled:opacity-50">
          {loading ? 'Processing...' : 'Send Recovery Link'}
        </button>
      </form>
      <div className="text-center mt-6">
        <button onClick={() => { setView('auth'); setError(''); setMessage(''); }} className="text-[10px] font-black uppercase text-text-muted tracking-widest hover:text-primary transition-colors">
            Back to Login
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-text-main italic uppercase tracking-tighter">
            DAR CYCLE <span className="text-primary">HUB</span>
          </h1>
          <p className="text-text-muted text-[10px] font-black uppercase tracking-[0.4em] mt-2">Secure Gateway</p>
        </div>

        <div className="bg-white rounded-3xl shadow-premium border border-border p-8 relative overflow-hidden">
          {error && <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-bold text-center italic">{error}</div>}
          {message && <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-600 text-xs font-bold text-center italic">{message}</div>}
          
          {view === 'auth' ? renderAuthView() : renderForgotView()}
        </div>

        <div className="text-center mt-8">
            <button onClick={() => navigate('/home')} className="text-[10px] font-black uppercase text-text-muted tracking-widest border-b border-transparent hover:border-text-muted pb-1 transition-all">
                Continue as Guest
            </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
