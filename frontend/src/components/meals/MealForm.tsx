import { useState } from 'react';
import type { Meal, MealInput } from '../../types/meal';
import { useGetHouseholdsQuery, useGetMembersQuery } from '../../features/households/householdsApi';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

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
    <Modal isOpen={true} onClose={onCancel} title={meal ? 'Edit Meal Entry' : 'Daily Meal Entry'} maxWidth="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        
        <Select label="Household" name="household" value={formData.household} onChange={handleChange} required>
          <option value="">Select Household</option>
          {households?.map((h) => (
            <option key={h.id} value={h.id}>{h.name}</option>
          ))}
        </Select>

        <Select label="Member" name="member" value={formData.member} onChange={handleChange} required disabled={!formData.household}>
          <option value="">Select Member</option>
          {members?.map((m) => (
            <option key={m.id} value={m.id}>{m.user.first_name} {m.user.last_name}</option>
          ))}
        </Select>

        <Input label="Date" type="date" name="date" value={formData.date} onChange={handleChange} required />

        <div className="grid grid-cols-2 gap-4">
          <Input label="Breakfast" type="number" step="0.5" min="0" name="breakfast" value={formData.breakfast} onChange={handleChange} />
          <Input label="Lunch" type="number" step="0.5" min="0" name="lunch" value={formData.lunch} onChange={handleChange} />
          <Input label="Dinner" type="number" step="0.5" min="0" name="dinner" value={formData.dinner} onChange={handleChange} />
          <Input label="Guest Meals" type="number" step="0.5" min="0" name="guest_meals" value={formData.guest_meals} onChange={handleChange} />
        </div>

        <div className="w-full">
          <label className="block text-sm font-medium text-slate-700 mb-1">Notes (Optional)</label>
          <textarea
            className="block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
          />
        </div>

        <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse gap-3 pt-4 border-t border-slate-200">
          <Button type="submit" className="w-full sm:w-auto">Save Entry</Button>
          <Button type="button" variant="outline" onClick={onCancel} className="mt-3 w-full sm:mt-0 sm:w-auto">Cancel</Button>
        </div>
      </form>
    </Modal>
  );
};

