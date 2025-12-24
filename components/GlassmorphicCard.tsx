
import React, { ReactNode } from 'react';

interface GlassmorphicCardProps {
  children: ReactNode;
  className?: string;
}

const GlassmorphicCard: React.FC<GlassmorphicCardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-navy-light/50 backdrop-blur-sm border border-gray-700/50 rounded-xl shadow-lg overflow-hidden ${className}`}>
      {children}
    </div>
  );
};

export default GlassmorphicCard;
