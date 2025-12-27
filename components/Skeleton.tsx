
import React from 'react';

interface SkeletonProps {
  className?: string;
  light?: boolean;
}

const Skeleton: React.FC<SkeletonProps> = ({ className = "", light = false }) => {
  const bgClass = light ? "bg-white" : "bg-surface";
  const shimmerClass = "via-white/60";
  return (
    <div className={`${bgClass} relative overflow-hidden rounded ${className}`}>
      <div className={`absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent ${shimmerClass} to-transparent`}></div>
    </div>
  );
};

export const ProductCardSkeleton: React.FC = () => (
    <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm">
        <Skeleton className="w-full h-48 rounded-none" light={false} />
        <div className="p-4 space-y-3">
            <Skeleton className="h-4 w-4/5" light={false} />
            <Skeleton className="h-3 w-1/2" light={false} />
            <div className="flex justify-between items-center pt-3">
                <Skeleton className="h-6 w-16 rounded-lg" light={false} />
                <Skeleton className="h-4 w-8" light={false} />
            </div>
        </div>
    </div>
);

export const CategoryChipSkeleton: React.FC = () => (
    <div className="flex-shrink-0 px-6 py-2 rounded-full bg-white border border-border w-28 shadow-sm">
        <Skeleton className="h-3 w-full" light={false} />
    </div>
);

export default Skeleton;
