import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import GlassmorphicCard from '../components/GlassmorphicCard';
import { Address } from '../types';

type OrderSuccessState = {
  address?: Address;
  orderId?: string;
};

const OrderSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as OrderSuccessState | undefined;

  const address = state?.address;
  const orderId = state?.orderId;

  /**
   * 🔐 SAFETY NET
   * Agar user page refresh kare ya direct open kare
   * to My Orders par redirect
   */
  useEffect(() => {
    if (!address && !orderId) {
      const t = setTimeout(() => {
        navigate('/orders', { replace: true });
      }, 1500);
      return () => clearTimeout(t);
    }
  }, [address, orderId, navigate]);

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 relative overflow-hidden animate-in fade-in duration-500">

      {/* Success Badge */}
      <div className="mb-8 relative">
        <div className="absolute inset-0 bg-green-500/20 blur-3xl rounded-full scale-150 animate-pulse"></div>
        <div className="relative w-24 h-24 bg-green-500 rounded-full flex items-center justify-center shadow-xl shadow-green-500/30">
          <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>

      {/* Title */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-black text-text-main italic tracking-tight uppercase">
          Order Confirmed
        </h1>
        <p className="text-text-secondary mt-2 font-medium">
          Thank you for shopping with VexoKart
        </p>
      </div>

      {/* Order ID */}
      {orderId && (
        <GlassmorphicCard className="p-4 bg-white mb-6 text-center">
          <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-1">
            Order ID
          </p>
          <p className="font-mono font-black text-lg tracking-wider">
            #{orderId}
          </p>
        </GlassmorphicCard>
      )}

      {/* Delivery Address (Optional) */}
      {address && (
        <div className="w-full max-w-md space-y-4 mb-8">
          <h2 className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">
            Delivery Address
          </h2>

          <GlassmorphicCard className="p-6 bg-white">
            <p className="text-xs font-black uppercase italic">
              {address.fullName}
            </p>
            <p className="text-[10px] font-bold text-accent uppercase mt-1">
              {address.phone}
            </p>

            <div className="border-t border-dashed border-border mt-4 pt-4">
              <p className="text-xs text-text-secondary font-medium leading-relaxed uppercase tracking-tighter">
                {address.street}<br />
                {address.city}, {address.state} — {address.zip}
              </p>
            </div>
          </GlassmorphicCard>
        </div>
      )}

      {/* Actions */}
      <div className="w-full max-w-md space-y-4">
        <button
          onClick={() => navigate('/orders')}
          className="w-full bg-accent text-white font-black uppercase tracking-widest text-[11px] py-4 rounded-2xl shadow-2xl shadow-accent/20 active:scale-95 transition-all"
        >
          View My Orders
        </button>

        <button
          onClick={() => navigate('/')}
          className="w-full text-text-muted font-black uppercase tracking-widest text-[9px] hover:text-text-main transition-colors"
        >
          Continue Shopping
        </button>
      </div>

      {/* Footer */}
      <div className="mt-auto pt-10 pb-4 text-center">
        <p className="text-[9px] text-text-muted font-bold uppercase tracking-[0.2em] italic">
          VexoKart Commerce Engine v4.1
        </p>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
