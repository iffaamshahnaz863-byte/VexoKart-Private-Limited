
import React from 'react';
import { StatusHistory } from '../../types';

interface OrderStatusHistoryModalProps {
  history: StatusHistory[];
  onClose: () => void;
}

const OrderStatusHistoryModal: React.FC<OrderStatusHistoryModalProps> = ({ history, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className="bg-surface rounded-lg shadow-2xl w-full max-w-md p-6 border border-gray-700 max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <h2 className="text-xl font-bold text-text-main">Order Status History</h2>
          <button onClick={onClose} className="text-text-muted hover:text-text-main text-2xl">&times;</button>
        </div>
        <div className="overflow-y-auto pr-2">
            <ul className="space-y-4 border-l-2 border-gray-700 ml-2">
            {history.slice().reverse().map((item, index) => (
                <li key={index} className="relative pl-8">
                <div className="absolute -left-[9px] w-4 h-4 bg-accent rounded-full mt-1.5 border-2 border-surface"></div>
                <div>
                    <p className="font-semibold text-text-main">Status updated to "{item.status}"</p>
                    <p className="text-xs text-text-muted">{new Date(item.timestamp).toLocaleString()}</p>
                </div>
                </li>
            ))}
            </ul>
        </div>
      </div>
    </div>
  );
};

export default OrderStatusHistoryModal;