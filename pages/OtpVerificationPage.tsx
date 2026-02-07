

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ChevronLeftIcon } from '../components/icons/ChevronLeftIcon';

const OtpVerificationPage: React.FC = () => {
  const [otp, setOtp] = useState(['', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  const navigate = useNavigate();
  const location = useLocation();
  // FIX: These methods were missing from the context. Added dummy implementations in AuthContext.
  const { verifyOtp, sendOtp } = useAuth();
  
  const phone = location.state?.phone || '';

  useEffect(() => {
    if (!phone) navigate('/login');
    const interval = setInterval(() => {
        setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [phone]);

  const handleChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = async () => {
      setTimer(30);
      await sendOtp(phone);
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length !== 4) return;
    
    setIsVerifying(true);
    try {
        await verifyOtp(phone, code);
        navigate('/home', { replace: true });
    } catch (err: any) {
        alert(err.message || "Invalid OTP");
        setOtp(['', '', '', '']);
        inputRefs.current[0]?.focus();
    } finally {
        setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-6 pt-8 flex flex-col">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/login')} className="p-2 bg-gray-50 rounded-xl active:bg-gray-100">
            <ChevronLeftIcon className="w-6 h-6 text-gray-800" />
        </button>
        <h1 className="text-xl font-black text-gray-900 uppercase italic tracking-tight">Verification</h1>
      </div>

      <div className="flex-1">
        <p className="text-sm font-medium text-gray-500 mb-8">
            We've sent a verification code to <br/>
            <span className="text-text-main font-black text-lg">+91 {phone}</span>
        </p>

        <div className="flex gap-4 mb-8 justify-center">
            {otp.map((digit, idx) => (
                <input
                    key={idx}
                    // FIX: Wrapped ref callback in braces to prevent it from returning a value, which caused a type error.
                    ref={(el) => { inputRefs.current[idx] = el; }}
                    type="tel"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className="w-16 h-16 rounded-2xl bg-gray-50 border-2 border-gray-100 text-center text-2xl font-black text-text-main focus:border-accent focus:bg-white transition-all outline-none caret-accent"
                />
            ))}
        </div>

        <button
            onClick={handleVerify}
            disabled={otp.join('').length !== 4 || isVerifying}
            className="w-full bg-accent text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl shadow-accent/20 active:scale-95 transition-all disabled:opacity-50 disabled:shadow-none mb-6"
        >
            {isVerifying ? 'Verifying...' : 'Verify & Proceed'}
        </button>

        <div className="text-center">
            {timer > 0 ? (
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Resend in 00:{timer < 10 ? `0${timer}` : timer}</p>
            ) : (
                <button 
                    onClick={handleResend}
                    className="text-accent text-xs font-black uppercase tracking-widest border-b border-accent/20 pb-0.5"
                >
                    Resend Code
                </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default OtpVerificationPage;
