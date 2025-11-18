import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiMail, FiLock, FiDroplet, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import AquaBeaconLogo from '../components/AquaBeaconLogo';
import { isAdminEnabled } from '../config/adminConfig';
import toast from 'react-hot-toast';

const SignIn = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [selectedRole, setSelectedRole] = useState('owner');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Handle URL parameters for role indication
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const roleParam = urlParams.get('role');
    
    if (roleParam && ['owner', 'inspector', 'consumer', 'admin'].includes(roleParam)) {
      setSelectedRole(roleParam);
    }
  }, [location.search]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);
      // Only show success if login actually succeeded
      toast.success('Welcome back!');
      
      // Redirect based on user role
      const userRole = result.user?.role;
      if (userRole === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      // Handle specific error messages from backend
      const errorMessage = error.response?.data?.message || 'Invalid email or password';
      toast.error(errorMessage);
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex justify-center">
            <AquaBeaconLogo 
              width={220} 
              height={70} 
              showText={true}
              className="hover:opacity-90 transition-opacity"
            />
          </Link>
          <h2 className="mt-6 text-2xl font-bold text-gray-900">
            Sign in to your account
            {selectedRole === 'inspector' && (
              <span className="block text-lg font-medium text-green-600 mt-1">
                Inspector Access
              </span>
            )}
            {selectedRole === 'consumer' && (
              <span className="block text-lg font-medium text-purple-600 mt-1">
                Consumer Access
              </span>
            )}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Or{' '}
            <Link 
              to={`/signup${selectedRole !== 'owner' ? `?role=${selectedRole}` : ''}`} 
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              create a new account
              {selectedRole === 'inspector' && ' as Inspector'}
              {selectedRole === 'consumer' && ' as Consumer'}
            </Link>
          </p>
        </div>

        {/* Form */}
        <div className="bg-white py-8 px-6 shadow-xl rounded-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* User Type Selector */}
            <div>
              <label htmlFor="userType" className="block text-sm font-medium text-gray-700 mb-1">
                I am
                {selectedRole === 'inspector' && (
                  <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Inspector Tools
                  </span>
                )}
                {selectedRole === 'consumer' && (
                  <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    Consumer Access
                  </span>
                )}
                {selectedRole === 'owner' && (
                  <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Business Owner
                  </span>
                )}
                {selectedRole === 'admin' && (
                  <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Administrator
                  </span>
                )}
              </label>
              <select
                id="userType"
                name="userType"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="owner">Water Business Owner</option>
                <option value="consumer">Consumer</option>
                <option value="inspector">Inspector</option>
                {/* Admin option - controlled by admin config */}
                {isAdminEnabled() && (
                  <option value="admin">System Administrator</option>
                )}
              </select>
              <p className="text-xs text-gray-400 mt-1">
                (Your role is automatically detected after login. This is just for context.)
              </p>
              {selectedRole === 'inspector' && (
                <p className="mt-1 text-xs text-green-600">
                  🔍 Looking for inspection tools? Sign in with your inspector credentials.
                </p>
              )}
              {selectedRole === 'consumer' && (
                <p className="mt-1 text-xs text-purple-600">
                  👥 Want to report issues? You can submit complaints without login too!
                </p>
              )}
              {selectedRole === 'owner' && (
                <p className="mt-1 text-xs text-blue-600">
                  🚰 Sign in to access your business dashboard and compliance tools.
                </p>
              )}
              {selectedRole === 'admin' && (
                <p className="mt-1 text-xs text-red-600">
                  ⚙️ Sign in to access system administration and analytics tools.
                </p>
              )}
            </div>
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <FiEyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <FiEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link to="/forgot-password" className="font-medium text-primary-600 hover:text-primary-500">
                  Forgot password?
                </Link>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          {/* Guest Access Note */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Want to report a water issue?{' '}
              <Link to="/complaints/submit" className="font-medium text-primary-600 hover:text-primary-500">
                Submit without login
              </Link>
            </p>
          </div>
        </div>

        {/* Demo Accounts */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm font-medium text-blue-900 mb-2">Demo Accounts (for testing):</p>
          <div className="space-y-1 text-xs text-blue-700">
            <p><strong>Owner:</strong> owner@test.com / water@1</p>
            <p><strong>Admin:</strong> admin@test.com / water@1</p>
            <p><strong>Inspector:</strong> inspector@test.com / water@1</p>
          </div>
        </div>

        {/* Admin Access Info */}
        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm font-medium text-red-900 mb-2">👨‍💻 Admin Access:</p>
          <div className="space-y-1 text-xs text-red-700">
            <p>• Existing admins can sign in directly with email/password</p>
            <p>• New admin accounts require authorization code during signup</p>
            <p>• Contact system administrator for admin access codes</p>
            <p>• Admin dashboard: Advanced analytics, user management, system monitoring</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;