
import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 2000),
      setTimeout(() => setPhase(3), 3200),
      setTimeout(onFinish, 3800)
    ];
    return () => timers.forEach(clearTimeout);
  }, [onFinish]);

  return (
    <div 
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden transition-opacity duration-700 ease-out ${phase === 3 ? 'opacity-0' : 'opacity-100'}`}
      style={{ background: 'radial-gradient(circle at center, #1E293B 0%, #0F172A 100%)' }}
    >
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] bg-primary rounded-full blur-[120px] opacity-10 transition-all duration-[2000ms] ${phase >= 1 ? 'scale-100 opacity-20' : 'scale-50'}`} />

      <div className="relative z-10 flex flex-col items-center">
        <div className="relative w-32 h-32 mb-6">
          <svg 
            viewBox="0 0 100 100" 
            className={`transition-all duration-1000 ${phase >= 1 ? 'opacity-100' : 'opacity-0'} ${phase >= 2 ? 'drop-shadow-[0_0_15px_rgba(40,116,240,0.5)]' : ''}`}
          >
            <defs>
              <linearGradient id="logoGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#2874F0" />
                <stop offset="100%" stopColor="#FF9900" />
              </linearGradient>
            </defs>
            <path 
              d="M50 10 L90 30 L90 70 L50 90 L10 70 L10 30 Z" 
              stroke="url(#logoGrad)" 
              strokeWidth="6" 
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                strokeDasharray: 240,
                strokeDashoffset: phase >= 1 ? 0 : 240,
                transition: 'stroke-dashoffset 1.5s ease-in-out'
              }}
            />
            <text x="50" y="58" fontFamily="Roboto, sans-serif" fontSize="30" fontWeight="900" textAnchor="middle" fill="url(#logoGrad)">
              DC
            </text>
          </svg>
        </div>
        <div className="relative overflow-hidden pt-2 pb-2 px-4">
          <h1 
            className={`text-4xl font-black tracking-tighter text-white transition-all duration-1000 transform ${phase >= 2 ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}
          >
            DAR CYCLE <span className="text-primary">HUB</span>
          </h1>
          <div 
            className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-20deg] ${phase >= 2 ? 'animate-shimmer' : 'hidden'}`} 
            style={{ width: '200%', left: '-200%' }}
          />
        </div>
        <p 
          className={`mt-2 text-[10px] font-bold uppercase tracking-[0.4em] text-gray-400 transition-all duration-1000 delay-300 ${phase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
        >
          Premium Cycles
        </p>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shimmer { 0% { transform: translateX(0); } 100% { transform: translateX(200%); } }
        .animate-shimmer { animation: shimmer 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
      `}} />
    </div>
  );
};

export default SplashScreen;
