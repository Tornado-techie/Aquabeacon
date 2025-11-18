import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AIProvider } from './context/AIContext';
import { SocketProvider } from './context/SocketContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AIChatWidget from './components/ai/AIChatWidget';

// Pages
import Landing from './pages/Landing';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import PlantSetup from './pages/PlantSetup';
import Complaints from './pages/Complaints';
import TrackComplaint from './pages/TrackComplaint';
import Inspections from './pages/Inspections';
import InspectorComplaints from './pages/InspectorComplaints';
import LabBooking from './pages/LabBooking';
import AdminPanel from './pages/AdminPanel';
import Pricing from './pages/Pricing';
import Contact from './pages/Contact';
import KnowledgeHub from './pages/KnowledgeHub';
import KnowledgeArticle from './components/knowledge/KnowledgeArticle';
import Payment from './pages/Payment';
import PricingComparison from './pages/PricingComparison';

// Component to conditionally show AI chat
const AIChat = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const showAIChat = isAuthenticated && 
    location.pathname !== '/signin' && 
    location.pathname !== '/signup' &&
    location.pathname !== '/';
  
  return showAIChat && import.meta.env.VITE_ENABLE_AI_CHAT === 'true' ? 
    <AIChatWidget /> : null;
};

// Simple placeholder components
const HelpCenter = () => (
  <div className="min-h-screen bg-gray-50 py-12 px-4">
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Help Center</h1>
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <div className="border-b pb-4">
            <h3 className="font-semibold text-gray-900 mb-2">How do I get started?</h3>
            <p className="text-gray-600">Sign up for a free account and follow the plant setup wizard to register your business.</p>
          </div>
          <div className="border-b pb-4">
            <h3 className="font-semibold text-gray-900 mb-2">What are the KEBS requirements?</h3>
            <p className="text-gray-600">Visit our Knowledge Hub for detailed guides on KS EAS 153 and KS EAS 13 standards.</p>
          </div>
          <div className="border-b pb-4">
            <h3 className="font-semibold text-gray-900 mb-2">How do I report a water quality issue?</h3>
            <p className="text-gray-600">You can submit a complaint without logging in using our public complaint form.</p>
          </div>
        </div>
        <div className="mt-8">
          <p className="text-gray-600">Can't find what you're looking for?</p>
          <a href="https://wa.me/254707806523" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
            Chat with our support team
          </a>
        </div>
      </div>
    </div>
  </div>
);

const TermsPage = () => (
  <div className="min-h-screen bg-gray-50 py-12 px-4">
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>
      <div className="bg-white rounded-lg shadow-md p-8 prose max-w-none">
        <p className="text-gray-600 mb-4">Last updated: January 2025</p>
        <h2 className="text-2xl font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h2>
        <p className="text-gray-700 mb-4">By accessing and using AquaBeacon, you agree to be bound by these Terms of Service.</p>
        <h2 className="text-2xl font-semibold text-gray-900 mb-3">2. Use of Service</h2>
        <p className="text-gray-700 mb-4">You agree to use the service only for lawful purposes and in accordance with these Terms.</p>
        <h2 className="text-2xl font-semibold text-gray-900 mb-3">3. User Accounts</h2>
        <p className="text-gray-700 mb-4">You are responsible for maintaining the confidentiality of your account credentials.</p>
        <p className="text-gray-600 mt-8">For full terms and conditions, please contact us at legal@aquabeacon.co.ke</p>
      </div>
    </div>
  </div>
);

const PrivacyPage = () => (
  <div className="min-h-screen bg-gray-50 py-12 px-4">
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
      <div className="bg-white rounded-lg shadow-md p-8 prose max-w-none">
        <p className="text-gray-600 mb-4">Last updated: January 2025</p>
        <h2 className="text-2xl font-semibold text-gray-900 mb-3">1. Information We Collect</h2>
        <p className="text-gray-700 mb-4">We collect information you provide directly to us, such as when you create an account, use our services, or contact us.</p>
        <h2 className="text-2xl font-semibold text-gray-900 mb-3">2. How We Use Your Information</h2>
        <p className="text-gray-700 mb-4">We use the information we collect to provide, maintain, and improve our services.</p>
        <h2 className="text-2xl font-semibold text-gray-900 mb-3">3. Data Security</h2>
        <p className="text-gray-700 mb-4">We implement appropriate security measures to protect your personal information.</p>
        <p className="text-gray-600 mt-8">For questions about privacy, contact us at privacy@aquabeacon.co.ke</p>
      </div>
    </div>
  </div>
);

const KEBSStandards = () => (
  <div className="min-h-screen bg-gray-50 py-12 px-4">
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">KEBS Water Quality Standards</h1>
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">KS EAS 153:2000 - Bottled Drinking Water</h2>
        <div className="overflow-x-auto mb-8">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Parameter</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Limit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">pH</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">6.5 - 8.5</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">pH units</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Turbidity</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{"< 5"}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">NTU</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Total Dissolved Solids</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">50 - 500</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">mg/L</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Coliform Bacteria</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">0</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">CFU/100ml</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">KS EAS 13:2019 - Water Vending</h2>
        <p className="text-gray-700 mb-4">Standards for water vending machines and dispenser operations including hygiene, maintenance, and quality control requirements.</p>
        
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-900 font-medium">Need detailed standards documentation?</p>
          <p className="text-blue-700 text-sm mt-2">Contact KEBS at info@kebs.org or visit www.kebs.org</p>
        </div>
      </div>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <AIProvider>
        <SocketProvider>
          <div className="min-h-screen bg-gray-50">
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
        
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/pricing-comparison" element={<PricingComparison />} />
          <Route path="/complaints" element={<Complaints />} />
          <Route path="/complaints/submit" element={<Complaints />} />
          <Route path="/track-complaint" element={<TrackComplaint />} />
          <Route path="/water-safety" element={<Navigate to="/knowledge-hub?section=water-safety" replace />} />
          <Route path="/contact" element={<Contact />} />
          
          {/* Info Pages (Public) */}
          <Route path="/help-center" element={<HelpCenter />} />
          <Route path="/knowledge-hub" element={<KnowledgeHub />} />
          <Route path="/knowledge-hub/:articleId" element={<KnowledgeArticle />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/kebs-standards" element={<KEBSStandards />} />
          
          {/* Protected Routes */}
          <Route
            path="/payment"
            element={
              <ProtectedRoute>
                <Payment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/plants/setup"
            element={
              <ProtectedRoute roles={['owner', 'admin']}>
                <PlantSetup />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lab-booking"
            element={
              <ProtectedRoute roles={['owner', 'admin']}>
                <LabBooking />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={['admin', 'inspector']}>
                <AdminPanel />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inspections"
            element={
              <ProtectedRoute roles={['inspector', 'admin']}>
                <Inspections />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inspector/complaints"
            element={
              <ProtectedRoute roles={['inspector', 'admin']}>
                <InspectorComplaints />
              </ProtectedRoute>
            }
          />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

          {/* AI Chat Widget */}
          <AIChat />
        </div>
        </SocketProvider>
      </AIProvider>
    </AuthProvider>
  );
}

export default App;