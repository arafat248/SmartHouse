import { forwardRef, useId } from 'react';
import type { SelectHTMLAttributes } from 'react';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', label, error, helperText, id, children, ...props }, ref) => {
    const defaultId = useId();
    const selectId = id || defaultId;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="block text-sm font-medium text-slate-700 mb-1">
            {label}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          className={`block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm 
            ${error ? 'border-red-300 text-red-900 focus:border-red-500 focus:ring-red-500' : 'border-slate-300'}
            disabled:bg-slate-50 disabled:text-slate-500
            ${className}`}
          {...props}
        >
          {children}
        </select>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        {helperText && !error && <p className="mt-1 text-sm text-slate-500">{helperText}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';
