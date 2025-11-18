import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCalendar, FiFileText, FiCheckCircle, FiClock } from 'react-icons/fi';
import AquaBeaconLogo from '../components/AquaBeaconLogo';
import api from '../utils/api';
import toast from 'react-hot-toast';

const LabBooking = () => {
  const navigate = useNavigate();
  const [plants, setPlants] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({
    plantId: '',
    testType: 'routine',
    sampleType: 'raw',
    preferredDate: '',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [plantsRes, bookingsRes] = await Promise.all([
        api.get('/plants'),
        api.get('/lab-samples')
      ]);
      
      // Handle different possible response structures
      const plantsData = plantsRes.data?.data?.plants || plantsRes.data?.plants || plantsRes.data?.data || plantsRes.data || [];
      const bookingsData = bookingsRes.data?.data?.samples || bookingsRes.data?.samples || bookingsRes.data?.data || bookingsRes.data || [];
      
      setPlants(Array.isArray(plantsData) ? plantsData : []);
      setBookings(Array.isArray(bookingsData) ? bookingsData : []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
      // Ensure arrays remain arrays even on error
      setPlants([]);
      setBookings([]);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/lab-samples', formData);
      toast.success('Lab test booking submitted successfully!');
      setShowForm(false);
      fetchData();
      setFormData({
        plantId: '',
        testType: 'routine',
        sampleType: 'raw',
        preferredDate: '',
        notes: ''
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to book lab test');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <AquaBeaconLogo size="md" />
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Lab Test Booking</h1>
          <p className="text-gray-600">Schedule water quality tests for your facilities</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Scheduled Tests</p>
                <p className="text-3xl font-bold text-gray-900">
                  {Array.isArray(bookings) ? bookings.filter(b => b.status === 'scheduled').length : 0}
                </p>
              </div>
              <div className="bg-yellow-100 text-yellow-600 p-3 rounded-lg">
                <FiCalendar size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">In Progress</p>
                <p className="text-3xl font-bold text-gray-900">
                  {Array.isArray(bookings) ? bookings.filter(b => b.status === 'in_progress').length : 0}
                </p>
              </div>
              <div className="bg-blue-100 text-blue-600 p-3 rounded-lg">
                <FiClock size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Completed</p>
                <p className="text-3xl font-bold text-gray-900">
                  {Array.isArray(bookings) ? bookings.filter(b => b.status === 'completed').length : 0}
                </p>
              </div>
              <div className="bg-green-100 text-green-600 p-3 rounded-lg">
                <FiCheckCircle size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Book New Test Button */}
        {!showForm && (
          <div className="mb-8">
            <button
              onClick={() => setShowForm(true)}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 font-medium flex items-center"
            >
              <FiCalendar className="w-5 h-5 mr-2" />
              Book New Lab Test
            </button>
          </div>
        )}

        {/* Booking Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">New Lab Test Booking</h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-600 hover:text-gray-900"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Plant *
                </label>
                <select
                  name="plantId"
                  value={formData.plantId}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Choose a plant</option>
                  {Array.isArray(plants) && plants.map((plant) => (
                    <option key={plant._id} value={plant._id}>
                      {plant.businessName} - {plant.location?.city}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Test Type *
                  </label>
                  <select
                    name="testType"
                    value={formData.testType}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="routine">Routine Quality Check</option>
                    <option value="compliance">KEBS Compliance Test</option>
                    <option value="microbiology">Microbiological Analysis</option>
                    <option value="chemical">Chemical Analysis</option>
                    <option value="full">Full Comprehensive Test</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sample Type *
                  </label>
                  <select
                    name="sampleType"
                    value={formData.sampleType}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="raw">Raw Water</option>
                    <option value="treated">Treated Water</option>
                    <option value="bottled">Bottled Product</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preferred Date *
                </label>
                <input
                  type="date"
                  name="preferredDate"
                  value={formData.preferredDate}
                  onChange={handleChange}
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Any specific requirements or concerns..."
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Lab tests typically take 3-5 business days for results. 
                  You'll be notified via email and SMS once results are ready.
                </p>
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Submitting...' : 'Submit Booking'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Bookings List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Lab Test Bookings</h2>

          {!Array.isArray(bookings) || bookings.length === 0 ? (
            <div className="text-center py-12">
              <FiFileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No lab test bookings yet</p>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                <FiCalendar className="w-4 h-4 mr-2" />
                Book Your First Test
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {Array.isArray(bookings) && bookings.map((booking) => (
                <div
                  key={booking._id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {booking.testType?.toUpperCase()} - {booking.sampleType}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                          {booking.status?.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        Plant: {booking.plant?.businessName || 'N/A'}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center">
                          <FiCalendar className="w-4 h-4 mr-1" />
                          Scheduled: {booking.scheduledDate ? new Date(booking.scheduledDate).toLocaleDateString() : 'TBD'}
                        </span>
                        {booking.completedDate && (
                          <span className="flex items-center">
                            <FiCheckCircle className="w-4 h-4 mr-1" />
                            Completed: {new Date(booking.completedDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <button className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                      View Details →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LabBooking;