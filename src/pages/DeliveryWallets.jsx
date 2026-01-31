import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, Plus, Edit, Trash2, Truck, DollarSign, Search, Filter, TrendingUp } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import DataTable from '../components/DataTable';
import PageHeader from '../components/PageHeader';
import { useLanguage } from '../context/LanguageContext';

const DeliveryWallets = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchWallets();
  }, []);

  const fetchWallets = async () => {
    try {
      setLoading(true);
      const response = await api.get('/delivery-wallets');
      setWallets(response.data.data || response.data || []);
    } catch (error) {
      toast.error(isRTL ? 'مالي: فشل مزامنة محفظة التوصيل' : 'Financial: Delivery wallet sync failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (wallet) => {
    const result = await Swal.fire({
      title: t('pages.deliveryWallets.abolishWallet'),
      text: t('pages.deliveryWallets.abolishWalletDesc'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f43f5e',
      confirmButtonText: t('pages.deliveryWallets.confirmAbolish'),
      reverseButtons: isRTL
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/delivery-wallets/${wallet.id}`);
        toast.success(isRTL ? 'تم أرشفة المحفظة' : 'Wallet archived');
        fetchWallets();
      } catch (error) {
        toast.error(isRTL ? 'فشل الإلغاء: قفل مالي' : 'Abolition failed: Financial lock');
      }
    }
  };

  const columns = [
    {
      header: t('pages.deliveryWallets.nodeIdentity'),
      accessor: 'delivery',
      render: (wallet) => (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-lg shadow-slate-200">
            <Truck size={20} strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-slate-900 tracking-tight">{wallet.delivery?.name || t('pages.deliveryWallets.assignedNode')}</span>
            <span className="text-[10px] font-bold text-slate-400 font-mono">ID: {wallet.deliveryId?.slice(0, 8)}</span>
          </div>
        </div>
      ),
    },
    {
      header: t('pages.deliveryWallets.availableCapital'),
      accessor: 'balance',
      render: (wallet) => (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <DollarSign className="text-emerald-500" size={16} strokeWidth={3} />
            <span className="font-black text-slate-900 text-lg">
              {wallet.balance?.toFixed(2) || '0.00'}
            </span>
          </div>
          <span className="text-[9px] font-black uppercase text-slate-300 tracking-widest">{t('pages.deliveryWallets.settledBalance')}</span>
        </div>
      ),
    },
    {
      header: t('pages.deliveryWallets.accountingState'),
      accessor: 'id',
      align: 'center',
      render: (wallet) => (
        <div className="flex items-center justify-center gap-2">
          <TrendingUp size={14} className="text-emerald-500" />
          <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{t('pages.deliveryWallets.synced')}</span>
        </div>
      )
    },
    {
      header: t('pages.deliveryWallets.operations'),
      accessor: 'actions',
      align: 'right',
      render: (wallet) => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={() => navigate(`/delivery-wallets/edit/${wallet.id}`)} className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Edit size={18} /></button>
          <button onClick={() => handleDelete(wallet)} className="p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"><Trash2 size={18} /></button>
        </div>
      ),
    },
  ];

  const filteredWallets = wallets.filter((wallet) => {
    const deliveryName = wallet.delivery?.name?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    return deliveryName.includes(search);
  });

  return (
    <div className="space-y-10 page-transition pb-20">
      <PageHeader
        title={t('pages.deliveryWallets.title')}
        subtitle={t('pages.deliveryWallets.subtitle')}
        breadcrumbs={[{ label: t('menu.sections.logistics') }, { label: isRTL ? 'المالية' : 'Financials' }]}
        actionLabel={t('pages.deliveryWallets.initializeWallet')}
        actionPath="/delivery-wallets/add"
      />

      <div className="card-premium p-6 bg-white border-none shadow-xl shadow-slate-200/50">
        <div className="relative max-w-2xl">
          <Search size={20} className={`absolute top-1/2 -translate-y-1/2 text-slate-400 ${isRTL ? 'right-4' : 'left-4'}`} />
          <input
            type="text"
            placeholder={t('pages.deliveryWallets.search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full bg-slate-50 border-none rounded-2xl py-4 font-bold text-sm focus:ring-4 focus:ring-blue-500/10 transition-all ${isRTL ? 'pr-12' : 'pl-12'}`}
          />
        </div>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-slate-100 border-t-emerald-600 rounded-full animate-spin"></div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('pages.deliveryWallets.syncingMatrices')}</span>
        </div>
      ) : (
        <div className="fade-in">
          <DataTable
            data={filteredWallets}
            columns={columns}
            loading={false}
            searchable={false}
          />
        </div>
      )}
    </div>
  );
};

export default DeliveryWallets;
