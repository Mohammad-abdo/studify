import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Plus, X } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';
import DataTable from '../components/DataTable';
import PageHeader from '../components/PageHeader';
import EmptyState, { EmptyStates } from '../components/EmptyState';
import LoadingState from '../components/LoadingState';

const Departments = () => {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCollege, setSelectedCollege] = useState('');

  useEffect(() => {
    fetchColleges();
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchDepartments();
  }, [selectedCollege]);

  const fetchColleges = async () => {
    try {
      const response = await api.get('/colleges');
      setColleges(response.data.data || response.data || []);
    } catch (error) {
      toast.error('Failed to load colleges');
    }
  };

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const url = selectedCollege
        ? `/departments?collegeId=${selectedCollege}`
        : '/departments';
      const response = await api.get(url);
      setDepartments(response.data.data || response.data || []);
    } catch (error) {
      toast.error('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this department?')) {
      return;
    }

    try {
      await api.delete(`/departments/${id}`);
      toast.success('Department deleted successfully');
      fetchDepartments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete department');
    }
  };

  const filteredDepartments = departments.filter((dept) => {
    const matchesSearch = dept.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const columns = [
    {
      header: 'Name',
      accessor: 'name',
    },
    {
      header: 'College',
      accessor: 'college.name',
      render: (dept) => dept.college?.name || '—',
    },
    {
      header: 'Created',
      accessor: 'createdAt',
      hideOnMobile: true,
      render: (dept) => new Date(dept.createdAt).toLocaleDateString(),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Departments"
        subtitle="Manage all departments in the system"
        breadcrumbs={[
          { label: 'Dashboard', path: '/' },
          { label: 'Departments' },
        ]}
        actionLabel="Add Department"
        actionPath="/departments/add"
      />

      {/* Filters */}
      <div className="card-elevated">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search departments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field w-full"
            />
          </div>
          <div className="flex-1 flex gap-2">
            <select
              value={selectedCollege}
              onChange={(e) => setSelectedCollege(e.target.value)}
              className="input-field w-full"
            >
              <option value="">All Colleges</option>
              {colleges.map((college) => (
                <option key={college.id} value={college.id}>
                  {college.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {(searchTerm || selectedCollege) && (
          <div className="mt-4 flex flex-wrap gap-2">
            {searchTerm && (
              <span className="badge badge-info flex items-center gap-1">
                Search: {searchTerm}
                <button
                  onClick={() => setSearchTerm('')}
                  className="ml-1 hover:text-blue-800"
                >
                  <X size={12} />
                </button>
              </span>
            )}
            {selectedCollege && (
              <span className="badge badge-info flex items-center gap-1">
                College: {colleges.find((c) => c.id === selectedCollege)?.name || 'Selected'}
                <button
                  onClick={() => setSelectedCollege('')}
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
        <LoadingState message="Loading departments..." />
      ) : filteredDepartments.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="No departments found"
          description="Try adjusting your filters or add a new department."
          actionLabel="Add Department"
          onAction={() => navigate('/departments/add')}
        />
      ) : (
        <DataTable
          data={filteredDepartments}
          columns={columns}
          loading={false}
          searchable={false}
          onEdit={(dept) => navigate(`/departments/edit/${dept.id}`)}
          onDelete={(dept) => handleDelete(dept.id)}
        />
      )}
    </div>
  );
};

export default Departments;


