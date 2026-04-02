
import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { supabase } from '../supabase';
import AuthLayout from '../components/AuthLayout';
import AuthInput from '../components/AuthInput';
import { Mail, Send, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

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
    
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/#/update-password`,
      });

      if (resetError) throw resetError;

      setMessage("Password reset link sent! Please check your email inbox (and spam folder) to set a new password.");
    } catch (err: any) {
      setError(err.message || "Failed to send reset link. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (message) {
    return (
      <AuthLayout 
        title="Check Your Email" 
        subtitle="We've sent recovery instructions to your inbox"
        showBackButton={false}
      >
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} />
          </div>
          <p className="text-slate-600 text-sm leading-relaxed">
            {message}
          </p>
          <div className="pt-4 flex flex-col gap-4">
            <button 
              onClick={() => setMessage('')} 
              className="text-primary font-bold hover:underline text-sm"
            >
              Didn't receive the email? Try again
            </button>
            <Link to="/login" className="text-slate-500 font-medium text-sm hover:text-slate-900">
              Back to Login
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout 
      title="Recover Access" 
      subtitle="Enter your email to receive a secure recovery link"
      backTo="/login"
    >
      <form onSubmit={handleReset} className="space-y-6">
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
          label="Email Address" 
          type="email" 
          placeholder="name@example.com" 
          icon={Mail} 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
              <Send size={16} />
              Send Recovery Link
            </>
          )}
        </button>
      </form>

      <div className="mt-12 p-6 bg-slate-50 rounded-3xl border border-slate-100 text-center">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Need help?</p>
        <p className="text-xs text-slate-500 mt-2">If you no longer have access to this email, please contact our support desk.</p>
      </div>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
