
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProducts } from '../../hooks/useProducts';
import { useCategories } from '../../hooks/useCategories';
import GlassmorphicCard from '../../components/GlassmorphicCard';
import { Product } from '../../types';

const AdminProductFormPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { getProduct, addProduct, updateProduct } = useProducts();
  const { categories } = useCategories();
  
  const isEditing = id !== undefined;
  
  const [formData, setFormData] = useState<Omit<Product, 'id' | 'reviews' | 'rating' | 'reviewCount'>>({
    name: '',
    category: categories[0]?.name || '',
    price: 0,
    originalPrice: 0,
    images: [],
    description: '',
    highlights: [],
    stock: 10,
    specifications: {},
    sellerInfo: 'VexoKart Direct',
    returnPolicy: '30-Day Money Back Guarantee',
    warranty: '1 Year Standard Warranty',
    videoUrl: ''
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
            highlights: productToEdit.highlights || [],
            stock: productToEdit.stock,
            specifications: productToEdit.specifications || {},
            sellerInfo: productToEdit.sellerInfo,
            returnPolicy: productToEdit.returnPolicy,
            warranty: productToEdit.warranty,
            videoUrl: productToEdit.videoUrl
        });
      }
    } else {
        if (categories.length > 0) {
            setFormData(prev => ({...prev, category: categories[0].name}));
        }
    }
  }, [id, isEditing, getProduct, categories]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: ['price', 'originalPrice', 'stock'].includes(name) ? parseFloat(value) || 0 : value }));
  };

  const handleArrayChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({...prev, [name]: value.split('\n').map(s => s.trim()).filter(Boolean)}));
  }

  const handleSpecChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const specs: { [key: string]: string } = {};
    e.target.value.split('\n').forEach(line => {
      const parts = line.split(':');
      if (parts.length === 2) {
        specs[parts[0].trim()] = parts[1].trim();
      }
    });
    setFormData(prev => ({ ...prev, specifications: specs }));
  };

  const specString = Object.entries(formData.specifications || {}).map(([key, value]) => `${key}: ${value}`).join('\n');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
        Array.from(e.target.files).forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({
                    ...prev,
                    images: [...prev.images, reader.result as string]
                }));
            };
            reader.readAsDataURL(file);
        });
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(formData.images.length === 0) {
        alert("Please upload at least one image for the product.");
        return;
    }
    if (isEditing) {
      const existingProduct = getProduct(parseInt(id));
      const updatedData = { ...existingProduct, ...formData, id: parseInt(id) };
      updateProduct(updatedData);
    } else {
      addProduct(formData);
    }
    navigate('/admin/products');
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">{isEditing ? 'Edit Product' : 'Add New Product'}</h1>
      <GlassmorphicCard className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className="block text-sm font-medium text-gray-300">Name</label><input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full mt-1 input-style" /></div>
            <div><label className="block text-sm font-medium text-gray-300">Category</label><select name="category" value={formData.category} onChange={handleChange} className="w-full mt-1 input-style">{categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}</select></div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div><label className="block text-sm font-medium text-gray-300">Price (₹)</label><input type="number" name="price" value={formData.price} onChange={handleChange} required className="w-full mt-1 input-style" /></div>
                <div><label className="block text-sm font-medium text-gray-300">Original Price (₹)</label><input type="number" name="originalPrice" value={formData.originalPrice} onChange={handleChange} className="w-full mt-1 input-style" /></div>
                 <div><label className="block text-sm font-medium text-gray-300">Stock</label><input type="number" name="stock" value={formData.stock} onChange={handleChange} required className="w-full mt-1 input-style" /></div>
            </div>
            <div><label className="block text-sm font-medium text-gray-300">Description</label><textarea name="description" value={formData.description} onChange={handleChange} required rows={4} className="w-full mt-1 input-style"></textarea></div>
            
            <div>
                <label className="block text-sm font-medium text-gray-300">Images</label>
                <div className="mt-2"><input type="file" id="imageUpload" multiple accept="image/*" onChange={handleImageChange} className="hidden" /><label htmlFor="imageUpload" className="cursor-pointer bg-navy-light text-white font-semibold py-2 px-4 rounded-lg border border-gray-600 hover:bg-gray-700">Choose Files</label></div>
                <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                    {formData.images.map((image, index) => (
                        <div key={index} className="relative"><img src={image} alt={`preview ${index}`} className="w-full h-24 object-cover rounded-lg"/><button type="button" onClick={() => removeImage(index)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">&times;</button></div>
                    ))}
                </div>
            </div>

            <div><label className="block text-sm font-medium text-gray-300">Highlights (one per line)</label><textarea name="highlights" value={formData.highlights?.join('\n')} onChange={handleArrayChange} rows={4} className="w-full mt-1 input-style"></textarea></div>
            <div><label className="block text-sm font-medium text-gray-300">Specifications (format: Key: Value)</label><textarea name="specifications" value={specString} onChange={handleSpecChange} rows={5} className="w-full mt-1 input-style" placeholder="e.g.&#10;Color: Black&#10;Material: Aluminum"></textarea></div>
            <div><label className="block text-sm font-medium text-gray-300">Video URL (optional)</label><input type="url" name="videoUrl" value={formData.videoUrl} onChange={handleChange} className="w-full mt-1 input-style" /></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><label className="block text-sm font-medium text-gray-300">Seller Info</label><input type="text" name="sellerInfo" value={formData.sellerInfo} onChange={handleChange} className="w-full mt-1 input-style" /></div>
              <div><label className="block text-sm font-medium text-gray-300">Return Policy</label><input type="text" name="returnPolicy" value={formData.returnPolicy} onChange={handleChange} className="w-full mt-1 input-style" /></div>
              <div><label className="block text-sm font-medium text-gray-300">Warranty</label><input type="text" name="warranty" value={formData.warranty} onChange={handleChange} className="w-full mt-1 input-style" /></div>
            </div>
            <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={() => navigate('/admin/products')} className="bg-gray-600/50 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-500/50">Cancel</button>
                <button type="submit" className="bg-teal-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-teal-600">{isEditing ? 'Update Product' : 'Create Product'}</button>
            </div>
        </form>
      </GlassmorphicCard>
       <style>{` .input-style { background-color: #1f2937; color: white; border: 1px solid #4b5563; border-radius: 0.5rem; padding: 0.75rem; transition: border-color 0.2s, box-shadow 0.2s; } .input-style:focus { outline: none; border-color: #2dd4bf; box-shadow: 0 0 0 2px rgba(45, 212, 191, 0.5); }`}</style>
    </div>
  );
};

export default AdminProductFormPage;
