import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiLock } from 'react-icons/fi';
import PageHeader from '../components/common/PageHeader';

const PasswordManagement = () => {
  const { user, loading } = useAuth(); // Assuming user context has methods to change password
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    if (formData.newPassword !== formData.confirmNewPassword) {
      toast.error('New password and confirm password do not match.');
      setSubmitting(false);
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long.');
      setSubmitting(false);
      return;
    }

    try {
      // Here you would call an API to change the user's password
      // For now, we'll just simulate it
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      toast.success('Password updated successfully!');
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      });
    } catch (error) {
      toast.error('Failed to update password.');
      console.error('Password update error:', error);
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
      <PageHeader title="Change Password" breadcrumbs={['Home', 'Profile', 'Change Password']} />
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white shadow-xl rounded-lg p-6 md:p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Change Password</h2>

          <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">Current Password</label>
              <input type="password" name="currentPassword" id="currentPassword" value={formData.currentPassword} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
            </div>
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">New Password</label>
              <input type="password" name="newPassword" id="newPassword" value={formData.newPassword} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
              <p className="mt-1 text-xs text-gray-500">Must be at least 6 characters</p>
            </div>
            <div>
              <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700">Confirm New Password</label>
              <input type="password" name="confirmNewPassword" id="confirmNewPassword" value={formData.confirmNewPassword} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
            </div>

            <div className="flex justify-end mt-6">
              <button type="submit" disabled={submitting} className="inline-flex justify-center rounded-md border border-transparent bg-primary-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed">
                {submitting ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PasswordManagement;
