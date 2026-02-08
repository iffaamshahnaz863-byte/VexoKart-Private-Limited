
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';

const UpdatePasswordPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        // This event confirms the user has a valid session to update their password.
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
        setError("Password must be at least 6 characters long.");
        return;
    }
    
    setIsSubmitting(true);
    setError('');
    setMessage('');

    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;

      setMessage("Your password has been updated successfully. You will be redirected to login shortly.");
      
      setTimeout(async () => {
          await supabase.auth.signOut();
          navigate('/login', { replace: true });
      }, 3000);

    } catch (err: any) {
      setError(err.message || "Failed to update password. The link may have expired.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col p-6 pt-12 animate-in fade-in duration-300">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-text-main italic uppercase tracking-tight mb-2">Set New Password</h2>
        <p className="text-text-muted text-sm font-medium">Your access token is valid. Please enter a new secure password.</p>
      </div>

      <div className="flex-1 max-w-md mx-auto w-full">
        {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-500 text-xs font-bold flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {error}
            </div>
        )}

        {message && (
            <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-xl text-green-600 text-xs font-bold flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {message}
            </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-6">
            <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">New Password</label>
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-2 transition-all focus-within:border-accent focus-within:ring-4 focus-within:ring-accent/5">
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Min. 6 characters"
                        className="w-full bg-transparent p-3 text-sm font-bold text-text-main placeholder-gray-300 outline-none"
                        required
                    />
                </div>
            </div>

            <button
                type="submit"
                disabled={isSubmitting || !!message}
                className="w-full bg-accent text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl shadow-accent/20 active:scale-95 transition-all disabled:opacity-50 disabled:shadow-none mt-4"
            >
                {isSubmitting ? 'Updating...' : 'Update Password & Login'}
            </button>
        </form>
      </div>
    </div>
  );
};

export default UpdatePasswordPage;
