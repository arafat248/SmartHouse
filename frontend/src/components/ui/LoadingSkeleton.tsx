import React from 'react';

export const LoadingSkeleton = ({ rows = 3, className = '' }: { rows?: number, className?: string }) => {
  return (
    <div className={`animate-pulse space-y-4 ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-10 bg-slate-200 rounded"></div>
      ))}
    </div>
  );
};
