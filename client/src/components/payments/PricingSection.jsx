import React, { useState, useContext } from 'react';
import { FiCheck, FiStar } from 'react-icons/fi';
import PaymentModal from './PaymentModal';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

const PRICING_PLANS = [
  {
    id: 'basic',
    name: 'Basic Plan',
    price: 1500,
    duration: 'monthly',
    type: 'subscription',
    description: 'Perfect for small water businesses',
    features: [
      'Monitor up to 5 water sources',
      'Basic quality testing reports',
      'Email support',
      'Monthly compliance reminders',
      'Basic dashboard analytics'
    ],
    popular: false,
    color: 'blue'
  },
  {
    id: 'premium',
    name: 'Premium Plan',
    price: 5000,
    duration: 'monthly',
    type: 'subscription',
    description: 'Ideal for growing businesses',
    features: [
      'Monitor unlimited water sources',
      'Advanced quality testing & lab integration',
      'Priority phone & email support',
      'Real-time compliance monitoring',
      'Advanced analytics & reporting',
      'Custom compliance alerts',
      'Mobile app access',
      'API integration'
    ],
    popular: true,
    color: 'green'
  },
  {
    id: 'enterprise',
    name: 'Enterprise Plan',
    price: 12000,
    duration: 'monthly',
    type: 'subscription',
    description: 'For large organizations',
    features: [
      'Everything in Premium',
      'Multi-location management',
      'Custom integrations',
      'Dedicated account manager',
      '24/7 priority support',
      'Custom reporting templates',
      'White-label solutions',
      'Training & onboarding'
    ],
    popular: false,
    color: 'purple'
  }
];

const PricingSection = () => {
  const { user } = useContext(AuthContext);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const handleSelectPlan = (plan) => {
    if (!user) {
      toast.error('Please login to subscribe to a plan');
      return;
    }

    setSelectedPlan(plan);
    setIsPaymentModalOpen(true);
  };

  const getColorClasses = (color, isPopular = false) => {
    const colors = {
      blue: {
        border: 'border-blue-200',
        button: 'bg-blue-600 hover:bg-blue-700 text-white',
        accent: 'text-blue-600',
        popular: 'bg-blue-100 text-blue-800'
      },
      green: {
        border: 'border-green-200',
        button: 'bg-green-600 hover:bg-green-700 text-white',
        accent: 'text-green-600',
        popular: 'bg-green-100 text-green-800'
      },
      purple: {
        border: 'border-purple-200',
        button: 'bg-purple-600 hover:bg-purple-700 text-white',
        accent: 'text-purple-600',
        popular: 'bg-purple-100 text-purple-800'
      }
    };

    return colors[color] || colors.blue;
  };

  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Select the perfect plan for your water business needs. 
            All plans include our core water quality monitoring features.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {PRICING_PLANS.map((plan) => {
            const colorClasses = getColorClasses(plan.color, plan.popular);
            
            return (
              <div
                key={plan.id}
                className={`relative bg-white rounded-xl shadow-lg p-8 ${colorClasses.border} border-2 ${
                  plan.popular ? 'transform scale-105' : ''
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className={`${colorClasses.popular} px-4 py-1 rounded-full text-sm font-medium flex items-center`}>
                      <FiStar className="w-4 h-4 mr-1" />
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {plan.description}
                  </p>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900">
                      KSH {plan.price.toLocaleString()}
                    </span>
                    <span className="text-gray-600 ml-2">
                      /{plan.duration}
                    </span>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <FiCheck className={`w-5 h-5 ${colorClasses.accent} mt-0.5 mr-3 flex-shrink-0`} />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <button
                  onClick={() => handleSelectPlan(plan)}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors duration-200 ${colorClasses.button}`}
                >
                  {user ? `Choose ${plan.name}` : 'Login to Subscribe'}
                </button>

                {/* Current Plan Indicator */}
                {user?.subscription?.plan === plan.id && user?.subscription?.status === 'active' && (
                  <div className="mt-3 text-center">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      <FiCheck className="w-4 h-4 mr-1" />
                      Current Plan
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Frequently Asked Questions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                How does M-Pesa payment work?
              </h4>
              <p className="text-gray-600">
                After selecting your plan, you'll receive an M-Pesa prompt on your phone. 
                Simply enter your PIN to complete the payment securely.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Can I change plans later?
              </h4>
              <p className="text-gray-600">
                Yes, you can upgrade or downgrade your plan at any time. 
                Changes will take effect at your next billing cycle.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Is there a free trial?
              </h4>
              <p className="text-gray-600">
                We offer a 7-day free trial for all new users to explore 
                our platform before committing to a paid plan.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                What payment methods do you accept?
              </h4>
              <p className="text-gray-600">
                We accept M-Pesa payments for all Kenyan customers. 
                Other payment methods are available for international users.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Support */}
        <div className="mt-12 text-center">
          <p className="text-gray-600">
            Need help choosing the right plan?{' '}
            <a href="mailto:info@aquabeacon.co.ke" className="text-blue-600 hover:text-blue-700 font-medium">
              Contact our sales team
            </a>
          </p>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        selectedPlan={selectedPlan}
        user={user}
      />
    </div>
  );
};

export default PricingSection;