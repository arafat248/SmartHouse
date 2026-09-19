import { Edit, Trash2 } from 'lucide-react';
import type { Deposit } from '../../types/deposit';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '../ui/Table';
import { Button } from '../ui/Button';

interface DepositTableProps {
  deposits: Deposit[];
  onEdit: (deposit: Deposit) => void;
  onDelete: (id: number) => void;
}

export const DepositTable = ({ deposits, onEdit, onDelete }: DepositTableProps) => {
  if (!deposits || deposits.length === 0) {
    return null;
  }

  return (
    <Table>
      <TableHeader>
        <TableHead>Date</TableHead>
        <TableHead>Member</TableHead>
        <TableHead>Amount</TableHead>
        <TableHead>Method</TableHead>
        <TableHead>Reference</TableHead>
        <TableHead>Notes</TableHead>
        <TableHead>Actions</TableHead>
      </TableHeader>
      <TableBody>
        {deposits.map((deposit) => (
          <TableRow key={deposit.id}>
            <TableCell>{new Date(deposit.deposit_date).toLocaleDateString()}</TableCell>
            <TableCell>{deposit.member_detail?.user?.first_name} {deposit.member_detail?.user?.last_name}</TableCell>
            <TableCell className="font-semibold text-slate-900">${Number(deposit.amount).toFixed(2)}</TableCell>
            <TableCell>{deposit.payment_method.replace('_', ' ')}</TableCell>
            <TableCell>{deposit.reference || '-'}</TableCell>
            <TableCell>{deposit.notes || '-'}</TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => onEdit(deposit)} leftIcon={<Edit className="h-4 w-4" />}>
                  Edit
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onDelete(deposit.id)} leftIcon={<Trash2 className="h-4 w-4 text-red-500" />}>
                  <span className="text-red-500">Delete</span>
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

