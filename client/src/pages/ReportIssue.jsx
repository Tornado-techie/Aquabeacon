// File: client/src/pages/ReportIssue.jsx

import React, { useState } from 'react';
import { FiDroplet, FiMapPin, FiCamera, FiSend } from 'react-icons/fi';

const ReportIssue = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    issueType: '',
    severity: '',
    location: '',
    waterSource: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Report submitted:', formData);
    alert('Report submitted successfully!');
    // TODO: Implement actual report submission to backend
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center mb-6">
            <FiDroplet className="w-6 h-6 text-blue-600 mr-3" />
            <h1 className="text-2xl font-bold text-gray-900">Report Water Issue</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Issue Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Brief description of the issue"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Issue Type
                </label>
                <select
                  name="issueType"
                  value={formData.issueType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select issue type</option>
                  <option value="contamination">Water Contamination</option>
                  <option value="pressure">Low Water Pressure</option>
                  <option value="shortage">Water Shortage</option>
                  <option value="quality">Poor Water Quality</option>
                  <option value="taste">Bad Taste/Odor</option>
                  <option value="color">Water Discoloration</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Severity Level
                </label>
                <select
                  name="severity"
                  value={formData.severity}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select severity</option>
                  <option value="low">Low - Minor inconvenience</option>
                  <option value="medium">Medium - Affecting daily use</option>
                  <option value="high">High - Health risk concern</option>
                  <option value="critical">Critical - Immediate danger</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Water Source
                </label>
                <select
                  name="waterSource"
                  value={formData.waterSource}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select water source</option>
                  <option value="municipal">Municipal/City Water</option>
                  <option value="borehole">Borehole</option>
                  <option value="well">Well</option>
                  <option value="spring">Spring</option>
                  <option value="river">River/Stream</option>
                  <option value="bottled">Bottled Water</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <div className="flex items-center">
                <FiMapPin className="w-5 h-5 text-gray-400 mr-2" />
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Kibera, Nairobi or specific address"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Detailed Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Please provide detailed description of the water issue including when it started, how many people are affected, any symptoms, etc."
                required
              />
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <FiCamera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 mb-2">Upload photos (optional)</p>
              <p className="text-sm text-gray-500">Photos help inspectors understand the issue better</p>
              <input
                type="file"
                multiple
                accept="image/*"
                className="mt-3"
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Save as Draft
              </button>
              <button
                type="submit"
                className="flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FiSend className="w-4 h-4 mr-2" />
                Submit Report
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReportIssue;