
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCategories } from '../../hooks/useCategories';
import GlassmorphicCard from '../../components/GlassmorphicCard';

const AdminCategoryFormPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { getCategory, addCategory, updateCategory } = useCategories();
  
  const isEditing = id !== undefined;
  
  const [formData, setFormData] = useState({
    name: '',
    image: '',
  });

  const inputClasses = "w-full mt-1 bg-surface text-text-main border border-gray-600 rounded-lg p-3 transition focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/50";

  useEffect(() => {
    if (isEditing) {
      const categoryToEdit = getCategory(parseInt(id));
      if (categoryToEdit) {
        setFormData({ name: categoryToEdit.name, image: categoryToEdit.image });
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
        setFormData(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.image) {
      alert("Please upload an image for the category.");
      return;
    }

    if (isEditing) {
      updateCategory({ ...formData, id: parseInt(id) });
    } else {
      addCategory(formData);
    }
    navigate('/admin/categories');
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-text-main mb-6">{isEditing ? 'Edit Category' : 'Add New Category'}</h1>
      <GlassmorphicCard className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-text-secondary">Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required className={inputClasses} />
            </div>
            
            <div>
                <label className="block text-sm font-medium text-text-secondary">Image</label>
                <div className="mt-2">
                    <input type="file" id="imageUpload" accept="image/*" onChange={handleImageChange} className="hidden" />
                    <label htmlFor="imageUpload" className="cursor-pointer bg-surface text-text-main font-semibold py-2 px-4 rounded-lg border border-gray-600 hover:bg-gray-700">Choose File</label>
                </div>
                {formData.image && (
                    <div className="mt-4">
                        <img src={formData.image} alt="Preview" className="w-32 h-32 object-cover rounded-lg"/>
                    </div>
                )}
            </div>

            <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={() => navigate('/admin/categories')} className="bg-gray-600/50 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-500/50">Cancel</button>
                <button type="submit" className="bg-accent text-white font-bold py-2 px-4 rounded-lg hover:brightness-110">{isEditing ? 'Update Category' : 'Create Category'}</button>
            </div>
        </form>
      </GlassmorphicCard>
    </div>
  );
};

export default AdminCategoryFormPage;