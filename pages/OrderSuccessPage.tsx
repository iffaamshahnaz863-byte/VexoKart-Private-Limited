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

  useEffect(() => {
    if (!orderId) {
      const timer = setTimeout(() => {
        navigate('/orders', { replace: true });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [orderId, navigate]);

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 relative overflow-hidden animate-in fade-in duration-700">
      
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-gradient-to-b from-green-500/5 to-transparent blur-3xl rounded-full"></div>

      <div className="mb-10 relative">
        <div className="absolute inset-0 bg-green-500/20 blur-2xl rounded-full scale-150 animate-pulse"></div>
        <div className="relative w-28 h-28 bg-green-500 rounded-full flex items-center justify-center shadow-2xl shadow-green-500/40 border-4 border-white">
          <svg className="w-14 h-14 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-4xl font-black text-text-main italic tracking-tight uppercase leading-none">
          Order<br/><span className="text-accent">Confirmed</span>
        </h1>
        <p className="text-text-secondary mt-3 font-bold uppercase tracking-widest text-[10px]">
          Digital Manifest Generated Successfully
        </p>
      </div>

      <div className="w-full max-w-md space-y-4 mb-10">
        {orderId && (
          <div className="space-y-3">
             <GlassmorphicCard className="p-5 bg-white text-center border-green-500/10">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-text-muted mb-2">
                Transaction Reference
                </p>
                <p className="font-mono font-black text-xl tracking-wider text-text-main">
                #{orderId}
                </p>
            </GlassmorphicCard>

            <div className="bg-accent/5 border border-accent/10 rounded-2xl p-4 flex gap-4 items-center animate-in slide-in-from-top-4 duration-1000">
                <div className="bg-accent rounded-xl p-2 shrink-0 shadow-lg shadow-accent/20">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <div>
                    <p className="text-[10px] font-black uppercase text-accent tracking-widest italic">Digital Invoice Available</p>
                    <p className="text-[9px] text-text-secondary font-bold leading-tight mt-0.5">
                      Your official tax invoice and shipment labels are now available for viewing and download in your <strong>Order History</strong>.
                    </p>
                </div>
            </div>
          </div>
        )}

        {address && (
          <div className="space-y-3">
            <h2 className="text-[9px] font-black uppercase tracking-[0.2em] text-text-muted ml-2">
              Fulfillment Destination
            </h2>

            <GlassmorphicCard className="p-6 bg-white">
              <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-black uppercase italic text-text-main">
                      {address.fullName}
                    </p>
                    <p className="text-[10px] font-bold text-accent uppercase mt-1">
                      {address.phone}
                    </p>
                  </div>
                  <div className="bg-surface p-2 rounded-lg">
                      <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </div>
              </div>

              <div className="border-t border-dashed border-border mt-4 pt-4">
                <p className="text-[11px] text-text-secondary font-bold leading-relaxed uppercase tracking-tighter">
                  {address.street}<br />
                  {address.city}, {address.state} — {address.zip}
                </p>
              </div>
            </GlassmorphicCard>
          </div>
        )}
      </div>

      <div className="w-full max-w-md space-y-4">
        <button
          onClick={() => navigate('/orders', { replace: true })}
          className="w-full bg-text-main text-white font-black uppercase tracking-widest text-[11px] py-5 rounded-2xl shadow-xl active:scale-0.98 transition-all flex items-center justify-center gap-3"
        >
          Track Shipment
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
        </button>

        <button
          onClick={() => navigate('/', { replace: true })}
          className="w-full py-4 text-text-muted font-black uppercase tracking-widest text-[9px] hover:text-accent transition-colors border border-transparent hover:border-accent/10 rounded-2xl"
        >
          Return to Marketplace
        </button>
      </div>

      <div className="mt-auto pt-12 pb-6 text-center">
        <p className="text-[8px] text-text-muted font-black uppercase tracking-[0.4em] italic opacity-60">
          VexoKart Logistics Protocol v5.0 • Secure Node
        </p>
      </div>
    </div>
  );
};

export default OrderSuccessPage;