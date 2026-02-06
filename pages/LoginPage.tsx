
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage: React.FC = () => {
  const { login, signup, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>(location.state?.defaultTab || 'login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showSecurityUpdate, setShowSecurityUpdate] = useState(false);
  const [loading, setLoading] = useState(false);

  // Redirection Logic based on Role
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'vendor') navigate('/vendor');
      else navigate('/home');
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setShowSecurityUpdate(false);
    setLoading(true);

    try {
      if (activeTab === 'signup') {
        if (!name) throw new Error("Name is required");
        await signup(name, email, password);
      } else {
        await login(email, password);
      }
    } catch (err: any) {
      // Catch login failures specifically to show the security update notice
      if (activeTab === 'login') {
        setShowSecurityUpdate(true);
      } else {
        setError(err.message || "Authentication failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "w-full mt-1 bg-surface border border-border rounded-xl p-3 text-sm font-bold text-text-main placeholder-text-muted outline-none focus:border-accent transition-all";

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-text-main italic uppercase tracking-tighter">
            Vexo<span className="text-accent">Kart</span>
          </h1>
          <p className="text-text-muted text-[10px] font-black uppercase tracking-[0.4em] mt-2">Secure Gateway</p>
        </div>

        <div className="bg-white rounded-3xl shadow-premium border border-border p-8 relative overflow-hidden">
          
          {/* Security Update Overlay */}
          {showSecurityUpdate && (
            <div className="absolute inset-0 bg-white z-20 flex flex-col items-center justify-center p-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mb-4 text-accent">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                <h3 className="text-xl font-black text-text-main uppercase italic tracking-tight">Security Update</h3>
                <p className="text-gray-500 text-sm mt-3 leading-relaxed">
                    We've upgraded our security systems. <br/>
                    If you created your account earlier, please <b>reset your password</b> once to continue.
                </p>
                <div className="w-full space-y-3 mt-8">
                    <Link 
                        to="/forgot-password" 
                        state={{ email }}
                        className="block w-full bg-accent text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl shadow-accent/20 active:scale-95 transition-all"
                    >
                        Reset Password
                    </Link>
                    <button 
                        onClick={() => setShowSecurityUpdate(false)}
                        className="text-gray-400 font-bold uppercase text-[10px] tracking-widest hover:text-gray-600 transition-colors"
                    >
                        Try Login Again
                    </button>
                </div>
            </div>
          )}

          <div className="flex bg-surface p-1 rounded-full mb-8">
            <button
              onClick={() => { setActiveTab('login'); setError(''); setShowSecurityUpdate(false); }}
              className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-full transition-all ${activeTab === 'login' ? 'bg-white text-text-main shadow-sm' : 'text-text-muted'}`}
            >
              Login
            </button>
            <button
              onClick={() => { setActiveTab('signup'); setError(''); setShowSecurityUpdate(false); }}
              className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-full transition-all ${activeTab === 'signup' ? 'bg-white text-text-main shadow-sm' : 'text-text-muted'}`}
            >
              Signup
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-500 text-xs font-bold text-center italic">
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClasses}
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] shadow-xl shadow-accent/20 active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? 'Processing...' : activeTab === 'login' ? 'Secure Login' : 'Create Account'}
            </button>
          </form>
        </div>

        <div className="text-center mt-8 space-y-4">
            <Link to="/forgot-password" size="sm" className="text-[10px] font-black uppercase text-text-muted tracking-widest block hover:text-accent transition-colors">
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
