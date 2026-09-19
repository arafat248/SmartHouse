import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import { MainLayout } from './layouts/MainLayout';
import { LoadingSkeleton } from './components/ui/LoadingSkeleton';

import './App.css';

const LoginPage = lazy(() => import('./pages/LoginPage').then(module => ({ default: module.LoginPage })));
const RegisterPage = lazy(() => import('./pages/RegisterPage').then(module => ({ default: module.RegisterPage })));
const MealsDashboard = lazy(() => import('./pages/MealsDashboard').then(module => ({ default: module.MealsDashboard })));
const ExpensesPage = lazy(() => import('./pages/ExpensesPage').then(module => ({ default: module.ExpensesPage })));
const DepositsPage = lazy(() => import('./pages/DepositsPage').then(module => ({ default: module.DepositsPage })));
const SettlementsPage = lazy(() => import('./pages/SettlementsPage').then(module => ({ default: module.SettlementsPage })));
const SettlementDetailsPage = lazy(() => import('./pages/SettlementDetailsPage').then(module => ({ default: module.SettlementDetailsPage })));
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage').then(module => ({ default: module.DashboardPage })));
const ReportsPage = lazy(() => import('./pages/reports/ReportsPage').then(module => ({ default: module.ReportsPage })));
const NotificationsPage = lazy(() => import('./pages/notifications/NotificationsPage').then(module => ({ default: module.NotificationsPage })));
const AuditLogPage = lazy(() => import('./pages/audit/AuditLogPage').then(module => ({ default: module.default })));

function App() {
  return (
    <Suspense fallback={<div className="p-8 max-w-7xl mx-auto w-full"><LoadingSkeleton rows={10} /></div>}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/audit" element={<AuditLogPage />} />
            <Route path="/households/*" element={<div>Households (To be implemented)</div>} />
            <Route path="/meals/*" element={<MealsDashboard />} />
            <Route path="/expenses/*" element={<ExpensesPage />} />
            <Route path="/deposits/*" element={<DepositsPage />} />
            <Route path="/settlements" element={<SettlementsPage />} />
            <Route path="/settlements/:id" element={<SettlementDetailsPage />} />
            <Route path="/profile" element={<div>Profile (To be implemented)</div>} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;

