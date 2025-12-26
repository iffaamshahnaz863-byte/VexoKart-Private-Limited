
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import GlassmorphicCard from '../components/GlassmorphicCard';
import { useAuth } from '../context/AuthContext';

const VendorSignupPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [storeName, setStoreName] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { signupAsVendor } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
    }
    try {
      await signupAsVendor(name, email, password, storeName, adminCode);
      navigate('/vendor');
    } catch (err: any) {
      setError(err.message || 'Failed to create a vendor account.');
    }
  };

  const inputClasses = "w-full mt-2 bg-surface text-text-main border border-gray-600 rounded-lg p-3 transition focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/50";

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">
         <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-text-main">VexoKart</h1>
            <p className="text-text-muted">Become a Vendor</p>
        </div>
        <GlassmorphicCard className="p-8">
          <h2 className="text-2xl font-bold text-center text-text-main mb-6">Create Your Store</h2>
          {error && <p className="bg-red-500/20 text-red-400 text-sm p-3 rounded-md mb-4">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-text-secondary" htmlFor="storeName">Store Name</label>
              <input id="storeName" type="text" value={storeName} onChange={(e) => setStoreName(e.target.value)} required className={inputClasses} placeholder="My Awesome Store"/>
            </div>
             <div>
              <label className="text-sm font-medium text-text-secondary" htmlFor="name">Your Full Name</label>
              <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required className={inputClasses} placeholder="John Doe"/>
            </div>
            <div>
              <label className="text-sm font-medium text-text-secondary" htmlFor="email">Login Email</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClasses} placeholder="you@example.com"/>
            </div>
            <div>
              <label className="text-sm font-medium text-text-secondary" htmlFor="password">Password</label>
              <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className={inputClasses} placeholder="••••••••"/>
            </div>
             <div>
              <label className="text-sm font-medium text-text-secondary" htmlFor="adminCode">Admin Code</label>
              <input id="adminCode" type="text" value={adminCode} onChange={(e) => setAdminCode(e.target.value)} required className={inputClasses} placeholder="Provided by Super Admin"/>
            </div>
            <button type="submit" className="w-full bg-gradient-to-r from-accent to-accent-secondary text-white font-bold py-3 rounded-lg shadow-lg !mt-6">Register as Vendor</button>
          </form>
          <p className="text-center text-sm text-text-muted mt-6">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-accent hover:underline">
              Login
            </Link>
          </p>
        </GlassmorphicCard>
      </div>
    </div>
  );
};

export default VendorSignupPage;