import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileBarChart, Plus, Edit, Trash2, Download, Search, Filter, Calendar, ExternalLink } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import DataTable from '../components/DataTable';
import PageHeader from '../components/PageHeader';
import { useLanguage } from '../context/LanguageContext';

const Reports = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await api.get('/reports');
      setReports(response.data.data || response.data || []);
    } catch (error) {
      toast.error(isRTL ? 'تحليلات: فشل مزامنة التقارير' : 'Analytics: Report synchronization failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (report) => {
    const result = await Swal.fire({
      title: t('pages.reports.abolishReport'),
      text: t('pages.reports.abolishReportDesc').replace('{name}', report.name),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f43f5e',
      confirmButtonText: t('pages.reports.abolishReportConfirm') || (isRTL ? 'إلغاء التقرير' : 'Abolish Report'),
      reverseButtons: isRTL
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/reports/${report.id}`);
        toast.success(isRTL ? 'تم إلغاء التقرير التحليلي' : 'Analytic report abolished');
        fetchReports();
      } catch (error) {
        toast.error(isRTL ? 'فشل الإلغاء: قفل التحليلات' : 'Abolition failed: Analytics lock');
      }
    }
  };

  const handleDownload = (fileUrl) => {
    if (fileUrl) {
      window.open(fileUrl, '_blank');
    }
  };

  const columns = [
    {
      header: t('pages.reports.intelligenceNode'),
      accessor: 'name',
      render: (report) => (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 shadow-sm">
            <FileBarChart size={20} />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-slate-900 tracking-tight uppercase text-xs">{report.name || t('pages.reports.draftIntelligence')}</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('pages.reports.analyticMatrix')}</span>
          </div>
        </div>
      ),
    },
    {
      header: t('pages.reports.exportManifest'),
      accessor: 'fileUrl',
      render: (report) => (
        <button
          onClick={() => handleDownload(report.fileUrl)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl hover:bg-blue-600 transition-all text-[10px] font-black uppercase tracking-widest shadow-lg shadow-slate-200"
        >
          <Download size={14} strokeWidth={3} />
          {t('pages.reports.exportData')}
        </button>
      ),
    },
    {
      header: t('pages.reports.generationDate'),
      accessor: 'createdAt',
      hideOnMobile: true,
      render: (report) => (
        <div className="flex items-center gap-2 text-slate-400 font-bold">
          <Calendar size={12} />
          <span className="text-xs">{new Date(report.createdAt).toLocaleDateString(isRTL ? 'ar-EG' : undefined)}</span>
        </div>
      ),
    },
    {
      header: t('pages.reports.operations'),
      accessor: 'actions',
      align: 'right',
      render: (report) => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={() => navigate(`/reports/edit/${report.id}`)} className="p-3 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"><Edit size={18} /></button>
          <button onClick={() => handleDelete(report)} className="p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"><Trash2 size={18} /></button>
        </div>
      ),
    },
  ];

  const filteredReports = reports.filter((report) =>
    report.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10 page-transition pb-20">
      <PageHeader
        title={t('pages.reports.title')}
        subtitle={t('pages.reports.subtitle')}
        breadcrumbs={[{ label: t('menu.sections.main') }, { label: t('menu.reports') }]}
        actionLabel={t('pages.reports.generateReport')}
        actionPath="/reports/add"
      />

      <div className="card-premium p-6 bg-white border-none shadow-xl shadow-slate-200/50">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 relative">
            <Search size={20} className={`absolute top-1/2 -translate-y-1/2 text-slate-400 ${isRTL ? 'right-4' : 'left-4'}`} />
            <input
              type="text"
              placeholder={t('pages.reports.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full bg-slate-50 border-none rounded-2xl py-4 font-bold text-sm focus:ring-4 focus:ring-blue-500/10 transition-all ${isRTL ? 'pr-12' : 'pl-12'}`}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('pages.reports.syncingIntelligence')}</span>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="fade-in">
          <EmptyState
            icon={FileBarChart}
            title={t('pages.reports.intelligenceVoid')}
            description={t('pages.reports.intelligenceVoidDesc')}
            actionLabel={t('pages.reports.generateFirstReport')}
            onAction={() => navigate('/reports/add')}
          />
        </div>
      ) : (
        <div className="fade-in">
          <DataTable
            data={filteredReports}
            columns={columns}
            loading={false}
            searchable={false}
          />
        </div>
      )}
    </div>
  );
};

export default Reports;
