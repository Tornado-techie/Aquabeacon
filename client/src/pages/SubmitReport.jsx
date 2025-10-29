import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  FiDroplet,
  FiMapPin,
  FiCamera,
  FiX,
  FiAlertCircle,
  FiCheckCircle
} from 'react-icons/fi';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const SubmitReport = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    issueType: '',
    severity: '',
    location: {
      latitude: '',
      longitude: '',
      address: '',
      county: '',
      town: '',
      landmark: ''
    },
    affectedPeople: 0
  });

  const [photos, setPhotos] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [loading, setLoading] = useState(false);

  const issueTypes = [
    { value: 'contamination', label: 'Water Contamination', icon: '🦠' },
    { value: 'shortage', label: 'Water Shortage', icon: '💧' },
    { value: 'quality', label: 'Poor Quality', icon: '⚠️' },
    { value: 'infrastructure', label: 'Infrastructure Problem', icon: '🏗️' },
    { value: 'leakage', label: 'Pipe Leakage', icon: '💦' },
    { value: 'pressure', label: 'Low Pressure', icon: '📉' },
    { value: 'illegal_connection', label: 'Illegal Connection', icon: '🚫' },
    { value: 'other', label: 'Other Issue', icon: '❓' }
  ];

  const severityLevels = [
    { value: 'low', label: 'Low', color: 'green', description: 'Minor issue, not urgent' },
    { value: 'medium', label: 'Medium', color: 'yellow', description: 'Needs attention soon' },
    { value: 'high', label: 'High', color: 'orange', description: 'Serious issue, urgent' },
    { value: 'critical', label: 'Critical', color: 'red', description: 'Emergency, immediate action' }
  ];

  const kenyanCounties = [
    'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika', 'Malindi',
    'Kitale', 'Garissa', 'Kakamega', 'Nyeri', 'Meru', 'Kisii', 'Naivasha'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('location.')) {
      const locationField = name.split('.')[1];
      setFormData({
        ...formData,
        location: {
          ...formData.location,
          [locationField]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  // Get current GPS location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        setFormData({
          ...formData,
          location: {
            ...formData.location,
            latitude: latitude.toFixed(6),
            longitude: longitude.toFixed(6)
          }
        });

        // Reverse geocode to get address (optional - using a free API)
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await response.json();
          
          if (data.address) {
            setFormData(prev => ({
              ...prev,
              location: {
                ...prev.location,
                address: data.display_name || '',
                county: data.address.county || data.address.state || '',
                town: data.address.town || data.address.city || data.address.village || ''
              }
            }));
          }
        } catch (error) {
          console.log('Geocoding failed, but location captured');
        }

        setGettingLocation(false);
        toast.success('Location captured successfully!');
      },
      (error) => {
        setGettingLocation(false);
        toast.error('Failed to get location. Please enter manually.');
        console.error('Geolocation error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // Handle photo upload
  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (photos.length + files.length > 5) {
      toast.error('Maximum 5 photos allowed');
      return;
    }

    // Validate file sizes
    const invalidFiles = files.filter(file => file.size > 5 * 1024 * 1024);
    if (invalidFiles.length > 0) {
      toast.error('Each photo must be less than 5MB');
      return;
    }

    // Add photos
    setPhotos([...photos, ...files]);

    // Create previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreviews(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  // Remove photo
  const removePhoto = (index) => {
    setPhotos(photos.filter((_, i) => i !== index));
    setPhotoPreviews(photoPreviews.filter((_, i) => i !== index));
  };

  // Submit report
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.title || !formData.description || !formData.issueType || !formData.severity) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!formData.location.latitude || !formData.location.longitude) {
      toast.error('Please provide location (use GPS or enter manually)');
      return;
    }

    setLoading(true);

    try {
      // Create FormData for file upload
      const submitData = new FormData();
      
      // Append text fields
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('issueType', formData.issueType);
      submitData.append('severity', formData.severity);
      submitData.append('affectedPeople', formData.affectedPeople);
      
      // Append location as JSON string
      submitData.append('location[latitude]', formData.location.latitude);
      submitData.append('location[longitude]', formData.location.longitude);
      submitData.append('location[address]', formData.location.address);
      submitData.append('location[county]', formData.location.county);
      submitData.append('location[town]', formData.location.town);
      submitData.append('location[landmark]', formData.location.landmark);

      // Append photos
      photos.forEach(photo => {
        submitData.append('photos', photo);
      });

      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/reports`, submitData, {
        headers: {
          Authorization: `Bearer ${token}`
          // Note: Don't set Content-Type for FormData - browser sets it automatically with boundary
        }
      });

      if (response.data.success) {
        toast.success('Report submitted successfully!');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Submit error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to submit report';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-primary-600 hover:text-primary-700 mb-4 flex items-center"
          >
            ← Back to Dashboard
          </button>
          <div className="flex items-center space-x-3">
            <FiDroplet className="w-8 h-8 text-primary-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Report Water Issue</h1>
              <p className="text-gray-600 mt-1">Help improve water quality in your community</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6 space-y-6">
          
          {/* Issue Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Issue Type *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {issueTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, issueType: type.value })}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.issueType === type.value
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{type.icon}</div>
                  <div className="text-sm font-medium text-gray-900">{type.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Report Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              placeholder="e.g., Contaminated water in residential area"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Detailed Description * (min 20 characters)
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="5"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              placeholder="Describe the water issue in detail. Include when you first noticed it, symptoms, affected areas, etc."
              required
            ></textarea>
            <p className="text-sm text-gray-500 mt-1">{formData.description.length} characters</p>
          </div>

          {/* Severity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Severity Level *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {severityLevels.map((level) => (
                <button
                  key={level.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, severity: level.value })}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    formData.severity === level.value
                      ? `border-${level.color}-600 bg-${level.color}-50`
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`text-sm font-bold text-${level.color}-700 mb-1`}>
                    {level.label}
                  </div>
                  <div className="text-xs text-gray-600">{level.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Location Section */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FiMapPin className="mr-2" /> Location Information *
            </h3>

            {/* GPS Button */}
            <button
              type="button"
              onClick={getCurrentLocation}
              disabled={gettingLocation}
              className="mb-4 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center"
            >
              <FiMapPin className="mr-2" />
              {gettingLocation ? 'Getting Location...' : 'Use My Current Location (GPS)'}
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Latitude *
                </label>
                <input
                  type="number"
                  step="any"
                  name="location.latitude"
                  value={formData.location.latitude}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  placeholder="-1.2921"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Longitude *
                </label>
                <input
                  type="number"
                  step="any"
                  name="location.longitude"
                  value={formData.location.longitude}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  placeholder="36.8219"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  County
                </label>
                <select
                  name="location.county"
                  value={formData.location.county}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select County</option>
                  {kenyanCounties.map(county => (
                    <option key={county} value={county}>{county}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Town/City
                </label>
                <input
                  type="text"
                  name="location.town"
                  value={formData.location.town}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., Westlands"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address / Landmark
                </label>
                <input
                  type="text"
                  name="location.landmark"
                  value={formData.location.landmark}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., Near Sarit Centre Mall"
                />
              </div>
            </div>
          </div>

          {/* Photos Section */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FiCamera className="mr-2" /> Photos (Optional, max 5)
            </h3>

            <div className="mb-4">
              <label className="cursor-pointer inline-flex items-center px-6 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 transition">
                <FiCamera className="mr-2" />
                <span className="text-sm font-medium">Upload Photos</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                  disabled={photos.length >= 5}
                />
              </label>
              <p className="text-sm text-gray-500 mt-2">
                {photos.length}/5 photos • Max 5MB per photo
              </p>
            </div>

            {photoPreviews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {photoPreviews.map((preview, index) => (
                  <div key={index} className="relative">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Affected People */}
          <div>
            <label htmlFor="affectedPeople" className="block text-sm font-medium text-gray-700 mb-1">
              Estimated Number of People Affected (Optional)
            </label>
            <input
              type="number"
              id="affectedPeople"
              name="affectedPeople"
              value={formData.affectedPeople}
              onChange={handleChange}
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              placeholder="e.g., 50"
            />
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-between pt-6 border-t">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </>
              ) : (
                <>
                  <FiCheckCircle className="mr-2" />
                  Submit Report
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitReport;