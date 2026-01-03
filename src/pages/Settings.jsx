import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Save, User, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import toast from 'react-hot-toast';

const Settings = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    repeatPassword: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.repeatPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      if (formData.currentPassword && formData.newPassword) {
        await api.post('/auth/change-password', {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        });
        toast.success('Password changed successfully');
      }

      if (formData.email !== user?.email) {
        await api.put('/users/profile', {
          email: formData.email,
        });
        toast.success('Profile updated successfully');
      }
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your account settings</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Settings */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 card"
        >
          <div className="flex items-center gap-3 mb-6">
            <User className="text-primary-600" size={24} />
            <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="text"
                value={user?.phone || ''}
                disabled
                className="input-field bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input-field"
                placeholder="your@email.com"
              />
            </div>

            <div className="pt-6 border-t">
              <div className="flex items-center gap-3 mb-6">
                <Lock className="text-primary-600" size={24} />
                <h2 className="text-xl font-semibold text-gray-900">Change Password</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={formData.currentPassword}
                    onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                    className="input-field"
                    placeholder="Enter current password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                    className="input-field"
                    placeholder="Enter new password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Repeat New Password
                  </label>
                  <input
                    type="password"
                    value={formData.repeatPassword}
                    onChange={(e) => setFormData({ ...formData, repeatPassword: e.target.value })}
                    className="input-field"
                    placeholder="Repeat new password"
                  />
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
              <Save size={18} />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </motion.div>

        {/* Account Info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card"
        >
          <div className="flex items-center gap-3 mb-6">
            <SettingsIcon className="text-primary-600" size={24} />
            <h2 className="text-xl font-semibold text-gray-900">Account Info</h2>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">User Type</p>
              <p className="font-semibold text-gray-900">{user?.type || 'Admin'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <span className={`badge ${user?.isActive ? 'badge-success' : 'badge-danger'}`}>
                {user?.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Member Since</p>
              <p className="font-semibold text-gray-900">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;