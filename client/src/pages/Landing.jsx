import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiDroplet, FiShield, FiTrendingUp, FiUsers, FiCheckCircle, FiArrowRight,
  FiPhone, FiMail, FiChevronDown, FiChevronUp, FiStar,
  FiBook, FiAward, FiBarChart, FiFileText, FiMessageCircle
} from 'react-icons/fi';
import { FaWhatsapp, FaTwitter, FaFacebook, FaLinkedin, FaInstagram } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import AquaBeaconLogo from '../components/AquaBeaconLogo';
import AIChatWidget from '../components/ai/AIChatWidget';

const Landing = () => {
  const [openFaq, setOpenFaq] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const features = [
    {
      icon: <FiShield className="w-6 h-6" />,
      title: 'KEBS Compliance',
      description: 'Stay compliant with KS EAS 153 & 13 standards. Get permit reminders and automated reporting.'
    },
    {
      icon: <FiDroplet className="w-6 h-6" />,
      title: 'Quality Management',
      description: 'Track water quality tests, lab results, and ensure product safety with real-time monitoring.'
    },
    {
      icon: <FiTrendingUp className="w-6 h-6" />,
      title: 'Business Growth',
      description: 'Access training modules, market insights, and tools to scale your water business profitably.'
    },
    {
      icon: <FiUsers className="w-6 h-6" />,
      title: 'Consumer Trust',
      description: 'Build customer confidence with transparent quality reports and quick complaint resolution.'
    }
  ];

  const steps = [
    { number: '1', title: 'Register Your Business', description: 'Create an account and set up your water plant profile' },
    { number: '2', title: 'Complete Setup Wizard', description: 'Enter plant details, equipment, and compliance information' },
    { number: '3', title: 'Get Certified', description: 'Upload permits, schedule lab tests, and stay compliant' },
    { number: '4', title: 'Grow & Monitor', description: 'Track operations, handle complaints, and expand your business' }
  ];

  const testimonials = [
    {
      name: "Jane Mwangi",
      role: "Founder, Pure Waters Kenya",
      image: "👩‍💼",
      text: "AquaBeacon helped us get KEBS certified in just 3 months. The permit reminders saved us from costly fines!",
      rating: 5
    },
    {
      name: "David Omondi",
      role: "Water Plant Manager",
      image: "👨‍💼",
      text: "Lab booking and compliance tracking made our lives so much easier. We're now serving 5,000 customers monthly.",
      rating: 5
    },
    {
      name: "Mary Wanjiku",
      role: "KEBS Inspector",
      image: "👩‍🔬",
      text: "The inspection tools streamline my workflow. I can now process reports 3x faster than before.",
      rating: 5
    }
  ];

  const knowledgeArticles = [
    {
      icon: <FiBook className="w-8 h-8" />,
      title: "KEBS Water Quality Standards Guide",
      description: "Complete guide to KS EAS 153:2000 and KS EAS 13:2019 requirements",
      link: "/knowledge-hub/kebs-standards"
    },
    {
      icon: <FiFileText className="w-8 h-8" />,
      title: "Startup Checklist for Water Businesses",
      description: "Step-by-step checklist from registration to first sale",
      link: "/knowledge-hub/startup-checklist"
    },
    {
      icon: <FiAward className="w-8 h-8" />,
      title: "How to Get Your KEBS Permit",
      description: "Complete permit application guide with timelines",
      link: "/knowledge-hub/permit-guide"
    },
    {
      icon: <FiBarChart className="w-8 h-8" />,
      title: "Water Testing Parameters Explained",
      description: "Understand pH, TDS, turbidity, and bacteria limits",
      link: "/knowledge-hub/water-testing-parameters"
    }
  ];

  const faqs = [
    {
      question: "Do I need an account to report a water quality issue?",
      answer: "No! Consumers can submit complaints without creating an account. Simply go to our public complaint form and fill in the details. However, creating an account allows you to track your complaint status."
    },
    {
      question: "What are the KEBS water quality standards in Kenya?",
      answer: "Kenya follows KS EAS 153:2000 for bottled water and KS EAS 13:2019 for water vending. Key parameters include pH (6.5-8.5), turbidity (<5 NTU), total dissolved solids (50-500 mg/L), and zero coliform bacteria."
    },
    {
      question: "How much does AquaBeacon cost?",
  answer: "We offer a FREE tier for basic features and complaint submission. Pro plans start at KES 5/month for entrepreneurs with full dashboard access, permit reminders, and AI assistance. Enterprise plans available for multi-plant operations."
    },
    {
      question: "How long does it take to get KEBS certified?",
      answer: "With proper documentation and passing water tests, KEBS certification typically takes 2-4 months. AquaBeacon helps you prepare all requirements and track your progress."
    },
    {
      question: "Can I manage multiple water plants on AquaBeacon?",
      answer: "Yes! Our Enterprise plan supports multi-plant management with centralized dashboards, consolidated reporting, and team collaboration features."
    },
    {
      question: "What happens after I submit a complaint?",
      answer: "Complaints are reviewed within 24-48 hours. You'll receive SMS/email updates. Serious issues are escalated to KEBS with full documentation including photos and test results."
    }
  ];

  const pricingPlans = [
    {
      name: "Free",
      price: "0",
      period: "Forever",
      description: "Perfect for consumers and exploring the platform",
      features: [
        "Submit complaints without login",
        "Access knowledge hub & guides",
        "View water quality standards",
        "Basic FAQs support",
        "Community forum access"
      ],
      cta: "Get Started Free",
      highlighted: false
    },
    {
      name: "Pro",
  price: "5",
      period: "per month",
      description: "For water entrepreneurs & small plants",
      features: [
        "Everything in Free, plus:",
        "Full business dashboard",
        "Plant setup wizard",
        "Lab test booking & tracking",
        "Permit expiry reminders",
        "AI assistant support",
        "Compliance reports",
        "Email & SMS notifications"
      ],
      cta: "Start Free Trial",
      highlighted: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "contact us",
      description: "For inspectors & multi-plant operations",
      features: [
        "Everything in Pro, plus:",
        "Multi-plant management",
        "Inspector tools & templates",
        "Advanced analytics",
        "API integrations",
        "Priority support",
        "Custom training",
        "White-label options"
      ],
      cta: "Contact Sales",
      highlighted: false
    }
  ];

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <>
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/">
                <AquaBeaconLogo 
                  width={170} 
                  height={52} 
                  showText={true}
                  className="hover:opacity-90 transition-opacity"
                />
              </Link>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                Features
              </a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                Pricing
              </a>
              <a href="#knowledge" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                Knowledge Hub
              </a>
            </div>
            <div className="flex items-center space-x-4">
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

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-primary-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-extrabold text-gray-900 mb-6">
              Launch Your Water Business
              <span className="block text-primary-600 mt-2">with Confidence</span>
            </h1>
            <p className="text-xl text-gray-600 mb-6 max-w-3xl mx-auto">
              AquaBeacon helps Kenyan entrepreneurs start and manage compliant water purification
              and bottling businesses. From setup to certification to growth.
            </p>
            
            {/* SDG CTA */}
            <div className="mb-8 max-w-4xl mx-auto">
              <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-center mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="relative w-12 h-12">
                      <div className="absolute inset-0 border-2 border-gray-300 rounded-full animate-spin"></div>
                      <div className="absolute inset-1 border-2 border-blue-500 rounded-full animate-pulse"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-gray-700 font-bold text-sm">6</span>
                      </div>
                    </div>
                    <div className="relative w-12 h-12">
                      <div className="absolute inset-0 border-2 border-gray-300 rounded-full animate-spin" style={{animationDelay: '0.5s'}}></div>
                      <div className="absolute inset-1 border-2 border-green-500 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-gray-700 font-bold text-sm">8</span>
                      </div>
                    </div>
                    <div className="relative w-12 h-12">
                      <div className="absolute inset-0 border-2 border-gray-300 rounded-full animate-spin" style={{animationDelay: '1s'}}></div>
                      <div className="absolute inset-1 border-2 border-orange-500 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-gray-700 font-bold text-sm">9</span>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-xl font-bold text-gray-800 mb-3">
                  🌍 Join us in building a sustainable future for Kenya's water sector
                </p>
                <p className="text-gray-600 text-base mb-3">
                  <strong>SDG 6:</strong> Clean Water & Sanitation • <strong>SDG 8:</strong> Decent Work & Economic Growth • <strong>SDG 9:</strong> Industry Innovation
                </p>
                <p className="text-primary-600 font-semibold text-base">
                  Together, we're creating jobs, ensuring water security, and driving innovation across communities.
                </p>
              </div>
            </div>
            
            <div className="flex justify-center space-x-4 flex-wrap gap-3">
              <Link
                to="/signup"
                className="bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 font-semibold text-lg inline-flex items-center transition-all hover:scale-105 shadow-lg"
              >
                Start Free Trial
                <FiArrowRight className="ml-2" />
              </Link>
              <Link
                to="/complaints/submit"
                className="bg-white text-primary-600 px-8 py-3 rounded-lg hover:bg-gray-50 font-semibold text-lg border-2 border-primary-600 inline-flex items-center transition-all hover:scale-105"
              >
                <FiMessageCircle className="mr-2" />
                Report Water Issue
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="mt-12 flex justify-center items-center space-x-8 text-sm text-gray-600">
              <div className="flex items-center">
                <FiCheckCircle className="text-green-500 mr-2" />
                500+ Plants Registered
              </div>
              <div className="flex items-center">
                <FiCheckCircle className="text-green-500 mr-2" />
                98% Compliance Rate
              </div>
              <div className="flex items-center">
                <FiCheckCircle className="text-green-500 mr-2" />
                KEBS Approved
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Role-Based Value Propositions */}
      <section className="py-16 bg-gradient-to-r from-gray-50 via-blue-50 to-gray-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Built for Every Water Stakeholder
            </h2>
            <p className="text-lg text-gray-600">
              Whether you're starting a business, inspecting plants, or reporting issues
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Entrepreneurs */}
            <div className="group relative bg-white p-8 rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 border-l-4 border-blue-500 hover:border-blue-600 hover:-translate-y-2 hover:ring-4 hover:ring-blue-100">
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full opacity-10 group-hover:opacity-20 transition-opacity"></div>
              <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">🚰</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">For Entrepreneurs</h3>
              <ul className="space-y-3 text-gray-600 mb-6">
                <li className="flex items-start group-hover:translate-x-1 transition-transform duration-200">
                  <FiCheckCircle className="text-green-500 mr-3 mt-1 flex-shrink-0 group-hover:text-green-600" />
                  <span>Step-by-step startup guides</span>
                </li>
                <li className="flex items-start group-hover:translate-x-1 transition-transform duration-200 delay-75">
                  <FiCheckCircle className="text-green-500 mr-3 mt-1 flex-shrink-0 group-hover:text-green-600" />
                  <span>KEBS permit application help</span>
                </li>
                <li className="flex items-start group-hover:translate-x-1 transition-transform duration-200 delay-150">
                  <FiCheckCircle className="text-green-500 mr-3 mt-1 flex-shrink-0 group-hover:text-green-600" />
                  <span>Lab test scheduling & tracking</span>
                </li>
                <li className="flex items-start group-hover:translate-x-1 transition-transform duration-200 delay-200">
                  <FiCheckCircle className="text-green-500 mr-3 mt-1 flex-shrink-0 group-hover:text-green-600" />
                  <span>Compliance dashboard</span>
                </li>
              </ul>
              <Link
                to="/signup?role=owner"
                className="block text-center bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl ring-2 ring-transparent hover:ring-blue-200"
              >
                Start Your Business
              </Link>
            </div>

            {/* Inspectors */}
            <div className="group relative bg-white p-8 rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 border-l-4 border-green-500 hover:border-green-600 hover:-translate-y-2 hover:ring-4 hover:ring-green-100">
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full opacity-10 group-hover:opacity-20 transition-opacity"></div>
              <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">🔍</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-green-600 transition-colors">For Inspectors</h3>
              <ul className="space-y-3 text-gray-600 mb-6">
                <li className="flex items-start group-hover:translate-x-1 transition-transform duration-200">
                  <FiCheckCircle className="text-green-500 mr-3 mt-1 flex-shrink-0 group-hover:text-green-600" />
                  <span>Digital inspection templates</span>
                </li>
                <li className="flex items-start group-hover:translate-x-1 transition-transform duration-200 delay-75">
                  <FiCheckCircle className="text-green-500 mr-3 mt-1 flex-shrink-0 group-hover:text-green-600" />
                  <span>Real-time reporting tools</span>
                </li>
                <li className="flex items-start group-hover:translate-x-1 transition-transform duration-200 delay-150">
                  <FiCheckCircle className="text-green-500 mr-3 mt-1 flex-shrink-0 group-hover:text-green-600" />
                  <span>Plant compliance tracking</span>
                </li>
                <li className="flex items-start group-hover:translate-x-1 transition-transform duration-200 delay-200">
                  <FiCheckCircle className="text-green-500 mr-3 mt-1 flex-shrink-0 group-hover:text-green-600" />
                  <span>Automated report generation</span>
                </li>
              </ul>
              <Link
                to="/signup?role=inspector"
                className="block text-center bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-3 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl ring-2 ring-transparent hover:ring-green-200"
              >
                Inspector Tools
              </Link>
            </div>

            {/* Consumers */}
            <div className="group relative bg-white p-8 rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 border-l-4 border-purple-500 hover:border-purple-600 hover:-translate-y-2 hover:ring-4 hover:ring-purple-100">
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full opacity-10 group-hover:opacity-20 transition-opacity"></div>
              <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">👥</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors">For Consumers</h3>
              <ul className="space-y-3 text-gray-600 mb-6">
                <li className="flex items-start group-hover:translate-x-1 transition-transform duration-200">
                  <FiCheckCircle className="text-green-500 mr-3 mt-1 flex-shrink-0 group-hover:text-green-600" />
                  <span>Report water quality issues</span>
                </li>
                <li className="flex items-start group-hover:translate-x-1 transition-transform duration-200 delay-75">
                  <FiCheckCircle className="text-green-500 mr-3 mt-1 flex-shrink-0 group-hover:text-green-600" />
                  <span>Track complaint status</span>
                </li>
                <li className="flex items-start group-hover:translate-x-1 transition-transform duration-200 delay-150">
                  <FiCheckCircle className="text-green-500 mr-3 mt-1 flex-shrink-0 group-hover:text-green-600" />
                  <span>Learn about water safety</span>
                </li>
                <li className="flex items-start group-hover:translate-x-1 transition-transform duration-200 delay-200">
                  <FiCheckCircle className="text-green-500 mr-3 mt-1 flex-shrink-0 group-hover:text-green-600" />
                  <span>No account required!</span>
                </li>
              </ul>
              <Link
                to="/complaints"
                className="block text-center bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-3 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl ring-2 ring-transparent hover:ring-purple-200 mb-3"
              >
                Report Issue Now
              </Link>
              <div className="flex space-x-2">
                <Link
                  to="/track-complaint"
                  className="flex-1 text-center bg-purple-100 text-purple-700 px-3 py-2 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium"
                >
                  Track Complaint
                </Link>
                <Link
                  to="/knowledge-hub?section=water-safety"
                  className="flex-1 text-center bg-purple-100 text-purple-700 px-3 py-2 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium"
                >
                  Learn Safety
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gradient-to-br from-white via-primary-50 to-white relative">
        <div className="absolute inset-0 bg-dots-pattern opacity-20"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Comprehensive tools for water business management, compliance, and growth
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group relative bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer border border-gray-100 hover:border-primary-200 hover:ring-4 hover:ring-primary-100">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary-600 to-primary-400 rounded-xl blur opacity-0 group-hover:opacity-25 transition duration-300"></div>
                <div className="relative">
                  <div className="bg-gradient-to-br from-primary-100 to-primary-200 text-primary-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 group-hover:rotate-3">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 group-hover:text-gray-700 transition-colors">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Knowledge Hub Section - FREE CONTENT */}
      <section id="knowledge" className="py-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern opacity-10"></div>
        <div className="absolute -top-16 -right-16 w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-gradient-to-br from-indigo-400 to-blue-500 rounded-full blur-3xl opacity-20"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-12">
            <div className="inline-block bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 px-6 py-3 rounded-full text-sm font-semibold mb-4 ring-2 ring-green-200 shadow-lg">
              📚 FREE - No Login Required
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Knowledge Hub
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Free resources to help you understand water quality standards, compliance, and business setup
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {knowledgeArticles.map((article, index) => (
              <Link
                key={index}
                to={article.link}
                className="group relative bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-3 border border-gray-100 hover:border-blue-200 hover:ring-4 hover:ring-blue-100"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-0 group-hover:opacity-25 transition duration-300"></div>
                <div className="relative">
                  <div className="text-primary-600 mb-4 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                    {article.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {article.description}
                  </p>
                  <div className="flex items-center text-primary-600 font-medium text-sm">
                    Read More <FiArrowRight className="ml-2 group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              to="/knowledge-hub"
              className="inline-flex items-center text-primary-600 hover:text-primary-700 font-semibold bg-white px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ring-2 ring-primary-100 hover:ring-primary-200"
            >
              View All Resources
              <FiArrowRight className="ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-20 bg-gradient-to-r from-white via-green-50 to-white relative">
        <div className="absolute inset-0 bg-wave-pattern opacity-5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Success Stories
            </h2>
            <p className="text-lg text-gray-600">
              Hear from entrepreneurs who launched successful water businesses with AquaBeacon
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="group relative bg-gradient-to-br from-white to-gray-50 p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-green-200 hover:-translate-y-2 hover:ring-4 hover:ring-green-100">
                <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-blue-600 rounded-xl blur opacity-0 group-hover:opacity-20 transition duration-300"></div>
                <div className="relative">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <FiStar key={i} className="w-5 h-5 text-yellow-400 fill-current group-hover:scale-110 transition-transform duration-200" style={{transitionDelay: `${i * 50}ms`}} />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 italic group-hover:text-gray-800 transition-colors">"{testimonial.text}"</p>
                  <div className="flex items-center">
                    <div className="text-4xl mr-3 group-hover:scale-110 transition-transform duration-300">{testimonial.image}</div>
                    <div>
                      <p className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors">{testimonial.name}</p>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600">
              Get started in four simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center group">
                <div className="relative mb-6">
                  <div className="bg-primary-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto group-hover:scale-110 transition-transform shadow-lg">
                    {step.number}
                  </div>
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-primary-200 transform -translate-y-1/2"></div>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Start free, upgrade when you need more. No hidden fees.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <div
                key={index}
                className={`rounded-2xl p-8 ${
                  plan.highlighted
                    ? 'bg-primary-600 text-white shadow-2xl scale-105 border-4 border-yellow-400'
                    : 'bg-white border-2 border-gray-200 shadow-lg hover:shadow-xl transition-shadow'
                }`}
              >
                {plan.highlighted && (
                  <div className="bg-yellow-400 text-primary-900 text-xs font-bold px-3 py-1 rounded-full inline-block mb-4">
                    ⭐ MOST POPULAR
                  </div>
                )}
                <h3 className={`text-2xl font-bold mb-2 ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                  {plan.name}
                </h3>
                <div className="mb-4">
                  <span className={`text-4xl font-extrabold ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                    {plan.price === "Custom" ? "Custom" : `KES ${plan.price}`}
                  </span>
                  <span className={`text-sm ml-2 ${plan.highlighted ? 'text-primary-100' : 'text-gray-600'}`}>
                    {plan.period}
                  </span>
                </div>
                <p className={`mb-6 ${plan.highlighted ? 'text-primary-100' : 'text-gray-600'}`}>
                  {plan.description}
                </p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-start">
                      <FiCheckCircle className={`mt-1 mr-3 flex-shrink-0 ${plan.highlighted ? 'text-primary-200' : 'text-green-500'}`} />
                      <span className={`text-sm ${plan.highlighted ? 'text-primary-100' : 'text-gray-700'}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                <Link
                  to={plan.name === "Enterprise" ? "/contact" : (isAuthenticated ? "/payment" : "/signup")}
                  className={`block text-center py-3 px-6 rounded-lg font-semibold transition-all ${
                    plan.highlighted
                      ? 'bg-white text-primary-600 hover:bg-gray-100'
                      : 'bg-primary-600 text-white hover:bg-primary-700'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">
              All plans include 14-day free trial • No credit card required • Cancel anytime
            </p>
            <Link to="/pricing-comparison" className="text-primary-600 hover:text-primary-700 font-medium hover:underline transition-all">
              Compare all features →
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 via-indigo-50 to-gray-50 relative">
        <div className="absolute inset-0 bg-question-pattern opacity-5"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600">
              Everything you need to know about AquaBeacon
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="group bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 border border-gray-100 hover:border-indigo-200 hover:ring-4 hover:ring-indigo-100"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gradient-to-r hover:from-gray-50 hover:to-indigo-50 transition-all duration-300"
                >
                  <span className="font-semibold text-gray-900 pr-8 group-hover:text-indigo-600 transition-colors">{faq.question}</span>
                  {openFaq === index ? (
                    <FiChevronUp className="w-5 h-5 text-primary-600 flex-shrink-0 transform group-hover:scale-110 transition-transform" />
                  ) : (
                    <FiChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0 group-hover:text-indigo-500 transform group-hover:scale-110 transition-all" />
                  )}
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-4 text-gray-600 animate-fadeIn bg-gradient-to-r from-gray-50 to-indigo-50">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-12 text-center bg-white border-2 border-blue-200 rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
            <p className="text-gray-800 mb-6 font-medium text-lg">
              Still have questions? We're here to help!
            </p>
            <div className="flex justify-center space-x-4 flex-wrap gap-3">
              <Link
                to="https://wa.me/254707806523"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-medium"
              >
                <FaWhatsapp className="mr-2" />
                Chat on WhatsApp
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-medium"
              >
                <FiMail className="mr-2" />
                Email Support
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-blue-50 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-r from-blue-200 to-purple-200 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-24 h-24 bg-gradient-to-r from-yellow-200 to-orange-200 rounded-full opacity-20 animate-bounce"></div>
          <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-gradient-to-r from-green-200 to-blue-200 rounded-full opacity-15 animate-ping"></div>
          <div className="absolute bottom-1/3 left-1/4 w-20 h-20 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full opacity-10 animate-pulse"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Title */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-gray-800 via-blue-600 to-purple-600 bg-clip-text text-transparent">
              Why Choose AquaBeacon?
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
            <p className="text-xl text-gray-600 mt-6 max-w-3xl mx-auto leading-relaxed">
              Join thousands of water entrepreneurs who trust AquaBeacon to streamline their operations and achieve compliance excellence
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="group relative bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-2xl hover:shadow-yellow-500/20 transition-all duration-500 cursor-pointer hover:-translate-y-2 hover:border-yellow-300/50 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 to-orange-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="text-6xl font-bold mb-4 text-gray-800 group-hover:text-yellow-600 transition-all duration-300 group-hover:scale-110">500+</div>
                <div className="text-gray-600 group-hover:text-gray-800 transition-colors font-semibold text-lg">Water Businesses Launched</div>
                <div className="mt-4 h-1 w-0 group-hover:w-full bg-gradient-to-r from-yellow-400 to-orange-400 transition-all duration-500 rounded-full mx-auto"></div>
              </div>
            </div>
            <div className="group relative bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-2xl hover:shadow-green-500/20 transition-all duration-500 cursor-pointer hover:-translate-y-2 hover:border-green-300/50 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="text-6xl font-bold mb-4 text-gray-800 group-hover:text-green-600 transition-all duration-300 group-hover:scale-110">98%</div>
                <div className="text-gray-600 group-hover:text-gray-800 transition-colors font-semibold text-lg">Compliance Rate</div>
                <div className="mt-4 h-1 w-0 group-hover:w-full bg-gradient-to-r from-green-400 to-emerald-400 transition-all duration-500 rounded-full mx-auto"></div>
              </div>
            </div>
            <div className="group relative bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 cursor-pointer hover:-translate-y-2 hover:border-purple-300/50 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="text-6xl font-bold mb-4 text-gray-800 group-hover:text-purple-600 transition-all duration-300 group-hover:scale-110">24/7</div>
                <div className="text-gray-600 group-hover:text-gray-800 transition-colors font-semibold text-lg">AI Support Available</div>
                <div className="mt-4 h-1 w-0 group-hover:w-full bg-gradient-to-r from-purple-400 to-indigo-400 transition-all duration-500 rounded-full mx-auto"></div>
              </div>
            </div>
            <div className="group relative bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-2xl hover:shadow-orange-500/20 transition-all duration-500 cursor-pointer hover:-translate-y-2 hover:border-orange-300/50 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-red-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="text-6xl font-bold mb-4 text-gray-800 group-hover:text-orange-600 transition-all duration-300 group-hover:scale-110">1,200+</div>
                <div className="text-gray-600 group-hover:text-gray-800 transition-colors font-semibold text-lg">Issues Resolved</div>
                <div className="mt-4 h-1 w-0 group-hover:w-full bg-gradient-to-r from-orange-400 to-red-400 transition-all duration-500 rounded-full mx-auto"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Start Your Water Business?
          </h2>
          <p className="text-lg text-gray-700 mb-8">
            Join hundreds of successful water entrepreneurs across Kenya. Start free today!
          </p>
          <div className="flex justify-center space-x-4 flex-wrap gap-3">
            <Link
              to="/signup"
              className="bg-primary-600 text-white px-8 py-4 rounded-lg hover:bg-primary-700 font-semibold text-lg inline-flex items-center transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Create Free Account
              <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="https://wa.me/254707806523?text=Hi,%20I%20want%20to%20learn%20more%20about%20AquaBeacon"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 text-white px-8 py-4 rounded-lg hover:bg-green-600 font-semibold text-lg inline-flex items-center transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <FaWhatsapp className="mr-2" />
              Chat with Us
            </Link>
          </div>
        </div>
      </section>

      {/* Footer - FIXED & WORKING */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div>
              <div className="mb-4">
                <AquaBeaconLogo size="sm" />
              </div>
              <p className="text-sm mb-4">
                Empowering water entrepreneurs across Kenya with tools for compliance and growth.
              </p>
              <div className="flex space-x-4">
                <a href="https://twitter.com/aquabeacon" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  <FaTwitter size={20} />
                </a>
                <a href="https://facebook.com/aquabeacon" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  <FaFacebook size={20} />
                </a>
                <a href="https://linkedin.com/company/aquabeacon" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  <FaLinkedin size={20} />
                </a>
                <a href="https://instagram.com/aquabeacon" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  <FaInstagram size={20} />
                </a>
                <a href="https://wa.me/254707806523" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  <FaWhatsapp size={20} />
                </a>
              </div>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#knowledge" className="hover:text-white transition-colors">Training</a></li>
                <li><Link to="/signup" className="hover:text-white transition-colors">Start Free Trial</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/help-center" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link to="/complaints/submit" className="hover:text-white transition-colors">Report Issue</Link></li>
                <li>
                  <a
                    href="https://wa.me/254707806523?text=Hi,%20I%20need%20support%20with%20AquaBeacon"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors inline-flex items-center"
                  >
                    <FaWhatsapp className="mr-1" /> WhatsApp Support
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal & Contact */}
            <div>
              <h4 className="text-white font-semibold mb-4">Legal & Contact</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link to="/kebs-standards" className="hover:text-white transition-colors">KEBS Standards</Link></li>
                <li className="flex items-center">
                  <FiMail className="mr-2" />
                  <a href="mailto:support@aquabeacon.co.ke" className="hover:text-white transition-colors">
                    support@aquabeacon.co.ke
                  </a>
                </li>
                <li className="flex items-center">
                  <FiPhone className="mr-2" />
                  <a href="tel:+254707806523" className="hover:text-white transition-colors">
                    +254 707806523
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center text-sm">
              <p>&copy; 2025 AquaBeacon. All rights reserved. Built for SDG 6 🌊</p>
              <p className="mt-2 md:mt-0">
                Made with ❤️ in Kenya
              </p>
            </div>
          </div>
        </div>
      </footer>

    </div>
    <AIChatWidget />
    </>
  );
};

export default Landing;