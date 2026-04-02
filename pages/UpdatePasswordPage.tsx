
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import AuthLayout from '../components/AuthLayout';
import AuthInput from '../components/AuthInput';
import { Lock, CheckCircle2, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

const UpdatePasswordPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
    setError('');

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
        setError("Password must be at least 6 characters long.");
        return;
    }
    
    setIsSubmitting(true);
    setMessage('');

    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;

      setMessage("Your password has been updated successfully. Redirecting to login...");
      
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

  if (message) {
    return (
      <AuthLayout 
        title="Password Updated" 
        subtitle="Your account is now secure"
        showBackButton={false}
      >
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} />
          </div>
          <p className="text-slate-600 text-sm leading-relaxed">
            {message}
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout 
      title="Set New Password" 
      subtitle="Enter a secure new password for your account"
      showBackButton={false}
    >
      <form onSubmit={handleUpdate} className="space-y-6">
        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-500 text-xs font-bold text-center"
          >
            {error}
          </motion.div>
        )}

        <AuthInput 
          label="New Password" 
          type="password" 
          placeholder="Min. 6 characters" 
          icon={Lock} 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <AuthInput 
          label="Confirm New Password" 
          type="password" 
          placeholder="••••••••" 
          icon={ShieldCheck} 
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <button 
          type="submit" 
          disabled={isSubmitting} 
          className="w-full bg-primary text-white py-4 rounded-2xl font-bold uppercase tracking-widest text-[11px] shadow-xl shadow-primary/20 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <>
              <Lock size={16} />
              Update Password
            </>
          )}
        </button>
      </form>
    </AuthLayout>
  );
};

export default UpdatePasswordPage;
