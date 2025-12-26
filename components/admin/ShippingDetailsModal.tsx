
import React, { useState } from 'react';

interface ShippingDetailsModalProps {
  onClose: () => void;
  onSubmit: (courierName: string, trackingId: string) => void;
}

const ShippingDetailsModal: React.FC<ShippingDetailsModalProps> = ({ onClose, onSubmit }) => {
  const [courierName, setCourierName] = useState('');
  const [trackingId, setTrackingId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courierName.trim() || !trackingId.trim()) {
        alert("Please fill out both fields.");
        return;
    }
    onSubmit(courierName, trackingId);
  };
  
  const inputClasses = "w-full mt-1 bg-surface text-text-main border border-gray-600 rounded-lg p-3 transition focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/50";

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className="bg-surface rounded-lg shadow-2xl w-full max-w-md p-6 border border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-text-main mb-4">Enter Shipping Details</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary" htmlFor="courierName">Courier Name</label>
            <input id="courierName" type="text" value={courierName} onChange={(e) => setCourierName(e.target.value)} required className={inputClasses} />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary" htmlFor="trackingId">Tracking ID</label>
            <input id="trackingId" type="text" value={trackingId} onChange={(e) => setTrackingId(e.target.value)} required className={inputClasses} />
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="bg-gray-600/50 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-500/50">Cancel</button>
            <button type="submit" className="bg-accent text-white font-bold py-2 px-4 rounded-lg hover:brightness-110">Save & Mark as Shipped</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShippingDetailsModal;