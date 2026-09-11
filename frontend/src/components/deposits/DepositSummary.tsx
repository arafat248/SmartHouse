import type { Deposit } from '../../types/deposit';

interface DepositSummaryProps {
  deposits: Deposit[];
}

export const DepositSummary = ({ deposits }: DepositSummaryProps) => {
  const totalAmount = deposits.reduce((sum, deposit) => sum + Number(deposit.amount), 0);

  return (
    <div className="summary-widget" style={{ 
      background: 'var(--surface-color)', 
      padding: '1.5rem', 
      borderRadius: 'var(--radius-lg)', 
      marginBottom: '1.5rem',
      boxShadow: 'var(--shadow-md)',
      display: 'inline-block'
    }}>
      <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)' }}>Total Deposits</h3>
      <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
        ${totalAmount.toFixed(2)}
      </div>
      <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
        Based on {deposits.length} record{deposits.length !== 1 ? 's' : ''} shown below.
      </p>
    </div>
  );
};
