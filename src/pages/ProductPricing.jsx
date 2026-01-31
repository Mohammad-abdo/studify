import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Plus, Edit, Trash2, Package, Search, Filter, Layers, DollarSign } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import DataTable from '../components/DataTable';
import PageHeader from '../components/PageHeader';
import { useLanguage } from '../context/LanguageContext';

const ProductPricing = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';
  const [pricings, setPricings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPricings();
  }, []);

  const fetchPricings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/product-pricing');
      setPricings(response.data.data || response.data || []);
    } catch (error) {
      toast.error(t('pages.productPricing.syncError'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (pricing) => {
    const result = await Swal.fire({
      title: t('pages.productPricing.purgeTier'),
      text: t('pages.productPricing.purgeTierDesc').replace('{name}', pricing.product?.name),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f43f5e',
      confirmButtonText: t('pages.productPricing.abolishConfirm'),
      reverseButtons: isRTL
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/product-pricing/${pricing.id}`);
        toast.success(t('pages.productPricing.success'));
        fetchPricings();
      } catch (error) {
        toast.error(t('pages.productPricing.error'));
      }
    }
  };

  const columns = [
    {
      header: t('pages.productPricing.inventoryAsset'),
      accessor: 'product',
      render: (pricing) => (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 border border-orange-100 shadow-sm">
            <Package size={20} />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-slate-900 tracking-tight">{pricing.product?.name || t('pages.productPricing.systemAsset')}</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('pages.productPricing.inventoryNode')}</span>
          </div>
        </div>
      ),
    },
    {
      header: t('pages.productPricing.bulkThreshold'),
      accessor: 'minQuantity',
      align: 'center',
      render: (pricing) => (
        <div className="flex flex-col items-center gap-1">
          <div className="px-3 py-1 bg-slate-50 text-slate-900 rounded-lg text-xs font-black border border-slate-100">
            {pricing.minQuantity || 0} {isRTL ? 'وحدات' : 'units'}
          </div>
          <span className="text-[9px] font-black uppercase text-slate-300">{t('pages.productPricing.minQuantity')}</span>
        </div>
      ),
    },
    {
      header: t('pages.productPricing.unitValuation'),
      accessor: 'price',
      render: (pricing) => (
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <DollarSign size={14} className="text-emerald-500" strokeWidth={3} />
            <span className="font-black text-slate-900 text-lg">
              ${pricing.price?.toFixed(2) || '0.00'}
            </span>
          </div>
          <span className="text-[9px] font-black uppercase text-slate-300">{t('pages.productPricing.setRate')}</span>
        </div>
      ),
    },
    {
      header: t('pages.productPricing.accountingStatus'),
      accessor: 'id',
      align: 'center',
      render: (pricing) => (
        <div className="flex items-center justify-center gap-2">
          <TrendingUp size={14} className="text-emerald-500" />
          <span className="text-[10px] font-black text-emerald-600 uppercase">{t('pages.productPricing.activeRate')}</span>
        </div>
      )
    },
    {
      header: t('pages.productPricing.operations'),
      accessor: 'actions',
      align: 'right',
      render: (pricing) => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={() => navigate(`/product-pricing/edit/${pricing.id}`)} className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Edit size={18} /></button>
          <button onClick={() => handleDelete(pricing)} className="p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"><Trash2 size={18} /></button>
        </div>
      ),
    },
  ];

  const filteredPricings = pricings.filter((pricing) => {
    const productName = pricing.product?.name?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    return productName.includes(search);
  });

  return (
    <div className="space-y-10 page-transition pb-20">
      <PageHeader
        title={t('pages.productPricing.title')}
        subtitle={t('pages.productPricing.subtitle')}
        breadcrumbs={[{ label: t('menu.sections.logistics') }, { label: t('menu.productPricing') }]}
        actionLabel={t('pages.productPricing.registerTier')}
        actionPath="/product-pricing/add"
      />

      <div className="card-premium p-6 bg-white border-none shadow-xl shadow-slate-200/50">
        <div className="relative max-w-2xl">
          <Search size={20} className={`absolute top-1/2 -translate-y-1/2 text-slate-400 ${isRTL ? 'right-4' : 'left-4'}`} />
          <input
            type="text"
            placeholder={t('pages.productPricing.search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full bg-slate-50 border-none rounded-2xl py-4 font-bold text-sm focus:ring-4 focus:ring-blue-500/10 transition-all ${isRTL ? 'pr-12' : 'pl-12'}`}
          />
        </div>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-slate-100 border-t-orange-600 rounded-full animate-spin"></div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('pages.productPricing.syncingDatabase')}</span>
        </div>
      ) : (
        <div className="fade-in">
          <DataTable
            data={filteredPricings}
            columns={columns}
            loading={false}
            searchable={false}
          />
        </div>
      )}
    </div>
  );
};

export default ProductPricing;
