import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiDroplet, FiMapPin, FiDollarSign, FiUsers, FiCheckCircle, FiCrosshair } from 'react-icons/fi';
import api from '../utils/api';
import toast from 'react-hot-toast';

const PlantSetup = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [gettingLocation, setGettingLocation] = useState(false);
  
  // Complete list of all 47 counties in Kenya
  const kenyanCounties = [
    'Baringo', 'Bomet', 'Bungoma', 'Busia', 'Elgeyo-Marakwet', 'Embu', 
    'Garissa', 'Homa Bay', 'Isiolo', 'Kajiado', 'Kakamega', 'Kericho',
    'Kiambu', 'Kilifi', 'Kirinyaga', 'Kisii', 'Kisumu', 'Kitui',
    'Kwale', 'Laikipia', 'Lamu', 'Machakos', 'Makueni', 'Mandera',
    'Marsabit', 'Meru', 'Migori', 'Mombasa', 'Murang\'a', 'Nairobi',
    'Nakuru', 'Nandi', 'Narok', 'Nyamira', 'Nyandarua', 'Nyeri',
    'Samburu', 'Siaya', 'Taita-Taveta', 'Tana River', 'Tharaka-Nithi',
    'Trans Nzoia', 'Turkana', 'Uasin Gishu', 'Vihiga', 'Wajir', 'West Pokot'
  ];

  const [formData, setFormData] = useState({
    name: '',
    businessType: 'purification',
    location: {
      coordinates: [0, 0], // [longitude, latitude]
      address: {
        street: '',
        city: '',
        county: ''
      }
    },
    capacity: {
      dailyProduction: '',
      storageCapacity: ''
    },
    waterSource: {
      type: ''
    },
    employees: {
      total: ''
    },
    contactPerson: {
      name: '',
      phone: '',
      email: ''
    },
    treatmentMethod: [],
    distributionMethod: []
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const keys = name.split('.');
      setFormData(prev => {
        const newData = { ...prev };
        let current = newData;
        
        // Navigate to the nested property
        for (let i = 0; i < keys.length - 1; i++) {
          if (!current[keys[i]]) {
            current[keys[i]] = {};
          }
          current = current[keys[i]];
        }
        
        // Set the final value
        current[keys[keys.length - 1]] = value;
        return newData;
      });
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleCheckboxChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  // Get current GPS location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setGettingLocation(true);
    toast.loading('Getting your location...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        setFormData(prev => ({
          ...prev,
          location: {
            ...prev.location,
            coordinates: [longitude, latitude] // [longitude, latitude] as expected by MongoDB
          }
        }));

        setGettingLocation(false);
        toast.dismiss();
        toast.success('Location obtained successfully!');
      },
      (error) => {
        setGettingLocation(false);
        toast.dismiss();
        
        let errorMessage = 'Unable to get location. ';
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += 'Location access denied by user.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'Location information unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage += 'Location request timed out.';
            break;
          default:
            errorMessage += 'Unknown error occurred.';
            break;
        }
        toast.error(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Ensure coordinates are set (default to [0, 0] if not provided)
      const submissionData = {
        ...formData,
        location: {
          ...formData.location,
          coordinates: formData.location.coordinates[0] === 0 && formData.location.coordinates[1] === 0 
            ? [0, 0] 
            : formData.location.coordinates
        }
      };

      await api.post('/plants', submissionData);
      toast.success('Plant registered successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Submission error:', error);
      toast.error(error.response?.data?.message || 'Failed to register plant');
    }
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <FiDroplet className="w-12 h-12 text-primary-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Plant Setup Wizard</h1>
          <p className="text-gray-600">Register your water purification or bottling facility</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            {[1, 2, 3, 4].map((num) => (
              <div key={num} className="flex-1">
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    step >= num 
                      ? 'bg-primary-600 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {num}
                  </div>
                  {num < 4 && (
                    <div className={`flex-1 h-1 mx-2 ${
                      step > num ? 'bg-primary-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  {num === 1 && 'Business Info'}
                  {num === 2 && 'Location'}
                  {num === 3 && 'Operations'}
                  {num === 4 && 'Review'}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit}>
            {/* Step 1: Business Information */}
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Business Information</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Plant Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Aqua Pure Kenya Ltd"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Type *
                  </label>
                  <select
                    name="businessType"
                    value={formData.businessType}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="purification">Water Purification</option>
                    <option value="bottling">Water Bottling</option>
                    <option value="both">Purification & Bottling</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Person *
                    </label>
                    <input
                      type="text"
                      name="contactPerson.name"
                      value={formData.contactPerson.name}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Phone *
                    </label>
                    <input
                      type="tel"
                      name="contactPerson.phone"
                      value={formData.contactPerson.phone}
                      onChange={handleChange}
                      required
                      className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                      placeholder="+254 707806523"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Email *
                  </label>
                  <input
                    type="email"
                    name="contactPerson.email"
                    value={formData.contactPerson.email}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    placeholder="contact@aquapure.co.ke"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Location */}
            {step === 2 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Location Details</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    name="location.address.street"
                    value={formData.location.address.street}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    placeholder="123 Industrial Area Road"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      name="location.address.city"
                      value={formData.location.address.city}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Nairobi"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      County *
                    </label>
                    <select
                      name="location.address.county"
                      value={formData.location.address.county}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">Select County</option>
                      {kenyanCounties.map((county) => (
                        <option key={county} value={county}>
                          {county}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700">
                      GPS Coordinates (Optional)
                    </label>
                    <button
                      type="button"
                      onClick={getCurrentLocation}
                      disabled={gettingLocation}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FiCrosshair className={`w-4 h-4 mr-1 ${gettingLocation ? 'animate-spin' : ''}`} />
                      {gettingLocation ? 'Getting Location...' : 'Use My Location'}
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Latitude
                      </label>
                      <input
                        type="number"
                        step="any"
                        name="coordinates.lat"
                        value={formData.location.coordinates[1] || ''}
                        onChange={(e) => {
                          const lat = parseFloat(e.target.value) || 0;
                          setFormData(prev => ({
                            ...prev,
                            location: {
                              ...prev.location,
                              coordinates: [prev.location.coordinates[0] || 0, lat]
                            }
                          }));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                        placeholder="-1.286389"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Longitude
                      </label>
                      <input
                        type="number"
                        step="any"
                        name="coordinates.lng"
                        value={formData.location.coordinates[0] || ''}
                        onChange={(e) => {
                          const lng = parseFloat(e.target.value) || 0;
                          setFormData(prev => ({
                            ...prev,
                            location: {
                              ...prev.location,
                              coordinates: [lng, prev.location.coordinates[1] || 0]
                            }
                          }));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                        placeholder="36.817223"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex">
                    <FiMapPin className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-semibold mb-1">Location Tips:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Click "Use My Location" to automatically fill coordinates</li>
                        <li>GPS coordinates help customers and inspectors locate your facility easily</li>
                        <li>Accurate location data improves service delivery and compliance tracking</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Operations */}
            {step === 3 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Operations Details</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Daily Production Capacity (Liters) *
                    </label>
                    <input
                      type="number"
                      name="capacity.dailyProduction"
                      value={formData.capacity.dailyProduction}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                      placeholder="5000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Storage Capacity (Liters)
                    </label>
                    <input
                      type="number"
                      name="capacity.storageCapacity"
                      value={formData.capacity.storageCapacity}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                      placeholder="10000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Number of Employees
                  </label>
                  <input
                    type="number"
                    name="employees.total"
                    value={formData.employees.total}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    placeholder="10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Water Source *
                  </label>
                  <select
                    name="waterSource.type"
                    value={formData.waterSource.type}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select Source</option>
                    <option value="borehole">Borehole</option>
                    <option value="municipal">Municipal Water</option>
                    <option value="spring">Spring Water</option>
                    <option value="surface">Surface Water (River/Lake)</option>
                    <option value="rainwater">Rainwater</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Treatment Methods * (Select all that apply)
                  </label>
                  <div className="space-y-2">
                    {['Filtration', 'Reverse Osmosis', 'UV Treatment', 'Chlorination', 'Ozonation'].map((method) => (
                      <label key={method} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.treatmentMethod.includes(method)}
                          onChange={() => handleCheckboxChange('treatmentMethod', method)}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">{method}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Distribution Methods * (Select all that apply)
                  </label>
                  <div className="space-y-2">
                    {['Bottled Water', 'Water Dispenser Refills', 'Direct Supply', 'Retail Outlets'].map((method) => (
                      <label key={method} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.distributionMethod.includes(method)}
                          onChange={() => handleCheckboxChange('distributionMethod', method)}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">{method}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {step === 4 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Review Your Information</h2>
                
                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Business Information</h3>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><strong>Name:</strong> {formData.name}</p>
                      <p><strong>Type:</strong> {formData.businessType}</p>
                      <p><strong>Contact:</strong> {formData.contactPerson.name} ({formData.contactPerson.phone})</p>
                      <p><strong>Email:</strong> {formData.contactPerson.email}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Location</h3>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><strong>Address:</strong> {formData.location.address.street}</p>
                      <p><strong>City:</strong> {formData.location.address.city}</p>
                      <p><strong>County:</strong> {formData.location.address.county}</p>
                      {(formData.location.coordinates[0] !== 0 || formData.location.coordinates[1] !== 0) && (
                        <p><strong>Coordinates:</strong> {formData.location.coordinates[1]}, {formData.location.coordinates[0]}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Operations</h3>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><strong>Daily Capacity:</strong> {formData.capacity.dailyProduction} L</p>
                      <p><strong>Storage:</strong> {formData.capacity.storageCapacity} L</p>
                      <p><strong>Employees:</strong> {formData.employees.total}</p>
                      <p><strong>Water Source:</strong> {formData.waterSource.type}</p>
                      <p><strong>Treatment:</strong> {formData.treatmentMethod.join(', ')}</p>
                      <p><strong>Distribution:</strong> {formData.distributionMethod.join(', ')}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start">
                  <FiCheckCircle className="w-5 h-5 text-green-600 mt-0.5 mr-3" />
                  <div className="text-sm text-green-800">
                    <p className="font-semibold mb-1">Ready to Register</p>
                    <p>Please review all information carefully before submitting.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              {step > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Previous
                </button>
              )}
              
              {step < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="ml-auto px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  className="ml-auto px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                >
                  <FiCheckCircle className="w-5 h-5 mr-2" />
                  Submit Registration
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PlantSetup;