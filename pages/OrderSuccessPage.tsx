
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
    if (!soundPlayed.current) {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3');
        audio.volume = 0.3;
        audio.play().catch(() => {});
        if (navigator.vibrate) navigator.vibrate(100);
        soundPlayed.current = true;
    }

    if (!orderId) {
      const timer = setTimeout(() => navigate('/', { replace: true }), 3000);
      return () => clearTimeout(timer);
    }
  }, [orderId, navigate]);

  const estDate = new Date();
  estDate.setDate(estDate.getDate() + 5);
  const formattedEstDate = estDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 animate-in fade-in duration-500 overflow-hidden select-none">
      
      <div className="mb-8 relative flex flex-col items-center">
        <div className="w-24 h-24 bg-success rounded-full flex items-center justify-center shadow-[0_15px_30px_rgba(38,165,65,0.3)] animate-meesho-pop">
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

      <div className="w-full max-w-sm bg-surface rounded-3xl p-6 mb-10 space-y-4 border border-border">
        <div className="flex justify-between items-center text-sm">
            <span className="text-text-secondary font-medium">Order ID</span>
            <span className="text-text-main font-bold font-mono">#{orderId || '------'}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
            <span className="text-text-secondary font-medium">Payment Mode</span>
            <span className="text-text-main font-bold">{paymentMethod}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
            <span className="text-text-secondary font-medium">Total Amount</span>
            <span className="text-text-main font-black">₹{totalAmount.toLocaleString('en-IN')}</span>
        </div>
        <div className="pt-4 border-t border-dashed border-border flex flex-col gap-1">
            <span className="text-[10px] font-black uppercase text-primary tracking-widest text-center">Estimated Arrival</span>
            <span className="text-sm font-bold text-text-main text-center">{formattedEstDate}</span>
        </div>
      </div>

      <div className="w-full max-w-sm flex flex-col gap-4">
        <button
          onClick={() => navigate('/', { replace: true })}
          className="w-full bg-primary text-white font-black uppercase tracking-widest text-xs py-5 rounded-2xl shadow-xl shadow-primary/30 active:scale-[0.98] transition-all"
        >
          Continue Shopping
        </button>

        <button
          onClick={() => navigate(`/order/${orderId}`, { replace: true })}
          className="w-full py-4 bg-white text-text-secondary font-bold uppercase tracking-widest text-[10px] border border-border rounded-2xl active:bg-surface transition-colors"
        >
          View Order Details
        </button>
      </div>

      <div className="mt-12 text-center">
        <p className="text-[8px] text-gray-300 font-black uppercase tracking-[0.4em]">
          DAR CYCLE HUB • VERIFIED TRANSACTION
        </p>
      </div>
       <style dangerouslySetInnerHTML={{ __html: `
        @keyframes meesho-pop { 0% { transform: scale(0.5); opacity: 0; } 50% { transform: scale(1.1); } 100% { transform: scale(1); opacity: 1; } }
        .animate-meesho-pop { animation: meesho-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        @keyframes tick-draw { to { stroke-dashoffset: 0; } }
        .animate-tick-draw { stroke-dasharray: 1000; stroke-dashoffset: 1000; animation: tick-draw 0.8s ease-out 0.3s forwards; }
      `}} />
    </div>
  );
};

export default OrderSuccessPage;
