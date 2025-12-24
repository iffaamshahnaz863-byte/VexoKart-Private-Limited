
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProducts } from '../../hooks/useProducts';
import { CATEGORIES } from '../../constants';
import GlassmorphicCard from '../../components/GlassmorphicCard';
import { Product } from '../../types';

const AdminProductFormPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { getProduct, addProduct, updateProduct } = useProducts();
  
  const isEditing = id !== undefined;
  
  const [formData, setFormData] = useState<Omit<Product, 'id' | 'reviews' | 'rating' | 'reviewCount'>>({
    name: '',
    category: CATEGORIES[0]?.name || '',
    price: 0,
    originalPrice: 0,
    images: [],
    description: '',
    features: [],
  });

  useEffect(() => {
    if (isEditing) {
      const productToEdit = getProduct(parseInt(id));
      if (productToEdit) {
        setFormData({
            name: productToEdit.name,
            category: productToEdit.category,
            price: productToEdit.price,
            originalPrice: productToEdit.originalPrice,
            images: productToEdit.images,
            description: productToEdit.description,
            features: productToEdit.features,
        });
      }
    }
  }, [id, isEditing, getProduct]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'price' || name === 'originalPrice' ? parseFloat(value) || 0 : value }));
  };

  const handleArrayChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'images' | 'features') => {
      setFormData(prev => ({...prev, [field]: e.target.value.split(',').map(s => s.trim())}));
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const productData = {
        ...formData,
        rating: isEditing ? getProduct(parseInt(id))?.rating || 4.5 : 4.5,
        reviewCount: isEditing ? getProduct(parseInt(id))?.reviewCount || 0 : 0,
        reviews: isEditing ? getProduct(parseInt(id))?.reviews || [] : [],
    };
    if (isEditing) {
      updateProduct({ ...productData, id: parseInt(id) });
    } else {
      addProduct(productData);
    }
    navigate('/admin/products');
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">{isEditing ? 'Edit Product' : 'Add New Product'}</h1>
      <GlassmorphicCard className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className="block text-sm font-medium text-gray-300">Name</label><input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full mt-1 input-style" /></div>
            <div><label className="block text-sm font-medium text-gray-300">Category</label><select name="category" value={formData.category} onChange={handleChange} className="w-full mt-1 input-style">{CATEGORIES.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}</select></div>
            <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-300">Price</label><input type="number" name="price" value={formData.price} onChange={handleChange} required className="w-full mt-1 input-style" /></div>
                <div><label className="block text-sm font-medium text-gray-300">Original Price (Optional)</label><input type="number" name="originalPrice" value={formData.originalPrice} onChange={handleChange} className="w-full mt-1 input-style" /></div>
            </div>
            <div><label className="block text-sm font-medium text-gray-300">Description</label><textarea name="description" value={formData.description} onChange={handleChange} required rows={4} className="w-full mt-1 input-style"></textarea></div>
            <div><label className="block text-sm font-medium text-gray-300">Images (comma-separated URLs)</label><input type="text" name="images" value={formData.images.join(', ')} onChange={(e) => handleArrayChange(e, 'images')} className="w-full mt-1 input-style" /></div>
            <div><label className="block text-sm font-medium text-gray-300">Features (comma-separated)</label><input type="text" name="features" value={formData.features.join(', ')} onChange={(e) => handleArrayChange(e, 'features')} className="w-full mt-1 input-style" /></div>
            <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={() => navigate('/admin/products')} className="bg-gray-600/50 text-white font-bold py-2 px-4 rounded-lg">Cancel</button>
                <button type="submit" className="bg-purple-600 text-white font-bold py-2 px-4 rounded-lg">{isEditing ? 'Update Product' : 'Create Product'}</button>
            </div>
        </form>
      </GlassmorphicCard>
       <style>{`
          .input-style {
            background-color: #2d3748;
            color: white;
            border: 1px solid #4a5568;
            border-radius: 0.5rem;
            padding: 0.75rem;
            transition: border-color 0.2s;
          }
          .input-style:focus {
            outline: none;
            border-color: #8B5CF6;
            box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.5);
          }
        `}</style>
    </div>
  );
};

export default AdminProductFormPage;
