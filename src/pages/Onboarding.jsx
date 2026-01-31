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
      toast.error(isRTL ? 'فشل تحميل عناصر الانضمام' : 'Failed to load onboarding items');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: t('pages.onboarding.purgeStep'),
      text: t('pages.onboarding.purgeStepDesc'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f43f5e',
      confirmButtonText: t('pages.onboarding.confirmPurge'),
      reverseButtons: isRTL
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/onboarding/${id}`);
        toast.success(isRTL ? 'تم حذف عنصر الانضمام بنجاح' : 'Onboarding item deleted successfully');
        fetchItems();
      } catch (error) {
        toast.error(isRTL ? 'فشل حذف عنصر الانضمام' : 'Failed to delete onboarding item');
      }
    }
  };

  const filteredItems = items.filter((item) =>
    item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      header: t('pages.onboarding.order'),
      accessor: 'order',
      align: 'center',
      render: (item) => (
        <div className="flex flex-col items-center gap-1">
          <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
            <span className="text-xs font-black text-slate-900">{item.order || 0}</span>
          </div>
          <span className="text-[9px] font-black uppercase text-slate-300 tracking-tighter">{t('pages.onboarding.step')}</span>
        </div>
      )
    },
    {
      header: t('pages.onboarding.flowIdentity'),
      accessor: 'title',
      render: (item) => (
        <div className="flex flex-col gap-1">
          <span className="font-black text-slate-900 tracking-tight uppercase text-xs">{item.title || t('pages.onboarding.onboardingNode')}</span>
          <p className="text-[10px] font-medium text-slate-400 max-w-xs truncate">{item.description}</p>
        </div>
      ),
    },
    {
      header: t('pages.onboarding.visualManifest'),
      accessor: 'imageUrl',
      hideOnMobile: true,
      render: (item) => (
        <div className="w-16 h-10 rounded-lg overflow-hidden bg-slate-50 border border-slate-100 shadow-sm transition-all group-hover:scale-105">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-200 font-black text-[8px]">NO IMAGE</div>
          )}
        </div>
      ),
    },
    {
      header: t('pages.onboarding.operations') || t('common.actions'),
      accessor: 'actions',
      align: 'right',
      render: (item) => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={() => navigate(`/onboarding/edit/${item.id}`)} className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Edit size={18} /></button>
          <button onClick={() => handleDelete(item.id)} className="p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"><Trash2 size={18} /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-10 page-transition pb-20">
      <PageHeader
        title={t('pages.onboarding.title')}
        subtitle={t('pages.onboarding.subtitle')}
        breadcrumbs={[{ label: t('menu.sections.system') }, { label: t('menu.onboarding') }]}
        actionLabel={t('pages.onboarding.addItem')}
        actionPath="/onboarding/add"
      />

      <div className="card-premium p-6 bg-white border-none shadow-xl shadow-slate-200/50">
        <div className="relative max-w-2xl">
          <Search size={20} className={`absolute top-1/2 -translate-y-1/2 text-slate-400 ${isRTL ? 'right-4' : 'left-4'}`} />
          <input
            type="text"
            placeholder={t('pages.onboarding.search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full bg-slate-50 border-none rounded-2xl py-4 font-bold text-sm focus:ring-4 focus:ring-blue-500/10 transition-all ${isRTL ? 'pr-12' : 'pl-12'}`}
          />
        </div>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('pages.onboarding.syncingFlows')}</span>
        </div>
      ) : (
        <div className="fade-in">
          <DataTable
            data={filteredItems}
            columns={columns}
            loading={false}
            searchable={false}
          />
        </div>
      )}
    </div>
  );
};

export default Onboarding;


