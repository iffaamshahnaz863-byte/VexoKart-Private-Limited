
import React, { useState, useEffect } from 'react';
import { useVendors } from '../../context/VendorContext';
import GlassmorphicCard from '../../components/GlassmorphicCard';
import { Vendor } from '../../types';
import { SearchIcon } from '../../components/icons/SearchIcon';
import Toast from '../../components/Toast';

const getStatusPill = (status: Vendor['status']) => {
    switch(status) {
        case 'approved': return 'text-green-400 bg-green-900/50 border-green-600/50';
        case 'pending': return 'text-yellow-400 bg-yellow-900/50 border-yellow-600/50';
        case 'rejected': return 'text-red-400 bg-red-900/50 border-red-600/50';
        case 'suspended': return 'text-gray-400 bg-gray-700/50 border-gray-600/50';
        default: return '';
    }
}

const AdminVendorsPage: React.FC = () => {
  const { vendors, updateVendorStatus, refreshVendors } = useVendors();
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState({ show: false, message: '' });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
        await refreshVendors();
    } finally {
        setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  // Ensure fresh data on navigation
  useEffect(() => {
    handleRefresh();
  }, []);

  const showToast = (message: string) => {
    setToast({ show: true, message });
  };

  const filteredVendors = vendors.filter(vendor =>
    vendor.store_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUpdate = async (id: number, status: Vendor['status']) => {
      try {
          let reason = undefined;
          if (status === 'rejected') {
              const r = window.prompt("Reason for rejection:");
              if (!r) return;
              reason = r;
          }
          await updateVendorStatus(id, status, reason);
          await refreshVendors(); // Real-time sync after update
          showToast(`Vendor ${status} successfully!`);
      } catch (err: any) {
          showToast(err.message || "Failed to update status");
      }
  };
  
  return (
    <div className="space-y-6">
      <Toast isVisible={toast.show} message={toast.message} onClose={() => setToast({ ...toast, show: false })} />
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-black text-text-main italic tracking-tight uppercase">Vendor Management</h1>
          <p className="text-text-muted text-xs font-bold uppercase tracking-widest mt-1">Total Partnerships: {vendors.length}</p>
        </div>
         <div className="flex items-center gap-3">
          <button 
            onClick={handleRefresh} 
            disabled={isRefreshing}
            className="p-2 bg-surface border border-border text-text-secondary rounded-lg hover:text-accent transition-all disabled:opacity-50"
            title="Force Sync from DB"
          >
            <svg className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5M22 3A10.03 10.03 0 0112 20a9.93 9.93 0 01-7-3m7 5a10 10 0 01-10-10 9.93 9.93 0 013-7" />
            </svg>
          </button>
          <div className="relative">
            <input
              type="text"
              placeholder="Search stores or emails..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-surface/70 text-text-main placeholder-text-muted border border-gray-700 focus:border-accent focus:ring-accent rounded-lg p-2 pl-10 transition w-64"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-text-muted" />
            </div>
          </div>
        </div>
      </div>
      <GlassmorphicCard>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-700 text-text-muted text-[10px] uppercase font-black tracking-widest">
                <th className="p-4 font-semibold">Business Info</th>
                <th className="p-4 font-semibold">Owner / Contact</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Registered</th>
                <th className="p-4 font-semibold text-right">Fulfillment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredVendors.map(vendor => (
                <tr key={vendor.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-4">
                     <div className="flex items-center gap-3">
                      <img 
                        src={vendor.profile_image} 
                        alt={vendor.store_name}
                        className="w-10 h-10 rounded-xl object-cover bg-background border border-white/10"
                      />
                      <div>
                        <p className="text-text-main font-bold italic uppercase tracking-tight">{vendor.store_name}</p>
                        <p className="text-[10px] text-text-muted font-mono">UID: {vendor.user_id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                      <p className="text-text-main font-semibold text-xs">{vendor.owner_name}</p>
                      <p className="text-[10px] text-text-muted font-bold mt-0.5">{vendor.email}</p>
                      <p className="text-[9px] text-accent mt-0.5">{vendor.phone}</p>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border ${getStatusPill(vendor.status)}`}>
                      {vendor.status}
                    </span>
                  </td>
                  <td className="p-4 text-[10px] font-bold text-text-secondary">{new Date(vendor.created_at).toLocaleDateString()}</td>
                  <td className="p-4 text-right space-x-1 whitespace-nowrap">
                    {vendor.status === 'pending' && (
                        <>
                            <button onClick={() => handleUpdate(vendor.id, 'approved')} className="bg-green-500/10 text-green-500 text-[10px] font-black uppercase px-3 py-1.5 rounded-lg hover:bg-green-500 hover:text-white transition-all">Approve</button>
                            <button onClick={() => handleUpdate(vendor.id, 'rejected')} className="bg-red-500/10 text-red-500 text-[10px] font-black uppercase px-3 py-1.5 rounded-lg hover:bg-red-500 hover:text-white transition-all">Reject</button>
                        </>
                    )}
                    {(vendor.status === 'approved' || vendor.status === 'rejected') && (
                         <button onClick={() => handleUpdate(vendor.id, 'suspended')} className="text-text-muted border border-border text-[10px] font-black uppercase px-3 py-1.5 rounded-lg hover:bg-red-500 hover:text-white hover:border-red-500 transition-all">Suspend</button>
                    )}
                     {vendor.status === 'suspended' && (
                         <button onClick={() => handleUpdate(vendor.id, 'approved')} className="bg-accent text-white text-[10px] font-black uppercase px-3 py-1.5 rounded-lg shadow-lg shadow-accent/20 transition-all">Re-activate</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredVendors.length === 0 && (
            <div className="p-20 text-center">
                <p className="text-text-muted font-bold italic">
                    {searchTerm ? `No vendor records match "${searchTerm}".` : 'No vendor partnerships found.'}
                </p>
            </div>
          )}
        </div>
      </GlassmorphicCard>
    </div>
  );
};

export default AdminVendorsPage;
