import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Wallet, Save, ArrowLeft, Loader2, DollarSign } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader';
import { useLanguage } from '../context/LanguageContext';

const EditDeliveryWallet = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [wallet, setWallet] = useState(null);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    fetchWallet();
  }, [id]);

  const fetchWallet = async () => {
    try {
      setFetching(true);
      const response = await api.get(`/delivery-wallets/${id}`);
      const data = response.data?.data || response.data;
      setWallet(data);
      setBalance(data.balance ?? 0);
    } catch (error) {
      toast.error(isRTL ? 'فشل تحميل بيانات المحفظة' : 'Failed to retrieve wallet information');
      navigate('/delivery-wallets');
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.put(`/delivery-wallets/${id}`, {
        balance: Number(balance),
      });
      toast.success(isRTL ? 'تم تحديث رصيد المحفظة بنجاح' : 'Wallet balance updated successfully');
      navigate('/delivery-wallets');
    } catch (error) {
      toast.error(
        error.response?.data?.error?.message ||
        (isRTL ? 'فشل تحديث رصيد المحفظة' : 'Failed to deploy wallet balance update')
      );
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="py-24 flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-slate-100 border-t-emerald-600 rounded-full animate-spin"></div>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          {isRTL ? 'جاري استيراد الحساب...' : 'Syncing wallet...'}
        </span>
      </div>
    );
  }

  if (!wallet) return null;

  return (
    <div className="space-y-10 page-transition pb-20">
      <PageHeader
        title={isRTL ? 'تعديل المحفظة المالية' : 'Edit Financial Wallet'}
        subtitle={isRTL ? 'تحديث الرصيد المالي المتاح لمندوب التوصيل' : 'Modify the available capital node balance for the logistics agent'}
        breadcrumbs={[
          { label: t('menu.sections.logistics') },
          { label: isRTL ? 'المحافظ المالية' : 'Wallets', path: '/delivery-wallets' },
          { label: isRTL ? 'تعديل' : 'Edit' }
        ]}
        backPath="/delivery-wallets"
      />

      <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-8">
        <div className="card-premium p-8 md:p-10 bg-white space-y-8">
          <div className="flex items-center gap-6 pb-6 border-b border-slate-50">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-600/5">
              <Wallet size={32} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{isRTL ? 'الحساب المالي' : 'Financial Capital'}</h3>
              <p className="text-sm font-medium text-slate-400">
                {wallet.delivery?.name || wallet.delivery?.user?.phone || t('pages.deliveryWallets.assignedNode')}
              </p>
              <p className="text-xs font-mono text-slate-400">ID: {wallet.deliveryId}</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Display Phone */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pr-2">
                {isRTL ? 'رقم الهاتف' : 'Terminal Phone'}
              </label>
              <div className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 font-bold text-slate-500 font-mono text-sm">
                {wallet.delivery?.user?.phone || '—'}
              </div>
            </div>

            {/* Edit Balance */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pr-2">
                {isRTL ? 'الرصيد الحالي' : 'Available Balance'} *
              </label>
              <div className="relative group">
                <DollarSign size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="number"
                  step="any"
                  required
                  min="0"
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-emerald-600/20 focus:bg-white rounded-2xl py-4 pr-6 pl-12 font-black text-slate-900 placeholder:text-slate-300 transition-all outline-none text-lg"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/delivery-wallets')}
            className="px-8 py-4 bg-white border-2 border-slate-100 text-slate-400 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-slate-50 transition-all"
          >
            {t('common.cancel')}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-10 py-4 bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all flex items-center gap-3 active:scale-95 disabled:opacity-70"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {isRTL ? 'حفظ الرصيد' : 'Deploy Balance'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditDeliveryWallet;
