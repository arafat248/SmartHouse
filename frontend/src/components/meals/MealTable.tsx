import type { Meal } from '../../types/meal';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '../ui/Table';
import { Button } from '../ui/Button';
import { Edit, Trash2 } from 'lucide-react';

interface MealTableProps {
  meals: Meal[];
  onEdit: (meal: Meal) => void;
  onDelete: (id: number) => void;
}

export const MealTable: React.FC<MealTableProps> = ({ meals, onEdit, onDelete }) => {
  return (
    <Table>
      <TableHeader>
        <TableHead>Date</TableHead>
        <TableHead>Member</TableHead>
        <TableHead>Breakfast</TableHead>
        <TableHead>Lunch</TableHead>
        <TableHead>Dinner</TableHead>
        <TableHead>Guest Meals</TableHead>
        <TableHead>Total</TableHead>
        <TableHead>Actions</TableHead>
      </TableHeader>
      <TableBody>
        {meals.length === 0 ? (
          <TableRow>
            <TableCell colSpan={8} className="text-center text-slate-500 py-8">
              No meals found for the selected filters.
            </TableCell>
          </TableRow>
        ) : (
          meals.map((meal) => (
            <TableRow key={meal.id}>
              <TableCell>{new Date(meal.date).toLocaleDateString()}</TableCell>
              <TableCell>{meal.member_detail?.user?.first_name || meal.member_detail?.user?.email || `Member ${meal.member}`}</TableCell>
              <TableCell>{meal.breakfast}</TableCell>
              <TableCell>{meal.lunch}</TableCell>
              <TableCell>{meal.dinner}</TableCell>
              <TableCell>{meal.guest_meals}</TableCell>
              <TableCell className="font-semibold text-indigo-600">{meal.total_meals}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => onEdit(meal)} leftIcon={<Edit className="h-4 w-4" />}>
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onDelete(meal.id)} leftIcon={<Trash2 className="h-4 w-4 text-red-500" />}>
                    <span className="text-red-500">Delete</span>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

