
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GlassmorphicCard from '../components/GlassmorphicCard';

const LoginPage: React.FC = () => {
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { sendOtp } = useAuth();

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) {
        alert("Please enter a valid 10-digit mobile number");
        return;
    }
    
    setIsSubmitting(true);
    try {
        await sendOtp(phone);
        navigate('/otp', { state: { phone } });
    } catch (err) {
        alert("Failed to send OTP");
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col p-6 pt-12 animate-in fade-in duration-300">
      
      {/* Illustration */}
      <div className="flex justify-center mb-8">
        <div className="w-full max-w-[280px] h-64 bg-surface rounded-[3rem] relative overflow-hidden flex items-end justify-center border border-gray-100">
            <img 
                src="https://img.freepik.com/free-vector/shopping-cart-concept-illustration_114360-1207.jpg?w=740&t=st=1686000000~exp=1686000600~hmac=xyz" 
                className="w-full h-full object-cover opacity-80 mix-blend-multiply" 
                alt="Shopping"
            />
            <div className="absolute top-6 right-6 bg-[#00B259] text-white text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest shadow-lg transform rotate-12">
                Fast Delivery
            </div>
        </div>
      </div>

      <div className="flex-1">
        <h2 className="text-2xl font-black text-text-main italic uppercase tracking-tight mb-1">Get Started</h2>
        <p className="text-text-muted text-xs font-bold uppercase tracking-widest mb-8">Login or Signup to continue</p>

        <form onSubmit={handleContinue} className="space-y-6">
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-2 flex items-center transition-all focus-within:border-accent focus-within:ring-4 focus-within:ring-accent/10">
                <div className="pl-4 pr-3 border-r border-gray-200">
                    <span className="font-bold text-gray-500">+91</span>
                </div>
                <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                    maxLength={10}
                    placeholder="Mobile Number"
                    className="w-full bg-transparent p-3 text-lg font-bold text-text-main placeholder-gray-300 outline-none"
                    autoFocus
                />
            </div>

            <button
                type="submit"
                disabled={isSubmitting || phone.length < 10}
                className="w-full bg-accent text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl shadow-accent/20 active:scale-95 transition-all disabled:opacity-50 disabled:shadow-none"
            >
                {isSubmitting ? 'Sending OTP...' : 'Continue'}
            </button>
        </form>

        <p className="text-[9px] text-center text-gray-400 mt-6 leading-relaxed max-w-xs mx-auto">
            By continuing, you agree to our <span className="font-bold text-gray-600 underline">Terms of Use</span> & <span className="font-bold text-gray-600 underline">Privacy Policy</span>
        </p>
      </div>

      <div className="mt-8 text-center">
         <Link to="/vendor/login" className="text-accent text-[10px] font-black uppercase tracking-widest border-b border-accent/20 pb-0.5 hover:border-accent">
            Vendor / Partner Login
         </Link>
      </div>
    </div>
  );
};

export default LoginPage;
