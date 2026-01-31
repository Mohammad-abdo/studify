import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Printer, Plus, Edit, Trash2, BookOpen, Search, Filter, Palette, Maximize } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import DataTable from '../components/DataTable';
import PageHeader from '../components/PageHeader';
import { useLanguage } from '../context/LanguageContext';

const PrintOptions = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/print-options');
      setOptions(response.data.data || response.data || []);
    } catch (error) {
      toast.error(isRTL ? 'نظام: فشل مزامنة بيان الطباعة' : 'System: Print manifest synchronization failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (option) => {
    const result = await Swal.fire({
      title: t('pages.printOptions.purgeConfiguration'),
      text: t('pages.printOptions.purgeConfigurationDesc').replace('{name}', option.book?.title),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f43f5e',
      confirmButtonText: isRTL ? 'تأكيد الحذف' : 'Purge Configuration',
      reverseButtons: isRTL
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/print-options/${option.id}`);
        toast.success(isRTL ? 'تم حذف تكوين الطباعة' : 'Print configuration purged');
        fetchOptions();
      } catch (error) {
        toast.error(isRTL ? 'فشل عملية الحذف: قفل السجل' : 'Purge operation failed: Registry lock');
      }
    }
  };

  const columns = [
    {
      header: t('pages.printOptions.academicAsset'),
      accessor: 'book',
      render: (option) => (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600 border border-violet-100 shadow-sm">
            <BookOpen size={20} />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-slate-900 tracking-tight">{option.book?.title || t('pages.printOptions.systemAsset')}</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('pages.printOptions.printResource')}</span>
          </div>
        </div>
      ),
    },
    {
      header: t('pages.printOptions.chromaticProfile'),
      accessor: 'colorType',
      render: (option) => (
        <div className="flex items-center gap-2">
          <Palette size={14} className="text-slate-400" />
          <span className="badge-modern badge-modern-info capitalize">
            {option.colorType}
          </span>
        </div>
      ),
    },
    {
      header: t('pages.printOptions.dimensionProtocol'),
      accessor: 'paperSize',
      render: (option) => (
        <div className="flex items-center gap-2 text-slate-600">
          <Maximize size={14} />
          <span className="text-xs font-black uppercase tracking-widest">{option.paperSize || t('pages.printOptions.standard')}</span>
        </div>
      ),
    },
    {
      header: t('pages.printOptions.pageUnitValue'),
      accessor: 'pricePerPage',
      render: (option) => (
        <div className="flex flex-col">
          <span className="font-black text-slate-900 text-lg">
            ${option.pricePerPage?.toFixed(2) || '0.00'}
          </span>
          <span className="text-[9px] font-black uppercase text-slate-300">{t('pages.printOptions.ratePerPage')}</span>
        </div>
      ),
    },
    {
      header: t('common.actions'),
      accessor: 'actions',
      align: 'right',
      render: (option) => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={() => navigate(`/print-options/edit/${option.id}`)} className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Edit size={18} /></button>
          <button onClick={() => handleDelete(option)} className="p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"><Trash2 size={18} /></button>
        </div>
      ),
    },
  ];

  const filteredOptions = options.filter((option) => {
    const bookTitle = option.book?.title?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    return bookTitle.includes(search);
  });

  return (
    <div className="space-y-10 page-transition pb-20">
      <PageHeader
        title={t('pages.printOptions.title')}
        subtitle={t('pages.printOptions.subtitle')}
        breadcrumbs={[{ label: t('menu.sections.system') }, { label: t('menu.printOptions') }]}
        actionLabel={t('pages.printOptions.registerProfile')}
        actionPath="/print-options/add"
      />

      <div className="card-premium p-6 bg-white border-none shadow-xl shadow-slate-200/50">
        <div className="relative max-w-2xl">
          <Search size={20} className={`absolute top-1/2 -translate-y-1/2 text-slate-400 ${isRTL ? 'right-4' : 'left-4'}`} />
          <input
            type="text"
            placeholder={t('pages.printOptions.search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full bg-slate-50 border-none rounded-2xl py-4 font-bold text-sm focus:ring-4 focus:ring-blue-500/10 transition-all ${isRTL ? 'pr-12' : 'pl-12'}`}
          />
        </div>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-slate-100 border-t-violet-600 rounded-full animate-spin"></div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('pages.printOptions.syncingPrintMatrix')}</span>
        </div>
      ) : (
        <div className="fade-in">
          <DataTable
            data={filteredOptions}
            columns={columns}
            loading={false}
            searchable={false}
          />
        </div>
      )}
    </div>
  );
};

export default PrintOptions;
