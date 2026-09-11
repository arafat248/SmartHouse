import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGetSettlementsQuery, useGenerateSettlementMutation } from '../features/settlements/settlementsApi';
import { useGetHouseholdsQuery } from '../features/households/householdsApi';

export const SettlementsPage = () => {
  const [page, setPage] = useState(1);
  const { data: settlementsData, isLoading } = useGetSettlementsQuery({ page });
  
  const { data: households } = useGetHouseholdsQuery({});
  const [householdId, setHouseholdId] = useState('');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  
  const [generateSettlement, { isLoading: isGenerating }] = useGenerateSettlementMutation();

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!householdId) {
      alert('Please select a household');
      return;
    }
    
    try {
      await generateSettlement({ 
        household: Number(householdId), 
        month: Number(month), 
        year: Number(year) 
      }).unwrap();
      alert('Settlement generated successfully!');
      setPage(1);
    } catch (error: any) {
      alert(error.data?.detail || 'Failed to generate settlement. Make sure you are an admin.');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Monthly Settlements</h1>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2>Generate Settlement</h2>
        <form onSubmit={handleGenerate} className="data-form" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Household</label>
            <select value={householdId} onChange={(e) => setHouseholdId(e.target.value)} required>
              <option value="">Select Household</option>
              {households?.map((h: any) => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Month</label>
            <select value={month} onChange={(e) => setMonth(Number(e.target.value))} required>
              {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Year</label>
            <input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} required min="2000" />
          </div>
          
          <button type="submit" className="btn-primary" disabled={isGenerating}>
            {isGenerating ? 'Generating...' : 'Generate'}
          </button>
        </form>
      </div>

      {isLoading ? (
        <p>Loading settlements...</p>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Month/Year</th>
                <th>Status</th>
                <th>Total Expense</th>
                <th>Total Meals</th>
                <th>Meal Rate</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {settlementsData?.results.map((settlement) => (
                <tr key={settlement.id}>
                  <td>{settlement.month}/{settlement.year}</td>
                  <td>
                    <span className={`status-badge status-${settlement.status.toLowerCase()}`}>
                      {settlement.status}
                    </span>
                  </td>
                  <td>${Number(settlement.total_expense).toFixed(2)}</td>
                  <td>{Number(settlement.total_meals).toFixed(2)}</td>
                  <td>${Number(settlement.meal_rate).toFixed(4)}</td>
                  <td>
                    <Link to={`/settlements/${settlement.id}`} className="btn-secondary">
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
              {settlementsData?.results.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center' }}>No settlements found.</td>
                </tr>
              )}
            </tbody>
          </table>
          
          <div className="pagination">
            <button 
              disabled={!settlementsData?.previous} 
              onClick={() => setPage((p) => p - 1)}
              className="btn-secondary"
            >
              Previous
            </button>
            <span style={{ margin: '0 1rem' }}>Page {page}</span>
            <button 
              disabled={!settlementsData?.next} 
              onClick={() => setPage((p) => p + 1)}
              className="btn-secondary"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
