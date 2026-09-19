import type { Deposit } from '../../types/deposit';
import { Card, CardContent } from '../ui/Card';
import { PiggyBank } from 'lucide-react';

interface DepositSummaryProps {
  deposits: Deposit[];
}

export const DepositSummary = ({ deposits }: DepositSummaryProps) => {
  const totalAmount = deposits.reduce((sum, deposit) => sum + Number(deposit.amount), 0);

  return (
    <Card className="mb-6 inline-block w-full sm:w-auto">
      <CardContent className="flex items-center p-6">
        <div className="p-3 rounded-full bg-indigo-100 text-indigo-600 mr-4">
          <PiggyBank className="h-8 w-8" />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500">Total Deposits</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-slate-900">${totalAmount.toFixed(2)}</p>
            <p className="text-sm text-slate-500">
              ({deposits.length} record{deposits.length !== 1 ? 's' : ''})
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

