import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Eye, Edit, Trash2, Plus, X, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';
import DataTable from '../components/DataTable';
import PageHeader from '../components/PageHeader';
import EmptyState, { EmptyStates } from '../components/EmptyState';
import LoadingState from '../components/LoadingState';

const Materials = () => {
  const navigate = useNavigate();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    fetchMaterials();
  }, [page, searchTerm, filterStatus]);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (searchTerm) params.append('search', searchTerm);
      if (filterStatus) params.append('approvalStatus', filterStatus);

      const response = await api.get(`/materials?${params}`);
      const data = response.data.data || response.data;
      setMaterials(Array.isArray(data) ? data : []);
      setTotal(response.data.pagination?.total || data.length || 0);
    } catch (error) {
      toast.error('Failed to load materials');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this material?')) {
      return;
    }
    try {
      await api.delete(`/materials/${id}`);
      toast.success('Material deleted successfully');
      fetchMaterials();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete material');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      APPROVED: 'badge-success',
      PENDING: 'badge-warning',
      REJECTED: 'badge-danger',
    };
    return badges[status] || 'badge-neutral';
  };

  const columns = [
    {
      header: 'Title',
      accessor: 'title',
      render: (item) => (
        <div className="font-medium text-gray-900">{item.title}</div>
      ),
    },
    {
      header: 'Category',
      accessor: 'category.name',
      hideOnMobile: true,
    },
    {
      header: 'Doctor',
      accessor: 'doctor.user.phone',
      hideOnMobile: true,
      render: (item) => item.doctor?.user?.phone || 'N/A',
    },
    {
      header: 'Status',
      accessor: 'approvalStatus',
      render: (item) => (
        <span className={`badge ${getStatusBadge(item.approvalStatus)}`}>
          {item.approvalStatus}
        </span>
      ),
    },
    {
      header: 'Downloads',
      accessor: 'downloadCount',
      align: 'right',
      hideOnMobile: true,
      render: (item) => item.downloadCount || 0,
    },
    {
      header: 'Created',
      accessor: 'createdAt',
      hideOnMobile: true,
      render: (item) => new Date(item.createdAt).toLocaleDateString(),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Materials"
        subtitle="Manage study materials"
        breadcrumbs={[
          { label: 'Dashboard', path: '/' },
          { label: 'Materials' },
        ]}
        actionLabel="Add Material"
        actionPath="/materials/add"
      />

      {/* Filters */}
      <div className="card-elevated">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search materials..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="input-field w-full"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setPage(1);
            }}
            className="input-field"
          >
            <option value="">All Status</option>
            <option value="APPROVED">Approved</option>
            <option value="PENDING">Pending</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        {/* Active Filters */}
        {(searchTerm || filterStatus) && (
          <div className="mt-4 flex flex-wrap gap-2">
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
            {filterStatus && (
              <span className="badge badge-info flex items-center gap-1">
                Status: {filterStatus}
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
      </div>

      {/* Data Table */}
      {loading ? (
        <LoadingState message="Loading materials..." />
      ) : materials.length === 0 ? (
        <EmptyStates.Search searchTerm={searchTerm} />
      ) : (
        <>
          <DataTable
            data={materials}
            columns={columns}
            loading={false}
            searchable={false}
            onView={(item) => navigate(`/materials/${item.id}`)}
            onEdit={(item) => navigate(`/materials/edit/${item.id}`)}
            onDelete={handleDelete}
          />

          {/* Server-side Pagination */}
          {total > limit && (
            <div className="card-elevated flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-sm font-medium text-gray-700">
                Showing <span className="font-semibold">{(page - 1) * limit + 1}</span> to{' '}
                <span className="font-semibold">{Math.min(page * limit, total)}</span> of{' '}
                <span className="font-semibold">{total}</span> materials
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
        </>
      )}
    </div>
  );
};

export default Materials;

