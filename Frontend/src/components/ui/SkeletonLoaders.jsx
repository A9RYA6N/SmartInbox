import React from "react";

export const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-slate-200 rounded ${className}`} />
);

export const DashboardSkeleton = () => (
  <div className="space-y-8">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="h-32 w-full rounded-2xl" />
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <Skeleton className="lg:col-span-2 h-96 rounded-2xl" />
      <Skeleton className="h-96 rounded-2xl" />
    </div>
  </div>
);

export const ListSkeleton = ({ rows = 5 }) => (
  <div className="space-y-4">
    {[...Array(rows)].map((_, i) => (
      <Skeleton key={i} className="h-16 w-full rounded-xl" />
    ))}
  </div>
);

export const ChartSkeleton = () => (
  <div className="w-full h-64 flex items-end gap-2 px-4">
    {[...Array(12)].map((_, i) => (
      <Skeleton key={i} className={`flex-1`} style={{ height: `${Math.random() * 100}%` }} />
    ))}
  </div>
);
