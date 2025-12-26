
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
        const diff = Math.random() * 25;
        return Math.min(oldProgress + diff, 100);
      });
    }, 150);

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
    <div className={`fixed inset-0 z-[999] flex flex-col items-center justify-center bg-[#020204] transition-opacity duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="relative mb-10 group">
        {/* Glow effect behind the logo */}
        <div className="absolute inset-0 bg-accent/20 blur-3xl rounded-full scale-150 animate-pulse"></div>
        
        {/* Stylized Logo Icon based on the new brand identity */}
        <div className="relative w-40 h-40 bg-gradient-to-br from-[#0d0d14] to-[#1a1a2e] border border-white/10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-center overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_50%,_#3882F6_0%,_transparent_70%)]"></div>
            
            <div className="relative flex flex-col items-center">
              {/* The Shopping Bag inside the Cart aesthetic */}
              <div className="relative">
                {/* Bag */}
                <div className="w-10 h-12 bg-gradient-to-b from-[#8957E5] to-[#3882F6] rounded-t-lg mb-[-10px] mx-auto relative z-10 shadow-lg">
                  <div className="absolute top-1 left-1/2 -translate-x-1/2 w-4 h-3 border-2 border-white/30 rounded-full"></div>
                </div>
                {/* Cart Body */}
                <svg className="w-24 h-24 text-white drop-shadow-[0_0_15px_rgba(56,130,246,0.5)]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.707 15.293C4.077 15.923 4.523 17 5.414 17H17M17 17C15.8954 17 15 17.8954 15 19C15 20.1046 15.8954 21 17 21C18.1046 21 19 20.1046 19 19C19 17.8954 18.1046 17 17 17ZM9 17C7.89543 17 7 17.8954 7 19C7 20.1046 7.89543 21 9 21C10.1046 21 11 20.1046 11 19C11 17.8954 10.1046 17 9 17Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
        </div>
      </div>
      
      <div className="text-center">
        <h1 className="text-5xl font-black tracking-tighter mb-1 italic">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00d2ff] to-[#3a7bd5]">Vexo</span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3a7bd5] to-[#8957e5]">Kart</span>
        </h1>
        <p className="text-text-secondary font-bold tracking-[0.3em] text-[10px] uppercase mb-12 opacity-80">
          Shop Online • Shop Smart
        </p>
      </div>

      <div className="w-56 h-1 bg-white/5 rounded-full overflow-hidden border border-white/5 backdrop-blur-sm">
        <div 
          className="h-full bg-gradient-to-r from-[#00d2ff] via-[#3a7bd5] to-[#8957e5] transition-all duration-300 ease-out shadow-[0_0_10px_rgba(56,130,246,0.5)]"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      
      <p className="mt-4 text-text-muted text-[9px] uppercase font-black tracking-widest animate-pulse">
        Powering your lifestyle
      </p>
    </div>
  );
};

export default SplashScreen;
