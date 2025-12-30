import React, { ReactNode } from 'react';

interface GlassmorphicCardProps {
  children: ReactNode;
  className?: string;
  /* Fix: Add onClick to props to allow handling interaction from parent components */
  onClick?: () => void | Promise<void>;
}

const GlassmorphicCard: React.FC<GlassmorphicCardProps> = ({ children, className = '', onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`bg-white border border-border rounded-2xl shadow-premium transition-all duration-300 ${className}`}
    >
      {children}
    </div>
  );
};

export default GlassmorphicCard;