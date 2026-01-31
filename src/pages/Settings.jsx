import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Settings as SettingsIcon, 
  Save, 
  User, 
  Lock, 
  DollarSign, 
  Printer,
  BookOpen,
  FileText,
  Package,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  ShieldAlert,
  Fingerprint,
  Mail
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import DataTable from '../components/DataTable';
import PageHeader from '../components/PageHeader';
import { useLanguage } from '../context/LanguageContext';

const Settings = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    repeatPassword: '',
  });
  const [loading, setLoading] = useState(false);
  
  // Pricing data
  const [bookPricings, setBookPricings] = useState([]);
  const [materialPricings, setMaterialPricings] = useState([]);
  const [productPricings, setProductPricings] = useState([]);
  const [printOptions, setPrintOptions] = useState([]);
  const [pricingLoading, setPricingLoading] = useState(false);
  const [printOptionsLoading, setPrintOptionsLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'pricing') {
      fetchPricingData();
    } else if (activeTab === 'print-options') {
      fetchPrintOptions();
    }
  }, [activeTab]);

  const fetchPricingData = async () => {
    try {
      setPricingLoading(true);
      const [bookRes, materialRes, productRes] = await Promise.all([
        api.get('/book-pricing?limit=100'),
        api.get('/materials?limit=100').then(res => {
          const materials = res.data.data || res.data || [];
          return materials.flatMap(m => (m.pricing || []).map(p => ({ ...p, material: m })));
        }).catch(() => []),
        api.get('/product-pricing?limit=100'),
      ]);
      setBookPricings(bookRes.data.data || bookRes.data || []);
      setMaterialPricings(materialRes || []);
      setProductPricings(productRes.data.data || productRes.data || []);
    } catch (error) {
      toast.error(isRTL ? 'نظام مالي: فشل مزامنة التسعير' : 'Financial system: Pricing synchronization failed');
    } finally {
      setPricingLoading(false);
    }
  };

  const fetchPrintOptions = async () => {
    try {
      setPrintOptionsLoading(true);
      const response = await api.get('/print-options?limit=100');
      setPrintOptions(response.data.data || response.data || []);
    } catch (error) {
      toast.error(isRTL ? 'نظام المخرجات: خيارات الطباعة غير متاحة' : 'Manifest system: Print options unavailable');
    } finally {
      setPrintOptionsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.newPassword && formData.newPassword !== formData.repeatPassword) {
      toast.error(isRTL ? 'خطأ في الاعتماد: كلمات المرور غير متطابقة' : 'Credential mismatch: Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      if (formData.currentPassword && formData.newPassword) {
        await api.post('/auth/change-password', {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        });
        toast.success(isRTL ? 'تم تحديث بيانات الأمان' : 'Security credentials updated');
      }

      if (formData.email !== user?.email) {
        await api.put('/users/profile', { email: formData.email });
        toast.success(isRTL ? 'تم تحديث هوية النظام' : 'System identity updated');
      }
    } catch (error) {
      toast.error(isRTL ? 'خطأ داخلي في الخادم: فشل تسلسل التحديث' : 'Internal Server Error: Update sequence failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePricing = async (type, id) => {
    const result = await Swal.fire({
      title: t('pages.settings.purgeTier'),
      text: t('pages.settings.purgeTierDesc'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f43f5e',
      confirmButtonText: t('pages.settings.abolishTier'),
      reverseButtons: isRTL
    });

    if (result.isConfirmed) {
      try {
        const endpoint = type === 'book' ? '/book-pricing' : '/product-pricing';
        await api.delete(`${endpoint}/${id}`);
        toast.success(isRTL ? 'تم إلغاء فئة السعر' : 'Price tier abolished');
        fetchPricingData();
      } catch (error) {
        toast.error(isRTL ? 'فشل العملية: قيود مالية' : 'Operation failed: Financial restriction');
      }
    }
  };

  const bookPricingColumns = [
    {
      header: t('pages.settings.resource'),
      accessor: 'book.title',
      render: (p) => <span className="font-bold text-slate-900 truncate block max-w-[200px]">{p.book?.title}</span>
    },
    {
      header: t('pages.settings.access'),
      accessor: 'accessType',
      render: (p) => <span className="badge-modern badge-modern-info">{p.accessType}</span>
    },
    {
      header: t('pages.settings.value'),
      accessor: 'price',
      render: (p) => <span className="font-black text-slate-900">${p.price?.toFixed(2)}</span>
    },
    {
      header: t('pages.settings.control'),
      accessor: 'id',
      align: 'right',
      render: (p) => (
        <div className="flex justify-end gap-1">
          <button onClick={() => navigate(`/book-pricing/edit/${p.id}`)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Edit size={16} /></button>
          <button onClick={() => handleDeletePricing('book', p.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"><Trash2 size={16} /></button>
        </div>
      )
    }
  ];

  const tabs = [
    { id: 'profile', label: t('pages.settings.identityAndSecurity'), icon: Fingerprint },
    { id: 'pricing', label: t('pages.settings.financialMatrix'), icon: DollarSign },
    { id: 'print-options', label: t('pages.settings.outputManifests'), icon: Printer },
  ];

  return (
    <div className="space-y-6 2xl:space-y-8 page-transition pb-20">
      <PageHeader
        title={t('pages.settings.title')}
        subtitle={t('pages.settings.subtitle')}
        breadcrumbs={[{ label: t('common.settings') }]}
      />

      <div className="flex flex-col xl:flex-row gap-6 2xl:gap-8 items-start">
        {/* Modern Nav Sidebar */}
        <div className="w-full xl:w-72 2xl:w-80 space-y-2 shrink-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-4 px-5 py-4 2xl:py-5 rounded-2xl transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-slate-900 text-white shadow-2xl shadow-slate-300 font-black scale-[1.02]'
                    : 'bg-white text-slate-500 hover:bg-slate-50 font-bold border border-slate-100'
                }`}
              >
                <Icon size={20} />
                <span className="text-sm uppercase tracking-widest">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content View */}
        <div className="flex-1 w-full space-y-6">
          {activeTab === 'profile' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 2xl:gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="card-premium p-6 2xl:p-8">
                  <div className="flex items-center gap-4 mb-8 border-b border-slate-50 pb-6">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><User size={22} /></div>
                    <div>
                      <h3 className="text-lg 2xl:text-xl font-black text-slate-900">{t('pages.settings.operatorIdentity')}</h3>
                      <p className="text-xs 2xl:text-sm font-medium text-slate-400">{t('pages.settings.updateIdentification')}</p>
                    </div>
                  </div>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className={`text-[10px] font-black uppercase tracking-widest text-slate-400 ${isRTL ? 'mr-1' : 'ml-1'}`}>{t('pages.settings.registryTerminal')}</label>
                        <input type="text" value={user?.phone || ''} disabled className="input-modern opacity-60 cursor-not-allowed font-mono font-bold" />
                      </div>
                      <div className="space-y-2">
                        <label className={`text-[10px] font-black uppercase tracking-widest text-slate-400 ${isRTL ? 'mr-1' : 'ml-1'}`}>{t('pages.settings.systemMailbox')}</label>
                        <div className="relative">
                          <Mail size={16} className={`absolute top-1/2 -translate-y-1/2 text-slate-400 ${isRTL ? 'right-4' : 'left-4'}`} />
                          <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className={`input-modern font-bold ${isRTL ? 'pr-12' : 'pl-12'}`} />
                        </div>
                      </div>
                    </div>
                    
                    <div className="h-px bg-slate-50 my-8"></div>

                    <div className="flex items-center gap-4 mb-6">
                      <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl"><ShieldAlert size={22} /></div>
                      <div>
                        <h3 className="text-lg 2xl:text-xl font-black text-slate-900">{t('pages.settings.securityOverride')}</h3>
                        <p className="text-xs 2xl:text-sm font-medium text-slate-400">{t('pages.settings.updateAccessKeys')}</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className={`text-[10px] font-black uppercase tracking-widest text-slate-400 ${isRTL ? 'mr-1' : 'ml-1'}`}>{t('pages.settings.verifyCurrentKey')}</label>
                        <input type="password" value={formData.currentPassword} onChange={(e) => setFormData({...formData, currentPassword: e.target.value})} className="input-modern font-bold" placeholder="••••••••" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className={`text-[10px] font-black uppercase tracking-widest text-slate-400 ${isRTL ? 'mr-1' : 'ml-1'}`}>{t('pages.settings.initializeNewKey')}</label>
                          <input type="password" value={formData.newPassword} onChange={(e) => setFormData({...formData, newPassword: e.target.value})} className="input-modern font-bold" placeholder="••••••••" />
                        </div>
                        <div className="space-y-2">
                          <label className={`text-[10px] font-black uppercase tracking-widest text-slate-400 ${isRTL ? 'mr-1' : 'ml-1'}`}>{t('pages.settings.confirmNewKey')}</label>
                          <input type="password" value={formData.repeatPassword} onChange={(e) => setFormData({...formData, repeatPassword: e.target.value})} className="input-modern font-bold" placeholder="••••••••" />
                        </div>
                      </div>
                    </div>

                    <button type="submit" disabled={loading} className="w-full btn-modern-primary py-4 2xl:py-5 rounded-2xl mt-8">
                      {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <><Save size={18} /> {t('pages.settings.deployUpdates')}</>}
                    </button>
                  </form>
                </div>
              </div>

              <div className="card-premium p-6 2xl:p-8 h-fit lg:sticky lg:top-28">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">{t('pages.settings.terminalStatus')}</h4>
                <div className="space-y-5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs 2xl:text-sm font-bold text-slate-500">{t('pages.settings.accessLevel')}</span>
                    <span className="badge-modern badge-modern-info">{user?.type}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs 2xl:text-sm font-bold text-slate-500">{t('pages.settings.nodeState')}</span>
                    <span className={`badge-modern ${user?.isActive ? 'badge-modern-success' : 'badge-modern-error'}`}>{user?.isActive ? t('pages.settings.synced') : t('pages.settings.offline')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs 2xl:text-sm font-bold text-slate-500">{t('pages.settings.initialization')}</span>
                    <span className="text-[10px] 2xl:text-xs font-black text-slate-900">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString(isRTL ? 'ar-EG' : undefined) : (isRTL ? 'غير معروف' : 'Unknown')}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pricing' && (
            <div className="space-y-6">
              <div className="card-premium overflow-hidden bg-white">
                <div className="p-6 2xl:p-8 border-b border-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl"><BookOpen size={20} /></div>
                    <h3 className="text-base 2xl:text-lg font-black text-slate-900 uppercase tracking-tight">{t('pages.settings.academicAssetPricing')}</h3>
                  </div>
                  <button onClick={() => navigate('/book-pricing/add')} className="btn-modern-primary py-2 px-4 rounded-xl text-xs"><Plus size={16} /> {t('pages.settings.newTier')}</button>
                </div>
                <DataTable data={bookPricings} columns={bookPricingColumns} loading={pricingLoading} searchable />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
