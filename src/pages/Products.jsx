import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, X, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';
import DataTable from '../components/DataTable';
import PageHeader from '../components/PageHeader';
import EmptyState, { EmptyStates } from '../components/EmptyState';
import LoadingState from '../components/LoadingState';

const Products = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchProducts();
  }, [page, searchTerm]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (searchTerm) params.append('search', searchTerm);

      const response = await api.get(`/products?${params}`);
      const data = response.data.data || response.data;
      
      // Parse imageUrls if it's a string
      const productsWithParsedImages = Array.isArray(data) ? data.map(product => {
        if (product.imageUrls && typeof product.imageUrls === 'string') {
          try {
            product.imageUrls = JSON.parse(product.imageUrls);
          } catch (e) {
            product.imageUrls = [];
          }
        }
        return product;
      }) : [];
      
      setProducts(productsWithParsedImages);
      setTotal(response.data.pagination?.total || productsWithParsedImages.length || 0);
    } catch (error) {
      toast.error('Failed to load products');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
      return;
    }

    try {
      await api.delete(`/products/${product.id}`);
      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete product');
    }
  };

  const columns = [
    {
      header: 'Images',
      accessor: 'imageUrls',
      width: '100px',
      align: 'center',
      hideOnMobile: true,
      render: (product) => {
        const images = Array.isArray(product.imageUrls) ? product.imageUrls : [];
        return (
          <div className="flex justify-center gap-1">
            {images.length > 0 ? (
              images.slice(0, 2).map((img, idx) => (
                <img
                  key={idx}
                  src={img.startsWith('http') ? img : `${api.defaults.baseURL.replace('/api', '')}${img}`}
                  alt={`${product.name} ${idx + 1}`}
                  className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded border border-gray-200"
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(product.name)}&background=f97316&color=fff&size=48`;
                  }}
                />
              ))
            ) : (
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-md flex items-center justify-center">
                <Package className="text-gray-400" size={16} />
              </div>
            )}
            {images.length > 2 && (
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-md flex items-center justify-center text-xs font-medium text-gray-600">
                +{images.length - 2}
              </div>
            )}
          </div>
        );
      },
    },
    {
      header: 'Name',
      accessor: 'name',
      render: (product) => (
        <div className="min-w-0">
          <div className="font-medium text-sm sm:text-base text-gray-900 truncate">{product.name}</div>
          <div className="text-xs sm:text-sm text-gray-500 truncate">{product.category?.name}</div>
        </div>
      ),
    },
    {
      header: 'Description',
      accessor: 'description',
      hideOnMobile: true,
      render: (product) => (
        <div className="max-w-xs">
          <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">{product.description}</p>
        </div>
      ),
    },
    {
      header: 'Pricing',
      accessor: 'pricing',
      align: 'right',
      render: (product) => (
        <div className="text-xs sm:text-sm">
          {product.pricing && product.pricing.length > 0 ? (
            <div>
              <div className="font-medium text-gray-900">${product.pricing[0].price?.toFixed(2) || '0.00'}</div>
              {product.pricing.length > 1 && (
                <div className="text-gray-500 text-xs">{product.pricing.length} tiers</div>
              )}
            </div>
          ) : (
            <span className="text-gray-400">No pricing</span>
          )}
        </div>
      ),
    },
    {
      header: 'Created',
      accessor: 'createdAt',
      hideOnMobile: true,
      render: (product) => (
        <div className="text-xs sm:text-sm text-gray-600">
          {new Date(product.createdAt).toLocaleDateString()}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        subtitle="Manage all products in the system"
        breadcrumbs={[
          { label: 'Dashboard', path: '/' },
          { label: 'Products' },
        ]}
        actionLabel="Add Product"
        actionPath="/products/add"
      />

      {/* Filters */}
      <div className="card-elevated">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="input-field w-full"
            />
          </div>
        </div>

        {/* Active Filters */}
        {searchTerm && (
          <div className="mt-4 flex flex-wrap gap-2">
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
          </div>
        )}
      </div>

      {/* Data Table */}
      {loading ? (
        <LoadingState message="Loading products..." />
      ) : products.length === 0 ? (
        searchTerm ? (
          <EmptyStates.Search searchTerm={searchTerm} />
        ) : (
          <EmptyStates.Products />
        )
      ) : (
        <>
          <DataTable
            data={products}
            columns={columns}
            loading={false}
            searchable={false}
            serverSide={true}
            total={total}
            page={page}
            limit={limit}
            onPageChange={setPage}
            onView={(product) => navigate(`/products/${product.id}`)}
            onEdit={(product) => navigate(`/products/edit/${product.id}`)}
            onDelete={handleDelete}
          />
        </>
      )}
    </div>
  );
};

export default Products;
