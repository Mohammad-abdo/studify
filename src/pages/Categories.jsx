import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tag, Plus, X, Search, BookOpen, Package, Layers } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import DataTable from '../components/DataTable';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import { useLanguage } from '../context/LanguageContext';

const Categories = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';
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
      toast.error(isRTL ? 'فشل مزامنة سجل التصنيفات' : 'Registry: Taxonomy sync failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (cat, type) => {
    const result = await Swal.fire({
      title: t('pages.categories.purgeClassification'),
      text: t('pages.categories.purgeTierDesc')
        .replace('{name}', cat.name)
        .replace('{type}', type === 'books' ? (isRTL ? 'كتب' : 'books') : (isRTL ? 'منتجات' : 'products')),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      confirmButtonText: isRTL ? 'تأكيد الحذف' : 'Confirm Purge',
      reverseButtons: isRTL
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/categories/${type}/${cat.id}`);
        toast.success(isRTL ? 'تم حذف التصنيف بنجاح' : 'Classification purged successfully');
        fetchCategories();
      } catch (error) {
        toast.error(isRTL ? 'فشل عملية الحذف' : 'Purge operation failed');
      }
    }
  };

  const categories = activeTab === 'books' ? bookCategories : productCategories;
  const filteredCategories = categories.filter((cat) =>
    cat.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      header: t('pages.categories.classificationIdentity'),
      accessor: 'name',
      render: (cat) => (
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border border-slate-100 shadow-sm ${activeTab === 'books' ? 'bg-blue-50 text-blue-600' : 'bg-indigo-50 text-indigo-600'}`}>
            {activeTab === 'books' ? <BookOpen size={20} /> : <Package size={20} />}
          </div>
          <div className="flex flex-col">
            <span className="font-black text-slate-900 tracking-tight">{cat.name}</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-mono">#{cat.id.slice(0, 8)}</span>
          </div>
        </div>
      )
    },
    {
      header: t('pages.categories.linkedAssets'),
      accessor: activeTab === 'books' ? '_count.books' : '_count.products',
      align: 'center',
      render: (cat) => {
        const count = activeTab === 'books' ? cat._count?.books || 0 : cat._count?.products || 0;
        return (
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-2 text-slate-700">
              <Layers size={14} className="text-slate-400" />
              <span className="text-sm font-black">{count}</span>
            </div>
            <span className="text-[9px] font-black uppercase text-slate-400">{t('pages.categories.totalEntries')}</span>
          </div>
        );
      }
    },
  ];

  return (
    <div className="space-y-6 2xl:space-y-8 page-transition">
      <PageHeader
        title={t('pages.categories.title')}
        subtitle={t('pages.categories.subtitle')}
        breadcrumbs={[{ label: t('menu.categories') }]}
        actionLabel={t('pages.categories.addCategory')}
        actionPath={`/categories/add?type=${activeTab}`}
      />

      <div className="flex flex-col lg:flex-row gap-6 2xl:gap-8 items-start">
        {/* Modern Tab Sidebar */}
        <div className="w-full lg:w-64 2xl:w-72 space-y-2 shrink-0">
          <button
            onClick={() => setActiveTab('books')}
            className={`w-full flex items-center gap-4 px-5 py-4 2xl:py-5 rounded-2xl transition-all duration-300 ${
              activeTab === 'books'
                ? 'bg-slate-900 text-white shadow-2xl shadow-slate-300 font-black scale-[1.02]'
                : 'bg-white text-slate-500 hover:bg-slate-50 font-bold border border-slate-100'
            }`}
          >
            <BookOpen size={20} className="2xl:w-6 2xl:h-6" />
            <div className={`flex flex-col ${isRTL ? 'items-end' : 'items-start'}`}>
              <span className="text-sm 2xl:text-base">{t('pages.categories.bookCategories')}</span>
              <span className={`text-[10px] 2xl:text-xs uppercase tracking-widest ${activeTab === 'books' ? 'text-blue-400' : 'text-slate-400'}`}>{bookCategories.length} {isRTL ? 'فئات' : 'Categories'}</span>
            </div>
          </button>
          
          <button
            onClick={() => setActiveTab('products')}
            className={`w-full flex items-center gap-4 px-5 py-4 2xl:py-5 rounded-2xl transition-all duration-300 ${
              activeTab === 'products'
                ? 'bg-slate-900 text-white shadow-2xl shadow-slate-300 font-black scale-[1.02]'
                : 'bg-white text-slate-500 hover:bg-slate-50 font-bold border border-slate-100'
            }`}
          >
            <Package size={20} className="2xl:w-6 2xl:h-6" />
            <div className={`flex flex-col ${isRTL ? 'items-end' : 'items-start'}`}>
              <span className="text-sm 2xl:text-base">{t('pages.categories.productCategories')}</span>
              <span className={`text-[10px] 2xl:text-xs uppercase tracking-widest ${activeTab === 'products' ? 'text-indigo-400' : 'text-slate-400'}`}>{productCategories.length} {isRTL ? 'فئات' : 'Categories'}</span>
            </div>
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 w-full space-y-6">
          <div className="card-premium p-4 2xl:p-6 bg-white border-none shadow-xl shadow-slate-200/50">
            <div className="relative">
              <Search size={20} className={`absolute top-1/2 -translate-y-1/2 text-slate-400 ${isRTL ? 'right-4' : 'left-4'}`} />
              <input
                type="text"
                placeholder={isRTL ? `بحث في تصنيفات ${activeTab === 'books' ? 'الأكاديمية' : 'المنتجات'}...` : `Search ${activeTab === 'books' ? 'academic' : 'product'} classifications...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full bg-slate-50 border-none rounded-2xl py-3.5 2xl:py-4 font-bold text-sm 2xl:text-base focus:ring-4 focus:ring-blue-500/10 transition-all ${isRTL ? 'pr-12' : 'pl-12'}`}
              />
            </div>
          </div>

          {loading ? (
            <div className="py-24 flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-slate-100 border-t-slate-900 rounded-full animate-spin"></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('pages.categories.syncingTaxonomies')}</span>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="fade-in">
              <EmptyState
                icon={Tag}
                title={t('pages.categories.noClassifications')}
                description={t('pages.categories.noClassificationsDesc').replace('{type}', activeTab === 'books' ? (isRTL ? 'الأكاديمية' : 'academic') : (isRTL ? 'المخزون' : 'inventory'))}
                actionLabel={t('pages.categories.defineFirstCategory')}
                onAction={() => navigate(`/categories/add?type=${activeTab}`)}
              />
            </div>
          ) : (
            <div className="fade-in">
              <DataTable
                data={filteredCategories}
                columns={columns}
                loading={false}
                searchable={false}
                onEdit={(cat) => navigate(`/categories/edit/${activeTab}/${cat.id}`)}
                onDelete={(cat) => handleDelete(cat, activeTab)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Categories;
