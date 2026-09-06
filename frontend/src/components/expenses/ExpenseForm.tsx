import { useState } from 'react';
import type { Expense, ExpenseCategory } from '../../types/expense';
import { useGetHouseholdsQuery, useGetMembersQuery } from '../../features/households/householdsApi';

interface ExpenseFormProps {
  expense?: Expense;
  categories: ExpenseCategory[];
  onSave: (data: FormData) => Promise<void>;
  onCancel: () => void;
}

export const ExpenseForm = ({ expense, categories, onSave, onCancel }: ExpenseFormProps) => {
  const { data: households } = useGetHouseholdsQuery({});
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

    await onSave(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{expense ? 'Edit Expense' : 'Add Expense'}</h2>
        <form onSubmit={handleSubmit} className="data-form">
          <div className="form-group">
            <label>Household</label>
            <select value={householdId} onChange={(e) => setHouseholdId(e.target.value)} required>
              <option value="">Select Household</option>
              {households?.map((h: any) => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>

          <div className="form-group">
            <label>Amount</label>
            <input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required min="0.01" />
          </div>

          <div className="form-group">
            <label>Category</label>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Paid By</label>
            <select value={paidBy} onChange={(e) => setPaidBy(e.target.value)} required disabled={!householdId}>
              <option value="">Select Member</option>
              {members?.map((m: any) => (
                <option key={m.id} value={m.id}>{m.user.first_name} {m.user.last_name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Expense Date</label>
            <input type="date" value={expenseDate} onChange={(e) => setExpenseDate(e.target.value)} required />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Receipt Upload</label>
            <input type="file" accept="image/*,.pdf" onChange={(e) => setReceipt(e.target.files ? e.target.files[0] : null)} />
            {expense?.receipt && <p>Current receipt: <a href={expense.receipt} target="_blank" rel="noopener noreferrer">View</a></p>}
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary">Save</button>
            <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};
