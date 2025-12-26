
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../../hooks/useProducts';
import GlassmorphicCard from '../../components/GlassmorphicCard';
import { useVendors } from '../../context/VendorContext';
import { Product } from '../../types';

const getStatusPill = (status: Product['status']) => {
    switch(status) {
        case 'approved': 
        case 'live': return 'text-green-400 bg-green-900/50 border-green-600/50';
        case 'disabled':
        case 'archived': return 'text-gray-400 bg-gray-700/50 border-gray-600/50';
        default: return 'text-text-muted bg-surface border-border';
    }
}

const AdminProductsPage: React.FC = () => {
  const { products, deleteProduct, toggleProductStatus } = useProducts();
  const { getVendorById } = useVendors();
  const navigate = useNavigate();

  const handleToggle = (id: number, currentStatus: string) => {
    const action = currentStatus === 'approved' ? 'disable' : 'enable';
    if (window.confirm(`Are you sure you want to ${action} this product?`)) {
      toggleProductStatus(id);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-text-main">All Products</h1>
      </div>

      <GlassmorphicCard>
        <div className="overflow-x-auto">
            <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-700 text-sm text-text-muted">
                <th className="p-4 font-semibold">Name</th>
                <th className="p-4 font-semibold">Vendor</th>
                <th className="p-4 font-semibold">Category</th>
                <th className="p-4 font-semibold">Price</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => {
                const vendor = getVendorById(product.vendorId);
                const vendorName = vendor ? vendor.storeName : (product.vendorId === 'vexokart_internal' ? 'VexoKart' : 'Unknown');

                return (
                    <tr key={product.id} className="border-b border-gray-800 hover:bg-surface/50">
                    <td className="p-4 text-text-main font-semibold">{product.name}</td>
                    <td className="p-4 text-sm text-cyan-400">{vendorName}</td>
                    <td className="p-4 text-sm">{product.category}</td>
                    <td className="p-4 text-sm">₹{product.price.toFixed(2)}</td>
                    <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] uppercase font-bold border ${getStatusPill(product.status)}`}>
                            {product.status === 'approved' ? 'Active' : 'Disabled'}
                        </span>
                    </td>
                    <td className="p-4 space-x-2 text-sm">
                        <button onClick={() => navigate(`/admin/products/edit/${product.id}`)} className="text-accent font-semibold py-1 px-3 rounded-md hover:bg-accent/20">Edit</button>
                        <button onClick={() => handleToggle(product.id, product.status)} className="text-text-secondary font-semibold py-1 px-3 rounded-md hover:bg-surface">
                          {product.status === 'approved' ? 'Disable' : 'Enable'}
                        </button>
                        <button onClick={() => deleteProduct(product.id)} className="text-red-400 font-semibold py-1 px-3 rounded-md hover:bg-red-500/20">Delete</button>
                    </td>
                    </tr>
                );
              })}
            </tbody>
          </table>
          {products.length === 0 && (
            <div className="p-10 text-center text-text-muted">No products found.</div>
          )}
        </div>
      </GlassmorphicCard>
    </div>
  );
};

export default AdminProductsPage;
