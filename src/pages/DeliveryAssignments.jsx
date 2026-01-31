import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Plus, Edit, Trash2, Truck, Search, Filter, ShoppingBag, Clock } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import DataTable from '../components/DataTable';
import PageHeader from '../components/PageHeader';
import { useLanguage } from '../context/LanguageContext';

const DeliveryAssignments = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/delivery-assignments');
      setAssignments(response.data.data || response.data || []);
    } catch (error) {
      toast.error(isRTL ? 'لوجستيات: فشل مزامنة مصفوفة التكليفات' : 'Logistics: Assignment matrix sync failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (assignment) => {
    const result = await Swal.fire({
      title: t('pages.deliveryAssignments.voidAssignment'),
      text: t('pages.deliveryAssignments.voidAssignmentDesc'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f43f5e',
      confirmButtonText: t('pages.deliveryAssignments.confirmVoid'),
      reverseButtons: isRTL
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/delivery-assignments/${assignment.id}`);
        toast.success(isRTL ? 'تم إلغاء التكليف' : 'Assignment voided');
        fetchAssignments();
      } catch (error) {
        toast.error(isRTL ? 'فشل عملية الإلغاء: السجل مقفل' : 'Void operation failed: Record locked');
      }
    }
  };

  const columns = [
    {
      header: t('pages.deliveryAssignments.deploymentNode'),
      accessor: 'delivery',
      render: (assignment) => (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 shadow-sm">
            <Truck size={20} />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-slate-900 tracking-tight">{assignment.delivery?.name || t('pages.deliveryAssignments.assignedAgent')}</span>
            <span className="text-[10px] font-bold text-slate-400 font-mono">NODE: {assignment.deliveryId?.slice(0, 8)}</span>
          </div>
        </div>
      ),
    },
    {
      header: t('pages.deliveryAssignments.targetManifest'),
      accessor: 'orderId',
      render: (assignment) => (
        <div className="flex items-center gap-2">
          <ShoppingBag size={14} className="text-slate-400" />
          <span className="font-mono text-xs font-bold text-slate-600 uppercase tracking-tighter">#ORD-{assignment.orderId?.slice(0, 8)}</span>
        </div>
      ),
    },
    {
      header: t('pages.deliveryAssignments.missionStatus'),
      accessor: 'status',
      align: 'center',
      render: (assignment) => (
        <div className="flex flex-col items-center gap-1">
          <span className={`badge-modern ${assignment.status === 'DELIVERED' ? 'badge-modern-success' : 'badge-modern-info'}`}>
            {assignment.status}
          </span>
          <span className="text-[9px] font-black uppercase text-slate-300">{t('pages.deliveryAssignments.liveTelemetry')}</span>
        </div>
      ),
    },
    {
      header: t('pages.deliveryAssignments.dispatchTime'),
      accessor: 'createdAt',
      hideOnMobile: true,
      render: (assignment) => (
        <div className="flex items-center gap-2 text-slate-400 font-bold">
          <Clock size={12} />
          <span className="text-xs">{new Date(assignment.createdAt).toLocaleTimeString(isRTL ? 'ar-EG' : undefined, { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      )
    },
    {
      header: t('pages.deliveryAssignments.operations'),
      accessor: 'actions',
      align: 'right',
      render: (assignment) => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={() => navigate(`/delivery-assignments/edit/${assignment.id}`)} className="p-3 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"><Edit size={18} /></button>
          <button onClick={() => handleDelete(assignment)} className="p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"><Trash2 size={18} /></button>
        </div>
      ),
    },
  ];

  const filteredAssignments = assignments.filter((assignment) => {
    const deliveryName = assignment.delivery?.name?.toLowerCase() || '';
    const orderId = assignment.orderId?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    return deliveryName.includes(search) || orderId.includes(search);
  });

  return (
    <div className="space-y-10 page-transition pb-20">
      <PageHeader
        title={t('pages.deliveryAssignments.title')}
        subtitle={t('pages.deliveryAssignments.subtitle')}
        breadcrumbs={[{ label: t('menu.sections.logistics') }, { label: t('menu.assignments') }]}
        actionLabel={t('pages.deliveryAssignments.deployAgent')}
        actionPath="/delivery-assignments/add"
      />

      <div className="card-premium p-6 bg-white border-none shadow-xl shadow-slate-200/50">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 relative">
            <Search size={20} className={`absolute top-1/2 -translate-y-1/2 text-slate-400 ${isRTL ? 'right-4' : 'left-4'}`} />
            <input
              type="text"
              placeholder={t('pages.deliveryAssignments.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full bg-slate-50 border-none rounded-2xl py-4 font-bold text-sm focus:ring-4 focus:ring-blue-500/10 transition-all ${isRTL ? 'pr-12' : 'pl-12'}`}
            />
          </div>
          
          <div className="flex items-center gap-3">
            <button className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:text-slate-900 transition-all">
              <Filter size={20} />
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('pages.deliveryAssignments.syncingDeployment')}</span>
        </div>
      ) : (
        <div className="fade-in">
          <DataTable
            data={filteredAssignments}
            columns={columns}
            loading={false}
            searchable={false}
          />
        </div>
      )}
    </div>
  );
};

export default DeliveryAssignments;
