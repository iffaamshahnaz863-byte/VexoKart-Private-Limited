
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProducts } from '../../hooks/useProducts';
import { useCategories } from '../../hooks/useCategories';
import { Product, ProductVariant } from '../../types';
import { useVendors } from '../../context/VendorContext';
import { useServiceAreas } from '../../context/ServiceAreaContext';
import Toast from '../../components/Toast';
import { ChevronLeftIcon } from '../../components/icons/ChevronLeftIcon';
import ImageCropperModal from '../../components/ImageCropperModal';

const VendorProductFormPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { getProduct, addProduct, updateProduct } = useProducts();
  const { categories } = useCategories();
  const { currentVendor } = useVendors();
  const { serviceAreas } = useServiceAreas();

  const isEditing = id !== undefined;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' as 'success' | 'info' });
  
  const initializationLocked = useRef(false);

  const [formData, setFormData] = useState<any>({
    name: '',
    category_id: '', 
    price: 0,
    original_price: 0,
    images: [],
    description: '',
    highlights: [],
    stock: 10,
    product_type: 'normal',
    is_cod_enabled: true,
    is_online_enabled: true,
    is_returnable: true,
    express_delivery_enabled: false,
    weight_info: '',
    variants: [] as ProductVariant[],
    service_pincodes: [] as string[]
  });

  const [enableSize, setEnableSize] = useState(false);
  const [enableColor, setEnableColor] = useState(false);
  const [highlightsText, setHighlightsText] = useState('');
  const [cropQueue, setCropQueue] = useState<string[]>([]);
  const [currentCropIndex, setCurrentCropIndex] = useState(0);

  const activeServiceAreas = serviceAreas.filter(a => a.is_active);
  const inputClasses = "w-full mt-1 bg-surface text-text-main border border-border rounded-2xl p-4 transition focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/5 disabled:opacity-50 text-sm font-medium";

  useEffect(() => {
    if (initializationLocked.current) return;
    if (isEditing) {
      const p = getProduct(parseInt(id));
      if (p) {
        setFormData({ 
            ...p, 
            category_id: p.category_id.toString(),
            variants: Array.isArray(p.variants) ? p.variants : [],
            product_type: p.product_type || 'normal',
            is_cod_enabled: p.is_cod_enabled !== false,
            is_online_enabled: p.is_online_enabled !== false,
            is_returnable: p.is_returnable !== false,
            express_delivery_enabled: p.express_delivery_enabled === true,
            service_pincodes: p.service_pincodes || []
        });
        setHighlightsText((p.highlights || []).join('\n'));
        setEnableSize(p.variants?.some(v => v.type === 'size') || false);
        setEnableColor(p.variants?.some(v => v.type === 'color') || false);
        initializationLocked.current = true;
      }
    } else if (categories.length > 0) {
      setFormData((prev: any) => ({ ...prev, category_id: categories[0].id.toString() }));
      initializationLocked.current = true;
    }
  }, [id, isEditing, getProduct, categories]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as any;
    if (type === 'checkbox') {
        setFormData((prev: any) => ({ ...prev, [name]: (e.target as any).checked }));
    } else {
        setFormData((prev: any) => ({ 
            ...prev, 
            [name]: ['price', 'original_price', 'stock'].includes(name) ? parseFloat(value) || 0 : value 
        }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentVendor) return;
    if (formData.images.length === 0) { alert("Visuals required."); return; }
    
    setIsSubmitting(true);
    try {
        const finalHighlights = highlightsText.split('\n').map(s => s.trim()).filter(Boolean);
        const payload = { 
            ...formData,
            highlights: finalHighlights,
            vendor_id: String(currentVendor.id), 
            status: 'approved',
            service_pincodes: formData.product_type === 'daily_needs' ? formData.service_pincodes : []
        };

        if (isEditing) await updateProduct({ ...payload, id: parseInt(id) } as any);
        else await addProduct(payload);
        
        setToast({ show: true, message: 'Registry updated.', type: 'success' });
        setTimeout(() => navigate('/vendor/products'), 1000);
    } catch (err: any) {
        alert(`Registry Error: ${err.message}`);
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="pb-24 animate-in fade-in duration-300">
      <div className="sticky top-0 z-40 bg-[#F8F9FA]/80 backdrop-blur-md pb-4 pt-1 mb-6">
          <div className="flex items-center gap-3">
              <button onClick={() => navigate('/vendor/products')} className="p-2 -ml-2"><ChevronLeftIcon className="w-6 h-6 text-gray-800" /></button>
              <h1 className="text-xl font-black text-gray-900 italic uppercase tracking-tighter">{isEditing ? 'Update SKU' : 'New Listing'}</h1>
          </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 px-1">
        {/* Amazon Vertical Choice */}
        <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-4">
            <h2 className="text-[10px] font-black uppercase text-gray-400 tracking-widest italic border-b border-gray-50 pb-2">Marketplace Vertical</h2>
            <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => setFormData((p:any) => ({...p, product_type: 'normal'}))} className={`py-4 rounded-2xl border-2 flex flex-col items-center justify-center transition-all ${formData.product_type === 'normal' ? 'border-accent bg-accent/5 text-accent' : 'border-gray-100 text-gray-400'}`}>
                    <span className="text-[10px] font-black uppercase">Standard Shop</span>
                </button>
                <button type="button" onClick={() => setFormData((p:any) => ({...p, product_type: 'daily_needs'}))} className={`py-4 rounded-2xl border-2 flex flex-col items-center justify-center transition-all ${formData.product_type === 'daily_needs' ? 'border-[#00B259] bg-[#00B259]/5 text-[#00B259]' : 'border-gray-100 text-gray-400'}`}>
                    <span className="text-[10px] font-black uppercase">Daily Needs</span>
                </button>
            </div>
        </div>

        {/* Basic Info */}
        <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-4">
            <div>
              <label className="text-[9px] font-black uppercase text-gray-500 ml-2">Product Title</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required className={inputClasses} />
            </div>
            <div>
              <label className="text-[9px] font-black uppercase text-gray-500 ml-2">Weight / Size Info</label>
              <input type="text" name="weight_info" value={formData.weight_info} onChange={handleChange} placeholder="e.g. 500g, 1L, XL" className={inputClasses} />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-black uppercase text-accent ml-2">Sale Price</label>
                  <input type="number" name="price" value={formData.price} onChange={handleChange} required className={inputClasses} />
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase text-gray-500 ml-2">Stock</label>
                  <input type="number" name="stock" value={formData.stock} onChange={handleChange} required className={inputClasses} />
                </div>
            </div>
        </div>

        {/* Amazon Specific Flags */}
        <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-4">
            <h2 className="text-[10px] font-black uppercase text-gray-400 tracking-widest italic border-b border-gray-50 pb-2">Logistics Policy</h2>
            <div className="space-y-3">
                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 cursor-pointer">
                    <div className="flex items-center gap-3">
                        <input type="checkbox" name="is_cod_enabled" checked={formData.is_cod_enabled} onChange={handleChange} className="w-5 h-5 accent-accent" />
                        <span className="text-[10px] font-black uppercase">Enable COD Settlement</span>
                    </div>
                    {formData.is_cod_enabled && <span className="text-[8px] font-black text-blue-600 italic">AVAILABLE</span>}
                </label>
                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 cursor-pointer">
                    <div className="flex items-center gap-3">
                        <input type="checkbox" name="is_returnable" checked={formData.is_returnable} onChange={handleChange} className="w-5 h-5 accent-accent" />
                        <span className="text-[10px] font-black uppercase">Standard Return Policy</span>
                    </div>
                </label>
                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 cursor-pointer">
                    <div className="flex items-center gap-3">
                        <input type="checkbox" name="express_delivery_enabled" checked={formData.express_delivery_enabled} onChange={handleChange} className="w-5 h-5 accent-accent" />
                        <span className="text-[10px] font-black uppercase">Enable Express Dispatch</span>
                    </div>
                </label>
            </div>
        </div>

        <button type="submit" disabled={isSubmitting} className="w-full bg-accent text-white py-5 rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-xl active:scale-95 transition-all disabled:opacity-50">
          {isSubmitting ? 'UPDATING REGISTRY...' : 'COMMIT LISTING'}
        </button>
      </form>
    </div>
  );
};

export default VendorProductFormPage;
