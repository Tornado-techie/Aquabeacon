// File: client/src/components/Navbar.jsx

import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import AquaBeaconLogo from '../components/AquaBeaconLogo';
import { 
  FiHome, FiUser, FiDroplet, FiFileText, FiDollarSign,
  FiShield, FiSettings, FiLogOut, FiMenu, FiX, FiEye
} from 'react-icons/fi';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Navigation items based on user role
  const getNavigationItems = () => {
    const commonItems = [
      { path: '/dashboard', label: 'Dashboard', icon: <FiHome className="w-4 h-4" /> },
      { path: '/profile', label: 'Profile', icon: <FiUser className="w-4 h-4" /> }
    ];

    const roleSpecificItems = {
      'Consumer': [
        { path: '/report-issue', label: 'Report Issue', icon: <FiDroplet className="w-4 h-4" /> },
        { path: '/my-reports', label: 'My Reports', icon: <FiEye className="w-4 h-4" /> }
      ],
      'Water Business Owner': [
        { path: '/business-profile', label: 'Business', icon: <FiShield className="w-4 h-4" /> },
        { path: '/payments', label: 'Payments', icon: <FiDollarSign className="w-4 h-4" /> }
      ],
      'Inspector': [
        { path: '/inspections', label: 'Inspections', icon: <FiFileText className="w-4 h-4" /> }
      ],
      'Admin': [
        { path: '/admin', label: 'Admin Panel', icon: <FiSettings className="w-4 h-4" /> }
      ]
    };

    return [...commonItems, ...(roleSpecificItems[user?.userType] || [])];
  };

  const navigationItems = getNavigationItems();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center">
              <AquaBeaconLogo size="sm" />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.fullName}</p>
                <p className="text-xs text-gray-500">{user?.userType}</p>
              </div>
              
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.fullName?.charAt(0)?.toUpperCase()}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              <FiLogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              {isMobileMenuOpen ? (
                <FiX className="w-6 h-6" />
              ) : (
                <FiMenu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-4 py-2 space-y-1">
            {/* User Info */}
            <div className="flex items-center space-x-3 px-3 py-3 border-b border-gray-200">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium">
                  {user?.fullName?.charAt(0)?.toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900">{user?.fullName}</p>
                <p className="text-sm text-gray-500">{user?.userType}</p>
              </div>
            </div>

            {/* Navigation Items */}
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 w-full text-left transition-colors"
            >
              <FiLogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;