import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stethoscope, Plus, Edit, Trash2, CheckCircle, XCircle, Clock, Search, ShieldCheck } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import DataTable from '../components/DataTable';
import PageHeader from '../components/PageHeader';
import { useLanguage } from '../context/LanguageContext';

const Doctors = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await api.get('/doctors');
      setDoctors(response.data.data || response.data || []);
    } catch (error) {
      toast.error(isRTL ? 'خدمات الهوية: سجلات الأطباء غير متاحة' : 'Identity services: Doctor records unavailable');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (doctor) => {
    const result = await Swal.fire({
      title: t('pages.doctors.purgePractitioner'),
      text: t('pages.doctors.purgePractitionerDesc').replace('{name}', doctor.name),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      confirmButtonText: t('pages.doctors.confirmPurge'),
      reverseButtons: isRTL
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/doctors/${doctor.id}`);
        toast.success(isRTL ? 'تم حذف الممارس من السجل' : 'Practitioner removed from registry');
        fetchDoctors();
      } catch (error) {
        toast.error(isRTL ? 'فشل عملية الحذف' : 'Purge operation failed');
      }
    }
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case 'APPROVED': return { icon: CheckCircle, badge: 'badge-modern-success' };
      case 'REJECTED': return { icon: XCircle, badge: 'badge-modern-error' };
      default: return { icon: Clock, badge: 'badge-modern-warning' };
    }
  };

  const columns = [
    {
      header: t('pages.doctors.academicStaff'),
      accessor: 'name',
      render: (doctor) => (
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-black border-2 border-white shadow-sm">
            {doctor.name?.charAt(0).toUpperCase() || 'D'}
          </div>
          <div className="flex flex-col">
            <span className="font-black text-slate-900 tracking-tight">{doctor.name || t('pages.doctors.staffMember')}</span>
            <span className="text-[10px] font-bold font-mono text-slate-400">{doctor.user?.phone || t('pages.doctors.terminalIdHidden')}</span>
          </div>
        </div>
      ),
    },
    {
      header: t('pages.doctors.specialization'),
      accessor: 'specialization',
      render: (doctor) => (
        <div className="flex flex-col">
          <span className="text-sm font-bold text-slate-700">{doctor.specialization || t('pages.doctors.generalSpecialist')}</span>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">{t('pages.doctors.departmentLead')}</span>
        </div>
      ),
    },
    {
      header: t('pages.doctors.credentialStatus'),
      accessor: 'approvalStatus',
      align: 'center',
      render: (doctor) => {
        const { icon: Icon, badge } = getStatusStyles(doctor.approvalStatus);
        return (
          <div className="flex flex-col items-center gap-1.5">
            <span className={`badge-modern ${badge}`}>{doctor.approvalStatus}</span>
            <Icon size={14} className={doctor.approvalStatus === 'APPROVED' ? 'text-emerald-500' : 'text-slate-300'} />
          </div>
        );
      },
    },
    {
      header: t('pages.doctors.actions'),
      accessor: 'actions',
      align: 'right',
      render: (doctor) => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={() => navigate(`/doctors/edit/${doctor.id}`)} className="p-3 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"><Edit size={18} /></button>
          <button onClick={() => handleDelete(doctor)} className="p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"><Trash2 size={18} /></button>
        </div>
      ),
    },
  ];

  const filteredDoctors = doctors.filter((doctor) => {
    const name = doctor.name?.toLowerCase() || '';
    const phone = doctor.user?.phone?.toLowerCase() || '';
    const specialization = doctor.specialization?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    return name.includes(search) || phone.includes(search) || specialization.includes(search);
  });

  return (
    <div className="space-y-6 2xl:space-y-8 page-transition">
      <PageHeader
        title={t('pages.doctors.title')}
        subtitle={t('pages.doctors.subtitle')}
        breadcrumbs={[{ label: t('menu.doctors') }]}
        actionLabel={t('pages.doctors.addDoctor')}
        actionPath="/doctors/add"
      />

      <div className="card-premium p-4 2xl:p-6 bg-white border-none shadow-xl shadow-slate-200/50">
        <div className="relative max-w-2xl">
          <Search size={20} className={`absolute top-1/2 -translate-y-1/2 text-slate-400 ${isRTL ? 'right-4' : 'left-4'}`} />
          <input
            type="text"
            placeholder={t('pages.doctors.search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full bg-slate-50 border-none rounded-2xl py-3.5 2xl:py-4 font-bold text-sm 2xl:text-base focus:ring-4 focus:ring-blue-500/10 transition-all ${isRTL ? 'pr-12' : 'pl-12'}`}
          />
        </div>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-slate-100 border-t-emerald-600 rounded-full animate-spin"></div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('pages.doctors.syncingRecords')}</span>
        </div>
      ) : (
        <div className="fade-in">
          <DataTable
            data={filteredDoctors}
            columns={columns}
            loading={false}
            searchable={false}
          />
        </div>
      )}
    </div>
  );
};

export default Doctors;
