import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tag, Plus, X } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';
import DataTable from '../components/DataTable';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import LoadingState from '../components/LoadingState';

const Categories = () => {
  const navigate = useNavigate();
  const [bookCategories, setBookCategories] = useState([]);
  const [productCategories, setProductCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('books'); // 'books' or 'products'

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const [bookRes, productRes] = await Promise.all([
        api.get('/categories/books'),
        api.get('/categories/products'),
      ]);
      setBookCategories(bookRes.data.data || bookRes.data || []);
      setProductCategories(productRes.data.data || productRes.data || []);
    } catch (error) {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, type) => {
    if (!window.confirm(`Are you sure you want to delete this ${type} category?`)) {
      return;
    }

    try {
      await api.delete(`/categories/${type}/${id}`);
      toast.success('Category deleted successfully');
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete category');
    }
  };

  const categories = activeTab === 'books' ? bookCategories : productCategories;
  const filteredCategories = categories.filter((cat) =>
    cat.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      header: 'Name',
      accessor: 'name',
    },
    {
      header: activeTab === 'books' ? 'Books' : 'Products',
      accessor: activeTab === 'books' ? '_count.books' : '_count.products',
      align: 'right',
      render: (cat) =>
        activeTab === 'books'
          ? cat._count?.books || 0
          : cat._count?.products || 0,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categories"
        subtitle="Manage book and product categories"
        breadcrumbs={[
          { label: 'Dashboard', path: '/' },
          { label: 'Categories' },
        ]}
        actionLabel="Add Category"
        actionPath={`/categories/add?type=${activeTab}`}
      />

      {/* Tabs */}
      <div className="card-elevated flex gap-2">
        <button
          onClick={() => setActiveTab('books')}
          className={`px-4 py-2 rounded-md text-sm font-medium border ${
            activeTab === 'books'
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-700 border-blue-200 hover:bg-blue-50'
          }`}
        >
          Book Categories
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 rounded-md text-sm font-medium border ${
            activeTab === 'products'
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-700 border-blue-200 hover:bg-blue-50'
          }`}
        >
          Product Categories
        </button>
      </div>

      {/* Search */}
      <div className="card-elevated">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder={`Search ${activeTab} categories...`}
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
        <LoadingState message="Loading categories..." />
      ) : filteredCategories.length === 0 ? (
        <EmptyState
          icon={Tag}
          title="No categories found"
          description="Try adjusting your search or add a new category."
          actionLabel="Add Category"
          onAction={() => navigate(`/categories/add?type=${activeTab}`)}
        />
      ) : (
        <DataTable
          data={filteredCategories}
          columns={columns}
          loading={false}
          searchable={false}
          onEdit={(cat) => navigate(`/categories/edit/${activeTab}/${cat.id}`)}
          onDelete={(cat) => handleDelete(cat.id, activeTab)}
        />
      )}
    </div>
  );
};

export default Categories;


