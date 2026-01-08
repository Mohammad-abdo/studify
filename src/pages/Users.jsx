import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Filter, X, UserCheck, UserX, GraduationCap, Stethoscope, Truck, Briefcase, Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';
import DataTable from '../components/DataTable';

const UsersPage = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [limit] = useState(20);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (searchTerm) {
        params.append('search', searchTerm);
      }
      if (filterType) {
        params.append('type', filterType);
      }
      if (filterStatus) {
        params.append('isActive', filterStatus);
      }

      const response = await api.get(`/admin/users?${params.toString()}`);
      setUsers(response.data.data || []);
      setTotal(response.data.pagination?.total || 0);
    } catch (error) {
      console.error('Failed to load users:', error);
      if (error.response?.status === 429) {
        toast.error('Too many requests. Please wait a moment and try again.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to load users');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounce search term to reduce API calls
    const timeoutId = searchTerm 
      ? setTimeout(() => {
          fetchUsers();
        }, 500)
      : null;

    if (!searchTerm) {
      fetchUsers();
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [page, filterType, filterStatus, searchTerm]);

  const handleView = (user) => {
    navigate(`/users/${user.id}`);
  };

  const handleEdit = (user) => {
    navigate(`/users/edit/${user.id}`);
  };

  const handleToggleStatus = async (user) => {
    const action = user.isActive ? 'block' : 'activate';
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) {
      return;
    }

    try {
      // Try the block endpoint first, fallback to update endpoint
      try {
        await api.put(`/admin/users/${user.id}/block`, {
          isActive: !user.isActive,
        });
      } catch (blockError) {
        // If block endpoint doesn't exist, try update endpoint
        await api.put(`/admin/users/${user.id}`, {
          isActive: !user.isActive,
        });
      }
      toast.success(`User ${user.isActive ? 'blocked' : 'activated'} successfully`);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user status. Please implement the backend endpoint.');
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Are you sure you want to delete user "${user.phone}"?`)) {
      return;
    }

    try {
      await api.delete(`/admin/users/${user.id}`);
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const getUserTypeIcon = (type) => {
    switch (type) {
      case 'STUDENT':
        return <GraduationCap size={16} className="text-blue-600" />;
      case 'DOCTOR':
        return <Stethoscope size={16} className="text-green-600" />;
      case 'DELIVERY':
        return <Truck size={16} className="text-orange-600" />;
      case 'CUSTOMER':
        return <Briefcase size={16} className="text-purple-600" />;
      case 'ADMIN':
        return <Shield size={16} className="text-red-600" />;
      default:
        return <Users size={16} className="text-gray-600" />;
    }
  };

  const getUserProfileInfo = (user) => {
    if (user.student) {
      return {
        name: user.student.name,
        info: `${user.student.college?.name || 'N/A'} • ${user.student.department?.name || 'N/A'}`,
      };
    }
    if (user.doctor) {
      return {
        name: user.doctor.name,
        info: user.doctor.specialization || 'N/A',
      };
    }
    if (user.delivery) {
      return {
        name: user.delivery.name,
        info: user.delivery.vehicleType || 'N/A',
      };
    }
    if (user.customer) {
      return {
        name: user.customer.entityName || user.customer.contactPerson,
        info: user.customer.contactPerson || 'N/A',
      };
    }
    return {
      name: 'Admin',
      info: 'System Administrator',
    };
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterType('');
    setFilterStatus('');
    setPage(1);
  };

  const hasActiveFilters = searchTerm || filterType || filterStatus;

  const columns = [
    {
      header: 'Avatar',
      accessor: 'avatarUrl',
      width: '70px',
      align: 'center',
      hideOnMobile: true,
      render: (user) => {
        const profileInfo = getUserProfileInfo(user);
        return (
          <div className="flex justify-center">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl.startsWith('http') ? user.avatarUrl : `${api.defaults.baseURL.replace('/api', '')}${user.avatarUrl}`}
                alt={profileInfo.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-blue-200"
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profileInfo.name)}&background=3b82f6&color=fff&size=64`;
                }}
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center border-2 border-blue-200">
                <Users className="text-blue-600" size={18} />
              </div>
            )}
          </div>
        );
      },
    },
    {
      header: 'User',
      accessor: 'phone',
      render: (user) => {
        const profileInfo = getUserProfileInfo(user);
        return (
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {getUserTypeIcon(user.type)}
              <div className="font-medium text-sm sm:text-base text-gray-900 truncate">
                {profileInfo.name}
              </div>
            </div>
            <div className="text-xs sm:text-sm text-gray-500 truncate">{user.phone}</div>
            {user.email && (
              <div className="text-xs text-gray-400 truncate">{user.email}</div>
            )}
          </div>
        );
      },
    },
    {
      header: 'Type',
      accessor: 'type',
      align: 'center',
      render: (user) => (
        <span className={`badge ${
          user.type === 'STUDENT' ? 'badge-info' :
          user.type === 'DOCTOR' ? 'badge-success' :
          user.type === 'DELIVERY' ? 'badge-warning' :
          user.type === 'CUSTOMER' ? 'badge-neutral' :
          'badge-danger'
        }`}>
          {user.type}
        </span>
      ),
    },
    {
      header: 'Profile Info',
      accessor: 'profile',
      hideOnMobile: true,
      render: (user) => {
        const profileInfo = getUserProfileInfo(user);
        return (
          <div className="text-xs sm:text-sm text-gray-600 max-w-xs">
            <div className="truncate">{profileInfo.info}</div>
          </div>
        );
      },
    },
    {
      header: 'Status',
      accessor: 'isActive',
      align: 'center',
      render: (user) => (
        <span className={`badge ${user.isActive ? 'badge-success' : 'badge-danger'}`}>
          {user.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      header: 'Created',
      accessor: 'createdAt',
      hideOnMobile: true,
      render: (user) => (
        <div className="text-xs sm:text-sm text-gray-600">
          {new Date(user.createdAt).toLocaleDateString()}
        </div>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      align: 'right',
      width: '120px',
      render: (user) => (
        <div className="flex items-center justify-end gap-1 sm:gap-2">
          <button
            onClick={() => handleToggleStatus(user)}
            className="p-1.5 sm:p-2 rounded-md text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-150"
            title={user.isActive ? 'Block User' : 'Activate User'}
          >
            {user.isActive ? <UserX size={14} className="sm:w-4 sm:h-4" /> : <UserCheck size={14} className="sm:w-4 sm:h-4" />}
          </button>
          <button
            onClick={() => handleDelete(user)}
            className="p-1.5 sm:p-2 rounded-md text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors duration-150"
            title="Delete User"
          >
            <X size={14} className="sm:w-4 sm:h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-5 lg:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-900 mb-0.5 sm:mb-1">Users</h1>
          <p className="text-xs sm:text-sm text-gray-600">Manage all system users</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary flex items-center justify-center gap-2 ${
              showFilters || hasActiveFilters ? 'bg-blue-50 border-blue-300' : ''
            }`}
          >
            <Filter size={16} />
            <span className="hidden sm:inline">Filters</span>
            {hasActiveFilters && (
              <span className="bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                {[searchTerm, filterType, filterStatus].filter(Boolean).length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="card-elevated">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm sm:text-base font-semibold text-gray-900">Filter Users</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                Search (Phone/Email)
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by phone or email..."
                className="input-field"
              />
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                User Type
              </label>
              <select
                value={filterType}
                onChange={(e) => {
                  setFilterType(e.target.value);
                  setPage(1);
                }}
                className="input-field"
              >
                <option value="">All Types</option>
                <option value="STUDENT">Student</option>
                <option value="DOCTOR">Doctor</option>
                <option value="DELIVERY">Delivery</option>
                <option value="CUSTOMER">Customer</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setPage(1);
                }}
                className="input-field"
              >
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="btn-secondary w-full flex items-center justify-center gap-2"
                >
                  <X size={16} />
                  <span>Clear Filters</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && !showFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs sm:text-sm text-gray-600 font-medium">Active filters:</span>
          {searchTerm && (
            <span className="badge badge-info flex items-center gap-1">
              Search: {searchTerm}
              <button
                onClick={() => {
                  setSearchTerm('');
                  setPage(1);
                }}
                className="ml-1 hover:text-blue-800"
              >
                <X size={12} />
              </button>
            </span>
          )}
          {filterType && (
            <span className="badge badge-info flex items-center gap-1">
              Type: {filterType}
              <button
                onClick={() => {
                  setFilterType('');
                  setPage(1);
                }}
                className="ml-1 hover:text-blue-800"
              >
                <X size={12} />
              </button>
            </span>
          )}
          {filterStatus && (
            <span className="badge badge-info flex items-center gap-1">
              Status: {filterStatus === 'true' ? 'Active' : 'Inactive'}
              <button
                onClick={() => {
                  setFilterStatus('');
                  setPage(1);
                }}
                className="ml-1 hover:text-blue-800"
              >
                <X size={12} />
              </button>
            </span>
          )}
        </div>
      )}

      {/* Data Table */}
      <DataTable
        data={users}
        columns={columns}
        loading={loading}
        searchable={false}
        onView={handleView}
        onEdit={handleEdit}
      />

      {/* Server-side Pagination */}
      {total > limit && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 md:px-5 lg:px-6 xl:px-7 py-3 md:py-3.5 lg:py-4 border border-blue-200 rounded-lg bg-white">
          <div className="text-sm md:text-base font-medium text-gray-700">
            Showing <span className="font-semibold">{(page - 1) * limit + 1}</span> to{' '}
            <span className="font-semibold">{Math.min(page * limit, total)}</span> of{' '}
            <span className="font-semibold">{total}</span> users
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page === 1}
              className="btn-secondary p-2 min-h-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-3 py-2 rounded-md border border-blue-200 bg-white text-sm font-medium text-gray-900">
              Page {page} of {Math.ceil(total / limit)}
            </span>
            <button
              onClick={() => setPage((prev) => Math.min(Math.ceil(total / limit), prev + 1))}
              disabled={page >= Math.ceil(total / limit)}
              className="btn-secondary p-2 min-h-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Action Buttons in Table Row */}
      <style>{`
        .action-buttons {
          display: flex;
          gap: 0.5rem;
        }
      `}</style>
    </div>
  );
};

export default UsersPage;
