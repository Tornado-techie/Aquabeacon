import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  FiDroplet, FiBook, FiFileText, FiAward, FiBarChart, 
  FiSettings, FiTrendingUp, FiShield, FiUsers, FiArrowRight,
  FiLock, FiCheckCircle, FiAlertTriangle, FiThermometer, 
  FiActivity, FiEye, FiMessageCircle, FiInfo, FiHelpCircle
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import KnowledgeArticle from '../components/knowledge/KnowledgeArticle';
import AIChat from '../components/AIChat';
import AquaBeaconLogo from '../components/AquaBeaconLogo';

const KnowledgeHub = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const { isAuthenticated, user } = useAuth();
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('articles');
  const [selectedSubTab, setSelectedSubTab] = useState('standards');
  const populateFunctionsRef = useRef([]);
  const location = useLocation();

  const navigate = useNavigate();

  const popularQuestions = [
    "How can I tell if bottled water is safe and high quality?",
    "What should I check on bottled water labels for safety?",
    "Why does my bottled water have a strange taste or smell?",
    "How long can I safely store unopened bottled water?",
    "What does the expiration date on bottled water really mean?",
    "Is cloudy or discolored bottled water safe to drink?",
    "How do I know if bottled water meets KEBS standards?",
    "What are the signs of contaminated bottled water?",
    "Should I be concerned about plastic bottle safety?",
    "How do I report poor quality bottled water to authorities?",
    "What's the difference between purified and spring water labels?",
    "How can I verify a water brand's quality certificates?",
    "Why does bottled water taste different from different brands?",
    "What should I do if bottled water makes me feel sick?",
    "How do I choose the safest bottled water brand?"
  ];

  // Check if user came from water safety link or AI assistant
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const section = searchParams.get('section');
    if (section === 'water-safety') {
      setActiveTab('water-safety');
      setSelectedCategory('safety');
    } else if (section === 'ai-assistant') {
      setActiveTab('ai-assistant');
    }
  }, [location]);

  const hasAccess = isAuthenticated && (user?.role === 'owner' || user?.subscription === 'pro' || user?.subscription === 'enterprise');

  const categories = [
    { id: 'all', name: 'All Topics', icon: <FiBook /> },
    { id: 'safety', name: 'Water Safety & Quality', icon: <FiShield />, public: true },
    { id: 'business', name: 'Business Guidance', icon: <FiTrendingUp /> }
  ];

  const tabs = [
    { id: 'articles', name: 'Articles & Guides', icon: <FiBook /> },
    { id: 'water-safety', name: 'Water Safety Education', icon: <FiShield />, public: true },
    { id: 'ai-assistant', name: 'Ask AI Assistant', icon: <FiMessageCircle />, public: true }
  ];

  const articles = [
    // Public Water Safety Articles
    {
      id: 'water-quality-basics',
      title: "Understanding Water Quality Standards",
      description: "Learn about pH, TDS, turbidity, and other key quality parameters",
      icon: <FiDroplet className="w-8 h-8" />,
      category: 'safety',
      readTime: '5 min',
      isPremium: false,
      isPublic: true,
      difficulty: 'Beginner'
    },
    {
      id: 'identify-contamination',
      title: "How to Identify Water Contamination",
      description: "Warning signs and what to do if you suspect contaminated water",
      icon: <FiAlertTriangle className="w-8 h-8" />,
      category: 'safety',
      readTime: '4 min',
      isPremium: false,
      isPublic: true,
      difficulty: 'Beginner'
    },
    {
      id: 'safe-water-storage',
      title: "Safe Water Storage Guidelines",
      description: "How to properly store and handle water at home",
      icon: <FiShield className="w-8 h-8" />,
      category: 'safety',
      readTime: '3 min',
      isPremium: false,
      isPublic: true,
      difficulty: 'Beginner'
    },
    {
      id: 'kebs-consumer-guide',
      title: "KEBS Standards for Consumers",
      description: "What consumers need to know about water quality certification",
      icon: <FiAward className="w-8 h-8" />,
      category: 'safety',
      readTime: '6 min',
      isPremium: false,
      isPublic: true,
      difficulty: 'Beginner'
    },
    // Premium Business Articles
    {
      id: 'kebs-standards',
      title: "KEBS Water Quality Standards Guide",
      description: "Complete guide to KS EAS 153:2000 and KS EAS 13:2019 requirements",
      icon: <FiShield className="w-8 h-8" />,
      category: 'business',
      readTime: '8 min',
      isPremium: true,
      isPublic: false,
      difficulty: 'Beginner'
    },
    {
      id: 'startup-checklist',
      title: "Water Business Startup Checklist",
      description: "Everything you need from registration to first sale",
      icon: <FiFileText className="w-8 h-8" />,
      category: 'business',
      readTime: '12 min',
      isPremium: true,
      isPublic: false,
      difficulty: 'Beginner'
    },
    {
      id: 'permit-guide',
      title: "KEBS Permit Application Guide",
      description: "Step-by-step process for KEBS certification",
      icon: <FiAward className="w-8 h-8" />,
      category: 'business',
      readTime: '10 min',
      isPremium: true,
      isPublic: false,
      difficulty: 'Intermediate'
    },
    {
      id: 'water-testing-parameters',
      title: "Water Testing Parameters Explained",
      description: "Understanding pH, TDS, turbidity, and bacteria limits",
      icon: <FiBarChart className="w-8 h-8" />,
      category: 'business',
      readTime: '6 min',
      isPremium: true,
      isPublic: false,
      difficulty: 'Beginner'
    },
    {
      id: 'equipment-guide',
      title: "Essential Equipment Guide",
      description: "What equipment you need and how to choose suppliers",
      icon: <FiSettings className="w-8 h-8" />,
      category: 'business',
      readTime: '15 min',
      isPremium: true,
      isPublic: false,
      difficulty: 'Intermediate'
    },
    {
      id: 'treatment-methods',
      title: "Water Treatment Methods",
      description: "Filtration, RO, UV, chlorination, and ozonation explained",
      icon: <FiDroplet className="w-8 h-8" />,
      category: 'business',
      readTime: '10 min',
      isPremium: true,
      isPublic: false,
      difficulty: 'Intermediate'
    },
    {
      id: 'hygiene-practices',
      title: "Safety & Hygiene Best Practices",
      description: "Maintaining sanitation and preventing contamination",
      icon: <FiShield className="w-8 h-8" />,
      category: 'business',
      readTime: '8 min',
      isPremium: true,
      isPublic: false,
      difficulty: 'Beginner'
    },
    {
      id: 'business-scaling',
      title: "Scaling Your Water Business",
      description: "Growth strategies and expansion planning",
      icon: <FiTrendingUp className="w-8 h-8" />,
      category: 'business',
      readTime: '12 min',
      isPremium: true,
      isPublic: false,
      difficulty: 'Advanced'
    },
    {
      id: 'financial-planning',
      title: "Financial Planning & Budgeting",
      description: "Cost analysis, pricing strategies, and profitability",
      icon: <FiBarChart className="w-8 h-8" />,
      category: 'business',
      readTime: '10 min',
      isPremium: true,
      isPublic: false,
      difficulty: 'Intermediate'
    },
    {
      id: 'lab-testing',
      title: "Lab Testing Schedule & Procedures",
      description: "When and how to test water quality",
      icon: <FiFileText className="w-8 h-8" />,
      category: 'business',
      readTime: '7 min',
      isPremium: true,
      isPublic: false,
      difficulty: 'Beginner'
    },
    {
      id: 'distribution-channels',
      title: "Distribution & Sales Channels",
      description: "How to reach customers and grow sales",
      icon: <FiUsers className="w-8 h-8" />,
      category: 'business',
      readTime: '9 min',
      isPremium: true,
      isPublic: false,
      difficulty: 'Intermediate'
    },
    {
      id: 'bottling-packaging',
      title: "Bottling & Packaging Standards",
      description: "Bottle types, labeling requirements, and branding",
      icon: <FiSettings className="w-8 h-8" />,
      category: 'business',
      readTime: '8 min',
      isPremium: true,
      isPublic: false,
      difficulty: 'Beginner'
    }
  ];

  const filteredArticles = selectedCategory === 'all' 
    ? articles 
    : articles.filter(article => article.category === selectedCategory);

  // Water Safety Education Data
  const qualityStandards = [
    {
      parameter: 'pH Level',
      range: '6.5 - 8.5',
      description: 'Measures how acidic or basic the water is',
      icon: <FiThermometer />,
      importance: 'Critical for taste and chemical balance'
    },
    {
      parameter: 'Total Dissolved Solids (TDS)',
      range: '< 1000 mg/L',
      description: 'Amount of dissolved minerals and salts',
      icon: <FiActivity />,
      importance: 'Affects taste and potential health impacts'
    },
    {
      parameter: 'Turbidity',
      range: '< 5 NTU',
      description: 'Cloudiness or haziness of water',
      icon: <FiEye />,
      importance: 'Indicates filtration effectiveness'
    },
    {
      parameter: 'Coliform Bacteria',
      range: '0 CFU/100mL',
      description: 'Indicator of bacterial contamination',
      icon: <FiAlertTriangle />,
      importance: 'Critical for preventing waterborne diseases'
    },
    {
      parameter: 'Chlorine Residual',
      range: '0.2 - 0.5 mg/L',
      description: 'Disinfectant level for safety',
      icon: <FiShield />,
      importance: 'Ensures ongoing protection from bacteria'
    }
  ];

  const safetyTips = [
    {
      title: 'Check Water Clarity',
      description: 'Clean water should be clear and colorless. Cloudy or discolored water may indicate contamination.',
      icon: <FiEye />,
      level: 'Basic'
    },
    {
      title: 'Smell Test',
      description: 'Good water should have no strong odors. Chemical, earthy, or sewage-like smells are warning signs.',
      icon: <FiAlertTriangle />,
      level: 'Basic'
    },
    {
      title: 'Taste Check',
      description: 'Water should taste neutral. Metallic, bitter, or overly salty tastes may indicate problems.',
      icon: <FiDroplet />,
      level: 'Basic'
    },
    {
      title: 'Check Packaging',
      description: 'Ensure bottles are properly sealed and labels include KEBS certification marks.',
      icon: <FiShield />,
      level: 'Important'
    },
    {
      title: 'Storage Guidelines',
      description: 'Store water in cool, dry places away from direct sunlight and chemicals.',
      icon: <FiInfo />,
      level: 'Important'
    },
    {
      title: 'Expiration Dates',
      description: 'Always check expiration dates and batch codes on packaged water.',
      icon: <FiCheckCircle />,
      level: 'Critical'
    }
  ];

  const warningSignsData = [
    {
      sign: 'Unusual Color',
      description: 'Brown, yellow, green, or any colored water',
      action: 'Stop consumption immediately and report'
    },
    {
      sign: 'Strange Odor',
      description: 'Chemical, rotten egg, or sewage-like smells',
      action: 'Do not drink and contact the supplier'
    },
    {
      sign: 'Metallic Taste',
      description: 'Strong metallic or bitter taste',
      action: 'Switch to alternative water source'
    },
    {
      sign: 'Particles or Sediment',
      description: 'Visible floating particles or sediment',
      action: 'Filter or boil before use, report issue'
    },
    {
      sign: 'Oil Film',
      description: 'Oily or greasy film on water surface',
      action: 'Do not consume, report contamination'
    },
    {
      sign: 'Gastrointestinal Issues',
      description: 'Stomach pain, nausea after consumption',
      action: 'Seek medical attention, report water source'
    }
  ];

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-green-100 text-green-700';
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-700';
      case 'Advanced':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'Basic':
        return 'bg-green-100 text-green-700';
      case 'Important':
        return 'bg-yellow-100 text-yellow-700';
      case 'Critical':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <AquaBeaconLogo size="sm" />
            </Link>
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-gray-600 hover:text-gray-900">
                Back to Home
              </Link>
              {!isAuthenticated ? (
                <>
                  <Link to="/signin" className="text-gray-600 hover:text-gray-900 font-medium">
                    Sign In
                  </Link>
                  <Link to="/signup" className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700">
                    Sign Up Free
                  </Link>
                </>
              ) : (
                <Link to="/dashboard" className="text-gray-600 hover:text-gray-900 font-medium">
                  Dashboard
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="bg-gradient-to-br from-primary-50 to-primary-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
              Knowledge Hub
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
              {activeTab === 'water-safety' 
                ? 'Learn about water quality standards, safety guidelines, and how to identify safe drinking water'
                : activeTab === 'ai-assistant'
                ? 'Ask our AI assistant questions about water safety, quality standards, and business guidance'
                : 'Learn about water safety and get guidance for starting a compliant water business in Kenya'
              }
            </p>
            
            {activeTab === 'articles' && !hasAccess && (
              <div className="inline-flex items-center bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-medium">
                <FiLock className="mr-2" />
                Upgrade to Pro for full access to all {articles.filter(a => a.isPremium).length} premium guides
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Tabs */}
      <section className="py-8 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-3 justify-center mb-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id === 'water-safety') {
                    setSelectedCategory('safety');
                    navigate('/knowledge-hub?section=water-safety', { replace: true });
                  } else if (tab.id === 'articles') {
                    setSelectedCategory('all');
                    navigate('/knowledge-hub', { replace: true });
                  } else if (tab.id === 'ai-assistant') {
                    navigate('/knowledge-hub?section=ai-assistant', { replace: true });
                  }
                }}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.icon}
                <span>{tab.name}</span>
                {tab.public && (
                  <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full ml-2">
                    Free
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Articles Tab */}
          {activeTab === 'articles' && (
            <div>
              {/* Category Filter for Articles */}
              <div className="flex flex-wrap gap-3 justify-center mb-8">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category.icon}
                    <span>{category.name}</span>
                  </button>
                ))}
              </div>

              <div className="mb-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedCategory === 'all' ? 'All Articles' : categories.find(c => c.id === selectedCategory)?.name}
                </h2>
                <p className="text-gray-600">
                  {filteredArticles.length} {filteredArticles.length === 1 ? 'article' : 'articles'}
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredArticles.map((article) => (
                  <div
                    key={article.id}
                    className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all hover:-translate-y-1 overflow-hidden group"
                  >
                    <div className="p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="text-primary-600 group-hover:scale-110 transition-transform">
                          {article.icon}
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          {article.isPremium && !hasAccess && (
                            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-semibold flex items-center">
                              <FiLock className="w-3 h-3 mr-1" />
                              PRO
                            </span>
                          )}
                          {hasAccess && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold flex items-center">
                              <FiCheckCircle className="w-3 h-3 mr-1" />
                              Access
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                        {article.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4">
                        {article.description}
                      </p>

                      {/* Meta */}
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                        <span className="flex items-center">
                          <FiBook className="w-3 h-3 mr-1" />
                          {article.readTime}
                        </span>
                        <span className={`px-2 py-1 rounded-full ${getDifficultyColor(article.difficulty)}`}>
                          {article.difficulty}
                        </span>
                      </div>

                      {/* Action Button */}
                      <Link
                        to={`/knowledge-hub/${article.id}`}
                        className="w-full flex items-center justify-center text-primary-600 font-medium text-sm hover:text-primary-700 transition-colors"
                      >
                        Read {article.isPremium && !hasAccess ? 'Preview' : 'Article'}
                        <FiArrowRight className="ml-2 group-hover:translate-x-2 transition-transform" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Water Safety Education Tab */}
          {activeTab === 'water-safety' && (
            <div className="space-y-12">
              {/* Water Safety Content */}
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Water Safety Education</h3>
                  <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                    Learn about water quality standards, safety guidelines, and how to identify safe drinking water
                  </p>
                </div>

                {/* Quality Standards Section */}
                <div className="space-y-8 mb-12">
                  <div className="text-center">
                    <h4 className="text-xl font-bold text-gray-900 mb-4">Water Quality Standards</h4>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                      Understanding the key parameters that determine water quality according to KEBS standards
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {qualityStandards.map((standard, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                          <div className="text-primary-600">
                            {standard.icon}
                          </div>
                          <span className="text-sm font-semibold text-green-600 bg-green-100 px-2 py-1 rounded">
                            {standard.range}
                          </span>
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">
                          {standard.parameter}
                        </h4>
                        <p className="text-gray-600 text-sm mb-3">
                          {standard.description}
                        </p>
                        <div className="text-xs text-primary-600 bg-primary-50 p-2 rounded">
                          <strong>Why it matters:</strong> {standard.importance}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Safety Guidelines Section */}
                <div className="space-y-8 mb-12">
                  <div className="text-center">
                    <h4 className="text-xl font-bold text-gray-900 mb-4">Safety Guidelines</h4>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                      Practical tips to ensure the water you consume is safe and healthy
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {safetyTips.map((tip, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                          <div className="text-primary-600 text-xl">
                            {tip.icon}
                          </div>
                          <span className={`text-xs font-semibold px-2 py-1 rounded ${getLevelColor(tip.level)}`}>
                            {tip.level}
                          </span>
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">
                          {tip.title}
                        </h4>
                        <p className="text-gray-600 text-sm">
                          {tip.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Warning Signs Section */}
                <div className="space-y-8">
                  <div className="text-center">
                    <h4 className="text-xl font-bold text-gray-900 mb-4">Warning Signs to Watch For</h4>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                      Know the danger signs and what actions to take
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {warningSignsData.map((warning, index) => (
                      <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-start">
                          <FiAlertTriangle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                          <div>
                            <h5 className="font-semibold text-red-900">{warning.sign}</h5>
                            <p className="text-red-800 text-sm mt-1">{warning.description}</p>
                            <p className="text-red-700 text-xs mt-2 font-medium">
                              Action: {warning.action}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Call to Action */}
              <div className="bg-primary-600 text-white rounded-lg p-8 text-center">
                <h3 className="text-2xl font-bold mb-4">Found a Water Quality Issue?</h3>
                <p className="text-lg text-primary-100 mb-6">
                  Report it immediately to help protect your community
                </p>
                <div className="flex justify-center space-x-4 flex-wrap gap-3">
                  <Link
                    to="/complaints"
                    className="inline-flex items-center bg-white text-primary-600 px-6 py-3 rounded-lg hover:bg-gray-100 font-semibold shadow-lg transition-all hover:scale-105"
                  >
                    Report Water Issue
                  </Link>
                  <Link
                    to="/track-complaint"
                    className="inline-flex items-center bg-primary-500 text-white px-6 py-3 rounded-lg hover:bg-primary-400 font-semibold shadow-lg transition-all hover:scale-105"
                  >
                    Track Existing Complaint
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* AI Assistant Tab */}
          {activeTab === 'ai-assistant' && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">AI Assistant</h2>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                  Ask our AI assistant questions about water safety, quality standards, and business guidance
                </p>
              </div>

              {/* Main Layout - Responsive */}
              <div className="max-w-7xl mx-auto">
                {/* Desktop Layout */}
                <div className="hidden lg:grid lg:grid-cols-3 gap-8">
                  {/* AI Chat - Takes 2/3 of the space */}
                  <div className="lg:col-span-2">
                    <div className="h-[600px]">
                      <AIChat 
                        standalone={true}
                        key="desktop-chat"
                        onQuestionClick={(populateFunc) => {
                          populateFunctionsRef.current[0] = populateFunc;
                        }}
                      />
                    </div>
                  </div>

                  {/* Suggested Questions Sidebar - Takes 1/3 */}
                  <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg shadow-md p-6 h-[600px] overflow-y-auto">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 sticky top-0 bg-white pb-2">
                        Popular Questions
                      </h3>
                      <div className="space-y-3">
                        {popularQuestions.map((question, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              // Call populate function on all AIChat instances
                              populateFunctionsRef.current.forEach(func => {
                                if (func) func(question);
                              });
                            }}
                            className="w-full text-left text-sm text-gray-800 bg-gray-50 hover:bg-blue-50 hover:border-blue-300 p-3 rounded-lg border border-gray-200 transition-all duration-200 hover:shadow-md group"
                          >
                            <div className="flex items-start space-x-2">
                              <FiHelpCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                              <span className="font-medium group-hover:text-blue-700">
                                {question}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mobile/Tablet Layout */}
                <div className="lg:hidden space-y-6">
                  {/* AI Chat */}
                  <div className="h-[500px] md:h-[600px]">
                    <AIChat 
                      standalone={true}
                      key="mobile-chat"
                      onQuestionClick={(populateFunc) => {
                        populateFunctionsRef.current[1] = populateFunc;
                      }}
                    />
                  </div>

                  {/* Suggested Questions - Mobile Grid */}
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Popular Questions
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {popularQuestions.map((question, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            // Call populate function on all AIChat instances
                            populateFunctionsRef.current.forEach(func => {
                              if (func) func(question);
                            });
                          }}
                          className="text-left text-sm text-gray-800 bg-gray-50 hover:bg-blue-50 hover:border-blue-300 p-3 rounded-lg border border-gray-200 transition-all duration-200 hover:shadow-md group"
                        >
                          <div className="flex items-start space-x-2">
                            <FiHelpCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            <span className="font-medium group-hover:text-blue-700 text-xs sm:text-sm">
                              {question}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Tips Section */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 max-w-7xl mx-auto">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                  💡 Tips for Better AI Assistance
                </h3>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <FiMessageCircle className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <p className="font-medium text-gray-800">Be Specific</p>
                    <p className="text-gray-600">Ask detailed questions for better answers</p>
                  </div>
                  <div className="text-center">
                    <FiBook className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <p className="font-medium text-gray-800">Water Topics Only</p>
                    <p className="text-gray-600">I specialize in water safety and business</p>
                  </div>
                  <div className="text-center">
                    <FiUsers className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <p className="font-medium text-gray-800">Follow Up</p>
                    <p className="text-gray-600">Ask follow-up questions for clarity</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CTA Banner - Temporarily always visible for testing */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4 text-white">
            Unlock Full Access to All Guides
          </h2>
          <p className="text-xl text-blue-100 mb-8 font-medium">
            Get complete access to {articles.length}+ detailed guides, templates, and resources
          </p>
          <div className="flex justify-center space-x-4 flex-wrap gap-3">
            <Link
              to="/pricing"
              className="inline-flex items-center bg-white text-blue-600 px-8 py-3 rounded-lg hover:bg-gray-100 font-semibold text-lg shadow-lg transition-all hover:scale-105"
            >
              View Pricing
              <FiArrowRight className="ml-2" />
            </Link>
            {!isAuthenticated && (
              <Link
                to="/signup"
                className="inline-flex items-center bg-blue-500 text-white px-8 py-3 rounded-lg hover:bg-blue-400 font-semibold text-lg shadow-lg transition-all hover:scale-105"
              >
                Start Free Trial
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm">&copy; 2025 AquaBeacon. All rights reserved.</p>
          <div className="mt-4 space-x-4">
            <Link to="/" className="hover:text-white">Home</Link>
            <Link to="/pricing" className="hover:text-white">Pricing</Link>
            <Link to="/contact" className="hover:text-white">Contact</Link>
          </div>
        </div>
      </footer>

      {/* Article Modal */}
      {/* The KnowledgeArticle component is now rendered as a standalone page via React Router, so the modal is no longer needed here. */}
    </div>
  );
};

export default KnowledgeHub;