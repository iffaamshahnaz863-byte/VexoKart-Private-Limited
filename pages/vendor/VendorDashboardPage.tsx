import React, { useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import GlassmorphicCard from '../../components/GlassmorphicCard';
import { useProducts } from '../../hooks/useProducts';
import { useOrders } from '../../context/OrderContext';
import { useVendors } from '../../context/VendorContext';

const VendorDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { products = [] } = useProducts();
  const { orders = [], isLoading: ordersLoading } = useOrders();
  const { getVendorByUserId } = useVendors();

  const safeOrders = Array.isArray(orders) ? orders : [];
  const safeProducts = Array.isArray(products) ? products : [];

  const currentVendor = useMemo(() => user ? getVendorByUserId(user.id.toString()) : null, [user, getVendorByUserId]);

  const vendorProducts = useMemo(() => 
    currentVendor ? safeProducts.filter(p => p.vendorId === currentVendor.id.toString()) : []
  , [currentVendor, safeProducts]);
  
  const vendorOrders = useMemo(() => 
    currentVendor ? safeOrders.filter(order => 
        order.items && order.items.some(item => 
            item.vendorId === currentVendor.id.toString() ||
            item.vendorId === user?.email
        )
    ) : []
  , [currentVendor, safeOrders, user?.email]);
  
  const totalRevenue = useMemo(() => 
    vendorOrders.reduce((total, order) => {
        const vendorItemsTotal = order.items
            .filter(item => item.vendorId === currentVendor?.id.toString() || item.vendorId === user?.email)
            .reduce((sum, item) => sum + (item.price * item.quantity), 0);
        return total + vendorItemsTotal;
    }, 0)
  , [vendorOrders, currentVendor, user?.email]);

  const pendingOrders = vendorOrders.filter(o => ['Placed', 'Confirmed', 'Packed'].includes(o.status)).length;

  if (ordersLoading) {
    return <div className="p-20 text-center text-text-muted font-bold animate-pulse">Calculating stats...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-text-main italic tracking-tight uppercase">Dashboard</h1>
        <p className="text-text-muted mt-1">Welcome back, <span className="text-text-main font-bold">{user?.name}</span>. Here is your store overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlassmorphicCard className="p-6">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-text-muted">Live Inventory</h3>
              <p className="text-4xl font-black text-text-main italic tracking-tighter mt-2">{vendorProducts.length}</p>
          </GlassmorphicCard>
          <GlassmorphicCard className="p-6">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-text-muted">Pending Fulfillments</h3>
              <p className="text-4xl font-black text-accent italic tracking-tighter mt-2">{pendingOrders}</p>
          </GlassmorphicCard>
            <GlassmorphicCard className="p-6 border-green-500/20">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-text-muted">Total Store Value</h3>
              <p className="text-4xl font-black text-green-600 italic tracking-tighter mt-2">₹{totalRevenue.toLocaleString()}</p>
          </GlassmorphicCard>
      </div>

      <div className="mt-10">
        <h2 className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-4 ml-1">Fulfillment Activity</h2>
        <GlassmorphicCard className="p-10 flex flex-col items-center justify-center text-center">
            {vendorOrders.length > 0 ? (
                <div className="space-y-4">
                    <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto">
                        <svg className="w-8 h-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                    </div>
                    <p className="text-text-main font-bold italic">You have {vendorOrders.length} total orders recorded.</p>
                    <p className="text-text-muted text-xs">Visit the Orders section to process shipments and generate labels.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mx-auto">
                        <svg className="w-8 h-8 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                    </div>
                    <p className="text-text-muted font-bold italic">No orders yet.</p>
                </div>
            )}
        </GlassmorphicCard>
      </div>
    </div>
  );
};

export default VendorDashboardPage;