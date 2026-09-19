import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle } from 'lucide-react';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
}

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = false,
  isLoading = false,
}: ConfirmDialogProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="sm">
      <div className="sm:flex sm:items-start mt-2">
        {isDestructive && (
          <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
            <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
          </div>
        )}
        <div className={`mt-3 text-center sm:mt-0 sm:text-left ${isDestructive ? 'sm:ml-4' : ''}`}>
          <div className="mt-2">
            <p className="text-sm text-slate-500">{message}</p>
          </div>
        </div>
      </div>
      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-3 border-t border-slate-200 pt-4">
        <Button
          variant={isDestructive ? 'danger' : 'primary'}
          onClick={onConfirm}
          isLoading={isLoading}
          className="w-full sm:w-auto"
        >
          {confirmText}
        </Button>
        <Button
          variant="outline"
          onClick={onClose}
          disabled={isLoading}
          className="mt-3 w-full sm:mt-0 sm:w-auto"
        >
          {cancelText}
        </Button>
      </div>
    </Modal>
  );
};
