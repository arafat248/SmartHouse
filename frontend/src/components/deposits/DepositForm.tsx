import { useState } from 'react';
import type { Deposit, DepositInput } from '../../types/deposit';
import { useGetHouseholdsQuery, useGetMembersQuery } from '../../features/households/householdsApi';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

interface DepositFormProps {
  deposit?: Deposit;
  onSave: (data: DepositInput) => Promise<void>;
  onCancel: () => void;
}

const PAYMENT_METHODS = [
  { value: 'CASH', label: 'Cash' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { value: 'CARD', label: 'Card' },
  { value: 'VENMO', label: 'Venmo' },
  { value: 'PAYPAL', label: 'PayPal' },
  { value: 'OTHER', label: 'Other' },
];

export const DepositForm = ({ deposit, onSave, onCancel }: DepositFormProps) => {
  const { data: households } = useGetHouseholdsQuery({});
  const [householdId, setHouseholdId] = useState(deposit?.household?.toString() || '');
  
  const { data: members } = useGetMembersQuery(Number(householdId), {
    skip: !householdId,
  });

  const [memberId, setMemberId] = useState(deposit?.member?.toString() || '');
  const [amount, setAmount] = useState(deposit?.amount || '');
  const [depositDate, setDepositDate] = useState(deposit?.deposit_date || '');
  const [paymentMethod, setPaymentMethod] = useState(deposit?.payment_method || 'BANK_TRANSFER');
  const [reference, setReference] = useState(deposit?.reference || '');
  const [notes, setNotes] = useState(deposit?.notes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const data: DepositInput = {
      household: Number(householdId),
      member: Number(memberId),
      amount: amount,
      deposit_date: depositDate,
      payment_method: paymentMethod,
      reference: reference,
      notes: notes,
    };
    try {
      await onSave(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onCancel} title={deposit ? 'Edit Deposit' : 'Add Deposit'} maxWidth="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select label="Household" value={householdId} onChange={(e) => setHouseholdId(e.target.value)} required disabled={!!deposit}>
          <option value="">Select Household</option>
          {households?.map((h) => (
            <option key={h.id} value={h.id}>{h.name}</option>
          ))}
        </Select>
        
        <Select label="Member" value={memberId} onChange={(e) => setMemberId(e.target.value)} required disabled={!householdId}>
          <option value="">Select Member</option>
          {members?.map((m) => (
            <option key={m.id} value={m.id}>{m.user.first_name} {m.user.last_name} ({m.user.email})</option>
          ))}
        </Select>

        <Input label="Amount" type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required min="0.01" />

        <Input label="Deposit Date" type="date" value={depositDate} onChange={(e) => setDepositDate(e.target.value)} required />

        <Select label="Payment Method" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} required>
          {PAYMENT_METHODS.map((pm) => (
            <option key={pm.value} value={pm.value}>{pm.label}</option>
          ))}
        </Select>

        <Input label="Reference (Optional)" type="text" value={reference} onChange={(e) => setReference(e.target.value)} />

        <div className="w-full">
          <label className="block text-sm font-medium text-slate-700 mb-1">Notes (Optional)</label>
          <textarea
            className="block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse gap-3 pt-4 border-t border-slate-200">
          <Button type="submit" isLoading={isSubmitting} className="w-full sm:w-auto">Save</Button>
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting} className="mt-3 w-full sm:mt-0 sm:w-auto">Cancel</Button>
        </div>
      </form>
    </Modal>
  );
};

