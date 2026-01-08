import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, Users, Phone, Mail, Calendar, UserCheck, UserX, GraduationCap, Stethoscope, Truck, Briefcase, Shield, Building, MapPin } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';

const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/users/${id}`);
      setUser(response.data.data || response.data);
    } catch (error) {
      toast.error('Failed to load user');
      navigate('/users');
    } finally {
      setLoading(false);
    }
  };

  const getUserTypeIcon = (type) => {
    switch (type) {
      case 'STUDENT':
        return <GraduationCap size={20} className="text-blue-600" />;
      case 'DOCTOR':
        return <Stethoscope size={20} className="text-green-600" />;
      case 'DELIVERY':
        return <Truck size={20} className="text-orange-600" />;
      case 'CUSTOMER':
        return <Briefcase size={20} className="text-purple-600" />;
      case 'ADMIN':
        return <Shield size={20} className="text-red-600" />;
      default:
        return <Users size={20} className="text-gray-600" />;
    }
  };

  const getUserProfileInfo = (user) => {
    if (user.student) {
      return {
        type: 'Student',
        name: user.student.name,
        fields: [
          { label: 'College', value: user.student.college?.name || 'N/A', icon: Building },
          { label: 'Department', value: user.student.department?.name || 'N/A', icon: GraduationCap },
        ],
      };
    }
    if (user.doctor) {
      return {
        type: 'Doctor',
        name: user.doctor.name,
        fields: [
          { label: 'Specialization', value: user.doctor.specialization || 'N/A', icon: Stethoscope },
          { label: 'Approval Status', value: user.doctor.approvalStatus || 'N/A', icon: UserCheck },
        ],
      };
    }
    if (user.delivery) {
      return {
        type: 'Delivery',
        name: user.delivery.name,
        fields: [
          { label: 'Vehicle Type', value: user.delivery.vehicleType || 'N/A', icon: Truck },
          { label: 'Status', value: user.delivery.status || 'N/A', icon: MapPin },
        ],
      };
    }
    if (user.customer) {
      return {
        type: 'Customer',
        name: user.customer.entityName || user.customer.contactPerson,
        fields: [
          { label: 'Contact Person', value: user.customer.contactPerson || 'N/A', icon: Users },
          { label: 'Entity Name', value: user.customer.entityName || 'N/A', icon: Briefcase },
        ],
      };
    }
    return {
      type: 'Admin',
      name: 'System Administrator',
      fields: [],
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">User not found</p>
      </div>
    );
  }

  const profileInfo = getUserProfileInfo(user);

  return (
    <div className="space-y-4 sm:space-y-5 lg:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => navigate('/users')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-900">{profileInfo.name}</h1>
            <p className="text-xs sm:text-sm text-gray-600">User Details</p>
          </div>
        </div>
        <button
          onClick={() => navigate(`/users/edit/${id}`)}
          className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto"
        >
          <Edit size={16} />
          <span>Edit User</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
        {/* Main Info Card */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-5 lg:space-y-6">
          {/* User Info */}
          <div className="card-elevated">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">User Information</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl.startsWith('http') ? user.avatarUrl : `${api.defaults.baseURL.replace('/api', '')}${user.avatarUrl}`}
                    alt={profileInfo.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-blue-200"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profileInfo.name)}&background=3b82f6&color=fff&size=128`;
                    }}
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center border-2 border-blue-200">
                    <Users className="text-blue-600" size={32} />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {getUserTypeIcon(user.type)}
                    <span className="text-lg sm:text-xl font-semibold text-gray-900">{profileInfo.name}</span>
                  </div>
                  <span className={`badge ${
                    user.type === 'STUDENT' ? 'badge-info' :
                    user.type === 'DOCTOR' ? 'badge-success' :
                    user.type === 'DELIVERY' ? 'badge-warning' :
                    user.type === 'CUSTOMER' ? 'badge-neutral' :
                    'badge-danger'
                  }`}>
                    {user.type}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-blue-200">
                <div className="flex items-center gap-3">
                  <Phone size={18} className="text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="text-sm sm:text-base font-medium text-gray-900">{user.phone || 'N/A'}</p>
                  </div>
                </div>
                {user.email && (
                  <div className="flex items-center gap-3">
                    <Mail size={18} className="text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-sm sm:text-base font-medium text-gray-900">{user.email}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Calendar size={18} className="text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Created At</p>
                    <p className="text-sm sm:text-base font-medium text-gray-900">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {user.isActive ? (
                    <UserCheck size={18} className="text-green-600" />
                  ) : (
                    <UserX size={18} className="text-red-600" />
                  )}
                  <div>
                    <p className="text-xs text-gray-500">Status</p>
                    <span className={`badge ${user.isActive ? 'badge-success' : 'badge-danger'}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          {profileInfo.fields.length > 0 && (
            <div className="card-elevated">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">{profileInfo.type} Profile</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {profileInfo.fields.map((field, index) => {
                  const Icon = field.icon;
                  return (
                    <div key={index} className="flex items-center gap-3">
                      <Icon size={18} className="text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">{field.label}</p>
                        <p className="text-sm sm:text-base font-medium text-gray-900">{field.value}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4 sm:space-y-5 lg:space-y-6">
          {/* Quick Actions */}
          <div className="card-elevated">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <button
                onClick={() => navigate(`/users/edit/${id}`)}
                className="w-full btn-secondary flex items-center justify-center gap-2"
              >
                <Edit size={16} />
                <span>Edit User</span>
              </button>
              <button
                onClick={async () => {
                  if (!window.confirm(`Are you sure you want to ${user.isActive ? 'block' : 'activate'} this user?`)) {
                    return;
                  }
                  try {
                    await api.put(`/admin/users/${id}`, {
                      isActive: !user.isActive,
                    });
                    toast.success(`User ${user.isActive ? 'blocked' : 'activated'} successfully`);
                    await fetchUser();
                  } catch (error) {
                    toast.error(error.response?.data?.message || 'Failed to update user status');
                  }
                }}
                className={`w-full btn-secondary flex items-center justify-center gap-2 ${
                  user.isActive ? 'hover:bg-red-50 hover:border-red-200 hover:text-red-600' : 'hover:bg-green-50 hover:border-green-200 hover:text-green-600'
                }`}
              >
                {user.isActive ? <UserX size={16} /> : <UserCheck size={16} />}
                <span>{user.isActive ? 'Block User' : 'Activate User'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetail;

