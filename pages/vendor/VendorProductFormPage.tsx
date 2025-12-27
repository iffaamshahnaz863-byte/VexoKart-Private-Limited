
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProducts } from '../../hooks/useProducts';
import { useCategories } from '../../hooks/useCategories';
import GlassmorphicCard from '../../components/GlassmorphicCard';
import { Product } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useVendors } from '../../context/VendorContext';

const VendorProductFormPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { getProduct, addProduct, updateProduct } = useProducts();
  const { categories } = useCategories();
  const { user } = useAuth();
  const { getVendorByUserId } = useVendors();

  const vendor = user ? getVendorByUserId(user.email) : null;
  const isEditing = id !== undefined;
  
  const [formData, setFormData] = useState<Omit<Product, 'id' | 'reviews' | 'rating' | 'reviewCount' | 'status' | 'vendorId'>>({
    name: '',
    category: categories[0]?.name || '',
    price: 0,
    originalPrice: 0,
    images: [],
    description: '',
    highlights: [],
    stock: 10,
    specifications: {},
    sellerInfo: vendor?.storeName || '',
    returnPolicy: '30-Day Money Back Guarantee',
    warranty: '1 Year Standard Warranty',
    videoUrl: ''
  });

  const [highlightsText, setHighlightsText] = useState('');
  const [specsText, setSpecsText] = useState('');
  
  const inputClasses = "w-full mt-1 bg-surface text-text-main border border-gray-600 rounded-lg p-3 transition focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/50";

  useEffect(() => {
    if (isEditing) {
      const productToEdit = getProduct(parseInt(id));
      if (productToEdit && vendor && productToEdit.vendorId === vendor.id) {
        setFormData({ ...productToEdit });
        setHighlightsText((productToEdit.highlights || []).join('\n'));
        setSpecsText(Object.entries(productToEdit.specifications || {}).map(([k, v]) => `${k}: ${v}`).join('\n'));
      } else {
        navigate('/vendor/products');
      }
    } else {
        if (categories.length > 0) {
            setFormData(prev => ({...prev, category: categories[0].name, sellerInfo: vendor?.storeName || ''}));
        }
    }
  }, [id, isEditing, getProduct, categories, vendor, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: ['price', 'originalPrice', 'stock'].includes(name) ? parseFloat(value) || 0 : value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      for (const file of e.target.files) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData(prev => ({
                ...prev,
                images: [...prev.images, reader.result as string]
            }));
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendor) {
        alert("Vendor information not found. Cannot save product.");
        return;
    }
    if(formData.images.length === 0) {
        alert("Please upload at least one image for the product.");
        return;
    }

    const finalHighlights = highlightsText.split('\n').map(s => s.trim()).filter(Boolean);
    const finalSpecs: { [key: string]: string } = {};
    specsText.split('\n').forEach(line => {
      const parts = line.split(':');
      if (parts.length === 2) {
        finalSpecs[parts[0].trim()] = parts[1].trim();
      }
    });

    const finalData = { 
        ...formData, 
        highlights: finalHighlights, 
        specifications: finalSpecs 
    };

    if (isEditing) {
      const existingProduct = getProduct(parseInt(id));
      const updatedData: Product = { ...existingProduct!, ...finalData, id: parseInt(id) };
      updateProduct(updatedData);
      alert("Product updated successfully!");
    } else {
      addProduct({ ...finalData, vendorId: vendor.id });
      alert("Product published successfully! It is now live for customers.");
    }
    navigate('/vendor/products');
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-text-main mb-6">{isEditing ? 'Edit Product' : 'Publish New Product'}</h1>
      <GlassmorphicCard className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className="block text-sm font-medium text-text-secondary">Name</label><input type="text" name="name" value={formData.name} onChange={handleChange} required className={inputClasses} /></div>
            <div><label className="block text-sm font-medium text-text-secondary">Category</label><select name="category" value={formData.category} onChange={handleChange} className={inputClasses}>{categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}</select></div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div><label className="block text-sm font-medium text-text-secondary">Price (₹)</label><input type="number" name="price" value={formData.price} onChange={handleChange} required className={inputClasses} /></div>
                <div><label className="block text-sm font-medium text-text-secondary">Original Price (₹)</label><input type="number" name="originalPrice" value={formData.originalPrice} onChange={handleChange} className={inputClasses} /></div>
                 <div><label className="block text-sm font-medium text-text-secondary">Stock</label><input type="number" name="stock" value={formData.stock} onChange={handleChange} required className={inputClasses} /></div>
            </div>
            <div><label className="block text-sm font-medium text-text-secondary">Description</label><textarea name="description" value={formData.description} onChange={handleChange} required rows={4} className={inputClasses}></textarea></div>
            <div>
                <label className="block text-sm font-medium text-text-secondary">Images</label>
                <div className="mt-2"><input type="file" id="imageUpload" multiple accept="image/*" onChange={handleImageChange} className="hidden" /><label htmlFor="imageUpload" className="cursor-pointer bg-surface text-text-main font-semibold py-2 px-4 rounded-lg border border-gray-600 hover:bg-gray-700">Choose Files</label></div>
                <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                    {formData.images.map((image, index) => (
                        <div key={index} className="relative"><img src={image} alt={`preview ${index}`} className="w-full h-24 object-cover rounded-lg"/><button type="button" onClick={() => removeImage(index)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">&times;</button></div>
                    ))}
                </div>
            </div>
            <div><label className="block text-sm font-medium text-text-secondary">Highlights (one per line)</label><textarea value={highlightsText} onChange={(e) => setHighlightsText(e.target.value)} rows={4} className={inputClasses} placeholder="e.g.&#10;High Quality&#10;Durable"></textarea></div>
            <div><label className="block text-sm font-medium text-text-secondary">Specifications (format: Key: Value)</label><textarea value={specsText} onChange={(e) => setSpecsText(e.target.value)} rows={5} className={inputClasses} placeholder="e.g.&#10;Color: Black&#10;Material: Aluminum"></textarea></div>
            <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={() => navigate('/vendor/products')} className="bg-gray-600/50 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-500/50">Cancel</button>
                <button type="submit" className="bg-accent text-white font-bold py-2 px-4 rounded-lg hover:brightness-110">{isEditing ? 'Save Changes' : 'Publish Product'}</button>
            </div>
        </form>
      </GlassmorphicCard>
    </div>
  );
};

export default VendorProductFormPage;
