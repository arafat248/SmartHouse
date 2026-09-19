import { useState } from 'react';
import { 
  useGetMealsQuery, 
  useCreateMealMutation, 
  useUpdateMealMutation, 
  useDeleteMealMutation 
} from '../features/meals/mealsApi';
import { useGetHouseholdsQuery, useGetMembersQuery } from '../features/households/householdsApi';
import { MealForm } from '../components/meals/MealForm';
import type { Meal, MealInput } from '../types/meal';

import { Card, CardContent } from '../components/ui/Card';
import { Select } from '../components/ui/Select';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { MealTable } from '../components/meals/MealTable';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Plus, X } from 'lucide-react';

export const MealsDashboard: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<Meal | undefined>(undefined);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  
  // Filters
  const [filterMonth, setFilterMonth] = useState<string>(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [filterDate, setFilterDate] = useState<string>('');
  const [filterMember, setFilterMember] = useState<number | ''>('');
  
  const { data: households } = useGetHouseholdsQuery(undefined);
  // Default to first household for member dropdown filtering
  const householdId = households && households.length > 0 ? households[0].id : 0;
  const { data: members } = useGetMembersQuery(householdId, { skip: !householdId });

  // Query API
  const queryParams: Record<string, string | number> = {};
  if (filterDate) queryParams.date = filterDate;
  if (filterMonth && !filterDate) queryParams.month = filterMonth;
  if (filterMember) queryParams.member = filterMember;
  
  const { data, isLoading } = useGetMealsQuery(queryParams);
  const meals = data?.results || [];

  const [createMeal] = useCreateMealMutation();
  const [updateMeal] = useUpdateMealMutation();
  const [deleteMeal, { isLoading: isDeleting }] = useDeleteMealMutation();

  const handleCreateNew = () => {
    setEditingMeal(undefined);
    setIsFormOpen(true);
  };

  const handleEdit = (meal: Meal) => {
    setEditingMeal(meal);
    setIsFormOpen(true);
  };

  const handleDelete = async () => {
    if (deleteConfirmId !== null) {
      try {
        await deleteMeal(deleteConfirmId).unwrap();
        setDeleteConfirmId(null);
      } catch (err) {
        console.error('Failed to delete meal', err);
        alert('Failed to delete meal');
      }
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
  const calculateTotals = () => {
    let totalBreakfast = 0;
    let totalLunch = 0;
    let totalDinner = 0;
    let totalGuest = 0;

    meals.forEach(meal => {
      totalBreakfast += Number(meal.breakfast);
      totalLunch += Number(meal.lunch);
      totalDinner += Number(meal.dinner);
      totalGuest += Number(meal.guest_meals);
    });

    const grandTotal = totalBreakfast + totalLunch + totalDinner + totalGuest;

    return { totalBreakfast, totalLunch, totalDinner, totalGuest, grandTotal };
  };
  
  const totals = calculateTotals();
  const summary = totals;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Meals Dashboard</h1>
        <Button onClick={handleCreateNew} leftIcon={<Plus className="h-5 w-5" />}>
          New Meal Entry
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="py-5">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="w-full md:w-1/4">
              <Input 
                label="Month"
                type="month" 
                value={filterMonth} 
                onChange={(e) => { setFilterMonth(e.target.value); setFilterDate(''); }} 
              />
            </div>
            <div className="w-full md:w-1/4">
              <Input 
                label="Specific Date"
                type="date" 
                value={filterDate} 
                onChange={(e) => { setFilterDate(e.target.value); setFilterMonth(''); }} 
              />
            </div>
            <div className="w-full md:w-1/4">
              <Select 
                label="Member"
                value={filterMember} 
                onChange={(e) => setFilterMember(e.target.value ? parseInt(e.target.value, 10) : '')}
              >
                <option value="">All Members</option>
                {members?.map((m) => (
                  <option key={m.id} value={m.id}>{m.user.first_name} {m.user.last_name}</option>
                ))}
              </Select>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <Button variant="outline" onClick={() => {
                setFilterMonth(new Date().toISOString().slice(0, 7));
                setFilterDate('');
                setFilterMember('');
              }} leftIcon={<X className="h-4 w-4" />}>
                Reset Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-medium text-slate-500">Breakfast</p>
            <p className="text-2xl font-bold text-slate-900">{summary.totalBreakfast}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-medium text-slate-500">Lunch</p>
            <p className="text-2xl font-bold text-slate-900">{summary.totalLunch}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-medium text-slate-500">Dinner</p>
            <p className="text-2xl font-bold text-slate-900">{summary.totalDinner}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-medium text-slate-500">Guest Meals</p>
            <p className="text-2xl font-bold text-slate-900">{summary.totalGuest}</p>
          </CardContent>
        </Card>
        <Card className="bg-indigo-50 border-indigo-100">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-indigo-600">Total Meals</p>
            <p className="text-2xl font-bold text-indigo-900">{summary.grandTotal}</p>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6">
        {isLoading ? (
          <LoadingSkeleton rows={5} />
        ) : (
          <MealTable meals={meals} onEdit={handleEdit} onDelete={(id) => setDeleteConfirmId(id)} />
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

      <ConfirmDialog
        isOpen={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={handleDelete}
        title="Delete Meal"
        message="Are you sure you want to delete this meal entry? This action cannot be undone."
        confirmText="Delete"
        isDestructive={true}
        isLoading={isDeleting}
      />
    </div>
  );
};

