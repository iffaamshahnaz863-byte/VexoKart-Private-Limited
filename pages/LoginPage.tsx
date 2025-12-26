
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-text-main">VexoKart</h1>
            <p className="text-text-muted">Shop Online, Shop Smart</p>
        </div>
        <GlassmorphicCard className="p-8">
          <h2 className="text-2xl font-bold text-center text-text-main mb-6">Welcome Back</h2>
          {error && <p className="bg-red-500/20 text-red-400 text-sm p-3 rounded-md mb-4">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-sm font-medium text-text-secondary" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full mt-2 bg-surface/70 text-text-main placeholder-text-muted border border-gray-700 focus:border-accent focus:ring-accent rounded-lg p-3 transition"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-text-secondary" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full mt-2 bg-surface/70 text-text-main placeholder-text-muted border border-gray-700 focus:border-accent focus:ring-accent rounded-lg p-3 transition"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-accent to-accent-secondary text-white font-bold py-3 rounded-lg shadow-lg transform hover:scale-105 transition-transform"
            >
              Login
            </button>
          </form>
          <div className="text-center text-sm text-text-muted mt-6 space-y-2">
            <p>
              Don't have an account?{' '}
              <Link to="/signup" className="font-medium text-accent hover:underline">
                Sign Up
              </Link>
            </p>
             <p>
              Want to sell on VexoKart?{' '}
              <Link to="/vendor/signup" className="font-medium text-accent hover:underline">
                Become a Vendor
              </Link>
            </p>
          </div>
        </GlassmorphicCard>
      </div>
    </div>
  );
};

export default LoginPage;