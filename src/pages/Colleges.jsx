import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Plus, X, Search, GraduationCap } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import DataTable from '../components/DataTable';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import { useLanguage } from '../context/LanguageContext';

const Colleges = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchColleges();
  }, []);

  const fetchColleges = async () => {
    try {
      setLoading(true);
      const response = await api.get('/colleges');
      setColleges(response.data.data || response.data || []);
    } catch (error) {
      toast.error(isRTL ? 'سجل: دليل الكليات غير متاح' : 'Registry: College directory unavailable');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (college) => {
    const result = await Swal.fire({
      title: t('pages.colleges.decommissionCollege'),
      text: t('pages.colleges.decommissionCollegeDesc').replace('{name}', college.name),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      confirmButtonText: t('pages.colleges.decommissionUnit'),
      reverseButtons: isRTL
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/colleges/${college.id}`);
        toast.success(isRTL ? 'تم إخراج الوحدة من الخدمة بنجاح' : 'Unit decommissioned successfully');
        fetchColleges();
      } catch (error) {
        toast.error(isRTL ? 'فشل عملية إخراج الوحدة من الخدمة' : 'Decommission operation failed');
      }
    }
  };

  const filteredColleges = colleges.filter((college) =>
    college.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      header: t('pages.colleges.academicOrganization'),
      accessor: 'name',
      render: (college) => (
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 border-2 border-white shadow-sm">
            <Building2 size={24} />
          </div>
          <div className={`flex flex-col ${isRTL ? 'text-right' : 'text-left'}`}>
            <span className="font-black text-slate-900 tracking-tight">{college.name}</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic font-mono">#{college.id.slice(0, 8)}</span>
          </div>
        </div>
      )
    },
    {
      header: t('pages.colleges.institutionalScale'),
      accessor: '_count.departments',
      align: 'center',
      render: (college) => (
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-2 text-slate-700">
            <GraduationCap size={14} className="text-blue-500" />
            <span className="text-sm font-black">{college._count?.departments || 0}</span>
          </div>
          <span className="text-[9px] font-black uppercase text-slate-400">{t('pages.colleges.activeDepartments')}</span>
        </div>
      )
    },
    {
      header: t('pages.colleges.registryDate'),
      accessor: 'createdAt',
      hideOnMobile: true,
      render: (college) => (
        <div className={`flex flex-col ${isRTL ? 'text-right' : 'text-left'}`}>
          <span className="text-xs font-bold text-slate-500">{new Date(college.createdAt).toLocaleDateString(isRTL ? 'ar-EG' : undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          <span className="text-[10px] font-medium text-slate-300 uppercase tracking-tighter">{t('pages.colleges.systemEstablished')}</span>
        </div>
      )
    },
  ];

  return (
    <div className="space-y-6 2xl:space-y-8 page-transition">
      <PageHeader
        title={t('pages.colleges.title')}
        subtitle={t('pages.colleges.subtitle')}
        breadcrumbs={[{ label: t('menu.colleges') }]}
        actionLabel={t('pages.colleges.addCollege')}
        actionPath="/colleges/add"
      />

      <div className="card-premium p-4 2xl:p-6 bg-white border-none shadow-xl shadow-slate-200/50">
        <div className="relative max-w-2xl">
          <Search size={20} className={`absolute top-1/2 -translate-y-1/2 text-slate-400 ${isRTL ? 'right-4' : 'left-4'}`} />
          <input
            type="text"
            placeholder={t('pages.colleges.search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full bg-slate-50 border-none rounded-2xl py-3.5 2xl:py-4 font-bold text-sm 2xl:text-base focus:ring-4 focus:ring-blue-500/10 transition-all ${isRTL ? 'pr-12' : 'pl-12'}`}
          />
        </div>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('pages.colleges.syncingRecords')}</span>
        </div>
      ) : filteredColleges.length === 0 ? (
        <div className="fade-in">
          <EmptyState
            icon={Building2}
            title={t('pages.colleges.registryEmpty')}
            description={t('pages.colleges.registryEmptyDesc')}
            actionLabel={t('pages.colleges.establishFirstCollege')}
            onAction={() => navigate('/colleges/add')}
          />
        </div>
      ) : (
        <div className="fade-in">
          <DataTable
            data={filteredColleges}
            columns={columns}
            loading={false}
            searchable={false}
            onEdit={(college) => navigate(`/colleges/edit/${college.id}`)}
            onDelete={handleDelete}
          />
        </div>
      )}
    </div>
  );
};

export default Colleges;
