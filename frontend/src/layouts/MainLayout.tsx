import { useState, Fragment } from 'react';
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
  X,
  Shield,
  Bell
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
    { name: 'Reports', path: '/reports', icon: Calculator },
    { name: 'Audit Logs', path: '/audit', icon: Shield },
    { name: 'Profile', path: '/profile', icon: UserCircle },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white border-r border-slate-200">
      <div className="flex h-16 shrink-0 items-center px-6 border-b border-slate-200">
        <span className="text-xl font-bold text-indigo-600">SmartHouse</span>
      </div>
      <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path));
          return (
            <Link 
              key={link.path} 
              to={link.path} 
              className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Icon className={`mr-3 h-5 w-5 flex-shrink-0 ${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-500'}`} aria-hidden="true" />
              {link.name}
            </Link>
          );
        })}
      </nav>
      <div className="flex flex-shrink-0 border-t border-slate-200 p-4">
        <button 
          onClick={handleLogout}
          className="group flex w-full items-center px-2 py-2 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 rounded-md transition-colors"
        >
          <LogOut className="mr-3 h-5 w-5 flex-shrink-0 text-red-500 group-hover:text-red-600" aria-hidden="true" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="relative z-50 lg:hidden">
          <div className="fixed inset-0 bg-slate-900/80 transition-opacity" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="fixed inset-0 flex">
            <div className="relative mr-16 flex w-full max-w-xs flex-1 transform transition duration-300 ease-in-out">
              <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                <button type="button" className="-m-2.5 p-2.5 text-white" onClick={() => setIsMobileMenuOpen(false)}>
                  <span className="sr-only">Close sidebar</span>
                  <X className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
              <SidebarContent />
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:w-64 lg:flex-col">
        <SidebarContent />
      </div>

      {/* Main Content */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-slate-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button type="button" className="-m-2.5 p-2.5 text-slate-700 lg:hidden" onClick={() => setIsMobileMenuOpen(true)}>
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
          <div className="h-6 w-px bg-slate-200 lg:hidden" aria-hidden="true" />
          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6 justify-end items-center">
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <NotificationDropdown />
            </div>
          </div>
        </div>

        <main className="flex-1 py-8">
          <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
