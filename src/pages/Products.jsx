import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, Plus } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';
import DataTable from '../components/DataTable';

const Products = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchProducts();
  }, [page]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/products?page=${page}&limit=100`);
      setProducts(response.data.data || []);
      setTotal(response.data.pagination?.total || 0);
    } catch (error) {
      toast.error('Failed to load products');
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

  const filteredProducts = products.filter((product) =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      header: 'Images',
      accessor: 'imageUrls',
      width: '120px',
      align: 'center',
      render: (product) => {
        const images = product.imageUrls || [];
        return (
          <div className="flex justify-center gap-1">
            {images.length > 0 ? (
              images.slice(0, 3).map((img, idx) => (
                <img
                  key={idx}
                  src={img.startsWith('http') ? img : `${api.defaults.baseURL.replace('/api', '')}${img}`}
                  alt={`${product.name} ${idx + 1}`}
                  className="w-12 h-12 object-cover rounded border border-gray-200"
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(product.name)}&background=f97316&color=fff&size=48`;
                  }}
                />
              ))
            ) : (
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <Package className="text-gray-400" size={20} />
              </div>
            )}
            {images.length > 3 && (
              <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center text-xs font-medium text-gray-600">
                +{images.length - 3}
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
        <div>
          <div className="font-medium text-gray-900">{product.name}</div>
          <div className="text-sm text-gray-500">{product.category?.name}</div>
        </div>
      ),
    },
    {
      header: 'Description',
      accessor: 'description',
      render: (product) => (
        <div className="max-w-md">
          <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
        </div>
      ),
    },
    {
      header: 'Pricing',
      accessor: 'pricing',
      render: (product) => (
        <div className="text-sm">
          {product.pricing && product.pricing.length > 0 ? (
            <div>
              <div className="font-medium text-gray-900">${product.pricing[0].price}</div>
              {product.pricing.length > 1 && (
                <div className="text-gray-500">{product.pricing.length} tiers</div>
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
      render: (product) => (
        <div className="text-sm text-gray-600">
          {new Date(product.createdAt).toLocaleDateString()}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-1">Manage all products in the system</p>
        </div>
        <button 
          onClick={() => navigate('/products/add')}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Add Product
        </button>
      </motion.div>

      <DataTable
        data={filteredProducts}
        columns={columns}
        loading={loading}
        searchable
        searchPlaceholder="Search products by name, category, or description..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        onView={(product) => navigate(`/products/${product.id}`)}
        onEdit={(product) => navigate(`/products/edit/${product.id}`)}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default Products;
