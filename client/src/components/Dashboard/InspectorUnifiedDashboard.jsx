import React, { useState, useEffect } from 'react';
import { 
  FiClock, 
  FiFileText, 
  FiCheckCircle, 
  FiHome, 
  FiAlertCircle,
  FiCalendar,
  FiPlus,
  FiEye,
  FiEdit3,
  FiMail,
  FiMapPin,
  FiUser,
  FiPhone,
  FiSend,
  FiCamera,
  FiFilter,
  FiSearch,
  FiXCircle
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const InspectorUnifiedDashboard = ({ user }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    pendingApprovals: 0,
    scheduledInspections: 0,
    completedInspections: 0,
    totalPlants: 0,
    openComplaints: 0
  });
  
  // Data states
  const [plants, setPlants] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [inspectors, setInspectors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');

  // Form states
  const [assignForm, setAssignForm] = useState({ inspectorId: '', notes: '' });
  const [statusForm, setStatusForm] = useState({ status: '', notes: '', actionTaken: '' });
  const [emailForm, setEmailForm] = useState({ template: 'initial_notice', subject: '', customMessage: '', recipientEmail: '' });
  const [visitForm, setVisitForm] = useState({ date: '', time: '', address: '', notes: '' });

  // Filters
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    search: ''
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [plantsRes, complaintsRes, inspectorsRes] = await Promise.all([
        api.get('/plants').catch(() => ({ data: [] })),
        api.get('/inspector/complaints').catch(() => ({ data: { data: { complaints: [] } } })),
        api.get('/inspector/inspectors').catch(() => ({ data: { data: [] } }))
      ]);

      const plantsData = plantsRes.data?.data?.plants || plantsRes.data?.plants || [];
      const complaintsData = complaintsRes.data?.data?.complaints || [];
      const inspectorsData = inspectorsRes.data?.data || [];

      setPlants(Array.isArray(plantsData) ? plantsData : []);
      setComplaints(Array.isArray(complaintsData) ? complaintsData : []);
      setInspectors(Array.isArray(inspectorsData) ? inspectorsData : []);

      // Mock inspections data
      const mockInspections = [
        {
          _id: '1',
          business: 'AquaPure Kenya Ltd',
          date: '2025-11-15',
          time: '09:00 AM',
          type: 'Routine Inspection',
          status: 'scheduled',
          priority: 'medium',
          location: 'Thika Industrial Area'
        },
        {
          _id: '2',
          business: 'Fresh Springs Water Co.',
          date: '2025-11-10',
          time: '02:00 PM',
          type: 'Follow-up Inspection',
          status: 'completed',
          priority: 'high',
          location: 'Nakuru Industrial Area',
          score: 87
        }
      ];
      setInspections(mockInspections);

      // Calculate stats
      const calculatedStats = {
        pendingApprovals: plantsData.filter(plant => plant.status === 'pending').length,
        scheduledInspections: mockInspections.filter(insp => insp.status === 'scheduled').length,
        completedInspections: mockInspections.filter(insp => insp.status === 'completed').length,
        totalPlants: plantsData.length,
        openComplaints: complaintsData.filter(complaint => 
          ['open', 'pending', 'in-progress', 'investigating'].includes(complaint.status)
        ).length
      };
      setStats(calculatedStats);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon, title, value, color, bgColor, onClick, statType }) => (
    <div 
      className={`${bgColor} p-6 rounded-lg cursor-pointer hover:shadow-md transition-shadow`}
      onClick={() => onClick && onClick(statType)}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
        </div>
        <div className={color}>{icon}</div>
      </div>
    </div>
  );

  const handleStatClick = (statType) => {
    switch (statType) {
      case 'pending-approvals':
        setActiveTab('plants');
        break;
      case 'scheduled-inspections':
      case 'completed-inspections':
        setActiveTab('inspections');
        break;
      case 'open-complaints':
        setActiveTab('complaints');
        break;
      default:
        break;
    }
  };

  const openModal = (type, item = null) => {
    setModalType(type);
    setSelectedItem(item);
    setShowModal(true);
    
    // Pre-populate forms based on type and item
    if (type === 'email' && item) {
      setEmailForm(prev => ({
        ...prev,
        recipientEmail: item.companyEmail || ''
      }));
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedItem(null);
    setModalType('');
    // Reset forms
    setAssignForm({ inspectorId: '', notes: '' });
    setStatusForm({ status: '', notes: '', actionTaken: '' });
    setEmailForm({ template: 'initial_notice', subject: '', customMessage: '', recipientEmail: '' });
    setVisitForm({ date: '', time: '', address: '', notes: '' });
  };

  const handleAssignComplaint = async () => {
    try {
      const response = await api.post(`/inspector/complaints/${selectedItem._id}/assign`, assignForm);
      if (response.data.success) {
        toast.success('Complaint assigned successfully');
        closeModal();
        fetchAllData();
      }
    } catch (error) {
      toast.error('Failed to assign complaint');
    }
  };

  const handleUpdateStatus = async () => {
    try {
      const response = await api.put(`/inspector/complaints/${selectedItem._id}/status`, statusForm);
      if (response.data.success) {
        toast.success('Status updated successfully');
        closeModal();
        fetchAllData();
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleSendEmail = async () => {
    try {
      const response = await api.post(`/inspector/complaints/${selectedItem._id}/send-email`, emailForm);
      if (response.data.success) {
        toast.success('Email sent successfully');
        closeModal();
        fetchAllData();
      }
    } catch (error) {
      toast.error('Failed to send email');
    }
  };

  const handleScheduleVisit = async () => {
    try {
      const response = await api.post(`/inspector/complaints/${selectedItem._id}/schedule-visit`, visitForm);
      if (response.data.success) {
        toast.success('Visit scheduled successfully');
        closeModal();
        fetchAllData();
      }
    } catch (error) {
      toast.error('Failed to schedule visit');
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'open':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in-progress':
      case 'investigating':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredComplaints = complaints.filter(complaint => {
    const matchesStatus = !filters.status || complaint.status === filters.status;
    const matchesPriority = !filters.priority || complaint.priority === filters.priority;
    const matchesSearch = !filters.search || 
      complaint.companyName?.toLowerCase().includes(filters.search.toLowerCase()) ||
      complaint.complaintId?.toLowerCase().includes(filters.search.toLowerCase()) ||
      complaint.description?.toLowerCase().includes(filters.search.toLowerCase());
    
    return matchesStatus && matchesPriority && matchesSearch;
  });

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <FiHome className="w-4 h-4" /> },
    { id: 'plants', label: `Plant Approvals (${stats.pendingApprovals})`, icon: <FiClock className="w-4 h-4" /> },
    { id: 'inspections', label: `Inspections (${stats.scheduledInspections})`, icon: <FiFileText className="w-4 h-4" /> },
    { id: 'complaints', label: `Complaints (${stats.openComplaints})`, icon: <FiAlertCircle className="w-4 h-4" /> }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <h2 className="text-xl font-semibold text-gray-900 mt-4">Loading Dashboard...</h2>
          <p className="text-gray-600 mt-2">Please wait while we load your inspector data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Inspector Dashboard</h1>
            <p className="text-gray-600">
              Comprehensive inspector control panel - manage approvals, inspections, and complaints
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <StatCard
              icon={<FiClock size={24} />}
              title="Pending Approvals"
              value={stats.pendingApprovals}
              color="text-orange-600"
              bgColor="bg-orange-100"
              onClick={handleStatClick}
              statType="pending-approvals"
            />
            <StatCard
              icon={<FiFileText size={24} />}
              title="Scheduled Inspections"
              value={stats.scheduledInspections}
              color="text-blue-600"
              bgColor="bg-blue-100"
              onClick={handleStatClick}
              statType="scheduled-inspections"
            />
            <StatCard
              icon={<FiCheckCircle size={24} />}
              title="Completed Inspections"
              value={stats.completedInspections}
              color="text-green-600"
              bgColor="bg-green-100"
              onClick={handleStatClick}
              statType="completed-inspections"
            />
            <StatCard
              icon={<FiAlertCircle size={24} />}
              title="Open Complaints"
              value={stats.openComplaints}
              color="text-red-600"
              bgColor="bg-red-100"
              onClick={handleStatClick}
              statType="open-complaints"
            />
            <StatCard
              icon={<FiHome size={24} />}
              title="Total Plants"
              value={stats.totalPlants}
              color="text-purple-600"
              bgColor="bg-purple-100"
            />
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setActiveTab('plants')}
                  className="flex items-center space-x-3 p-4 border-2 border-orange-200 rounded-lg hover:bg-orange-50 transition-colors"
                >
                  <FiClock className="w-6 h-6 text-orange-600" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Review Pending Plants</p>
                    <p className="text-sm text-gray-600">Approve new facility registrations</p>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('inspections')}
                  className="flex items-center space-x-3 p-4 border-2 border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <FiFileText className="w-6 h-6 text-blue-600" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Manage Inspections</p>
                    <p className="text-sm text-gray-600">Schedule and conduct inspections</p>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('complaints')}
                  className="flex items-center space-x-3 p-4 border-2 border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <FiAlertCircle className="w-6 h-6 text-red-600" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Manage Complaints</p>
                    <p className="text-sm text-gray-600">Investigate and resolve issues</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Plant Applications</h2>
                <div className="space-y-4">
                  {plants.filter(p => p.status === 'pending').slice(0, 3).map((plant) => (
                    <div key={plant._id} className="flex items-center justify-between p-3 border border-orange-200 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{plant.businessName}</p>
                        <p className="text-sm text-gray-600">{plant.location}</p>
                        <p className="text-xs text-gray-500">Submitted: {new Date(plant.createdAt).toLocaleDateString()}</p>
                      </div>
                      <button
                        onClick={() => setActiveTab('plants')}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        Review →
                      </button>
                    </div>
                  ))}
                  {plants.filter(p => p.status === 'pending').length === 0 && (
                    <p className="text-gray-500 text-center py-4">No pending applications</p>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Inspections</h2>
                <div className="space-y-4">
                  {inspections.filter(i => i.status === 'scheduled').slice(0, 3).map((inspection) => (
                    <div key={inspection._id} className="flex items-center justify-between p-3 border border-blue-200 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{inspection.business}</p>
                        <p className="text-sm text-gray-600">{inspection.type}</p>
                        <p className="text-xs text-gray-500">{inspection.date} at {inspection.time}</p>
                      </div>
                      <button
                        onClick={() => setActiveTab('inspections')}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        View →
                      </button>
                    </div>
                  ))}
                  {inspections.filter(i => i.status === 'scheduled').length === 0 && (
                    <p className="text-gray-500 text-center py-4">No scheduled inspections</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Plants Tab */}
        {activeTab === 'plants' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Pending Plant Approvals</h2>
              <Link
                to="/admin"
                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                View All Plants in Admin Panel →
              </Link>
            </div>
            
            <div className="space-y-4">
              {plants.filter(p => p.status === 'pending').length === 0 ? (
                <div className="text-center py-12">
                  <FiCheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No pending plant approvals</p>
                  <Link
                    to="/admin"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <FiFileText className="w-4 h-4 mr-2" />
                    Go to Admin Panel
                  </Link>
                </div>
              ) : (
                plants.filter(p => p.status === 'pending').map((plant) => (
                  <div key={plant._id} className="border border-orange-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{plant.businessName}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-600"><span className="font-medium">Location:</span> {plant.location}</p>
                            <p className="text-sm text-gray-600"><span className="font-medium">Type:</span> {plant.businessType}</p>
                            <p className="text-sm text-gray-600"><span className="font-medium">Capacity:</span> {plant.waterCapacity}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600"><span className="font-medium">Owner:</span> {plant.ownerName}</p>
                            <p className="text-sm text-gray-600"><span className="font-medium">Contact:</span> {plant.contactPhone}</p>
                            <p className="text-sm text-gray-600"><span className="font-medium">Submitted:</span> {new Date(plant.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex space-x-3">
                          <Link
                            to="/admin"
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                          >
                            <FiEye className="w-4 h-4 mr-2" />
                            Review Details
                          </Link>
                          <button className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
                            <FiCheckCircle className="w-4 h-4 mr-2" />
                            Approve
                          </button>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">
                        Pending
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Inspections Tab */}
        {activeTab === 'inspections' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Inspections Management</h2>
                <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <FiPlus className="w-4 h-4 mr-2" />
                  New Inspection
                </button>
              </div>

              {/* Inspection Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <FiCalendar className="w-5 h-5 text-blue-600 mr-3" />
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {inspections.filter(i => i.status === 'scheduled').length}
                      </p>
                      <p className="text-gray-600 text-sm">Scheduled</p>
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <FiCheckCircle className="w-5 h-5 text-green-600 mr-3" />
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {inspections.filter(i => i.status === 'completed').length}
                      </p>
                      <p className="text-gray-600 text-sm">Completed</p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <FiFileText className="w-5 h-5 text-purple-600 mr-3" />
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{inspections.length}</p>
                      <p className="text-gray-600 text-sm">Total</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Inspections List */}
              <div className="space-y-4">
                {inspections.map((inspection) => (
                  <div key={inspection._id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {inspection.business}
                          </h3>
                          <div className="flex gap-2 ml-4">
                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(inspection.status)}`}>
                              {inspection.status}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${getPriorityColor(inspection.priority)}`}>
                              {inspection.priority}
                            </span>
                          </div>
                        </div>
                        
                        <p className="text-gray-600 mb-3">{inspection.type}</p>
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                          <span className="flex items-center"><FiCalendar className="w-4 h-4 mr-1" /> {inspection.date}</span>
                          <span className="flex items-center"><FiClock className="w-4 h-4 mr-1" /> {inspection.time}</span>
                          <span className="flex items-center"><FiMapPin className="w-4 h-4 mr-1" /> {inspection.location}</span>
                          {inspection.score && (
                            <span className="flex items-center"><FiCheckCircle className="w-4 h-4 mr-1" /> Score: {inspection.score}%</span>
                          )}
                        </div>

                        <div className="flex space-x-3">
                          <button className="inline-flex items-center px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                            <FiEye className="w-4 h-4 mr-1" />
                            View Details
                          </button>
                          {inspection.status === 'scheduled' && (
                            <button className="inline-flex items-center px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700">
                              <FiEdit3 className="w-4 h-4 mr-1" />
                              Start Inspection
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {inspections.length === 0 && (
                  <div className="text-center py-12">
                    <FiFileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">No inspections scheduled</p>
                    <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      <FiPlus className="w-4 h-4 mr-2" />
                      Schedule First Inspection
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Complaints Tab */}
        {activeTab === 'complaints' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Complaints Management</h2>
                <div className="text-sm text-gray-600">
                  Total: {complaints.length} | Open: {complaints.filter(c => ['open', 'pending', 'in-progress', 'investigating'].includes(c.status)).length}
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex-1 min-w-64">
                  <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search complaints..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={filters.search}
                      onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    />
                  </div>
                </div>
                
                <select
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                >
                  <option value="">All Statuses</option>
                  <option value="open">Open</option>
                  <option value="investigating">Investigating</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>

                <select
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={filters.priority}
                  onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                >
                  <option value="">All Priorities</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>

                <button
                  onClick={() => setFilters({ status: '', priority: '', search: '' })}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Clear Filters
                </button>
              </div>

              {/* Complaints List */}
              <div className="space-y-4">
                {filteredComplaints.length === 0 ? (
                  <div className="text-center py-12">
                    <FiAlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">
                      {complaints.length === 0 ? 'No complaints submitted yet' : 'No complaints match your filters'}
                    </p>
                  </div>
                ) : (
                  filteredComplaints.map((complaint) => (
                    <div key={complaint._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {complaint.complaintId || `#${complaint._id.slice(-6).toUpperCase()}`}
                            </h3>
                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(complaint.status)}`}>
                              {complaint.status}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${getPriorityColor(complaint.priority)}`}>
                              {complaint.priority || 'medium'}
                            </span>
                          </div>
                          
                          <p className="text-gray-900 font-medium mb-1">{complaint.companyName}</p>
                          <p className="text-gray-600 mb-3">{complaint.description}</p>
                          
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center">
                              <FiUser className="w-4 h-4 mr-1" />
                              {complaint.consumerName}
                            </span>
                            <span className="flex items-center">
                              <FiCalendar className="w-4 h-4 mr-1" />
                              {new Date(complaint.createdAt).toLocaleDateString()}
                            </span>
                            {complaint.assignedTo && (
                              <span className="flex items-center">
                                <FiUser className="w-4 h-4 mr-1" />
                                Assigned to: {complaint.assignedTo.firstName} {complaint.assignedTo.lastName}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => openModal('assign', complaint)}
                          className="inline-flex items-center px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                        >
                          <FiUser className="w-4 h-4 mr-1" />
                          Assign
                        </button>
                        <button
                          onClick={() => openModal('status', complaint)}
                          className="inline-flex items-center px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                        >
                          <FiEdit3 className="w-4 h-4 mr-1" />
                          Update Status
                        </button>
                        <button
                          onClick={() => openModal('email', complaint)}
                          className="inline-flex items-center px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
                        >
                          <FiMail className="w-4 h-4 mr-1" />
                          Send Email
                        </button>
                        <button
                          onClick={() => openModal('visit', complaint)}
                          className="inline-flex items-center px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
                        >
                          <FiCalendar className="w-4 h-4 mr-1" />
                          Schedule Visit
                        </button>
                        <button
                          onClick={() => openModal('view', complaint)}
                          className="inline-flex items-center px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                        >
                          <FiEye className="w-4 h-4 mr-1" />
                          View Details
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-semibold">
                {modalType === 'assign' && 'Assign Complaint'}
                {modalType === 'status' && 'Update Status'}
                {modalType === 'email' && 'Send Email'}
                {modalType === 'visit' && 'Schedule Visit'}
                {modalType === 'view' && 'Complaint Details'}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <FiXCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {modalType === 'assign' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Assign to Inspector</label>
                    <select
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      value={assignForm.inspectorId}
                      onChange={(e) => setAssignForm(prev => ({ ...prev, inspectorId: e.target.value }))}
                    >
                      <option value="">Select Inspector</option>
                      {inspectors.map(inspector => (
                        <option key={inspector._id} value={inspector._id}>
                          {inspector.firstName} {inspector.lastName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                    <textarea
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      rows="3"
                      value={assignForm.notes}
                      onChange={(e) => setAssignForm(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Assignment notes..."
                    />
                  </div>
                  <button
                    onClick={handleAssignComplaint}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                  >
                    Assign Complaint
                  </button>
                </div>
              )}

              {modalType === 'status' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      value={statusForm.status}
                      onChange={(e) => setStatusForm(prev => ({ ...prev, status: e.target.value }))}
                    >
                      <option value="">Select Status</option>
                      <option value="investigating">Investigating</option>
                      <option value="in-progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Action Taken</label>
                    <textarea
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      rows="3"
                      value={statusForm.actionTaken}
                      onChange={(e) => setStatusForm(prev => ({ ...prev, actionTaken: e.target.value }))}
                      placeholder="Describe action taken..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                    <textarea
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      rows="2"
                      value={statusForm.notes}
                      onChange={(e) => setStatusForm(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Additional notes..."
                    />
                  </div>
                  <button
                    onClick={handleUpdateStatus}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
                  >
                    Update Status
                  </button>
                </div>
              )}

              {modalType === 'email' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Template</label>
                    <select
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      value={emailForm.template}
                      onChange={(e) => setEmailForm(prev => ({ ...prev, template: e.target.value }))}
                    >
                      <option value="initial_notice">Initial Notice</option>
                      <option value="investigation_update">Investigation Update</option>
                      <option value="visit_scheduled">Visit Scheduled</option>
                      <option value="resolution_update">Resolution Update</option>
                      <option value="closure_notice">Closure Notice</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Recipient Email</label>
                    <input
                      type="email"
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      value={emailForm.recipientEmail}
                      onChange={(e) => setEmailForm(prev => ({ ...prev, recipientEmail: e.target.value }))}
                      placeholder="company@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      value={emailForm.subject}
                      onChange={(e) => setEmailForm(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder="Email subject..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Custom Message</label>
                    <textarea
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      rows="4"
                      value={emailForm.customMessage}
                      onChange={(e) => setEmailForm(prev => ({ ...prev, customMessage: e.target.value }))}
                      placeholder="Additional message..."
                    />
                  </div>
                  <button
                    onClick={handleSendEmail}
                    className="w-full bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700 flex items-center justify-center"
                  >
                    <FiSend className="w-4 h-4 mr-2" />
                    Send Email
                  </button>
                </div>
              )}

              {modalType === 'visit' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Visit Date</label>
                    <input
                      type="date"
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      value={visitForm.date}
                      onChange={(e) => setVisitForm(prev => ({ ...prev, date: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                    <input
                      type="time"
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      value={visitForm.time}
                      onChange={(e) => setVisitForm(prev => ({ ...prev, time: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      value={visitForm.address}
                      onChange={(e) => setVisitForm(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Visit address..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                    <textarea
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      rows="3"
                      value={visitForm.notes}
                      onChange={(e) => setVisitForm(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Visit purpose and notes..."
                    />
                  </div>
                  <button
                    onClick={handleScheduleVisit}
                    className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 flex items-center justify-center"
                  >
                    <FiCalendar className="w-4 h-4 mr-2" />
                    Schedule Visit
                  </button>
                </div>
              )}

              {modalType === 'view' && selectedItem && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900">{selectedItem.complaintId || `#${selectedItem._id.slice(-6).toUpperCase()}`}</h4>
                    <p className="text-gray-600">{selectedItem.companyName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <p className="text-gray-900">{selectedItem.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <p className="text-gray-900">{selectedItem.status}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                      <p className="text-gray-900">{selectedItem.priority || 'Medium'}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Submitted By</label>
                    <p className="text-gray-900">{selectedItem.consumerName}</p>
                    <p className="text-gray-600 text-sm">{new Date(selectedItem.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InspectorUnifiedDashboard;