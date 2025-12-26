
import React, { useState } from 'react';
import { useAdminCodes } from '../../context/AdminCodeContext';

interface GenerateCodeModalProps {
  onClose: () => void;
}

const GenerateCodeModal: React.FC<GenerateCodeModalProps> = ({ onClose }) => {
  const { generateCode } = useAdminCodes();
  const [note, setNote] = useState('');
  const [expiresAt, setExpiresAt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    generateCode(note, expiresAt || null);
    onClose();
  };
  
  const inputClasses = "w-full mt-1 bg-surface text-text-main border border-gray-600 rounded-lg p-3 transition focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/50";

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className="bg-surface rounded-lg shadow-2xl w-full max-w-md p-6 border border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-text-main mb-4">Generate New Admin Code</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary" htmlFor="note">Note (Optional)</label>
            <input id="note" type="text" value={note} onChange={(e) => setNote(e.target.value)} className={inputClasses} placeholder="e.g., For 'Jane's Boutique'" />
          </div>
           <div>
            <label className="block text-sm font-medium text-text-secondary" htmlFor="expiresAt">Expires At (Optional)</label>
            <input id="expiresAt" type="datetime-local" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} className={inputClasses} />
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="bg-gray-600/50 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-500/50">Cancel</button>
            <button type="submit" className="bg-accent text-white font-bold py-2 px-4 rounded-lg hover:brightness-110">Generate Code</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GenerateCodeModal;