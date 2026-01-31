import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Plus, Edit, Trash2, Eye, Search, Filter, ShieldCheck, MapPin } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import DataTable from '../components/DataTable';
import PageHeader from '../components/PageHeader';
import { useLanguage } from '../context/LanguageContext';

const Delivery = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/users');
      const allUsers = response.data.data || response.data || [];
      const deliveryUsers = allUsers.filter(user => user.type === 'DELIVERY');
      
      const deliveriesData = deliveryUsers.map(user => ({
        id: user.id,
        userId: user.id,
        name: user.delivery?.name || user.phone,
        user: user,
        vehicleType: user.delivery?.vehicleType || 'N/A',
        isAvailable: user.delivery?.isAvailable ?? true,
      }));
      
      setDeliveries(deliveriesData);
    } catch (error) {
      toast.error(isRTL ? 'فشل مزامنة بيانات موظفي التوصيل' : 'Logistics: Delivery personnel data sync failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (delivery) => {
    const result = await Swal.fire({
      title: t('pages.delivery.decommissionPersonnel'),
      text: t('pages.delivery.decommissionPersonnelDesc').replace('{name}', delivery.name),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f43f5e',
      confirmButtonText: t('pages.delivery.decommissionAgent'),
      reverseButtons: isRTL
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/admin/users/${delivery.userId}`);
        toast.success(isRTL ? 'تم إخراج المندوب من السجل' : 'Agent decommissioned from registry');
        fetchDeliveries();
      } catch (error) {
        toast.error(isRTL ? 'فشل عملية إخراج المندوب' : 'Decommission operation failed');
      }
    }
  };

  const columns = [
    {
      header: t('pages.delivery.logisticAgent'),
      accessor: 'name',
      render: (delivery) => (
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 flex items-center justify-center text-sky-600 font-black border-2 border-white shadow-sm">
            <Truck size={20} />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-slate-900 tracking-tight">{delivery.name || t('pages.delivery.agentZero')}</span>
            <span className="text-[10px] font-bold font-mono text-slate-400">{delivery.user?.phone || t('pages.delivery.terminalOffline')}</span>
          </div>
        </div>
      ),
    },
    {
      header: t('pages.delivery.transitAsset'),
      accessor: 'vehicleType',
      render: (delivery) => (
        <div className="flex flex-col">
          <span className="text-sm font-bold text-slate-700 uppercase tracking-tight">{delivery.vehicleType || 'Unknown Asset'}</span>
          <span className="text-[10px] font-medium text-slate-400">{t('pages.delivery.registryClassification')}</span>
        </div>
      ),
    },
    {
      header: t('pages.delivery.nodeStatus'),
      accessor: 'isAvailable',
      align: 'center',
      render: (delivery) => (
        <div className="flex flex-col items-center gap-1">
          <span className={`badge-modern ${delivery.isAvailable ? 'badge-modern-success' : 'badge-modern-info'}`}>
            {delivery.isAvailable ? t('pages.delivery.activeNode') : t('pages.delivery.standby')}
          </span>
          <span className="text-[9px] font-black uppercase text-slate-300">{t('pages.delivery.operationalState')}</span>
        </div>
      ),
    },
    {
      header: t('pages.delivery.systemId'),
      accessor: 'userId',
      hideOnMobile: true,
      render: (delivery) => (
        <span className="text-[10px] font-mono text-slate-300">#{delivery.userId.slice(0, 12)}</span>
      )
    },
    {
      header: t('pages.delivery.operations'),
      accessor: 'actions',
      align: 'right',
      render: (delivery) => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={() => navigate(`/users/${delivery.userId}`)} className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Eye size={18} /></button>
          <button onClick={() => navigate(`/users/edit/${delivery.userId}`)} className="p-3 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"><Edit size={18} /></button>
          <button onClick={() => handleDelete(delivery)} className="p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"><Trash2 size={18} /></button>
        </div>
      ),
    },
  ];

  const filteredDeliveries = deliveries.filter((delivery) => {
    const name = delivery.name?.toLowerCase() || '';
    const phone = delivery.user?.phone?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    return name.includes(search) || phone.includes(search);
  });

  return (
    <div className="space-y-6 2xl:space-y-8 page-transition pb-20">
      <PageHeader
        title={t('pages.delivery.title')}
        subtitle={t('pages.delivery.subtitle')}
        breadcrumbs={[{ label: t('menu.sections.logistics') }, { label: isRTL ? 'الموظفون' : 'Personnel' }]}
        actionLabel={t('pages.delivery.addAgent')}
        actionPath="/users/add?type=DELIVERY"
      />

      <div className="card-premium p-4 2xl:p-6 bg-white border-none shadow-xl shadow-slate-200/50">
        <div className="flex flex-col lg:flex-row gap-4 2xl:gap-6">
          <div className="flex-1 relative">
            <Search size={20} className={`absolute top-1/2 -translate-y-1/2 text-slate-400 ${isRTL ? 'right-4' : 'left-4'}`} />
            <input
              type="text"
              placeholder={t('pages.delivery.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full bg-slate-50 border-none rounded-2xl py-3.5 2xl:py-4 font-bold text-sm 2xl:text-base focus:ring-4 focus:ring-blue-500/10 transition-all ${isRTL ? 'pr-12' : 'pl-12'}`}
            />
          </div>
          
          <div className="flex items-center gap-3">
            <button className="p-3.5 2xl:p-4 bg-slate-50 text-slate-400 rounded-2xl hover:text-slate-900 transition-all border border-transparent hover:border-slate-200">
              <Filter size={20} />
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-slate-100 border-t-sky-600 rounded-full animate-spin"></div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('pages.delivery.syncingNetwork')}</span>
        </div>
      ) : (
        <div className="fade-in">
          <DataTable
            data={filteredDeliveries}
            columns={columns}
            loading={false}
            searchable={false}
          />
        </div>
      )}
    </div>
  );
};

export default Delivery;
