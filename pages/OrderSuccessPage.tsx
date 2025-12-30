import React, { useEffect } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import GlassmorphicCard from '../components/GlassmorphicCard';
import { Address } from '../types';

const OrderSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const address = location.state?.address as Address;

  // Security: If accessed directly without order context, redirect to home
  if (!address) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
      {/* Success Badge */}
      <div className="mb-8 relative">
        <div className="absolute inset-0 bg-green-500/20 blur-3xl rounded-full scale-150 animate-pulse"></div>
        <div className="relative w-24 h-24 bg-green-500 rounded-full flex items-center justify-center shadow-xl shadow-green-500/30 scale-in-center">
          <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>

      <div className="text-center mb-10">
        <h1 className="text-3xl font-black text-text-main italic tracking-tight uppercase">Order placed, thank you!</h1>
        <p className="text-text-secondary mt-2 font-medium">Your order has been confirmed successfully.</p>
      </div>

      {/* Delivery Details Card */}
      <div className="w-full max-w-md space-y-4">
        <h2 className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Fulfillment Identity</h2>
        <GlassmorphicCard className="p-6 bg-white border-none shadow-premium">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center text-accent">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-black text-text-main uppercase italic">{address.fullName}</p>
              <p className="text-[10px] font-bold text-accent uppercase">{address.phone}</p>
            </div>
          </div>
          
          <div className="border-t border-dashed border-border pt-4">
            <p className="text-xs text-text-secondary font-medium leading-relaxed uppercase tracking-tighter">
              {address.street}<br />
              {address.city}, {address.state} — {address.zip}
            </p>
          </div>
        </GlassmorphicCard>

        <div className="pt-8 space-y-4">
          <button 
            onClick={() => navigate('/orders')}
            className="w-full bg-accent text-white font-black uppercase tracking-widest text-[11px] py-4 rounded-2xl shadow-2xl shadow-accent/20 active:scale-95 transition-all"
          >
            Go to My Orders
          </button>
          
          <button 
            onClick={() => navigate('/')}
            className="w-full text-text-muted font-black uppercase tracking-widest text-[9px] hover:text-text-main transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>

      <div className="mt-auto pt-10 pb-4 text-center">
        <p className="text-[9px] text-text-muted font-bold uppercase tracking-[0.2em] italic">VexoKart Logistics Protocol v4.0</p>
      </div>
    </div>
  );
};

export default OrderSuccessPage;