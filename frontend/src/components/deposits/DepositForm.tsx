import { useState } from 'react';
import type { Deposit, DepositInput } from '../../types/deposit';
import { useGetHouseholdsQuery, useGetMembersQuery } from '../../features/households/householdsApi';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data: DepositInput = {
      household: Number(householdId),
      member: Number(memberId),
      amount: amount,
      deposit_date: depositDate,
      payment_method: paymentMethod,
      reference: reference,
      notes: notes,
    };
    await onSave(data);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{deposit ? 'Edit Deposit' : 'Add Deposit'}</h2>
        <form onSubmit={handleSubmit} className="data-form">
          <div className="form-group">
            <label>Household</label>
            <select value={householdId} onChange={(e) => setHouseholdId(e.target.value)} required disabled={!!deposit}>
              <option value="">Select Household</option>
              {households?.map((h: any) => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>Member</label>
            <select value={memberId} onChange={(e) => setMemberId(e.target.value)} required disabled={!householdId}>
              <option value="">Select Member</option>
              {members?.map((m: any) => (
                <option key={m.id} value={m.id}>{m.user.first_name} {m.user.last_name} ({m.user.email})</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Amount</label>
            <input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required min="0.01" />
          </div>

          <div className="form-group">
            <label>Deposit Date</label>
            <input type="date" value={depositDate} onChange={(e) => setDepositDate(e.target.value)} required />
          </div>

          <div className="form-group">
            <label>Payment Method</label>
            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} required>
              {PAYMENT_METHODS.map((pm) => (
                <option key={pm.value} value={pm.value}>{pm.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Reference (Optional)</label>
            <input type="text" value={reference} onChange={(e) => setReference(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Notes (Optional)</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
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
