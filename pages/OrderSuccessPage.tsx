import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

type OrderSuccessState = {
  orderId?: string;
  paymentMethod?: string;
  totalAmount?: number;
};

const OrderSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const soundPlayed = useRef(false);
  
  const state = location.state as OrderSuccessState | undefined;
  const orderId = state?.orderId;
  const paymentMethod = state?.paymentMethod || 'Paid';
  const totalAmount = state?.totalAmount || 0;

  useEffect(() => {
    // 1. Play success sound (Ding)
    if (!soundPlayed.current) {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3');
        audio.volume = 0.3;
        audio.play().catch(() => {
            // Silently fail if browser blocks autoplay
        });
        
        // 2. Trigger Haptic (Vibration)
        if (navigator.vibrate) {
            navigator.vibrate(100);
        }
        
        soundPlayed.current = true;
    }

    // 3. Fallback redirect if no orderId
    if (!orderId) {
      const timer = setTimeout(() => {
        navigate('/', { replace: true });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [orderId, navigate]);

  // 4. Estimated Delivery Logic (approx 4-6 days from today)
  const estDate = new Date();
  estDate.setDate(estDate.getDate() + 5);
  const formattedEstDate = estDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 animate-in fade-in duration-500 overflow-hidden select-none">
      
      {/* MEESHO-STYLE ANIMATED TICK */}
      <div className="mb-8 relative flex flex-col items-center">
        <div className="w-24 h-24 bg-[#34BE82] rounded-full flex items-center justify-center shadow-[0_15px_30px_rgba(52,190,130,0.3)] animate-meesho-pop">
          <svg className="w-14 h-14 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={5} 
                d="M5 13l4 4L19 7" 
                className="animate-tick-draw"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-black text-gray-900 mt-6 tracking-tight">Order Confirmed</h1>
        <p className="text-gray-500 text-sm font-medium mt-2 text-center max-w-[280px]">
            Thank you! Your order has been placed successfully.
        </p>
      </div>

      {/* ORDER SUMMARY BLOCK */}
      <div className="w-full max-w-sm bg-[#F9F9F9] rounded-3xl p-6 mb-10 space-y-4 border border-gray-100">
        <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500 font-medium">Order ID</span>
            <span className="text-gray-900 font-bold font-mono">#{orderId || '------'}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500 font-medium">Payment Mode</span>
            <span className="text-gray-900 font-bold">{paymentMethod}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500 font-medium">Total Amount</span>
            <span className="text-gray-900 font-black">₹{totalAmount.toLocaleString('en-IN')}</span>
        </div>
        <div className="pt-4 border-t border-dashed border-gray-200 flex flex-col gap-1">
            <span className="text-[10px] font-black uppercase text-accent tracking-widest text-center">Estimated Arrival</span>
            <span className="text-sm font-bold text-gray-800 text-center">{formattedEstDate}</span>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="w-full max-w-sm flex flex-col gap-4">
        <button
          onClick={() => navigate('/', { replace: true })}
          className="w-full bg-accent text-white font-black uppercase tracking-widest text-xs py-5 rounded-2xl shadow-xl shadow-accent/30 active:scale-[0.98] transition-all"
        >
          Continue Shopping
        </button>

        <button
          onClick={() => navigate(`/order/${orderId}`, { replace: true })}
          className="w-full py-4 bg-white text-gray-700 font-bold uppercase tracking-widest text-[10px] border border-gray-200 rounded-2xl active:bg-gray-50 transition-colors"
        >
          View Order Details
        </button>
      </div>

      {/* FOOTER META */}
      <div className="mt-12 text-center">
        <p className="text-[8px] text-gray-300 font-black uppercase tracking-[0.4em]">
          VexoKart Secure Node • Verified Transaction
        </p>
      </div>
    </div>
  );
};

export default OrderSuccessPage;