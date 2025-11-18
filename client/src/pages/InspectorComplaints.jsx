import React, { useState, useEffect } from 'react';
import { 
  FiSearch, 
  FiFilter, 
  FiUser, 
  FiClock, 
  FiMapPin, 
  FiAlertCircle,
  FiCalendar,
  FiMail,
  FiFileText,
  FiCheckCircle,
  FiXCircle,
  FiEye,
  FiEdit3,
  FiPhone,
  FiCamera,
  FiSend,
  FiPlus
} from 'react-icons/fi';
import api from '../utils/api';
import toast from 'react-hot-toast';

const InspectorComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({});
  const [inspectors, setInspectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'assign', 'status', 'email', 'visit', 'report'
  
  // Filters
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    assignedTo: '',
    search: '',
    page: 1
  });

  // Form states
  const [assignForm, setAssignForm] = useState({ inspectorId: '', notes: '' });
  const [statusForm, setStatusForm] = useState({ status: '', notes: '', actionTaken: '' });
  const [emailForm, setEmailForm] = useState({ template: 'initial_notice', subject: '', customMessage: '', recipientEmail: '' });
  const [visitForm, setVisitForm] = useState({ date: '', time: '', address: '', notes: '' });
  const [reportForm, setReportForm] = useState({ findings: '', recommendations: '', followUpRequired: false, nextVisitDate: '', photos: [] });

  useEffect(() => {
    fetchComplaints();
    fetchStats();
    fetchInspectors();
  }, [filters]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await api.get(`/inspector/complaints?${queryParams}`);
      if (response.data.success) {
        setComplaints(response.data.data.complaints);
      }
    } catch (error) {
      console.error('Error fetching complaints:', error);
      toast.error('Failed to fetch complaints');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/inspector/stats');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchInspectors = async () => {
    try {
      const response = await api.get('/inspector/inspectors');
      if (response.data.success) {
        setInspectors(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching inspectors:', error);
    }
  };

  const openModal = (type, complaint = null) => {
    setModalType(type);
    setSelectedComplaint(complaint);
    setShowModal(true);

    // Pre-fill forms with existing data
    if (complaint) {
      if (type === 'assign') {
        setAssignForm({ inspectorId: complaint.assignedTo?._id || '', notes: '' });
      } else if (type === 'status') {
        setStatusForm({ status: complaint.status, notes: '', actionTaken: '' });
      } else if (type === 'email') {
        setEmailForm({ 
          template: 'initial_notice', 
          subject: '', 
          customMessage: '', 
          recipientEmail: complaint.plant?.contact?.email || ''
        });
      } else if (type === 'visit') {
        setVisitForm({
          date: complaint.inspectorActions?.scheduledVisit?.date ? 
                new Date(complaint.inspectorActions.scheduledVisit.date).toISOString().split('T')[0] : '',
          time: complaint.inspectorActions?.scheduledVisit?.time || '',
          address: complaint.inspectorActions?.scheduledVisit?.address || 
                  complaint.plant?.location?.address || 
                  complaint.incidentLocation?.address || '',
          notes: ''
        });
      }
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedComplaint(null);
    setModalType('');
    
    // Reset forms
    setAssignForm({ inspectorId: '', notes: '' });
    setStatusForm({ status: '', notes: '', actionTaken: '' });
    setEmailForm({ template: 'initial_notice', subject: '', customMessage: '', recipientEmail: '' });
    setVisitForm({ date: '', time: '', address: '', notes: '' });
    setReportForm({ findings: '', recommendations: '', followUpRequired: false, nextVisitDate: '', photos: [] });
  };

  const handleAssignComplaint = async () => {
    try {
      const response = await api.put(`/inspector/complaints/${selectedComplaint._id}/assign`, assignForm);
      if (response.data.success) {
        toast.success('Complaint assigned successfully');
        fetchComplaints();
        fetchStats();
        closeModal();
      }
    } catch (error) {
      console.error('Error assigning complaint:', error);
      toast.error('Failed to assign complaint');
    }
  };

  const handleUpdateStatus = async () => {
    try {
      const response = await api.put(`/inspector/complaints/${selectedComplaint._id}/status`, statusForm);
      if (response.data.success) {
        toast.success('Status updated successfully');
        fetchComplaints();
        fetchStats();
        closeModal();
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleSendEmail = async () => {
    try {
      const response = await api.post(`/inspector/complaints/${selectedComplaint._id}/send-email`, emailForm);
      if (response.data.success) {
        toast.success('Email sent successfully');
        fetchComplaints();
        closeModal();
      }
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Failed to send email');
    }
  };

  const handleScheduleVisit = async () => {
    try {
      const response = await api.post(`/inspector/complaints/${selectedComplaint._id}/schedule-visit`, visitForm);
      if (response.data.success) {
        toast.success('Visit scheduled successfully');
        fetchComplaints();
        fetchStats();
        closeModal();
      }
    } catch (error) {
      console.error('Error scheduling visit:', error);
      toast.error('Failed to schedule visit');
    }
  };

  const handleSubmitReport = async () => {
    try {
      const response = await api.post(`/inspector/complaints/${selectedComplaint._id}/visit-report`, reportForm);
      if (response.data.success) {
        toast.success('Visit report submitted successfully');
        fetchComplaints();
        fetchStats();
        closeModal();
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.error('Failed to submit report');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'received': 'bg-blue-100 text-blue-800',
      'under_review': 'bg-yellow-100 text-yellow-800',
      'investigating': 'bg-orange-100 text-orange-800',
      'scheduled_visit': 'bg-purple-100 text-purple-800',
      'visit_completed': 'bg-indigo-100 text-indigo-800',
      'unresponsive': 'bg-red-100 text-red-800',
      'lab_testing': 'bg-cyan-100 text-cyan-800',
      'resolved': 'bg-green-100 text-green-800',
      'closed': 'bg-gray-100 text-gray-800',
      'rejected': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'critical': 'text-red-600',
      'high': 'text-orange-600',
      'medium': 'text-yellow-600',
      'low': 'text-green-600'
    };
    return colors[priority] || 'text-gray-600';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Inspector Complaints Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage and track water quality complaints</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <StatCard title="New Complaints" value={stats.newComplaints || 0} color="blue" />
          <StatCard title="Under Review" value={stats.underReview || 0} color="yellow" />
          <StatCard title="Scheduled Visits" value={stats.scheduledVisits || 0} color="purple" />
          <StatCard title="Unresponsive" value={stats.unresponsive || 0} color="red" />
          <StatCard title="Resolved" value={stats.resolved || 0} color="green" />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            
            {/* Search */}
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search complaints..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="received">Received</option>
              <option value="under_review">Under Review</option>
              <option value="investigating">Investigating</option>
              <option value="scheduled_visit">Scheduled Visit</option>
              <option value="visit_completed">Visit Completed</option>
              <option value="unresponsive">Unresponsive</option>
              <option value="resolved">Resolved</option>
            </select>

            {/* Priority Filter */}
            <select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value, page: 1 })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            {/* Assigned Inspector Filter */}
            <select
              value={filters.assignedTo}
              onChange={(e) => setFilters({ ...filters, assignedTo: e.target.value, page: 1 })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Inspectors</option>
              <option value="unassigned">Unassigned</option>
              {inspectors.map(inspector => (
                <option key={inspector._id} value={inspector._id}>
                  {inspector.firstName} {inspector.lastName}
                </option>
              ))}
            </select>

            {/* Clear Filters */}
            <button
              onClick={() => setFilters({ status: '', priority: '', assignedTo: '', search: '', page: 1 })}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Complaints Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Complaint
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reported
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      Loading complaints...
                    </td>
                  </tr>
                ) : complaints.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      No complaints found
                    </td>
                  </tr>
                ) : (
                  complaints.map((complaint) => (
                    <ComplaintRow 
                      key={complaint._id} 
                      complaint={complaint}
                      onOpenModal={openModal}
                      getStatusColor={getStatusColor}
                      getPriorityColor={getPriorityColor}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {showModal && selectedComplaint && (
          <Modal
            type={modalType}
            complaint={selectedComplaint}
            inspectors={inspectors}
            assignForm={assignForm}
            setAssignForm={setAssignForm}
            statusForm={statusForm}
            setStatusForm={setStatusForm}
            emailForm={emailForm}
            setEmailForm={setEmailForm}
            visitForm={visitForm}
            setVisitForm={setVisitForm}
            reportForm={reportForm}
            setReportForm={setReportForm}
            onClose={closeModal}
            onAssign={handleAssignComplaint}
            onUpdateStatus={handleUpdateStatus}
            onSendEmail={handleSendEmail}
            onScheduleVisit={handleScheduleVisit}
            onSubmitReport={handleSubmitReport}
          />
        )}
      </div>
    </div>
  );
};

// Statistics Card Component
const StatCard = ({ title, value, color }) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    purple: 'bg-purple-100 text-purple-800',
    red: 'bg-red-100 text-red-800',
    green: 'bg-green-100 text-green-800'
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${colorClasses[color]}`}>
          {value}
        </div>
      </div>
    </div>
  );
};

// Complaint Row Component
const ComplaintRow = ({ complaint, onOpenModal, getStatusColor, getPriorityColor }) => {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div>
            <div className="text-sm font-medium text-gray-900">
              {complaint.complaintId || complaint._id.substring(0, 8)}
            </div>
            <div className="text-sm text-gray-500">
              {complaint.plantName || 'Unknown Business'}
            </div>
            <div className="text-xs text-gray-400 capitalize">
              {complaint.category?.replace('_', ' ')}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(complaint.status)}`}>
          {complaint.status?.replace('_', ' ').toUpperCase()}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`text-sm font-medium ${getPriorityColor(complaint.priority)}`}>
          {complaint.priority?.toUpperCase()}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">
          {complaint.assignedTo ? 
            `${complaint.assignedTo.firstName} ${complaint.assignedTo.lastName}` : 
            <span className="text-gray-400">Unassigned</span>
          }
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {new Date(complaint.reportedAt).toLocaleDateString()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex space-x-2">
          <button
            onClick={() => onOpenModal('assign', complaint)}
            className="text-blue-600 hover:text-blue-900"
            title="Assign Inspector"
          >
            <FiUser className="w-4 h-4" />
          </button>
          <button
            onClick={() => onOpenModal('status', complaint)}
            className="text-green-600 hover:text-green-900"
            title="Update Status"
          >
            <FiEdit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onOpenModal('email', complaint)}
            className="text-purple-600 hover:text-purple-900"
            title="Send Email"
          >
            <FiMail className="w-4 h-4" />
          </button>
          <button
            onClick={() => onOpenModal('visit', complaint)}
            className="text-orange-600 hover:text-orange-900"
            title="Schedule Visit"
          >
            <FiCalendar className="w-4 h-4" />
          </button>
          {complaint.status === 'scheduled_visit' && (
            <button
              onClick={() => onOpenModal('report', complaint)}
              className="text-indigo-600 hover:text-indigo-900"
              title="Submit Report"
            >
              <FiFileText className="w-4 h-4" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

// Modal Component
const Modal = ({ 
  type, 
  complaint, 
  inspectors, 
  assignForm, 
  setAssignForm,
  statusForm,
  setStatusForm,
  emailForm,
  setEmailForm,
  visitForm,
  setVisitForm,
  reportForm,
  setReportForm,
  onClose, 
  onAssign, 
  onUpdateStatus, 
  onSendEmail, 
  onScheduleVisit, 
  onSubmitReport 
}) => {
  const modalTitles = {
    assign: 'Assign Inspector',
    status: 'Update Status',
    email: 'Send Email',
    visit: 'Schedule Visit',
    report: 'Submit Visit Report'
  };

  const renderModalContent = () => {
    switch (type) {
      case 'assign':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assign to Inspector
              </label>
              <select
                value={assignForm.inspectorId}
                onChange={(e) => setAssignForm({ ...assignForm, inspectorId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Inspector</option>
                {inspectors.map(inspector => (
                  <option key={inspector._id} value={inspector._id}>
                    {inspector.firstName} {inspector.lastName} ({inspector.email})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assignment Notes
              </label>
              <textarea
                value={assignForm.notes}
                onChange={(e) => setAssignForm({ ...assignForm, notes: e.target.value })}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Optional assignment notes..."
              />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={onAssign}
                disabled={!assignForm.inspectorId}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Assign
              </button>
            </div>
          </div>
        );

      case 'status':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Status
              </label>
              <select
                value={statusForm.status}
                onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Status</option>
                <option value="under_review">Under Review</option>
                <option value="investigating">Investigating</option>
                <option value="scheduled_visit">Scheduled Visit</option>
                <option value="visit_completed">Visit Completed</option>
                <option value="unresponsive">Unresponsive</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            {statusForm.status === 'resolved' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resolution Details
                </label>
                <textarea
                  value={statusForm.actionTaken}
                  onChange={(e) => setStatusForm({ ...statusForm, actionTaken: e.target.value })}
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe the actions taken to resolve this complaint..."
                  required
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status Update Notes
              </label>
              <textarea
                value={statusForm.notes}
                onChange={(e) => setStatusForm({ ...statusForm, notes: e.target.value })}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Optional notes about this status change..."
              />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={onUpdateStatus}
                disabled={!statusForm.status}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                Update Status
              </button>
            </div>
          </div>
        );

      case 'email':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Template
              </label>
              <select
                value={emailForm.template}
                onChange={(e) => setEmailForm({ ...emailForm, template: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="initial_notice">Initial Notice</option>
                <option value="follow_up">Follow-up Notice</option>
                <option value="visit_notification">Visit Notification</option>
                <option value="custom">Custom Message</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recipient Email
              </label>
              <input
                type="email"
                value={emailForm.recipientEmail}
                onChange={(e) => setEmailForm({ ...emailForm, recipientEmail: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="company@example.com"
              />
            </div>
            {emailForm.template === 'custom' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={emailForm.subject}
                    onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Email subject..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Custom Message
                  </label>
                  <textarea
                    value={emailForm.customMessage}
                    onChange={(e) => setEmailForm({ ...emailForm, customMessage: e.target.value })}
                    rows="6"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your custom message..."
                  />
                </div>
              </>
            )}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={onSendEmail}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                <FiSend className="w-4 h-4 inline mr-2" />
                Send Email
              </button>
            </div>
          </div>
        );

      case 'visit':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Visit Date
                </label>
                <input
                  type="date"
                  value={visitForm.date}
                  onChange={(e) => setVisitForm({ ...visitForm, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Visit Time
                </label>
                <input
                  type="time"
                  value={visitForm.time}
                  onChange={(e) => setVisitForm({ ...visitForm, time: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Visit Address
              </label>
              <input
                type="text"
                value={visitForm.address}
                onChange={(e) => setVisitForm({ ...visitForm, address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Facility address..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Visit Notes
              </label>
              <textarea
                value={visitForm.notes}
                onChange={(e) => setVisitForm({ ...visitForm, notes: e.target.value })}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Notes about the scheduled visit..."
              />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={onScheduleVisit}
                disabled={!visitForm.date || !visitForm.time}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
              >
                <FiCalendar className="w-4 h-4 inline mr-2" />
                Schedule Visit
              </button>
            </div>
          </div>
        );

      case 'report':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Inspection Findings
              </label>
              <textarea
                value={reportForm.findings}
                onChange={(e) => setReportForm({ ...reportForm, findings: e.target.value })}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Describe your inspection findings..."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recommendations
              </label>
              <textarea
                value={reportForm.recommendations}
                onChange={(e) => setReportForm({ ...reportForm, recommendations: e.target.value })}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Your recommendations for the business..."
                required
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="followUpRequired"
                checked={reportForm.followUpRequired}
                onChange={(e) => setReportForm({ ...reportForm, followUpRequired: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="followUpRequired" className="ml-2 block text-sm text-gray-700">
                Follow-up visit required
              </label>
            </div>
            {reportForm.followUpRequired && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Next Visit Date
                </label>
                <input
                  type="date"
                  value={reportForm.nextVisitDate}
                  onChange={(e) => setReportForm({ ...reportForm, nextVisitDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={onSubmitReport}
                disabled={!reportForm.findings || !reportForm.recommendations}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                <FiFileText className="w-4 h-4 inline mr-2" />
                Submit Report
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">{modalTitles[type]}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FiXCircle className="w-6 h-6" />
          </button>
        </div>
        
        {/* Complaint Info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-gray-900 mb-2">
            Complaint: {complaint.complaintId || complaint._id.substring(0, 8)}
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
            <div>Business: {complaint.plantName || 'Unknown'}</div>
            <div>Category: {complaint.category?.replace('_', ' ')}</div>
            <div>Status: {complaint.status?.replace('_', ' ')}</div>
            <div>Priority: {complaint.priority}</div>
          </div>
        </div>

        {renderModalContent()}
      </div>
    </div>
  );
};

export default InspectorComplaints;