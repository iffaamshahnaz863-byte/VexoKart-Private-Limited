
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProducts } from '../../hooks/useProducts';
import { useCategories } from '../../hooks/useCategories';
import GlassmorphicCard from '../../components/GlassmorphicCard';
import { Product } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useVendors } from '../../context/VendorContext';
import Toast from '../../components/Toast';

const VendorProductFormPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { getProduct, addProduct, updateProduct } = useProducts();
  const { categories } = useCategories();
  const { currentVendor } = useVendors();

  const isEditing = id !== undefined;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' as 'success' | 'info' });
  
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
    sellerInfo: '',
    returnPolicy: '30-Day Money Back Guarantee',
    warranty: '1 Year Standard Warranty',
    videoUrl: ''
  });

  const [highlightsText, setHighlightsText] = useState('');
  const [specsText, setSpecsText] = useState('');
  
  const inputClasses = "w-full mt-1 bg-surface text-text-main border border-gray-600 rounded-lg p-3 transition focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/50";

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ show: true, message, type });
  };

  useEffect(() => {
    if (isEditing) {
      const productToEdit = getProduct(parseInt(id));
      if (productToEdit) {
        setFormData({ ...productToEdit });
        setHighlightsText((productToEdit.highlights || []).join('\n'));
        setSpecsText(Object.entries(productToEdit.specifications || {}).map(([k, v]) => `${k}: ${v}`).join('\n'));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Critical verification check
    if (!currentVendor) {
        console.error("[VendorProductForm] Submission blocked: currentVendor is missing from context.");
        alert("Your vendor profile is not verified. Access restricted. Please contact admin.");
        return;
    }

    if(formData.images.length === 0) {
        alert("Please upload at least one image for the product.");
        return;
    }

    setIsSubmitting(true);
    try {
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
            vendor_id: currentVendor.id, // Direct mapping from verified currentVendor ID
            highlights: finalHighlights, 
            specifications: finalSpecs 
        };

        console.log(`[VendorProductForm] Payload for ${isEditing ? 'UPDATE' : 'INSERT'}:`, finalData);

        if (isEditing) {
          const existingProduct = getProduct(parseInt(id));
          const updatedData: Product = { ...existingProduct!, ...finalData as any, id: parseInt(id) };
          await updateProduct(updatedData);
          showToast("Product updated successfully!");
        } else {
          await addProduct(finalData);
          showToast("Product published successfully!");
        }
        
        setTimeout(() => navigate('/vendor/products'), 1500);
    } catch (err: any) {
        console.error("[VendorProductForm] Submission failed:", err);
        alert(err.message || "An unexpected error occurred while saving. Check console for details.");
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="pb-10">
      <Toast isVisible={toast.show} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
      <h1 className="text-3xl font-black text-text-main italic tracking-tight mb-6 uppercase">
        {isEditing ? 'Edit Product' : 'Publish New Product'}
      </h1>
      <GlassmorphicCard className="p-8 max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-black uppercase text-text-muted mb-1">Product Title</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required className={inputClasses} placeholder="e.g., Premium Leather Jacket" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black uppercase text-text-muted mb-1">Category</label>
                        <select name="category" value={formData.category} onChange={handleChange} className={inputClasses}>
                            {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-[10px] font-black uppercase text-text-muted mb-1">Selling Price</label>
                            <input type="number" name="price" value={formData.price} onChange={handleChange} required className={inputClasses} />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase text-text-muted mb-1">MRP / Original</label>
                            <input type="number" name="originalPrice" value={formData.originalPrice} onChange={handleChange} className={inputClasses} />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase text-text-muted mb-1">Stock</label>
                            <input type="number" name="stock" value={formData.stock} onChange={handleChange} required className={inputClasses} />
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <label className="block text-[10px] font-black uppercase text-text-muted mb-1">Product Visuals</label>
                    <div className="border-2 border-dashed border-border rounded-2xl p-4 min-h-[160px] flex flex-col items-center justify-center bg-surface/30">
                        <input type="file" id="imageUpload" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
                        <label htmlFor="imageUpload" className="cursor-pointer text-center group">
                            <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                                <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            </div>
                            <p className="text-xs font-bold text-text-main">Add Gallery Images</p>
                        </label>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                        {formData.images.map((image, index) => (
                            <div key={index} className="relative group aspect-square">
                                <img src={image} alt={`preview ${index}`} className="w-full h-full object-cover rounded-lg border border-border"/>
                                <button type="button" onClick={() => removeImage(index)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">&times;</button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-[10px] font-black uppercase text-text-muted mb-1">Detailed Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} required rows={4} className={`${inputClasses} resize-none`} placeholder="Tell customers about your product..."></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-[10px] font-black uppercase text-text-muted mb-1">Key Highlights (one per line)</label>
                    <textarea value={highlightsText} onChange={(e) => setHighlightsText(e.target.value)} rows={4} className={`${inputClasses} resize-none`} placeholder="• Water Resistant&#10;• 2 Year Warranty"></textarea>
                </div>
                <div>
                    <label className="block text-[10px] font-black uppercase text-text-muted mb-1">Technical Specs (Key: Value)</label>
                    <textarea value={specsText} onChange={(e) => setSpecsText(e.target.value)} rows={4} className={`${inputClasses} resize-none`} placeholder="Material: Leather&#10;Size: Large"></textarea>
                </div>
            </div>

            <div className="flex justify-end gap-4 pt-6 border-t border-border">
                <button type="button" onClick={() => navigate('/vendor/products')} disabled={isSubmitting} className="px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-text-muted hover:bg-surface transition-all">Discard</button>
                <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="bg-accent text-white px-10 py-3 rounded-xl font-black uppercase tracking-widest text-xs shadow-xl shadow-accent/30 hover:-translate-y-1 active:translate-y-0 transition-all disabled:opacity-50"
                >
                    {isSubmitting ? 'Syncing...' : (isEditing ? 'Update Listing' : 'Publish to Marketplace')}
                </button>
            </div>
        </form>
      </GlassmorphicCard>
    </div>
  );
};

export default VendorProductFormPage;
