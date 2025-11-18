import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FiHome, FiDroplet, FiFileText, FiAlertCircle, FiCheckCircle, 
  FiClock, FiTrendingUp, FiUsers, FiSettings, FiLogOut, FiX, FiMapPin, FiPhone, FiMail 
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import AquaBeaconLogo from '../components/AquaBeaconLogo';
import api from '../utils/api';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // Redirect admins to admin panel
  useEffect(() => {
    if (user?.role === 'admin') {
      navigate('/admin', { replace: true });
    }
  }, [user, navigate]);
  const [plants, setPlants] = useState([]);
  const [stats, setStats] = useState({
    totalPlants: 0,
    activePermits: 0,
    pendingTests: 0,
    complaints: 0
  });
  const [inspectorStats, setInspectorStats] = useState({
    pendingApprovals: 0,
    scheduledInspections: 0,
    completedInspections: 0,
    totalPlants: 0,
    openComplaints: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [showPlantModal, setShowPlantModal] = useState(false);
  const [complaints, setComplaints] = useState([]);
  const [permits, setPermits] = useState([]);
  const [labTests, setLabTests] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [selectedStatType, setSelectedStatType] = useState('');
  
  // Inspector-specific modal states
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [complaintAction, setComplaintAction] = useState(''); // 'approve', 'reject', 'status'

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      if (user?.role === 'inspector') {
        // Fetch inspector-specific data
        const [plantsRes, complaintsRes] = await Promise.all([
          api.get('/plants'),
          api.get('/complaints').catch((error) => {
            console.warn('Could not fetch complaints:', error.response?.status, error.response?.data);
            return { data: { data: { complaints: [] } } };
          })
          // Note: /api/inspections endpoint doesn't exist yet, using mock data
        ]);
        
        const plantsData = plantsRes.data?.data?.plants || plantsRes.data?.plants || plantsRes.data?.data || plantsRes.data || [];
        const complaintsData = complaintsRes.data?.data?.complaints || complaintsRes.data?.complaints || complaintsRes.data?.data || complaintsRes.data || [];
        
        // Mock inspections data until API endpoint is created
        const mockInspectionsData = [
          {
            _id: '1',
            plantName: 'AquaPure Kenya Ltd',
            business: 'AquaPure Kenya Ltd',
            status: 'scheduled',
            type: 'Routine Inspection',
            scheduledDate: new Date('2024-11-05'),
            location: 'Thika Industrial Area'
          },
          {
            _id: '2',
            plantName: 'Fresh Springs Water Co.',
            business: 'Fresh Springs Water Co.',
            status: 'completed',
            type: 'Follow-up Inspection',
            completedDate: new Date('2024-10-25'),
            location: 'Nakuru Industrial Area',
            score: 87
          },
          {
            _id: '3',
            plantName: 'Clear Water Ltd',
            business: 'Clear Water Ltd',
            status: 'scheduled',
            type: 'License Renewal Inspection',
            scheduledDate: new Date('2024-11-10'),
            location: 'Mombasa Road'
          }
        ];
        
        const safeplantsData = Array.isArray(plantsData) ? plantsData : [];
        const safeComplaintsData = Array.isArray(complaintsData) ? complaintsData : [];
        const safeInspectionsData = Array.isArray(mockInspectionsData) ? mockInspectionsData : [];
        
        setPlants(safeplantsData);
        setComplaints(safeComplaintsData);
        setInspections(safeInspectionsData);

        // Calculate inspector-specific statistics
        const inspectorCalculatedStats = {
          pendingApprovals: safeplantsData.filter(plant => plant.status === 'pending').length,
          scheduledInspections: safeInspectionsData.filter(insp => insp.status === 'scheduled').length,
          completedInspections: safeInspectionsData.filter(insp => insp.status === 'completed').length,
          totalPlants: safeplantsData.length,
          openComplaints: safeComplaintsData.filter(complaint => ['open', 'pending', 'in-progress'].includes(complaint.status)).length
        };
        
        setInspectorStats(inspectorCalculatedStats);
      } else {
        // Fetch owner-specific data
        const [plantsRes, complaintsRes, permitsRes, labTestsRes] = await Promise.all([
          api.get('/plants'),
          api.get('/complaints').catch((error) => {
            console.warn('Could not fetch complaints:', error.response?.status, error.response?.data);
            return { data: { data: { complaints: [] } } };
          }),
          api.get('/permits').catch(() => ({ data: [] })),
          api.get('/lab-samples').catch(() => ({ data: [] }))
        ]);
        
        const plantsData = plantsRes.data?.data?.plants || plantsRes.data?.plants || plantsRes.data?.data || plantsRes.data || [];
        const complaintsData = complaintsRes.data?.data?.complaints || complaintsRes.data?.complaints || complaintsRes.data?.data || complaintsRes.data || [];
        const permitsData = permitsRes.data?.data?.permits || permitsRes.data?.permits || permitsRes.data?.data || permitsRes.data || [];
        const labTestsData = labTestsRes.data?.data?.labSamples || labTestsRes.data?.labSamples || labTestsRes.data?.data || labTestsRes.data || [];
        
        const safeplantsData = Array.isArray(plantsData) ? plantsData : [];
        const safeComplaintsData = Array.isArray(complaintsData) ? complaintsData : [];
        const safePermitsData = Array.isArray(permitsData) ? permitsData : [];
        const safeLabTestsData = Array.isArray(labTestsData) ? labTestsData : [];
        
        setPlants(safeplantsData);
        setComplaints(safeComplaintsData);
        setPermits(safePermitsData);
        setLabTests(safeLabTestsData);

        // Calculate owner statistics
        const calculatedStats = {
          totalPlants: safeplantsData.length,
          activePermits: safePermitsData.filter(permit => permit.status === 'active').length,
          pendingTests: safeLabTestsData.filter(test => ['pending', 'in-progress'].includes(test.status)).length,
          openComplaints: safeComplaintsData.filter(complaint => ['open', 'pending', 'in-progress'].includes(complaint.status)).length
        };
        
        setStats(calculatedStats);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
      // Ensure arrays remain arrays even on error
      setPlants([]);
      setComplaints([]);
      setPermits([]);
      setLabTests([]);
      setInspections([]);
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

  // Inspector-specific functions
  const handleApprovePlant = async (plantId) => {
    try {
      const response = await api.put(`/plants/${plantId}/approve`);
      if (response.data.success) {
        toast.success('Plant approved successfully');
        fetchDashboardData(); // Refresh data
      }
    } catch (error) {
      console.error('Error approving plant:', error);
      toast.error('Failed to approve plant');
    }
  };

  const handleRejectPlant = async (plantId, reason) => {
    try {
      const response = await api.put(`/plants/${plantId}/reject`, { reason });
      if (response.data.success) {
        toast.success('Plant rejected successfully');
        fetchDashboardData(); // Refresh data
      }
    } catch (error) {
      console.error('Error rejecting plant:', error);
      toast.error('Failed to reject plant');
    }
  };

  const handleComplaintAction = (complaint, action) => {
    setSelectedComplaint(complaint);
    setComplaintAction(action);
    setShowComplaintModal(true);
  };

  const updateComplaintStatus = async (complaintId, status, notes = '') => {
    try {
      const response = await api.put(`/inspector/complaints/${complaintId}/status`, {
        status,
        notes,
        actionTaken: `Status changed to ${status}`
      });
      if (response.data.success) {
        toast.success('Complaint status updated successfully');
        setShowComplaintModal(false);
        fetchDashboardData(); // Refresh data
      }
    } catch (error) {
      console.error('Error updating complaint status:', error);
      toast.error('Failed to update complaint status');
    }
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
            <div className="flex items-center">
              <Link to="/">
                <AquaBeaconLogo size="sm" />
              </Link>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {user?.role === 'inspector' ? 'Inspector Dashboard' : 'Dashboard'}
          </h1>
          <p className="text-gray-600">
            {user?.role === 'inspector' 
              ? 'Monitor plant approvals and conduct inspections' 
              : 'Overview of your water business operations'
            }
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {user?.role === 'inspector' ? (
            <>
              <StatCard
                icon={<FiClock size={24} />}
                title="Pending Approvals"
                value={inspectorStats.pendingApprovals}
                color="text-orange-600"
                bgColor="bg-orange-100"
                onClick={handleStatClick}
                statType="pending-approvals"
              />
              <StatCard
                icon={<FiFileText size={24} />}
                title="Scheduled Inspections"
                value={inspectorStats.scheduledInspections}
                color="text-blue-600"
                bgColor="bg-blue-100"
                onClick={handleStatClick}
                statType="scheduled-inspections"
              />
              <StatCard
                icon={<FiCheckCircle size={24} />}
                title="Completed Inspections"
                value={inspectorStats.completedInspections}
                color="text-green-600"
                bgColor="bg-green-100"
                onClick={handleStatClick}
                statType="completed-inspections"
              />
              <StatCard
                icon={<FiHome size={24} />}
                title="Total Plants"
                value={inspectorStats.totalPlants}
                color="text-purple-600"
                bgColor="bg-purple-100"
                onClick={handleStatClick}
                statType="all-plants"
              />
            </>
          ) : (
            <>
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
            </>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {user?.role === 'inspector' ? (
              <>
                <Link
                  to="/admin"
                  className="flex items-center space-x-3 p-4 border-2 border-orange-200 rounded-lg hover:bg-orange-50 transition-colors"
                >
                  <FiClock className="w-6 h-6 text-orange-600" />
                  <div>
                    <p className="font-medium text-gray-900">Review Pending Plants</p>
                    <p className="text-sm text-gray-600">Approve new facility registrations</p>
                  </div>
                </Link>
                <Link
                  to="/inspections"
                  className="flex items-center space-x-3 p-4 border-2 border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <FiFileText className="w-6 h-6 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">Manage Inspections</p>
                    <p className="text-sm text-gray-600">Schedule and conduct inspections</p>
                  </div>
                </Link>
                <Link
                  to="/inspector/complaints"
                  className="flex items-center space-x-3 p-4 border-2 border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <FiAlertCircle className="w-6 h-6 text-red-600" />
                  <div>
                    <p className="font-medium text-gray-900">Manage Complaints</p>
                    <p className="text-sm text-gray-600">Investigate and resolve quality issues</p>
                  </div>
                </Link>
                <Link
                  to="/admin?tab=complaints"
                  className="flex items-center space-x-3 p-4 border-2 border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <FiAlertCircle className="w-6 h-6 text-red-600" />
                  <div>
                    <p className="font-medium text-gray-900">Review Complaints</p>
                    <p className="text-sm text-gray-600">Access admin panel for complaints</p>
                  </div>
                </Link>
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>

        {/* Main Content - Plants List or Pending Approvals */}
        <div id="plants-section" className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {user?.role === 'inspector' ? 'Pending Plant Approvals' : 'Your Plants'}
            </h2>
            {user?.role === 'inspector' ? (
              <Link
                to="/admin"
                className="text-primary-600 hover:text-primary-700 font-medium text-sm"
              >
                View All Plants →
              </Link>
            ) : (
              <Link
                to="/plants/setup"
                className="text-primary-600 hover:text-primary-700 font-medium text-sm"
              >
                + Add New Plant
              </Link>
            )}
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : (user?.role === 'inspector' ? 
            // Inspector view - show pending plants
            (plants.filter(p => p.status === 'pending').length === 0 ? (
              <div className="text-center py-12">
                <FiCheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No pending plant approvals</p>
                <Link
                  to="/admin"
                  className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  <FiFileText className="w-4 h-4 mr-2" />
                  Go to Admin Panel
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {plants.filter(p => p.status === 'pending').map((plant) => (
                  <div
                    key={plant._id}
                    className="border border-orange-200 rounded-lg p-4 hover:shadow-md transition-shadow"
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
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            Pending Approval
                          </span>
                        </div>
                        <div className="mt-2 text-xs text-gray-500">
                          Owner: {plant.owner?.firstName} {plant.owner?.lastName} | 
                          Contact: {plant.contactPerson?.phone}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleViewPlantDetails(plant)}
                          className="px-3 py-1 text-blue-600 hover:text-blue-700 border border-blue-600 rounded text-sm transition-colors hover:bg-blue-50"
                        >
                          Review
                        </button>
                        <button 
                          onClick={() => handleApprovePlant(plant._id)}
                          className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => handleRejectPlant(plant._id, 'Rejected by inspector')}
                          className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )) :
            // Owner view - show their plants
            (plants.length === 0 ? (
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
            ))
          )}
        </div>

        {/* Inspector Complaints Management Section */}
        {user?.role === 'inspector' && (
          <div className="bg-white rounded-lg shadow-md p-6 mt-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Open Complaints Management</h2>
              <Link
                to="/inspector/complaints"
                className="text-primary-600 hover:text-primary-700 font-medium text-sm"
              >
                View All Complaints →
              </Link>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              </div>
            ) : complaints.filter(c => ['open', 'pending', 'in-progress', 'investigating'].includes(c.status)).length === 0 ? (
              <div className="text-center py-12">
                <FiCheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No open complaints to manage</p>
              </div>
            ) : (
              <div className="space-y-4">
                {complaints
                  .filter(c => ['open', 'pending', 'in-progress', 'investigating'].includes(c.status))
                  .slice(0, 5) // Show only first 5 for dashboard view
                  .map((complaint) => (
                  <div
                    key={complaint._id}
                    className="border border-red-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-gray-900">
                            {complaint.complaintId || `#${complaint._id.slice(-6).toUpperCase()}`}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            complaint.status === 'open' ? 'bg-red-100 text-red-800' :
                            complaint.status === 'investigating' ? 'bg-blue-100 text-blue-800' :
                            complaint.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {complaint.status}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-900 mb-1">{complaint.companyName}</p>
                        <p className="text-sm text-gray-600 mb-2">{complaint.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>From: {complaint.consumerName}</span>
                          <span>Reported: {new Date(complaint.createdAt).toLocaleDateString()}</span>
                          {complaint.assignedTo && (
                            <span>Assigned to: {complaint.assignedTo.firstName} {complaint.assignedTo.lastName}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleComplaintAction(complaint, 'investigating')}
                          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                        >
                          Investigate
                        </button>
                        <button 
                          onClick={() => handleComplaintAction(complaint, 'resolved')}
                          className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                        >
                          Resolve
                        </button>
                        <button 
                          onClick={() => handleComplaintAction(complaint, 'closed')}
                          className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 transition-colors"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
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
                {selectedStatType === 'pending-approvals' && `Pending Approvals (${inspectorStats.pendingApprovals})`}
                {selectedStatType === 'scheduled-inspections' && `Scheduled Inspections (${inspectorStats.scheduledInspections})`}
                {selectedStatType === 'completed-inspections' && `Completed Inspections (${inspectorStats.completedInspections})`}
                {selectedStatType === 'all-plants' && `All Plants (${inspectorStats.totalPlants})`}
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

              {selectedStatType === 'pending-approvals' && (
                <div className="space-y-4">
                  {plants.filter(p => p.status === 'pending').length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-600 mb-4">No pending plant approvals</p>
                      <Link 
                        to="/admin"
                        className="text-primary-600 hover:text-primary-700 font-medium"
                        onClick={() => setShowStatsModal(false)}
                      >
                        Go to Admin Panel →
                      </Link>
                    </div>
                  ) : (
                    plants.filter(p => p.status === 'pending').map((plant) => (
                      <div key={plant._id} className="border border-orange-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-gray-900">{plant.name}</h3>
                            <p className="text-sm text-gray-600">{plant.location?.address?.street}, {plant.location?.address?.city}</p>
                            <p className="text-sm text-gray-600">Owner: {plant.owner?.firstName} {plant.owner?.lastName}</p>
                            <p className="text-sm text-gray-600">Capacity: {plant.capacity?.dailyProduction || 'N/A'} L/day</p>
                            <p className="text-sm text-gray-600">Submitted: {plant.createdAt ? new Date(plant.createdAt).toLocaleDateString() : 'N/A'}</p>
                          </div>
                          <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                            Pending Review
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {selectedStatType === 'scheduled-inspections' && (
                <div className="space-y-4">
                  {inspections.filter(i => i.status === 'scheduled').length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-600 mb-4">No scheduled inspections</p>
                      <Link 
                        to="/inspections"
                        className="text-primary-600 hover:text-primary-700 font-medium"
                        onClick={() => setShowStatsModal(false)}
                      >
                        Schedule new inspection →
                      </Link>
                    </div>
                  ) : (
                    inspections.filter(i => i.status === 'scheduled').map((inspection) => (
                      <div key={inspection._id} className="border border-blue-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-gray-900">{inspection.plantName || inspection.business}</h3>
                            <p className="text-sm text-gray-600">Type: {inspection.type || 'Routine Inspection'}</p>
                            <p className="text-sm text-gray-600">Date: {inspection.scheduledDate ? new Date(inspection.scheduledDate).toLocaleDateString() : 'TBD'}</p>
                            <p className="text-sm text-gray-600">Location: {inspection.location || 'TBD'}</p>
                          </div>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                            Scheduled
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {selectedStatType === 'completed-inspections' && (
                <div className="space-y-4">
                  {inspections.filter(i => i.status === 'completed').length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-600 mb-4">No completed inspections</p>
                      <Link 
                        to="/inspections"
                        className="text-primary-600 hover:text-primary-700 font-medium"
                        onClick={() => setShowStatsModal(false)}
                      >
                        View inspection history →
                      </Link>
                    </div>
                  ) : (
                    inspections.filter(i => i.status === 'completed').map((inspection) => (
                      <div key={inspection._id} className="border border-green-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-gray-900">{inspection.plantName || inspection.business}</h3>
                            <p className="text-sm text-gray-600">Type: {inspection.type || 'Routine Inspection'}</p>
                            <p className="text-sm text-gray-600">Completed: {inspection.completedDate ? new Date(inspection.completedDate).toLocaleDateString() : 'N/A'}</p>
                            <p className="text-sm text-gray-600">Score: {inspection.score || 'N/A'}%</p>
                          </div>
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                            Completed
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {selectedStatType === 'all-plants' && (
                <div className="space-y-4">
                  {plants.length === 0 ? (
                    <p className="text-gray-600 text-center py-8">No plants in system</p>
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
                              <span>Owner: {plant.owner?.firstName} {plant.owner?.lastName}</span>
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
                            <p className="text-sm text-gray-600">Reported: {complaint.reportedAt ? new Date(complaint.reportedAt).toLocaleString() : complaint.createdAt ? new Date(complaint.createdAt).toLocaleString() : 'N/A'}</p>
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
              {selectedStatType === 'pending-approvals' && (
                <Link
                  to="/admin"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  onClick={() => setShowStatsModal(false)}
                >
                  Go to Admin Panel
                </Link>
              )}
              {(selectedStatType === 'scheduled-inspections' || selectedStatType === 'completed-inspections') && (
                <Link
                  to="/inspections"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  onClick={() => setShowStatsModal(false)}
                >
                  Manage Inspections
                </Link>
              )}
              {selectedStatType === 'all-plants' && (
                <Link
                  to="/admin"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  onClick={() => setShowStatsModal(false)}
                >
                  Admin Panel
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

      {/* Complaint Action Modal */}
      {showComplaintModal && selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">
                Update Complaint Status
              </h2>
              <button
                onClick={() => setShowComplaintModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">
                  {selectedComplaint.complaintId || `#${selectedComplaint._id.slice(-6).toUpperCase()}`}
                </h3>
                <p className="text-sm text-gray-600 mb-2">{selectedComplaint.companyName}</p>
                <p className="text-sm text-gray-700">{selectedComplaint.description}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Change status to: <span className="font-bold text-blue-600">{complaintAction}</span>
                </p>
                <p className="text-xs text-gray-500">
                  This will update the complaint status and notify relevant parties.
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
              <button
                onClick={() => setShowComplaintModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => updateComplaintStatus(selectedComplaint._id, complaintAction)}
                className={`px-4 py-2 text-white rounded-lg transition-colors ${
                  complaintAction === 'investigating' ? 'bg-blue-600 hover:bg-blue-700' :
                  complaintAction === 'resolved' ? 'bg-green-600 hover:bg-green-700' :
                  'bg-gray-600 hover:bg-gray-700'
                }`}
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;