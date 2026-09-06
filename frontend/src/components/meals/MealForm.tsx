import { useState } from 'react';
import type { Meal, MealInput } from '../../types/meal';
import { useGetHouseholdsQuery, useGetMembersQuery } from '../../features/households/householdsApi';


interface MealFormProps {
  meal?: Meal;
  onSubmit: (data: MealInput) => void;
  onCancel: () => void;
  defaultDate?: string;
}

export const MealForm: React.FC<MealFormProps> = ({ meal, onSubmit, onCancel, defaultDate }) => {
  const { data: households } = useGetHouseholdsQuery(undefined);
  // Default to first household if available
  const householdId = meal?.household || (households && households.length > 0 ? households[0].id : 0);
  
  const { data: members } = useGetMembersQuery(householdId, { skip: !householdId });

  const [formData, setFormData] = useState<MealInput>({
    household: householdId,
    member: meal?.member || 0,
    date: meal?.date || defaultDate || new Date().toISOString().split('T')[0],
    breakfast: meal?.breakfast || 0,
    lunch: meal?.lunch || 0,
    dinner: meal?.dinner || 0,
    guest_meals: meal?.guest_meals || 0,
    notes: meal?.notes || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'household' || name === 'member' 
        ? parseInt(value, 10) 
        : name === 'notes' || name === 'date' 
          ? value 
          : parseFloat(value) || 0,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="meal-form-backdrop">
      <div className="meal-form-container">
        <h2>{meal ? 'Edit Meal Entry' : 'Daily Meal Entry'}</h2>
        <form onSubmit={handleSubmit}>
          
          <div className="form-group">
            <label>Household:</label>
            <select name="household" value={formData.household} onChange={handleChange} required>
              <option value={0} disabled>Select a Household</option>
              {households?.map((h: any) => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Member:</label>
            <select name="member" value={formData.member} onChange={handleChange} required disabled={!formData.household}>
              <option value={0} disabled>Select a Member</option>
              {members?.map((m: any) => (
                <option key={m.id} value={m.id}>{m.user_detail?.first_name || m.user_detail?.email}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Date:</label>
            <input type="date" name="date" value={formData.date} onChange={handleChange} required />
          </div>

          <div className="meal-counts">
            <div className="form-group">
              <label>Breakfast:</label>
              <input type="number" step="0.5" min="0" name="breakfast" value={formData.breakfast} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Lunch:</label>
              <input type="number" step="0.5" min="0" name="lunch" value={formData.lunch} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Dinner:</label>
              <input type="number" step="0.5" min="0" name="dinner" value={formData.dinner} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Guest Meals:</label>
              <input type="number" step="0.5" min="0" name="guest_meals" value={formData.guest_meals} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group">
            <label>Notes:</label>
            <textarea name="notes" value={formData.notes} onChange={handleChange} rows={3} />
          </div>

          <div className="form-actions">
            <button type="button" onClick={onCancel} className="btn-cancel">Cancel</button>
            <button type="submit" className="btn-submit">Save Entry</button>
          </div>
        </form>
      </div>
    </div>
  );
};
