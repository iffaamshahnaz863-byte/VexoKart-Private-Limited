
import React from 'react';
import { motion } from 'motion/react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  showBackButton?: boolean;
  backTo?: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ 
  children, 
  title, 
  subtitle, 
  showBackButton = true,
  backTo = '/home'
}) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden"
      >
        <div className="p-8 sm:p-10">
          {showBackButton && (
            <button 
              onClick={() => navigate(backTo)}
              className="mb-8 flex items-center gap-2 text-slate-400 hover:text-primary transition-colors group"
            >
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                <ChevronLeft size={18} />
              </div>
              <span className="text-sm font-medium">Back</span>
            </button>
          )}

          <div className="mb-10 text-center">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">
              {title}
            </h1>
            <p className="text-slate-500 text-sm">
              {subtitle}
            </p>
          </div>

          {children}
        </div>
      </motion.div>
      
      <div className="mt-8 text-center">
        <p className="text-slate-400 text-xs">
          &copy; {new Date().getFullYear()} DAR CYCLE HUB. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default AuthLayout;
