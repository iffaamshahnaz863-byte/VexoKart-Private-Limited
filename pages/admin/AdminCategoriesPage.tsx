
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCategories } from '../../hooks/useCategories';
import GlassmorphicCard from '../../components/GlassmorphicCard';

const AdminCategoriesPage: React.FC = () => {
  const { categories, deleteCategory } = useCategories();
  const navigate = useNavigate();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-text-main">Manage Categories</h1>
        <button onClick={() => navigate('/admin/categories/new')} className="bg-accent text-white font-bold py-2 px-4 rounded-lg hover:brightness-110 transform hover:scale-105">
          Add Category
        </button>
      </div>

      <GlassmorphicCard>
        <div className="overflow-x-auto">
            <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="p-4">ID</th>
                <th className="p-4">Image</th>
                <th className="p-4">Name</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(category => (
                <tr key={category.id} className="border-b border-gray-800 hover:bg-surface/50">
                  <td className="p-4">{category.id}</td>
                   <td className="p-4">
                        <img src={category.image} alt={category.name} className="w-12 h-12 object-cover rounded-md bg-gray-700" />
                   </td>
                  <td className="p-4 text-text-main font-semibold">{category.name}</td>
                  <td className="p-4 space-x-2">
                    <button onClick={() => navigate(`/admin/categories/edit/${category.id}`)} className="text-accent font-semibold py-1 px-3 rounded-md hover:bg-accent/20">Edit</button>
                    <button onClick={() => deleteCategory(category.id)} className="text-red-400 font-semibold py-1 px-3 rounded-md hover:bg-red-500/20">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
           {categories.length === 0 && <p className="text-center p-8 text-text-muted">No categories found.</p>}
        </div>
      </GlassmorphicCard>
    </div>
  );
};

export default AdminCategoriesPage;