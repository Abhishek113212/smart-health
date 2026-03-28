import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  Heart, LogOut, Menu, X, Home, Search, Calendar,
  Clock, User, Shield, Stethoscope
} from 'lucide-react';
import { useState } from 'react';

export default function Layout() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = isAuthenticated
    ? user?.role === 'admin'
      ? [
          { to: '/admin', label: 'Dashboard', icon: Shield },
          { to: '/admin/doctors', label: 'Doctors', icon: Stethoscope },
          { to: '/admin/appointments', label: 'Appointments', icon: Calendar },
          { to: '/admin/patients', label: 'Patients', icon: User },
        ]
      : user?.role === 'doctor'
        ? [
            { to: '/doctor/dashboard', label: 'Dashboard', icon: Home },
            { to: '/doctor/appointments', label: 'Appointments', icon: Calendar },
            { to: '/doctor/queue', label: 'Queue', icon: Clock },
          ]
        : [
            { to: '/', label: 'Home', icon: Home },
            { to: '/doctors', label: 'Find Doctors', icon: Search },
            { to: '/appointments', label: 'Appointments', icon: Calendar },
            { to: '/queue', label: 'Queue Status', icon: Clock },
            { to: '/dashboard', label: 'Dashboard', icon: User },
          ]
    : [];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
                  <Heart className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  MediQueue
                </span>
              </Link>
              {isAuthenticated && (
                <div className="hidden md:flex items-center ml-8 space-x-1">
                  {navItems.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive(item.to)
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center space-x-3">
              {isAuthenticated ? (
                <>
                  <div className="hidden sm:flex items-center space-x-2 bg-gray-100 px-3 py-1.5 rounded-full">
                    <div className="w-7 h-7 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {(user?.name as string)?.charAt(0)}
                    </div>
                    <span className="text-sm font-medium text-gray-700">{user?.name as string}</span>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full capitalize">
                      {user?.role}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Logout"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Sign In
                </Link>
              )}
              <button
                className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
        {mobileOpen && isAuthenticated && (
          <div className="md:hidden border-t bg-white px-4 py-2 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive(item.to) ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        )}
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>
    </div>
  );
}
