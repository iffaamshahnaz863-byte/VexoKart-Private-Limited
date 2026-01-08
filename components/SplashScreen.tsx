import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [startReveal, setStartReveal] = useState(false);

  useEffect(() => {
    // Start revealing text after shards assemble
    const revealTimer = setTimeout(() => {
      setStartReveal(true);
    }, 1200);

    // Total duration of the splash
    const finishTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onFinish, 600); // Wait for the fade-out to complete
    }, 3200);

    return () => {
      clearTimeout(revealTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div 
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white transition-opacity duration-700 ease-in-out ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      style={{
        background: 'radial-gradient(circle, #ffffff 0%, #fdf9f4 100%)'
      }}
    >
      {/* Background Subtle Dust Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        {[...Array(6)].map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full bg-accent animate-pulse"
            style={{
              width: Math.random() * 4 + 2 + 'px',
              height: Math.random() * 4 + 2 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
              animationDuration: (Math.random() * 3 + 2) + 's',
              animationDelay: (Math.random() * 2) + 's'
            }}
          />
        ))}
      </div>

      <div className="relative flex flex-col items-center">
        {/* Assemble Logo Container */}
        <div className="relative w-24 h-24 mb-6">
          {/* Logo Shard: Top Left */}
          <div className="absolute top-0 left-0 w-1/2 h-1/2 shard-tl animate-shard-tl">
            <div className="w-full h-full bg-accent rounded-tl-2xl rounded-br-lg shadow-sm"></div>
          </div>
          {/* Logo Shard: Top Right */}
          <div className="absolute top-0 right-0 w-1/2 h-1/2 shard-tr animate-shard-tr">
            <div className="w-full h-full bg-accent/90 rounded-tr-2xl rounded-bl-lg shadow-sm"></div>
          </div>
          {/* Logo Shard: Bottom Left */}
          <div className="absolute bottom-0 left-0 w-1/2 h-1/2 shard-bl animate-shard-bl">
            <div className="w-full h-full bg-accent/80 rounded-bl-2xl rounded-tr-lg shadow-sm"></div>
          </div>
          {/* Logo Shard: Bottom Right */}
          <div className="absolute bottom-0 right-0 w-1/2 h-1/2 shard-br animate-shard-br">
            <div className="w-full h-full bg-black rounded-br-2xl rounded-tl-lg shadow-sm"></div>
          </div>

          {/* Glow sweep overlay */}
          <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none z-10">
             <div className="w-full h-full animate-sweep-glow" 
                  style={{
                    background: 'linear-gradient(135deg, transparent 0%, transparent 40%, rgba(255,255,255,0.6) 50%, transparent 60%, transparent 100%)',
                    backgroundSize: '200% 200%',
                    mixBlendMode: 'overlay'
                  }}
             />
          </div>
        </div>

        {/* Brand Text Identity */}
        <div className={`text-center transition-all duration-1000 transform ${startReveal ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <h1 className="text-4xl font-black italic tracking-tighter text-gray-900">
            Vexo<span className="text-accent">Kart</span>
          </h1>
          <p className="mt-2 text-[9px] font-black uppercase tracking-[0.4em] text-gray-400">
            Shop Online • Shop Smart
          </p>
        </div>
      </div>

      {/* Embedded Animation Keyframes */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shard-tl {
          0% { transform: translate(-100px, -100px) rotate(-45deg); opacity: 0; }
          100% { transform: translate(0, 0) rotate(0); opacity: 1; }
        }
        @keyframes shard-tr {
          0% { transform: translate(100px, -100px) rotate(45deg); opacity: 0; }
          100% { transform: translate(0, 0) rotate(0); opacity: 1; }
        }
        @keyframes shard-bl {
          0% { transform: translate(-100px, 100px) rotate(45deg); opacity: 0; }
          100% { transform: translate(0, 0) rotate(0); opacity: 1; }
        }
        @keyframes shard-br {
          0% { transform: translate(100px, 100px) rotate(-45deg); opacity: 0; }
          100% { transform: translate(0, 0) rotate(0); opacity: 1; }
        }
        @keyframes sweep-glow {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .animate-shard-tl { animation: shard-tl 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        .animate-shard-tr { animation: shard-tr 1.2s 0.1s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; opacity: 0; }
        .animate-shard-bl { animation: shard-bl 1.2s 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; opacity: 0; }
        .animate-shard-br { animation: shard-br 1.2s 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; opacity: 0; }
        .animate-sweep-glow { animation: sweep-glow 1.5s 1.3s ease-out forwards; }
      `}} />
    </div>
  );
};

export default SplashScreen;