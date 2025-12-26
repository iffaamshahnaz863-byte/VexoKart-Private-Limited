
import React, { ReactNode } from 'react';

interface GlassmorphicCardProps {
  children: ReactNode;
  className?: string;
}

const GlassmorphicCard: React.FC<GlassmorphicCardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-surface/70 backdrop-blur-sm border border-border rounded-xl shadow-lg overflow-hidden ${className}`}>
      {children}
    </div>
  );
};

export default GlassmorphicCard;
