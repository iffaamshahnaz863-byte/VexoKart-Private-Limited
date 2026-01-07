import React, { useState } from 'react';
import GlassmorphicCard from './GlassmorphicCard';
import { OrderItem } from '../types';

interface RateProductModalProps {
  item: OrderItem;
  orderId: string;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => void;
}

const RateProductModal: React.FC<RateProductModalProps> = ({ item, orderId, onClose, onSubmit }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);

  const labels = ["Very Bad", "Bad", "Ok-Ok", "Good", "Very Good"];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      alert("Please select a star rating.");
      return;
    }
    onSubmit(rating, comment);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl scale-in-center">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white">
          <h2 className="text-sm font-black uppercase tracking-widest text-gray-800 italic">Rate Product</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-800 transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
            <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover border border-white shadow-sm" />
            <p className="text-xs font-bold text-gray-700 line-clamp-1 italic uppercase tracking-tight">{item.name}</p>
          </div>

          <div className="text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4 italic">Overall Satisfaction</p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="transition-transform active:scale-90"
                >
                  <svg 
                    className={`w-10 h-10 transition-colors ${
                      (hoverRating || rating) >= star ? 'text-yellow-400' : 'text-gray-100'
                    }`} 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs font-black text-accent uppercase italic tracking-widest">{labels[(hoverRating || rating) - 1]}</p>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block italic">Add Detailed Feedback</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us about the quality, fit, or look..."
              className="w-full bg-gray-50 text-gray-800 border border-gray-100 focus:border-accent rounded-2xl p-4 text-xs h-24 transition-all resize-none shadow-inner font-medium"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-accent text-white font-black uppercase tracking-widest text-[11px] py-4 rounded-2xl shadow-xl shadow-accent/20 hover:-translate-y-1 active:translate-y-0 transition-all"
          >
            Submit Verified Review
          </button>
        </form>
      </div>
    </div>
  );
};

export default RateProductModal;
