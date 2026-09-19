import { useState } from 'react';
import { 
  useGetExpensesQuery, 
  useGetExpenseCategoriesQuery, 
  useCreateExpenseMutation, 
  useUpdateExpenseMutation, 
  useDeleteExpenseMutation 
} from '../features/expenses/expensesApi';
import { ExpenseTable } from '../components/expenses/ExpenseTable';
import { ExpenseForm } from '../components/expenses/ExpenseForm';
import { ExpenseFilters } from '../components/expenses/ExpenseFilters';
import type { Expense } from '../types/expense';
import { Button } from '../components/ui/Button';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Plus } from 'lucide-react';

export const ExpensesPage = () => {
  const [filters, setFilters] = useState({ category: '', search: '', date_range: '' });
  const [page, setPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>(undefined);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: categories = [] } = useGetExpenseCategoriesQuery();
  const { data: expensesData, isLoading, refetch } = useGetExpensesQuery({
    page,
    category: filters.category,
    search: filters.search,
    expense_date__gte: filters.date_range ? filters.date_range : undefined,
  });

  const [createExpense] = useCreateExpenseMutation();
  const [updateExpense] = useUpdateExpenseMutation();
  const [deleteExpense] = useDeleteExpenseMutation();

  const handleFilterChange = (newFilters: { category: string; search: string; date_range: string }) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleSave = async (formData: FormData) => {
    try {
      if (editingExpense) {
        await updateExpense({ id: editingExpense.id, data: formData }).unwrap();
      } else {
        await createExpense(formData).unwrap();
      }
      setIsFormOpen(false);
      setEditingExpense(undefined);
      refetch(); // In case pagination or ordering shifts things unexpectedly
    } catch (error) {
      console.error('Failed to save expense', error);
      alert('Failed to save expense. Please check your inputs.');
    }
  };

  const handleDelete = async () => {
    if (deleteConfirmId !== null) {
      setIsDeleting(true);
      try {
        await deleteExpense(deleteConfirmId).unwrap();
        setDeleteConfirmId(null);
      } catch (error) {
        console.error('Failed to delete expense', error);
        alert('You do not have permission to delete this expense.');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Expenses</h1>
        <Button 
          onClick={() => {
            setEditingExpense(undefined);
            setIsFormOpen(true);
          }}
          leftIcon={<Plus className="h-5 w-5" />}
        >
          Add Expense
        </Button>
      </div>

      <ExpenseFilters categories={categories} onFilterChange={handleFilterChange} />

      {isLoading ? (
        <LoadingSkeleton rows={5} />
      ) : (
        <>
          <ExpenseTable 
            expenses={expensesData?.results || []} 
            onEdit={(e) => { setEditingExpense(e); setIsFormOpen(true); }} 
            onDelete={(id) => setDeleteConfirmId(id)} 
          />
          
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-slate-500">
              Showing page {page}
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline"
                disabled={!expensesData?.previous} 
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <Button 
                variant="outline"
                disabled={!expensesData?.next} 
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}

      {isFormOpen && (
        <ExpenseForm 
          expense={editingExpense} 
          categories={categories}
          onSave={handleSave} 
          onCancel={() => {
            setIsFormOpen(false);
            setEditingExpense(undefined);
          }} 
        />
      )}

      <ConfirmDialog
        isOpen={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={handleDelete}
        title="Delete Expense"
        message="Are you sure you want to delete this expense? This action cannot be undone."
        confirmText="Delete"
        isDestructive={true}
        isLoading={isDeleting}
      />
    </div>
  );
};

