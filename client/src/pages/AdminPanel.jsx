import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  FiDroplet, FiUsers, FiHome, FiAlertCircle, FiFileText, 
  FiTrendingUp, FiCheckCircle, FiXCircle 
} from 'react-icons/fi';
import api from '../utils/api';
import toast from 'react-hot-toast';

const AdminPanel = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPlants: 0,
    pendingComplaints: 0,
    completedTests: 0
  });
  const [users, setUsers] = useState([]);
  const [plants, setPlants] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check URL parameters for initial tab
    const tabParam = searchParams.get('tab');
    if (tabParam && ['overview', 'users', 'plants', 'complaints'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, plantsRes, complaintsRes] = await Promise.all([
        api.get('/users').catch((error) => {
          console.warn('Could not fetch users:', error.response?.status);
          return { data: { data: { users: [] } } };
        }), // Graceful fallback if users endpoint is forbidden
        api.get('/plants'),
        api.get('/complaints').catch((error) => {
          console.warn('Could not fetch complaints:', error.response?.status, error.response?.data);
          return { data: { data: { complaints: [] } } };
        })
      ]);

      // Handle users response structure properly
      const usersData = usersRes.data?.data?.users || usersRes.data?.users || usersRes.data?.data || usersRes.data || [];
      setUsers(Array.isArray(usersData) ? usersData : []);
      
      // Handle plants response structure properly
      const plantsData = plantsRes.data?.data?.plants || plantsRes.data?.plants || plantsRes.data?.data || plantsRes.data || [];
      setPlants(Array.isArray(plantsData) ? plantsData : []);
      
      const complaintsData = complaintsRes.data?.data?.complaints || complaintsRes.data?.complaints || complaintsRes.data?.data || complaintsRes.data || [];
      setComplaints(Array.isArray(complaintsData) ? complaintsData : []);

      // Calculate stats from actual data
      const calculatedStats = {
        totalUsers: usersData.length,
        totalPlants: plantsData.length,
        pendingComplaints: complaintsData.filter(complaint => ['open', 'pending', 'in-progress'].includes(complaint.status)).length,
        completedTests: 0, // Will need to add lab samples endpoint later
        recentActivity: plantsData.filter(plant => {
          const createdAt = new Date(plant.createdAt);
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          return createdAt >= yesterday;
        }).length,
        complianceRate: 95 // Mock for now
      };
      
      setStats(calculatedStats);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (plantId) => {
    try {
      await api.patch(`/plants/${plantId}/status`, { status: 'active' });
      toast.success('Plant approved successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to approve plant');
    }
  };

  const handleReject = async (plantId) => {
    try {
      await api.patch(`/plants/${plantId}/status`, { status: 'rejected' });
      toast.success('Plant rejected');
      fetchData();
    } catch (error) {
      toast.error('Failed to reject plant');
    }
  };

  const StatCard = ({ icon, title, value, color, bgColor }) => (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
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
              <span className="text-2xl font-bold text-gray-900">AquaBeacon Admin</span>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h1>
          <p className="text-gray-600">Manage users, plants, and monitor system activity</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<FiUsers size={24} />}
            title="Total Users"
            value={stats.totalUsers}
            color="text-blue-600"
            bgColor="bg-blue-100"
          />
          <StatCard
            icon={<FiHome size={24} />}
            title="Total Plants"
            value={stats.totalPlants}
            color="text-green-600"
            bgColor="bg-green-100"
          />
          <StatCard
            icon={<FiAlertCircle size={24} />}
            title="Pending Complaints"
            value={stats.pendingComplaints}
            color="text-red-600"
            bgColor="bg-red-100"
          />
          <StatCard
            icon={<FiFileText size={24} />}
            title="Completed Tests"
            value={stats.completedTests}
            color="text-purple-600"
            bgColor="bg-purple-100"
          />
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {['overview', 'users', 'plants', 'complaints'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">System Overview</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">Recent Activity</h4>
                      <p className="text-sm text-gray-600">
                        Last 24 hours: {stats.recentActivity || 0} new registrations
                      </p>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">Compliance Rate</h4>
                      <p className="text-sm text-gray-600">
                        Current: {stats.complianceRate || '95'}%
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Actions</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <span className="text-sm text-yellow-800">
                        {plants.filter(p => p.status === 'pending').length} plants awaiting approval
                      </span>
                      <button
                        onClick={() => setActiveTab('plants')}
                        className="text-yellow-700 hover:text-yellow-900 font-medium text-sm"
                      >
                        Review →
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                      <span className="text-sm text-red-800">
                        {complaints.filter(c => c.status === 'pending').length} complaints need attention
                      </span>
                      <button
                        onClick={() => setActiveTab('complaints')}
                        className="text-red-700 hover:text-red-900 font-medium text-sm"
                      >
                        Review →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">User Management</h3>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Role
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                          <tr key={user._id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {user.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                {user.role}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                user.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {user.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Plants Tab */}
            {activeTab === 'plants' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Plant Approvals</h3>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {plants.filter(p => p.status === 'pending').length === 0 ? (
                      <p className="text-gray-600 text-center py-8">No pending plant approvals</p>
                    ) : (
                      plants
                        .filter(p => p.status === 'pending')
                        .map((plant) => (
                          <div
                            key={plant._id}
                            className="border border-gray-200 rounded-lg p-4"
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 mb-1">
                                  {plant.name}
                                </h4>
                                <p className="text-sm text-gray-600 mb-2">
                                  {plant.location?.address ? 
                                    `${plant.location.address.street}, ${plant.location.address.city}, ${plant.location.address.county}` 
                                    : 'Address not specified'
                                  }
                                </p>
                                <div className="flex items-center space-x-4 text-sm text-gray-600">
                                  <span>Type: {plant.businessType}</span>
                                  <span>Capacity: {plant.capacity?.dailyProduction || 'N/A'} L/day</span>
                                  <span>Owner: {plant.owner?.firstName} {plant.owner?.lastName}</span>
                                </div>
                                <div className="mt-2 text-xs text-gray-500">
                                  <span>Contact: {plant.contactPerson?.name} - {plant.contactPerson?.phone}</span>
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleApprove(plant._id)}
                                  className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 flex items-center"
                                >
                                  <FiCheckCircle className="w-4 h-4 mr-1" />
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleReject(plant._id)}
                                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 flex items-center"
                                >
                                  <FiXCircle className="w-4 h-4 mr-1" />
                                  Reject
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Complaints Tab */}
            {activeTab === 'complaints' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Complaint Management</h3>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {complaints.length === 0 ? (
                      <p className="text-gray-600 text-center py-8">No complaints to review</p>
                    ) : (
                      complaints.map((complaint) => (
                        <div
                          key={complaint._id}
                          className="border border-gray-200 rounded-lg p-4"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h4 className="font-semibold text-gray-900">
                                  {complaint.complaintType}
                                </h4>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  complaint.status === 'resolved'
                                    ? 'bg-green-100 text-green-800'
                                    : complaint.status === 'investigating'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {complaint.status}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">
                                {complaint.description}
                              </p>
                              <div className="flex items-center space-x-4 text-xs text-gray-500">
                                <span>From: {complaint.consumerName}</span>
                                <span>Reported: {complaint.reportedAt ? new Date(complaint.reportedAt).toLocaleString() : new Date(complaint.createdAt).toLocaleString()}</span>
                              </div>
                            </div>
                            <button className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                              View Details →
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;