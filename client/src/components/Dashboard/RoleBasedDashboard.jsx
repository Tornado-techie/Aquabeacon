// ============================================
// ROLE-BASED DASHBOARD COMPONENT
// File: client/src/components/Dashboard/RoleBasedDashboard.jsx
// ============================================

import React, { useState, useEffect } from 'react';
import { 
  FiDroplet, FiUser, FiMapPin, FiAlertCircle, FiTrendingUp, 
  FiFileText, FiDollarSign, FiCheckCircle, FiClock,
  FiUsers, FiBarChart, FiShield, FiPlus, FiEye
} from 'react-icons/fi';

// ============================================
// CONSUMER DASHBOARD
// ============================================
const ConsumerDashboard = ({ user }) => {
  const [stats, setStats] = useState({
    reportsSubmitted: 0,
    reportsInProgress: 0,
    reportsResolved: 0,
    waterQualityScore: 0
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user.fullName}
          </h1>
          <p className="text-gray-600 mt-2">
            Monitor water quality in your area and report issues
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Reports Submitted"
            value={stats.reportsSubmitted}
            icon={<FiFileText className="w-6 h-6" />}
            color="blue"
          />
          <StatCard
            title="In Progress"
            value={stats.reportsInProgress}
            icon={<FiClock className="w-6 h-6" />}
            color="yellow"
          />
          <StatCard
            title="Resolved"
            value={stats.reportsResolved}
            icon={<FiCheckCircle className="w-6 h-6" />}
            color="green"
          />
          <StatCard
            title="Water Quality Score"
            value={`${stats.waterQualityScore}%`}
            icon={<FiDroplet className="w-6 h-6" />}
            color="blue"
          />
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <ActionCard
            title="Report Water Issue"
            description="Submit a new water quality report"
            icon={<FiAlertCircle className="w-8 h-8" />}
            action="report"
            color="red"
          />
          <ActionCard
            title="View My Reports"
            description="Check status of your submitted reports"
            icon={<FiEye className="w-8 h-8" />}
            action="reports"
            color="blue"
          />
          <ActionCard
            title="Water Quality Map"
            description="View water quality in your area"
            icon={<FiMapPin className="w-8 h-8" />}
            action="map"
            color="green"
          />
        </div>

        {/* Recent Reports */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Recent Reports
          </h2>
          <div className="space-y-4">
            <ReportItem
              title="Water contamination in Kibera"
              status="investigating"
              date="2 days ago"
              severity="high"
            />
            <ReportItem
              title="Low water pressure"
              status="resolved"
              date="1 week ago"
              severity="medium"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// BUSINESS OWNER DASHBOARD
// ============================================
const BusinessOwnerDashboard = ({ user }) => {
  const [stats, setStats] = useState({
    activePermits: 2,
    pendingInspections: 1,
    certifications: 3,
    revenue: 45000
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Business Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your water business operations and compliance
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Active Permits"
            value={stats.activePermits}
            icon={<FiFileText className="w-6 h-6" />}
            color="green"
          />
          <StatCard
            title="Pending Inspections"
            value={stats.pendingInspections}
            icon={<FiClock className="w-6 h-6" />}
            color="yellow"
          />
          <StatCard
            title="Certifications"
            value={stats.certifications}
            icon={<FiShield className="w-6 h-6" />}
            color="blue"
          />
          <StatCard
            title="Monthly Revenue"
            value={`KES ${stats.revenue.toLocaleString()}`}
            icon={<FiDollarSign className="w-6 h-6" />}
            color="green"
          />
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <ActionCard
            title="Business Profile"
            description="Update your business information"
            icon={<FiUser className="w-8 h-8" />}
            action="profile"
            color="blue"
          />
          <ActionCard
            title="Apply for Permit"
            description="Submit new permit application"
            icon={<FiPlus className="w-8 h-8" />}
            action="permit"
            color="green"
          />
          <ActionCard
            title="Payment History"
            description="View payment records and invoices"
            icon={<FiDollarSign className="w-8 h-8" />}
            action="payments"
            color="purple"
          />
        </div>

        {/* Business Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Recent Inspections
            </h2>
            <div className="space-y-4">
              <InspectionItem
                date="Oct 15, 2024"
                inspector="Inspector Mike"
                score={85}
                status="passed"
              />
              <InspectionItem
                date="Apr 20, 2024"
                inspector="Inspector Sarah"
                score={92}
                status="passed"
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Permit Status
            </h2>
            <div className="space-y-4">
              <PermitItem
                type="Water Treatment License"
                status="active"
                expiry="Dec 31, 2024"
              />
              <PermitItem
                type="KEBS Certification"
                status="active"
                expiry="Jun 30, 2025"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// INSPECTOR DASHBOARD
// ============================================
const InspectorDashboard = ({ user }) => {
  const [stats, setStats] = useState({
    assignedInspections: 5,
    completedThisMonth: 12,
    pendingReports: 2,
    averageScore: 87
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Inspector Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your inspection assignments and reports
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Assigned Inspections"
            value={stats.assignedInspections}
            icon={<FiFileText className="w-6 h-6" />}
            color="blue"
          />
          <StatCard
            title="Completed This Month"
            value={stats.completedThisMonth}
            icon={<FiCheckCircle className="w-6 h-6" />}
            color="green"
          />
          <StatCard
            title="Pending Reports"
            value={stats.pendingReports}
            icon={<FiClock className="w-6 h-6" />}
            color="yellow"
          />
          <StatCard
            title="Average Score"
            value={`${stats.averageScore}%`}
            icon={<FiBarChart className="w-6 h-6" />}
            color="purple"
          />
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <ActionCard
            title="New Inspection"
            description="Start a new inspection report"
            icon={<FiPlus className="w-8 h-8" />}
            action="inspection"
            color="green"
          />
          <ActionCard
            title="My Assignments"
            description="View assigned inspections"
            icon={<FiFileText className="w-8 h-8" />}
            action="assignments"
            color="blue"
          />
          <ActionCard
            title="Water Quality Tools"
            description="Access testing protocols"
            icon={<FiDroplet className="w-8 h-8" />}
            action="tools"
            color="cyan"
          />
        </div>

        {/* Assigned Inspections */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Upcoming Inspections
          </h2>
          <div className="space-y-4">
            <AssignmentItem
              business="AquaPure Kenya Ltd"
              type="Routine Inspection"
              date="Oct 20, 2024"
              priority="high"
            />
            <AssignmentItem
              business="Fresh Springs Water Co."
              type="Follow-up Inspection"
              date="Oct 22, 2024"
              priority="medium"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// ADMIN DASHBOARD
// ============================================
const AdminDashboard = ({ user }) => {
  const [stats, setStats] = useState({
    totalUsers: 156,
    activeBusinesses: 45,
    totalReports: 89,
    systemHealth: 98
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            System overview and management
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={<FiUsers className="w-6 h-6" />}
            color="blue"
          />
          <StatCard
            title="Active Businesses"
            value={stats.activeBusinesses}
            icon={<FiUser className="w-6 h-6" />}
            color="green"
          />
          <StatCard
            title="Total Reports"
            value={stats.totalReports}
            icon={<FiFileText className="w-6 h-6" />}
            color="purple"
          />
          <StatCard
            title="System Health"
            value={`${stats.systemHealth}%`}
            icon={<FiTrendingUp className="w-6 h-6" />}
            color="green"
          />
        </div>

        {/* Management Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <ActionCard
            title="User Management"
            description="Manage user accounts and permissions"
            icon={<FiUsers className="w-8 h-8" />}
            action="users"
            color="blue"
          />
          <ActionCard
            title="Business Management"
            description="Oversee business registrations"
            icon={<FiUser className="w-8 h-8" />}
            action="businesses"
            color="green"
          />
          <ActionCard
            title="System Reports"
            description="View system analytics and reports"
            icon={<FiBarChart className="w-8 h-8" />}
            action="reports"
            color="purple"
          />
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Recent System Activity
          </h2>
          <div className="space-y-4">
            <ActivityItem
              action="New user registration"
              user="john@example.com"
              time="2 hours ago"
            />
            <ActivityItem
              action="Business permit approved"
              user="AquaPure Kenya Ltd"
              time="4 hours ago"
            />
            <ActivityItem
              action="Water quality report submitted"
              user="mary@gmail.com"
              time="6 hours ago"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// SHARED COMPONENTS
// ============================================

const StatCard = ({ title, value, icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
    purple: 'bg-purple-500',
    cyan: 'bg-cyan-500'
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`${colorClasses[color]} p-3 rounded-lg text-white`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

const ActionCard = ({ title, description, icon, action, color }) => {
  const colorClasses = {
    blue: 'hover:bg-blue-50 border-blue-200',
    green: 'hover:bg-green-50 border-green-200',
    red: 'hover:bg-red-50 border-red-200',
    purple: 'hover:bg-purple-50 border-purple-200',
    cyan: 'hover:bg-cyan-50 border-cyan-200'
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm p-6 cursor-pointer transition-colors ${colorClasses[color]} border`}>
      <div className="flex items-center mb-4">
        <div className="text-gray-700">
          {icon}
        </div>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
};

const ReportItem = ({ title, status, date, severity }) => (
  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
    <div>
      <h4 className="font-medium text-gray-900">{title}</h4>
      <p className="text-sm text-gray-600">{date}</p>
    </div>
    <div className="flex items-center space-x-2">
      <span className={`px-2 py-1 text-xs rounded-full ${
        severity === 'high' ? 'bg-red-100 text-red-800' :
        severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
        'bg-green-100 text-green-800'
      }`}>
        {severity}
      </span>
      <span className={`px-2 py-1 text-xs rounded-full ${
        status === 'investigating' ? 'bg-blue-100 text-blue-800' :
        status === 'resolved' ? 'bg-green-100 text-green-800' :
        'bg-gray-100 text-gray-800'
      }`}>
        {status}
      </span>
    </div>
  </div>
);

const InspectionItem = ({ date, inspector, score, status }) => (
  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
    <div>
      <h4 className="font-medium text-gray-900">{date}</h4>
      <p className="text-sm text-gray-600">{inspector}</p>
    </div>
    <div className="flex items-center space-x-2">
      <span className="text-lg font-semibold text-gray-900">{score}%</span>
      <span className={`px-2 py-1 text-xs rounded-full ${
        status === 'passed' ? 'bg-green-100 text-green-800' :
        'bg-red-100 text-red-800'
      }`}>
        {status}
      </span>
    </div>
  </div>
);

const PermitItem = ({ type, status, expiry }) => (
  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
    <div>
      <h4 className="font-medium text-gray-900">{type}</h4>
      <p className="text-sm text-gray-600">Expires: {expiry}</p>
    </div>
    <span className={`px-2 py-1 text-xs rounded-full ${
      status === 'active' ? 'bg-green-100 text-green-800' :
      'bg-red-100 text-red-800'
    }`}>
      {status}
    </span>
  </div>
);

const AssignmentItem = ({ business, type, date, priority }) => (
  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
    <div>
      <h4 className="font-medium text-gray-900">{business}</h4>
      <p className="text-sm text-gray-600">{type} - {date}</p>
    </div>
    <span className={`px-2 py-1 text-xs rounded-full ${
      priority === 'high' ? 'bg-red-100 text-red-800' :
      priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
      'bg-green-100 text-green-800'
    }`}>
      {priority}
    </span>
  </div>
);

const ActivityItem = ({ action, user, time }) => (
  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
    <div>
      <h4 className="font-medium text-gray-900">{action}</h4>
      <p className="text-sm text-gray-600">{user}</p>
    </div>
    <span className="text-sm text-gray-500">{time}</span>
  </div>
);

// ============================================
// MAIN ROLE-BASED DASHBOARD COMPONENT
// ============================================
const RoleBasedDashboard = ({ user }) => {
  console.log('🎯 Dashboard user role:', user?.userType);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Loading...</h2>
          <p className="text-gray-600 mt-2">Please wait while we load your dashboard</p>
        </div>
      </div>
    );
  }

  // Render dashboard based on user role
  switch (user.userType) {
    case 'Consumer':
      return <ConsumerDashboard user={user} />;
    
    case 'Water Business Owner':
      return <BusinessOwnerDashboard user={user} />;
    
    case 'Inspector':
      return <InspectorDashboard user={user} />;
    
    case 'Admin':
      return <AdminDashboard user={user} />;
    
    default:
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900">Unknown User Role</h2>
            <p className="text-gray-600 mt-2">
              User role "{user.userType}" is not recognized. Please contact support.
            </p>
          </div>
        </div>
      );
  }
};

export default RoleBasedDashboard;