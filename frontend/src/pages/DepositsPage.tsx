import { useState } from 'react';
import {
  useGetDepositsQuery,
  useCreateDepositMutation,
  useUpdateDepositMutation,
  useDeleteDepositMutation
} from '../features/deposits/depositsApi';
import { DepositTable } from '../components/deposits/DepositTable';
import { DepositForm } from '../components/deposits/DepositForm';
import { DepositFilters } from '../components/deposits/DepositFilters';
import { DepositSummary } from '../components/deposits/DepositSummary';
import type { Deposit, DepositInput } from '../types/deposit';
import { Button } from '../components/ui/Button';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Plus } from 'lucide-react';

export const DepositsPage = () => {
  const [filters, setFilters] = useState({ member: '', payment_method: '', deposit_date__gte: '' });
  const [page, setPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDeposit, setEditingDeposit] = useState<Deposit | undefined>(undefined);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: depositsData, isLoading, refetch } = useGetDepositsQuery({
    page,
    member: filters.member,
    payment_method: filters.payment_method,
    deposit_date__gte: filters.deposit_date__gte ? filters.deposit_date__gte : undefined,
  });

  const [createDeposit] = useCreateDepositMutation();
  const [updateDeposit] = useUpdateDepositMutation();
  const [deleteDeposit] = useDeleteDepositMutation();

  const handleFilterChange = (newFilters: { member: string; payment_method: string; deposit_date__gte: string }) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleSave = async (data: DepositInput) => {
    try {
      if (editingDeposit) {
        await updateDeposit({ id: editingDeposit.id, data }).unwrap();
      } else {
        await createDeposit(data).unwrap();
      }
      setIsFormOpen(false);
      setEditingDeposit(undefined);
      refetch();
    } catch (error) {
      console.error('Failed to save deposit', error);
      alert('Failed to save deposit. Please check your inputs.');
    }
  };

  const handleDelete = async () => {
    if (deleteConfirmId !== null) {
      setIsDeleting(true);
      try {
        await deleteDeposit(deleteConfirmId).unwrap();
        setDeleteConfirmId(null);
      } catch (error) {
        console.error('Failed to delete deposit', error);
        alert('You do not have permission to delete this deposit.');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Deposit Management</h1>
        <Button 
          onClick={() => {
            setEditingDeposit(undefined);
            setIsFormOpen(true);
          }}
          leftIcon={<Plus className="h-5 w-5" />}
        >
          Add Deposit
        </Button>
      </div>

      <DepositFilters onFilterChange={handleFilterChange} />

      {isLoading ? (
        <LoadingSkeleton rows={5} />
      ) : (
        <>
          <DepositSummary deposits={depositsData?.results || []} />
          
          <DepositTable 
            deposits={depositsData?.results || []} 
            onEdit={(d) => { setEditingDeposit(d); setIsFormOpen(true); }} 
            onDelete={(id) => setDeleteConfirmId(id)} 
          />
          
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-slate-500">
              Showing page {page}
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline"
                disabled={!depositsData?.previous} 
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <Button 
                variant="outline"
                disabled={!depositsData?.next} 
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}

      {isFormOpen && (
        <DepositForm 
          deposit={editingDeposit} 
          onSave={handleSave} 
          onCancel={() => {
            setIsFormOpen(false);
            setEditingDeposit(undefined);
          }} 
        />
      )}

      <ConfirmDialog
        isOpen={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={handleDelete}
        title="Delete Deposit"
        message="Are you sure you want to delete this deposit? This action cannot be undone."
        confirmText="Delete"
        isDestructive={true}
        isLoading={isDeleting}
      />
    </div>
  );
};

