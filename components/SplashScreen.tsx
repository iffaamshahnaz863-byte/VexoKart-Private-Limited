
import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress >= 100) {
          clearInterval(timer);
          return 100;
        }
        const diff = Math.random() * 20;
        return Math.min(oldProgress + diff, 100);
      });
    }, 200);

    const finishTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onFinish, 500); // Allow fade animation to complete
    }, 2500);

    return () => {
      clearInterval(timer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div className={`fixed inset-0 z-[999] flex flex-col items-center justify-center bg-background transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="relative mb-8">
        {/* Stylized Logo Representation */}
        <div className="w-32 h-32 bg-gradient-to-br from-accent to-accent-secondary rounded-3xl shadow-2xl flex items-center justify-center transform rotate-12 transition-transform duration-1000 animate-pulse">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-white -rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
        </div>
      </div>
      
      <h1 className="text-4xl font-black text-text-main tracking-tighter mb-2 italic">
        Vexo<span className="text-accent">Kart</span>
      </h1>
      <p className="text-text-secondary font-medium tracking-widest text-xs uppercase mb-12">
        Shop Online, Shop Smart
      </p>

      <div className="w-64 h-1.5 bg-surface rounded-full overflow-hidden border border-border">
        <div 
          className="h-full bg-gradient-to-r from-accent to-accent-secondary transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      
      <p className="mt-4 text-text-muted text-[10px] uppercase font-bold animate-pulse">
        Initializing Vexo Experience...
      </p>
    </div>
  );
};

export default SplashScreen;
