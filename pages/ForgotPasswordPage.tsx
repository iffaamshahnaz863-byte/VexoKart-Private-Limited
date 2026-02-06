
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { supabase } from '../supabase';
import { ChevronLeftIcon } from '../components/icons/ChevronLeftIcon';

const ForgotPasswordPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState(location.state?.email || '');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
        setError("Please enter your email address");
        return;
    }
    
    setIsSubmitting(true);
    setError('');
    setMessage('');
    
    // The redirect URL should point to your hosted site's update-password route
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/#/update-password`,
    });

    if (resetError) {
        setError(resetError.message);
    } else {
        setMessage("Password reset link sent! Please check your email inbox (and spam folder) to set a new password.");
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col p-6 pt-12 animate-in fade-in duration-300">
      
      <div className="mb-12">
        <button onClick={() => navigate('/login')} className="mb-6 inline-flex items-center gap-2 text-text-muted text-xs font-black uppercase tracking-widest hover:text-text-main transition-colors">
            <ChevronLeftIcon className="w-4 h-4" />
            Back to Login
        </button>
        <h2 className="text-3xl font-black text-text-main italic uppercase tracking-tighter mb-2 leading-none">Recover Access</h2>
        <p className="text-text-muted text-sm font-medium mt-3">Enter your email to receive a secure recovery link.</p>
      </div>

      <div className="flex-1 max-w-md mx-auto w-full">
        {error && (
            <div className="mb-8 p-5 bg-red-50 border border-red-100 rounded-2xl text-red-500 text-xs font-bold flex items-center gap-3">
                <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center shrink-0">!</div>
                {error}
            </div>
        )}

        {message && (
            <div className="mb-8 p-6 bg-green-50 border border-green-100 rounded-3xl text-green-600 text-sm font-bold animate-in zoom-in duration-300">
                <div className="flex items-center gap-3 mb-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span className="uppercase tracking-widest text-[10px]">Email Dispatched</span>
                </div>
                {message}
            </div>
        )}

        <form onSubmit={handleReset} className="space-y-6">
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-2 italic">Primary Email Address</label>
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-2 transition-all focus-within:border-accent focus-within:ring-8 focus-within:ring-accent/5">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="w-full bg-transparent p-4 text-base font-bold text-text-main placeholder-gray-300 outline-none"
                        required
                    />
                </div>
            </div>

            <button
                type="submit"
                disabled={isSubmitting || !!message}
                className="w-full bg-accent text-white py-5 rounded-[2rem] font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-accent/20 active:scale-95 transition-all disabled:opacity-50 disabled:shadow-none mt-4"
            >
                {isSubmitting ? 'Authenticating...' : 'Dispatch Recovery Link'}
            </button>
        </form>

        {!message && (
            <div className="mt-12 p-6 bg-surface rounded-3xl border border-border text-center">
                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Need help?</p>
                <p className="text-xs text-text-secondary mt-2">If you no longer have access to this email, please contact our support desk.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
