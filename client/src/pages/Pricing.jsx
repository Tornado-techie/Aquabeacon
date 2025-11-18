import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FiDroplet, FiCheckCircle, FiX, FiArrowRight, FiHelpCircle,
  FiCreditCard, FiShield, FiZap, FiUsers
} from 'react-icons/fi';
import AquaBeaconLogo from '../components/AquaBeaconLogo';
import { FaWhatsapp } from 'react-icons/fa';
import toast from 'react-hot-toast';
import PaymentModal from '../components/payments/PaymentModal';

const Pricing = () => {
  const [billingCycle, setBillingCycle] = useState('monthly'); // monthly or annual
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const navigate = useNavigate();

  const pricingPlans = [
    {
      id: 'free',
      name: 'Free',
      monthlyPrice: 0,
      annualPrice: 0,
      description: 'Perfect for consumers and exploring the platform',
      icon: '🆓',
      features: {
        included: [
          'Submit complaints without login',
          'Access knowledge hub & guides',
          'View water quality standards',
          'AI assistant (6 questions/day)',
          'Basic FAQs support',
          'Community forum access',
          'Mobile app access'
        ],
        notIncluded: [
          'Business dashboard',
          'Lab test booking',
          'Permit reminders',
          'AI assistant (limited to 6 questions/day)',
          'Priority support'
        ]
      },
      cta: 'Get Started Free',
      popular: false
    },
    {
      id: 'pro',
      name: 'Pro',
      monthlyPrice: 5,
      annualPrice: 50,
      description: 'For water entrepreneurs & small plants',
      icon: '🚀',
      features: {
        included: [
          'Everything in Free',
          'Full business dashboard',
          'Plant setup wizard',
          'Lab test booking & tracking',
          'Permit expiry reminders (SMS + Email)',
          'AI assistant (unlimited water-specific queries)',
          'Compliance reports & certificates',
          'Email & SMS notifications',
          'Document storage (5GB)',
          'Priority email support',
          'Training modules access'
        ],
        notIncluded: [
          'Multi-plant management',
          'Inspector tools',
          'Advanced analytics',
          'API access',
          'White-label options'
        ]
      },
      cta: 'Start Free Trial',
      popular: true,
      savings: 'Save KES 6,000/year'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      monthlyPrice: 'Custom',
      annualPrice: 'Custom',
      description: 'For inspectors & multi-plant operations',
      icon: '🏢',
      features: {
        included: [
          'Everything in Pro',
          'Multi-plant management (unlimited)',
          'Inspector tools & templates',
          'Advanced analytics & reporting',
          'API integrations & webhooks',
          'Unlimited AI assistant (water-focused)',
          'Dedicated account manager',
          'Priority phone & chat support',
          'Custom training sessions',
          'White-label options',
          'SLA guarantee (99.9% uptime)',
          'Custom compliance templates',
          'Bulk SMS credits included'
        ],
        notIncluded: []
      },
      cta: 'Contact Sales',
      popular: false
    }
  ];

  const comparisonFeatures = [
    { category: 'Core Features', features: [
      { name: 'Complaint Submission', free: true, pro: true, enterprise: true },
      { name: 'Knowledge Hub Access', free: true, pro: true, enterprise: true },
      { name: 'Business Dashboard', free: false, pro: true, enterprise: true },
      { name: 'Plant Setup Wizard', free: false, pro: true, enterprise: true },
      { name: 'Lab Test Booking', free: false, pro: true, enterprise: true },
    ]},
    { category: 'Compliance & Reporting', features: [
      { name: 'Permit Reminders', free: false, pro: 'SMS + Email', enterprise: 'SMS + Email + WhatsApp' },
      { name: 'Compliance Reports', free: false, pro: 'Basic', enterprise: 'Advanced + Custom' },
      { name: 'Document Storage', free: '0GB', pro: '5GB', enterprise: 'Unlimited' },
      { name: 'Certificate Generation', free: false, pro: true, enterprise: true },
    ]},
    { category: 'AI & Automation', features: [
      { name: 'AI Assistant', free: '6 questions/day', pro: 'Unlimited', enterprise: 'Unlimited + Priority' },
      { name: 'Auto Reports', free: false, pro: true, enterprise: true },
      { name: 'API Access', free: false, pro: false, enterprise: true },
    ]},
    { category: 'Support', features: [
      { name: 'Email Support', free: 'Community', pro: 'Priority', enterprise: 'Dedicated' },
      { name: 'Phone Support', free: false, pro: false, enterprise: true },
      { name: 'Response Time', free: '48hrs', pro: '24hrs', enterprise: '4hrs' },
    ]}
  ];

  const handleSelectPlan = (planId) => {
    setSelectedPlan(planId);
    
    if (planId === 'free') {
      navigate('/signup?plan=free');
    } else if (planId === 'enterprise') {
      navigate('/contact?plan=enterprise');
    } else if (planId === 'pro') {
      // Check if user is logged in
      const token = localStorage.getItem('token');
      if (!token) {
        // Redirect to signup for trial
        toast.success('Starting your Pro trial! Redirecting to signup...');
        setTimeout(() => {
          navigate('/signup?plan=pro&trial=true');
        }, 1500);
      } else {
        // Show payment modal for existing users
        const plan = pricingPlans.find(p => p.id === planId);
        const amount = billingCycle === 'monthly' ? plan.monthlyPrice : plan.annualPrice;
        
        setPaymentData({
          amount: amount,
          paymentType: 'subscription',
          description: `${plan.name} Plan Subscription - ${billingCycle} billing`,
          relatedEntityId: null
        });
        setPaymentModalOpen(true);
      }
    }
  };

  const handlePaymentSuccess = (paymentResult) => {
    toast.success('Payment successful! Your subscription has been activated.');
    setPaymentModalOpen(false);
    setPaymentData(null);
    // Refresh user data or redirect to dashboard
    window.location.href = '/dashboard';
  };

  const getPrice = (plan) => {
    if (plan.monthlyPrice === 'Custom') return 'Custom';
    
    if (billingCycle === 'monthly') {
      return `KES ${plan.monthlyPrice.toLocaleString()}`;
    } else {
      const monthlyEquivalent = Math.round(plan.annualPrice / 12);
      return `KES ${monthlyEquivalent.toLocaleString()}`;
    }
  };

  const getPeriod = () => {
    return billingCycle === 'monthly' ? 'per month' : 'per month, billed annually';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center">
              <AquaBeaconLogo size="md" />
            </Link>
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-gray-600 hover:text-gray-900">
                Back to Home
              </Link>
              <Link
                to="/signin"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="bg-gradient-to-br from-primary-50 to-primary-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Start free, upgrade when you grow. No hidden fees, cancel anytime.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center bg-white rounded-lg p-1 shadow-md">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                billingCycle === 'monthly'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                billingCycle === 'annual'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Annual
              <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                Save 16%
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 -mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan) => (
              <div
                key={plan.id}
                className={`rounded-2xl p-8 ${
                  plan.popular
                    ? 'bg-gradient-to-br from-primary-600 to-primary-700 shadow-2xl scale-105 relative'
                    : 'bg-white shadow-lg hover:shadow-xl transition-shadow'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-yellow-400 text-gray-900 text-xs font-bold px-4 py-2 rounded-full shadow-lg">
                      ⭐ MOST POPULAR
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <div className="text-5xl mb-4">{plan.icon}</div>
                  <h3 className="text-2xl font-bold mb-2 text-gray-900">
                    {plan.name}
                  </h3>
                  <div className="mb-2">
                    <span className="text-4xl font-extrabold text-gray-900">
                      {getPrice(plan)}
                    </span>
                    {plan.monthlyPrice !== 'Custom' && (
                      <span className="text-sm ml-2 text-gray-600">
                        {getPeriod()}
                      </span>
                    )}
                  </div>
                  {billingCycle === 'annual' && plan.savings && (
                    <p className={`text-sm font-medium ${plan.popular ? 'text-green-200' : 'text-green-600'}`}>
                      {plan.savings}
                    </p>
                  )}
                  <p className="mt-2 text-gray-600">
                    {plan.description}
                  </p>
                </div>

                {/* Features */}
                <div className="space-y-4 mb-8">
                  <div>
                    <p className="text-sm font-semibold mb-3 text-gray-900">
                      ✓ Included:
                    </p>
                    <ul className="space-y-2">
                      {plan.features.included.map((feature, index) => (
                        <li key={index} className="flex items-start text-sm">
                          <FiCheckCircle className={`mt-0.5 mr-2 flex-shrink-0 ${plan.popular ? 'text-green-300' : 'text-green-500'}`} />
                          <span className="text-gray-700">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {plan.features.notIncluded.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold mb-3 text-gray-600">
                        ✗ Not included:
                      </p>
                      <ul className="space-y-2">
                        {plan.features.notIncluded.slice(0, 3).map((feature, index) => (
                          <li key={index} className="flex items-start text-sm opacity-60">
                            <FiX className="mt-0.5 mr-2 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* CTA Button */}
                <button
                  onClick={() => handleSelectPlan(plan.id)}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-all ${
                    plan.popular
                      ? 'bg-white text-primary-600 hover:bg-gray-100 shadow-lg'
                      : 'bg-primary-600 text-white hover:bg-primary-700'
                  }`}
                >
                  {plan.cta}
                </button>

                {plan.id === 'pro' && (
                  <p className="text-center text-xs mt-3 text-gray-500">
                    14-day free trial • No credit card required
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Compare All Features
            </h2>
            <p className="text-gray-600">
              See what's included in each plan
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">Feature</th>
                  <th className="text-center py-4 px-4 font-semibold text-gray-900">Free</th>
                  <th className="text-center py-4 px-4 font-semibold text-gray-900 bg-primary-50">Pro</th>
                  <th className="text-center py-4 px-4 font-semibold text-gray-900">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((category, catIndex) => (
                  <React.Fragment key={catIndex}>
                    <tr className="bg-gray-50">
                      <td colSpan="4" className="py-3 px-4 font-semibold text-gray-900">
                        {category.category}
                      </td>
                    </tr>
                    {category.features.map((feature, featIndex) => (
                      <tr key={featIndex} className="border-b border-gray-100">
                        <td className="py-3 px-4 text-gray-700">{feature.name}</td>
                        <td className="py-3 px-4 text-center">
                          {typeof feature.free === 'boolean' ? (
                            feature.free ? (
                              <FiCheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                            ) : (
                              <FiX className="w-5 h-5 text-gray-300 mx-auto" />
                            )
                          ) : (
                            <span className="text-sm text-gray-600">{feature.free}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center bg-primary-50">
                          {typeof feature.pro === 'boolean' ? (
                            feature.pro ? (
                              <FiCheckCircle className="w-5 h-5 text-primary-600 mx-auto" />
                            ) : (
                              <FiX className="w-5 h-5 text-gray-300 mx-auto" />
                            )
                          ) : (
                            <span className="text-sm font-medium text-primary-700">{feature.pro}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {typeof feature.enterprise === 'boolean' ? (
                            feature.enterprise ? (
                              <FiCheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                            ) : (
                              <FiX className="w-5 h-5 text-gray-300 mx-auto" />
                            )
                          ) : (
                            <span className="text-sm text-gray-700">{feature.enterprise}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Trust & Security */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Trusted & Secure
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiShield className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Secure Payments</h3>
              <p className="text-sm text-gray-600">Bank-level encryption for all transactions</p>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiCreditCard className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Flexible Payments</h3>
              <p className="text-sm text-gray-600">M-Pesa, Card, or Bank Transfer</p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiZap className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Instant Activation</h3>
              <p className="text-sm text-gray-600">Start using features immediately</p>
            </div>

            <div className="text-center">
              <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiUsers className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">500+ Businesses</h3>
              <p className="text-sm text-gray-600">Join successful entrepreneurs</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Pricing FAQs
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "Can I try before I buy?",
                a: "Yes! Pro plan includes a 14-day free trial. No credit card required. Cancel anytime during the trial with no charges."
              },
              {
                q: "What payment methods do you accept?",
                a: "We accept M-Pesa, Visa/Mastercard, and bank transfers. All payments are processed securely."
              },
              {
                q: "Can I upgrade or downgrade my plan?",
                a: "Absolutely! You can change your plan at any time. Upgrades take effect immediately, and downgrades apply at the next billing cycle."
              },
              {
                q: "What happens if I cancel?",
                a: "You can cancel anytime. You'll retain access until the end of your billing period. All your data is backed up and available for 30 days after cancellation."
              },
              {
                q: "Do you offer refunds?",
                a: "Yes, we offer a 30-day money-back guarantee if you're not satisfied. No questions asked."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-start">
                  <FiHelpCircle className="w-6 h-6 text-primary-600 mr-3 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                    <p className="text-gray-600">{faq.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join 500+ water entrepreneurs growing their businesses with AquaBeacon
          </p>
          <div className="flex justify-center space-x-4 flex-wrap gap-3">
            <Link
              to="/signup?plan=pro&trial=true"
              className="bg-white text-primary-600 px-8 py-3 rounded-lg hover:bg-gray-100 font-semibold text-lg inline-flex items-center transition-all shadow-lg"
            >
              Start Free Trial
              <FiArrowRight className="ml-2" />
            </Link>
            
            <a
              href="https://wa.me/254707806523?text=Hi,%20I%20have%20questions%20about%20pricing"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 text-white px-8 py-3 rounded-lg hover:bg-green-600 font-semibold text-lg inline-flex items-center transition-all shadow-lg"
            >
              <FaWhatsapp className="mr-2" />
              Chat with Sales
            </a>
          </div>
        </div>
      </section>

      {/* Footer - Simple */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm">&copy; 2025 AquaBeacon. All rights reserved.</p>
          <div className="mt-4 space-x-4">
            <Link to="/" className="hover:text-white">Home</Link>
            <Link to="/terms" className="hover:text-white">Terms</Link>
            <Link to="/privacy" className="hover:text-white">Privacy</Link>
            <Link to="/contact" className="hover:text-white">Contact</Link>
          </div>
        </div>
      </footer>

      {/* Payment Modal */}
      {paymentData && (
        <PaymentModal
          isOpen={paymentModalOpen}
          onClose={() => {
            setPaymentModalOpen(false);
            setPaymentData(null);
          }}
          amount={paymentData.amount}
          paymentType={paymentData.paymentType}
          description={paymentData.description}
          relatedEntityId={paymentData.relatedEntityId}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};

export default Pricing;