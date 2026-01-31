import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, BookOpen, User, Building, Tag, FileText, Calendar, CheckCircle, Clock, XCircle, Layout, Layers, ShieldCheck, Star } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader';
import { useLanguage } from '../context/LanguageContext';

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBook();
  }, [id]);

  const fetchBook = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/books/${id}`);
      const bookData = response.data.data || response.data;
      if (bookData.imageUrls && typeof bookData.imageUrls === 'string') {
        bookData.imageUrls = JSON.parse(bookData.imageUrls);
      }
      setBook(bookData);
    } catch (error) {
      toast.error(isRTL ? 'مكتبة: فشل استرجاع الأصل' : 'Library: Asset retrieval failed');
      navigate('/books');
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case 'APPROVED': return { icon: CheckCircle, badge: 'badge-modern-success' };
      case 'PENDING': return { icon: Clock, badge: 'badge-modern-warning' };
      case 'REJECTED': return { icon: XCircle, badge: 'badge-modern-error' };
      default: return { icon: Clock, badge: 'badge-modern-info' };
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-slate-100 border-t-slate-900 rounded-full animate-spin"></div>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{isRTL ? 'جاري استرجاع الأصل الأكاديمي' : 'Retrieving Academic Asset'}</span>
      </div>
    );
  }

  if (!book) return null;

  const images = Array.isArray(book.imageUrls) ? book.imageUrls : [];
  const status = getStatusStyles(book.approvalStatus);

  return (
    <div className="space-y-10 page-transition pb-20">
      <PageHeader
        title={book.title}
        subtitle={t('pages.bookDetail.subtitle')}
        breadcrumbs={[{ label: t('menu.books'), path: '/books' }, { label: t('pages.bookDetail.title') }]}
        backPath="/books"
        actionLabel={t('pages.bookDetail.modifyAsset')}
        actionPath={`/books/edit/${book.id}`}
      />

      <div className="flex flex-col xl:flex-row gap-10 items-start">
        {/* Main Resource Area */}
        <div className="flex-1 w-full space-y-10">
          {/* Technical Specifications */}
          <div className="card-premium p-10 bg-white">
            <div className="flex flex-col md:flex-row gap-10">
              <div className="w-full md:w-64 shrink-0">
                <div className="aspect-[3/4] rounded-3xl bg-slate-100 overflow-hidden border-4 border-white shadow-2xl shadow-slate-200 group">
                  {images[0] ? (
                    <img src={images[0]} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300"><BookOpen size={64} /></div>
                  )}
                </div>
              </div>
              
              <div className="flex-1 space-y-8">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">{t('pages.bookDetail.technicalRegistry')}</span>
                    <div className="h-px flex-1 bg-slate-50"></div>
                  </div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">{book.title}</h2>
                  <p className="text-slate-500 font-medium mt-4 leading-relaxed">{book.description}</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-8 p-8 bg-slate-50 rounded-3xl border border-slate-100">
                  <div className="space-y-1">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{t('pages.bookDetail.dimension')}</span>
                    <p className="text-sm font-black text-slate-900">{book.totalPages || 'N/A'} {t('pages.bookDetail.pages')}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{t('pages.bookDetail.classification')}</span>
                    <p className="text-sm font-black text-slate-900 truncate">{book.category?.name || t('pages.bookDetail.general')}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{t('pages.bookDetail.nodeState')}</span>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${book.approvalStatus === 'APPROVED' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                      <span className="text-[10px] font-black uppercase text-slate-900">{book.approvalStatus}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Visual Assets */}
          {images.length > 1 && (
            <div className="card-premium p-10 bg-white">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-8">{t('pages.bookDetail.additionalVisualAssets')}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {images.slice(1).map((img, i) => (
                  <div key={i} className="aspect-square rounded-2xl bg-slate-50 overflow-hidden border-2 border-white shadow-sm hover:border-blue-500 transition-all cursor-pointer">
                    <img src={img} className="w-full h-full object-cover" alt="" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Financial Tiers */}
          <div className="card-premium overflow-hidden bg-white">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
              <div>
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">{t('pages.bookDetail.financialTiers')}</h3>
                <p className="text-xs font-medium text-slate-400">{t('pages.bookDetail.accessProtocols')}</p>
              </div>
              <DollarSign size={24} className="text-slate-200" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-x divide-slate-50">
              {book.pricing?.map((p, i) => (
                <div key={i} className="p-8 space-y-4 hover:bg-slate-50/50 transition-all">
                  <span className="badge-modern badge-modern-info">{p.accessType}</span>
                  <div className="flex flex-col">
                    <span className="text-3xl font-black text-slate-900 tracking-tighter">${p.price?.toFixed(2)}</span>
                    <span className="text-[10px] font-black uppercase text-slate-400">{t('pages.bookDetail.marketRate')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Intelligence Sidebar */}
        <div className="w-full xl:w-96 space-y-8 shrink-0 lg:sticky lg:top-28">
          <div className="card-premium p-10 bg-slate-900 text-white border-none shadow-2xl shadow-slate-300">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-10">{t('pages.bookDetail.contributorNode')}</h3>
            <div className="space-y-8">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-blue-400 border border-white/10"><User size={32} /></div>
                <div className="flex flex-col">
                  <span className="text-lg font-black tracking-tight">{book.doctor?.name || t('pages.bookDetail.academicLead')}</span>
                  <span className="text-[10px] font-black uppercase text-blue-400 tracking-widest">{book.doctor?.specialization || t('pages.bookDetail.professionalPractitioner')}</span>
                </div>
              </div>
              
              <div className="h-px bg-white/10"></div>

              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('pages.bookDetail.institutionalNode')}</span>
                  <span className="text-xs font-black text-white">{book.college?.name || 'Root'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('pages.bookDetail.majorProtocol')}</span>
                  <span className="text-xs font-black text-white">{book.department?.name || t('pages.bookDetail.general')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('pages.bookDetail.registryDate')}</span>
                  <span className="text-xs font-black text-white">{new Date(book.createdAt).toLocaleDateString(isRTL ? 'ar-EG' : undefined)}</span>
                </div>
              </div>

              <button onClick={() => navigate(`/doctors/${book.doctor?.id}`)} className="w-full py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest border border-white/10 transition-all">{t('pages.bookDetail.reviewContributorProfile')}</button>
            </div>
          </div>

          <div className="card-premium p-8 bg-white border-2 border-slate-50">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-8">{t('pages.bookDetail.resourceLink')}</h4>
            {book.fileUrl ? (
              <a href={book.fileUrl} target="_blank" rel="noopener noreferrer" className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all">
                <FileText size={18} /> {t('pages.bookDetail.accessDigitalManifest')}
              </a>
            ) : (
              <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center">
                <span className="text-[10px] font-black uppercase text-slate-400">{t('pages.bookDetail.noDigitalFileSystem')}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetail;
