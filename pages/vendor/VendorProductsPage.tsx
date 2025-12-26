
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../../hooks/useProducts';
import GlassmorphicCard from '../../components/GlassmorphicCard';
import { useAuth } from '../../context/AuthContext';
import { useVendors } from '../../context/VendorContext';
import { Product } from '../../types';

const getStatusPill = (status: Product['status']) => {
    switch(status) {
        case 'approved': case 'live': return 'text-green-400 bg-green-900/50 border-green-600/50';
        case 'disabled': return 'text-gray-400 bg-gray-700/50 border-gray-600/50';
        default: return 'text-text-muted bg-surface border-border';
    }
}

const VendorProductsPage: React.FC = () => {
  const { user } = useAuth();
  const { getVendorByUserId } = useVendors();
  const { products, deleteProduct } = useProducts();
  const navigate = useNavigate();
  
  const vendor = user ? getVendorByUserId(user.email) : null;
  const vendorProducts = vendor ? products.filter(p => p.vendorId === vendor.id).reverse() : [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-text-main italic tracking-tight">My Products</h1>
          <p className="text-text-muted mt-1">Manage your storefront catalog. All products go live instantly upon publishing.</p>
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
                <th className="p-6 font-semibold">Name</th>
                <th className="p-6 font-semibold">Category</th>
                <th className="p-6 font-semibold">Price</th>
                <th className="p-6 font-semibold">Stock</th>
                <th className="p-6 font-semibold">Visibility</th>
                <th className="p-6 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {vendorProducts.map(product => (
                <tr key={product.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                        <img src={product.images[0]} className="w-10 h-10 rounded-lg object-cover bg-surface border border-border" />
                        <span className="text-text-main font-bold truncate max-w-[150px]">{product.name}</span>
                    </div>
                  </td>
                  <td className="p-6"><span className="text-xs text-text-secondary bg-surface border border-border px-2 py-0.5 rounded-md font-bold uppercase tracking-tight">{product.category}</span></td>
                  <td className="p-6 font-bold text-accent">₹{product.price.toFixed(2)}</td>
                  <td className="p-6 text-sm font-medium text-text-secondary">{product.stock}</td>
                  <td className="p-6">
                     <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border ${getStatusPill(product.status)}`}>
                        {product.status === 'approved' || product.status === 'live' ? 'Live' : 'Hidden'}
                    </span>
                  </td>
                  <td className="p-6 text-right space-x-2 whitespace-nowrap">
                    <button onClick={() => navigate(`/vendor/products/edit/${product.id}`)} className="text-accent text-[10px] font-black uppercase hover:underline">Edit</button>
                    <button onClick={() => deleteProduct(product.id)} className="text-red-400 text-[10px] font-black uppercase hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
           {vendorProducts.length === 0 && (
             <div className="p-20 text-center">
                <p className="text-text-muted font-bold tracking-tight">You haven't published any products yet.</p>
                <button onClick={() => navigate('/vendor/products/new')} className="text-accent text-xs font-black uppercase tracking-widest mt-4">Publish your first product</button>
             </div>
           )}
        </div>
      </GlassmorphicCard>
    </div>
  );
};

export default VendorProductsPage;
