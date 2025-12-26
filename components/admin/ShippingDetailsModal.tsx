
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

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className="bg-navy-light rounded-lg shadow-2xl w-full max-w-md p-6 border border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-white mb-4">Enter Shipping Details</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300" htmlFor="courierName">Courier Name</label>
            <input id="courierName" type="text" value={courierName} onChange={(e) => setCourierName(e.target.value)} required className="w-full mt-1 input-style" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300" htmlFor="trackingId">Tracking ID</label>
            <input id="trackingId" type="text" value={trackingId} onChange={(e) => setTrackingId(e.target.value)} required className="w-full mt-1 input-style" />
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="bg-gray-600/50 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-500/50">Cancel</button>
            <button type="submit" className="bg-teal-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-teal-600">Save & Mark as Shipped</button>
          </div>
        </form>
      </div>
       <style>{`
          .input-style {
            background-color: #1f2937;
            color: white;
            border: 1px solid #4b5563;
            border-radius: 0.5rem;
            padding: 0.75rem;
            transition: border-color 0.2s, box-shadow 0.2s;
          }
          .input-style:focus {
            outline: none;
            border-color: #2dd4bf;
            box-shadow: 0 0 0 2px rgba(45, 212, 191, 0.5);
          }
        `}</style>
    </div>
  );
};

export default ShippingDetailsModal;
