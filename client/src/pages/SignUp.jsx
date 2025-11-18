import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiDroplet, FiMail, FiLock, FiUser, FiEye, FiEyeOff, FiPhone } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import AquaBeaconLogo from '../components/AquaBeaconLogo';
import toast from 'react-hot-toast';
// Force Vercel cache invalidation - Updated: 2025-11-13

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'owner',
    adminCode: '',
    agreeToTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Handle URL parameters for role pre-selection
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const roleParam = urlParams.get('role');
    
    if (roleParam && ['owner', 'inspector', 'consumer', 'admin'].includes(roleParam)) {
      setFormData(prev => ({
        ...prev,
        role: roleParam
      }));
    }
  }, [location.search]);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Frontend validation
    if (!formData.name || !formData.email || !formData.phone || !formData.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.role === 'admin' && !formData.adminCode) {
      toast.error('Admin authorization code is required');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (!formData.agreeToTerms) {
      toast.error('Please agree to the terms and conditions');
      return;
    }

    setLoading(true);

    try {
      // Split the full name into firstName and lastName
      const nameParts = formData.name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Map role to userType that backend expects
      const roleMapping = {
        'owner': 'Water Business Owner',
        'consumer': 'Consumer', 
        'inspector': 'Inspector',
        'admin': 'Administrator'
      };

      const registrationData = {
        firstName,
        lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        userType: roleMapping[formData.role],
        role: formData.role // Add explicit role
      };

      // Add admin code if admin role
      if (formData.role === 'admin') {
        registrationData.adminCode = formData.adminCode;
      }

      const result = await register(registrationData);
      
      // Only show success if registration actually succeeded
      if (result) {
        toast.success('Account created successfully!');
        navigate('/dashboard');
      }
    } catch (error) {
      // Handle specific backend errors
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      
      console.error('Registration error details:', {
        status: error.response?.status,
        message: errorMessage,
        data: error.response?.data
      });
      
      // Handle specific error cases
      if (error.response?.status === 403) {
        toast.error(errorMessage); // Show the exact 403 message (e.g., "Invalid admin authorization code")
      } else if (errorMessage.includes('email')) {
        toast.error('This email is already registered');
      } else if (errorMessage.includes('phone')) {
        toast.error('This phone number is already registered');
      } else {
        toast.error(errorMessage);
      }
      
      console.error('Registration error:', error);
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
            Create your account {/* Updated with admin access */}
            {formData.role === 'inspector' && (
              <span className="block text-lg font-medium text-green-600 mt-1">
                Join as Inspector
              </span>
            )}
            {formData.role === 'consumer' && (
              <span className="block text-lg font-medium text-purple-600 mt-1">
                Join as Consumer
              </span>
            )}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Already have an account?{' '}
            <Link 
              to={`/signin${formData.role !== 'owner' ? `?role=${formData.role}` : ''}`}
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              Sign in
              {formData.role === 'inspector' && ' as Inspector'}
              {formData.role === 'consumer' && ' as Consumer'}
            </Link>
          </p>
        </div>

        {/* Form */}
        <div className="bg-white py-8 px-6 shadow-xl rounded-lg">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  placeholder="John Doe"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address *
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

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiPhone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  placeholder="+254 707806523"
                />
              </div>
            </div>

            {/* Role */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                I am a *
                {formData.role === 'inspector' && (
                  <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Inspector Tools Selected
                  </span>
                )}
                {formData.role === 'consumer' && (
                  <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    Consumer Access Selected
                  </span>
                )}
                {formData.role === 'owner' && (
                  <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Business Owner Selected
                  </span>
                )}
                {formData.role === 'admin' && (
                  <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Admin Access Selected
                  </span>
                )}
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                required
              >
                <option value="owner">Water Business Owner</option>
                <option value="consumer">Consumer</option>
                <option value="inspector">Inspector</option>
                <option value="admin">System Administrator</option>
              </select>
              {formData.role === 'inspector' && (
                <p className="mt-1 text-xs text-green-600">
                  🔍 You'll get access to digital inspection templates and reporting tools
                </p>
              )}
              {formData.role === 'consumer' && (
                <p className="mt-1 text-xs text-purple-600">
                  👥 You can report water quality issues and track complaint status
                </p>
              )}
              {formData.role === 'owner' && (
                <p className="mt-1 text-xs text-blue-600">
                  🚰 You'll get business dashboard, permits tracking, and compliance tools
                </p>
              )}
              {formData.role === 'admin' && (
                <p className="mt-1 text-xs text-red-600">
                  ⚠️ Admin access requires authorization code. Contact system administrator.
                </p>
              )}
            </div>

            {/* Admin Code - Only show if admin role selected */}
            {formData.role === 'admin' && (
              <div>
                <label htmlFor="adminCode" className="block text-sm font-medium text-gray-700 mb-1">
                  Admin Authorization Code *
                </label>
                <input
                  id="adminCode"
                  name="adminCode"
                  type="password"
                  required
                  value={formData.adminCode || ''}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter admin code"
                />
                <p className="mt-1 text-xs text-gray-500">
                  This code is provided by the system administrator to authorized personnel only.
                </p>
              </div>
            )}

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
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
              <p className="mt-1 text-xs text-gray-500">Must be at least 6 characters</p>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-start">
              <input
                id="agreeToTerms"
                name="agreeToTerms"
                type="checkbox"
                checked={formData.agreeToTerms}
                onChange={handleChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-1"
              />
              <label htmlFor="agreeToTerms" className="ml-2 block text-sm text-gray-700">
                I agree to the{' '}
                <Link to="/terms" className="text-primary-600 hover:text-primary-500">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-primary-600 hover:text-primary-500">
                  Privacy Policy
                </Link>
              </label>
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
                  Creating account...
                </span>
              ) : (
                'Create account'
              )}
            </button>
          </form>

          {/* Guest Access Note */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Need to report a water quality issue?{' '}
              <Link to="/complaints/submit" className="font-medium text-primary-600 hover:text-primary-500">
                Submit without registering
              </Link>
            </p>
          </div>
        </div>

        {/* Admin Access Notice */}
        {formData.role === 'admin' && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm font-medium text-red-900 mb-2">🔐 Administrator Registration</p>
            <div className="text-xs text-red-700 space-y-1">
              <p>• Admin accounts have full system access</p>
              <p>• Authorization code required for security</p>
              <p>• Contact IT administrator for the registration code</p>
              <p>• Demo code for testing: <code className="bg-red-100 px-1 rounded">AQUA_ADMIN_2025</code></p>
            </div>
          </div>
        )}

        {/* Free Trial Notice */}
        {formData.role !== 'admin' && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <p className="text-sm text-green-800">
              🎉 <strong>Start with a free trial!</strong> No credit card required.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignUp;