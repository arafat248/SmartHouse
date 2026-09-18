import type { DepositData, ExpenseData, MealData } from '../dashboardApi';

interface RecentActivityProps {
  expenses: ExpenseData[];
  deposits: DepositData[];
  meals: MealData[];
}

export function RecentActivity({ expenses, deposits, meals }: RecentActivityProps) {
  // We can interleave them or show them in tabs, but a simple list approach 
  // grouping by type or just showing latest is good. For simplicity, we'll use a tabbed approach or three columns.
  // Given the space, a 3-column layout inside the card is very informative.
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden mt-6">
      <div className="px-6 py-5 border-b border-slate-100">
        <h3 className="text-lg font-semibold text-slate-900">Recent Activity</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
        
        {/* Expenses List */}
        <div className="p-6">
          <h4 className="text-sm font-medium text-slate-500 mb-4 uppercase tracking-wider">Latest Expenses</h4>
          <div className="space-y-4">
            {expenses.length === 0 ? (
              <p className="text-sm text-slate-400">No recent expenses.</p>
            ) : (
              expenses.map((expense) => (
                <div key={`exp-${expense.id}`} className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-slate-900 line-clamp-1">{expense.title}</p>
                    <p className="text-xs text-slate-500">{new Date(expense.expense_date).toLocaleDateString()}</p>
                  </div>
                  <span className="text-sm font-semibold text-rose-600">-${expense.amount}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Deposits List */}
        <div className="p-6">
          <h4 className="text-sm font-medium text-slate-500 mb-4 uppercase tracking-wider">Latest Deposits</h4>
          <div className="space-y-4">
            {deposits.length === 0 ? (
              <p className="text-sm text-slate-400">No recent deposits.</p>
            ) : (
              deposits.map((deposit) => (
                <div key={`dep-${deposit.id}`} className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{deposit.payment_method}</p>
                    <p className="text-xs text-slate-500">{new Date(deposit.deposit_date).toLocaleDateString()}</p>
                  </div>
                  <span className="text-sm font-semibold text-emerald-600">+${deposit.amount}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Meals List */}
        <div className="p-6">
          <h4 className="text-sm font-medium text-slate-500 mb-4 uppercase tracking-wider">Recent Meals Logged</h4>
          <div className="space-y-4">
            {meals.length === 0 ? (
              <p className="text-sm text-slate-400">No recent meals.</p>
            ) : (
              meals.map((meal) => (
                <div key={`meal-${meal.id}`} className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{meal.member_name}</p>
                    <p className="text-xs text-slate-500">{new Date(meal.date).toLocaleDateString()}</p>
                  </div>
                  <span className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                    {meal.total_meals} meals
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
