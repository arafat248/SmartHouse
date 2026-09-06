import type { Meal } from '../../types/meal';


interface MealTableProps {
  meals: Meal[];
  onEdit: (meal: Meal) => void;
  onDelete: (id: number) => void;
}

export const MealTable: React.FC<MealTableProps> = ({ meals, onEdit, onDelete }) => {
  return (
    <div className="meal-table-container">
      <table className="meal-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Member</th>
            <th>Breakfast</th>
            <th>Lunch</th>
            <th>Dinner</th>
            <th>Guest Meals</th>
            <th>Total</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {meals.length === 0 ? (
            <tr>
              <td colSpan={8} className="empty-state">No meals found for the selected filters.</td>
            </tr>
          ) : (
            meals.map((meal) => (
              <tr key={meal.id}>
                <td>{meal.date}</td>
                <td>{meal.member_detail?.user_detail?.first_name || meal.member_detail?.user_detail?.email || `Member ${meal.member}`}</td>
                <td>{meal.breakfast}</td>
                <td>{meal.lunch}</td>
                <td>{meal.dinner}</td>
                <td>{meal.guest_meals}</td>
                <td className="total-cell">{meal.total_meals}</td>
                <td className="actions-cell">
                  <button onClick={() => onEdit(meal)} className="btn-edit">Edit</button>
                  <button onClick={() => {
                    if (window.confirm('Are you sure you want to delete this meal record?')) {
                      onDelete(meal.id);
                    }
                  }} className="btn-delete">Delete</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
