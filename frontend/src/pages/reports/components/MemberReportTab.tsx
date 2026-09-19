import { useState } from 'react';
import { useGetMemberReportQuery } from '../../../features/reports/reportsApi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';

export function MemberReportTab() {
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });

  const { data: reportData, isLoading, isError, refetch } = useGetMemberReportQuery(
    { start_date: startDate, end_date: endDate },
    { skip: !startDate || !endDate }
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border-slate-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border-slate-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
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
          {/* Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="text-sm font-semibold text-slate-700 mb-6 uppercase tracking-wider">Contributions vs Expenses Paid</h3>
            <div className="h-[300px] w-full">
              {reportData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-sm text-slate-400">No member data available</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={reportData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="member_name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                    <RechartsTooltip 
                      formatter={(value: any) => [`$${Number(value).toFixed(2)}`, undefined]}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend />
                    <Bar dataKey="total_deposits" name="Total Deposits" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="total_expenses_paid" name="Expenses Paid" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Data Table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Member</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Total Meals</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Total Deposits</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Expenses Paid</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {reportData.map((row) => (
                    <tr key={row.member_id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{row.member_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 text-right">{row.total_meals}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-emerald-600 text-right">
                        ${row.total_deposits.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600 text-right">
                        ${row.total_expenses_paid.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                  {reportData.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-sm text-slate-400">No data available for selected range.</td>
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
