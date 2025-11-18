import React from 'react';
import { Link } from 'react-router-dom';
import { 
  CrownIcon, 
  LockIcon, 
  AlertTriangleIcon,
  CreditCardIcon,
  CalendarIcon 
} from 'lucide-react';
import useSubscription from '../hooks/useSubscription';

const PremiumGuard = ({ 
  children, 
  requiredPlan = 'premium',
  fallbackComponent,
  showUpgrade = true 
}) => {
  const { 
    subscription, 
    loading, 
    hasAccess, 
    isExpiringSoon, 
    daysRemaining, 
    currentPlan 
  } = useSubscription();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Checking subscription...</span>
      </div>
    );
  }

  // Show auth required message
  if (subscription?.requiresAuth) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
        <LockIcon className="w-12 h-12 text-blue-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          Sign In Required
        </h3>
        <p className="text-blue-700 mb-4">
          Please sign in to access premium content.
        </p>
        <Link
          to="/signin"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Sign In
        </Link>
      </div>
    );
  }

  // Show expiring soon warning (but still allow access)
  if (hasAccess && isExpiringSoon) {
    return (
      <div className="space-y-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertTriangleIcon className="w-5 h-5 text-yellow-500 mr-3 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-yellow-800">
                Subscription Expiring Soon
              </h4>
              <p className="text-sm text-yellow-700 mt-1">
                Your subscription expires in {daysRemaining} days. 
                <Link 
                  to="/pricing" 
                  className="font-medium underline hover:no-underline ml-1"
                >
                  Renew now
                </Link> to continue accessing premium content.
              </p>
            </div>
          </div>
        </div>
        {children}
      </div>
    );
  }

  // Allow access for users with valid subscription
  if (hasAccess) {
    return <>{children}</>;
  }

  // Show custom fallback if provided
  if (fallbackComponent) {
    return fallbackComponent;
  }

  // Show upgrade prompt for users without access
  if (showUpgrade) {
    return (
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6 text-center">
        <CrownIcon className="w-16 h-16 text-purple-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Premium Content
        </h3>
        <p className="text-gray-600 mb-4">
          Upgrade to {requiredPlan} plan to access this exclusive content and advanced features.
        </p>
        
        {currentPlan !== 'free' && (
          <div className="bg-white rounded-lg p-4 mb-4 border">
            <p className="text-sm text-gray-600">
              Current plan: <span className="font-medium capitalize">{currentPlan}</span>
            </p>
            <p className="text-sm text-gray-600">
              Required: <span className="font-medium capitalize">{requiredPlan}</span>
            </p>
          </div>
        )}

        <div className="space-y-3">
          <Link
            to="/pricing"
            className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors font-medium"
          >
            <CreditCardIcon className="w-5 h-5 mr-2" />
            Upgrade Now
          </Link>
          
          <div className="text-sm text-gray-500">
            Or <Link to="/pricing" className="text-purple-600 hover:underline">
              view all plans
            </Link>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-purple-200">
          <div className="text-xs text-gray-500 space-y-1">
            <div className="flex items-center justify-center">
              <CalendarIcon className="w-3 h-3 mr-1" />
              30-day access period
            </div>
            <div>Instant activation • Cancel anytime</div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

// Higher-order component for protecting routes
export const withPremiumAccess = (Component, options = {}) => {
  return function PremiumProtectedComponent(props) {
    return (
      <PremiumGuard {...options}>
        <Component {...props} />
      </PremiumGuard>
    );
  };
};

// Hook for conditional rendering based on subscription
export const useConditionalAccess = (requiredPlan = 'premium') => {
  const { hasAccess, currentPlan, subscription } = useSubscription();
  
  const canAccess = hasAccess && subscription?.subscription?.plan >= requiredPlan;
  
  return {
    canAccess,
    currentPlan,
    hasAnyAccess: hasAccess,
    needsUpgrade: !canAccess
  };
};

export default PremiumGuard;