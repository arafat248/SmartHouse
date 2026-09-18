import { useState } from 'react';
import { useGetMonthlyReportQuery } from '../../../features/reports/reportsApi';
import { StatCard } from '../../../features/dashboard/components/StatCard';
import { Receipt, Utensils, TrendingUp, PiggyBank } from 'lucide-react';

export function MonthlyReportTab() {
  const [month, setMonth] = useState(() => new Date().getMonth() + 1);
  const [year, setYear] = useState(() => new Date().getFullYear());

  const { data: reportData, isLoading, isError, refetch } = useGetMonthlyReportQuery(
    { month, year },
    { skip: !month || !year }
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Month</label>
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="border-slate-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border bg-white"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>
                {new Date(0, m - 1).toLocaleString('default', { month: 'long' })}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Year</label>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="border-slate-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border w-24"
          />
        </div>
      </div>

      {isLoading && (
        <div className="h-64 bg-slate-50 rounded-xl border border-slate-100 animate-pulse flex items-center justify-center">
          Loading data...
        </div>
      )}
      
      {isError && (
        <div className="bg-rose-50 text-rose-600 p-4 rounded-xl border border-rose-100 flex justify-between items-center">
          <span>Failed to load report data.</span>
          <button onClick={() => refetch()} className="text-rose-700 font-medium hover:underline">Retry</button>
        </div>
      )}

      {reportData && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Expenses"
              value={`$${reportData.summary.total_expense.toFixed(2)}`}
              icon={<Receipt className="w-6 h-6" />}
              subtitle={`Includes $${reportData.summary.total_food_expense.toFixed(2)} in food`}
            />
            <StatCard
              title="Total Deposits"
              value={`$${reportData.summary.total_deposits.toFixed(2)}`}
              icon={<PiggyBank className="w-6 h-6" />}
            />
            <StatCard
              title="Total Meals"
              value={reportData.summary.total_meals}
              icon={<Utensils className="w-6 h-6" />}
            />
            <StatCard
              title="Meal Rate"
              value={`$${reportData.summary.meal_rate.toFixed(2)}`}
              icon={<TrendingUp className="w-6 h-6" />}
            />
          </div>

          {/* Member Breakdown Table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-900">Member Breakdown</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Member</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Meals</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Meal Cost</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Other Cost</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Total Cost</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Deposits</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Balance</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {reportData.members.map((member) => (
                    <tr key={member.member_name} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{member.member_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 text-right">{member.total_meals}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 text-right">${member.meal_cost.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 text-right">${member.other_cost.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 text-right">${member.total_cost.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-emerald-600 text-right">${member.total_deposit.toFixed(2)}</td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold text-right ${member.balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {member.balance >= 0 ? '+' : ''}${member.balance.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                  {reportData.members.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-sm text-slate-400">No members found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
