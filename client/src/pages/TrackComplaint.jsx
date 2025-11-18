import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiDroplet, FiSearch, FiPhone, FiEye, FiEyeOff, FiClock, FiMapPin, FiUser, FiAlertCircle, FiMail, FiKey } from 'react-icons/fi';
import AquaBeaconLogo from '../components/AquaBeaconLogo';
import api from '../utils/api';
import toast from 'react-hot-toast';

const TrackComplaint = () => {
  const location = useLocation();
  const [trackingMethod, setTrackingMethod] = useState('token'); // token, email, phone
  const [trackingData, setTrackingData] = useState({
    token: '',
    email: '',
    phone: '',
    complaintId: ''
  });
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showFullId, setShowFullId] = useState(false);

  // Check for tracking token or complaint ID in URL parameters
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const token = searchParams.get('token');
    const id = searchParams.get('id');
    
    if (token) {
      setTrackingMethod('token');
      setTrackingData(prev => ({
        ...prev,
        token: token
      }));
    } else if (id) {
      setTrackingData(prev => ({
        ...prev,
        complaintId: id
      }));
    }
  }, [location.search]);

  const handleChange = (e) => {
    setTrackingData({
      ...trackingData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let response;
      
      if (trackingMethod === 'token') {
        if (!trackingData.token) {
          toast.error('Please provide your tracking token');
          setLoading(false);
          return;
        }
        // Use the GET route for token tracking
        response = await api.get(`/complaints/track/${trackingData.token}`);
      } else {
        // Use the POST route for email/phone tracking
        let payload = { complaintId: trackingData.complaintId };
        
        if (trackingMethod === 'email') {
          if (!trackingData.email || !trackingData.complaintId) {
            toast.error('Please provide both email and complaint ID');
            setLoading(false);
            return;
          }
          payload.email = trackingData.email;
        } else if (trackingMethod === 'phone') {
          if (!trackingData.phone || !trackingData.complaintId) {
            toast.error('Please provide both phone number and complaint ID');
            setLoading(false);
            return;
          }
          payload.phone = trackingData.phone;
        }
        
        response = await api.post('/complaints/track', payload);
      }

      if (response.data.success) {
        setComplaint(response.data.data);
        toast.success('Complaint found!');
      } else {
        toast.error(response.data.message || 'Complaint not found');
        setComplaint(null);
      }
    } catch (error) {
      console.error('Track complaint error:', error);
      if (trackingMethod === 'token') {
        toast.error('Invalid tracking token or complaint not found');
      } else if (trackingMethod === 'email') {
        toast.error('Complaint not found or email doesn\'t match');
      } else {
        toast.error('Complaint not found or phone number doesn\'t match');
      }
      setComplaint(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'received':
        return 'bg-blue-100 text-blue-800';
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800';
      case 'investigating':
        return 'bg-orange-100 text-orange-800';
      case 'lab_testing':
        return 'bg-purple-100 text-purple-800';
      case 'escalated_kebs':
        return 'bg-red-100 text-red-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusDescription = (status) => {
    switch (status) {
      case 'received':
        return 'Your complaint has been received and is being reviewed.';
      case 'under_review':
        return 'Our team is reviewing your complaint details.';
      case 'investigating':
        return 'An inspector has been assigned and is investigating.';
      case 'lab_testing':
        return 'Water samples are being tested in our laboratory.';
      case 'escalated_kebs':
        return 'Your complaint has been escalated to KEBS for further action.';
      case 'resolved':
        return 'Your complaint has been resolved.';
      case 'closed':
        return 'Your complaint has been closed.';
      case 'rejected':
        return 'Your complaint has been rejected after investigation.';
      default:
        return 'Status information not available.';
    }
  };

  const formatComplaintId = (id) => {
    if (!id) return '';
    if (showFullId) return id;
    
    // If it's a human-readable ID (WQ-YYYY-NNNNNN), show it in full
    if (/^WQ-\d{4}-\d{6}$/.test(id)) {
      return id;
    }
    
    // For MongoDB ObjectIds, truncate
    return `${id.substring(0, 8)}...${id.substring(id.length - 4)}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center">
              <AquaBeaconLogo 
                width={180} 
                height={45} 
                showText={true}
                className="hover:opacity-80 transition-opacity"
              />
            </Link>
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-gray-600 hover:text-gray-900">
                Home
              </Link>
              <Link to="/complaints" className="text-gray-600 hover:text-gray-900">
                Report Issue
              </Link>
              <Link to="/knowledge-hub?section=water-safety" className="text-gray-600 hover:text-gray-900">
                Water Safety
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="bg-gradient-to-br from-blue-50 to-blue-100 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FiSearch className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Track Your Complaint
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Track your complaint using your tracking token, or with your email/phone number and complaint ID
          </p>
        </div>
      </section>

      {/* Tracking Form */}
      <section className="py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md p-8">
            {/* Tracking Method Selection */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Tracking Method</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => setTrackingMethod('token')}
                  className={`p-4 border rounded-lg text-left transition-colors ${
                    trackingMethod === 'token'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="flex items-center mb-2">
                    <FiKey className="w-5 h-5 mr-2" />
                    <span className="font-medium">Tracking Token</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Use the secure token provided when you submitted your complaint
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setTrackingMethod('email')}
                  className={`p-4 border rounded-lg text-left transition-colors ${
                    trackingMethod === 'email'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="flex items-center mb-2">
                    <FiMail className="w-5 h-5 mr-2" />
                    <span className="font-medium">Email + ID</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Use your email and complaint ID
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setTrackingMethod('phone')}
                  className={`p-4 border rounded-lg text-left transition-colors ${
                    trackingMethod === 'phone'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="flex items-center mb-2">
                    <FiPhone className="w-5 h-5 mr-2" />
                    <span className="font-medium">Phone + ID</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Use your phone number and complaint ID
                  </p>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {trackingMethod === 'token' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tracking Token *
                  </label>
                  <div className="relative">
                    <FiKey className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="token"
                      value={trackingData.token}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 font-mono"
                      placeholder="Enter your tracking token"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    This secure token was provided when you submitted your complaint
                  </p>
                </div>
              ) : (
                <>
                  {trackingMethod === 'email' ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <div className="relative">
                        <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="email"
                          name="email"
                          value={trackingData.email}
                          onChange={handleChange}
                          required
                          className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                          placeholder="your.email@example.com"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Enter the email address you provided when submitting the complaint
                      </p>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <div className="relative">
                        <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="tel"
                          name="phone"
                          value={trackingData.phone}
                          onChange={handleChange}
                          required
                          className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                          placeholder="+254 707 806 523"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Enter the phone number you used when submitting the complaint
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Complaint ID *
                    </label>
                    <input
                      type="text"
                      name="complaintId"
                      value={trackingData.complaintId}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your complaint reference number"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      This was provided when you submitted your complaint
                    </p>
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Searching...
                  </>
                ) : (
                  <>
                    <FiSearch className="mr-2" />
                    Track Complaint
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Complaint Details */}
      {complaint && (
        <section className="py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Complaint Details</h2>
                    <div className="flex items-center mt-2">
                      <span className="text-blue-100">ID: </span>
                      <span className="font-mono ml-1">
                        {complaint.complaintId || formatComplaintId(complaint._id)}
                      </span>
                      {!complaint.complaintId && (
                        <button
                          onClick={() => setShowFullId(!showFullId)}
                          className="ml-2 text-blue-200 hover:text-white"
                        >
                          {showFullId ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(complaint.status)} bg-opacity-20 text-white`}>
                      {complaint.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Status Description */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <FiAlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-blue-900">Current Status</h3>
                      <p className="text-blue-800 mt-1">{getStatusDescription(complaint.status)}</p>
                    </div>
                  </div>
                </div>

                {/* Basic Info */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Complaint Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <FiClock className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-600">Submitted:</span>
                        <span className="ml-2 text-sm font-medium">
                          {new Date(complaint.reportedAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      {complaint.plantName && (
                        <div className="flex items-center">
                          <FiDroplet className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-600">Business:</span>
                          <span className="ml-2 text-sm font-medium">{complaint.plantName}</span>
                        </div>
                      )}

                      <div className="flex items-center">
                        <FiUser className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-600">Type:</span>
                        <span className="ml-2 text-sm font-medium capitalize">
                          {complaint.category.replace('_', ' ')}
                        </span>
                      </div>

                      {complaint.location && complaint.location.address && (
                        <div className="flex items-start">
                          <FiMapPin className="w-4 h-4 text-gray-400 mr-2 mt-0.5" />
                          <div>
                            <span className="text-sm text-gray-600">Location:</span>
                            <p className="ml-2 text-sm font-medium">{complaint.location.address}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {complaint.description}
                    </p>
                  </div>
                </div>

                {/* Photos */}
                {complaint.attachments && complaint.attachments.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Submitted Photos ({complaint.attachments.length})
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {complaint.attachments.map((photo, index) => (
                        <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                          <img
                            src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${photo.url}`}
                            alt={`Evidence ${index + 1}`}
                            className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                            onClick={() => window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${photo.url}`, '_blank')}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Timeline */}
                {complaint.timeline && complaint.timeline.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h3>
                    <div className="space-y-3">
                      {complaint.timeline.map((event, index) => (
                        <div key={index} className="flex items-start">
                          <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{event.action}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(event.timestamp).toLocaleDateString()} at{' '}
                              {new Date(event.timestamp).toLocaleTimeString()}
                            </p>
                            {event.notes && (
                              <p className="text-sm text-gray-600 mt-1">{event.notes}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Help Section */}
      <section className="py-12 bg-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Need Help?</h2>
          <p className="text-gray-600 mb-6">
            Can't find your complaint or need to submit a new one?
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
            <h4 className="font-semibold text-blue-900 mb-2">Tracking Methods Available:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li><strong>Tracking Token:</strong> Most secure method - use the token provided when you submitted your complaint</li>
              <li><strong>Email + ID:</strong> Use your email address and complaint ID (for complaints with tracking email provided)</li>
              <li><strong>Phone + ID:</strong> Use your phone number and complaint ID (traditional method)</li>
            </ul>
          </div>
          <div className="flex justify-center space-x-4 flex-wrap gap-3">
            <Link
              to="/complaints"
              className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
            >
              Report New Issue
            </Link>
            <Link
              to="/knowledge-hub?section=water-safety"
              className="inline-flex items-center bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 font-medium"
            >
              Learn About Water Safety
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TrackComplaint;