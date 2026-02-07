

import React, { useState, useEffect } from 'react';
import { useVendors } from '../../context/VendorContext';
import { useProducts } from '../../hooks/useProducts';
import { useOrders } from '../../context/OrderContext';
import GlassmorphicCard from '../../components/GlassmorphicCard';
// Fix: Import newly defined Vendor type
import { Vendor } from '../../types';
import { SearchIcon } from '../../components/icons/SearchIcon';
import Toast from '../../components/Toast';

const AdminVendorsPage: React.FC = () => {
  const { vendors, updateVendorStatus, refreshVendors } = useVendors();
  const { products } = useProducts();
  const { orders } = useOrders();
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState({ show: false, message: '' });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshVendors();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  useEffect(() => { handleRefresh(); }, []);

  const filteredVendors = vendors.filter(v =>
    v.store_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.user_id.toString().includes(searchTerm)
  );

  const getVendorMetrics = (vendorId: string) => {
      const vProds = products.filter(p => String(p.vendor_id) === String(vendorId));
      const vOrders = orders.filter(o => o.vendor_id === vendorId && o.status !== 'Cancelled');
      const totalRev = vOrders.reduce((sum, o) => sum + (o.total || 0), 0);
      return { products: vProds.length, orders: vOrders.length, revenue: totalRev };
  };

  return (
    <div className="space-y-8 pb-20">
      <Toast isVisible={toast.show} message={toast.message} onClose={() => setToast({ ...toast, show: false })} />
      
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-gray-900 italic uppercase tracking-tighter leading-none">Vendor<br/><span className="text-accent">Master</span></h1>
          <p className="text-gray-400 font-bold text-sm mt-2">Managing {vendors.length} authorized marketplace nodes.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Filter by Store Name or UID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-50 border border-gray-100 rounded-2xl p-3 pl-10 transition w-80 text-xs font-bold uppercase tracking-widest placeholder:text-gray-300 focus:bg-white outline-none"
            />
            <SearchIcon className="absolute left-3 top-3 w-4 h-4 text-gray-300" />
          </div>
          <button 
            onClick={handleRefresh} 
            className={`p-3 bg-gray-50 border border-gray-100 rounded-2xl text-gray-400 hover:text-accent transition-all ${isRefreshing ? 'animate-spin' : ''}`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h5M20 20v-5h-5M22 3A10.03 10.03 0 0112 20a9.93 9.93 0 01-7-3m7 5a10 10 0 01-10-10 9.93 9.93 0 013-7" /></svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filteredVendors.map(vendor => {
          const metrics = getVendorMetrics(String(vendor.id));
          const isPending = vendor.status === 'pending';
          const isApproved = vendor.status === 'approved';

          return (
            <div key={vendor.id} className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.01)] hover:shadow-[0_20px_50px_rgb(0,0,0,0.03)] transition-all flex flex-wrap lg:flex-nowrap items-center gap-10">
              <div className="flex items-center gap-6 shrink-0">
                  <div className="relative">
                    <img 
                        src={vendor.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(vendor.store_name)}&background=F8F9FA&color=1A1A1A&font-size=0.35&bold=true`} 
                        className="w-20 h-20 rounded-3xl object-cover bg-gray-50 border border-gray-100 shadow-sm"
                        alt=""
                    />
                    <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-white flex items-center justify-center ${isApproved ? 'bg-green-500' : 'bg-yellow-500 shadow-lg animate-pulse'}`}>
                        {isApproved ? (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>
                        ) : (
                            <span className="text-[10px] text-white font-black italic">!</span>
                        )}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900 italic tracking-tighter uppercase leading-none">{vendor.store_name}</h3>
                    <p className="text-[10px] font-black text-accent uppercase tracking-widest mt-2">UID: DCH-VND-{vendor.id}</p>
                    <p className="text-[9px] font-bold text-gray-400 mt-1 uppercase">Merchant: {vendor.owner_name}</p>
                  </div>
              </div>

              <div className="flex-grow grid grid-cols-3 gap-6 border-x border-gray-50 px-10">
                  <div>
                     <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Catalog Size</p>
                     <p className="text-xl font-black text-gray-900 italic">{metrics.products} Items</p>
                  </div>
                  <div>
                     <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Bookings</p>
                     <p className="text-xl font-black text-gray-900 italic">{metrics.orders} Orders</p>
                  </div>
                  <div>
                     <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Gross Yield</p>
                     <p className="text-xl font-black text-green-600 italic">₹{metrics.revenue.toLocaleString()}</p>
                  </div>
              </div>

              <div className="shrink-0 flex gap-2">
                  {isPending ? (
                      <>
                        <button 
                            onClick={() => updateVendorStatus(vendor.id, 'approved')}
                            className="bg-black text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-black/10 active:scale-95 transition-all"
                        >Authorize Partner</button>
                        <button 
                            onClick={() => updateVendorStatus(vendor.id, 'rejected')}
                            className="bg-red-50 text-red-500 border border-red-100 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all"
                        >Reject</button>
                      </>
                  ) : (
                      <>
                        <button className="bg-gray-50 border border-gray-100 text-gray-900 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm active:scale-95 transition-all">Audit</button>
                        <button 
                            onClick={() => updateVendorStatus(vendor.id, vendor.status === 'suspended' ? 'approved' : 'suspended')}
                            className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all border ${
                                vendor.status === 'suspended' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'
                            }`}
                        >
                            {vendor.status === 'suspended' ? 'Resume Node' : 'Suspend Access'}
                        </button>
                      </>
                  )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminVendorsPage;
