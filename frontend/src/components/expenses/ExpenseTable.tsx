import type { Expense } from '../../types/expense';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '../ui/Table';
import { Button } from '../ui/Button';
import { Edit, Trash2, ExternalLink } from 'lucide-react';
import { Badge } from '../ui/Badge';

interface ExpenseTableProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: number) => void;
}

export const ExpenseTable = ({ expenses, onEdit, onDelete }: ExpenseTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableHead>Date</TableHead>
        <TableHead>Title</TableHead>
        <TableHead>Category</TableHead>
        <TableHead>Paid By</TableHead>
        <TableHead>Amount</TableHead>
        <TableHead>Receipt</TableHead>
        <TableHead>Actions</TableHead>
      </TableHeader>
      <TableBody>
        {expenses.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center text-slate-500 py-8">
              No expenses found.
            </TableCell>
          </TableRow>
        ) : (
          expenses.map((expense) => (
            <TableRow key={expense.id}>
              <TableCell>{new Date(expense.expense_date).toLocaleDateString()}</TableCell>
              <TableCell className="font-medium text-slate-900">{expense.title}</TableCell>
              <TableCell>
                <Badge variant="default">
                  {expense.category_detail?.name || 'Uncategorized'}
                </Badge>
              </TableCell>
              <TableCell>
                {expense.paid_by_detail 
                  ? `${expense.paid_by_detail.user.first_name} ${expense.paid_by_detail.user.last_name}`
                  : 'N/A'}
              </TableCell>
              <TableCell className="font-semibold text-slate-900">${expense.amount}</TableCell>
              <TableCell>
                {expense.receipt ? (
                  <a href={expense.receipt} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                    <ExternalLink className="h-4 w-4" /> View
                  </a>
                ) : (
                  <span className="text-slate-400">None</span>
                )}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => onEdit(expense)} leftIcon={<Edit className="h-4 w-4" />}>
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onDelete(expense.id)} leftIcon={<Trash2 className="h-4 w-4 text-red-500" />}>
                    <span className="text-red-500">Delete</span>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

