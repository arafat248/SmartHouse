import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import { MainLayout } from './layouts/MainLayout';
import { MealsDashboard } from './pages/MealsDashboard';
import { ExpensesPage } from './pages/ExpensesPage';
import { DepositsPage } from './pages/DepositsPage';
import { SettlementsPage } from './pages/SettlementsPage';
import { SettlementDetailsPage } from './pages/SettlementDetailsPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { ReportsPage } from './pages/reports/ReportsPage';
import { NotificationsPage } from './pages/notifications/NotificationsPage';

import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<div>Login Page (Placeholder)</div>} />
      <Route path="/register" element={<div>Register Page (Placeholder)</div>} />
      
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
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
  );
}

export default App;
