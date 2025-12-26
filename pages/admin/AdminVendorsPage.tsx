
import React, { useState } from 'react';
import { useVendors } from '../../context/VendorContext';
import GlassmorphicCard from '../../components/GlassmorphicCard';
import { Vendor } from '../../types';
import { SearchIcon } from '../../components/icons/SearchIcon';

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
  const { vendors, updateVendorStatus } = useVendors();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredVendors = vendors.filter(vendor =>
    vendor.storeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.userId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleReject = (vendorId: string) => {
    const reason = window.prompt("Please provide a reason for rejecting this vendor application:");
    if (reason && reason.trim()) {
      updateVendorStatus(vendorId, 'rejected', reason.trim());
    } else if (reason !== null) { // User clicked OK but left it blank
      alert("A reason is required to reject a vendor.");
    }
    // If user clicks cancel, `reason` is null, and we do nothing.
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-text-main">Manage Vendors</h1>
         <div className="relative">
          <input
            type="text"
            placeholder="Search by store or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-surface/70 text-text-main placeholder-text-muted border border-gray-700 focus:border-accent focus:ring-accent rounded-lg p-2 pl-10 transition w-72"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-text-muted" />
          </div>
        </div>
      </div>
      <GlassmorphicCard>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-700 text-text-muted">
                <th className="p-4 font-semibold">Store</th>
                <th className="p-4 font-semibold">User Email</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Joined On</th>
                <th className="p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVendors.map(vendor => (
                <tr key={vendor.id} className="border-b border-gray-800 hover:bg-surface/50">
                  <td className="p-4">
                     <div className="flex items-center gap-3">
                      <img 
                        src={vendor.storeLogo} 
                        alt={vendor.storeName}
                        className="w-10 h-10 rounded-full object-cover bg-background"
                      />
                      <span className="text-text-main font-medium">{vendor.storeName}</span>
                    </div>
                  </td>
                  <td className="p-4">{vendor.userId}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold border ${getStatusPill(vendor.status)}`}>
                      {vendor.status}
                    </span>
                  </td>
                  <td className="p-4">{new Date(vendor.createdAt).toLocaleDateString()}</td>
                  <td className="p-4 space-x-2">
                    {vendor.status === 'pending' && (
                        <>
                            <button onClick={() => updateVendorStatus(vendor.id, 'approved')} className="text-green-400 font-semibold py-1 px-3 rounded-md hover:bg-green-500/20">Approve</button>
                            <button onClick={() => handleReject(vendor.id)} className="text-red-400 font-semibold py-1 px-3 rounded-md hover:bg-red-500/20">Reject</button>
                        </>
                    )}
                    {vendor.status === 'approved' && (
                         <button onClick={() => updateVendorStatus(vendor.id, 'suspended')} className="text-gray-400 font-semibold py-1 px-3 rounded-md hover:bg-gray-500/20">Suspend</button>
                    )}
                     {vendor.status === 'suspended' && (
                         <button onClick={() => updateVendorStatus(vendor.id, 'approved')} className="text-green-400 font-semibold py-1 px-3 rounded-md hover:bg-green-500/20">Re-activate</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredVendors.length === 0 && (
            <p className="text-center p-8 text-text-muted">
                {searchTerm ? `No vendors found for "${searchTerm}".` : 'No vendors have registered yet.'}
            </p>
          )}
        </div>
      </GlassmorphicCard>
    </div>
  );
};

export default AdminVendorsPage;