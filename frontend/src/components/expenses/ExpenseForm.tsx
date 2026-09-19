import { useState } from 'react';
import type { Expense, ExpenseCategory } from '../../types/expense';
import { useGetHouseholdsQuery, useGetMembersQuery } from '../../features/households/householdsApi';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

interface ExpenseFormProps {
  expense?: Expense;
  categories: ExpenseCategory[];
  onSave: (data: FormData) => Promise<void>;
  onCancel: () => void;
}

export const ExpenseForm = ({ expense, categories, onSave, onCancel }: ExpenseFormProps) => {
  const { data: households } = useGetHouseholdsQuery();
  const [householdId, setHouseholdId] = useState(expense?.household?.toString() || '');
  
  const { data: members } = useGetMembersQuery(Number(householdId), {
    skip: !householdId,
  });

  const [title, setTitle] = useState(expense?.title || '');
  const [amount, setAmount] = useState(expense?.amount || '');
  const [categoryId, setCategoryId] = useState(expense?.category?.toString() || '');
  const [paidBy, setPaidBy] = useState(expense?.paid_by?.toString() || '');
  const [expenseDate, setExpenseDate] = useState(expense?.expense_date || '');
  const [description, setDescription] = useState(expense?.description || '');
  const [receipt, setReceipt] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('household', householdId);
    formData.append('title', title);
    formData.append('amount', amount);
    if (categoryId) formData.append('category', categoryId);
    formData.append('paid_by', paidBy);
    formData.append('expense_date', expenseDate);
    formData.append('description', description);
    if (receipt) {
      formData.append('receipt', receipt);
    }

    try {
      await onSave(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onCancel} title={expense ? 'Edit Expense' : 'Add Expense'} maxWidth="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select label="Household" value={householdId} onChange={(e) => setHouseholdId(e.target.value)} required>
          <option value="">Select Household</option>
          {households?.map((h) => (
            <option key={h.id} value={h.id}>{h.name}</option>
          ))}
        </Select>
        
        <Input label="Title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />

        <Input label="Amount" type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required min="0.01" />

        <Select label="Category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">Select Category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </Select>

        <Select label="Paid By" value={paidBy} onChange={(e) => setPaidBy(e.target.value)} required disabled={!householdId}>
          <option value="">Select Member</option>
          {members?.map((m) => (
            <option key={m.id} value={m.id}>{m.user.first_name} {m.user.last_name}</option>
          ))}
        </Select>

        <Input label="Expense Date" type="date" value={expenseDate} onChange={(e) => setExpenseDate(e.target.value)} required />

        <div className="w-full">
          <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
          <textarea
            className="block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>

        <div className="w-full">
          <label className="block text-sm font-medium text-slate-700 mb-1">Receipt Upload</label>
          <input
            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            type="file" 
            accept="image/*,.pdf" 
            onChange={(e) => setReceipt(e.target.files ? e.target.files[0] : null)} 
          />
          {expense?.receipt && (
            <p className="mt-2 text-sm text-slate-500">
              Current receipt: <a href={expense.receipt} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">View</a>
            </p>
          )}
        </div>

        <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse gap-3 pt-4 border-t border-slate-200">
          <Button type="submit" isLoading={isSubmitting} className="w-full sm:w-auto">Save</Button>
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting} className="mt-3 w-full sm:mt-0 sm:w-auto">Cancel</Button>
        </div>
      </form>
    </Modal>
  );
};

