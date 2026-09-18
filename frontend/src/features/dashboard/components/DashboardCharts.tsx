import { 
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  LineChart, Line, Legend
} from 'recharts';
import type { ChartExpenseCategory, ChartMemberConsumption, ChartMonthlyTrend } from '../dashboardApi';

interface DashboardChartsProps {
  expenseByCategory: ChartExpenseCategory[];
  monthlyExpenseTrend: ChartMonthlyTrend[];
  memberMealConsumption: ChartMemberConsumption[];
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

export function DashboardCharts({ 
  expenseByCategory, 
  monthlyExpenseTrend, 
  memberMealConsumption 
}: DashboardChartsProps) {
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      
      {/* Expense By Category */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h3 className="text-sm font-semibold text-slate-700 mb-6 uppercase tracking-wider">Expense by Category</h3>
        <div className="h-[300px] w-full">
          {expenseByCategory.length === 0 ? (
            <div className="h-full flex items-center justify-center text-sm text-slate-400">No expense data available</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseByCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {expenseByCategory.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Amount']}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Member Meal Consumption */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h3 className="text-sm font-semibold text-slate-700 mb-6 uppercase tracking-wider">Member Meal Consumption</h3>
        <div className="h-[300px] w-full">
          {memberMealConsumption.length === 0 ? (
             <div className="h-full flex items-center justify-center text-sm text-slate-400">No meal data available</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={memberMealConsumption} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="meals" fill="#6366f1" radius={[4, 4, 0, 0]} name="Total Meals" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Monthly Expense Trend */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 lg:col-span-2">
        <h3 className="text-sm font-semibold text-slate-700 mb-6 uppercase tracking-wider">6-Month Expense Trend</h3>
        <div className="h-[300px] w-full">
          {monthlyExpenseTrend.length === 0 ? (
             <div className="h-full flex items-center justify-center text-sm text-slate-400">No trend data available</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyExpenseTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip 
                  formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Expense']}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Line type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} name="Total Expenses" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

    </div>
  );
}
