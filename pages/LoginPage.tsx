
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ChevronLeftIcon } from '../components/icons/ChevronLeftIcon';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
        navigate('/home', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
        setError("Please fill in all fields");
        return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
        await login(email.trim(), password);
        navigate('/home', { replace: true });
    } catch (err: any) {
        console.error(err);
        // Display exact error message from Supabase for clarity
        setError(err.message || "Invalid credentials");
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col p-6 pt-12 animate-in fade-in duration-300">
      
      <div className="mb-8">
        <button onClick={() => navigate('/home')} className="mb-4 inline-flex items-center gap-2 text-text-muted text-xs font-bold uppercase tracking-widest hover:text-text-main transition-colors">
            <ChevronLeftIcon className="w-4 h-4" />
            Back to Browse
        </button>
        <h2 className="text-3xl font-black text-text-main italic uppercase tracking-tight mb-2">Welcome Back</h2>
        <p className="text-text-muted text-sm font-medium">Log in to continue shopping</p>
      </div>

      <div className="flex-1 max-w-md mx-auto w-full">
        {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-500 text-xs font-bold flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {error}
            </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Email Address</label>
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-2 transition-all focus-within:border-accent focus-within:ring-4 focus-within:ring-accent/5">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="w-full bg-transparent p-3 text-sm font-bold text-text-main placeholder-gray-300 outline-none"
                    />
                </div>
            </div>

            <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Password</label>
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-2 transition-all focus-within:border-accent focus-within:ring-4 focus-within:ring-accent/5">
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-transparent p-3 text-sm font-bold text-text-main placeholder-gray-300 outline-none"
                    />
                </div>
            </div>

            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-accent text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl shadow-accent/20 active:scale-95 transition-all disabled:opacity-50 disabled:shadow-none mt-4"
            >
                {isSubmitting ? 'Verifying...' : 'Secure Login'}
            </button>
        </form>

        <div className="mt-8 text-center">
            <p className="text-gray-400 text-xs font-bold">
                Don't have an account?{' '}
                <Link to="/signup" className="text-accent hover:underline decoration-2 underline-offset-4">
                    Create One
                </Link>
            </p>
        </div>
        
        <div className="mt-12 border-t border-gray-100 pt-6 text-center">
             <Link to="/vendor/login" className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-colors">
                Vendor / Admin Portal
             </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
