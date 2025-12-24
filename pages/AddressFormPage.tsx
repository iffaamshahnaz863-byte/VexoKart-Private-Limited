
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import GlassmorphicCard from '../components/GlassmorphicCard';
import { ChevronLeftIcon } from '../components/icons/ChevronLeftIcon';
import { useAuth } from '../context/AuthContext';
import { Address } from '../types';

const AddressFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const { user, addAddress, updateAddress } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    phone: '',
  });

  const isEditing = id !== undefined;

  useEffect(() => {
    if (isEditing && user?.addresses) {
      const addressToEdit = user.addresses.find(a => a.id === id);
      if (addressToEdit) {
        setFormData(addressToEdit);
      }
    }
  }, [id, isEditing, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      updateAddress({ ...formData, id });
    } else {
      addAddress(formData);
    }
    navigate('/addresses');
  };

  return (
    <div>
      <div className="sticky top-0 z-10 p-4 bg-navy-charcoal flex items-center shadow-md">
        <button onClick={() => navigate('/addresses')} className="p-2 -ml-2 mr-2">
          <ChevronLeftIcon className="h-6 w-6 text-white" />
        </button>
        <h1 className="text-xl font-bold text-white">{isEditing ? 'Edit Address' : 'Add New Address'}</h1>
      </div>
      
      <div className="p-4">
        <GlassmorphicCard className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {Object.keys(formData).map((key) => (
              <div key={key}>
                <label className="text-sm font-medium text-gray-300 capitalize" htmlFor={key}>
                  {key.replace(/([A-Z])/g, ' $1')}
                </label>
                <input
                  id={key}
                  name={key}
                  type={key === 'phone' || key === 'zip' ? 'tel' : 'text'}
                  value={(formData as any)[key]}
                  onChange={handleChange}
                  required
                  className="w-full mt-1 bg-navy-light/70 text-white placeholder-gray-400 border border-gray-700 focus:border-purple-400 focus:ring-purple-400 rounded-lg p-3 transition"
                />
              </div>
            ))}
            <button
              type="submit"
              className="w-full mt-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-3 rounded-lg shadow-lg"
            >
              Save Address
            </button>
          </form>
        </GlassmorphicCard>
      </div>
    </div>
  );
};

export default AddressFormPage;
