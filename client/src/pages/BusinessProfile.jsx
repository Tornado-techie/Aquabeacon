// File: client/src/pages/BusinessProfile.jsx

import React, { useState } from 'react';
import { FiEdit, FiShield, FiMapPin, FiMail, FiPhone } from 'react-icons/fi';
import { FaBuilding } from 'react-icons/fa';

const BusinessProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  
  // Sample business data
  const [businessData, setBusinessData] = useState({
    businessName: 'AquaPure Kenya Ltd',
    registrationNumber: 'PVT-202301234',
    businessType: 'water_treatment',
    ownerName: 'Samuel Mwangi',
    email: 'info@aquapure.co.ke',
    phoneNumber: '+254722555666',
    location: {
      county: 'Kiambu',
      town: 'Thika',
      address: 'Thika Industrial Area, Plot 45'
    },
    licenseNumber: 'WL/2023/001',
    licenseExpiry: '2024-12-31',
    capacity: 50000,
    certifications: {
      kebs: true,
      iso: true,
      others: ['HACCP']
    }
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <FaBuilding className="w-6 h-6 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Business Profile</h1>
            </div>
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <FiEdit className="w-4 h-4 mr-2" />
              {isEditing ? 'Save Changes' : 'Edit Profile'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Information</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-gray-600">Business Name:</span>
                  <p className="font-medium">{businessData.businessName}</p>
                </div>
                <div>
                  <span className="text-gray-600">Registration Number:</span>
                  <p className="font-medium">{businessData.registrationNumber}</p>
                </div>
                <div>
                  <span className="text-gray-600">License Number:</span>
                  <p className="font-medium">{businessData.licenseNumber}</p>
                </div>
                <div>
                  <span className="text-gray-600">License Expiry:</span>
                  <p className="font-medium">{businessData.licenseExpiry}</p>
                </div>
                <div>
                  <span className="text-gray-600">Capacity:</span>
                  <p className="font-medium">{businessData.capacity.toLocaleString()} L/day</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact & Location</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <FiMail className="w-4 h-4 text-gray-600 mr-2" />
                  <span>{businessData.email}</span>
                </div>
                <div className="flex items-center">
                  <FiPhone className="w-4 h-4 text-gray-600 mr-2" />
                  <span>{businessData.phoneNumber}</span>
                </div>
                <div className="flex items-center">
                  <FiMapPin className="w-4 h-4 text-gray-600 mr-2" />
                  <span>{businessData.location.address}, {businessData.location.town}</span>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-4 mt-6">Certifications</h3>
              <div className="space-y-2">
                {businessData.certifications.kebs && (
                  <div className="flex items-center">
                    <FiShield className="w-4 h-4 text-green-600 mr-2" />
                    <span>KEBS Certified</span>
                  </div>
                )}
                {businessData.certifications.iso && (
                  <div className="flex items-center">
                    <FiShield className="w-4 h-4 text-green-600 mr-2" />
                    <span>ISO 9001:2015</span>
                  </div>
                )}
                {businessData.certifications.others.map((cert, index) => (
                  <div key={index} className="flex items-center">
                    <FiShield className="w-4 h-4 text-green-600 mr-2" />
                    <span>{cert}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessProfile;