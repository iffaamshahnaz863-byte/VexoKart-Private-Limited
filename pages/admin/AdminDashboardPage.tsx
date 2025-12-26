
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import GlassmorphicCard from '../../components/GlassmorphicCard';
import { useProducts } from '../../hooks/useProducts';
import { useOrders } from '../../context/OrderContext';
import { OrderStatus } from '../../types';

const AdminDashboardPage: React.FC = () => {
  const { user, users } = useAuth();
  const { products } = useProducts();
  const { orders } = useOrders();

  const getStatusCount = (status: OrderStatus) => orders.filter(o => o.status === status).length;
  
  const statusStats: { label: string; count: number; color: string }[] = [
    { label: 'Processing', count: orders.filter(o => ['Placed', 'Confirmed', 'Packed'].includes(o.status)).length, color: 'text-cyan-400' },
    { label: 'In Transit', count: orders.filter(o => ['Shipped', 'Out for Delivery'].includes(o.status)).length, color: 'text-blue-400' },
    { label: 'Delivered', count: getStatusCount('Delivered'), color: 'text-green-400' },
    { label: 'Cancelled', count: getStatusCount('Cancelled'), color: 'text-red-400' },
  ];

  const totalRevenue = orders
    .filter(o => o.status !== 'Cancelled')
    .reduce((acc, curr) => acc + curr.total, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-text-main italic tracking-tight uppercase">Admin Console</h1>
        <p className="text-text-muted mt-1">Platform overview and high-level performance metrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <GlassmorphicCard className="p-6 border-accent/20">
              <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-1">Gross Revenue</p>
              <p className="text-3xl font-black text-accent italic tracking-tighter">₹{totalRevenue.toLocaleString()}</p>
          </GlassmorphicCard>
          <GlassmorphicCard className="p-6">
              <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-1">Live Inventory</p>
              <p className="text-3xl font-black text-text-main italic tracking-tighter">{products.length}</p>
          </GlassmorphicCard>
          <GlassmorphicCard className="p-6">
              <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-1">Customer Base</p>
              <p className="text-3xl font-black text-text-main italic tracking-tighter">{users.length}</p>
          </GlassmorphicCard>
          <GlassmorphicCard className="p-6">
              <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-1">Total Bookings</p>
              <p className="text-3xl font-black text-text-main italic tracking-tighter">{orders.length}</p>
          </GlassmorphicCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section>
          <h2 className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-4 ml-1">Order Fulfillment Status</h2>
          <div className="grid grid-cols-2 gap-4">
            {statusStats.map(stat => (
              <GlassmorphicCard key={stat.label} className="p-4 bg-surface/40">
                <p className="text-[10px] font-bold text-text-muted uppercase mb-1">{stat.label}</p>
                <div className="flex items-end justify-between">
                  <span className={`text-2xl font-black ${stat.color}`}>{stat.count}</span>
                  <span className="text-[10px] text-text-muted mb-1">{((stat.count / (orders.length || 1)) * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full h-1 bg-white/5 rounded-full mt-3 overflow-hidden">
                  <div 
                    className={`h-full bg-current ${stat.color.replace('text', 'bg')}`} 
                    style={{ width: `${(stat.count / (orders.length || 1)) * 100}%` }}
                  ></div>
                </div>
              </GlassmorphicCard>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-4 ml-1">Platform Activity Feed</h2>
          <GlassmorphicCard className="p-6 h-full min-h-[300px] flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-accent animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <h3 className="text-text-main font-bold italic">Processing Real-time Data</h3>
              <p className="text-text-muted text-xs mt-2 max-w-[250px]">Webhook listener active. Recent transactions will appear here shortly.</p>
          </GlassmorphicCard>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
