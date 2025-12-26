
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import GlassmorphicCard from '../components/GlassmorphicCard';
import { useAuth } from '../context/AuthContext';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login, user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Failed to log in. Please check your credentials.');
    }
  };

  React.useEffect(() => {
    if (user) {
      if (user.role === 'SUPER_ADMIN') {
        navigate('/admin');
      } else if (user.role === 'VENDOR') {
        navigate('/vendor');
      } else {
        navigate('/profile');
      }
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-gradient-to-b from-accent/10 to-transparent blur-3xl rounded-full"></div>
      
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-[#0d0d14] to-[#1a1a2e] border border-white/10 rounded-3xl flex items-center justify-center shadow-2xl mb-4 transform -rotate-6">
                <svg className="w-14 h-14 text-accent" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.707 15.293C4.077 15.923 4.523 17 5.414 17H17M17 17C15.8954 17 15 17.8954 15 19C15 20.1046 15.8954 21 17 21C18.1046 21 19 20.1046 19 19C19 17.8954 18.1046 17 17 17ZM9 17C7.89543 17 7 17.8954 7 19C7 20.1046 7.89543 21 9 21C10.1046 21 11 20.1046 11 19C11 17.8954 10.1046 17 9 17Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </div>
            <h1 className="text-4xl font-black text-text-main italic">Vexo<span className="text-accent">Kart</span></h1>
            <p className="text-text-muted text-xs uppercase tracking-widest mt-1 font-bold">Shop Online, Shop Smart</p>
        </div>
        <GlassmorphicCard className="p-8 border-white/5">
          <h2 className="text-2xl font-bold text-center text-text-main mb-6">Welcome Back</h2>
          {error && <p className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-4 rounded-xl mb-6">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-xs font-black uppercase tracking-wider text-text-muted" htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full mt-2 bg-background/50 text-text-main placeholder-text-muted border border-white/5 focus:border-accent focus:ring-1 focus:ring-accent/20 rounded-xl p-3.5 transition-all"
                placeholder="alex@example.com"
              />
            </div>
            <div>
              <label className="text-xs font-black uppercase tracking-wider text-text-muted" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full mt-2 bg-background/50 text-text-main placeholder-text-muted border border-white/5 focus:border-accent focus:ring-1 focus:ring-accent/20 rounded-xl p-3.5 transition-all"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-accent to-accent-secondary text-white font-black uppercase tracking-widest py-4 rounded-xl shadow-xl shadow-accent/20 transform hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Secure Login
            </button>
          </form>
          <div className="text-center text-sm text-text-muted mt-8 space-y-3">
            <p>
              New to VexoKart?{' '}
              <Link to="/signup" className="font-bold text-accent hover:text-accent-secondary transition-colors underline underline-offset-4">
                Create Account
              </Link>
            </p>
             <div className="h-px bg-white/5 w-full my-4"></div>
             <p className="text-xs">
              Interested in selling?{' '}
              <Link to="/vendor/signup" className="font-bold text-text-main hover:text-accent transition-colors">
                Become a Partner
              </Link>
            </p>
          </div>
        </GlassmorphicCard>
      </div>
    </div>
  );
};

export default LoginPage;
