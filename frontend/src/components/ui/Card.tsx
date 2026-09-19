import React from 'react';

export const Card = ({ className = '', children }: { className?: string, children: React.ReactNode }) => {
  return (
    <div className={`bg-white shadow-sm border border-slate-200 rounded-lg ${className}`}>
      {children}
    </div>
  );
};

export const CardHeader = ({ className = '', children }: { className?: string, children: React.ReactNode }) => {
  return (
    <div className={`px-6 py-4 border-b border-slate-200 ${className}`}>
      {children}
    </div>
  );
};

export const CardTitle = ({ className = '', children }: { className?: string, children: React.ReactNode }) => {
  return (
    <h3 className={`text-lg font-semibold leading-6 text-slate-900 ${className}`}>
      {children}
    </h3>
  );
};

export const CardContent = ({ className = '', children }: { className?: string, children: React.ReactNode }) => {
  return (
    <div className={`px-6 py-4 ${className}`}>
      {children}
    </div>
  );
};

export const CardFooter = ({ className = '', children }: { className?: string, children: React.ReactNode }) => {
  return (
    <div className={`px-6 py-4 bg-slate-50 border-t border-slate-200 rounded-b-lg ${className}`}>
      {children}
    </div>
  );
};
