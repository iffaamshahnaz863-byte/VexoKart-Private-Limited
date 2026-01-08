import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [phase, setPhase] = useState(0); // 0: Init, 1: Draw, 2: Reveal, 3: Finish

  useEffect(() => {
    // Sequence Logic
    const timers = [
      setTimeout(() => setPhase(1), 500),   // Start drawing logo
      setTimeout(() => setPhase(2), 2000),  // Reveal text & shimmer
      setTimeout(() => setPhase(3), 3200),  // Start exit fade
      setTimeout(() => {
        setIsVisible(false);
        onFinish();
      }, 3800)                              // Unmount
    ];

    return () => timers.forEach(clearTimeout);
  }, [onFinish]);

  return (
    <div 
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden transition-opacity duration-700 ease-out ${phase === 3 ? 'opacity-0' : 'opacity-100'}`}
      style={{
        background: 'radial-gradient(circle at center, #1E293B 0%, #0F172A 100%)'
      }}
    >
      {/* Ambient Background Glow (Rich Orange) */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] bg-[#FF6A00] rounded-full blur-[120px] opacity-10 transition-all duration-[2000ms] ${phase >= 1 ? 'scale-100 opacity-20' : 'scale-50'}`} />

      {/* Main Logo Container */}
      <div className="relative z-10 flex flex-col items-center">
        
        {/* Animated Cart Icon */}
        <div className="relative w-32 h-32 mb-6">
          <svg 
            width="128" 
            height="128" 
            viewBox="0 0 100 100" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className={`transition-all duration-1000 ${phase >= 1 ? 'opacity-100' : 'opacity-0'} ${phase >= 2 ? 'drop-shadow-[0_0_15px_rgba(255,106,0,0.5)]' : ''}`}
          >
            {/* Defs for Gradients */}
            <defs>
              <linearGradient id="orangeGold" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FF6A00" />
                <stop offset="100%" stopColor="#FFD166" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {/* Shopping Bag (Inside Cart) - Slides Down */}
            <g className={`transition-transform duration-1000 ease-out ${phase >= 1 ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'}`} style={{ transitionDelay: '300ms' }}>
               <rect x="35" y="20" width="30" height="35" rx="4" fill="rgba(255,255,255,0.1)" stroke="url(#orangeGold)" strokeWidth="1.5" />
               <path d="M42 20V15C42 12 44 10 50 10C56 10 58 12 58 15V20" stroke="url(#orangeGold)" strokeWidth="1.5" strokeLinecap="round" />
            </g>

            {/* Cart Body - Stroke Animation */}
            <path 
              d="M10 25H22L30 65C30.5 68 32 70 36 70H75C79 70 81 68 82 65L88 35H25" 
              stroke="url(#orangeGold)" 
              strokeWidth="4" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className="cart-stroke"
              style={{
                strokeDasharray: 300,
                strokeDashoffset: phase >= 1 ? 0 : 300,
                transition: 'stroke-dashoffset 1.5s ease-in-out'
              }}
            />

            {/* Wheels - Scale In */}
            <g className={`transition-all duration-500 ease-back-out ${phase >= 1 ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`} style={{ transitionDelay: '1000ms' }}>
              <circle cx="38" cy="82" r="5" fill="#FF6A00" />
              <circle cx="78" cy="82" r="5" fill="#FF6A00" />
            </g>

            {/* Speed Lines - Slide In */}
            <g className={`transition-all duration-700 ease-out ${phase >= 1 ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`} style={{ transitionDelay: '600ms' }}>
               <path d="M5 45H15" stroke="#FFD166" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
               <path d="M2 55H12" stroke="#FFD166" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
               <path d="M8 35H18" stroke="#FFD166" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
            </g>
          </svg>
        </div>

        {/* Brand Text */}
        <div className="relative overflow-hidden pt-2 pb-2 px-4">
          <h1 
            className={`text-4xl font-bold tracking-tight text-white transition-all duration-1000 transform ${phase >= 2 ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Vexo<span className="text-[#FF6A00]">Kart</span>
          </h1>
          
          {/* Shimmer Effect Overlay */}
          <div 
            className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-20deg] ${phase >= 2 ? 'animate-shimmer' : 'hidden'}`} 
            style={{ width: '200%', left: '-200%' }}
          />
        </div>

        {/* Tagline */}
        <p 
          className={`mt-2 text-[10px] font-bold uppercase tracking-[0.4em] text-gray-400 transition-all duration-1000 delay-300 ${phase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
        >
          Premium Commerce
        </p>
      </div>

      {/* Global Styles for Animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shimmer {
          0% { transform: translateX(0); }
          100% { transform: translateX(200%); }
        }
        .animate-shimmer {
          animation: shimmer 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        .ease-back-out {
          transition-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}} />
    </div>
  );
};

export default SplashScreen;