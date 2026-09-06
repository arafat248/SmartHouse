import { useState, useMemo } from 'react';
import { 
  useGetMealsQuery, 
  useCreateMealMutation, 
  useUpdateMealMutation, 
  useDeleteMealMutation 
} from '../features/meals/mealsApi';
import { useGetHouseholdsQuery, useGetMembersQuery } from '../features/households/householdsApi';
import { MealTable } from '../components/meals/MealTable';
import { MealForm } from '../components/meals/MealForm';
import type { Meal, MealInput } from '../types/meal';
import './MealsDashboard.css';

export const MealsDashboard: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<Meal | undefined>(undefined);
  
  // Filters
  const [filterMonth, setFilterMonth] = useState<string>(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [filterDate, setFilterDate] = useState<string>('');
  const [filterMember, setFilterMember] = useState<number | ''>('');
  
  const { data: households } = useGetHouseholdsQuery(undefined);
  // Default to first household for member dropdown filtering
  const householdId = households && households.length > 0 ? households[0].id : 0;
  const { data: members } = useGetMembersQuery(householdId, { skip: !householdId });

  // Query API
  const queryParams: any = {};
  if (filterDate) queryParams.date = filterDate;
  if (filterMonth && !filterDate) queryParams.month = filterMonth;
  if (filterMember) queryParams.member = filterMember;
  
  const { data, isLoading } = useGetMealsQuery(queryParams);
  const meals = data?.results || [];

  const [createMeal] = useCreateMealMutation();
  const [updateMeal] = useUpdateMealMutation();
  const [deleteMeal] = useDeleteMealMutation();

  const handleCreateNew = () => {
    setEditingMeal(undefined);
    setIsFormOpen(true);
  };

  const handleEdit = (meal: Meal) => {
    setEditingMeal(meal);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMeal(id).unwrap();
    } catch (err) {
      console.error('Failed to delete meal', err);
      alert('Failed to delete meal');
    }
  };

  const handleFormSubmit = async (formData: MealInput) => {
    try {
      if (editingMeal) {
        await updateMeal({ id: editingMeal.id, ...formData }).unwrap();
      } else {
        await createMeal(formData).unwrap();
      }
      setIsFormOpen(false);
    } catch (err: any) {
      console.error('Failed to save meal', err);
      alert(err.data?.non_field_errors?.[0] || 'Failed to save meal. Ensure no duplicate entry exists for this date.');
    }
  };

  // Calculate monthly summary
  const summary = useMemo(() => {
    let totalBreakfast = 0;
    let totalLunch = 0;
    let totalDinner = 0;
    let totalGuest = 0;
    let grandTotal = 0;

    meals.forEach((m: Meal) => {
      totalBreakfast += parseFloat(m.breakfast || '0');
      totalLunch += parseFloat(m.lunch || '0');
      totalDinner += parseFloat(m.dinner || '0');
      totalGuest += parseFloat(m.guest_meals || '0');
      grandTotal += parseFloat(m.total_meals || '0');
    });

    return { totalBreakfast, totalLunch, totalDinner, totalGuest, grandTotal };
  }, [meals]);

  return (
    <div className="meals-dashboard">
      <div className="dashboard-header">
        <h1>Meals Dashboard</h1>
        <button className="btn-primary" onClick={handleCreateNew}>+ New Meal Entry</button>
      </div>

      <div className="filters-card">
        <h3>Filters</h3>
        <div className="filters-container">
          <div className="filter-group">
            <label>Month:</label>
            <input 
              type="month" 
              value={filterMonth} 
              onChange={(e) => { setFilterMonth(e.target.value); setFilterDate(''); }} 
            />
          </div>
          <div className="filter-group">
            <label>Specific Date:</label>
            <input 
              type="date" 
              value={filterDate} 
              onChange={(e) => { setFilterDate(e.target.value); setFilterMonth(''); }} 
            />
          </div>
          <div className="filter-group">
            <label>Member:</label>
            <select 
              value={filterMember} 
              onChange={(e) => setFilterMember(e.target.value ? parseInt(e.target.value, 10) : '')}
            >
              <option value="">All Members</option>
              {members?.map((m: any) => (
                <option key={m.id} value={m.id}>{m.user_detail?.first_name || m.user_detail?.email}</option>
              ))}
            </select>
          </div>
          <div className="filter-group reset-group">
            <button className="btn-secondary" onClick={() => {
              setFilterMonth(new Date().toISOString().slice(0, 7));
              setFilterDate('');
              setFilterMember('');
            }}>Reset Filters</button>
          </div>
        </div>
      </div>

      <div className="summary-card">
        <h3>Summary ({filterDate ? `Date: ${filterDate}` : `Month: ${filterMonth}`})</h3>
        <div className="summary-stats">
          <div className="stat-box">
            <span className="stat-label">Breakfast</span>
            <span className="stat-value">{summary.totalBreakfast}</span>
          </div>
          <div className="stat-box">
            <span className="stat-label">Lunch</span>
            <span className="stat-value">{summary.totalLunch}</span>
          </div>
          <div className="stat-box">
            <span className="stat-label">Dinner</span>
            <span className="stat-value">{summary.totalDinner}</span>
          </div>
          <div className="stat-box">
            <span className="stat-label">Guest Meals</span>
            <span className="stat-value">{summary.totalGuest}</span>
          </div>
          <div className="stat-box highlight">
            <span className="stat-label">Total Meals</span>
            <span className="stat-value">{summary.grandTotal}</span>
          </div>
        </div>
      </div>

      <div className="table-card">
        {isLoading ? (
          <div className="loading-state">Loading meals...</div>
        ) : (
          <MealTable meals={meals} onEdit={handleEdit} onDelete={handleDelete} />
        )}
      </div>

      {isFormOpen && (
        <MealForm 
          meal={editingMeal} 
          onSubmit={handleFormSubmit} 
          onCancel={() => setIsFormOpen(false)} 
          defaultDate={filterDate || undefined}
        />
      )}
    </div>
  );
};
