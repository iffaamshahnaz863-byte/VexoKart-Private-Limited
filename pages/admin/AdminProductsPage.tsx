
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../../hooks/useProducts';
import GlassmorphicCard from '../../components/GlassmorphicCard';

const AdminProductsPage: React.FC = () => {
  const { products, deleteProduct } = useProducts();
  const navigate = useNavigate();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Manage Products</h1>
        <button onClick={() => navigate('/admin/products/new')} className="bg-purple-600 text-white font-bold py-2 px-4 rounded-lg">
          Add Product
        </button>
      </div>

      <GlassmorphicCard>
        <div className="overflow-x-auto">
            <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="p-4">ID</th>
                <th className="p-4">Name</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id} className="border-b border-gray-800 hover:bg-navy-light/50">
                  <td className="p-4">{product.id}</td>
                  <td className="p-4 text-white font-semibold">{product.name}</td>
                  <td className="p-4">{product.category}</td>
                  <td className="p-4">₹{product.price.toFixed(2)}</td>
                  <td className="p-4">
                    <button onClick={() => navigate(`/admin/products/edit/${product.id}`)} className="text-purple-400 mr-4 font-semibold">Edit</button>
                    <button onClick={() => deleteProduct(product.id)} className="text-red-400 font-semibold">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassmorphicCard>
    </div>
  );
};

export default AdminProductsPage;
