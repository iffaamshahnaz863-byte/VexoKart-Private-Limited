
import React, { useState } from 'react';
// Changed import from context file to the dedicated hook file
import { useProducts } from '../../hooks/useProducts';
import { useAuth } from '../../context/AuthContext';
import GlassmorphicCard from '../../components/GlassmorphicCard';

const AdminApprovalsPage: React.FC = () => {
  const { products, updateProduct, toggleProductStatus } = useProducts();
  const { user } = useAuth();
  const [filter, setFilter] = useState<'pending' | 'rejected' | 'all'>('pending');
  const [processingId, setProcessingId] = useState<number | null>(null);

  const filteredProducts = products.filter(p => {
    if (filter === 'pending') return p.status === 'pending';
    if (filter === 'rejected') return p.status === 'rejected';
    return true;
  }).reverse();

  const handleApprove = async (p: any) => {
    if (processingId) return;
    if (window.confirm("Approve this product for the marketplace? It will immediately go live for customers.")) {
      setProcessingId(p.id);
      try {
        await updateProduct({ ...p, status: 'approved' });
      } catch (err) {
        console.error(`Failed to approve product ${p.id}`, err);
        alert("Failed to approve product.");
      } finally {
        setProcessingId(null);
      }
    }
  };

  const handleReject = async (p: any) => {
    if (processingId) return;
    const reason = window.prompt("Please provide a reason for rejecting this product. This will be visible to the vendor:");
    
    if (reason && reason.trim()) {
      setProcessingId(p.id);
      try {
        await updateProduct({ ...p, status: 'rejected', rejection_reason: reason.trim() } as any);
      } catch (err) {
        console.error(`Failed to reject product ${p.id}`, err);
        alert("Failed to reject product.");
      } finally {
        setProcessingId(null);
      }
    }
  };

  const handleDisable = async (id: number) => {
    if (processingId) return;
    if (window.confirm("Disable this product? It will be hidden from the marketplace but not deleted.")) {
      setProcessingId(id);
      try {
        await toggleProductStatus(id);
      } finally {
        setProcessingId(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-text-main italic tracking-tight">Product Approvals</h1>
          <p className="text-text-muted mt-1 text-sm">Review vendor submissions and manage live inventory.</p>
        </div>
        <div className="flex bg-surface p-1 rounded-xl border border-border">
          {(['pending', 'rejected', 'all'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              disabled={!!processingId}
              className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'text-text-muted hover:text-text-secondary disabled:opacity-50'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <GlassmorphicCard>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-text-muted font-black uppercase text-[10px] tracking-widest">
                <th className="p-6">Product Info</th>
                <th className="p-6">Pricing</th>
                <th className="p-6">Category</th>
                <th className="p-6">Status</th>
                <th className="p-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredProducts.map(p => {
                const isProcessing = processingId === p.id;

                return (
                  <tr key={p.id} className={`transition-colors ${isProcessing ? 'bg-accent/5' : 'hover:bg-white/[0.02]'}`}>
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <img src={p.images[0]} alt={p.name} className="w-14 h-14 rounded-xl object-cover bg-surface border border-border shadow-sm" />
                          {isProcessing && (
                            <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center">
                                <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-text-main font-bold truncate max-w-[220px]">{p.name}</p>
                          <p className="text-[10px] text-text-muted font-mono mt-0.5 tracking-tighter">SKU: #{p.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <p className="font-black text-accent">₹{p.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                      {p.original_price && (
                        <p className="text-[10px] text-text-muted line-through">₹{p.original_price.toLocaleString('en-IN')}</p>
                      )}
                    </td>
                    <td className="p-6">
                      <span className="bg-surface border border-border px-2 py-1 rounded-md text-[10px] uppercase font-black text-text-muted whitespace-nowrap">{p.category}</span>
                    </td>
                    <td className="p-6">
                      <div className="flex flex-col gap-1">
                        <span className={`px-2 py-1 rounded-md text-[10px] uppercase font-black tracking-widest text-center border ${
                          p.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 
                          p.status === 'approved' || p.status === 'live' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                          p.status === 'disabled' ? 'bg-gray-500/10 text-text-muted border-border' :
                          'bg-red-500/10 text-red-500 border-red-500/20'
                        }`}>
                          {p.status}
                        </span>
                        {p.status === 'rejected' && (p as any).rejection_reason && (
                          <p className="text-[10px] text-red-400 mt-1 max-w-[150px] italic leading-tight">"{(p as any).rejection_reason}"</p>
                        )}
                      </div>
                    </td>
                    <td className="p-6 space-x-2 whitespace-nowrap">
                      {p.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => handleApprove(p)} 
                            disabled={!!processingId}
                            className="bg-green-500/10 text-green-500 px-3 py-2 rounded-lg text-[10px] font-black uppercase hover:bg-green-500 hover:text-white transition-all shadow-sm disabled:opacity-50"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => handleReject(p)} 
                            disabled={!!processingId}
                            className="bg-red-500/10 text-red-500 px-3 py-2 rounded-lg text-[10px] font-black uppercase hover:bg-red-500 hover:text-white transition-all shadow-sm disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {(p.status === 'approved' || p.status === 'live') && (
                        <button 
                          onClick={() => handleDisable(p.id)} 
                          disabled={!!processingId}
                          className="bg-gray-500/10 text-text-muted border border-border px-3 py-2 rounded-lg text-[10px] font-black uppercase hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 transition-all disabled:opacity-50"
                        >
                          Disable Listing
                        </button>
                      )}
                      {(p.status === 'disabled' || p.status === 'rejected') && (
                        <button 
                          onClick={() => handleApprove(p)} 
                          disabled={!!processingId}
                          className="bg-accent/10 text-accent border border-accent/20 px-3 py-2 rounded-lg text-[10px] font-black uppercase hover:bg-accent hover:text-white transition-all disabled:opacity-50"
                        >
                          Review & Approve
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredProducts.length === 0 && (
            <div className="p-24 text-center">
              <div className="bg-surface w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border border-border shadow-inner">
                <svg className="w-10 h-10 text-text-muted/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-text-main font-black italic text-lg tracking-tight">All Caught Up!</h3>
              <p className="text-text-muted text-sm mt-1 mb-6">No products found matching the <strong>{filter}</strong> filter.</p>
              <button 
                onClick={() => setFilter('all')}
                className="text-accent text-[10px] font-black uppercase tracking-widest hover:underline"
              >
                View All Inventory
              </button>
            </div>
          )}
        </div>
      </GlassmorphicCard>
    </div>
  );
};

export default AdminApprovalsPage;
