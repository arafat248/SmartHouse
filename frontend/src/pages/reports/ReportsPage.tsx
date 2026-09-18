import { useState } from 'react';
import { DailyReportTab } from './components/DailyReportTab';
import { MonthlyReportTab } from './components/MonthlyReportTab';
import { MemberReportTab } from './components/MemberReportTab';
import { ExpenseReportTab } from './components/ExpenseReportTab';
import { DepositReportTab } from './components/DepositReportTab';

type ReportTab = 'daily' | 'monthly' | 'member' | 'expenses' | 'deposits';

export function ReportsPage() {
  const [activeTab, setActiveTab] = useState<ReportTab>('monthly');

  const tabs: { id: ReportTab; label: string }[] = [
    { id: 'daily', label: 'Daily Activity' },
    { id: 'monthly', label: 'Monthly Summary' },
    { id: 'member', label: 'Member Contribution' },
    { id: 'expenses', label: 'Expense Ledger' },
    { id: 'deposits', label: 'Deposit Ledger' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
        <p className="text-slate-500 mt-1">Detailed financial and meal insights for your household.</p>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'daily' && <DailyReportTab />}
        {activeTab === 'monthly' && <MonthlyReportTab />}
        {activeTab === 'member' && <MemberReportTab />}
        {activeTab === 'expenses' && <ExpenseReportTab />}
        {activeTab === 'deposits' && <DepositReportTab />}
      </div>

    </div>
  );
}
