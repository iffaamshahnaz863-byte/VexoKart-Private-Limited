
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import GlassmorphicCard from '../../components/GlassmorphicCard';
import { useProducts } from '../../hooks/useProducts';
import { useOrders } from '../../context/OrderContext';
import { useVendors } from '../../context/VendorContext';

const VendorDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { products = [] } = useProducts();
  const { orders = [] } = useOrders();
  const { getVendorByUserId } = useVendors();

  const safeOrders = Array.isArray(orders) ? orders : [];
  const safeProducts = Array.isArray(products) ? products : [];

  const vendor = user ? getVendorByUserId(user.email) : null;
  const vendorProducts = vendor ? safeProducts.filter(p => p.vendorId === vendor.id) : [];
  
  const vendorOrders = safeOrders.filter(order => 
    order.items && order.items.some(item => 
        vendorProducts.some(p => p.id === item.id)
    )
  );
  
  const totalRevenue = vendorOrders.reduce((total, order) => {
    const vendorItemsTotal = order.items
        .filter(item => vendorProducts.some(p => p.id === item.id))
        .reduce((sum, item) => sum + (item.price * item.quantity), 0);
    return total + vendorItemsTotal;
  }, 0);

  const pendingOrders = vendorOrders.filter(o => ['Placed', 'Confirmed', 'Packed'].includes(o.status)).length;

  return (
    <div>
      <h1 className="text-3xl font-bold text-text-main mb-2">Dashboard</h1>
      <p className="text-text-muted mb-8">Welcome back, {user?.name}!</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlassmorphicCard className="p-6">
              <h3 className="text-lg font-semibold text-text-secondary">Total Products</h3>
              <p className="text-4xl font-bold text-accent mt-2">{vendorProducts.length}</p>
          </GlassmorphicCard>
          <GlassmorphicCard className="p-6">
                <h3 className="text-lg font-semibold text-text-secondary">Pending Orders</h3>
              <p className="text-4xl font-bold text-accent mt-2">{pendingOrders}</p>
          </GlassmorphicCard>
            <GlassmorphicCard className="p-6">
                <h3 className="text-lg font-semibold text-text-secondary">Total Revenue</h3>
              <p className="text-4xl font-bold text-accent mt-2">₹{totalRevenue.toFixed(2)}</p>
          </GlassmorphicCard>
      </div>

      <div className="mt-10">
        <h2 className="text-2xl font-bold text-text-main mb-4">Recent Orders</h2>
        <GlassmorphicCard className="p-4">
            {vendorOrders.length > 0 ? (
                <p className="text-text-main font-medium">You have {vendorOrders.length} orders total. Visit the Orders page to manage them.</p>
            ) : (
                <p className="text-text-muted">Your recent orders will appear here...</p>
            )}
        </GlassmorphicCard>
      </div>
    </div>
  );
};

export default VendorDashboardPage;
