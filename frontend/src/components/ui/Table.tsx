import React from 'react';

export const Table = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <div className={`overflow-x-auto rounded-lg border border-slate-200 shadow-sm ${className}`}>
    <table className="min-w-full divide-y divide-slate-200">
      {children}
    </table>
  </div>
);

export const TableHeader = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <thead className={`bg-slate-50 ${className}`}>
    <tr>{children}</tr>
  </thead>
);

export const TableHead = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <th className={`px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider ${className}`}>
    {children}
  </th>
);

export const TableBody = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <tbody className={`bg-white divide-y divide-slate-200 ${className}`}>
    {children}
  </tbody>
);

export const TableRow = ({ children, className = '', onClick }: { children: React.ReactNode, className?: string, onClick?: () => void }) => (
  <tr className={`${onClick ? 'cursor-pointer hover:bg-slate-50' : ''} ${className}`} onClick={onClick}>
    {children}
  </tr>
);

export const TableCell = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <td className={`px-6 py-4 whitespace-nowrap text-sm text-slate-900 ${className}`}>
    {children}
  </td>
);
