import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Plus, Edit, Trash2, Search, Filter, UserCircle, Phone, Mail } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import DataTable from '../components/DataTable';
import PageHeader from '../components/PageHeader';
import { useLanguage } from '../context/LanguageContext';

const Customers = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/customers');
      setCustomers(response.data.data || response.data || []);
    } catch (error) {
      toast.error(isRTL ? 'فشل مزامنة سجلات العملاء' : 'Identity: Customer records synchronization failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (customer) => {
    const result = await Swal.fire({
      title: t('pages.customers.purgeProfile'),
      text: t('pages.customers.purgeProfileDesc').replace('{name}', customer.entityName),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f43f5e',
      confirmButtonText: isRTL ? 'تأكيد الحذف' : 'Confirm Purge',
      reverseButtons: isRTL
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/customers/${customer.id}`);
        toast.success(isRTL ? 'تم حذف ملف التاجر من السجل' : 'Merchant profile purged from registry');
        fetchCustomers();
      } catch (error) {
        toast.error(isRTL ? 'فشل عملية الحذف: السجل مقفل' : 'Purge operation failed: Registry locked');
      }
    }
  };

  const columns = [
    {
      header: t('pages.customers.merchantEntity'),
      accessor: 'entityName',
      render: (customer) => (
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black border-2 border-white shadow-sm">
            {customer.entityName?.charAt(0).toUpperCase() || 'M'}
          </div>
          <div className="flex flex-col">
            <span className="font-black text-slate-900 tracking-tight">{customer.entityName || t('pages.customers.unnamedMerchant')}</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('pages.customers.merchantRegistry')}</span>
          </div>
        </div>
      ),
    },
    {
      header: t('pages.customers.authorizedContact'),
      accessor: 'contactPerson',
      render: (customer) => (
        <div className="flex items-center gap-3">
          <UserCircle size={16} className="text-slate-400" />
          <span className="text-sm font-bold text-slate-700">{customer.contactPerson || t('pages.customers.leadAdministrator')}</span>
        </div>
      ),
    },
    {
      header: t('pages.customers.terminalInfo'),
      accessor: 'phone',
      render: (customer) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-slate-600">
            <Phone size={12} />
            <span className="text-xs font-bold font-mono">{customer.phone || customer.user?.phone || t('pages.customers.offline')}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <Mail size={12} />
            <span className="text-[10px] font-medium">{customer.user?.email || t('pages.customers.noRegistryEmail')}</span>
          </div>
        </div>
      ),
    },
    {
      header: t('pages.customers.registryStatus'),
      accessor: 'id',
      align: 'center',
      render: (customer) => (
        <span className="badge-modern badge-modern-info">{t('pages.customers.verifiedMerchant')}</span>
      )
    },
    {
      header: t('pages.customers.operations'),
      accessor: 'actions',
      align: 'right',
      render: (customer) => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={() => navigate(`/customers/edit/${customer.id}`)} className="p-3 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"><Edit size={18} /></button>
          <button onClick={() => handleDelete(customer)} className="p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"><Trash2 size={18} /></button>
        </div>
      ),
    },
  ];

  const filteredCustomers = customers.filter((customer) => {
    const entityName = customer.entityName?.toLowerCase() || '';
    const contactPerson = customer.contactPerson?.toLowerCase() || '';
    const phone = customer.phone?.toLowerCase() || customer.user?.phone?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    return entityName.includes(search) || contactPerson.includes(search) || phone.includes(search);
  });

  return (
    <div className="space-y-6 2xl:space-y-8 page-transition pb-20">
      <PageHeader
        title={t('pages.customers.title')}
        subtitle={t('pages.customers.subtitle')}
        breadcrumbs={[{ label: t('menu.sections.userManagement') }, { label: isRTL ? 'التجار' : 'Merchants' }]}
        actionLabel={t('pages.customers.addMerchant')}
        actionPath="/customers/add"
      />

      <div className="card-premium p-4 2xl:p-6 bg-white border-none shadow-xl shadow-slate-200/50">
        <div className="flex flex-col lg:flex-row gap-4 2xl:gap-6">
          <div className="flex-1 relative">
            <Search size={20} className={`absolute top-1/2 -translate-y-1/2 text-slate-400 ${isRTL ? 'right-4' : 'left-4'}`} />
            <input
              type="text"
              placeholder={t('pages.customers.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full bg-slate-50 border-none rounded-2xl py-3.5 2xl:py-4 font-bold text-sm 2xl:text-base focus:ring-4 focus:ring-blue-500/10 transition-all ${isRTL ? 'pr-12' : 'pl-12'}`}
            />
          </div>
          
          <div className="flex items-center gap-3">
            <button className="p-3.5 2xl:p-4 bg-slate-50 text-slate-400 rounded-2xl hover:text-slate-900 transition-all">
              <Filter size={20} />
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('pages.customers.syncingDatabase')}</span>
        </div>
      ) : (
        <div className="fade-in">
          <DataTable
            data={filteredCustomers}
            columns={columns}
            loading={false}
            searchable={false}
          />
        </div>
      )}
    </div>
  );
};

export default Customers;
