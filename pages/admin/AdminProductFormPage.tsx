import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProducts } from '../../hooks/useProducts';
import { useCategories } from '../../hooks/useCategories';
import GlassmorphicCard from '../../components/GlassmorphicCard';
import { Product } from '../../types';
import ImageCropperModal from '../../components/ImageCropperModal';

const AdminProductFormPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { getProduct, addProduct, updateProduct } = useProducts();
  const { categories } = useCategories();
  
  const isEditing = id !== undefined;
  
  const [formData, setFormData] = useState<Omit<Product, 'id' | 'reviews' | 'rating' | 'reviewCount'>>({
    name: '',
    category: '', 
    price: 0,
    originalPrice: 0,
    images: [],
    description: '',
    vendorId: 'vexokart_internal',
    status: 'approved',
    highlights: [],
    stock: 10,
    specifications: {},
    sellerInfo: 'VexoKart Direct',
    returnPolicy: '30-Day Money Back Guarantee',
    warranty: '1 Year Standard Warranty',
    videoUrl: '',
    allow_online: true,
    allow_cod: true
  });

  const [highlightsText, setHighlightsText] = useState('');
  const [specsText, setSpecsText] = useState('');
  
  // Cropper Queue States
  const [cropQueue, setCropQueue] = useState<string[]>([]);
  const [currentCropIndex, setCurrentCropIndex] = useState(0);
  const [totalInQueue, setTotalInQueue] = useState(0);

  const inputClasses = "w-full mt-1 bg-surface text-text-main border border-gray-600 rounded-lg p-3 transition focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/50";

  useEffect(() => {
    if (isEditing) {
      const productToEdit = getProduct(parseInt(id));
      if (productToEdit) {
        const cat = categories.find(c => c.name === productToEdit.category);
        setFormData({
            ...productToEdit,
            category: cat ? cat.id.toString() : '',
            allow_online: productToEdit.allow_online ?? true,
            allow_cod: productToEdit.allow_cod ?? true
        });
        setHighlightsText((productToEdit.highlights || []).join('\n'));
        setSpecsText(Object.entries(productToEdit.specifications || {}).map(([k, v]) => `${k}: ${v}`).join('\n'));
      }
    } else if (categories.length > 0) {
        setFormData(prev => ({...prev, category: categories[0].id.toString()}));
    }
  }, [id, isEditing, getProduct, categories]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as any;
    if (type === 'checkbox') {
        setFormData(prev => ({ ...prev, [name]: (e.target as any).checked }));
    } else {
        setFormData(prev => ({ ...prev, [name]: ['price', 'originalPrice', 'stock'].includes(name) ? parseFloat(value) || 0 : value }));
    }
  };

  const validateImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            if (img.width < 600 || img.height < 600) {
                reject(`Image "${file.name}" is too small (${img.width}x${img.height}). Min required: 600x600.`);
            } else {
                resolve(URL.createObjectURL(file));
            }
        };
        img.onerror = () => reject("Corrupted image file.");
        img.src = URL.createObjectURL(file);
    });
  };

  // Fixed handleImageChange to avoid unknown type error
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files) as File[];
      const urls: string[] = [];
      
      for (const file of files) {
          try {
              const url = await validateImage(file);
              urls.push(url);
          } catch (err: any) {
              alert(err);
          }
      }

      if (urls.length > 0) {
        setTotalInQueue(urls.length);
        setCurrentCropIndex(0);
        setCropQueue(urls);
      }
      
      // Reset input so same file can be picked again
      e.target.value = '';
    }
  };

  const handleCropComplete = (croppedBase64: string) => {
    setFormData(prev => ({ ...prev, images: [...prev.images, croppedBase64] }));
    
    if (currentCropIndex < cropQueue.length - 1) {
        setCurrentCropIndex(prev => prev + 1);
    } else {
        setCropQueue([]);
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(formData.images.length === 0) { alert("Please upload at least one image."); return; }
    if (!formData.allow_online && !formData.allow_cod) { alert("Select at least one payment method."); return; }

    const finalHighlights = highlightsText.split('\n').map(s => s.trim()).filter(Boolean);
    const finalSpecs: { [key: string]: string } = {};
    specsText.split('\n').forEach(line => {
      const parts = line.split(':');
      if (parts.length === 2) finalSpecs[parts[0].trim()] = parts[1].trim();
    });

    const finalData = { ...formData, highlights: finalHighlights, specifications: finalSpecs };

    if (isEditing) {
      updateProduct({ ...finalData as any, id: parseInt(id) } as Product);
    } else {
      const { status, ...productData } = finalData;
      addProduct(productData as any);
    }
    navigate('/admin/products');
  };

  return (
    <div>
      {cropQueue.length > 0 && (
          <ImageCropperModal 
            image={cropQueue[currentCropIndex]} 
            queueCount={currentCropIndex + 1}
            totalInQueue={totalInQueue}
            title="Standardize Product Image"
            onCropComplete={handleCropComplete}
            onCancel={() => setCropQueue([])}
          />
      )}

      <h1 className="text-3xl font-black text-text-main uppercase italic mb-6">{isEditing ? 'Edit Catalog Entry' : 'Create New Inventory'}</h1>
      <GlassmorphicCard className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><label className="block text-[10px] font-black uppercase text-text-muted">Product Name</label><input type="text" name="name" value={formData.name} onChange={handleChange} required className={inputClasses} /></div>
                <div><label className="block text-[10px] font-black uppercase text-text-muted">Category</label><select name="category" value={formData.category} onChange={handleChange} className={inputClasses}>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div><label className="block text-[10px] font-black uppercase text-text-muted">Price (₹)</label><input type="number" name="price" value={formData.price} onChange={handleChange} required className={inputClasses} /></div>
                <div><label className="block text-[10px] font-black uppercase text-text-muted">Original (₹)</label><input type="number" name="originalPrice" value={formData.originalPrice} onChange={handleChange} className={inputClasses} /></div>
                 <div><label className="block text-[10px] font-black uppercase text-text-muted">Stock Level</label><input type="number" name="stock" value={formData.stock} onChange={handleChange} required className={inputClasses} /></div>
            </div>

            <div><label className="block text-[10px] font-black uppercase text-text-muted">Description</label><textarea name="description" value={formData.description} onChange={handleChange} required rows={4} className={inputClasses}></textarea></div>
            
            <div className="p-4 bg-surface rounded-2xl border border-border">
                <label className="block text-[10px] font-black uppercase text-text-muted mb-3">Product Gallery</label>
                <div className="flex flex-wrap gap-4">
                    {formData.images.map((image, index) => (
                        <div key={index} className="relative group">
                            <img src={image} alt={`preview ${index}`} className="w-24 h-24 object-cover rounded-xl border-2 border-white shadow-md"/>
                            <button type="button" onClick={() => removeImage(index)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg hover:scale-110 transition-transform">&times;</button>
                        </div>
                    ))}
                    <div className="relative">
                        <input type="file" id="imageUpload" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
                        <label htmlFor="imageUpload" className="w-24 h-24 cursor-pointer bg-white border-2 border-dashed border-accent/30 rounded-xl flex flex-col items-center justify-center text-accent hover:bg-accent/5 transition-all group">
                             <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                             <span className="text-[8px] font-black uppercase mt-1">Add Visuals</span>
                        </label>
                    </div>
                </div>
                <p className="text-[9px] text-text-muted mt-3 italic">* Minimum resolution: 600x600px. High quality 1:1 ratio images only.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-[10px] font-black uppercase text-text-muted mb-4 border-b border-border pb-1">Payment Options</label>
                    <div className="flex gap-6">
                        <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" name="allow_online" checked={formData.allow_online} onChange={handleChange} className="w-4 h-4 rounded border-gray-600 text-accent focus:ring-accent bg-surface"/><span className="text-xs font-bold text-text-main">Digital</span></label>
                        <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" name="allow_cod" checked={formData.allow_cod} onChange={handleChange} className="w-4 h-4 rounded border-gray-600 text-accent focus:ring-accent bg-surface"/><span className="text-xs font-bold text-text-main">COD</span></label>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-[10px] font-black uppercase text-text-muted">Highlights (per line)</label><textarea value={highlightsText} onChange={(e) => setHighlightsText(e.target.value)} rows={4} className={inputClasses} placeholder="e.g.&#10;Premium Design"></textarea></div>
                <div><label className="block text-[10px] font-black uppercase text-text-muted">Specifications (Key: Value)</label><textarea value={specsText} onChange={(e) => setSpecsText(e.target.value)} rows={4} className={inputClasses} placeholder="e.g.&#10;Color: Black"></textarea></div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={() => navigate('/admin/products')} className="px-6 py-2 rounded-xl text-[10px] font-black uppercase text-text-secondary hover:bg-surface">Cancel</button>
                <button type="submit" className="bg-accent text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs shadow-xl shadow-accent/20 hover:-translate-y-1 transition-all">{isEditing ? 'Sync Changes' : 'Go Live'}</button>
            </div>
        </form>
      </GlassmorphicCard>
    </div>
  );
};

export default AdminProductFormPage;