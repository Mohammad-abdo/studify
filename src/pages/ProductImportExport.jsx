import { useMemo, useState } from 'react';
import { Download, FileSpreadsheet, FileText, Upload } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader';
import { useLanguage } from '../context/LanguageContext';

const SectionCard = ({ icon: Icon, title, subtitle, children }) => (
  <div className="card-premium p-6 bg-white border-none shadow-xl shadow-slate-200/50">
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600">
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <div className="text-xs font-black uppercase tracking-widest text-slate-900">{title}</div>
        <div className="text-xs font-bold text-slate-500">{subtitle}</div>
      </div>
    </div>
    <div className="mt-6">{children}</div>
  </div>
);

const ProductImportExport = () => {
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';
  const [xlsxFile, setXlsxFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const endpoints = useMemo(
    () => ({
      productsImportTemplateXlsx: '/products/templates/products_import.xlsx',
      xlsxExport: '/products/export.xlsx',
      xlsxImport: '/products/import.xlsx',
    }),
    []
  );

  const downloadBlob = async (url, fileName, mime) => {
    try {
      const res = await api.get(url, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: mime });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(link.href);
    } catch (e) {
      toast.error(isRTL ? 'فشل التنزيل' : 'Download failed');
    }
  };

  const uploadWorkbook = async () => {
    if (!xlsxFile) {
      toast.error(isRTL ? 'اختر ملف Excel (.xlsx) أولاً' : 'Please select an Excel (.xlsx) file first');
      return;
    }
    const formData = new FormData();
    formData.append('file', xlsxFile);
    try {
      setUploading(true);
      await api.post(endpoints.xlsxImport, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success(isRTL ? 'تم رفع الملف بنجاح' : 'Workbook uploaded successfully');
      setXlsxFile(null);
    } catch (e) {
      const msg = e?.response?.data?.error?.message;
      toast.error(msg || (isRTL ? 'فشل رفع الملف' : 'Upload failed'));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-10 page-transition pb-20">
      <PageHeader
        title={t('pages.productImportExport.title')}
        subtitle={t('pages.productImportExport.subtitle')}
        breadcrumbs={[{ label: t('menu.sections.inventory') }, { label: t('pages.productImportExport.title') }]}
      />

      <div className="grid grid-cols-1 gap-6">
        <SectionCard
          icon={FileSpreadsheet}
          title={t('pages.productImportExport.title')}
          subtitle={t('pages.productImportExport.subtitle')}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white border border-slate-100 rounded-2xl p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                    {t('pages.productImportExport.importTemplateTitle')}
                  </div>
                  <div className="mt-1 text-xs font-bold text-slate-500">
                    {t('pages.productImportExport.importTemplateSubtitle')}
                  </div>
                </div>
                <div className="shrink-0 w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600">
                  <FileSpreadsheet size={16} />
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  downloadBlob(
                    endpoints.productsImportTemplateXlsx,
                    'products_import.xlsx',
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                  )
                }
                className="btn-primary w-full justify-center mt-4"
              >
                <Download size={16} />
                <span className="ml-2">{t('pages.productImportExport.downloadImportTemplate')}</span>
              </button>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                    {t('pages.productImportExport.exportWorkbookTitle')}
                  </div>
                  <div className="mt-1 text-xs font-bold text-slate-500">
                    {t('pages.productImportExport.exportWorkbookSubtitle')}
                  </div>
                </div>
                <div className="shrink-0 w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600">
                  <FileText size={16} />
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  downloadBlob(
                    endpoints.xlsxExport,
                    'products_export.xlsx',
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                  )
                }
                className="btn-secondary w-full justify-center mt-4"
              >
                <Download size={16} />
                <span className="ml-2">{t('pages.productImportExport.downloadWorkbook')}</span>
              </button>
            </div>
          </div>

          <div className="mt-6 bg-white border border-slate-100 rounded-2xl p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                  {t('pages.productImportExport.uploadWorkbookTitle')}
                </div>
                <div className="mt-1 text-xs font-bold text-slate-500">
                  {t('pages.productImportExport.uploadWorkbookSubtitle')}
                </div>
              </div>
              <div className="shrink-0 w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600">
                <Upload size={16} />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-3 items-end">
              <div className="lg:col-span-2">
                <input
                  type="file"
                  accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  onChange={(e) => setXlsxFile(e.target.files?.[0] ?? null)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-3 text-xs font-bold text-slate-700"
                />
                <div className="mt-2 text-[10px] font-black uppercase tracking-widest text-slate-400 truncate">
                  {xlsxFile?.name || (isRTL ? 'لم يتم اختيار ملف' : 'No file selected')}
                </div>
              </div>
              <button
                type="button"
                disabled={uploading || !xlsxFile}
                onClick={uploadWorkbook}
                className="btn-primary w-full justify-center disabled:opacity-60"
              >
                <Upload size={16} />
                <span className="ml-2">
                  {uploading ? t('common.loading') : t('pages.productImportExport.uploadWorkbookButton')}
                </span>
              </button>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
};

export default ProductImportExport;

