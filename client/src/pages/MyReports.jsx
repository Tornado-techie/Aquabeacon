// File: client/src/pages/MyReports.jsx

import React, { useState } from 'react';
import { FiEye, FiClock, FiCheckCircle, FiAlertTriangle, FiPlus, FiFilter } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const MyReports = () => {
  const [filter, setFilter] = useState('all');

  // Sample data - replace with actual API call
  const reports = [
    {
      id: 1,
      title: 'Water contamination in Kibera',
      description: 'Water from the local borehole tastes metallic and has a strange odor',
      status: 'investigating',
      severity: 'high',
      date: '2024-10-15',
      location: 'Kibera, Nairobi',
      issueType: 'contamination',
      assignedInspector: 'Inspector Mike'
    },
    {
      id: 2,
      title: 'Low water pressure in estate',
      description: 'Water pressure very low during peak hours',
      status: 'resolved',
      severity: 'medium',
      date: '2024-10-10',
      location: 'Eastlands, Nairobi',
      issueType: 'pressure',
      assignedInspector: 'Inspector Sarah'
    },
    {
      id: 3,
      title: 'Discolored water supply',
      description: 'Water appears brownish in color since yesterday',
      status: 'reported',
      severity: 'medium',
      date: '2024-10-17',
      location: 'Westlands, Nairobi',
      issueType: 'quality',
      assignedInspector: null
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'investigating':
        return 'bg-blue-100 text-blue-800';
      case 'reported':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredReports = filter === 'all' 
    ? reports 
    : reports.filter(report => report.status === filter);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Reports</h1>
            <p className="text-gray-600 mt-1">Track your water issue reports</p>
          </div>
          
          <Link
            to="/report-issue"
            className="flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors mt-4 sm:mt-0"
          >
            <FiPlus className="w-4 h-4 mr-2" />
            New Report
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FiEye className="w-5 h-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-2xl font-bold text-gray-900">{reports.length}</p>
                <p className="text-gray-600 text-sm">Total Reports</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <FiClock className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="ml-3">
                <p className="text-2xl font-bold text-gray-900">
                  {reports.filter(r => r.status === 'investigating' || r.status === 'reported').length}
                </p>
                <p className="text-gray-600 text-sm">Pending</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <FiCheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-2xl font-bold text-gray-900">
                  {reports.filter(r => r.status === 'resolved').length}
                </p>
                <p className="text-gray-600 text-sm">Resolved</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center space-x-2 mb-6">
          <FiFilter className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-600">Filter by status:</span>
          
          {['all', 'reported', 'investigating', 'resolved'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Reports List */}
        <div className="space-y-4">
          {filteredReports.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <FiEye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No reports found</h3>
              <p className="text-gray-600 mb-4">
                {filter === 'all' 
                  ? "You haven't submitted any reports yet."
                  : `No reports with status "${filter}" found.`
                }
              </p>
              <Link
                to="/report-issue"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FiPlus className="w-4 h-4 mr-2" />
                Submit Your First Report
              </Link>
            </div>
          ) : (
            filteredReports.map((report) => (
              <div key={report.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {report.title}
                      </h3>
                      <div className="flex flex-col sm:flex-row gap-2 ml-4">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(report.status)}`}>
                          {report.status}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${getSeverityColor(report.severity)}`}>
                          {report.severity}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-3 line-clamp-2">
                      {report.description}
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <span>📍 {report.location}</span>
                      <span>📅 {report.date}</span>
                      <span>🔧 {report.issueType}</span>
                      {report.assignedInspector && (
                        <span>👨‍🔬 {report.assignedInspector}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-4 lg:mt-0 lg:ml-6">
                    <button className="w-full lg:w-auto flex items-center justify-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
                      <FiEye className="w-4 h-4 mr-2" />
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MyReports;