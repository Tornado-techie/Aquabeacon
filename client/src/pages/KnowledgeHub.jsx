import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FiDroplet, FiBook, FiFileText, FiAward, FiBarChart, 
  FiSettings, FiTrendingUp, FiShield, FiUsers, FiArrowRight,
  FiLock, FiCheckCircle
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import KnowledgeArticle from '../components/knowledge/KnowledgeArticle';

const KnowledgeHub = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const { isAuthenticated, user } = useAuth();
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const navigate = useNavigate();

  const hasAccess = isAuthenticated && (user?.role === 'owner' || user?.subscription === 'pro' || user?.subscription === 'enterprise');

  const categories = [
    { id: 'all', name: 'All Topics', icon: <FiBook /> },
    { id: 'compliance', name: 'Compliance & Standards', icon: <FiShield /> },
    { id: 'business', name: 'Business Setup', icon: <FiTrendingUp /> },
    { id: 'equipment', name: 'Equipment & Tech', icon: <FiSettings /> },
    { id: 'quality', name: 'Quality Control', icon: <FiBarChart /> },
    { id: 'operations', name: 'Operations', icon: <FiUsers /> }
  ];

  const articles = [
    {
      id: 'kebs-standards',
      title: "KEBS Water Quality Standards Guide",
      description: "Complete guide to KS EAS 153:2000 and KS EAS 13:2019 requirements",
      icon: <FiShield className="w-8 h-8" />,
      category: 'compliance',
      readTime: '8 min',
      isPremium: true,
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
      difficulty: 'Beginner'
    },
    {
      id: 'permit-guide',
      title: "KEBS Permit Application Guide",
      description: "Step-by-step process for KEBS certification",
      icon: <FiAward className="w-8 h-8" />,
      category: 'compliance',
      readTime: '10 min',
      isPremium: true,
      difficulty: 'Intermediate'
    },
    {
      id: 'testing-parameters',
      title: "Water Testing Parameters Explained",
      description: "Understanding pH, TDS, turbidity, and bacteria limits",
      icon: <FiBarChart className="w-8 h-8" />,
      category: 'quality',
      readTime: '6 min',
      isPremium: true,
      difficulty: 'Beginner'
    },
    {
      id: 'equipment-guide',
      title: "Essential Equipment Guide",
      description: "What equipment you need and how to choose suppliers",
      icon: <FiSettings className="w-8 h-8" />,
      category: 'equipment',
      readTime: '15 min',
      isPremium: true,
      difficulty: 'Intermediate'
    },
    {
      id: 'treatment-methods',
      title: "Water Treatment Methods",
      description: "Filtration, RO, UV, chlorination, and ozonation explained",
      icon: <FiDroplet className="w-8 h-8" />,
      category: 'equipment',
      readTime: '10 min',
      isPremium: true,
      difficulty: 'Intermediate'
    },
    {
      id: 'hygiene-practices',
      title: "Safety & Hygiene Best Practices",
      description: "Maintaining sanitation and preventing contamination",
      icon: <FiShield className="w-8 h-8" />,
      category: 'operations',
      readTime: '8 min',
      isPremium: true,
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
      difficulty: 'Intermediate'
    },
    {
      id: 'lab-testing',
      title: "Lab Testing Schedule & Procedures",
      description: "When and how to test water quality",
      icon: <FiFileText className="w-8 h-8" />,
      category: 'quality',
      readTime: '7 min',
      isPremium: true,
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
      difficulty: 'Intermediate'
    },
    {
      id: 'bottling-packaging',
      title: "Bottling & Packaging Standards",
      description: "Bottle types, labeling requirements, and branding",
      icon: <FiSettings className="w-8 h-8" />,
      category: 'operations',
      readTime: '8 min',
      isPremium: true,
      difficulty: 'Beginner'
    }
  ];

  const filteredArticles = selectedCategory === 'all' 
    ? articles 
    : articles.filter(article => article.category === selectedCategory);

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <FiDroplet className="w-8 h-8 text-primary-600" />
              <span className="text-2xl font-bold text-gray-900">AquaBeacon</span>
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
              Comprehensive guides for starting and managing a compliant water business in Kenya
            </p>
            
            {!hasAccess && (
              <div className="inline-flex items-center bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-medium">
                <FiLock className="mr-2" />
                Upgrade to Pro for full access to all {articles.length} guides
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-3 justify-center">
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
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
      </section>

      {/* CTA Banner */}
      {!hasAccess && (
        <section className="py-16 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Unlock Full Access to All Guides
            </h2>
            <p className="text-xl text-primary-100 mb-8">
              Get complete access to {articles.length}+ detailed guides, templates, and resources
            </p>
            <div className="flex justify-center space-x-4 flex-wrap gap-3">
              <Link
                to="/pricing"
                className="inline-flex items-center bg-white text-primary-600 px-8 py-3 rounded-lg hover:bg-gray-100 font-semibold text-lg shadow-lg transition-all hover:scale-105"
              >
                View Pricing
                <FiArrowRight className="ml-2" />
              </Link>
              {!isAuthenticated && (
                <Link
                  to="/signup"
                  className="inline-flex items-center bg-primary-500 text-white px-8 py-3 rounded-lg hover:bg-primary-400 font-semibold text-lg shadow-lg transition-all hover:scale-105"
                >
                  Start Free Trial
                </Link>
              )}
            </div>
          </div>
        </section>
      )}

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