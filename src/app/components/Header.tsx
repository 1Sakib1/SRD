import { Link, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Leaf, LogOut, LayoutDashboard, FileText, BookOpen, Recycle, DollarSign, Menu, X } from 'lucide-react';
import { NotificationBell } from './NotificationBell';
import { useState } from 'react';

interface HeaderProps {
  variant?: 'landing' | 'authenticated';
}

export const Header: React.FC<HeaderProps> = ({ variant = 'authenticated' }) => {
  const { isAuthenticated, user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };
  
  if (variant === 'landing') {
    return (
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <Recycle className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg sm:text-xl font-semibold text-gray-900 hidden sm:inline">Smart Rubbish Detection</span>
              <span className="text-lg font-semibold text-gray-900 sm:hidden">SRD</span>
            </Link>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link
                to="/awareness"
                className="px-3 sm:px-4 py-2 text-sm sm:text-base text-gray-700 hover:text-green-600 transition-colors hidden sm:inline-block"
              >
                Awareness
              </Link>
              <Link
                to="/about-us"
                className="px-3 sm:px-4 py-2 text-sm sm:text-base text-gray-700 hover:text-green-600 transition-colors hidden sm:inline-block"
              >
                About
              </Link>
              <Link
                to="/auth"
                className="px-3 sm:px-4 py-2 text-sm sm:text-base text-gray-700 hover:text-green-600 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/auth?tab=register"
                className="px-4 sm:px-6 py-2 text-sm sm:text-base bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors active:scale-95"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      </header>
    );
  }
  
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to={isAdmin ? '/admin' : '/dashboard'} className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <Recycle className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg sm:text-xl font-semibold text-gray-900 hidden sm:inline">Smart Rubbish Detection</span>
            <span className="text-lg font-semibold text-gray-900 sm:hidden">SRD</span>
          </Link>
          
          {isAuthenticated && (
            <>
              {/* Desktop Navigation */}
              <div className="hidden lg:flex items-center space-x-4 xl:space-x-6">
                {!isAdmin && (
                  <div className="flex items-center space-x-2 px-3 py-2 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center space-x-1">
                      <Leaf className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-700">{user?.ecoPoints || 0}</span>
                    </div>
                    <div className="w-px h-4 bg-green-300" />
                    <div className="flex items-center space-x-1">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-700">{user?.credits || 0}</span>
                    </div>
                  </div>
                )}
                
                {/* Notification Bell */}
                <NotificationBell />
                
                <div className="text-sm text-gray-700">
                  <span className="font-medium">{user?.name}</span>
                </div>
                
                {!isAdmin && (
                  <>
                    <Link
                      to="/dashboard"
                      className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-green-600 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span>Dashboard</span>
                    </Link>
                    <Link
                      to="/report"
                      className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-green-600 transition-colors"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Report</span>
                    </Link>
                    <Link
                      to="/awareness"
                      className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-green-600 transition-colors"
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>Awareness</span>
                    </Link>
                  </>
                )}
                
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-red-600 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
              
              {/* Mobile Navigation */}
              <div className="flex lg:hidden items-center space-x-3">
                {!isAdmin && (
                  <div className="flex items-center space-x-2 px-2 py-1.5 bg-green-50 rounded-lg border border-green-200">
                    <Leaf className="w-4 h-4 text-green-600" />
                    <span className="text-xs font-medium text-green-700">{user?.ecoPoints || 0}</span>
                  </div>
                )}
                
                {/* Notification Bell */}
                <NotificationBell />
                
                {/* Hamburger Menu Button */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="p-2 text-gray-700 hover:text-green-600 transition-colors active:scale-95"
                  aria-label="Toggle menu"
                >
                  {isMobileMenuOpen ? (
                    <X className="w-6 h-6" />
                  ) : (
                    <Menu className="w-6 h-6" />
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Mobile Menu Dropdown */}
      {isAuthenticated && isMobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white shadow-lg">
          <div className="px-4 py-4 space-y-1">
            {/* User Info */}
            <div className="px-4 py-3 bg-gray-50 rounded-lg mb-2">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            
            {!isAdmin && (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors active:scale-95"
                >
                  <LayoutDashboard className="w-5 h-5" />
                  <span className="font-medium">Dashboard</span>
                </Link>
                <Link
                  to="/report"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors active:scale-95"
                >
                  <FileText className="w-5 h-5" />
                  <span className="font-medium">Report Rubbish</span>
                </Link>
                <Link
                  to="/awareness"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors active:scale-95"
                >
                  <BookOpen className="w-5 h-5" />
                  <span className="font-medium">Awareness</span>
                </Link>
                
                {/* Credits Display */}
                <div className="px-4 py-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Leaf className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-medium text-gray-700">Eco Points</span>
                    </div>
                    <span className="text-sm font-bold text-green-600">{user?.ecoPoints || 0}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-medium text-gray-700">Credits</span>
                    </div>
                    <span className="text-sm font-bold text-green-600">{user?.credits || 0} AUD</span>
                  </div>
                </div>
              </>
            )}
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors active:scale-95 mt-2"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};