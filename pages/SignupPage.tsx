
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import GlassmorphicCard from '../components/GlassmorphicCard';
import { useAuth } from '../context/AuthContext';

const SignupPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { signup } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
    }
    
    setIsSubmitting(true);
    try {
      await signup(name, email, phone, password);
      setSuccess('Account created successfully. Please login.');
      setName('');
      setEmail('');
      setPhone('');
      setPassword('');
      setTimeout(() => navigate('/login'), 2500);
    } catch (err: any) {
      setError(err.message || 'Failed to create an account. Please try again.');
    } finally {
        setIsSubmitting(false);
    }
  };

  const inputClasses = "w-full mt-2 bg-surface/70 text-text-main placeholder-text-muted border border-gray-700 focus:border-accent focus:ring-accent rounded-xl p-3.5 transition-all";

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-gradient-to-b from-accent/5 to-transparent blur-3xl rounded-full"></div>
      
      <div className="w-full max-w-md relative z-10">
         <div className="text-center mb-8">
            <h1 className="text-4xl font-black text-text-main italic">Vexo<span className="text-accent">Kart</span></h1>
            <p className="text-text-muted text-xs uppercase tracking-widest mt-1 font-bold">Create your lifestyle account</p>
        </div>
        <GlassmorphicCard className="p-8">
          <h2 className="text-2xl font-bold text-center text-text-main mb-6">Sign Up</h2>
          
          {error && <p className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-4 rounded-xl mb-6 font-bold">{error}</p>}
          {success && <p className="bg-green-500/10 border border-green-500/20 text-green-400 text-sm p-4 rounded-xl mb-6 font-bold">{success}</p>}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-black uppercase tracking-wider text-text-muted ml-1" htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isSubmitting}
                className={inputClasses}
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="text-xs font-black uppercase tracking-wider text-text-muted ml-1" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isSubmitting}
                className={inputClasses}
                placeholder="you@example.com"
              />
            </div>
             <div>
              <label className="text-xs font-black uppercase tracking-wider text-text-muted ml-1" htmlFor="phone">Phone Number</label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                disabled={isSubmitting}
                className={inputClasses}
                placeholder="+91 9876543210"
              />
            </div>
            <div>
              <label className="text-xs font-black uppercase tracking-wider text-text-muted ml-1" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isSubmitting}
                className={inputClasses}
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-accent to-accent-secondary text-white font-black uppercase tracking-widest py-4 rounded-xl shadow-xl shadow-accent/20 transform hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 mt-6"
            >
              {isSubmitting ? 'Creating Account...' : 'Register Now'}
            </button>
          </form>
          <p className="text-center text-sm text-text-muted mt-8">
            Already a member?{' '}
            <Link to="/login" className="font-bold text-accent hover:underline">
              Sign In
            </Link>
          </p>
        </GlassmorphicCard>
      </div>
    </div>
  );
};

export default SignupPage;
