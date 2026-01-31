import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Plus, Edit, Trash2, Eye, Search, BookOpen, Building2 } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import DataTable from '../components/DataTable';
import PageHeader from '../components/PageHeader';
import { useLanguage } from '../context/LanguageContext';

const Students = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/students');
      setStudents(response.data.data || response.data || []);
    } catch (error) {
      toast.error(isRTL ? 'فشل استرجاع سجلات الطلاب' : 'Failed to retrieve student records');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (student) => {
    const result = await Swal.fire({
      title: t('pages.students.revokeAccess'),
      text: t('pages.students.revokeAccessDesc').replace('{name}', student.name),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f43f5e',
      confirmButtonText: t('pages.students.confirmPurge'),
      reverseButtons: isRTL
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/students/${student.id}`);
        toast.success(isRTL ? 'تم حذف ملف الطالب بنجاح' : 'Student profile removed');
        fetchStudents();
      } catch (error) {
        toast.error(isRTL ? 'فشل عملية الحذف' : 'Purge operation failed');
      }
    }
  };

  const columns = [
    {
      header: t('pages.students.academicIdentity'),
      accessor: 'name',
      render: (student) => (
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 font-black border-2 border-white shadow-sm">
            {student.name?.charAt(0).toUpperCase() || 'S'}
          </div>
          <div className="flex flex-col">
            <span className="font-black text-slate-900 tracking-tight">{student.name || t('pages.students.anonymousStudent')}</span>
            <span className="text-[10px] font-bold font-mono text-slate-400">{student.user?.phone || t('pages.students.noContact')}</span>
          </div>
        </div>
      ),
    },
    {
      header: t('pages.students.enrollment'),
      accessor: 'college',
      render: (student) => (
        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-slate-700">
            <Building2 size={14} className="text-slate-400" />
            <span className="text-sm font-bold">{student.college?.name || t('pages.students.generalAdmission')}</span>
          </div>
          <span className={`text-[10px] font-medium text-slate-400 ${isRTL ? 'mr-5' : 'ml-5'}`}>{student.department?.name || t('pages.students.undecidedMajor')}</span>
        </div>
      ),
    },
    {
      header: t('pages.students.systemRegistry'),
      accessor: 'createdAt',
      hideOnMobile: true,
      render: (student) => (
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-500">{new Date(student.createdAt).toLocaleDateString(isRTL ? 'ar-EG' : undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          <span className="text-[10px] font-medium text-slate-300 uppercase tracking-tighter">{t('pages.students.registrationDate')}</span>
        </div>
      )
    },
    {
      header: t('pages.students.operations'),
      accessor: 'actions',
      align: 'right',
      render: (student) => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={() => navigate(`/students/${student.id}`)} className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Eye size={18} /></button>
          <button onClick={() => navigate(`/students/edit/${student.id}`)} className="p-3 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"><Edit size={18} /></button>
          <button onClick={() => handleDelete(student)} className="p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"><Trash2 size={18} /></button>
        </div>
      ),
    },
  ];

  const filteredStudents = students.filter((student) => {
    const name = student.name?.toLowerCase() || '';
    const phone = student.user?.phone?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    return name.includes(search) || phone.includes(search);
  });

  return (
    <div className="space-y-6 2xl:space-y-8 page-transition">
      <PageHeader
        title={t('pages.students.title')}
        subtitle={t('pages.students.subtitle')}
        breadcrumbs={[{ label: t('menu.students') }]}
        actionLabel={t('pages.students.addStudent')}
        actionPath="/students/add"
      />

      <div className="card-premium p-4 2xl:p-6 bg-white border-none shadow-xl shadow-slate-200/50">
        <div className="relative max-w-2xl">
          <Search size={20} className={`absolute top-1/2 -translate-y-1/2 text-slate-400 ${isRTL ? 'right-4' : 'left-4'}`} />
          <input
            type="text"
            placeholder={t('pages.students.search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full bg-slate-50 border-none rounded-2xl py-3.5 2xl:py-4 font-bold text-sm 2xl:text-base focus:ring-4 focus:ring-blue-500/10 transition-all ${isRTL ? 'pr-12' : 'pl-12'}`}
          />
        </div>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('pages.students.syncingRecords')}</span>
        </div>
      ) : (
        <div className="fade-in">
          <DataTable
            data={filteredStudents}
            columns={columns}
            loading={false}
            searchable={false}
          />
        </div>
      )}
    </div>
  );
};

export default Students;
