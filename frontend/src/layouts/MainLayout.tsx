import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { 
  Home, 
  Users, 
  Utensils, 
  CreditCard, 
  PiggyBank, 
  Calculator, 
  UserCircle, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { logout } from '../features/auth/authSlice';
import { NotificationDropdown } from '../features/notifications/components/NotificationDropdown';

export const MainLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/', icon: Home },
    { name: 'Households', path: '/households', icon: Users },
    { name: 'Meals', path: '/meals', icon: Utensils },
    { name: 'Expenses', path: '/expenses', icon: CreditCard },
    { name: 'Deposits', path: '/deposits', icon: PiggyBank },
    { name: 'Settlements', path: '/settlements', icon: Calculator },
    { name: 'Profile', path: '/profile', icon: UserCircle },
  ];

  const SidebarContent = () => (
    <div className="sidebar-content">
      <div className="sidebar-header">
        <div className="sidebar-brand">SmartHouse</div>
      </div>
      <nav className="sidebar-nav">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path));
          return (
            <Link 
              key={link.path} 
              to={link.path} 
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Icon size={20} className="nav-icon" />
              <span>{link.name}</span>
            </Link>
          );
        })}
      </nav>
      <div className="sidebar-footer">
        <button className="nav-item text-danger" onClick={handleLogout} style={{ width: '100%', border: 'none', background: 'transparent', cursor: 'pointer' }}>
          <LogOut size={20} className="nav-icon" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="layout-container">
      {/* Mobile Header */}
      <header className="mobile-header">
        <div className="sidebar-brand" style={{ padding: 0 }}>SmartHouse</div>
        <button 
          className="mobile-menu-btn" 
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <Menu size={24} />
        </button>
      </header>

      {/* Desktop Sidebar */}
      <aside className="desktop-sidebar">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="mobile-drawer-overlay" onClick={() => setIsMobileMenuOpen(false)}>
          <aside 
            className="mobile-drawer" 
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              className="drawer-close-btn" 
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X size={24} />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <main className="layout-main">
        <div className="flex justify-end p-4 border-b border-slate-200 bg-white">
          <NotificationDropdown />
        </div>
        <Outlet />
      </main>
    </div>
  );
};
