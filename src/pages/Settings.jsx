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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 space-y-6">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-slate-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gray-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative glass-card p-6 border border-white/40 shadow-2xl"
      >
        <div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-slate-600 via-gray-600 to-zinc-600 bg-clip-text text-transparent">
            Settings
          </h1>
          <p className="text-gray-700 mt-1 font-semibold">Manage your account settings</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Settings */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 relative glass-card p-6 border border-white/40 shadow-2xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl shadow-lg">
              <User className="text-white" size={24} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Profile Information</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="text"
                value={user?.phone || ''}
                disabled
                className="w-full px-4 py-3 glass rounded-xl border border-white/30 bg-white/30 backdrop-blur-sm text-gray-700 font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 glass rounded-xl border border-white/30 bg-white/50 backdrop-blur-sm text-gray-900 font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                placeholder="your@email.com"
              />
            </div>

            <div className="pt-6 border-t border-white/30">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl shadow-lg">
                  <Lock className="text-white" size={24} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Change Password</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={formData.currentPassword}
                    onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                    className="w-full px-4 py-3 glass rounded-xl border border-white/30 bg-white/50 backdrop-blur-sm text-gray-900 font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    placeholder="Enter current password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                    className="w-full px-4 py-3 glass rounded-xl border border-white/30 bg-white/50 backdrop-blur-sm text-gray-900 font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    placeholder="Enter new password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Repeat New Password
                  </label>
                  <input
                    type="password"
                    value={formData.repeatPassword}
                    onChange={(e) => setFormData({ ...formData, repeatPassword: e.target.value })}
                    className="w-full px-4 py-3 glass rounded-xl border border-white/30 bg-white/50 backdrop-blur-sm text-gray-900 font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    placeholder="Repeat new password"
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={18} />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </motion.div>

        {/* Account Info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative glass-card p-6 border border-white/40 shadow-2xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl shadow-lg">
              <SettingsIcon className="text-white" size={24} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Account Info</h2>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-1">User Type</p>
              <p className="font-bold text-lg text-gray-900">{user?.type || 'Admin'}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-1">Status</p>
              <span className={`px-4 py-1.5 rounded-full font-bold text-xs backdrop-blur-sm border-2 ${
                user?.isActive 
                  ? 'bg-green-500/30 text-green-800 border-green-500/50' 
                  : 'bg-red-500/30 text-red-800 border-red-500/50'
              }`}>
                {user?.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-1">Member Since</p>
              <p className="font-bold text-lg text-gray-900">
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