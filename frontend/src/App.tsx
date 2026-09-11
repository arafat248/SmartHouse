import { Routes, Route, Link, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import { MealsDashboard } from './pages/MealsDashboard';
import { ExpensesPage } from './pages/ExpensesPage';
import { DepositsPage } from './pages/DepositsPage';
import { SettlementsPage } from './pages/SettlementsPage';
import { SettlementDetailsPage } from './pages/SettlementDetailsPage';

import './App.css';

function App() {
  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="navbar-brand">SmartHouse</div>
        <div className="navbar-links">
          <Link to="/households">Households</Link>
          <Link to="/meals">Meals</Link>
          <Link to="/expenses">Expenses</Link>
          <Link to="/deposits">Deposits</Link>
          <Link to="/settlements">Settlements</Link>
          <Link to="/profile">Profile</Link>
        </div>
      </nav>

      <main className="main-content">
        <Routes>
          <Route path="/login" element={<div>Login Page (Placeholder)</div>} />
          <Route path="/register" element={<div>Register Page (Placeholder)</div>} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/households/*" element={<div>Households (To be implemented)</div>} />
            <Route path="/meals/*" element={<MealsDashboard />} />
            <Route path="/expenses/*" element={<ExpensesPage />} />
            <Route path="/deposits/*" element={<DepositsPage />} />
            <Route path="/settlements" element={<SettlementsPage />} />
            <Route path="/settlements/:id" element={<SettlementDetailsPage />} />
            <Route path="/profile" element={<div>Profile (To be implemented)</div>} />
            <Route path="/" element={<Navigate to="/households" replace />} />
          </Route>
        </Routes>
      </main>
    </div>
  );
}

export default App;
