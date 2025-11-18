import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiLogOut } from 'react-icons/fi';
import AquaBeaconLogo from '../AquaBeaconLogo';
import NotificationDropdown, { ConnectionStatusIndicator } from '../common/NotificationDropdown';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex items-center">
              <AquaBeaconLogo size="md" />
            </Link>
            
            {isAuthenticated && (
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  to="/dashboard"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-primary-600"
                >
                  Dashboard
                </Link>
                {(user?.role === 'owner' || user?.role === 'admin') && (
                  <Link
                    to="/plants/setup"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-primary-600"
                  >
                    My Plants
                  </Link>
                )}
                {(user?.role === 'admin' || user?.role === 'inspector') && (
                  <Link
                    to="/admin"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-primary-600"
                  >
                    Admin
                  </Link>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* Connection Status Indicator */}
                <ConnectionStatusIndicator />
                
                {/* Real-time Notifications */}
                <NotificationDropdown />
                
                <span className="text-sm text-gray-700">
                  {user?.firstName} ({user?.role})
                </span>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                >
                  <FiLogOut className="mr-2" />
                  Logout
                </button>
              </>
            ) : (
              <div className="space-x-4">
                <Link
                  to="/signin"
                  className="text-sm font-medium text-gray-700 hover:text-primary-600"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;