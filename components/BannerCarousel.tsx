
import React, { useState, useEffect, useCallback } from 'react';
import { Banner } from '../types.ts';

interface BannerCarouselProps {
  banners: Banner[];
}

const BannerCarousel: React.FC<BannerCarouselProps> = ({ banners }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = useCallback(() => {
    if (banners.length === 0) return;
    setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
  }, [banners.length]);

  useEffect(() => {
    if (banners.length <= 1) return;
    const slideInterval = setInterval(nextSlide, 5000);
    return () => clearInterval(slideInterval);
  }, [nextSlide, banners.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  if (banners.length === 0) return null;

  return (
    <div className="relative w-full h-44 md:h-64 overflow-hidden rounded-2xl shadow-sm border border-border group">
      <div
        className="flex transition-transform duration-700 cubic-bezier(0.4, 0, 0.2, 1) h-full"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {banners.map((banner, index) => (
          <div key={banner.id || index} className="w-full h-full flex-shrink-0 relative">
            <img
              src={banner.image_url}
              alt={banner.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex flex-col justify-end p-6 md:p-8">
              <h3 className="text-white text-xl md:text-3xl font-black uppercase tracking-tight drop-shadow-md">
                {banner.title}
              </h3>
              {banner.offer_text && (
                <p className="text-accent text-sm md:text-lg font-bold mt-1 drop-shadow-sm">
                  {banner.offer_text}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {banners.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2 z-10">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 rounded-full ${
                currentIndex === index ? 'w-8 h-2 bg-accent' : 'w-2 h-2 bg-white/50 hover:bg-white'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BannerCarousel;
