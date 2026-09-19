import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout as logoutAction } from '../features/auth/authSlice';
import { 
  Home, 
  CreditCard, 
  Receipt, 
  Utensils, 
  BarChart3, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Shield
} from 'lucide-react';
import { NotificationDropdown } from '../features/notifications/components/NotificationDropdown';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Meals', href: '/meals', icon: Utensils },
  { name: 'Expenses', href: '/expenses', icon: Receipt },
  { name: 'Deposits', href: '/deposits', icon: CreditCard },
  { name: 'Settlements', href: '/settlements', icon: BarChart3 },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
];

const SidebarContent = ({ location, logout }: { location: any, logout: () => void }) => (
  <div className="flex flex-col h-full bg-white border-r border-slate-200">
    <div className="flex h-16 shrink-0 items-center px-6">
      <Shield className="h-8 w-8 text-indigo-600" />
      <span className="ml-2 text-xl font-bold text-slate-900 tracking-tight">SmartHouse</span>
    </div>
    <div className="flex flex-1 flex-col overflow-y-auto">
      <nav className="flex-1 px-4 py-4 space-y-1">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href || location.pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`
                group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors
                ${isActive 
                  ? 'bg-indigo-50 text-indigo-600' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
              `}
            >
              <item.icon
                className={`
                  mr-3 h-5 w-5 shrink-0 transition-colors
                  ${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}
                `}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-slate-200 space-y-1">
        <Link
          to="/profile"
          className="group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
        >
          <Settings className="mr-3 h-5 w-5 text-slate-400 group-hover:text-slate-600 shrink-0" aria-hidden="true" />
          Settings
        </Link>
        <button
          onClick={logout}
          className="w-full group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
        >
          <LogOut className="mr-3 h-5 w-5 text-rose-500 shrink-0" aria-hidden="true" />
          Logout
        </button>
      </div>
    </div>
  </div>
);

export const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logoutAction());
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile Drawer */}
      {sidebarOpen && (
        <div className="relative z-50 lg:hidden">
          <div className="fixed inset-0 bg-slate-900/80 transition-opacity" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-0 flex">
            <div className="relative mr-16 flex w-full max-w-xs flex-1 transform transition duration-300 ease-in-out">
              <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                <button type="button" className="-m-2.5 p-2.5 text-white" onClick={() => setSidebarOpen(false)}>
                  <span className="sr-only">Close sidebar</span>
                  <X className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
              <SidebarContent location={location} logout={handleLogout} />
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:w-64 lg:flex-col">
        <SidebarContent location={location} logout={handleLogout} />
      </div>

      {/* Main Content */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-slate-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button type="button" className="-m-2.5 p-2.5 text-slate-700 lg:hidden" onClick={() => setSidebarOpen(true)}>
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
