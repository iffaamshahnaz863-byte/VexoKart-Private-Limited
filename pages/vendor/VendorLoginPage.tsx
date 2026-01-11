
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GlassmorphicCard from '../../components/GlassmorphicCard';
import { useAuth } from '../../context/AuthContext';
import { ChevronLeftIcon } from '../../components/icons/ChevronLeftIcon';

const VendorLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { login, user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await login(email, password);
      // Auth context will handle user state, we just redirect based on role in useEffect
    } catch (err: any) {
      setError('Invalid credentials or unauthorized access');
    } finally {
      setIsSubmitting(false);
    }
  };

  React.useEffect(() => {
    if (user) {
      if (user.role === 'vendor' || user.role === 'admin') {
          navigate(user.role === 'admin' ? '/admin' : '/vendor');
      } else {
          // If a regular user tries to login here
          navigate('/profile'); 
      }
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex flex-col justify-center p-6 bg-gray-900 relative overflow-hidden">
      {/* Dark Theme for Vendor Side */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-[100px] -mr-20 -mt-20 pointer-events-none"></div>
      
      <button onClick={() => navigate('/login')} className="absolute top-6 left-6 text-gray-400 hover:text-white transition-colors flex items-center gap-2">
         <ChevronLeftIcon className="w-5 h-5" />
         <span className="text-[10px] font-bold uppercase tracking-widest">Back</span>
      </button>

      <div className="w-full max-w-md mx-auto relative z-10">
        <div className="text-center mb-10">
            <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">Partner<span className="text-accent">Console</span></h1>
            <p className="text-gray-500 text-[10px] uppercase tracking-[0.3em] mt-2 font-bold">Authorized Access Only</p>
        </div>

        <GlassmorphicCard className="p-8 border-gray-700/50 bg-gray-800/50">
          {error && <div className="bg-red-500/20 border border-red-500/30 text-red-400 text-xs p-3 rounded-lg mb-6 font-bold">{error}</div>}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1 block mb-2">Business Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-gray-900/50 text-white border border-gray-700 focus:border-accent rounded-xl p-3.5 outline-none transition-all font-medium text-sm"
                placeholder="vendor@vexokart.com"
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1 block mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-gray-900/50 text-white border border-gray-700 focus:border-accent rounded-xl p-3.5 outline-none transition-all font-medium text-sm"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-accent text-white font-black uppercase tracking-widest text-xs py-4 rounded-xl shadow-lg shadow-accent/20 active:scale-95 transition-all disabled:opacity-50 mt-4"
            >
              {isSubmitting ? 'Verifying Node...' : 'Access Dashboard'}
            </button>
          </form>
        </GlassmorphicCard>
        
        <div className="mt-8 text-center">
            <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">VexoKart Secure Fulfillment Protocol</p>
        </div>
      </div>
    </div>
  );
};

export default VendorLoginPage;
