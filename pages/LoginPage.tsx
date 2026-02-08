
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage: React.FC = () => {
  const { user, isAuthenticated, isLoading: isAuthLoading, login, signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>(location.state?.defaultTab || 'login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthLoading && isAuthenticated && user) {
      const from = location.state?.from || (user.role === 'admin' ? '/admin' : '/home');
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, user, isAuthLoading, navigate, location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (activeTab === 'signup') {
        if (!name) throw new Error("Full name is required for signup.");
        await signup(name, email, password);
      } else {
        await login(email, password);
      }
      // On success, the onAuthStateChange listener in AuthContext will handle state updates and trigger the redirection effect.
    } catch (err: any) {
      setError(err.message || "Authentication failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "w-full mt-1 bg-surface border border-border rounded-xl p-3 text-sm font-bold text-text-main placeholder-text-muted outline-none focus:border-primary transition-all";

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
          
          <div className="flex bg-surface p-1 rounded-full mb-8">
            <button
              onClick={() => { setActiveTab('login'); setError(''); }}
              className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-full transition-all ${activeTab === 'login' ? 'bg-white text-text-main shadow-sm' : 'text-text-muted'}`}
            >
              Login
            </button>
            <button
              onClick={() => { setActiveTab('signup'); setError(''); }}
              className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-full transition-all ${activeTab === 'signup' ? 'bg-white text-text-main shadow-sm' : 'text-text-muted'}`}
            >
              Signup
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-bold text-center italic">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {activeTab === 'signup' && (
              <div>
                <label className="text-[10px] font-black uppercase text-text-muted tracking-widest ml-2">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputClasses}
                  placeholder="e.g. John Doe"
                />
              </div>
            )}
            <div>
              <label className="text-[10px] font-black uppercase text-text-muted tracking-widest ml-2">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClasses}
                placeholder="name@example.com"
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-text-muted tracking-widest ml-2">Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClasses}
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading || isAuthLoading}
              className="w-full bg-primary text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] shadow-xl shadow-primary/20 active:scale-95 transition-all disabled:opacity-50"
            >
              {loading || isAuthLoading ? 'Processing...' : activeTab === 'login' ? 'Secure Login' : 'Create Account'}
            </button>
          </form>
        </div>

        <div className="text-center mt-8 space-y-4">
            <Link to="/forgot-password" className="text-[10px] font-black uppercase text-text-muted tracking-widest block hover:text-primary transition-colors">
                Forgot Password?
            </Link>
            <button onClick={() => navigate('/home')} className="text-[10px] font-black uppercase text-text-muted tracking-widest border-b border-transparent hover:border-text-muted pb-1 transition-all">
                Continue as Guest
            </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
