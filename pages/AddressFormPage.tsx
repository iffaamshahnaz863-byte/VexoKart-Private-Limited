
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address_line: '',
    city: '',
    state: '',
    pincode: '',
  });

  const isEditing = id !== undefined;

  useEffect(() => {
    if (isEditing && user?.addresses) {
      const addressToEdit = user.addresses.find(a => a.id === id);
      if (addressToEdit) {
        setFormData({
          name: addressToEdit.name,
          phone: addressToEdit.phone,
          address_line: addressToEdit.address_line,
          city: addressToEdit.city,
          state: addressToEdit.state,
          pincode: addressToEdit.pincode,
        });
      }
    }
  }, [id, isEditing, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      if (isEditing) {
        await updateAddress({ ...formData, id } as Address);
      } else {
        await addAddress(formData);
      }
      setSuccess(true);
      setTimeout(() => navigate('/addresses'), 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to save address');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="sticky top-0 z-10 p-4 bg-background flex items-center shadow-md">
        <button onClick={() => navigate('/addresses')} className="p-2 -ml-2 mr-2">
          <ChevronLeftIcon className="h-6 w-6 text-text-main" />
        </button>
        <h1 className="text-xl font-bold text-text-main">{isEditing ? 'Edit Address' : 'Add New Address'}</h1>
      </div>
      
      <div className="p-4">
        <GlassmorphicCard className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 text-red-200 rounded-lg text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 text-green-200 rounded-lg text-sm">
              Address saved successfully! Redirecting...
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            {Object.keys(formData).map((key) => (
              <div key={key}>
                <label className="text-sm font-medium text-text-secondary capitalize" htmlFor={key}>
                  {key.replace(/_/g, ' ')}
                </label>
                <input
                  id={key}
                  name={key}
                  type={key === 'phone' || key === 'pincode' ? 'tel' : 'text'}
                  value={(formData as any)[key]}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  className="w-full mt-1 bg-surface/70 text-text-main placeholder-text-muted border border-gray-700 focus:border-accent focus:ring-accent rounded-lg p-3 transition disabled:opacity-50"
                />
              </div>
            ))}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-4 bg-gradient-to-r from-accent to-accent-secondary text-white font-bold py-3 rounded-lg shadow-lg disabled:opacity-50 flex items-center justify-center"
            >
              {isSubmitting ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              ) : null}
              {isEditing ? 'Update Address' : 'Save Address'}
            </button>
          </form>
        </GlassmorphicCard>
      </div>
    </div>
  );
};

export default AddressFormPage;