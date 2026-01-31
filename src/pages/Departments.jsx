import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Plus, X, Search, Filter, Building2 } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import DataTable from '../components/DataTable';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import { useLanguage } from '../context/LanguageContext';

const Departments = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';
  const [departments, setDepartments] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCollege, setSelectedCollege] = useState('');

  useEffect(() => {
    fetchColleges();
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchDepartments();
  }, [selectedCollege]);

  const fetchColleges = async () => {
    try {
      const response = await api.get('/colleges');
      setColleges(response.data.data || response.data || []);
    } catch (error) {
      toast.error(isRTL ? 'سجل: دليل الكليات غير متاح' : 'Registry: College directory unavailable');
    }
  };

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const url = selectedCollege
        ? `/departments?collegeId=${selectedCollege}`
        : '/departments';
      const response = await api.get(url);
      setDepartments(response.data.data || response.data || []);
    } catch (error) {
      toast.error(isRTL ? 'سجل: فشل مزامنة بيانات الأقسام' : 'Registry: Department data sync failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (dept) => {
    const result = await Swal.fire({
      title: t('pages.departments.dissolveDepartment'),
      text: t('pages.departments.dissolveDepartmentDesc').replace('{name}', dept.name),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      confirmButtonText: isRTL ? 'تأكيد الحل' : 'Confirm Dissolution',
      reverseButtons: isRTL
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/departments/${dept.id}`);
        toast.success(isRTL ? 'تم حل القسم بنجاح' : 'Department dissolved successfully');
        fetchDepartments();
      } catch (error) {
        toast.error(isRTL ? 'فشل عملية الحل' : 'Dissolution operation failed');
      }
    }
  };

  const filteredDepartments = departments.filter((dept) =>
    dept.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      header: t('pages.departments.departmentIdentity'),
      accessor: 'name',
      render: (dept) => (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 shadow-sm">
            <GraduationCap size={20} />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-slate-900 tracking-tight">{dept.name}</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-mono">#{dept.id.slice(0, 8)}</span>
          </div>
        </div>
      )
    },
    {
      header: t('pages.departments.parentInstitution'),
      accessor: 'college.name',
      render: (dept) => (
        <div className="flex items-center gap-2">
          <Building2 size={14} className="text-blue-500" />
          <span className="text-sm font-bold text-slate-700">{dept.college?.name || t('pages.departments.unassignedInstitute')}</span>
        </div>
      )
    },
    {
      header: t('pages.departments.systemRegistry'),
      accessor: 'createdAt',
      hideOnMobile: true,
      render: (dept) => (
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-500">{new Date(dept.createdAt).toLocaleDateString(isRTL ? 'ar-EG' : undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          <span className="text-[10px] font-medium text-slate-300 uppercase tracking-tighter">{t('pages.departments.established')}</span>
        </div>
      )
    },
  ];

  return (
    <div className="space-y-10 page-transition">
      <PageHeader
        title={t('pages.departments.title')}
        subtitle={t('pages.departments.subtitle')}
        breadcrumbs={[{ label: t('menu.departments') }]}
        actionLabel={t('pages.departments.addDepartment')}
        actionPath="/departments/add"
      />

      <div className="card-premium p-6 bg-white border-none shadow-xl shadow-slate-200/50">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 relative">
            <Search size={20} className={`absolute top-1/2 -translate-y-1/2 text-slate-400 ${isRTL ? 'right-4' : 'left-4'}`} />
            <input
              type="text"
              placeholder={t('pages.departments.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full bg-slate-50 border-none rounded-2xl py-4 font-bold text-sm focus:ring-4 focus:ring-blue-500/10 transition-all ${isRTL ? 'pr-12' : 'pl-12'}`}
            />
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative min-w-[240px]">
              <Filter size={18} className={`absolute top-1/2 -translate-y-1/2 text-slate-400 ${isRTL ? 'right-4' : 'left-4'}`} />
              <select
                value={selectedCollege}
                onChange={(e) => { setSelectedCollege(e.target.value); }}
                className={`w-full bg-slate-50 border-none rounded-2xl py-4 font-bold text-sm focus:ring-4 focus:ring-blue-500/10 transition-all appearance-none ${isRTL ? 'pr-12 pl-10' : 'pl-12 pr-10'}`}
              >
                <option value="">{t('pages.departments.allColleges')}</option>
                {colleges.map((college) => (
                  <option key={college.id} value={college.id}>{college.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('pages.departments.syncingSubdivisions')}</span>
        </div>
      ) : filteredDepartments.length === 0 ? (
        <div className="fade-in">
          <EmptyState
            icon={GraduationCap}
            title={t('pages.departments.subdivisionEmpty')}
            description={t('pages.departments.subdivisionEmptyDesc')}
            actionLabel={t('pages.departments.charterNewDepartment')}
            onAction={() => navigate('/departments/add')}
          />
        </div>
      ) : (
        <div className="fade-in">
          <DataTable
            data={filteredDepartments}
            columns={columns}
            loading={false}
            searchable={false}
            onEdit={(dept) => navigate(`/departments/edit/${dept.id}`)}
            onDelete={handleDelete}
          />
        </div>
      )}
    </div>
  );
};

export default Departments;
