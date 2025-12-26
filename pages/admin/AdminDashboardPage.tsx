
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import GlassmorphicCard from '../../components/GlassmorphicCard';
import { useProducts } from '../../hooks/useProducts';
import { useOrders } from '../../context/OrderContext';

const AdminDashboardPage: React.FC = () => {
  const { user, users } = useAuth();
  const { products } = useProducts();
  const { orders } = useOrders();

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
      <p className="text-gray-400 mb-8">Welcome back, {user?.name}!</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlassmorphicCard className="p-6">
              <h3 className="text-lg font-semibold text-gray-300">Total Products</h3>
              <p className="text-4xl font-bold text-accent mt-2">{products.length}</p>
          </GlassmorphicCard>
          <GlassmorphicCard className="p-6">
                <h3 className="text-lg font-semibold text-gray-300">Total Orders</h3>
              <p className="text-4xl font-bold text-accent mt-2">{orders.length}</p>
          </GlassmorphicCard>
            <GlassmorphicCard className="p-6">
                <h3 className="text-lg font-semibold text-gray-300">Total Users</h3>
              <p className="text-4xl font-bold text-accent mt-2">{users.length}</p>
          </GlassmorphicCard>
      </div>

      <div className="mt-10">
        <h2 className="text-2xl font-bold text-white mb-4">Recent Activity</h2>
        <GlassmorphicCard className="p-4">
            <p className="text-gray-400">Activity feed coming soon...</p>
        </GlassmorphicCard>
      </div>
    </div>
  );
};

export default AdminDashboardPage;