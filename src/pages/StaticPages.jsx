import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Plus, Search, Edit, Trash2, Globe, ExternalLink, Calendar } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import PageHeader from '../components/PageHeader';
import { useLanguage } from '../context/LanguageContext';

const StaticPages = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      setLoading(true);
      const response = await api.get('/static-pages');
      setPages(response.data.data || response.data || []);
    } catch (error) {
      toast.error(isRTL ? 'نظام إدارة المحتوى: فشل مزامنة المحتوى الثابت' : 'CMS: Static content synchronization failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (page) => {
    const result = await Swal.fire({
      title: t('pages.staticPages.purgeContent'),
      text: t('pages.staticPages.purgeContentDesc').replace('{title}', page.title),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f43f5e',
      confirmButtonText: t('pages.staticPages.purgeContentConfirm'),
      reverseButtons: isRTL
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/static-pages/${page.id}`);
        toast.success(isRTL ? 'تم حذف المحتوى بنجاح' : 'Content purged successfully');
        fetchPages();
      } catch (error) {
        toast.error(isRTL ? 'فشل عملية الحذف: قفل نظام إدارة المحتوى' : 'Purge operation failed: CMS lock');
      }
    }
  };

  const filteredPages = pages.filter((page) =>
    page.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    page.slug?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    page.content?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10 page-transition pb-20">
      <PageHeader
        title={t('pages.staticPages.title')}
        subtitle={t('pages.staticPages.subtitle')}
        breadcrumbs={[{ label: t('menu.sections.system') }, { label: t('menu.staticPages') }]}
        actionLabel={t('pages.staticPages.draftPage')}
        actionPath="/static-pages/add"
      />

      <div className="card-premium p-6 bg-white border-none shadow-xl shadow-slate-200/50">
        <div className="relative max-w-2xl">
          <Search size={20} className={`absolute top-1/2 -translate-y-1/2 text-slate-400 ${isRTL ? 'right-4' : 'left-4'}`} />
          <input
            type="text"
            placeholder={t('pages.staticPages.search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full bg-slate-50 border-none rounded-2xl py-4 font-bold text-sm focus:ring-4 focus:ring-blue-500/10 transition-all ${isRTL ? 'pr-12' : 'pl-12'}`}
          />
        </div>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-slate-100 border-t-slate-900 rounded-full animate-spin"></div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('pages.staticPages.syncingCms')}</span>
        </div>
      ) : filteredPages.length === 0 ? (
        <div className="card-premium p-20 text-center bg-white flex flex-col items-center">
          <div className="p-8 bg-slate-50 rounded-full text-slate-200 mb-6">
            <FileText size={48} />
          </div>
          <h3 className="text-xl font-black text-slate-900">{t('pages.staticPages.noPagesRegistered')}</h3>
          <p className="text-slate-400 font-medium text-sm mt-2 max-w-xs mx-auto">{t('pages.staticPages.noPagesRegisteredDesc')}</p>
          <button onClick={() => navigate('/static-pages/add')} className="btn-modern-primary py-4 px-10 rounded-2xl mt-8 uppercase tracking-widest text-[10px]">{t('pages.staticPages.createFirstPage')}</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 2xl:gap-8 fade-in">
          {filteredPages.map((page) => (
            <div key={page.id} className="card-premium p-8 bg-white group hover:border-slate-900 transition-all duration-300">
              <div className="flex justify-between items-start mb-6">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <Globe size={12} className="text-blue-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-mono">/{page.slug}</span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">{page.title}</h3>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all">
                  <FileText size={20} />
                </div>
              </div>

              <p className="text-sm text-slate-500 font-medium line-clamp-3 mb-8 min-h-[60px]">
                {page.content}
              </p>

              <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                <div className="flex items-center gap-2 text-slate-400">
                  <Calendar size={12} />
                  <span className="text-[10px] font-black uppercase tracking-tighter">{new Date(page.updatedAt).toLocaleDateString(isRTL ? 'ar-EG' : undefined)}</span>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => navigate(`/static-pages/edit/${page.id}`)} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"><Edit size={16} /></button>
                  <button onClick={() => handleDelete(page)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StaticPages;
