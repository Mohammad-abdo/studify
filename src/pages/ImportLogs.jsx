import { useState, useEffect } from 'react';
import { Upload, CheckCircle, XCircle, Clock, FileText, Search, Filter, ArrowUpRight, Calendar } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';
import DataTable from '../components/DataTable';
import PageHeader from '../components/PageHeader';
import { useLanguage } from '../context/LanguageContext';

const ImportLogs = () => {
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/import-logs');
      setLogs(response.data.data || response.data || []);
    } catch (error) {
      toast.error(isRTL ? 'نظام: فشل مزامنة سجل الاستيراد' : 'System: Import registry synchronization failed');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (success, failed) => {
    if (failed === 0) return 'badge-modern-success';
    if (success === 0) return 'badge-modern-error';
    return 'badge-modern-warning';
  };

  const columns = [
    {
      header: t('pages.importLogs.processType'),
      accessor: 'type',
      render: (log) => (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 shadow-sm">
            <Upload size={18} />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-slate-900 tracking-tight uppercase text-xs">{log.type}</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('pages.importLogs.dataImportNode')}</span>
          </div>
        </div>
      ),
    },
    {
      header: t('pages.importLogs.deploymentStatus'),
      accessor: 'status',
      align: 'center',
      render: (log) => {
        const badgeClass = getStatusBadge(log.success || 0, log.failed || 0);
        return (
          <div className="flex flex-col items-center gap-1">
            <span className={`badge-modern ${badgeClass}`}>
              {log.failed === 0 ? t('pages.importLogs.fullSuccess') : log.success === 0 ? t('pages.importLogs.fullFailure') : t('pages.importLogs.partialDeploy')}
            </span>
            <span className="text-[9px] font-black text-slate-400">
              {log.success || 0} {t('pages.importLogs.commit')} — {log.failed || 0} {t('pages.importLogs.reject')}
            </span>
          </div>
        );
      },
    },
    {
      header: t('pages.importLogs.sourceManifest'),
      accessor: 'fileUrl',
      render: (log) => (
        <a
          href={log.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-900 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest border border-slate-100"
        >
          <FileText size={14} />
          {t('pages.importLogs.reviewFile')}
          <ArrowUpRight size={12} />
        </a>
      ),
    },
    {
      header: t('pages.importLogs.timestamp'),
      accessor: 'createdAt',
      hideOnMobile: true,
      render: (log) => (
        <div className="flex items-center gap-2 text-slate-400 font-bold">
          <Calendar size={12} />
          <span className="text-xs">{new Date(log.createdAt).toLocaleString(isRTL ? 'ar-EG' : undefined)}</span>
        </div>
      ),
    },
  ];

  const filteredLogs = logs.filter((log) => {
    const type = log.type?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    return type.includes(search);
  });

  return (
    <div className="space-y-10 page-transition pb-20">
      <PageHeader
        title={t('pages.importLogs.title')}
        subtitle={t('pages.importLogs.subtitle')}
        breadcrumbs={[{ label: t('menu.sections.system') }, { label: t('menu.importLogs') }]}
      />

      <div className="card-premium p-6 bg-white border-none shadow-xl shadow-slate-200/50">
        <div className="relative max-w-2xl">
          <Search size={20} className={`absolute top-1/2 -translate-y-1/2 text-slate-400 ${isRTL ? 'right-4' : 'left-4'}`} />
          <input
            type="text"
            placeholder={t('pages.importLogs.search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full bg-slate-50 border-none rounded-2xl py-4 font-bold text-sm focus:ring-4 focus:ring-blue-500/10 transition-all ${isRTL ? 'pr-12' : 'pl-12'}`}
          />
        </div>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-slate-100 border-t-slate-900 rounded-full animate-spin"></div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('pages.importLogs.syncingPipeline')}</span>
        </div>
      ) : (
        <div className="fade-in">
          <DataTable
            data={filteredLogs}
            columns={columns}
            loading={false}
            searchable={false}
          />
        </div>
      )}
    </div>
  );
};

export default ImportLogs;
