// File: client/src/pages/Inspections.jsx

import React from 'react';
import { FiFileText, FiCalendar, FiPlus, FiCheckCircle, FiClock } from 'react-icons/fi';

const Inspections = () => {
  const inspections = [
    {
      id: 1,
      business: 'AquaPure Kenya Ltd',
      businessId: 'BIZ001',
      date: '2024-10-20',
      time: '09:00 AM',
      type: 'Routine Inspection',
      status: 'scheduled',
      priority: 'medium',
      location: 'Thika Industrial Area'
    },
    {
      id: 2,
      business: 'Fresh Springs Water Co.',
      businessId: 'BIZ002',
      date: '2024-10-15',
      time: '02:00 PM',
      type: 'Follow-up Inspection',
      status: 'completed',
      priority: 'high',
      location: 'Nakuru Industrial Area',
      score: 87
    },
    {
      id: 3,
      business: 'Clear Water Ltd',
      businessId: 'BIZ003',
      date: '2024-10-22',
      time: '11:00 AM',
      type: 'License Renewal Inspection',
      status: 'scheduled',
      priority: 'high',
      location: 'Mombasa Road'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Inspections</h1>
            <p className="text-gray-600 mt-1">Manage your inspection assignments</p>
          </div>
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <FiPlus className="w-4 h-4 mr-2" />
            New Inspection
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FiCalendar className="w-5 h-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-2xl font-bold text-gray-900">
                  {inspections.filter(i => i.status === 'scheduled').length}
                </p>
                <p className="text-gray-600 text-sm">Scheduled</p>
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
                  {inspections.filter(i => i.status === 'completed').length}
                </p>
                <p className="text-gray-600 text-sm">Completed</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FiFileText className="w-5 h-5 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-2xl font-bold text-gray-900">{inspections.length}</p>
                <p className="text-gray-600 text-sm">Total</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {inspections.map((inspection) => (
            <div key={inspection.id} className="bg-white rounded-lg shadow-sm p-6">
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
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <span>📅 {inspection.date}</span>
                    <span>🕒 {inspection.time}</span>
                    <span>📍 {inspection.location}</span>
                    <span>🏢 ID: {inspection.businessId}</span>
                    {inspection.score && (
                      <span>📊 Score: {inspection.score}%</span>
                    )}
                  </div>
                </div>
                
                <div className="mt-4 lg:mt-0 lg:ml-6">
                  <button className="w-full lg:w-auto flex items-center justify-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
                    <FiFileText className="w-4 h-4 mr-2" />
                    {inspection.status === 'completed' ? 'View Report' : 'Start Inspection'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Inspections;