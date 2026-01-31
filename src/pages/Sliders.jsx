import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Image as ImageIcon, Plus, Edit, Trash2, Eye, EyeOff, Search, Filter, Layers } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import DataTable from '../components/DataTable';
import PageHeader from '../components/PageHeader';
import { useLanguage } from '../context/LanguageContext';

const Sliders = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';
  const [sliders, setSliders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSliders();
  }, []);

  const fetchSliders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/sliders?limit=100');
      setSliders(response.data.data || response.data || []);
    } catch (error) {
      toast.error(isRTL ? 'نظام: فشل مزامنة الشرائح' : 'System: Slider synchronization failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (slider) => {
    const result = await Swal.fire({
      title: t('pages.sliders.purgeAsset'),
      text: t('pages.sliders.purgeAssetDesc'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f43f5e',
      confirmButtonText: t('pages.sliders.purgeAssetConfirm'),
      reverseButtons: isRTL
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/sliders/${slider.id}`);
        toast.success(isRTL ? 'تم حذف الأصل المرئي' : 'Visual asset purged');
        fetchSliders();
      } catch (error) {
        toast.error(isRTL ? 'فشل عملية الحذف' : 'Purge operation failed');
      }
    }
  };

  const handleToggleActive = async (slider) => {
    try {
      await api.put(`/sliders/${slider.id}`, {
        isActive: !slider.isActive,
      });
      toast.success(isRTL ? `تم ${!slider.isActive ? 'نشر' : 'إيقاف'} اللافتة` : `Banner ${!slider.isActive ? t('pages.sliders.published') : t('pages.sliders.suspended')}`);
      fetchSliders();
    } catch (error) {
      toast.error(isRTL ? 'فشل العملية: قفل السجل' : 'Operation failed: Registry lock');
    }
  };

  const columns = [
    {
      header: t('pages.sliders.visualPreview'),
      accessor: 'imageUrl',
      width: '120px',
      render: (slider) => (
        <div className="w-24 h-16 rounded-xl overflow-hidden bg-slate-100 border border-slate-100 shadow-sm transition-all group-hover:scale-105">
          <img
            src={slider.imageUrl}
            alt={slider.title || 'Slider'}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = `https://ui-avatars.com/api/?name=${isRTL ? 'لافتة' : 'Banner'}&background=slate&color=fff`;
            }}
          />
        </div>
      ),
    },
    {
      header: t('pages.sliders.assetIdentity'),
      accessor: 'title',
      render: (slider) => (
        <div className="flex flex-col gap-1">
          <span className="font-black text-slate-900 tracking-tight">{slider.title || t('pages.sliders.draftBanner')}</span>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('pages.sliders.campaignNode')}</span>
        </div>
      ),
    },
    {
      header: t('pages.sliders.sequence'),
      accessor: 'order',
      align: 'center',
      render: (slider) => (
        <div className="flex flex-col items-center gap-1">
          <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
            <span className="text-xs font-black text-slate-900">{slider.order || 0}</span>
          </div>
          <span className="text-[9px] font-black uppercase text-slate-300 tracking-tighter">{t('pages.sliders.order')}</span>
        </div>
      ),
    },
    {
      header: t('pages.sliders.nodeState'),
      accessor: 'isActive',
      align: 'center',
      render: (slider) => (
        <div className="flex flex-col items-center gap-1">
          <span className={`badge-modern ${slider.isActive ? 'badge-modern-success' : 'badge-modern-info'}`}>
            {slider.isActive ? t('pages.sliders.active') : t('pages.sliders.offline')}
          </span>
          <span className="text-[9px] font-black uppercase text-slate-300">{t('pages.sliders.operationalState')}</span>
        </div>
      ),
    },
    {
      header: t('pages.sliders.operations'),
      accessor: 'actions',
      align: 'right',
      render: (slider) => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={() => handleToggleActive(slider)} className={`p-3 rounded-xl transition-all ${slider.isActive ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50' : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'}`}>
            {slider.isActive ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
          <button onClick={() => navigate(`/sliders/edit/${slider.id}`)} className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Edit size={18} /></button>
          <button onClick={() => handleDelete(slider)} className="p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"><Trash2 size={18} /></button>
        </div>
      ),
    },
  ];

  const filteredSliders = sliders.filter((slider) => {
    const title = slider.title?.toLowerCase() || '';
    const description = slider.description?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    return title.includes(search) || description.includes(search);
  });

  return (
    <div className="space-y-10 page-transition pb-20">
      <PageHeader
        title={t('pages.sliders.title')}
        subtitle={t('pages.sliders.subtitle')}
        breadcrumbs={[{ label: t('menu.sections.system') }, { label: t('menu.sliders') }]}
        actionLabel={t('pages.sliders.registerBanner')}
        actionPath="/sliders/add"
      />

      <div className="card-premium p-6 bg-white border-none shadow-xl shadow-slate-200/50">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 relative">
            <Search size={20} className={`absolute top-1/2 -translate-y-1/2 text-slate-400 ${isRTL ? 'right-4' : 'left-4'}`} />
            <input
              type="text"
              placeholder={t('pages.sliders.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full bg-slate-50 border-none rounded-2xl py-4 font-bold text-sm focus:ring-4 focus:ring-blue-500/10 transition-all ${isRTL ? 'pr-12' : 'pl-12'}`}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('pages.sliders.syncingVisual')}</span>
        </div>
      ) : (
        <div className="fade-in">
          <DataTable
            data={filteredSliders}
            columns={columns}
            loading={false}
            searchable={false}
          />
        </div>
      )}
    </div>
  );
};

export default Sliders;
