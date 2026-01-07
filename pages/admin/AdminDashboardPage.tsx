import React, { useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import GlassmorphicCard from '../../components/GlassmorphicCard';
import { useProducts } from '../../hooks/useProducts';
import { useOrders } from '../../context/OrderContext';
import { useVendors } from '../../context/VendorContext';
import { useNavigate } from 'react-router-dom';

const AdminDashboardPage: React.FC = () => {
  const { users = [] } = useAuth();
  const { products = [] } = useProducts();
  const { orders = [] } = useOrders();
  const { vendors = [] } = useVendors();
  const navigate = useNavigate();

  const platformStats = useMemo(() => {
    const totalGMV = orders.filter(o => o.status !== 'Cancelled').reduce((acc, curr) => acc + (curr.total || 0), 0);
    // Fixed 10% commission simulation for the dashboard
    const platformRevenue = totalGMV * 0.10;
    const today = new Date().toISOString().split('T')[0];
    const todayOrders = orders.filter(o => o.created_at?.startsWith(today));
    
    // Vendor Payouts Simulation (Wallet Balances)
    const pendingPayouts = vendors.reduce((acc, v) => acc + (v.wallet_balance || 0), 0);

    return {
      gmv: totalGMV,
      revenue: platformRevenue,
      todayCount: todayOrders.length,
      activeVendors: vendors.filter(v => v.status === 'approved').length,
      activeUsers: users.length,
      payouts: pendingPayouts
    };
  }, [orders, vendors, users]);

  const KPICard = ({ label, value, icon, trend, color, onClick }: any) => (
    <div 
        onClick={onClick}
        className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_20px_50px_rgb(0,0,0,0.05)] transition-all cursor-pointer group relative overflow-hidden"
    >
      <div className={`absolute top-0 right-0 w-24 h-24 -mr-10 -mt-10 rounded-full opacity-5 group-hover:scale-150 transition-transform duration-700 ${color}`}></div>
      <div className="flex justify-between items-start mb-6">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color.replace('bg', 'text')} bg-gray-50 group-hover:bg-white transition-colors`}>
              {icon}
          </div>
          {trend && (
              <span className="text-[10px] font-black text-green-500 bg-green-50 px-2 py-1 rounded-lg uppercase tracking-widest">+12.5%</span>
          )}
      </div>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">{label}</p>
      <h3 className="text-3xl font-black text-gray-900 italic tracking-tighter">{value}</h3>
    </div>
  );

  return (
    <div className="space-y-10 pb-20">
      {/* Header Section */}
      <div className="flex justify-between items-end">
        <div>
           <div className="flex items-center gap-3 mb-1">
             <h1 className="text-4xl font-black text-gray-900 italic uppercase tracking-tighter leading-none">Console<br/><span className="text-accent">Overview</span></h1>
             <span className="px-3 py-1 bg-black text-white rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg shadow-black/10">v6.4 Alpha</span>
           </div>
           <p className="text-gray-400 font-bold text-sm">Real-time marketplace telemetry for VexoKart Owner.</p>
        </div>
        <div className="flex gap-4">
            <button className="bg-gray-50 border border-gray-100 p-3 rounded-2xl text-gray-400 hover:text-gray-900 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </button>
            <button className="bg-accent text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-accent/20 active:scale-95 transition-all">Export Ledger</button>
        </div>
      </div>

      {/* KPI Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <KPICard 
          label="Gross Merchandise Value" 
          value={`₹${platformStats.gmv.toLocaleString()}`} 
          color="bg-blue-500"
          onClick={() => navigate('/admin/analytics')}
          icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
        />
        <KPICard 
          label="Platform Commission (10%)" 
          value={`₹${platformStats.revenue.toLocaleString()}`} 
          color="bg-green-500"
          trend={true}
          onClick={() => navigate('/admin/payouts')}
          icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <KPICard 
          label="Live Payout Liability" 
          value={`₹${platformStats.payouts.toLocaleString()}`} 
          color="bg-purple-500"
          onClick={() => navigate('/admin/payouts')}
          icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>}
        />
        <KPICard 
          label="Fulfilled Today" 
          value={platformStats.todayCount} 
          color="bg-orange-500"
          onClick={() => navigate('/admin/orders')}
          icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>}
        />
        <KPICard 
          label="Partner Network" 
          value={platformStats.activeVendors} 
          color="bg-cyan-500"
          onClick={() => navigate('/admin/vendors')}
          icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
        />
        <KPICard 
          label="Verified Consumers" 
          value={platformStats.activeUsers} 
          color="bg-pink-500"
          onClick={() => navigate('/admin/users')}
          icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Settlement Distribution */}
        <GlassmorphicCard className="p-8 border-none bg-white shadow-premium">
           <div className="flex justify-between items-center mb-10">
              <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 italic">Financial Distribution</h3>
              <div className="flex gap-2">
                 <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-accent"></div><span className="text-[10px] font-black text-gray-400 uppercase">COD</span></div>
                 <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500"></div><span className="text-[10px] font-black text-gray-400 uppercase">UPI</span></div>
              </div>
           </div>
           
           <div className="flex items-center justify-center h-48 relative">
                {/* Visual Chart Placeholder Ring */}
                <div className="w-40 h-40 rounded-full border-[15px] border-accent relative">
                    <div className="absolute inset-[-15px] rounded-full border-[15px] border-blue-500" style={{ clipPath: 'polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 50%)' }}></div>
                </div>
                <div className="absolute flex flex-col items-center">
                    <span className="text-3xl font-black text-gray-900 italic leading-none">64%</span>
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">UPI Adoption</span>
                </div>
           </div>
           
           <div className="mt-10 grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-2xl p-4">
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">COD Settlement</p>
                 <p className="text-xl font-black text-gray-900 italic">₹{(platformStats.gmv * 0.36).toLocaleString()}</p>
              </div>
              <div className="bg-gray-50 rounded-2xl p-4">
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Digital Pre-paid</p>
                 <p className="text-xl font-black text-gray-900 italic">₹{(platformStats.gmv * 0.64).toLocaleString()}</p>
              </div>
           </div>
        </GlassmorphicCard>

        {/* Action Center */}
        <div className="space-y-6">
           <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 italic ml-2">Priority Guard Alerts</h3>
           <div className="space-y-4">
               <div className="bg-orange-50 border border-orange-100 p-6 rounded-[2rem] flex items-center gap-5 group cursor-pointer hover:bg-orange-100 transition-colors">
                  <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-orange-500/20">
                     <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  </div>
                  <div className="flex-grow">
                     <p className="text-xs font-black text-orange-900 uppercase italic">Pending Payout Requests</p>
                     <p className="text-[10px] font-bold text-orange-700/60 uppercase tracking-tight mt-0.5">8 Vendors waiting for bank settlement authorization.</p>
                  </div>
                  <button onClick={() => navigate('/admin/payouts')} className="bg-white text-orange-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm">Review</button>
               </div>

               <div className="bg-blue-50 border border-blue-100 p-6 rounded-[2rem] flex items-center gap-5 group cursor-pointer hover:bg-blue-100 transition-colors">
                  <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-600/20">
                     <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                  </div>
                  <div className="flex-grow">
                     <p className="text-xs font-black text-blue-900 uppercase italic">Inbound Stock Approvals</p>
                     <p className="text-[10px] font-bold text-blue-700/60 uppercase tracking-tight mt-0.5">14 New product listings require marketplace verification.</p>
                  </div>
                  <button onClick={() => navigate('/admin/products')} className="bg-white text-blue-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm">Verify</button>
               </div>
           </div>
        </div>
      </div>

      <div className="pt-10 text-center opacity-30">
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400">VexoKart Secure Fulfillment Protocol v9.2 • Platform Hub</p>
      </div>
    </div>
  );
};

export default AdminDashboardPage;