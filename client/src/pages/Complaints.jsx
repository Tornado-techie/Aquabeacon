import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiDroplet, FiCamera, FiMapPin, FiAlertCircle, FiCheckCircle, FiX } from 'react-icons/fi';
import api from '../utils/api';
import toast from 'react-hot-toast';

const Complaints = () => {
  const [formData, setFormData] = useState({
    consumerName: '',
    consumerPhone: '',
    consumerEmail: '',
    reportedBusinessName: '',
    productCode: '',
    batchCode: '',
    complaintType: 'quality',
    description: '',
    location: '',
    photos: [],
    isAnonymous: false,
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [photoPreviews, setPhotoPreviews] = useState([]);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;

    if (e.target.name === 'isAnonymous') {
      setFormData(prev => ({
        ...prev,
        isAnonymous: value,
        // Clear personal details if reporting anonymously
        consumerName: value ? '' : prev.consumerName,
        consumerPhone: value ? '' : prev.consumerPhone,
        consumerEmail: value ? '' : prev.consumerEmail,
      }));
    } else {
      setFormData({
        ...formData,
        [e.target.name]: value
      });
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate file count
    if (files.length > 5) {
      toast.error('Maximum 5 photos allowed');
      return;
    }
    
    // Validate file size (10MB per file)
    const invalidFiles = files.filter(file => file.size > 10 * 1024 * 1024);
    if (invalidFiles.length > 0) {
      toast.error('Each photo must be less than 10MB');
      return;
    }
    
    // Validate file types
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const invalidTypes = files.filter(file => !allowedTypes.includes(file.type));
    if (invalidTypes.length > 0) {
      toast.error('Only JPEG, PNG, GIF, and WebP images are allowed');
      return;
    }
    
    setFormData({
      ...formData,
      photos: files
    });
    
    // Create previews
    const previews = [];
    files.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        previews[index] = {
          file,
          preview: e.target.result,
          name: file.name,
          size: file.size
        };
        if (previews.length === files.length) {
          setPhotoPreviews(previews);
        }
      };
      reader.readAsDataURL(file);
    });
  };
  
  const removePhoto = (index) => {
    const updatedPhotos = formData.photos.filter((_, i) => i !== index);
    const updatedPreviews = photoPreviews.filter((_, i) => i !== index);
    
    setFormData({
      ...formData,
      photos: updatedPhotos
    });
    setPhotoPreviews(updatedPreviews);
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setFormData(prev => ({
            ...prev,
            location: `${latitude}, ${longitude}`
          }));
          toast.success('Location captured!');
        },
        (error) => {
          toast.error('Unable to get location');
        }
      );
    } else {
      toast.error('Geolocation not supported');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.isAnonymous) {
      if (!formData.consumerName) {
        toast.error('Please enter your full name.');
        setLoading(false);
        return;
      }
      if (!formData.consumerPhone) {
        toast.error('Please enter your phone number.');
        setLoading(false);
        return;
      }
    }

    if (formData.photos.length === 0) {
      toast.error('Please upload at least one photo.');
      setLoading(false);
      return;
    }

    if (!formData.location) {
      toast.error('Please provide the location of the incident.');
      setLoading(false);
      return;
    }

    if (!formData.description || formData.description.trim().length < 10) {
      toast.error('Please provide a description of at least 10 characters.');
      setLoading(false);
      return;
    }

    try {
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'photos') {
          formData.photos.forEach(photo => {
            submitData.append('photos', photo);
          });
        } else {
          submitData.append(key, formData[key]);
        }
      });

      await api.post('/complaints', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Complaint submitted successfully!');
      setSubmitted(true);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit complaint');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiCheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Complaint Submitted</h2>
          <p className="text-gray-600 mb-6">
            Thank you for reporting this issue. We take all complaints seriously and will investigate promptly.
            You'll receive updates via email or SMS.
          </p>
          <div className="space-y-3">
            <Link
              to="/"
              className="block w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Back to Home
            </Link>
            <button
              onClick={() => setSubmitted(false)}
              className="block w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Submit Another Complaint
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 mb-4">
            <FiDroplet className="w-8 h-8 text-primary-600" />
            <span className="text-2xl font-bold text-gray-900">AquaBeacon</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Report a Water Quality Issue</h1>
          <p className="text-gray-600">Help us maintain high standards by reporting any concerns</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Consumer Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Your Information</h3>
              
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg flex items-center mb-6 shadow-sm">
                <input
                  id="isAnonymous"
                  name="isAnonymous"
                  type="checkbox"
                  checked={formData.isAnonymous}
                  onChange={handleChange}
                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                />
                <label htmlFor="isAnonymous" className="ml-3 block text-base font-semibold text-blue-800 cursor-pointer">
                  Report Anonymously
                  <p className="text-sm font-normal text-blue-700">Your name and phone number will not be recorded.</p>
                </label>
              </div>

              {!formData.isAnonymous && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="consumerName"
                      value={formData.consumerName}
                      onChange={handleChange}
                      required={!formData.isAnonymous}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                      placeholder="John Doe"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="consumerPhone"
                        value={formData.consumerPhone}
                        onChange={handleChange}
                        required={!formData.isAnonymous}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                        placeholder="+254 707806523"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email (Optional)
                      </label>
                      <input
                        type="email"
                        name="consumerEmail"
                        value={formData.consumerEmail}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Product Information */}
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Product Information</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Water Business Name or Brand *
                  </label>
                  <input
                    type="text"
                    name="reportedBusinessName"
                    value={formData.reportedBusinessName}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    placeholder="e.g., Pure Oasis Water or AquaBrand"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Code (SM/ISM/DM)
                    </label>
                    <input
                      type="text"
                      name="productCode"
                      value={formData.productCode}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                      placeholder="SM12345"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Batch Code
                    </label>
                    <input
                      type="text"
                      name="batchCode"
                      value={formData.batchCode}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                      placeholder="BATCH2025001"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Complaint Type *
                  </label>
                  <select
                    name="complaintType"
                    value={formData.complaintType}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="quality">Water Quality Issue (odor, taste, color, turbidity, etc.)</option>
                    <option value="packaging">Packaging Defect</option>
                    <option value="contamination">Suspected Contamination</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Please describe the issue in detail..."
                  />
                </div>
              </div>
            </div>

            {/* Location & Photos */}
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Evidence</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location *
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      required
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter location or use GPS"
                    />
                    <button
                      type="button"
                      onClick={getCurrentLocation}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center"
                    >
                      <FiMapPin className="w-4 h-4 mr-2" />
                      GPS
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Photos * (Required for complaint processing)
                  </label>
                  
                  {/* Photo Upload Area */}
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-primary-400 transition-colors">
                    <div className="space-y-1 text-center">
                      <FiCamera className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500">
                          <span>Upload photos</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleFileChange}
                            className="sr-only"
                            max="5"
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF, WebP up to 10MB each (Max 5 photos)</p>
                      {formData.photos.length > 0 && (
                        <p className="text-sm text-green-600 font-medium">
                          {formData.photos.length} photo(s) selected
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Photo Previews */}
                  {photoPreviews.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-3">Selected Photos:</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {photoPreviews.map((photoData, index) => (
                          <div key={index} className="relative group">
                            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                              <img
                                src={photoData.preview}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => removePhoto(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                              title="Remove photo"
                            >
                              <FiX className="w-4 h-4" />
                            </button>
                            <div className="mt-1 text-xs text-gray-500 truncate">
                              {photoData.name}
                            </div>
                            <div className="text-xs text-gray-400">
                              {(photoData.size / 1024 / 1024).toFixed(1)}MB
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Alert */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start">
              <FiAlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
              <div className="text-sm text-yellow-800">
                <p className="font-semibold mb-1">Important Notice</p>
                <p>
                  If this is a health emergency, please seek medical attention immediately. 
                  This form is for quality complaints only.
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                'Submit Complaint'
              )}
            </button>
          </form>
        </div>

        {/* Footer Note */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Your complaint will be reviewed within 24-48 hours.</p>
          <p className="mt-1">
            <Link to="/" className="text-primary-600 hover:text-primary-700">
              Return to Homepage
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Complaints;