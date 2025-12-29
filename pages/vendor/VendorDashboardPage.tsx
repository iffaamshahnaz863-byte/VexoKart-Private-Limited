import React, { useMemo, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import GlassmorphicCard from '../../components/GlassmorphicCard';
import { useProducts } from '../../hooks/useProducts';
import { useOrders } from '../../context/OrderContext';
import { useVendors } from '../../context/VendorContext';

const VendorDashboardPage: React.FC = () => {
  const { products = [], refreshProducts } = useProducts();
  const { orders = [], isLoading: ordersLoading, refreshOrders } = useOrders();
  const { currentVendor } = useVendors();

  useEffect(() => {
    refreshOrders();
    refreshProducts();
  }, []);

  const safeOrders = Array.isArray(orders) ? orders : [];
  const safeProducts = Array.isArray(products) ? products : [];

  // Robust filtering using both primary ID and associated User ID to ensure no data is missed
  const vendorProducts = useMemo(() => {
    if (!currentVendor) return [];
    const vid = String(currentVendor.id);
    const uid = String(currentVendor.user_id);
    return safeProducts.filter(p => String(p.vendorId) === vid || String(p.vendorId) === uid);
  }, [currentVendor, safeProducts]);
  
  const vendorOrders = useMemo(() => {
    if (!currentVendor) return [];
    const vid = String(currentVendor.id);
    const uid = String(currentVendor.user_id);
    const vEmail = currentVendor.email?.toLowerCase();

    return safeOrders.filter(order => 
        order.items && order.items.some(item => {
            const itemVid = String(item.vendorId || (item as any).vendor_id || '');
            const itemVEmail = String((item as any).vendor_email || '').toLowerCase();
            return itemVid === vid || itemVid === uid || (vEmail && itemVEmail === vEmail);
        })
    );
  }, [currentVendor, safeOrders]);
  
  const totalRevenue = useMemo(() => {
    if (!currentVendor) return 0;
    const vid = String(currentVendor.id);
    const uid = String(currentVendor.user_id);
    const vEmail = currentVendor.email?.toLowerCase();

    return vendorOrders.reduce((total, order) => {
        if (order.status === 'Cancelled') return total;
        
        // Sum only items that belong to THIS vendor in this order
        const vendorItemsTotal = order.items
            .filter(item => {
                const itemVid = String(item.vendorId || (item as any).vendor_id || '');
                const itemVEmail = String((item as any).vendor_email || '').toLowerCase();
                return itemVid === vid || itemVid === uid || (vEmail && itemVEmail === vEmail);
            })
            .reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);
        return total + vendorItemsTotal;
    }, 0);
  }, [vendorOrders, currentVendor]);

  const pendingOrders = vendorOrders.filter(o => ['Placed', 'Confirmed'].includes(o.status)).length;

  if (!currentVendor) {
    return (
        <div className="flex flex-col items-center justify-center p-20">
            <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-text-muted font-black uppercase tracking-widest text-[10px]">Loading Workspace...</p>
        </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-text-main italic tracking-tight uppercase">Dashboard</h1>
          <p className="text-text-muted mt-1">Marketplace performance for <span className="text-accent font-bold">{currentVendor?.store_name}</span></p>
        </div>
        <div className="bg-surface px-4 py-2 rounded-2xl border border-border">
            <p className="text-[9px] font-black text-text-muted uppercase tracking-widest">Store ID</p>
            <p className="text-xs font-bold text-text-main">#VXK-{currentVendor?.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlassmorphicCard className="p-6 relative overflow-hidden group border-none shadow-premium">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                  <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
              </div>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-text-muted">Live Inventory</h3>
              <p className="text-4xl font-black text-text-main italic tracking-tighter mt-2">{vendorProducts.length}</p>
              <div className="mt-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="text-[9px] font-bold text-text-secondary uppercase">Active Listings</span>
              </div>
          </GlassmorphicCard>

          <GlassmorphicCard className="p-6 relative overflow-hidden group border-none shadow-premium">
               <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform text-accent">
                  <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-text-muted">Pending Actions</h3>
              <p className="text-4xl font-black text-accent italic tracking-tighter mt-2">{pendingOrders}</p>
              <div className="mt-4">
                  <span className="text-[9px] font-bold text-text-secondary uppercase bg-accent/10 px-2 py-1 rounded-lg">Requires Fulfillment</span>
              </div>
          </GlassmorphicCard>

          <GlassmorphicCard className="p-6 border-green-500/10 relative overflow-hidden group border-none shadow-premium">
               <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform text-green-600">
                  <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-text-muted">Total Sales</h3>
              <p className="text-4xl font-black text-green-600 italic tracking-tighter mt-2">₹{totalRevenue.toLocaleString('en-IN')}</p>
              <div className="mt-4">
                  <span className="text-[9px] font-bold text-green-600 uppercase bg-green-50/10 px-2 py-1 rounded-lg">Gross Revenue</span>
              </div>
          </GlassmorphicCard>
      </div>

      <div className="mt-10">
        <h2 className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-4 ml-1">Order Logistics</h2>
        <GlassmorphicCard className="p-10 flex flex-col items-center justify-center text-center bg-white border-none shadow-premium">
            {vendorOrders.length > 0 ? (
                <div className="space-y-6 w-full max-w-lg">
                    <div className="w-20 h-20 bg-accent/10 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                        <svg className="w-10 h-10 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                    </div>
                    <div>
                        <p className="text-text-main font-black italic text-xl uppercase tracking-tight">Recent Activity</p>
                        <p className="text-text-muted text-sm mt-2 leading-relaxed">Your store has processed <span className="text-text-main font-bold">{vendorOrders.length}</span> orders. {pendingOrders > 0 ? `You have ${pendingOrders} orders waiting for shipment labels.` : 'All your orders are current.'}</p>
                    </div>
                    <div className="pt-4 flex justify-center gap-4">
                         <button 
                            onClick={() => window.location.hash = '#/vendor/orders'}
                            className="bg-accent text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-accent/20 hover:-translate-y-1 transition-all"
                         >
                            Manage Orders
                         </button>
                         <button 
                            onClick={() => window.location.hash = '#/vendor/products'}
                            className="bg-surface text-text-main px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-white transition-all border border-border"
                         >
                            Inventory
                         </button>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="w-20 h-20 bg-surface rounded-3xl flex items-center justify-center mx-auto border border-border shadow-inner">
                        <svg className="w-10 h-10 text-text-muted/40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                    </div>
                    <div className="max-w-xs mx-auto">
                        <p className="text-text-main font-black italic uppercase tracking-tight">No Sales Data</p>
                        <p className="text-text-muted text-xs mt-2 leading-relaxed">Your storefront is live and ready to receive customers. Listing more trending products can help drive your first sale.</p>
                    </div>
                    <button 
                        onClick={() => window.location.hash = '#/vendor/products/new'}
                        className="text-accent text-[10px] font-black uppercase tracking-widest mt-6 border-b-2 border-accent pb-1 hover:opacity-70 transition-opacity"
                    >
                        Publish New Listing
                    </button>
                </div>
            )}
        </GlassmorphicCard>
      </div>
    </div>
  );
};

export default VendorDashboardPage;