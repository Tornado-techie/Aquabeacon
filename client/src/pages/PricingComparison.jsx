import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiDroplet, FiCheckCircle, FiX, FiArrowRight, FiArrowLeft } from 'react-icons/fi';
import AquaBeaconLogo from '../components/AquaBeaconLogo';

const PricingComparison = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const features = [
    {
      category: "Basic Features",
      items: [
        { name: "Submit complaints without login", free: true, pro: true, enterprise: true },
        { name: "Access knowledge hub & guides", free: true, pro: true, enterprise: true },
        { name: "View water quality standards", free: true, pro: true, enterprise: true },
        { name: "Basic FAQs support", free: true, pro: true, enterprise: true },
        { name: "Community forum access", free: true, pro: true, enterprise: true },
      ]
    },
    {
      category: "Business Management",
      items: [
        { name: "Full business dashboard", free: false, pro: true, enterprise: true },
        { name: "Plant setup wizard", free: false, pro: true, enterprise: true },
        { name: "Business profile management", free: false, pro: true, enterprise: true },
        { name: "Document storage", free: false, pro: true, enterprise: true },
        { name: "Multi-plant management", free: false, pro: false, enterprise: true },
        { name: "Team collaboration tools", free: false, pro: false, enterprise: true },
      ]
    },
    {
      category: "Lab Testing & Quality",
      items: [
        { name: "Lab test booking & tracking", free: false, pro: true, enterprise: true },
        { name: "Water quality test results", free: false, pro: true, enterprise: true },
        { name: "Quality trend analysis", free: false, pro: true, enterprise: true },
        { name: "Advanced analytics", free: false, pro: false, enterprise: true },
        { name: "Custom quality parameters", free: false, pro: false, enterprise: true },
        { name: "Batch testing management", free: false, pro: false, enterprise: true },
      ]
    },
    {
      category: "Compliance & Permits",
      items: [
        { name: "Permit expiry reminders", free: false, pro: true, enterprise: true },
        { name: "Compliance reports", free: false, pro: true, enterprise: true },
        { name: "KEBS checklist templates", free: false, pro: true, enterprise: true },
        { name: "Automated compliance tracking", free: false, pro: false, enterprise: true },
        { name: "Inspector tools & templates", free: false, pro: false, enterprise: true },
        { name: "Audit trail & history", free: false, pro: false, enterprise: true },
      ]
    },
    {
      category: "Communication & Support",
      items: [
        { name: "Email notifications", free: false, pro: true, enterprise: true },
        { name: "SMS notifications", free: false, pro: true, enterprise: true },
        { name: "AI assistant support", free: false, pro: true, enterprise: true },
        { name: "Priority support", free: false, pro: false, enterprise: true },
        { name: "Custom training", free: false, pro: false, enterprise: true },
        { name: "Dedicated account manager", free: false, pro: false, enterprise: true },
      ]
    },
    {
      category: "Integrations & API",
      items: [
        { name: "Basic integrations", free: false, pro: true, enterprise: true },
        { name: "API access", free: false, pro: false, enterprise: true },
        { name: "Custom integrations", free: false, pro: false, enterprise: true },
        { name: "White-label options", free: false, pro: false, enterprise: true },
        { name: "Third-party lab connections", free: false, pro: false, enterprise: true },
      ]
    },
    {
      category: "Data & Analytics",
      items: [
        { name: "Basic reporting", free: false, pro: true, enterprise: true },
        { name: "Advanced analytics dashboard", free: false, pro: false, enterprise: true },
        { name: "Custom reports", free: false, pro: false, enterprise: true },
        { name: "Data export capabilities", free: false, pro: true, enterprise: true },
        { name: "Business intelligence tools", free: false, pro: false, enterprise: true },
      ]
    }
  ];

  const plans = [
    {
      name: "Free",
      price: "0",
      period: "Forever",
      description: "Perfect for consumers and exploring the platform",
      highlight: false,
      cta: "Get Started Free",
      ctaLink: "/signup",
      popular: false
    },
    {
      name: "Pro",
      price: "5",
      period: "per month",
      description: "For water entrepreneurs & small plants",
      highlight: true,
      cta: "Start Free Trial",
      ctaLink: "/signup",
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "contact us",
      description: "For inspectors & multi-plant operations",
      highlight: false,
      cta: "Contact Sales",
      ctaLink: "/contact",
      popular: false
    }
  ];

  const FeatureIcon = ({ available }) => {
    if (available) {
      return <FiCheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />;
    }
    return <FiX className="w-5 h-5 text-gray-300 flex-shrink-0" />;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <AquaBeaconLogo size="md" />
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="inline-flex items-center text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                <FiArrowLeft className="mr-2" />
                Back to Home
              </Link>
              <Link
                to="/signin"
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 font-medium transition-colors shadow-sm hover:shadow-md"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="bg-gradient-to-br from-primary-50 to-primary-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Compare All Features
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Choose the perfect plan for your water business needs. All plans include a 14-day free trial.
          </p>
          <div className="flex justify-center space-x-4 flex-wrap gap-3">
            <Link
              to="/signup"
              className="bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 font-semibold text-lg inline-flex items-center transition-all hover:scale-105 shadow-lg"
            >
              Start Free Trial
              <FiArrowRight className="ml-2" />
            </Link>
            <Link
              to="/contact"
              className="bg-white text-primary-600 px-8 py-3 rounded-lg hover:bg-gray-50 font-semibold text-lg border-2 border-primary-600 inline-flex items-center transition-all hover:scale-105"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

      {/* Plans Overview */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`rounded-2xl p-8 relative ${
                  plan.highlight
                    ? 'bg-primary-600 text-white shadow-2xl scale-105 border-4 border-yellow-400'
                    : 'bg-white border-2 border-gray-200 shadow-lg hover:shadow-xl transition-shadow'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-yellow-400 text-primary-900 text-xs font-bold px-3 py-1 rounded-full">
                      ⭐ MOST POPULAR
                    </div>
                  </div>
                )}
                <h3 className={`text-2xl font-bold mb-2 ${plan.highlight ? 'text-white' : 'text-gray-900'}`}>
                  {plan.name}
                </h3>
                <div className="mb-4">
                  <span className={`text-4xl font-extrabold ${plan.highlight ? 'text-white' : 'text-gray-900'}`}>
                    {plan.price === "Custom" ? "Custom" : `KES ${plan.price}`}
                  </span>
                  <span className={`text-sm ml-2 ${plan.highlight ? 'text-primary-100' : 'text-gray-600'}`}>
                    {plan.period}
                  </span>
                </div>
                <p className={`mb-6 ${plan.highlight ? 'text-primary-100' : 'text-gray-600'}`}>
                  {plan.description}
                </p>
                <Link
                  to={plan.ctaLink}
                  className={`block text-center py-3 px-6 rounded-lg font-semibold transition-all ${
                    plan.highlight
                      ? 'bg-white text-primary-600 hover:bg-gray-100'
                      : 'bg-primary-600 text-white hover:bg-primary-700'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Detailed Feature Comparison */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Detailed Feature Comparison
            </h2>
            <p className="text-lg text-gray-600">
              See exactly what's included in each plan
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Desktop Table View */}
            <div className="hidden lg:block">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 w-2/5">
                        Features
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 w-1/5">
                        Free
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-white bg-primary-600 w-1/5">
                        Pro
                        <div className="text-xs font-normal text-primary-100 mt-1">Most Popular</div>
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 w-1/5">
                        Enterprise
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {features.map((category, categoryIndex) => (
                      <React.Fragment key={categoryIndex}>
                        <tr className="bg-gray-100">
                          <td className="px-6 py-4 text-sm font-semibold text-gray-900" colSpan={4}>
                            {category.category}
                          </td>
                        </tr>
                        {category.items.map((feature, featureIndex) => (
                          <tr key={featureIndex} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {feature.name}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <FeatureIcon available={feature.free} />
                            </td>
                            <td className="px-6 py-4 text-center bg-primary-50">
                              <FeatureIcon available={feature.pro} />
                            </td>
                            <td className="px-6 py-4 text-center">
                              <FeatureIcon available={feature.enterprise} />
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden">
              <div className="p-6">
                <div className="flex justify-center mb-6">
                  <div className="bg-gray-100 p-1 rounded-lg flex">
                    <button className="px-4 py-2 text-sm font-medium bg-white text-gray-900 rounded-md shadow-sm">
                      Compare Plans
                    </button>
                  </div>
                </div>

                {features.map((category, categoryIndex) => (
                  <div key={categoryIndex} className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      {category.category}
                    </h3>
                    <div className="space-y-4">
                      {category.items.map((feature, featureIndex) => (
                        <div key={featureIndex} className="border border-gray-200 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-3">
                            {feature.name}
                          </h4>
                          <div className="grid grid-cols-3 gap-4">
                            <div className="text-center">
                              <div className="text-sm font-medium text-gray-600 mb-2">Free</div>
                              <FeatureIcon available={feature.free} />
                            </div>
                            <div className="text-center">
                              <div className="text-sm font-medium text-primary-600 mb-2">Pro</div>
                              <FeatureIcon available={feature.pro} />
                            </div>
                            <div className="text-center">
                              <div className="text-sm font-medium text-gray-600 mb-2">Enterprise</div>
                              <FeatureIcon available={feature.enterprise} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                Can I switch plans anytime?
              </h3>
              <p className="text-gray-600">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately and you'll be prorated accordingly.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                What happens after the free trial?
              </h3>
              <p className="text-gray-600">
                Your 14-day free trial gives you full access to Pro features. After the trial, you can choose to upgrade to a paid plan or continue with the free plan.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                Is there a setup fee?
              </h3>
              <p className="text-gray-600">
                No setup fees for any plan. For Enterprise customers, we provide free onboarding and training to get you started quickly.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-600">
                We accept M-Pesa, bank transfers, and major credit cards. All payments are processed securely and you'll receive instant confirmation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join hundreds of successful water entrepreneurs across Kenya
          </p>
          <div className="flex justify-center space-x-4 flex-wrap gap-3">
            <Link
              to="/signup"
              className="bg-white text-primary-600 px-8 py-4 rounded-lg hover:bg-gray-100 font-semibold text-lg inline-flex items-center transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Start Free Trial
              <FiArrowRight className="ml-2" />
            </Link>
            <Link
              to="/contact"
              className="bg-primary-700 text-white px-8 py-4 rounded-lg hover:bg-primary-800 font-semibold text-lg inline-flex items-center transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl border-2 border-primary-500"
            >
              Contact Sales
            </Link>
          </div>
          <p className="text-primary-200 text-sm mt-4">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <AquaBeaconLogo size="sm" />
            </div>
            <div className="flex space-x-6 text-sm">
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
              <Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-6 pt-6 text-center text-sm">
            <p>&copy; 2025 AquaBeacon. All rights reserved. Built for SDG 6 🌊</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PricingComparison;