import { useParams, useNavigate } from 'react-router-dom';
import { useGetSettlementQuery, useFinalizeSettlementMutation } from '../features/settlements/settlementsApi';

export const SettlementDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { data: settlement, isLoading } = useGetSettlementQuery(Number(id));
  const [finalizeSettlement, { isLoading: isFinalizing }] = useFinalizeSettlementMutation();

  if (isLoading) return <p>Loading settlement details...</p>;
  if (!settlement) return <p>Settlement not found.</p>;

  const handleFinalize = async () => {
    if (window.confirm('Are you sure you want to finalize this settlement? This cannot be undone.')) {
      try {
        await finalizeSettlement(settlement.id).unwrap();
        alert('Settlement finalized successfully!');
      } catch (error: any) {
        alert(error.data?.detail || 'Failed to finalize settlement. Make sure you are an admin.');
      }
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button className="btn-secondary" onClick={() => navigate('/settlements')}>&larr; Back</button>
          <h1>Settlement Details: {settlement.month}/{settlement.year}</h1>
        </div>
        
        {settlement.status === 'DRAFT' && (
          <button 
            className="btn-primary" 
            onClick={handleFinalize}
            disabled={isFinalizing}
          >
            {isFinalizing ? 'Finalizing...' : 'Finalize Settlement'}
          </button>
        )}
      </div>

      <div className="summary-widgets" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <div className="summary-widget" style={{ flex: 1, background: 'var(--surface-color)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)' }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)' }}>Status</h3>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
            {settlement.status}
          </div>
        </div>
        <div className="summary-widget" style={{ flex: 1, background: 'var(--surface-color)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)' }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)' }}>Total Expense</h3>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
            ${Number(settlement.total_expense).toFixed(2)}
          </div>
        </div>
        <div className="summary-widget" style={{ flex: 1, background: 'var(--surface-color)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)' }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)' }}>Total Meals</h3>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
            {Number(settlement.total_meals).toFixed(2)}
          </div>
        </div>
        <div className="summary-widget" style={{ flex: 1, background: 'var(--surface-color)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)' }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)' }}>Meal Rate</h3>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
            ${Number(settlement.meal_rate).toFixed(4)}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2>Member Balances</h2>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Meals</th>
                <th>Meal Cost</th>
                <th>Other Cost</th>
                <th>Total Cost</th>
                <th>Total Deposit</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              {settlement.items.map((item) => {
                const balance = Number(item.balance);
                const balanceColor = balance > 0 ? 'var(--success-color)' : balance < 0 ? 'var(--danger-color)' : 'inherit';
                
                return (
                  <tr key={item.id}>
                    <td>{item.member_detail.user.first_name} {item.member_detail.user.last_name}</td>
                    <td>{Number(item.total_meals).toFixed(2)}</td>
                    <td>${Number(item.meal_cost).toFixed(2)}</td>
                    <td>${Number(item.other_cost).toFixed(2)}</td>
                    <td>${Number(item.total_cost).toFixed(2)}</td>
                    <td>${Number(item.total_deposit).toFixed(2)}</td>
                    <td style={{ color: balanceColor, fontWeight: 'bold' }}>
                      ${balance.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {settlement.suggested_transfers && settlement.suggested_transfers.length > 0 && (
        <div className="card">
          <h2>Suggested Transfers</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            To simplify debts, we suggest the following transfers to settle all balances:
          </p>
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            {settlement.suggested_transfers.map((transfer, index) => (
              <li key={index} style={{ 
                padding: '1rem', 
                background: 'var(--background-color)', 
                marginBottom: '0.5rem', 
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
              }}>
                <strong>{transfer.from_member_name}</strong>
                <span style={{ color: 'var(--text-secondary)' }}>&rarr;</span>
                <strong>{transfer.to_member_name}</strong>
                <span style={{ marginLeft: 'auto', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                  ${transfer.amount.toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
