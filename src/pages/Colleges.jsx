import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Plus, X } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';
import DataTable from '../components/DataTable';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import LoadingState from '../components/LoadingState';

const Colleges = () => {
  const navigate = useNavigate();
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchColleges();
  }, []);

  const fetchColleges = async () => {
    try {
      setLoading(true);
      const response = await api.get('/colleges');
      setColleges(response.data.data || response.data || []);
    } catch (error) {
      toast.error('Failed to load colleges');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this college?')) {
      return;
    }

    try {
      await api.delete(`/colleges/${id}`);
      toast.success('College deleted successfully');
      fetchColleges();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete college');
    }
  };

  const filteredColleges = colleges.filter((college) =>
    college.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      header: 'Name',
      accessor: 'name',
    },
    {
      header: 'Departments',
      accessor: '_count.departments',
      align: 'right',
      render: (college) => college._count?.departments || 0,
    },
    {
      header: 'Created',
      accessor: 'createdAt',
      hideOnMobile: true,
      render: (college) => new Date(college.createdAt).toLocaleDateString(),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Colleges"
        subtitle="Manage all colleges in the system"
        breadcrumbs={[
          { label: 'Dashboard', path: '/' },
          { label: 'Colleges' },
        ]}
        actionLabel="Add College"
        actionPath="/colleges/add"
      />

      {/* Filters */}
      <div className="card-elevated">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search colleges..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field w-full"
            />
          </div>
        </div>

        {searchTerm && (
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="badge badge-info flex items-center gap-1">
              Search: {searchTerm}
              <button
                onClick={() => setSearchTerm('')}
                className="ml-1 hover:text-blue-800"
              >
                <X size={12} />
              </button>
            </span>
          </div>
        )}
      </div>

      {/* Data Table */}
      {loading ? (
        <LoadingState message="Loading colleges..." />
      ) : filteredColleges.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No colleges found"
          description="Try adjusting your search or add a new college."
          actionLabel="Add College"
          onAction={() => navigate('/colleges/add')}
        />
      ) : (
        <DataTable
          data={filteredColleges}
          columns={columns}
          loading={false}
          searchable={false}
          onEdit={(college) => navigate(`/colleges/edit/${college.id}`)}
          onDelete={(college) => handleDelete(college.id)}
        />
      )}
    </div>
  );
};

export default Colleges;


