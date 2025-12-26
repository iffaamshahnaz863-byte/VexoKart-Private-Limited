
import React from 'react';

interface SkeletonProps {
  className?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({ className = "" }) => {
  return (
    <div className={`bg-surface relative overflow-hidden rounded ${className}`}>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
    </div>
  );
};

export const ProductCardSkeleton: React.FC = () => (
    <div className="bg-surface/70 border border-border rounded-xl overflow-hidden p-0">
        <Skeleton className="w-full h-48 rounded-none" />
        <div className="p-4 space-y-3">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex justify-between items-center pt-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-4 w-12" />
            </div>
        </div>
    </div>
);

export const CategoryChipSkeleton: React.FC = () => (
    <div className="flex-shrink-0 p-4 rounded-lg bg-surface/70 border border-border w-24">
        <Skeleton className="w-16 h-16 rounded-full mx-auto mb-2" />
        <Skeleton className="h-4 w-12 mx-auto" />
    </div>
);

export default Skeleton;
