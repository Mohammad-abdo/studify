import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Save, 
  User, 
  DollarSign, 
  Printer,
  ShieldAlert,
  Fingerprint,
  Mail,
  Percent,
  Truck,
  Building2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import toast from 'react-hot-toast';
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

  // Financial settings (tax, commissions, shipping)
  const [financialSettings, setFinancialSettings] = useState({
    taxRate: 0,
    commissionRate: 0,
    shippingValue: 0,
    deliveryCommissionRate: 0,
    printCenterCommissionRate: 0,
  });
  const [financialLoading, setFinancialLoading] = useState(false);
  const [financialSaving, setFinancialSaving] = useState(false);

  useEffect(() => {
    if (user?.email !== undefined) {
      setFormData(prev => ({ ...prev, email: user?.email || '' }));
    }
  }, [user?.email]);

  useEffect(() => {
    if (activeTab === 'financial') {
      fetchFinancialSettings();
    }
  }, [activeTab]);

  const fetchFinancialSettings = async () => {
    try {
      setFinancialLoading(true);
      const response = await api.get('/settings/financial');
      const data = response.data.data || response.data;
      setFinancialSettings({
        taxRate: data.taxRate ?? 0,
        commissionRate: data.commissionRate ?? 0,
        shippingValue: data.shippingValue ?? 0,
        deliveryCommissionRate: data.deliveryCommissionRate ?? 0,
        printCenterCommissionRate: data.printCenterCommissionRate ?? 0,
      });
    } catch (error) {
      toast.error(t('pages.settings.financialLoadError'));
    } finally {
      setFinancialLoading(false);
    }
  };

  const handleFinancialSubmit = async (e) => {
    e.preventDefault();
    setFinancialSaving(true);
    try {
      await api.put('/settings/financial', financialSettings);
      toast.success(t('pages.settings.financialSaved'));
    } catch (error) {
      toast.error(isRTL ? 'فشل تحديث الإعدادات المالية' : 'Failed to update financial settings');
    } finally {
      setFinancialSaving(false);
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

  const tabs = [
    { id: 'profile', label: t('pages.settings.identityAndSecurity'), icon: Fingerprint },
    { id: 'financial', label: t('pages.settings.financialControl'), icon: DollarSign },
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

          {activeTab === 'financial' && (
            <div className="space-y-6">
              <div className="card-premium p-6 2xl:p-8 bg-white">
                <div className="flex items-center gap-4 mb-8 border-b border-slate-50 pb-6">
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><DollarSign size={22} /></div>
                  <div>
                    <h3 className="text-lg 2xl:text-xl font-black text-slate-900">{t('pages.settings.financialControl')}</h3>
                    <p className="text-xs 2xl:text-sm font-medium text-slate-400">{t('pages.settings.financialControlDesc')}</p>
                  </div>
                </div>

                {financialLoading ? (
                  <div className="py-16 flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-slate-100 border-t-emerald-600 rounded-full animate-spin" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('common.loading')}</span>
                  </div>
                ) : (
                  <form onSubmit={handleFinancialSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 2xl:gap-8">
                      <div className="space-y-2">
                        <label className={`text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <Percent size={14} /> {t('pages.settings.taxRate')}
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          step={0.5}
                          value={financialSettings.taxRate}
                          onChange={(e) => setFinancialSettings({ ...financialSettings, taxRate: parseFloat(e.target.value) || 0 })}
                          className="input-modern font-bold"
                        />
                        <p className="text-[10px] font-medium text-slate-400">{t('pages.settings.taxRateHint')}</p>
                      </div>
                      <div className="space-y-2">
                        <label className={`text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <Percent size={14} /> {t('pages.settings.commissionRate')}
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          step={0.5}
                          value={financialSettings.commissionRate}
                          onChange={(e) => setFinancialSettings({ ...financialSettings, commissionRate: parseFloat(e.target.value) || 0 })}
                          className="input-modern font-bold"
                        />
                        <p className="text-[10px] font-medium text-slate-400">{t('pages.settings.commissionRateHint')}</p>
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className={`text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <Truck size={14} /> {t('pages.settings.shippingValue')}
                        </label>
                        <input
                          type="number"
                          min={0}
                          step={0.01}
                          value={financialSettings.shippingValue}
                          onChange={(e) => setFinancialSettings({ ...financialSettings, shippingValue: parseFloat(e.target.value) || 0 })}
                          className="input-modern font-bold max-w-xs"
                        />
                        <p className="text-[10px] font-medium text-slate-400">{t('pages.settings.shippingValueHint')}</p>
                      </div>
                      <div className="space-y-2">
                        <label className={`text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <Truck size={14} /> {t('pages.settings.deliveryCommissionRate')}
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          step={0.5}
                          value={financialSettings.deliveryCommissionRate}
                          onChange={(e) => setFinancialSettings({ ...financialSettings, deliveryCommissionRate: parseFloat(e.target.value) || 0 })}
                          className="input-modern font-bold"
                        />
                        <p className="text-[10px] font-medium text-slate-400">{t('pages.settings.deliveryCommissionHint')}</p>
                      </div>
                      <div className="space-y-2">
                        <label className={`text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <Building2 size={14} /> {t('pages.settings.printCenterCommissionRate')}
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          step={0.5}
                          value={financialSettings.printCenterCommissionRate}
                          onChange={(e) => setFinancialSettings({ ...financialSettings, printCenterCommissionRate: parseFloat(e.target.value) || 0 })}
                          className="input-modern font-bold"
                        />
                        <p className="text-[10px] font-medium text-slate-400">{t('pages.settings.printCenterCommissionHint')}</p>
                      </div>
                    </div>
                    <button type="submit" disabled={financialSaving} className="w-full md:w-auto btn-modern-primary py-4 2xl:py-5 px-8 rounded-2xl mt-4">
                      {financialSaving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save size={18} /> {t('pages.settings.saveFinancial')}</>}
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}

          {activeTab === 'print-options' && (
            <div className="card-premium p-6 2xl:p-8 bg-white">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-slate-100 text-slate-600 rounded-2xl"><Printer size={22} /></div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">{t('pages.settings.outputManifests')}</h3>
                  <p className="text-xs font-medium text-slate-400">{isRTL ? 'إدارة خيارات الطباعة من قسم خيارات الطباعة' : 'Manage print options from Print Options section'}</p>
                </div>
              </div>
              <button type="button" onClick={() => navigate('/print-options')} className="btn-modern-secondary py-3 px-5 rounded-xl text-sm">
                {isRTL ? 'فتح خيارات الطباعة' : 'Open Print Options'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
