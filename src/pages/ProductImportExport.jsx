import { useMemo, useState } from 'react';
import { Download, Upload, FileText, AlertTriangle, CheckCircle2 } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader';
import { useLanguage } from '../context/LanguageContext';

const ProductImportExport = () => {
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';

  const [productsFile, setProductsFile] = useState(null);
  const [pricingFile, setPricingFile] = useState(null);
  const [importingProducts, setImportingProducts] = useState(false);
  const [importingPricing, setImportingPricing] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  const endpoints = useMemo(
    () => ({
      productsExport: '/products/export.csv',
      pricingExport: '/products/pricing/export.csv',
      productsTemplate: '/products/templates/products.csv',
      pricingTemplate: '/products/templates/product_pricing.csv',
      productsImport: '/products/import.csv',
      pricingImport: '/products/pricing/import.csv',
    }),
    []
  );

  const downloadCsv = async (url, fileName) => {
    try {
      const res = await api.get(url, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(link.href);
    } catch (e) {
      toast.error(isRTL ? 'فشل تنزيل ملف CSV' : 'Failed to download CSV');
    }
  };

  const uploadCsv = async ({ url, file, setLoading }) => {
    if (!file) {
      toast.error(isRTL ? 'اختر ملف CSV أولاً' : 'Please select a CSV file first');
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    try {
      setLoading(true);
      const res = await api.post(url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setLastResult(res.data?.data ?? res.data);
      toast.success(isRTL ? 'تم الاستيراد بنجاح' : 'Import completed');
    } catch (e) {
      const msg = e?.response?.data?.error?.message;
      toast.error(msg || (isRTL ? 'فشل الاستيراد' : 'Import failed'));
    } finally {
      setLoading(false);
    }
  };

  const ResultCard = () => {
    if (!lastResult) return null;
    const created = lastResult.createdCount ?? 0;
    const updated = lastResult.updatedCount ?? 0;
    const skipped = lastResult.skippedCount ?? 0;
    const errors = Array.isArray(lastResult.errors) ? lastResult.errors : [];
    const hasErrors = errors.length > 0;

    return (
      <div className="card-premium p-6 bg-white border-none shadow-xl shadow-slate-200/50">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              {hasErrors ? (
                <AlertTriangle size={18} className="text-amber-600" />
              ) : (
                <CheckCircle2 size={18} className="text-emerald-600" />
              )}
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest truncate">
                {t('pages.productImportExport.lastResult')}
              </h3>
            </div>
            <p className="mt-2 text-xs font-bold text-slate-500">
              {t('pages.productImportExport.created')}: <span className="font-black text-slate-900">{created}</span> —{' '}
              {t('pages.productImportExport.updated')}: <span className="font-black text-slate-900">{updated}</span> —{' '}
              {t('pages.productImportExport.skipped')}: <span className="font-black text-slate-900">{skipped}</span>
            </p>
          </div>
        </div>

        {hasErrors && (
          <div className="mt-4 bg-amber-50 border border-amber-100 rounded-2xl p-4">
            <div className="text-[10px] font-black uppercase tracking-widest text-amber-800">
              {t('pages.productImportExport.errors')} ({errors.length})
            </div>
            <div className="mt-2 space-y-2 max-h-56 overflow-auto">
              {errors.slice(0, 50).map((err, idx) => (
                <div key={idx} className="text-xs font-bold text-amber-900">
                  #{err.row ?? '?'} — {err.message ?? String(err)}
                </div>
              ))}
              {errors.length > 50 && (
                <div className="text-[10px] font-black uppercase tracking-widest text-amber-800">
                  {t('pages.productImportExport.moreErrors', { count: errors.length - 50 })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-10 page-transition pb-20">
      <PageHeader
        title={t('pages.productImportExport.title')}
        subtitle={t('pages.productImportExport.subtitle')}
        breadcrumbs={[{ label: t('menu.sections.inventory') }, { label: t('pages.productImportExport.title') }]}
      />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="card-premium p-6 bg-white border-none shadow-xl shadow-slate-200/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500">
              <Download size={18} />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-black uppercase tracking-widest text-slate-900">
                {t('pages.productImportExport.exportTitle')}
              </div>
              <div className="text-xs font-bold text-slate-500">{t('pages.productImportExport.exportSubtitle')}</div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => downloadCsv(endpoints.productsExport, 'products.csv')}
              className="btn-primary w-full justify-center"
            >
              <FileText size={16} />
              <span className="ml-2">{t('pages.productImportExport.downloadProducts')}</span>
            </button>
            <button
              type="button"
              onClick={() => downloadCsv(endpoints.pricingExport, 'product_pricing.csv')}
              className="btn-secondary w-full justify-center"
            >
              <FileText size={16} />
              <span className="ml-2">{t('pages.productImportExport.downloadPricing')}</span>
            </button>
          </div>

          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => downloadCsv(endpoints.productsTemplate, 'products_template.csv')}
              className="btn-secondary w-full justify-center"
            >
              <Download size={16} />
              <span className="ml-2">{t('pages.productImportExport.downloadProductsTemplate')}</span>
            </button>
            <button
              type="button"
              onClick={() => downloadCsv(endpoints.pricingTemplate, 'product_pricing_template.csv')}
              className="btn-secondary w-full justify-center"
            >
              <Download size={16} />
              <span className="ml-2">{t('pages.productImportExport.downloadPricingTemplate')}</span>
            </button>
          </div>
        </div>

        <div className="card-premium p-6 bg-white border-none shadow-xl shadow-slate-200/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500">
              <Upload size={18} />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-black uppercase tracking-widest text-slate-900">
                {t('pages.productImportExport.importTitle')}
              </div>
              <div className="text-xs font-bold text-slate-500">{t('pages.productImportExport.importSubtitle')}</div>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
              <div className="sm:col-span-2">
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={(e) => setProductsFile(e.target.files?.[0] ?? null)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-3 text-xs font-bold text-slate-700"
                />
                <div className="mt-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {t('pages.productImportExport.productsCsv')}
                </div>
              </div>
              <button
                type="button"
                disabled={importingProducts}
                onClick={() =>
                  uploadCsv({
                    url: endpoints.productsImport,
                    file: productsFile,
                    setLoading: setImportingProducts,
                  })
                }
                className="btn-primary w-full justify-center disabled:opacity-60"
              >
                <Upload size={16} />
                <span className="ml-2">{importingProducts ? t('common.loading') : t('pages.productImportExport.upload')}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
              <div className="sm:col-span-2">
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={(e) => setPricingFile(e.target.files?.[0] ?? null)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-3 text-xs font-bold text-slate-700"
                />
                <div className="mt-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {t('pages.productImportExport.pricingCsv')}
                </div>
              </div>
              <button
                type="button"
                disabled={importingPricing}
                onClick={() =>
                  uploadCsv({
                    url: endpoints.pricingImport,
                    file: pricingFile,
                    setLoading: setImportingPricing,
                  })
                }
                className="btn-secondary w-full justify-center disabled:opacity-60"
              >
                <Upload size={16} />
                <span className="ml-2">{importingPricing ? t('common.loading') : t('pages.productImportExport.upload')}</span>
              </button>
            </div>

            <div className="text-xs font-bold text-slate-500">
              {t('pages.productImportExport.importHint')}
            </div>
          </div>
        </div>
      </div>

      <ResultCard />
    </div>
  );
};

export default ProductImportExport;

