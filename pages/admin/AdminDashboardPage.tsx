
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import GlassmorphicCard from '../../components/GlassmorphicCard';

const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">Dashboard</h1>
      <GlassmorphicCard className="p-6">
        <h2 className="text-2xl font-semibold text-white">Welcome back, {user?.name}!</h2>
        <p className="text-gray-400 mt-2">Here you can manage products, orders, and users for VexoKart.</p>
      </GlassmorphicCard>
    </div>
  );
};

export default AdminDashboardPage;
