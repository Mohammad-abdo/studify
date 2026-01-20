import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Plus, X } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';
import DataTable from '../components/DataTable';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import LoadingState from '../components/LoadingState';

const Onboarding = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await api.get('/onboarding');
      setItems(response.data.data || response.data || []);
    } catch (error) {
      toast.error('Failed to load onboarding items');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this onboarding item?')) {
      return;
    }

    try {
      await api.delete(`/onboarding/${id}`);
      toast.success('Onboarding item deleted successfully');
      fetchItems();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete onboarding item');
    }
  };

  const filteredItems = items.filter((item) =>
    item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      header: 'Order',
      accessor: 'order',
      align: 'right',
    },
    {
      header: 'Title',
      accessor: 'title',
    },
    {
      header: 'Description',
      accessor: 'description',
      hideOnMobile: true,
      render: (item) =>
        item.description?.length > 80
          ? item.description.slice(0, 80) + '...'
          : item.description,
    },
    {
      header: 'Image',
      accessor: 'imageUrl',
      hideOnMobile: true,
      render: (item) =>
        item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-10 h-10 rounded object-cover border border-gray-200"
          />
        ) : (
          '—'
        ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Onboarding"
        subtitle="Manage onboarding screens"
        breadcrumbs={[
          { label: 'Dashboard', path: '/' },
          { label: 'Onboarding' },
        ]}
        actionLabel="Add Onboarding Item"
        actionPath="/onboarding/add"
      />

      {/* Search */}
      <div className="card-elevated">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search onboarding items..."
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
        <LoadingState message="Loading onboarding items..." />
      ) : filteredItems.length === 0 ? (
        <EmptyState
          icon={ArrowRight}
          title="No onboarding items found"
          description="Try adjusting your search or add a new onboarding item."
          actionLabel="Add Onboarding Item"
          onAction={() => navigate('/onboarding/add')}
        />
      ) : (
        <DataTable
          data={filteredItems}
          columns={columns}
          loading={false}
          searchable={false}
          onEdit={(item) => navigate(`/onboarding/edit/${item.id}`)}
          onDelete={(item) => handleDelete(item.id)}
        />
      )}
    </div>
  );
};

export default Onboarding;


