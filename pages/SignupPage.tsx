
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/AuthLayout';
import AuthInput from '../components/AuthInput';
import { Mail, Lock, User, UserPlus } from 'lucide-react';
import { motion } from 'motion/react';

const SignupPage: React.FC = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  
  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // UI states
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      await signup(name, email, password);
      setSuccess(true);
      // Wait a bit then redirect to login or home
      setTimeout(() => navigate('/login', { state: { email } }), 3000);
    } catch (err: any) {
      setError(err.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthLayout 
        title="Account Created!" 
        subtitle="We've sent a confirmation link to your email"
        showBackButton={false}
      >
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail size={40} />
          </div>
          <p className="text-slate-600 text-sm leading-relaxed">
            Please check your inbox and click the verification link to activate your account. 
            You will be redirected to the login page shortly.
          </p>
          <div className="pt-4">
            <Link to="/login" className="text-primary font-bold hover:underline">
              Go to Login now
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout 
      title="Create Account" 
      subtitle="Join DAR CYCLE HUB and start your journey"
      backTo="/login"
    >
      <form onSubmit={handleSignup} className="space-y-5">
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
          label="Full Name" 
          type="text" 
          placeholder="e.g. John Doe" 
          icon={User} 
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <AuthInput 
          label="Email Address" 
          type="email" 
          placeholder="name@example.com" 
          icon={Mail} 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <AuthInput 
          label="Password" 
          type="password" 
          placeholder="••••••••" 
          icon={Lock} 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <AuthInput 
          label="Confirm Password" 
          type="password" 
          placeholder="••••••••" 
          icon={Lock} 
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <button 
          type="submit" 
          disabled={loading} 
          className="w-full bg-primary text-white py-4 rounded-2xl font-bold uppercase tracking-widest text-[11px] shadow-xl shadow-primary/20 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <>
              <UserPlus size={16} />
              Create Account
            </>
          )}
        </button>
      </form>

      <div className="mt-10 text-center">
        <p className="text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-bold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default SignupPage;
