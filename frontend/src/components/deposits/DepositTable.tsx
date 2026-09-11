import type { Deposit } from '../../types/deposit';

interface DepositTableProps {
  deposits: Deposit[];
  onEdit: (deposit: Deposit) => void;
  onDelete: (id: number) => void;
}

export const DepositTable = ({ deposits, onEdit, onDelete }: DepositTableProps) => {
  if (!deposits || deposits.length === 0) {
    return <p>No deposits found.</p>;
  }

  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Member</th>
            <th>Amount</th>
            <th>Method</th>
            <th>Reference</th>
            <th>Notes</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {deposits.map((deposit) => (
            <tr key={deposit.id}>
              <td>{deposit.deposit_date}</td>
              <td>{deposit.member_detail?.user?.first_name} {deposit.member_detail?.user?.last_name}</td>
              <td>${Number(deposit.amount).toFixed(2)}</td>
              <td>{deposit.payment_method.replace('_', ' ')}</td>
              <td>{deposit.reference || '-'}</td>
              <td>{deposit.notes || '-'}</td>
              <td>
                <button className="btn-secondary" onClick={() => onEdit(deposit)} style={{ marginRight: '0.5rem' }}>
                  Edit
                </button>
                <button className="btn-secondary" onClick={() => onDelete(deposit.id)} style={{ color: 'var(--danger-color)' }}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
