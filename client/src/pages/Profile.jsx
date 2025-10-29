import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiPhone, FiHome, FiTool } from 'react-icons/fi';
import PageHeader from '../components/common/PageHeader';

const Profile = () => {
  const { user, updateUser, loading } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    userType: '',
    businessName: '',
    businessRegistration: '',
    nationalId: '',
    address: {
      street: '',
      city: '',
      county: '',
      postalCode: '',
    },
  });
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        userType: user.userType || '',
        businessName: user.businessName || '',
        businessRegistration: user.businessRegistration || '',
        nationalId: user.nationalId || '',
        address: {
          street: user.address?.street || '',
          city: user.address?.city || '',
          county: user.address?.county || '',
          postalCode: user.address?.postalCode || '',
        },
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [name.split('.')[1]]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Here you would call an API to update the user profile
      // For now, we'll just simulate it
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      updateUser(formData); // Update local context state
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update profile.');
      console.error('Profile update error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title="User Profile" breadcrumbs={['Home', 'Profile']} />
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white shadow-xl rounded-lg p-6 md:p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name</label>
                <input type="text" name="firstName" id="firstName" value={formData.firstName} onChange={handleChange} readOnly={!isEditing} className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 ${isEditing ? 'bg-white' : 'bg-gray-100'} focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name</label>
                <input type="text" name="lastName" id="lastName" value={formData.lastName} onChange={handleChange} readOnly={!isEditing} className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 ${isEditing ? 'bg-white' : 'bg-gray-100'} focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} readOnly={true} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-100 cursor-not-allowed focus:outline-none" />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} readOnly={!isEditing} className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 ${isEditing ? 'bg-white' : 'bg-gray-100'} focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
                />
              </div>
              <div>
                <label htmlFor="userType" className="block text-sm font-medium text-gray-700">User Type</label>
                <input type="text" name="userType" id="userType" value={formData.userType} readOnly={true} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-100 cursor-not-allowed focus:outline-none" />
              </div>
            </div>

            {/* Business Information (Conditional for 'owner' role) */}
            {formData.userType === 'Water Business Owner' && (
              <div className="border-t border-gray-200 pt-6 mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Business Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="businessName" className="block text-sm font-medium text-gray-700">Business Name</label>
                    <input type="text" name="businessName" id="businessName" value={formData.businessName} onChange={handleChange} readOnly={!isEditing} className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 ${isEditing ? 'bg-white' : 'bg-gray-100'} focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
                    />
                  </div>
                  <div>
                    <label htmlFor="businessRegistration" className="block text-sm font-medium text-gray-700">Business Reg. No.</label>
                    <input type="text" name="businessRegistration" id="businessRegistration" value={formData.businessRegistration} onChange={handleChange} readOnly={!isEditing} className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 ${isEditing ? 'bg-white' : 'bg-gray-100'} focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
                    />
                  </div>
                  <div>
                    <label htmlFor="nationalId" className="block text-sm font-medium text-gray-700">National ID (Owner)</label>
                    <input type="text" name="nationalId" id="nationalId" value={formData.nationalId} onChange={handleChange} readOnly={!isEditing} className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 ${isEditing ? 'bg-white' : 'bg-gray-100'} focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Address Information */}
            <div className="border-t border-gray-200 pt-6 mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Address Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="address.street" className="block text-sm font-medium text-gray-700">Street</label>
                  <input type="text" name="address.street" id="address.street" value={formData.address.street} onChange={handleChange} readOnly={!isEditing} className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 ${isEditing ? 'bg-white' : 'bg-gray-100'} focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
                  />
                </div>
                <div>
                  <label htmlFor="address.city" className="block text-sm font-medium text-gray-700">City</label>
                  <input type="text" name="address.city" id="address.city" value={formData.address.city} onChange={handleChange} readOnly={!isEditing} className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 ${isEditing ? 'bg-white' : 'bg-gray-100'} focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
                  />
                </div>
                <div>
                  <label htmlFor="address.county" className="block text-sm font-medium text-gray-700">County</label>
                  <input type="text" name="address.county" id="address.county" value={formData.address.county} onChange={handleChange} readOnly={!isEditing} className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 ${isEditing ? 'bg-white' : 'bg-gray-100'} focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
                  />
                </div>
                <div>
                  <label htmlFor="address.postalCode" className="block text-sm font-medium text-gray-700">Postal Code</label>
                  <input type="text" name="address.postalCode" id="address.postalCode" value={formData.address.postalCode} onChange={handleChange} readOnly={!isEditing} className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 ${isEditing ? 'bg-white' : 'bg-gray-100'} focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              {!isEditing ? (
                <button type="button" onClick={() => setIsEditing(true)} className="inline-flex justify-center rounded-md border border-transparent bg-primary-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
                  <FiTool className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                  Edit Profile
                </button>
              ) : (
                <>
                  <button type="button" onClick={() => setIsEditing(false)} className="inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting} className="inline-flex justify-center rounded-md border border-transparent bg-green-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed">
                    {submitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
