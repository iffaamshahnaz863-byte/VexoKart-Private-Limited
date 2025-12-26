
import React from 'react';

interface SkeletonProps {
  className?: string;
  light?: boolean;
}

const Skeleton: React.FC<SkeletonProps> = ({ className = "", light = false }) => {
  const bgClass = light ? "bg-gray-100" : "bg-surface";
  const shimmerClass = light ? "via-white/50" : "via-white/5";
  return (
    <div className={`${bgClass} relative overflow-hidden rounded ${className}`}>
      <div className={`absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent ${shimmerClass} to-transparent`}></div>
    </div>
  );
};

export const ProductCardSkeleton: React.FC = () => (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
        <Skeleton className="w-full h-56 rounded-none" light={false} />
        <div className="p-5 space-y-4">
            <Skeleton className="h-5 w-4/5" light={false} />
            <Skeleton className="h-3 w-2/3" light={false} />
            <div className="flex justify-between items-center pt-3">
                <Skeleton className="h-8 w-24 rounded-lg" light={false} />
                <Skeleton className="h-4 w-12" light={false} />
            </div>
        </div>
    </div>
);

export const CategoryChipSkeleton: React.FC = () => (
    <div className="flex-shrink-0 p-4 rounded-2xl bg-surface border border-border w-28 shadow-sm">
        <Skeleton className="w-16 h-16 rounded-full mx-auto mb-3" light={false} />
        <Skeleton className="h-3 w-16 mx-auto" light={false} />
    </div>
);

export default Skeleton;
