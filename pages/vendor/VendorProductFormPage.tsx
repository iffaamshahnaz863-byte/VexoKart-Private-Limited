import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProducts } from '../../hooks/useProducts';
import { useCategories } from '../../hooks/useCategories';
import { ProductVariant } from '../../types';
import { useVendors } from '../../context/VendorContext';
import { ChevronLeftIcon } from '../../components/icons/ChevronLeftIcon';
import ImageCropperModal from '../../components/ImageCropperModal';

const VendorProductFormPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { getProduct, addProduct, updateProduct } = useProducts();
  const { categories } = useCategories();
  const { currentVendor } = useVendors();

  const isEditing = Boolean(id);

  /* ---------------- STATE ---------------- */

  const [isInitialized, setIsInitialized] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<any>({
    name: '',
    category_id: '',
    price: 0,
    original_price: 0,
    images: [],
    description: '',
    highlights: [],
    stock: 10,
    product_type: 'simple',
    is_cod_enabled: true,
    is_online_enabled: true,
    variants: []
  });

  const [enableSize, setEnableSize] = useState(false);
  const [enableColor, setEnableColor] = useState(false);
  const [highlightsText, setHighlightsText] = useState('');

  const [cropQueue, setCropQueue] = useState<string[]>([]);
  const [cropIndex, setCropIndex] = useState(0);
  const [isVariantCrop, setIsVariantCrop] = useState(false);
  const [newVarName, setNewVarName] = useState('');
  const [newVarImage, setNewVarImage] = useState('');

  /* ---------------- ONE TIME INIT (MAIN FIX) ---------------- */

  useEffect(() => {
    if (isInitialized) return; // 🔒 LOCK – yahin bug fix hai

    if (isEditing && id) {
      const product = getProduct(Number(id));
      if (product) {
        setFormData({
          ...product,
          category_id: String(product.category_id),
          is_cod_enabled: product.is_cod_enabled === true,
          is_online_enabled: product.is_online_enabled === true,
          variants: product.variants || []
        });

        setEnableSize(product.variants?.some(v => v.type === 'size') || false);
        setEnableColor(product.variants?.some(v => v.type === 'color') || false);
        setHighlightsText((product.highlights || []).join('\n'));
        setIsInitialized(true);
      }
    }

    if (!isEditing && categories.length > 0) {
      setFormData(p => ({
        ...p,
        category_id: String(categories[0].id)
      }));
      setIsInitialized(true);
    }
  }, [id, isEditing, getProduct, categories, isInitialized]);

  /* ---------------- HANDLERS ---------------- */

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  /* 🔥 IMPORTANT: Checkbox handlers ALAG rakhe hain */
  const handleCodToggle = (checked: boolean) => {
    setFormData(prev => ({ ...prev, is_cod_enabled: checked }));
  };

  const handleOnlineToggle = (checked: boolean) => {
    setFormData(prev => ({ ...prev, is_online_enabled: checked }));
  };

  /* ---------------- VARIANT LOGIC ---------------- */

  useEffect(() => {
    if (formData.product_type === 'simple') {
      setEnableSize(false);
      setEnableColor(false);
      setFormData(p => ({ ...p, variants: [] }));
    }
  }, [formData.product_type]);

  useEffect(() => {
    setFormData(p => ({
      ...p,
      variants: p.variants.filter((v: ProductVariant) =>
        (v.type === 'size' && enableSize) ||
        (v.type === 'color' && enableColor)
      )
    }));
  }, [enableSize, enableColor]);

  const addVariant = (type: 'size' | 'color') => {
    if (!newVarName) return;

    setFormData(p => ({
      ...p,
      variants: [
        ...p.variants,
        {
          type,
          name: type === 'size' ? 'Size' : 'Color',
          value: newVarName,
          image: type === 'color' ? newVarImage : undefined
        }
      ]
    }));

    setNewVarName('');
    setNewVarImage('');
  };

  const removeVariant = (i: number) => {
    setFormData(p => ({
      ...p,
      variants: p.variants.filter((_: any, idx: number) => idx !== i)
    }));
  };

  /* ---------------- IMAGE ---------------- */

  const handleImageChange = (e: any, variant = false) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setIsVariantCrop(variant);
    setCropQueue(files.map((f: any) => URL.createObjectURL(f)));
    setCropIndex(0);
  };

  const handleCropComplete = (img: string) => {
    if (isVariantCrop) {
      setNewVarImage(img);
    } else {
      setFormData(p => ({ ...p, images: [...p.images, img] }));
    }

    if (cropIndex < cropQueue.length - 1) {
      setCropIndex(cropIndex + 1);
    } else {
      setCropQueue([]);
      setIsVariantCrop(false);
    }
  };

  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentVendor) return alert('Vendor error');
    if (!formData.images.length) return alert('Add image');

    if (!formData.is_cod_enabled && !formData.is_online_enabled) {
      return alert('At least one payment method required');
    }

    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        highlights: highlightsText.split('\n').filter(Boolean),
        vendor_id: currentVendor.id,
        status: 'approved'
      };

      if (isEditing) {
        await updateProduct({ ...payload, id: Number(id) });
      } else {
        await addProduct(payload);
      }

      navigate('/vendor/products');
    } catch (err: any) {
      alert(err.message || 'Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ---------------- UI (UNCHANGED) ---------------- */

  return (
    <div className="pb-24">
      {cropQueue.length > 0 && (
        <ImageCropperModal
          image={cropQueue[cropIndex]}
          onCropComplete={handleCropComplete}
          onCancel={() => setCropQueue([])}
          title="Crop Image"
        />
      )}

      <div className="sticky top-0 bg-white z-20 flex items-center gap-3 p-4">
        <button onClick={() => navigate('/vendor/products')}>
          <ChevronLeftIcon className="w-6 h-6" />
        </button>
        <h1 className="font-bold">
          {isEditing ? 'Edit Product' : 'Add Product'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="px-4 space-y-6">

        <input
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="Product name"
          className="w-full p-3 border rounded"
        />

        <label>
          <input
            type="checkbox"
            checked={formData.is_cod_enabled}
            onChange={(e) => handleCodToggle(e.target.checked)}
          /> COD
        </label>

        <label>
          <input
            type="checkbox"
            checked={formData.is_online_enabled}
            onChange={(e) => handleOnlineToggle(e.target.checked)}
          /> Online Payment
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-pink-600 text-white p-4 rounded"
        >
          {isSubmitting ? 'Saving...' : 'Save Product'}
        </button>

      </form>
    </div>
  );
};

export default VendorProductFormPage;
