
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      alert("Please select a star rating.");
      return;
    }
    onSubmit(rating, comment);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/90 backdrop-blur-md animate-in fade-in duration-300">
      <GlassmorphicCard className="w-full max-w-md p-6 border-white/10 shadow-2xl scale-in-center overflow-visible">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4">
            <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover border border-white/5 shadow-inner" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-1">Reviewing Product</p>
              <h3 className="text-text-main font-bold truncate max-w-[180px] tracking-tight">{item.name}</h3>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-text-muted hover:text-text-main transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-4">Overall Satisfaction</p>
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
                      (hoverRating || rating) >= star ? 'text-yellow-400' : 'text-white/10'
                    }`} 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 block">Tell us more</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you like or dislike?"
              className="w-full bg-background/50 text-text-main border border-white/5 focus:border-accent rounded-xl p-4 text-sm h-32 transition-all resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-accent text-white font-black uppercase tracking-widest text-[11px] py-4 rounded-xl shadow-lg shadow-accent/20 hover:-translate-y-1 transition-all"
          >
            Submit Verified Review
          </button>
        </form>
      </GlassmorphicCard>
    </div>
  );
};

export default RateProductModal;
