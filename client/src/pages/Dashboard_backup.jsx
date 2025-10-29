import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiHome, FiDroplet, FiFileText, FiAlertCircle, FiCheckCircle, 
  FiClock, FiTrendingUp, FiUsers, FiSettings, FiLogOut, FiX, FiMapPin, FiPhone, FiMail 
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [plants, setPlants] = useState([]);
  const [stats, setStats] = useState({
    totalPlants: 0,
    activePermits: 0,
    pendingTests: 0,
    complaints: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [showPlantModal, setShowPlantModal] = useState(false);
  const [complaints, setComplaints] = useState([]);
  const [permits, setPermits] = useState([]);
  const [labTests, setLabTests] = useState([]);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [selectedStatType, setSelectedStatType] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [plantsRes, complaintsRes, permitsRes, labTestsRes] = await Promise.all([
        api.get('/plants'),
        api.get('/complaints').catch(() => ({ data: [] })),
        api.get('/permits').catch(() => ({ data: [] })),
        api.get('/lab-samples').catch(() => ({ data: [] }))
      ]);
      
      // Handle different possible response structures for all data types
      const plantsData = plantsRes.data?.data?.plants || plantsRes.data?.plants || plantsRes.data?.data || plantsRes.data || [];
      const complaintsData = complaintsRes.data?.data?.complaints || complaintsRes.data?.complaints || complaintsRes.data?.data || complaintsRes.data || [];
      const permitsData = permitsRes.data?.data?.permits || permitsRes.data?.permits || permitsRes.data?.data || permitsRes.data || [];
      const labTestsData = labTestsRes.data?.data?.labSamples || labTestsRes.data?.labSamples || labTestsRes.data?.data || labTestsRes.data || [];
      
      // Ensure all data are arrays
      const safeplantsData = Array.isArray(plantsData) ? plantsData : [];
      const safeComplaintsData = Array.isArray(complaintsData) ? complaintsData : [];
      const safePermitsData = Array.isArray(permitsData) ? permitsData : [];
      const safeLabTestsData = Array.isArray(labTestsData) ? labTestsData : [];
      
      setPlants(safeplantsData);
      setComplaints(safeComplaintsData);
      setPermits(safePermitsData);
      setLabTests(safeLabTestsData);

      // Calculate real statistics using safe arrays
      const calculatedStats = {
        totalPlants: safeplantsData.length,
        activePermits: safePermitsData.filter(permit => permit.status === 'active').length,
        pendingTests: safeLabTestsData.filter(test => ['pending', 'in-progress'].includes(test.status)).length,
        openComplaints: safeComplaintsData.filter(complaint => ['open', 'pending', 'in-progress'].includes(complaint.status)).length
      };
      
      setStats(calculatedStats);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
      // Ensure arrays remain arrays even on error
      setPlants([]);
      setComplaints([]);
      setPermits([]);
      setLabTests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewPlantDetails = (plant) => {
    setSelectedPlant(plant);
    setShowPlantModal(true);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'active': return 'Active';
      case 'pending': return 'Pending Approval';
      case 'suspended': return 'Suspended';
      case 'closed': return 'Closed';
      default: return 'Pending Approval';
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  const handleStatClick = (statType) => {
    setSelectedStatType(statType);
    setShowStatsModal(true);
  };

  const StatCard = ({ icon, title, value, color, bgColor, onClick, statType }) => (
    <div 
      className={`bg-white p-6 rounded-lg shadow-md transition-all duration-200 ${onClick ? 'cursor-pointer hover:shadow-lg hover:scale-105' : ''}`}
      onClick={() => onClick && onClick(statType)}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {onClick && (
            <p className="text-xs text-gray-500 mt-1">Click for details</p>
          )}
        </div>
        <div className={`${bgColor} ${color} p-3 rounded-lg`}>
          {icon}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <FiDroplet className="w-8 h-8 text-primary-600" />
              <span className="text-2xl font-bold text-gray-900">AquaBeacon</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, <span className="font-medium">{user?.name}</span>
              </span>
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900 flex items-center space-x-1"
              >
                <FiLogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Overview of your water business operations</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<FiHome size={24} />}
            title="Total Plants"
            value={stats.totalPlants}
            color="text-blue-600"
            bgColor="bg-blue-100"
            onClick={handleStatClick}
            statType="plants"
          />
          <StatCard
            icon={<FiCheckCircle size={24} />}
            title="Active Permits"
            value={stats.activePermits}
            color="text-green-600"
            bgColor="bg-green-100"
            onClick={handleStatClick}
            statType="permits"
          />
          <StatCard
            icon={<FiClock size={24} />}
            title="Pending Tests"
            value={stats.pendingTests}
            color="text-yellow-600"
            bgColor="bg-yellow-100"
            onClick={handleStatClick}
            statType="tests"
          />
          <StatCard
            icon={<FiAlertCircle size={24} />}
            title="Open Complaints"
            value={stats.openComplaints}
            color="text-red-600"
            bgColor="bg-red-100"
            onClick={handleStatClick}
            statType="complaints"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/plants/setup"
              className="flex items-center space-x-3 p-4 border-2 border-primary-200 rounded-lg hover:bg-primary-50 transition-colors"
            >
              <FiDroplet className="w-6 h-6 text-primary-600" />
              <div>
                <p className="font-medium text-gray-900">Setup New Plant</p>
                <p className="text-sm text-gray-600">Register a new facility</p>
              </div>
            </Link>
            <Link
              to="/lab-booking"
              className="flex items-center space-x-3 p-4 border-2 border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <FiFileText className="w-6 h-6 text-blue-600" />
              <div>
                <p className="font-medium text-gray-900">Book Lab Test</p>
                <p className="text-sm text-gray-600">Schedule water quality test</p>
              </div>
            </Link>
            <Link
              to="/complaints/submit"
              className="flex items-center space-x-3 p-4 border-2 border-orange-200 rounded-lg hover:bg-orange-50 transition-colors"
            >
              <FiAlertCircle className="w-6 h-6 text-orange-600" />
              <div>
                <p className="font-medium text-gray-900">Report Issue</p>
                <p className="text-sm text-gray-600">Submit a complaint</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Plants List */}
        <div id="plants-section" className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Your Plants</h2>
            <Link
              to="/plants/setup"
              className="text-primary-600 hover:text-primary-700 font-medium text-sm"
            >
              + Add New Plant
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : plants.length === 0 ? (
            <div className="text-center py-12">
              <FiDroplet className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No plants registered yet</p>
              <Link
                to="/plants/setup"
                className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                <FiDroplet className="w-4 h-4 mr-2" />
                Register Your First Plant
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {Array.isArray(plants) && plants.map((plant) => (
                <div
                  key={plant._id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{plant.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {plant.location?.address ? 
                          `${plant.location.address.street}, ${plant.location.address.city}, ${plant.location.address.county}` 
                          : 'Address not specified'
                        }
                      </p>
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="flex items-center text-gray-600">
                          <FiDroplet className="w-4 h-4 mr-1" />
                          Capacity: {plant.capacity?.dailyProduction || 'N/A'} L/day
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(plant.status)}`}>
                          {getStatusText(plant.status)}
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleViewPlantDetails(plant)}
                      className="text-primary-600 hover:text-primary-700 font-medium text-sm transition-colors"
                    >
                      View Details →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Plant Details Modal */}
      {showPlantModal && selectedPlant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">{selectedPlant.name}</h2>
              <button
                onClick={() => setShowPlantModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Status */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Status</h3>
                <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedPlant.status)}`}>
                  {getStatusText(selectedPlant.status)}
                </span>
              </div>

              {/* Location Information */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Location</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex items-start space-x-2">
                    <FiMapPin className="w-4 h-4 mt-0.5 text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-900">
                        {selectedPlant.location?.address ? 
                          `${selectedPlant.location.address.street}, ${selectedPlant.location.address.city}, ${selectedPlant.location.address.county}` 
                          : 'Address not specified'
                        }
                      </p>
                      {selectedPlant.location?.coordinates && (
                        <p className="text-xs text-gray-600 mt-1">
                          Coordinates: {selectedPlant.location.coordinates[1]}, {selectedPlant.location.coordinates[0]}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Contact Information</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center space-x-2">
                    <FiUsers className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-900">{selectedPlant.contactPerson?.name || 'Not specified'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FiPhone className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-900">{selectedPlant.contactPerson?.phone || 'Not specified'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FiMail className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-900">{selectedPlant.contactPerson?.email || 'Not specified'}</span>
                  </div>
                </div>
              </div>

              {/* Production Information */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Production Details</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Daily Production Capacity:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {selectedPlant.capacity?.dailyProduction ? `${selectedPlant.capacity.dailyProduction} L/day` : 'Not specified'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Storage Capacity:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {selectedPlant.capacity?.storageCapacity ? `${selectedPlant.capacity.storageCapacity} L` : 'Not specified'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Water Source:</span>
                    <span className="text-sm font-medium text-gray-900 capitalize">
                      {selectedPlant.waterSource?.type || 'Not specified'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Employees:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {selectedPlant.employees?.total || 'Not specified'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Registration Information */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Registration</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Registration Number:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {selectedPlant.registrationNumber || 'Pending assignment'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Created:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {selectedPlant.createdAt ? new Date(selectedPlant.createdAt).toLocaleDateString() : 'Not available'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
              <button
                onClick={() => setShowPlantModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Close
              </button>
              <Link
                to="/plants/setup"
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                onClick={() => setShowPlantModal(false)}
              >
                Edit Plant
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Stats Details Modal */}
      {showStatsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">
                {selectedStatType === 'plants' && `Your Plants (${stats.totalPlants})`}
                {selectedStatType === 'permits' && `Active Permits (${stats.activePermits})`}
                {selectedStatType === 'tests' && `Pending Lab Tests (${stats.pendingTests})`}
                {selectedStatType === 'complaints' && `Open Complaints (${stats.openComplaints})`}
              </h2>
              <button
                onClick={() => setShowStatsModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6">
              {selectedStatType === 'plants' && (
                <div className="space-y-4">
                  {plants.length === 0 ? (
                    <p className="text-gray-600 text-center py-8">No plants registered yet</p>
                  ) : (
                    plants.map((plant) => (
                      <div key={plant._id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-gray-900">{plant.name}</h3>
                            <p className="text-sm text-gray-600">
                              {plant.location?.address ? 
                                `${plant.location.address.street}, ${plant.location.address.city}, ${plant.location.address.county}` 
                                : 'Address not specified'
                              }
                            </p>
                            <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
                              <span>Capacity: {plant.capacity?.dailyProduction || 'N/A'} L/day</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(plant.status)}`}>
                                {getStatusText(plant.status)}
                              </span>
                            </div>
                          </div>
                          <button 
                            onClick={() => {
                              setShowStatsModal(false);
                              handleViewPlantDetails(plant);
                            }}
                            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {selectedStatType === 'permits' && (
                <div className="space-y-4">
                  {permits.filter(p => p.status === 'active').length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-600 mb-4">No active permits found</p>
                      <p className="text-sm text-gray-500">Active permits will appear here once issued</p>
                    </div>
                  ) : (
                    permits.filter(p => p.status === 'active').map((permit) => (
                      <div key={permit._id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-gray-900">{permit.type || 'Water Permit'}</h3>
                            <p className="text-sm text-gray-600">Permit ID: {permit.permitNumber || permit._id}</p>
                            <p className="text-sm text-gray-600">Issue Date: {permit.issueDate ? new Date(permit.issueDate).toLocaleDateString() : 'N/A'}</p>
                            <p className="text-sm text-gray-600">Expires: {permit.expiryDate ? new Date(permit.expiryDate).toLocaleDateString() : 'N/A'}</p>
                          </div>
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                            Active
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {selectedStatType === 'tests' && (
                <div className="space-y-4">
                  {labTests.filter(t => ['pending', 'in-progress'].includes(t.status)).length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-600 mb-4">No pending lab tests</p>
                      <Link 
                        to="/lab-booking"
                        className="text-primary-600 hover:text-primary-700 font-medium"
                        onClick={() => setShowStatsModal(false)}
                      >
                        Book a new lab test →
                      </Link>
                    </div>
                  ) : (
                    labTests.filter(t => ['pending', 'in-progress'].includes(t.status)).map((test) => (
                      <div key={test._id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-gray-900">{test.testType || 'Water Quality Test'}</h3>
                            <p className="text-sm text-gray-600">Sample ID: {test.sampleId || test._id}</p>
                            <p className="text-sm text-gray-600">Requested: {test.createdAt ? new Date(test.createdAt).toLocaleDateString() : 'N/A'}</p>
                            <p className="text-sm text-gray-600">Expected: {test.expectedDate ? new Date(test.expectedDate).toLocaleDateString() : 'TBD'}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            test.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {test.status === 'pending' ? 'Pending' : 'In Progress'}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {selectedStatType === 'complaints' && (
                <div className="space-y-4">
                  {complaints.filter(c => ['open', 'pending', 'in-progress'].includes(c.status)).length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-600 mb-4">No open complaints</p>
                      <Link 
                        to="/report-issue"
                        className="text-primary-600 hover:text-primary-700 font-medium"
                        onClick={() => setShowStatsModal(false)}
                      >
                        Report an issue →
                      </Link>
                    </div>
                  ) : (
                    complaints.filter(c => ['open', 'pending', 'in-progress'].includes(c.status)).map((complaint) => (
                      <div key={complaint._id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-gray-900">{complaint.title || complaint.complaintType}</h3>
                            <p className="text-sm text-gray-600 mb-2">{complaint.description}</p>
                            <p className="text-sm text-gray-600">Submitted: {complaint.createdAt ? new Date(complaint.createdAt).toLocaleDateString() : 'N/A'}</p>
                            <p className="text-sm text-gray-600">Priority: {complaint.priority || 'Normal'}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            complaint.status === 'open' ? 'bg-red-100 text-red-800' : 
                            complaint.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {complaint.status || 'Open'}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
              <button
                onClick={() => setShowStatsModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Close
              </button>
              {selectedStatType === 'plants' && (
                <Link
                  to="/plants/setup"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  onClick={() => setShowStatsModal(false)}
                >
                  Add New Plant
                </Link>
              )}
              {selectedStatType === 'tests' && (
                <Link
                  to="/lab-booking"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  onClick={() => setShowStatsModal(false)}
                >
                  Book Lab Test
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;