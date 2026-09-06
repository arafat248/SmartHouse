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

export const ExpensesPage = () => {
  const [filters, setFilters] = useState({ category: '', search: '', date_range: '' });
  const [page, setPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>(undefined);

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

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await deleteExpense(id).unwrap();
      } catch (error) {
        console.error('Failed to delete expense', error);
        alert('You do not have permission to delete this expense.');
      }
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Expenses</h1>
        <button 
          className="btn-primary" 
          onClick={() => {
            setEditingExpense(undefined);
            setIsFormOpen(true);
          }}
        >
          Add Expense
        </button>
      </div>

      <ExpenseFilters categories={categories} onFilterChange={handleFilterChange} />

      {isLoading ? (
        <p>Loading expenses...</p>
      ) : (
        <>
          <ExpenseTable 
            expenses={expensesData?.results || []} 
            onEdit={(e) => { setEditingExpense(e); setIsFormOpen(true); }} 
            onDelete={handleDelete} 
          />
          
          <div className="pagination">
            <button 
              disabled={!expensesData?.previous} 
              onClick={() => setPage((p) => p - 1)}
              className="btn-secondary"
            >
              Previous
            </button>
            <span style={{ margin: '0 1rem' }}>Page {page}</span>
            <button 
              disabled={!expensesData?.next} 
              onClick={() => setPage((p) => p + 1)}
              className="btn-secondary"
            >
              Next
            </button>
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
    </div>
  );
};
