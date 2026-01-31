import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart3, Plus, Edit, Trash2, TrendingUp, Search } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import DataTable from '../components/DataTable';
import PageHeader from '../components/PageHeader';
import { useLanguage } from '../context/LanguageContext';

const DashboardMetrics = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const response = await api.get('/dashboard-metrics');
      setMetrics(response.data.data || response.data || []);
    } catch (error) {
      toast.error(isRTL ? 'فشل تحميل مقاييس لوحة التحكم' : 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (key) => {
    const result = await Swal.fire({
      title: t('pages.dashboardMetrics.purgeMetric'),
      text: t('pages.dashboardMetrics.purgeMetricDesc'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f43f5e',
      confirmButtonText: t('pages.dashboardMetrics.confirmPurge'),
      reverseButtons: isRTL
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/dashboard-metrics/${key}`);
        toast.success(t('pages.dashboardMetrics.success'));
        fetchMetrics();
      } catch (error) {
        toast.error(isRTL ? 'فشل حذف المقياس' : 'Failed to delete metric');
      }
    }
  };

  const columns = [
    {
      header: t('pages.dashboardMetrics.metricKey'),
      accessor: 'key',
      render: (metric) => (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 shadow-sm">
            <BarChart3 size={20} />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-slate-900 tracking-tight font-mono text-sm uppercase">{metric.key || 'N/A'}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter italic">Metric ID</span>
          </div>
        </div>
      ),
    },
    {
      header: t('pages.dashboardMetrics.metricValue'),
      accessor: 'value',
      render: (metric) => (
        <div className="flex flex-col">
          <span className="text-sm font-black text-slate-900">{String(metric.value || 'N/A')}</span>
          <span className="text-[10px] font-medium text-slate-400 uppercase tracking-tighter">Metric Telemetry</span>
        </div>
      ),
    },
    {
      header: t('pages.dashboardMetrics.lastUpdate'),
      accessor: 'updatedAt',
      hideOnMobile: true,
      render: (metric) => (
        <div className="flex items-center gap-2 text-slate-400 font-bold">
          <TrendingUp size={14} className="text-blue-500" />
          <span className="text-xs">{metric.updatedAt ? new Date(metric.updatedAt).toLocaleString(isRTL ? 'ar-EG' : undefined) : 'N/A'}</span>
        </div>
      ),
    },
    {
      header: t('pages.dashboardMetrics.operations'),
      accessor: 'actions',
      align: 'right',
      render: (metric) => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={() => navigate(`/dashboard-metrics/edit/${metric.key}`)} className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Edit size={18} /></button>
          <button onClick={() => handleDelete(metric.key)} className="p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"><Trash2 size={18} /></button>
        </div>
      ),
    },
  ];

  const filteredMetrics = metrics.filter((metric) =>
    metric.key?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10 page-transition pb-20">
      <PageHeader
        title={t('pages.dashboardMetrics.title')}
        subtitle={t('pages.dashboardMetrics.subtitle')}
        breadcrumbs={[{ label: t('menu.sections.system') }, { label: t('menu.dashboardMetrics') }]}
        actionLabel={t('pages.dashboardMetrics.addMetric')}
        actionPath="/dashboard-metrics/add"
      />

      <div className="card-premium p-6 bg-white border-none shadow-xl shadow-slate-200/50">
        <div className="relative max-w-2xl">
          <Search size={20} className={`absolute top-1/2 -translate-y-1/2 text-slate-400 ${isRTL ? 'right-4' : 'left-4'}`} />
          <input
            type="text"
            placeholder={t('pages.dashboardMetrics.search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full bg-slate-50 border-none rounded-2xl py-4 font-bold text-sm focus:ring-4 focus:ring-blue-500/10 transition-all ${isRTL ? 'pr-12' : 'pl-12'}`}
          />
        </div>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('pages.dashboardMetrics.syncingMetrics')}</span>
        </div>
      ) : (
        <div className="fade-in">
          <DataTable
            data={filteredMetrics}
            columns={columns}
            loading={false}
            searchable={false}
          />
        </div>
      )}
    </div>
  );
};

export default DashboardMetrics;


