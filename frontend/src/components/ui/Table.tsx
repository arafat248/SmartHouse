import React from 'react';
import type { TdHTMLAttributes, ThHTMLAttributes, HTMLAttributes } from 'react';

export const Table = ({ children, className = '', ...props }: HTMLAttributes<HTMLTableElement> & { children: React.ReactNode }) => (
  <div className={`overflow-x-auto rounded-lg border border-slate-200 shadow-sm ${className}`}>
    <table className="min-w-full divide-y divide-slate-200" {...props}>
      {children}
    </table>
  </div>
);

export const TableHeader = ({ children, className = '', ...props }: HTMLAttributes<HTMLTableSectionElement> & { children: React.ReactNode }) => (
  <thead className={`bg-slate-50 ${className}`} {...props}>
    <tr>{children}</tr>
  </thead>
);

export const TableHead = ({ children, className = '', ...props }: ThHTMLAttributes<HTMLTableCellElement> & { children: React.ReactNode }) => (
  <th className={`px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider ${className}`} {...props}>
    {children}
  </th>
);

export const TableBody = ({ children, className = '', ...props }: HTMLAttributes<HTMLTableSectionElement> & { children: React.ReactNode }) => (
  <tbody className={`bg-white divide-y divide-slate-200 ${className}`} {...props}>
    {children}
  </tbody>
);

export const TableRow = ({ children, className = '', onClick, ...props }: HTMLAttributes<HTMLTableRowElement> & { children: React.ReactNode, onClick?: () => void }) => (
  <tr className={`${onClick ? 'cursor-pointer hover:bg-slate-50' : ''} ${className}`} onClick={onClick} {...props}>
    {children}
  </tr>
);

export const TableCell = ({ children, className = '', ...props }: TdHTMLAttributes<HTMLTableCellElement> & { children: React.ReactNode }) => (
  <td className={`px-6 py-4 whitespace-nowrap text-sm text-slate-900 ${className}`} {...props}>
    {children}
  </td>
);
