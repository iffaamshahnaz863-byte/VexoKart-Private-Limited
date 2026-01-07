import React, { useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GlassmorphicCard from '../../components/GlassmorphicCard';
import { useProducts } from '../../hooks/useProducts';
import { useOrders } from '../../context/OrderContext';
import { useVendors } from '../../context/VendorContext';
import { useAuth } from '../../context/AuthContext';

const VendorDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { products = [], refreshProducts } = useProducts();
  const { orders = [], refreshOrders } = useOrders();
  const { currentVendor, fetchCurrentVendor, isVendorLoading } = useVendors();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.id) {
        fetchCurrentVendor(user.id.toString());
        refreshOrders();
        refreshProducts();
    }
  }, [user?.id]);

  const vid = currentVendor ? String(currentVendor.id) : '';

  const vendorProducts = useMemo(() => {
    return products.filter(p => String(p.vendor_id) === vid);
  }, [vid, products]);
  
  const vendorOrders = useMemo(() => {
    return orders.filter(order => 
        order.items && order.items.some((item: any) => String(item.vendor_id) === vid)
    );
  }, [vid, orders]);

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayOrders = vendorOrders.filter(o => o.created_at?.startsWith(today));
    const pending = vendorOrders.filter(o => ['Placed', 'Confirmed', 'Packed'].includes(o.status));
    const delivered = vendorOrders.filter(o => o.status === 'Delivered');
    const cancelled = vendorOrders.filter(o => o.status === 'Cancelled');
    
    const todayRev = todayOrders.reduce((sum, o) => sum + (Number(o.total || 0)), 0);
    const totalRev = vendorOrders.filter(o => o.status !== 'Cancelled').reduce((sum, o) => sum + (Number(o.total || 0)), 0);

    return {
      todayCount: todayOrders.length,
      pendingCount: pending.length,
      deliveredCount: delivered.length,
      cancelledCount: cancelled.length,
      todayRev,
      totalRev,
      balance: currentVendor?.wallet_balance || 0
    };
  }, [vendorOrders, currentVendor]);

  if (isVendorLoading || !currentVendor) {
    return (
        <div className="flex flex-col items-center justify-center p-20 animate-pulse">
            <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-text-muted font-black uppercase tracking-widest text-[10px]">Syncing Vendor Cloud...</p>
        </div>
    );
  }

  const StatCard = ({ label, value, colorClass, onClick, icon }: any) => (
    <div 
      onClick={onClick}
      className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm active:scale-95 transition-all cursor-pointer group"
    >
      <div className="flex justify-between items-start mb-3">
         <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${colorClass.replace('text', 'bg')}/10 ${colorClass}`}>
            {icon}
         </div>
         <svg className="w-4 h-4 text-gray-300 group-hover:text-accent transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
         </svg>
      </div>
      <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-1">{label}</p>
      <p className={`text-2xl font-black italic tracking-tighter leading-none ${colorClass}`}>{value}</p>
    </div>
  );

  return (
    <div className="space-y-6 pb-10">
      <div className="flex justify-between items-center px-1">
        <div>
           <h1 className="text-2xl font-black text-gray-900 italic uppercase leading-none">Market<br/><span className="text-accent">Console</span></h1>
           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Hello, {currentVendor.store_name}</p>
        </div>
        <button 
          onClick={() => navigate('/vendor/products/new')}
          className="bg-[#F43397] text-white p-4 rounded-2xl shadow-lg shadow-[#F43397]/20 flex items-center gap-2 active:scale-95 transition-all"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
          <span className="text-[10px] font-black uppercase tracking-widest">Add Product</span>
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard 
          label="Today Orders" 
          value={stats.todayCount} 
          colorClass="text-blue-500" 
          onClick={() => navigate('/vendor/orders')}
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatCard 
          label="Pending" 
          value={stats.pendingCount} 
          colorClass="text-orange-500" 
          onClick={() => navigate('/vendor/orders')}
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatCard 
          label="Delivered" 
          value={stats.deliveredCount} 
          colorClass="text-green-500" 
          onClick={() => navigate('/vendor/orders')}
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
        />
        <StatCard 
          label="Today Sales" 
          value={`₹${(stats.todayRev || 0).toLocaleString()}`} 
          colorClass="text-[#F43397]" 
          onClick={() => navigate('/vendor/wallet')}
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
        />
        <StatCard 
          label="Wallet Bal" 
          value={`₹${(stats.balance || 0).toLocaleString()}`} 
          colorClass="text-purple-600" 
          onClick={() => navigate('/vendor/wallet')}
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
        />
        <StatCard 
          label="Listings" 
          value={vendorProducts.length} 
          colorClass="text-gray-900" 
          onClick={() => navigate('/vendor/products')}
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>}
        />
      </div>

      <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-premium">
        <h3 className="text-sm font-black uppercase italic text-gray-800 mb-6 flex items-center justify-between">
          Fulfillment Task Hub
          <span className="bg-accent/10 text-accent text-[9px] font-black px-2 py-1 rounded-lg">LIVE FEED</span>
        </h3>
        
        {stats.pendingCount > 0 ? (
          <div className="space-y-4">
             <div className="flex items-center gap-4 bg-orange-50 p-4 rounded-2xl border border-orange-100">
                <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-black text-lg shadow-lg shadow-orange-500/20">!</div>
                <div className="flex-grow">
                   <p className="text-xs font-black text-gray-800 uppercase italic">Pending Action Required</p>
                   <p className="text-[10px] text-gray-500 font-bold uppercase mt-1">You have {stats.pendingCount} orders waiting for shipment manifest.</p>
                </div>
                <button onClick={() => navigate('/vendor/orders')} className="text-orange-600 text-[10px] font-black underline uppercase">Resolve</button>
             </div>
          </div>
        ) : (
          <div className="text-center py-10 opacity-40 grayscale">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <p className="text-[10px] font-black uppercase tracking-widest italic">All Manifests Synced</p>
          </div>
        )}
      </div>

      <div className="pt-4 text-center">
         <p className="text-[8px] font-black uppercase tracking-[0.4em] text-gray-300">VexoKart Merchant Protocol v6.2 • Secure Node</p>
      </div>
    </div>
  );
};

export default VendorDashboardPage;