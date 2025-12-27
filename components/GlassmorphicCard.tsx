
import React, { ReactNode } from 'react';

interface GlassmorphicCardProps {
  children: ReactNode;
  className?: string;
}

const GlassmorphicCard: React.FC<GlassmorphicCardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-white border border-border rounded-2xl shadow-premium transition-all duration-300 ${className}`}>
      {children}
    </div>
  );
};

export default GlassmorphicCard;
