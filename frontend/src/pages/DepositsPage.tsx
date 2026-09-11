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

export const DepositsPage = () => {
  const [filters, setFilters] = useState({ member: '', payment_method: '', deposit_date__gte: '' });
  const [page, setPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDeposit, setEditingDeposit] = useState<Deposit | undefined>(undefined);

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

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this deposit?')) {
      try {
        await deleteDeposit(id).unwrap();
      } catch (error) {
        console.error('Failed to delete deposit', error);
        alert('You do not have permission to delete this deposit.');
      }
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Deposit Management</h1>
        <button 
          className="btn-primary" 
          onClick={() => {
            setEditingDeposit(undefined);
            setIsFormOpen(true);
          }}
        >
          Add Deposit
        </button>
      </div>

      <DepositFilters onFilterChange={handleFilterChange} />

      {isLoading ? (
        <p>Loading deposits...</p>
      ) : (
        <>
          <DepositSummary deposits={depositsData?.results || []} />
          
          <DepositTable 
            deposits={depositsData?.results || []} 
            onEdit={(d) => { setEditingDeposit(d); setIsFormOpen(true); }} 
            onDelete={handleDelete} 
          />
          
          <div className="pagination">
            <button 
              disabled={!depositsData?.previous} 
              onClick={() => setPage((p) => p - 1)}
              className="btn-secondary"
            >
              Previous
            </button>
            <span style={{ margin: '0 1rem' }}>Page {page}</span>
            <button 
              disabled={!depositsData?.next} 
              onClick={() => setPage((p) => p + 1)}
              className="btn-secondary"
            >
              Next
            </button>
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
    </div>
  );
};
