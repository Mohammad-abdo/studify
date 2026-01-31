import { useState, useEffect } from 'react';
import { Star, X, Search, Filter, MessageSquare, Calendar } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';
import DataTable from '../components/DataTable';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import { useLanguage } from '../context/LanguageContext';

const Reviews = () => {
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL'); // 'ALL', 'BOOK', 'PRODUCT'

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/reviews');
      setReviews(response.data.data || response.data || []);
    } catch (error) {
      toast.error(isRTL ? 'تغذية راجعة: فشل مزامنة المراجعات' : 'Feedback: Review synchronization failed');
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredReviews = reviews.filter((review) => {
    const matchesSearch =
      review.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.user?.phone?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'ALL' || review.targetType === filterType;
    return matchesSearch && matchesType;
  });

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={12}
            className={i < rating ? 'text-amber-400 fill-current' : 'text-slate-200'}
          />
        ))}
      </div>
    );
  };

  const columns = [
    {
      header: t('pages.reviews.authorNode'),
      accessor: 'user.phone',
      render: (review) => (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
            <MessageSquare size={18} />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-slate-900 tracking-tight font-mono text-xs">{review.user?.phone || t('pages.reviews.anonymous')}</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('pages.reviews.feedbackNode')}</span>
          </div>
        </div>
      ),
    },
    {
      header: t('pages.reviews.classification'),
      accessor: 'targetType',
      render: (review) => (
        <span className={`badge-modern ${review.targetType === 'BOOK' ? 'badge-modern-info' : 'badge-modern-warning'}`}>
          {review.targetType}
        </span>
      )
    },
    {
      header: t('pages.reviews.satisfactionIndex'),
      accessor: 'rating',
      align: 'center',
      render: (review) => (
        <div className="flex flex-col items-center gap-1">
          {renderStars(review.rating)}
          <span className="text-[10px] font-black text-slate-400">{review.rating} / 5.0</span>
        </div>
      ),
    },
    {
      header: t('pages.reviews.feedbackContent'),
      accessor: 'comment',
      hideOnMobile: true,
      render: (review) => (
        <p className="text-xs font-medium text-slate-500 max-w-md truncate italic">
          "{review.comment || t('pages.reviews.noFeedback')}"
        </p>
      ),
    },
    {
      header: t('pages.reviews.loggedAt'),
      accessor: 'createdAt',
      hideOnMobile: true,
      render: (review) => (
        <div className="flex items-center gap-2 text-slate-400 font-bold">
          <Calendar size={12} />
          <span className="text-xs">{new Date(review.createdAt).toLocaleDateString(isRTL ? 'ar-EG' : undefined)}</span>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-10 page-transition pb-20">
      <PageHeader
        title={t('pages.reviews.title')}
        subtitle={t('pages.reviews.subtitle')}
        breadcrumbs={[{ label: t('menu.sections.system') }, { label: t('menu.reviews') }]}
      />

      <div className="card-premium p-6 bg-white border-none shadow-xl shadow-slate-200/50">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 relative">
            <Search size={20} className={`absolute top-1/2 -translate-y-1/2 text-slate-400 ${isRTL ? 'right-4' : 'left-4'}`} />
            <input
              type="text"
              placeholder={t('pages.reviews.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full bg-slate-50 border-none rounded-2xl py-4 font-bold text-sm focus:ring-4 focus:ring-blue-500/10 transition-all ${isRTL ? 'pr-12' : 'pl-12'}`}
            />
          </div>
          
          <div className="flex gap-2 bg-slate-50 p-1.5 rounded-2xl">
            {['ALL', 'BOOK', 'PRODUCT'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  filterType === type
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {type === 'ALL' ? (isRTL ? 'الكل' : 'ALL') : type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-slate-100 border-t-amber-400 rounded-full animate-spin"></div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('pages.reviews.syncingSatisfaction')}</span>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="fade-in">
          <EmptyState
            icon={Star}
            title={t('pages.reviews.noFeedbackLogged')}
            description={t('pages.reviews.noFeedbackLoggedDesc')}
          />
        </div>
      ) : (
        <div className="fade-in">
          <DataTable
            data={filteredReviews}
            columns={columns}
            loading={false}
            searchable={false}
          />
        </div>
      )}
    </div>
  );
};

export default Reviews;
