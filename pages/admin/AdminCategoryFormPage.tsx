import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCategories } from '../../context/CategoryContext';
import GlassmorphicCard from '../../components/GlassmorphicCard';

const AdminCategoryFormPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { getCategory, addCategory, updateCategory } = useCategories();
  
  const isEditing = id !== undefined;
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    image_url: '',
  });

  const inputClasses = "w-full mt-1 bg-surface text-text-main border border-gray-600 rounded-lg p-3 transition focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/50 disabled:opacity-50";

  useEffect(() => {
    if (isEditing) {
      const categoryToEdit = getCategory(parseInt(id));
      if (categoryToEdit) {
        setFormData({ name: categoryToEdit.name, image_url: categoryToEdit.image_url || '' });
      }
    }
  }, [id, isEditing, getCategory]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image_url: reader.result as string }));
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.image_url) {
      alert("Please upload an image for the category.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditing) {
        await updateCategory({ ...formData, id: parseInt(id) });
        alert("Category updated successfully!");
      } else {
        await addCategory(formData);
        alert("Category created successfully!");
      }
      navigate('/admin/categories');
    } catch (err: any) {
      console.error("Category Submit Error:", err);
      alert(err.message || "An error occurred while saving the category.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-black text-text-main italic tracking-tight uppercase mb-6">
        {isEditing ? 'Edit Category' : 'Add New Category'}
      </h1>
      <GlassmorphicCard className="p-8 max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="block text-[10px] font-black uppercase text-text-muted mb-1" htmlFor="name">Category Name</label>
                <input 
                    type="text" 
                    id="name"
                    name="name" 
                    value={formData.name} 
                    onChange={handleChange} 
                    required 
                    disabled={isSubmitting}
                    placeholder="e.g., Electronics, Fashion"
                    className={inputClasses} 
                />
            </div>
            
            <div>
                <label className="block text-[10px] font-black uppercase text-text-muted mb-1">Visual Representation</label>
                <div className="mt-2">
                    <input 
                        type="file" 
                        id="imageUpload" 
                        accept="image/*" 
                        onChange={handleImageChange} 
                        className="hidden" 
                        disabled={isSubmitting}
                    />
                    <label 
                        htmlFor="imageUpload" 
                        className={`cursor-pointer bg-surface text-text-main font-bold py-3 px-6 rounded-xl border border-gray-600 hover:bg-gray-700 transition-all inline-block text-xs uppercase tracking-widest ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {formData.image_url ? 'Change Image' : 'Select Image File'}
                    </label>
                </div>
                {formData.image_url && (
                    <div className="mt-6 flex flex-col items-center p-4 bg-background/50 border border-dashed border-gray-600 rounded-2xl">
                        <p className="text-[9px] font-black uppercase text-text-muted mb-3">Live Preview</p>
                        <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-white shadow-2xl">
                            <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover"/>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex justify-end gap-4 pt-6 border-t border-border">
                <button 
                    type="button" 
                    onClick={() => navigate('/admin/categories')} 
                    className="px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-text-secondary hover:bg-surface transition-all"
                    disabled={isSubmitting}
                >
                    Cancel
                </button>
                <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="bg-accent text-white px-10 py-3 rounded-xl font-black uppercase tracking-widest text-xs shadow-xl shadow-accent/30 hover:-translate-y-1 active:translate-y-0 transition-all disabled:opacity-50"
                >
                    {isSubmitting ? 'Saving...' : (isEditing ? 'Update Category' : 'Create Category')}
                </button>
            </div>
        </form>
      </GlassmorphicCard>
    </div>
  );
};

export default AdminCategoryFormPage;