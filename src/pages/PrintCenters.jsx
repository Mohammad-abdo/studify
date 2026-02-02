import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Printer, Plus, Edit, Trash2, Search, MapPin, Eye } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import DataTable from '../components/DataTable';
import PageHeader from '../components/PageHeader';
import { useLanguage } from '../context/LanguageContext';

const PrintCenters = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCenters();
  }, []);

  const fetchCenters = async () => {
    try {
      setLoading(true);
      const response = await api.get('/print-centers');
      setCenters(response.data.data || response.data || []);
    } catch (error) {
      toast.error(isRTL ? 'خطأ في جلب بيانات المطابع' : 'Error fetching print centers');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (center) => {
    const result = await Swal.fire({
      title: isRTL ? 'حذف المطبعة؟' : 'Delete Print Center?',
      text: isRTL ? `هل أنت متأكد من حذف ${center.name}؟ سيؤدي هذا لحذف الحساب المرتبط بها.` : `Are you sure you want to delete ${center.name}? This will delete the associated user account.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f43f5e',
      confirmButtonText: isRTL ? 'حذف نهائي' : 'Delete Permanently',
      cancelButtonText: isRTL ? 'إلغاء' : 'Cancel',
      reverseButtons: isRTL
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/print-centers/${center.id}`);
        toast.success(isRTL ? 'تم حذف المطبعة بنجاح' : 'Print center deleted successfully');
        fetchCenters();
      } catch (error) {
        toast.error(isRTL ? 'فشل عملية الحذف' : 'Purge operation failed');
      }
    }
  };

  const columns = [
    {
      header: isRTL ? 'المطبعة' : 'Print Center',
      accessor: 'name',
      render: (center) => (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 border border-teal-100 shadow-sm">
            <Printer size={20} />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-slate-900 tracking-tight">{center.name}</span>
            <span className="text-[10px] font-bold text-slate-400 font-mono">UUID: {center.id.slice(0, 8)}</span>
          </div>
        </div>
      ),
    },
    {
      header: isRTL ? 'معلومات الاتصال' : 'Communication',
      accessor: 'user.phone',
      render: (center) => (
        <div className="flex flex-col gap-1">
          <span className="text-sm font-bold text-slate-700">{center.user?.phone}</span>
          <span className="text-[10px] font-medium text-slate-400">{center.user?.email || 'No Email'}</span>
        </div>
      ),
    },
    {
      header: isRTL ? 'الموقع الجغرافي' : 'Location',
      accessor: 'location',
      render: (center) => (
        <div className="flex items-center gap-2 text-slate-600">
          <MapPin size={14} className="text-rose-500" />
          <span className="text-xs font-bold">{center.location || (isRTL ? 'غير محدد' : 'Not specified')}</span>
        </div>
      ),
    },
    {
      header: isRTL ? 'الحالة التشغيلية' : 'Node State',
      accessor: 'isActive',
      align: 'center',
      render: (center) => (
        <span className={`badge-modern ${center.isActive ? 'badge-modern-success' : 'badge-modern-error'} px-4 py-1.5 rounded-xl text-[10px]`}>
          {center.isActive ? (isRTL ? 'نشط' : 'ACTIVE') : (isRTL ? 'معطل' : 'INACTIVE')}
        </span>
      )
    },
    {
      header: isRTL ? 'الإجراءات' : 'Operations',
      accessor: 'actions',
      align: 'right',
      render: (center) => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={() => navigate(`/print-centers/${center.id}`)} className="p-3 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-all" title={t('common.view')}><Eye size={18} /></button>
          <button onClick={() => navigate(`/print-centers/edit/${center.id}`)} className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Edit size={18} /></button>
          <button onClick={() => handleDelete(center)} className="p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"><Trash2 size={18} /></button>
        </div>
      ),
    },
  ];

  const filteredCenters = centers.filter((center) => {
    const search = searchTerm.toLowerCase();
    return (
      center.name.toLowerCase().includes(search) || 
      center.user?.phone?.includes(search) ||
      center.location?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="space-y-10 page-transition pb-20">
      <PageHeader
        title={isRTL ? 'إدارة المطابع' : 'Print Center Registry'}
        subtitle={isRTL ? 'الإشراف على مراكز الطباعة المشتركة والتحكم في وصولها' : 'Operational oversight of shared print production nodes'}
        breadcrumbs={[{ label: t('menu.sections.logistics') }, { label: isRTL ? 'المطابع' : 'Print Centers' }]}
        actionLabel={isRTL ? 'تسجيل مطبعة' : 'Register Center'}
        actionPath="/print-centers/add"
      />

      <div className="card-premium p-6 bg-white border-none shadow-xl shadow-slate-200/50">
        <div className="relative max-w-2xl">
          <Search size={20} className={`absolute top-1/2 -translate-y-1/2 text-slate-400 ${isRTL ? 'right-4' : 'left-4'}`} />
          <input
            type="text"
            placeholder={isRTL ? 'البحث باسم المطبعة، الهاتف أو الموقع...' : 'Search by center name, phone or location...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full bg-slate-50 border-none rounded-2xl py-4 font-bold text-sm focus:ring-4 focus:ring-teal-500/10 transition-all ${isRTL ? 'pr-12' : 'pl-12'}`}
          />
        </div>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-slate-100 border-t-teal-600 rounded-full animate-spin"></div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{isRTL ? 'جاري مزامنة بيانات الإنتاج...' : 'Syncing Production Nodes...'}</span>
        </div>
      ) : (
        <div className="fade-in">
          <DataTable
            data={filteredCenters}
            columns={columns}
            loading={false}
            searchable={false}
          />
        </div>
      )}
    </div>
  );
};

export default PrintCenters;
