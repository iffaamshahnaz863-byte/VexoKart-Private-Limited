

import React, { useState, useRef } from 'react';
import { OrderItem } from '../types';
import { useReviews } from '../context/ReviewContext';

interface RateProductModalProps {
  item: OrderItem;
  orderId: string;
  onClose: () => void;
  onSubmit: () => void;
}

const RateProductModal: React.FC<RateProductModalProps> = ({ item, orderId, onClose, onSubmit }) => {
  const { addReview, isSubmitting } = useReviews();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
  const [images, setImages] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const labels = ["Very Bad", "Bad", "Ok-Ok", "Good", "Very Good"];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files) as File[];
      files.forEach(file => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setImages(prev => [...prev, reader.result as string].slice(0, 5));
          };
          reader.readAsDataURL(file);
        } else if (file.type.startsWith('video/')) {
          const url = URL.createObjectURL(file);
          setVideoUrl(url);
        }
      });
    }
  };

  const removeImage = (idx: number) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addReview({
        // Fix: Ensure product_id is a number
        product_id: Number(item.id),
        order_id: Number(orderId), // Ensure it's a number for the DB
        rating,
        review_text: comment,
        images,
        video_url: videoUrl || undefined // Use video_url string property
      });
      onSubmit();
      onClose();
    } catch (err: any) {
      alert(err.message || "Failed to submit review");
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl scale-in-center max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <h2 className="text-sm font-black uppercase tracking-widest text-gray-800 italic">Rate Product</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-800 transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8 overflow-y-auto">
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
             <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 block italic">Add Photos & Video (Optional)</label>
             <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-20 h-20 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center shrink-0 active:bg-gray-100"
                >
                  <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  <span className="text-[8px] font-black text-gray-400 mt-1 uppercase">Add Media</span>
                </button>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*" multiple onChange={handleFileChange} />
                
                {images.map((img, idx) => (
                  <div key={idx} className="relative w-20 h-20 shrink-0">
                    <img src={img} className="w-full h-full object-cover rounded-2xl border border-gray-100" />
                    <button type="button" onClick={() => removeImage(idx)} className="absolute -top-1 -right-1 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shadow-sm">×</button>
                  </div>
                ))}

                {videoUrl && (
                  <div className="relative w-20 h-20 shrink-0">
                     <video src={videoUrl} className="w-full h-full object-cover rounded-2xl border border-gray-100" />
                     <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" /></svg>
                     </div>
                     <button type="button" onClick={() => setVideoUrl('')} className="absolute -top-1 -right-1 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shadow-sm">×</button>
                  </div>
                )}
             </div>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block italic">Add Detailed Feedback</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us about the quality, fit, or look..."
              className="w-full bg-gray-50 text-gray-800 border border-gray-100 focus:border-accent rounded-2xl p-4 text-xs h-24 transition-all resize-none shadow-inner font-medium outline-none"
            />
          </div>

          <div className="flex items-center gap-2 bg-[#E7F7F0] p-3 rounded-xl border border-[#D1F7E6]">
             <svg className="w-4 h-4 text-[#34BE82]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
             <span className="text-[9px] font-black text-[#34BE82] uppercase tracking-widest">Verified Purchase Badge will be added</span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-accent text-white font-black uppercase tracking-widest text-[11px] py-4 rounded-2xl shadow-xl shadow-accent/20 hover:-translate-y-1 active:translate-y-0 transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Verified Review'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RateProductModal;
