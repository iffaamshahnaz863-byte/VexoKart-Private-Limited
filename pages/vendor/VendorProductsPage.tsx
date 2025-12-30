import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../../hooks/useProducts';
import GlassmorphicCard from '../../components/GlassmorphicCard';
import { useVendors } from '../../context/VendorContext';
import { Product } from '../../types';

const getStatusPill = (status: Product['status']) => {
    switch(status) {
        case 'approved': case 'live': return 'text-green-400 bg-green-900/50 border-green-600/50';
        case 'disabled': return 'text-gray-400 bg-gray-700/50 border-gray-600/50';
        case 'pending': return 'text-yellow-400 bg-yellow-900/50 border-yellow-600/50';
        default: return 'text-text-muted bg-surface border-border';
    }
}

const VendorProductsPage: React.FC = () => {
  const { currentVendor } = useVendors();
  const { products, isLoading, deleteProduct } = useProducts();
  const navigate = useNavigate();
  
  // CRITICAL FIX: Filtering by normalized vendor_id column
  const vendorProducts = currentVendor 
    ? products.filter(p => p.vendor_id === currentVendor.id.toString()).reverse() 
    : [];

  if (isLoading && vendorProducts.length === 0) {
    return (
        <div className="p-20 text-center">
            <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-text-muted font-bold text-[10px] uppercase">Loading your catalog...</p>
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-text-main italic tracking-tight uppercase">My Products</h1>
          <p className="text-text-muted mt-1 text-sm">Manage your storefront catalog.</p>
        </div>
        <button onClick={() => navigate('/vendor/products/new')} className="bg-accent text-white font-black uppercase tracking-widest text-[10px] py-3 px-6 rounded-xl shadow-xl shadow-accent/30 hover:-translate-y-1 active:translate-y-0 transition-all">
          Add New Product
        </button>
      </div>

      <GlassmorphicCard>
        <div className="overflow-x-auto">
            <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border text-[10px] uppercase font-black tracking-widest text-text-muted">
                <th className="p-6 font-semibold">Product Identity</th>
                <th className="p-6 font-semibold">Category</th>
                <th className="p-6 font-semibold">Pricing</th>
                <th className="p-6 font-semibold">Inventory</th>
                <th className="p-6 font-semibold">Fulfillment</th>
                <th className="p-6 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {vendorProducts.map(product => (
                <tr key={product.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                        <img src={product.images[0]} className="w-12 h-12 rounded-xl object-cover bg-surface border border-border shadow-sm" />
                        <div>
                            <span className="text-text-main font-bold truncate max-w-[150px] block">{product.name}</span>
                            <span className="text-[10px] font-mono text-text-muted">SKU: #{product.id}</span>
                        </div>
                    </div>
                  </td>
                  <td className="p-6"><span className="text-[10px] text-text-secondary bg-surface border border-border px-2 py-1 rounded-lg font-black uppercase tracking-widest">{product.category}</span></td>
                  <td className="p-6 font-black text-accent italic">₹{product.price.toLocaleString()}</td>
                  <td className="p-6 text-sm font-bold text-text-secondary">{product.stock} Units</td>
                  <td className="p-6">
                     <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border ${getStatusPill(product.status)}`}>
                        {product.status}
                    </span>
                  </td>
                  <td className="p-6 text-right space-x-2 whitespace-nowrap">
                    <button onClick={() => navigate(`/vendor/products/edit/${product.id}`)} className="text-accent text-[10px] font-black uppercase hover:underline">Edit</button>
                    <button onClick={() => { if(window.confirm('Delete this listing?')) deleteProduct(product.id); }} className="text-red-400 text-[10px] font-black uppercase hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
           {vendorProducts.length === 0 && !isLoading && (
             <div className="p-24 text-center">
                <div className="bg-surface w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                </div>
                <p className="text-text-muted font-bold tracking-tight italic">No products added yet.</p>
                <button onClick={() => navigate('/vendor/products/new')} className="text-accent text-[10px] font-black uppercase tracking-widest mt-6 bg-accent/5 px-6 py-3 rounded-xl border border-accent/20 hover:bg-accent hover:text-white transition-all">Publish your first product</button>
             </div>
           )}
        </div>
      </GlassmorphicCard>
    </div>
  );
};

export default VendorProductsPage;