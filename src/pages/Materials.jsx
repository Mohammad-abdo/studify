import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Eye, Edit, Trash2, Plus, X, Search, Filter } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import DataTable from '../components/DataTable';
import PageHeader from '../components/PageHeader';
import { EmptyStates } from '../components/EmptyState';
import LoadingState from '../components/LoadingState';
import { useLanguage } from '../context/LanguageContext';

const Materials = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    fetchMaterials();
  }, [page, searchTerm, filterStatus]);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (searchTerm) params.append('search', searchTerm);
      if (filterStatus) params.append('approvalStatus', filterStatus);

      const response = await api.get(`/materials?${params}`);
      const data = response.data.data || response.data;
      setMaterials(Array.isArray(data) ? data : []);
      setTotal(response.data.pagination?.total || data.length || 0);
    } catch (error) {
      toast.error(isRTL ? 'فشل تحميل المواد' : 'Failed to load materials');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (material) => {
    const result = await Swal.fire({
      title: isRTL ? 'هل أنت متأكد؟' : 'Are you sure?',
      text: isRTL ? `حذف "${material.title}" هو إجراء نهائي.` : `Deleting "${material.title}" is permanent.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f43f5e',
      cancelButtonColor: '#64748b',
      confirmButtonText: isRTL ? 'حذف نهائي' : 'Delete Permanently',
      reverseButtons: isRTL
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/materials/${material.id}`);
        toast.success(isRTL ? 'تم حذف المادة من النظام' : 'Material removed from system');
        fetchMaterials();
      } catch (error) {
        toast.error(isRTL ? 'فشل حذف المادة' : 'Failed to delete material');
      }
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      APPROVED: 'badge-modern-success',
      PENDING: 'badge-modern-warning',
      REJECTED: 'badge-modern-error',
    };
    return badges[status] || 'badge-modern-info';
  };

  const columns = [
    {
      header: t('pages.materials.studyMaterial'),
      accessor: 'title',
      render: (item) => (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <FileText size={20} />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-slate-900 tracking-tight">{item.title}</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{item.category?.name || t('pages.materials.generalMaterial')}</span>
          </div>
        </div>
      ),
    },
    {
      header: t('pages.materials.contributor'),
      accessor: 'doctor.user.phone',
      hideOnMobile: true,
      render: (item) => (
        <div className="flex flex-col">
          <span className="text-sm font-bold text-slate-700">{item.doctor?.name || t('pages.materials.staffMember')}</span>
          <span className="text-[10px] font-medium text-slate-400">{item.doctor?.user?.phone || t('pages.materials.noPhone')}</span>
        </div>
      ),
    },
    {
      header: t('pages.materials.visibility'),
      accessor: 'approvalStatus',
      align: 'center',
      render: (item) => (
        <span className={`badge-modern ${getStatusBadge(item.approvalStatus)}`}>
          {item.approvalStatus}
        </span>
      ),
    },
    {
      header: t('pages.materials.impact'),
      accessor: 'downloadCount',
      align: 'center',
      hideOnMobile: true,
      render: (item) => (
        <div className="flex flex-col items-center">
          <span className="text-sm font-black text-slate-900">{item.downloadCount || 0}</span>
          <span className="text-[9px] font-black uppercase text-slate-400">{t('pages.materials.downloads')}</span>
        </div>
      ),
    },
    {
      header: t('pages.materials.timestamp'),
      accessor: 'createdAt',
      hideOnMobile: true,
      render: (item) => (
        <span className="text-xs font-bold text-slate-500">
          {new Date(item.createdAt).toLocaleDateString(isRTL ? 'ar-EG' : undefined, { month: 'short', day: 'numeric' })}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 2xl:space-y-8 page-transition">
      <PageHeader
        title={t('pages.materials.title')}
        subtitle={t('pages.materials.subtitle')}
        breadcrumbs={[
          { label: t('menu.materials') },
        ]}
        actionLabel={t('pages.materials.addMaterial')}
        actionPath="/materials/add"
      />

      {/* Enterprise Filter Bar */}
      <div className="card-premium p-4 2xl:p-6 bg-white border-none shadow-xl shadow-slate-200/50">
        <div className="flex flex-col lg:flex-row gap-4 2xl:gap-6">
          <div className="flex-1 relative">
            <Search size={20} className={`absolute top-1/2 -translate-y-1/2 text-slate-400 ${isRTL ? 'right-4' : 'left-4'}`} />
            <input
              type="text"
              placeholder={t('pages.materials.search')}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className={`w-full bg-slate-50 border-none rounded-2xl py-3.5 2xl:py-4 font-bold text-sm 2xl:text-base focus:ring-4 focus:ring-blue-500/10 transition-all ${isRTL ? 'pr-12' : 'pl-12'}`}
            />
          </div>
          
          <div className="flex items-center gap-3 2xl:gap-4">
            <div className="relative min-w-[200px] 2xl:min-w-[240px]">
              <Filter size={18} className={`absolute top-1/2 -translate-y-1/2 text-slate-400 ${isRTL ? 'right-4' : 'left-4'}`} />
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setPage(1);
                }}
                className={`w-full bg-slate-50 border-none rounded-2xl py-3.5 2xl:py-4 font-bold text-sm 2xl:text-base focus:ring-4 focus:ring-blue-500/10 transition-all appearance-none ${isRTL ? 'pr-12 pl-10' : 'pl-12 pr-10'}`}
              >
                <option value="">{t('pages.materials.allStatus')}</option>
                <option value="APPROVED">{isRTL ? 'معتمد' : 'Approved'}</option>
                <option value="PENDING">{isRTL ? 'قيد الانتظار' : 'Pending'}</option>
                <option value="REJECTED">{isRTL ? 'مرفوض' : 'Rejected'}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{isRTL ? 'جاري مزامنة قاعدة البيانات الأكاديمية' : 'Syncing Academic Database'}</span>
        </div>
      ) : materials.length === 0 ? (
        <div className="fade-in">
          <EmptyStates.Search searchTerm={searchTerm} />
        </div>
      ) : (
        <div className="fade-in">
          <DataTable
            data={materials}
            columns={columns}
            loading={false}
            searchable={false}
            serverSide={true}
            total={total}
            page={page}
            limit={limit}
            onPageChange={setPage}
            onView={(item) => navigate(`/materials/${item.id}`)}
            onEdit={(item) => navigate(`/materials/edit/${item.id}`)}
            onDelete={handleDelete}
          />
        </div>
      )}
    </div>
  );
};

export default Materials;
