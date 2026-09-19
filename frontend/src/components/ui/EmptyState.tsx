import React from 'react';
import { FileQuestion } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState = ({ title, description, icon, actionText, onAction }: EmptyStateProps) => {
  return (
    <div className="text-center p-12 bg-white rounded-lg border border-slate-200 border-dashed">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-4">
        {icon || <FileQuestion className="h-6 w-6" />}
      </div>
      <h3 className="mt-2 text-sm font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">{description}</p>
      {actionText && onAction && (
        <div className="mt-6">
          <Button onClick={onAction}>
            {actionText}
          </Button>
        </div>
      )}
    </div>
  );
};
