import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, X, Search, Filter, ShoppingBag, ArrowRight } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import DataTable from '../components/DataTable';
import PageHeader from '../components/PageHeader';
import { EmptyStates } from '../components/EmptyState';
import { useLanguage } from '../context/LanguageContext';

const Products = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';
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
      toast.error(isRTL ? 'فشل تحميل المنتجات' : 'Failed to load products');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (product) => {
    const result = await Swal.fire({
      title: isRTL ? 'إزالة المنتج؟' : 'Remove Product?',
      text: isRTL ? `هل أنت متأكد أنك تريد حذف "${product.name}"؟` : `Are you sure you want to delete "${product.name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f43f5e',
      cancelButtonColor: '#64748b',
      confirmButtonText: isRTL ? 'نعم، قم بالإزالة' : 'Yes, remove it',
      reverseButtons: isRTL
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/products/${product.id}`);
        toast.success(isRTL ? 'تم حذف المنتج بنجاح' : 'Product deleted successfully');
        fetchProducts();
      } catch (error) {
        toast.error(isRTL ? 'فشل حذف المنتج' : 'Failed to delete product');
      }
    }
  };

  const columns = [
    {
      header: t('pages.products.visual'),
      accessor: 'imageUrls',
      width: '120px',
      hideOnMobile: true,
      render: (product) => {
        const images = Array.isArray(product.imageUrls) ? product.imageUrls : [];
        const firstImage = images[0];
        return (
          <div className="flex items-center -space-x-3 hover:space-x-1 transition-all duration-300">
            {images.length > 0 ? (
              images.slice(0, 3).map((img, idx) => (
                <div key={idx} className="w-12 h-12 rounded-xl border-2 border-white shadow-sm overflow-hidden bg-white">
                  <img
                    src={img.startsWith('http') ? img : `${api.defaults.baseURL.replace('/api', '')}${img}`}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(product.name)}&background=f97316&color=fff&size=48`;
                    }}
                  />
                </div>
              ))
            ) : (
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-300 border-2 border-white shadow-sm">
                <Package size={20} />
              </div>
            )}
            {images.length > 3 && (
              <div className="w-8 h-8 rounded-full bg-slate-900 text-[10px] font-black text-white flex items-center justify-center border-2 border-white shadow-sm z-10">
                +{images.length - 3}
              </div>
            )}
          </div>
        );
      },
    },
    {
      header: t('pages.products.productDetails'),
      accessor: 'name',
      render: (product) => (
        <div className="flex flex-col gap-1">
          <span className="font-black text-slate-900 tracking-tight">{product.name}</span>
          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">{product.category?.name || t('pages.products.generalMerchant')}</span>
        </div>
      ),
    },
    {
      header: t('pages.products.marketValue'),
      accessor: 'pricing',
      render: (product) => (
        <div className="flex flex-col">
          {product.pricing && product.pricing.length > 0 ? (
            <>
              <span className="text-sm font-black text-slate-900">${product.pricing[0].price?.toFixed(2)}</span>
              <span className="text-[10px] font-medium text-slate-400">{product.pricing.length > 1 ? `${product.pricing.length} ${t('pages.products.pricingTiers')}` : t('pages.products.standardPrice')}</span>
            </>
          ) : (
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">{t('pages.products.noPricingSet')}</span>
          )}
        </div>
      ),
    },
    {
      header: t('pages.products.systemId'),
      accessor: 'id',
      hideOnMobile: true,
      render: (product) => (
        <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded-md">
          {product.id.slice(0, 12)}...
        </span>
      ),
    },
    {
      header: t('pages.products.catalogDate'),
      accessor: 'createdAt',
      hideOnMobile: true,
      render: (product) => (
        <span className="text-xs font-bold text-slate-500">
          {new Date(product.createdAt).toLocaleDateString(isRTL ? 'ar-EG' : undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 2xl:space-y-8 page-transition">
      <PageHeader
        title={t('pages.products.title')}
        subtitle={t('pages.products.subtitle')}
        breadcrumbs={[
          { label: t('menu.products') },
        ]}
        actionLabel={t('pages.products.addProduct')}
        actionPath="/products/add"
      />

      {/* High-End Filter Bar */}
      <div className="card-premium p-4 2xl:p-6 bg-white border-none shadow-xl shadow-slate-200/50">
        <div className="flex flex-col lg:flex-row gap-4 2xl:gap-6">
          <div className="flex-1 relative">
            <Search size={20} className={`absolute top-1/2 -translate-y-1/2 text-slate-400 ${isRTL ? 'right-4' : 'left-4'}`} />
            <input
              type="text"
              placeholder={t('pages.products.search')}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className={`w-full bg-slate-50 border-none rounded-2xl py-3.5 2xl:py-4 font-bold text-sm 2xl:text-base focus:ring-4 focus:ring-blue-500/10 transition-all ${isRTL ? 'pr-12' : 'pl-12'}`}
            />
          </div>
          
          <div className="flex items-center gap-3">
            <button className="p-3.5 2xl:p-4 bg-slate-50 text-slate-400 rounded-2xl hover:text-slate-900 transition-all">
              <Filter size={20} />
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{isRTL ? 'جاري مزامنة المخزون' : 'Inventory Sync in Progress'}</span>
        </div>
      ) : products.length === 0 ? (
        <div className="fade-in">
          {searchTerm ? (
            <EmptyStates.Search searchTerm={searchTerm} />
          ) : (
            <EmptyStates.Products />
          )}
        </div>
      ) : (
        <div className="fade-in">
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
        </div>
      )}
    </div>
  );
};

export default Products;
