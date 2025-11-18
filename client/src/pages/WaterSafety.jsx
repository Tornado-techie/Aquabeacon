import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiDroplet, FiShield, FiAlertTriangle, FiCheckCircle, 
  FiThermometer, FiActivity, FiEye, FiMessageCircle,
  FiBook, FiHelpCircle, FiInfo
} from 'react-icons/fi';
import AquaBeaconLogo from '../components/AquaBeaconLogo';
import AIChat from '../components/AIChat';

const WaterSafety = () => {
  const [activeTab, setActiveTab] = useState('standards');
  const [aiChatRef, setAiChatRef] = useState(null);

  const tabs = [
    { id: 'standards', name: 'Quality Standards', icon: <FiShield /> },
    { id: 'testing', name: 'Testing & Parameters', icon: <FiActivity /> },
    { id: 'safety', name: 'Safety Guidelines', icon: <FiAlertTriangle /> },
    { id: 'ai-assistant', name: 'Ask AI Assistant', icon: <FiMessageCircle /> }
  ];

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
            <Link to="/" className="flex items-center">
              <AquaBeaconLogo size="md" />
            </Link>
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-gray-600 hover:text-gray-900">
                Home
              </Link>
              <Link to="/complaints" className="text-gray-600 hover:text-gray-900">
                Report Issue
              </Link>
              <Link to="/track-complaint" className="text-gray-600 hover:text-gray-900">
                Track Complaint
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="bg-gradient-to-br from-blue-50 to-blue-100 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FiShield className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Water Safety Education
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Learn about water quality standards, testing procedures, and how to identify safe drinking water
          </p>
        </div>
      </section>

      {/* Tabs */}
      <section className="py-8 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-3 justify-center">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.icon}
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Quality Standards Tab */}
          {activeTab === 'standards' && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Water Quality Standards</h2>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                  Understanding the key parameters that determine water quality according to KEBS standards
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {qualityStandards.map((standard, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-blue-600">
                        {standard.icon}
                      </div>
                      <span className="text-sm font-semibold text-green-600 bg-green-100 px-2 py-1 rounded">
                        {standard.range}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {standard.parameter}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">
                      {standard.description}
                    </p>
                    <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                      <strong>Why it matters:</strong> {standard.importance}
                    </div>
                  </div>
                ))}
              </div>

              {/* Warning Signs */}
              <div className="mt-12">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Warning Signs to Watch For</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {warningSignsData.map((warning, index) => (
                    <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-start">
                        <FiAlertTriangle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-red-900">{warning.sign}</h4>
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
          )}

          {/* Testing Tab */}
          {activeTab === 'testing' && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Water Testing & Parameters</h2>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                  Learn about different types of water testing and what the results mean
                </p>
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Physical Testing</h3>
                  <div className="space-y-4">
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-semibold text-gray-900">Visual Inspection</h4>
                      <p className="text-gray-600 text-sm">Check for color, clarity, and visible particles</p>
                    </div>
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-semibold text-gray-900">Odor Test</h4>
                      <p className="text-gray-600 text-sm">Detect unusual smells that may indicate contamination</p>
                    </div>
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-semibold text-gray-900">Taste Test</h4>
                      <p className="text-gray-600 text-sm">Only if water appears safe - check for unusual tastes</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Chemical Testing</h3>
                  <div className="space-y-4">
                    <div className="border-l-4 border-green-500 pl-4">
                      <h4 className="font-semibold text-gray-900">pH Testing</h4>
                      <p className="text-gray-600 text-sm">Measures acidity/alkalinity (6.5-8.5 is safe)</p>
                    </div>
                    <div className="border-l-4 border-green-500 pl-4">
                      <h4 className="font-semibold text-gray-900">TDS Testing</h4>
                      <p className="text-gray-600 text-sm">Total dissolved solids measurement</p>
                    </div>
                    <div className="border-l-4 border-green-500 pl-4">
                      <h4 className="font-semibold text-gray-900">Chlorine Testing</h4>
                      <p className="text-gray-600 text-sm">Ensures proper disinfection levels</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Biological Testing</h3>
                  <div className="space-y-4">
                    <div className="border-l-4 border-red-500 pl-4">
                      <h4 className="font-semibold text-gray-900">Bacterial Testing</h4>
                      <p className="text-gray-600 text-sm">Tests for E. coli and coliform bacteria</p>
                    </div>
                    <div className="border-l-4 border-red-500 pl-4">
                      <h4 className="font-semibold text-gray-900">Parasite Testing</h4>
                      <p className="text-gray-600 text-sm">Checks for harmful parasites and cysts</p>
                    </div>
                    <div className="border-l-4 border-red-500 pl-4">
                      <h4 className="font-semibold text-gray-900">Virus Testing</h4>
                      <p className="text-gray-600 text-sm">Advanced testing for viral contamination</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">When to Test</h3>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <FiCheckCircle className="w-5 h-5 text-green-600 mt-0.5 mr-3" />
                      <div>
                        <h4 className="font-semibold text-gray-900">Regular Testing</h4>
                        <p className="text-gray-600 text-sm">Every 6 months for private sources</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <FiAlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" />
                      <div>
                        <h4 className="font-semibold text-gray-900">After Contamination</h4>
                        <p className="text-gray-600 text-sm">Test immediately after suspected contamination</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <FiInfo className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
                      <div>
                        <h4 className="font-semibold text-gray-900">New Source</h4>
                        <p className="text-gray-600 text-sm">Always test new water sources before use</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Safety Guidelines Tab */}
          {activeTab === 'safety' && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Water Safety Guidelines</h2>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                  Practical tips to ensure the water you consume is safe and healthy
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {safetyTips.map((tip, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-blue-600 text-xl">
                        {tip.icon}
                      </div>
                      <span className={`text-xs font-semibold px-2 py-1 rounded ${getLevelColor(tip.level)}`}>
                        {tip.level}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      {tip.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {tip.description}
                    </p>
                  </div>
                ))}
              </div>

              {/* Emergency Actions */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-red-900 mb-4 flex items-center">
                  <FiAlertTriangle className="mr-2" />
                  Emergency Actions
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-red-800 mb-2">If You Suspect Contamination:</h4>
                    <ul className="text-red-700 text-sm space-y-1">
                      <li>• Stop drinking the water immediately</li>
                      <li>• Switch to bottled or boiled water</li>
                      <li>• Report to the water supplier</li>
                      <li>• Submit a complaint via AquaBeacon</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-red-800 mb-2">If You Feel Sick:</h4>
                    <ul className="text-red-700 text-sm space-y-1">
                      <li>• Seek medical attention immediately</li>
                      <li>• Save a sample of the water if possible</li>
                      <li>• Record symptoms and timing</li>
                      <li>• Report the incident to health authorities</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* AI Assistant Tab */}
          {activeTab === 'ai-assistant' && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">AI Water Safety Assistant</h2>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                  Ask our AI assistant any questions about water safety, quality standards, or testing procedures
                </p>
              </div>

              <div className="max-w-4xl mx-auto">
                <div className="h-96 lg:h-[500px]">
                  <AIChat 
                    standalone={true} 
                    onQuestionClick={(handler) => setAiChatRef(handler)}
                  />
                </div>
              </div>

              {/* Suggested Questions */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Questions</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {[
                    "How can I tell if my tap water is safe to drink?",
                    "What does cloudiness in bottled water mean?",
                    "Is it safe to drink water with a slight chlorine smell?",
                    "How long can I store opened bottled water safely?",
                    "What should I do if my water tastes metallic or bitter?",
                    "How to identify fake or counterfeit bottled water?",
                    "What are the health risks of high TDS in drinking water?",
                    "Should I boil water if it looks clear and clean?",
                    "How to report contaminated water to authorities?",
                    "What's the safest way to treat borehole water at home?",
                    "Can I trust water quality claims on bottle labels?",
                    "How often should I clean my water storage tank?"
                  ].map((question, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        if (aiChatRef) {
                          aiChatRef(question);
                        }
                      }}
                      className="text-left text-sm text-gray-800 bg-gray-50 hover:bg-blue-50 hover:border-blue-300 p-3 rounded-lg border border-gray-200 transition-all duration-200 hover:shadow-md group"
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
          )}
        </div>
      </section>

      {/* Action Section */}
      <section className="py-12 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Found a Water Quality Issue?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Report it immediately to help protect your community
          </p>
          <div className="flex justify-center space-x-4 flex-wrap gap-3">
            <Link
              to="/complaints"
              className="inline-flex items-center bg-white text-blue-600 px-8 py-3 rounded-lg hover:bg-gray-100 font-semibold text-lg shadow-lg transition-all hover:scale-105"
            >
              Report Water Issue
            </Link>
            <Link
              to="/track-complaint"
              className="inline-flex items-center bg-blue-500 text-white px-8 py-3 rounded-lg hover:bg-blue-400 font-semibold text-lg shadow-lg transition-all hover:scale-105"
            >
              Track Existing Complaint
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default WaterSafety;