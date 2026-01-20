import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Settings as SettingsIcon, 
  Save, 
  User, 
  Lock, 
  DollarSign, 
  Printer,
  BookOpen,
  FileText,
  Package,
  Plus,
  Edit,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import toast from 'react-hot-toast';
import DataTable from '../components/DataTable';

const Settings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    repeatPassword: '',
  });
  const [loading, setLoading] = useState(false);
  
  // Pricing data
  const [bookPricings, setBookPricings] = useState([]);
  const [materialPricings, setMaterialPricings] = useState([]);
  const [productPricings, setProductPricings] = useState([]);
  const [printOptions, setPrintOptions] = useState([]);
  const [pricingLoading, setPricingLoading] = useState(false);
  const [printOptionsLoading, setPrintOptionsLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'pricing') {
      fetchPricingData();
    } else if (activeTab === 'print-options') {
      fetchPrintOptions();
    }
  }, [activeTab]);

  const fetchPricingData = async () => {
    try {
      setPricingLoading(true);
      const [bookRes, materialRes, productRes] = await Promise.all([
        api.get('/book-pricing?limit=100'),
        api.get('/materials?limit=100').then(res => {
          // Extract pricing from materials
          const materials = res.data.data || res.data || [];
          return materials.flatMap(m => 
            (m.pricing || []).map(p => ({ ...p, material: m }))
          );
        }).catch(() => []),
        api.get('/product-pricing?limit=100'),
      ]);
      
      setBookPricings(bookRes.data.data || bookRes.data || []);
      setMaterialPricings(materialRes || []);
      setProductPricings(productRes.data.data || productRes.data || []);
    } catch (error) {
      toast.error('Failed to load pricing data');
    } finally {
      setPricingLoading(false);
    }
  };

  const fetchPrintOptions = async () => {
    try {
      setPrintOptionsLoading(true);
      const response = await api.get('/print-options?limit=100');
      setPrintOptions(response.data.data || response.data || []);
    } catch (error) {
      toast.error('Failed to load print options');
    } finally {
      setPrintOptionsLoading(false);
    }
  };

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

  const handleDeletePricing = async (type, id) => {
    if (!window.confirm('Are you sure you want to delete this pricing?')) {
      return;
    }
    try {
      const endpoint = type === 'book' ? '/book-pricing' : type === 'product' ? '/product-pricing' : null;
      if (!endpoint) {
        toast.error('Cannot delete material pricing from here');
        return;
      }
      await api.delete(`${endpoint}/${id}`);
      toast.success('Pricing deleted successfully');
      fetchPricingData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete pricing');
    }
  };

  const handleDeletePrintOption = async (id) => {
    if (!window.confirm('Are you sure you want to delete this print option?')) {
      return;
    }
    try {
      await api.delete(`/print-options/${id}`);
      toast.success('Print option deleted successfully');
      fetchPrintOptions();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete print option');
    }
  };

  const bookPricingColumns = [
    {
      header: 'Book',
      accessor: 'book',
      render: (pricing) => (
        <div className="flex items-center gap-3">
          <BookOpen className="text-blue-600" size={20} />
          <span className="font-medium text-gray-900">{pricing.book?.title || 'N/A'}</span>
        </div>
      ),
    },
    {
      header: 'Access Type',
      accessor: 'accessType',
      render: (pricing) => (
        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium capitalize">
          {pricing.accessType?.toLowerCase() || 'N/A'}
        </span>
      ),
    },
    {
      header: 'Price',
      accessor: 'price',
      render: (pricing) => (
        <span className="font-semibold text-gray-900">${pricing.price?.toFixed(2) || '0.00'}</span>
      ),
    },
    {
      header: 'Status',
      accessor: 'approvalStatus',
      render: (pricing) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          pricing.approvalStatus === 'APPROVED' 
            ? 'bg-green-100 text-green-700' 
            : pricing.approvalStatus === 'PENDING'
            ? 'bg-yellow-100 text-yellow-700'
            : 'bg-red-100 text-red-700'
        }`}>
          {pricing.approvalStatus || 'PENDING'}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (pricing) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/book-pricing/edit/${pricing.id}`)}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={() => handleDeletePricing('book', pricing.id)}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ];

  const materialPricingColumns = [
    {
      header: 'Material',
      accessor: 'material',
      render: (pricing) => (
        <div className="flex items-center gap-3">
          <FileText className="text-purple-600" size={20} />
          <span className="font-medium text-gray-900">{pricing.material?.title || 'N/A'}</span>
        </div>
      ),
    },
    {
      header: 'Access Type',
      accessor: 'accessType',
      render: (pricing) => (
        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium capitalize">
          {pricing.accessType?.toLowerCase() || 'N/A'}
        </span>
      ),
    },
    {
      header: 'Price',
      accessor: 'price',
      render: (pricing) => (
        <span className="font-semibold text-gray-900">${pricing.price?.toFixed(2) || '0.00'}</span>
      ),
    },
    {
      header: 'Status',
      accessor: 'approvalStatus',
      render: (pricing) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          pricing.approvalStatus === 'APPROVED' 
            ? 'bg-green-100 text-green-700' 
            : pricing.approvalStatus === 'PENDING'
            ? 'bg-yellow-100 text-yellow-700'
            : 'bg-red-100 text-red-700'
        }`}>
          {pricing.approvalStatus || 'PENDING'}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (pricing) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/materials/${pricing.material?.id}`)}
            className="p-2 text-gray-600 hover:text-purple-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="View Material"
          >
            <ExternalLink size={18} />
          </button>
        </div>
      ),
    },
  ];

  const productPricingColumns = [
    {
      header: 'Product',
      accessor: 'product',
      render: (pricing) => (
        <div className="flex items-center gap-3">
          <Package className="text-orange-600" size={20} />
          <span className="font-medium text-gray-900">{pricing.product?.name || 'N/A'}</span>
        </div>
      ),
    },
    {
      header: 'Min Quantity',
      accessor: 'minQuantity',
      render: (pricing) => (
        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
          {pricing.minQuantity || 0}
        </span>
      ),
    },
    {
      header: 'Price',
      accessor: 'price',
      render: (pricing) => (
        <span className="font-semibold text-gray-900">${pricing.price?.toFixed(2) || '0.00'}</span>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (pricing) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/product-pricing/edit/${pricing.id}`)}
            className="p-2 text-gray-600 hover:text-orange-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={() => handleDeletePricing('product', pricing.id)}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ];

  const printOptionsColumns = [
    {
      header: 'Book',
      accessor: 'book',
      render: (option) => (
        <div className="flex items-center gap-3">
          <BookOpen className="text-indigo-600" size={20} />
          <span className="font-medium text-gray-900">{option.book?.title || 'N/A'}</span>
        </div>
      ),
    },
    {
      header: 'Color Type',
      accessor: 'colorType',
      render: (option) => (
        <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium capitalize">
          {option.colorType?.toLowerCase() || 'N/A'}
        </span>
      ),
    },
    {
      header: 'Paper Size',
      accessor: 'paperSize',
      render: (option) => (
        <span className="text-gray-600 capitalize">{option.paperSize || 'N/A'}</span>
      ),
    },
    {
      header: 'Price/Page',
      accessor: 'pricePerPage',
      render: (option) => (
        <span className="font-semibold text-gray-900">
          ${option.pricePerPage?.toFixed(2) || '0.00'}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (option) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/print-options/edit/${option.id}`)}
            className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={() => handleDeletePrintOption(option.id)}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ];

  const tabs = [
    { id: 'profile', label: 'Profile Settings', icon: User },
    { id: 'pricing', label: 'إدارة الأسعار', icon: DollarSign },
    { id: 'print-options', label: 'خيارات الطباعة', icon: Printer },
  ];

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
          <p className="text-gray-700 mt-1 font-semibold">إعدادات النظام وإدارة الأسعار وخيارات الطباعة</p>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="relative glass-card border border-white/40 shadow-2xl">
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-semibold transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50/50'
                }`}
              >
                <Icon size={20} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:col-span-2 relative glass-card p-6 border border-white/40 shadow-xl"
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
                className="relative glass-card p-6 border border-white/40 shadow-xl"
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
          )}

          {/* Pricing Management Tab */}
          {activeTab === 'pricing' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">إدارة الأسعار</h2>
                  <p className="text-gray-600 mt-1">يمكنك إدارة أسعار الكتب والمواد والمنتجات من هنا</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate('/book-pricing/add')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Plus size={18} />
                    إضافة سعر كتاب
                  </button>
                  <button
                    onClick={() => navigate('/product-pricing/add')}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2"
                  >
                    <Plus size={18} />
                    إضافة سعر منتج
                  </button>
                </div>
              </div>

              {/* Book Pricing */}
              <div className="glass-card border border-white/40 shadow-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <BookOpen className="text-blue-600" size={24} />
                  <h3 className="text-xl font-bold text-gray-900">أسعار الكتب</h3>
                </div>
                <DataTable
                  data={bookPricings}
                  columns={bookPricingColumns}
                  loading={pricingLoading}
                  searchable
                  searchPlaceholder="البحث في أسعار الكتب..."
                />
              </div>

              {/* Material Pricing */}
              <div className="glass-card border border-white/40 shadow-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="text-purple-600" size={24} />
                  <h3 className="text-xl font-bold text-gray-900">أسعار المواد</h3>
                </div>
                <DataTable
                  data={materialPricings}
                  columns={materialPricingColumns}
                  loading={pricingLoading}
                  searchable
                  searchPlaceholder="البحث في أسعار المواد..."
                />
              </div>

              {/* Product Pricing */}
              <div className="glass-card border border-white/40 shadow-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Package className="text-orange-600" size={24} />
                  <h3 className="text-xl font-bold text-gray-900">أسعار المنتجات</h3>
                </div>
                <DataTable
                  data={productPricings}
                  columns={productPricingColumns}
                  loading={pricingLoading}
                  searchable
                  searchPlaceholder="البحث في أسعار المنتجات..."
                />
              </div>
            </div>
          )}

          {/* Print Options Tab */}
          {activeTab === 'print-options' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">خيارات الطباعة</h2>
                  <p className="text-gray-600 mt-1">إدارة خيارات الطباعة للأوراق والمستندات</p>
                </div>
                <button
                  onClick={() => navigate('/print-options/add')}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                >
                  <Plus size={18} />
                  إضافة خيار طباعة
                </button>
              </div>

              <div className="glass-card border border-white/40 shadow-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Printer className="text-indigo-600" size={24} />
                  <h3 className="text-xl font-bold text-gray-900">خيارات الطباعة المتاحة</h3>
                </div>
                <DataTable
                  data={printOptions}
                  columns={printOptionsColumns}
                  loading={printOptionsLoading}
                  searchable
                  searchPlaceholder="البحث في خيارات الطباعة..."
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
