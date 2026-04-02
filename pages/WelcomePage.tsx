
import React from 'react';
import { useNavigate } from 'react-router-dom';

const WelcomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between p-6 pt-20 pb-10">
      
      <div className="flex flex-col items-center justify-center flex-grow animate-in fade-in duration-700">
        <div className="w-32 h-32 bg-orange-50 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-inner transform -rotate-3">
            <svg className="w-16 h-16 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
        </div>
        <h1 className="text-5xl font-black text-text-main italic uppercase tracking-tighter leading-none text-center">
          VEXO<span className="text-accent">KART</span>
        </h1>
        <p className="text-gray-400 font-bold text-xs uppercase tracking-[0.4em] mt-3">Premium Delivery</p>
      </div>

      <div className="w-full space-y-5 animate-in slide-in-from-bottom-8 duration-500">
        <button 
          onClick={() => navigate('/login')}
          className="w-full bg-accent text-white py-4 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-accent/30 active:scale-95 transition-all"
        >
          Login or Sign Up
        </button>

        <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink-0 mx-4 text-gray-300 text-[10px] font-black uppercase tracking-widest">or</span>
            <div className="flex-grow border-t border-gray-200"></div>
        </div>

        <button 
          onClick={() => navigate('/home')}
          className="w-full bg-gray-50 text-gray-700 py-4 rounded-2xl font-black uppercase tracking-widest text-xs border border-gray-100 active:bg-gray-100 transition-all active:scale-95"
        >
          Skip to Browse
        </button>
      </div>
    </div>
  );
};

export default WelcomePage;
