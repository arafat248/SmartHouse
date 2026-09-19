import { useState } from 'react';
import { useGetHouseholdsQuery, useGetMembersQuery } from '../../features/households/householdsApi';
import { Card, CardContent } from '../ui/Card';
import { Select } from '../ui/Select';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Filter, X } from 'lucide-react';

interface DepositFiltersProps {
  onFilterChange: (filters: { member: string; payment_method: string; deposit_date__gte: string }) => void;
}

const PAYMENT_METHODS = [
  { value: 'CASH', label: 'Cash' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { value: 'CARD', label: 'Card' },
  { value: 'VENMO', label: 'Venmo' },
  { value: 'PAYPAL', label: 'PayPal' },
  { value: 'OTHER', label: 'Other' },
];

export const DepositFilters = ({ onFilterChange }: DepositFiltersProps) => {
  const [member, setMember] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [dateRange, setDateRange] = useState('');
  
  const [householdId, setHouseholdId] = useState('');
  const { data: households } = useGetHouseholdsQuery();
  const { data: members } = useGetMembersQuery(Number(householdId), {
    skip: !householdId,
  });

  const handleApply = () => {
    onFilterChange({
      member,
      payment_method: paymentMethod,
      deposit_date__gte: dateRange,
    });
  };

  const handleClear = () => {
    setMember('');
    setPaymentMethod('');
    setDateRange('');
    setHouseholdId('');
    onFilterChange({ member: '', payment_method: '', deposit_date__gte: '' });
  };

  return (
    <Card className="mb-6">
      <CardContent className="py-5">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="w-full md:w-1/4">
            <Select label="Household" value={householdId} onChange={(e) => { setHouseholdId(e.target.value); setMember(''); }}>
              <option value="">All Households</option>
              {households?.map((h) => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </Select>
          </div>
          <div className="w-full md:w-1/4">
            <Select label="Member" value={member} onChange={(e) => setMember(e.target.value)} disabled={!householdId}>
              <option value="">All Members</option>
              {members?.map((m) => (
                <option key={m.id} value={m.id}>{m.user.first_name} {m.user.last_name}</option>
              ))}
            </Select>
          </div>
          <div className="w-full md:w-1/4">
            <Select label="Payment Method" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
              <option value="">All Methods</option>
              {PAYMENT_METHODS.map((pm) => (
                <option key={pm.value} value={pm.value}>{pm.label}</option>
              ))}
            </Select>
          </div>
          <div className="w-full md:w-1/4">
            <Input 
              label="From Date"
              type="date" 
              value={dateRange} 
              onChange={(e) => setDateRange(e.target.value)} 
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Button variant="primary" onClick={handleApply} leftIcon={<Filter className="h-4 w-4" />}>
              Filter
            </Button>
            <Button variant="outline" onClick={handleClear} leftIcon={<X className="h-4 w-4" />}>
              Clear
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

