import type { Expense } from '../../types/expense';

interface ExpenseTableProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: number) => void;
}

export const ExpenseTable = ({ expenses, onEdit, onDelete }: ExpenseTableProps) => {
  if (expenses.length === 0) {
    return <div className="no-data">No expenses found.</div>;
  }

  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Title</th>
            <th>Category</th>
            <th>Paid By</th>
            <th>Amount</th>
            <th>Receipt</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense) => (
            <tr key={expense.id}>
              <td>{expense.expense_date}</td>
              <td>{expense.title}</td>
              <td>{expense.category_detail?.name || 'N/A'}</td>
              <td>
                {expense.paid_by_detail 
                  ? `${expense.paid_by_detail.user.first_name} ${expense.paid_by_detail.user.last_name}`
                  : 'N/A'}
              </td>
              <td>${expense.amount}</td>
              <td>
                {expense.receipt ? (
                  <a href={expense.receipt} target="_blank" rel="noopener noreferrer">View</a>
                ) : (
                  'No receipt'
                )}
              </td>
              <td className="actions-cell">
                <button onClick={() => onEdit(expense)} className="btn-secondary btn-sm">Edit</button>
                <button onClick={() => onDelete(expense.id)} className="btn-danger btn-sm">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
