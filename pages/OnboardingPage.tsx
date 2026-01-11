
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const slides = [
  {
    id: 1,
    bg: 'bg-gradient-to-br from-orange-400 to-red-500',
    emoji: '🛍️',
    heading: 'Fashion and more',
    subtext: "Let's not forget the drip",
    btnText: 'Get Started'
  },
  {
    id: 2,
    bg: 'bg-gradient-to-br from-teal-400 to-green-500',
    emoji: '🛵',
    heading: 'Welcome',
    subtext: "Kashmir's First Fast Delivery App",
    btnText: 'Next'
  },
  {
    id: 3,
    bg: 'bg-gradient-to-br from-yellow-400 to-orange-500',
    emoji: '🍔',
    heading: 'Everything You Wish',
    subtext: 'Get everything within 30 min',
    btnText: 'Next'
  }
];

const OnboardingPage: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();
  const { user, completeOnboarding } = useAuth();

  const handleNext = async () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      // Logic: If logged in, update DB. If not, update LocalStorage.
      if (user) {
          await completeOnboarding();
          navigate('/home', { replace: true });
      } else {
          localStorage.setItem('vxk_device_onboarding', 'true');
          navigate('/welcome', { replace: true });
      }
    }
  };

  return (
    <div className="h-screen w-full relative overflow-hidden flex flex-col font-sans">
      {/* Slides Container */}
      <div 
        className="flex-1 w-full relative transition-all duration-500 ease-in-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)`, display: 'flex' }}
      >
        {slides.map((slide) => (
          <div 
            key={slide.id} 
            className={`min-w-full h-full ${slide.bg} flex flex-col items-center justify-center p-8 text-white relative`}
          >
            {/* Visual */}
            <div className="w-64 h-64 bg-white/20 rounded-full flex items-center justify-center mb-10 backdrop-blur-sm animate-in zoom-in duration-700 shadow-2xl">
               <span className="text-9xl drop-shadow-lg">{slide.emoji}</span>
            </div>

            {/* Content */}
            <div className="text-center z-10 max-w-xs animate-in slide-in-from-bottom-10 duration-700">
              <h1 className="text-4xl font-black uppercase italic tracking-tighter leading-tight mb-2 drop-shadow-md">
                {slide.heading}
              </h1>
              <p className="text-lg font-medium opacity-90 tracking-wide">
                {slide.subtext}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Sticky Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 p-6 z-50 flex flex-col items-center gap-6">
        
        {/* Pagination Dots */}
        <div className="flex gap-2">
          {slides.map((_, idx) => (
            <div 
              key={idx} 
              className={`h-2 rounded-full transition-all duration-300 shadow-sm ${currentSlide === idx ? 'w-8 bg-white' : 'w-2 bg-white/40'}`}
            />
          ))}
        </div>

        {/* Action Button */}
        <button 
          onClick={handleNext}
          className="w-full bg-white text-black py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-sm shadow-2xl active:scale-95 transition-all hover:bg-gray-50"
        >
          {currentSlide === slides.length - 1 ? 'Start Shopping' : slides[currentSlide].btnText}
        </button>
      </div>
    </div>
  );
};

export default OnboardingPage;
