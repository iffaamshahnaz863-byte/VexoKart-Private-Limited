import React, { useState, useEffect, useRef } from 'react';
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
  const initializedRef = useRef(false);

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

  /* ---------------- INITIAL LOAD (FIXED) ---------------- */
  useEffect(() => {
    if (initializedRef.current) return;

    if (isEditing) {
      const p = getProduct(Number(id));
      if (!p) return;

      setFormData({
        ...p,
        category_id: String(p.category_id),
        is_cod_enabled: p.is_cod_enabled === true,
        is_online_enabled: p.is_online_enabled === true,
        variants: p.variants || []
      });

      setHighlightsText((p.highlights || []).join('\n'));
      setEnableSize(p.variants?.some(v => v.type === 'size') || false);
      setEnableColor(p.variants?.some(v => v.type === 'color') || false);

      initializedRef.current = true;
    } else if (categories.length) {
      setFormData(prev => ({
        ...prev,
        category_id: String(categories[0].id)
      }));
      initializedRef.current = true;
    }
  }, [id, categories, isEditing, getProduct]);

  /* ---------------- INPUT HANDLER ---------------- */
  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? checked
          : ['price', 'original_price', 'stock'].includes(name)
          ? Number(value)
          : value
    }));
  };

  /* ---------------- VARIANTS ---------------- */
  const addVariant = (type: 'size' | 'color', value: string) => {
    if (!value.trim()) return;

    setFormData(prev => ({
      ...prev,
      variants: [
        ...prev.variants,
        { type, name: type === 'size' ? 'Size' : 'Color', value }
      ]
    }));
  };

  const removeVariant = (i: number) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_: any, idx: number) => idx !== i)
    }));
  };

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentVendor) return alert('Vendor auth error');

    if (!formData.is_cod_enabled && !formData.is_online_enabled) {
      return alert('At least one payment method required');
    }

    const payload = {
      ...formData,
      vendor_id: String(currentVendor.id),
      highlights: highlightsText
        .split('\n')
        .map(s => s.trim())
        .filter(Boolean),
      variants:
        formData.product_type === 'simple'
          ? []
          : formData.variants.filter(
              (v: ProductVariant) =>
                (v.type === 'size' && enableSize) ||
                (v.type === 'color' && enableColor)
            )
    };

    if (isEditing) {
      await updateProduct({ ...payload, id: Number(id) });
    } else {
      await addProduct(payload);
    }

    navigate('/vendor/products');
  };

  /* ---------------- UI (UNCHANGED) ---------------- */
  return (
    <form onSubmit={handleSubmit} className="p-4">
      <button type="button" onClick={() => navigate(-1)}>
        <ChevronLeftIcon />
      </button>

      <input
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Product name"
      />

      <label>
        COD
        <input
          type="checkbox"
          name="is_cod_enabled"
          checked={formData.is_cod_enabled}
          onChange={(e) =>
            setFormData(prev => ({
              ...prev,
              is_cod_enabled: e.target.checked
            }))
          }
        />
      </label>

      <label>
        Online
        <input
          type="checkbox"
          name="is_online_enabled"
          checked={formData.is_online_enabled}
          onChange={(e) =>
            setFormData(prev => ({
              ...prev,
              is_online_enabled: e.target.checked
            }))
          }
        />
      </label>

      <button type="submit">Save Product</button>
    </form>
  );
};

export default VendorProductFormPage;
