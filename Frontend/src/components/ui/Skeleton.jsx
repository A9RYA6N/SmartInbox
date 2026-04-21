import React from "react";

export const Skeleton = ({ className, count = 1 }) => {
  return (
    <div className="flex flex-col gap-4 w-full">
      {Array.from({ length: count }).map((_, i) => (
        <div 
          key={i} 
          className={`bg-white/5 animate-pulse rounded-xl relative overflow-hidden ${className}`}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.05] to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
        </div>
      ))}
    </div>
  );
};

export const CardSkeleton = () => (
  <div className="glass p-6 rounded-3xl border border-white/10 space-y-4">
    <div className="w-12 h-12 bg-white/5 rounded-2xl animate-pulse" />
    <div className="space-y-2">
      <div className="w-24 h-3 bg-white/5 rounded animate-pulse" />
      <div className="w-32 h-8 bg-white/5 rounded animate-pulse" />
    </div>
  </div>
);
