import { useState } from 'react';
import { useGetHouseholdsQuery, useGetMembersQuery } from '../../features/households/householdsApi';

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
  
  // We'll need a household to fetch members, or we just fetch all members if the API supports it.
  // For simplicity, we can fetch households and then let the user pick one, but if we don't know the household,
  // maybe we don't show member filter until a household is selected, or we just skip it if it's too complex.
  // Assuming we can pass member ID to filter directly.
  const [householdId, setHouseholdId] = useState('');
  const { data: households } = useGetHouseholdsQuery({});
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
    <div className="filters-container">
      <select value={householdId} onChange={(e) => { setHouseholdId(e.target.value); setMember(''); }}>
        <option value="">All Households (for members)</option>
        {households?.map((h: any) => (
          <option key={h.id} value={h.id}>{h.name}</option>
        ))}
      </select>

      <select value={member} onChange={(e) => setMember(e.target.value)} disabled={!householdId}>
        <option value="">All Members</option>
        {members?.map((m: any) => (
          <option key={m.id} value={m.id}>{m.user.first_name} {m.user.last_name}</option>
        ))}
      </select>

      <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
        <option value="">All Payment Methods</option>
        {PAYMENT_METHODS.map((pm) => (
          <option key={pm.value} value={pm.value}>{pm.label}</option>
        ))}
      </select>

      <input 
        type="date" 
        value={dateRange} 
        onChange={(e) => setDateRange(e.target.value)} 
        placeholder="From Date"
      />

      <button className="btn-primary" onClick={handleApply}>Apply Filters</button>
      <button className="btn-secondary" onClick={handleClear}>Clear</button>
    </div>
  );
};
