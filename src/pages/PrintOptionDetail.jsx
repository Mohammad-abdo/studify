import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Edit, Printer, BookOpen, FileText, Upload, Calendar, Layers, ShieldCheck, Box, Activity } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader';
import { useLanguage } from '../context/LanguageContext';

const PrintOptionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';
  const [printOption, setPrintOption] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id === 'add' || id === 'edit') {
      navigate('/print-options', { replace: true });
      return;
    }
    fetchPrintOption();
  }, [id, navigate]);

  const fetchPrintOption = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/print-options/${id}`);
      const data = response.data.data || response.data;
      setPrintOption(data);
    } catch (error) {
      toast.error(isRTL ? 'فشل تحميل خيار الطباعة' : 'Manifest system: Print option unavailable');
      navigate('/print-options');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-slate-100 border-t-slate-900 rounded-full animate-spin"></div>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('pages.printOptionDetail.loading')}</span>
      </div>
    );
  }

  if (!printOption) return null;

  return (
    <div className="space-y-10 page-transition pb-20">
      <PageHeader
        title={`${t('pages.printOptionDetail.title')} #${printOption.id.substring(0, 8)}`}
        subtitle={t('pages.printOptionDetail.subtitle')}
        breadcrumbs={[
          { label: t('menu.printOptions'), path: '/print-options' },
          { label: isRTL ? 'تفاصيل التكوين' : 'Configuration Detail' },
        ]}
        backPath="/print-options"
        actionLabel={t('pages.printOptionDetail.editOption')}
        actionPath={`/print-options/edit/${printOption.id}`}
      />

      <div className="flex flex-col xl:flex-row gap-10 items-start">
        {/* Main Configuration Area */}
        <div className="flex-1 w-full space-y-10">
          {/* Source Node Identification */}
          <div className="card-premium p-10 bg-white">
            <div className="flex items-center gap-4 mb-10 border-b border-slate-50 pb-6">
              <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl"><Box size={24} /></div>
              <div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{t('pages.printOptionDetail.source')}</h3>
                <p className="text-sm font-medium text-slate-400">{isRTL ? 'تحديد عقدة الأصل والمصدر الرقمي' : 'Origin node identification and digital source'}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {printOption.bookId && (
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-5 group hover:bg-white hover:border-blue-500/30 transition-all">
                  <div className="p-3 bg-white text-blue-600 rounded-xl shadow-sm"><BookOpen size={24} /></div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('pages.printOptionDetail.book')}</span>
                    <span className="text-sm font-black text-slate-900">{printOption.book?.title || printOption.bookId}</span>
                  </div>
                </div>
              )}
              {printOption.materialId && (
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-5 group hover:bg-white hover:border-emerald-500/30 transition-all">
                  <div className="p-3 bg-white text-emerald-600 rounded-xl shadow-sm"><FileText size={24} /></div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('pages.printOptionDetail.material')}</span>
                    <span className="text-sm font-black text-slate-900">{printOption.material?.title || printOption.materialId}</span>
                  </div>
                </div>
              )}
              {printOption.uploadedFileUrl && (
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-5 group hover:bg-white hover:border-violet-500/30 transition-all">
                  <div className="p-3 bg-white text-violet-600 rounded-xl shadow-sm"><Upload size={24} /></div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('pages.printOptionDetail.uploadedFile')}</span>
                    <a href={printOption.uploadedFileUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-black text-blue-600 hover:underline">{t('pages.printOptionDetail.viewFile')}</a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Technical Output Parameters */}
          <div className="card-premium p-10 bg-white">
            <div className="flex items-center gap-4 mb-10 border-b border-slate-50 pb-6">
              <div className={`p-4 ${isRTL ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-900 text-white'} rounded-2xl shadow-xl shadow-current/10`}><Printer size={24} /></div>
              <div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{t('pages.printOptionDetail.printConfiguration')}</h3>
                <p className="text-sm font-medium text-slate-400">{isRTL ? 'المعلمات الفنية لعملية الإنتاج المادي' : 'Technical parameters for the physical production process'}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('pages.printOptionDetail.copies')}</span>
                <p className="text-lg font-black text-slate-900">{printOption.copies || 1} Unit(s)</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('pages.printOptionDetail.paperType')}</span>
                <div className="flex items-center gap-2">
                  <span className="badge-modern badge-modern-info uppercase tracking-widest">{printOption.paperType || 'A4'}</span>
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('pages.printOptionDetail.colorType')}</span>
                <div className="flex items-center gap-2">
                  <span className={`badge-modern ${printOption.colorType === 'COLOR' ? 'badge-modern-success' : 'badge-modern-info'} uppercase tracking-widest`}>
                    {printOption.colorType || 'BLACK_WHITE'}
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('pages.printOptionDetail.doubleSided')}</span>
                <div className="flex items-center gap-2">
                  <span className={`badge-modern ${printOption.doubleSide ? 'badge-modern-success' : 'badge-modern-info'} uppercase tracking-widest`}>
                    {printOption.doubleSide ? t('pages.printOptionDetail.yes') : t('pages.printOptionDetail.no')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Registry Sidebar */}
        <div className="w-full xl:w-96 space-y-8 shrink-0 lg:sticky lg:top-28">
          <div className="card-premium p-10 bg-slate-900 text-white border-none shadow-2xl shadow-slate-300">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-10">{t('pages.printOptionDetail.information')}</h3>
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('pages.printOptionDetail.status')}</span>
                  <span className="badge-modern badge-modern-success">{t('pages.printOptionDetail.active')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('pages.printOptionDetail.created')}</span>
                  <span className="text-xs font-black text-white">{new Date(printOption.createdAt).toLocaleDateString(isRTL ? 'ar-EG' : undefined)}</span>
                </div>
              </div>
              
              <div className="h-px bg-white/10"></div>

              <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                <div className="flex items-center gap-3 text-blue-400 mb-2">
                  <ShieldCheck size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">{isRTL ? 'بيان موثق' : 'Manifest Secured'}</span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium leading-relaxed uppercase tracking-wider">{isRTL ? 'تم فك تشفير هذا البيان المطبوع وهو مخزن بأمان في سجل المخرجات.' : 'This print manifest has been decoded and is securely stored in the output registry.'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintOptionDetail;
