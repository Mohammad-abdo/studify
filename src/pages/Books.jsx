import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, CheckCircle, Clock, XCircle, X, Search, Filter } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import DataTable from '../components/DataTable';
import PageHeader from '../components/PageHeader';
import { EmptyStates } from '../components/EmptyState';
import LoadingState from '../components/LoadingState';
import { useLanguage } from '../context/LanguageContext';

const Books = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    fetchBooks();
  }, [page, searchTerm, filterStatus]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (searchTerm) params.append('search', searchTerm);
      if (filterStatus) params.append('approvalStatus', filterStatus);

      const response = await api.get(`/books?${params}`);
      const data = response.data.data || response.data;
      
      const booksWithParsedImages = Array.isArray(data) ? data.map(book => {
        if (book.imageUrls && typeof book.imageUrls === 'string') {
          try {
            book.imageUrls = JSON.parse(book.imageUrls);
          } catch (e) {
            book.imageUrls = [];
          }
        }
        return book;
      }) : [];
      
      setBooks(booksWithParsedImages);
      setTotal(response.data.pagination?.total || booksWithParsedImages.length || 0);
    } catch (error) {
      toast.error(isRTL ? 'فشل تحميل الكتب' : 'Failed to load books');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (book) => {
    const result = await Swal.fire({
      title: isRTL ? 'هل أنت متأكد؟' : 'Are you sure?',
      text: isRTL ? `أنت على وشك حذف "${book.title}". لا يمكن التراجع عن هذا الإجراء.` : `You are about to delete "${book.title}". This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f43f5e',
      cancelButtonColor: '#64748b',
      confirmButtonText: isRTL ? 'نعم، احذفه!' : 'Yes, delete it!',
      reverseButtons: isRTL
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/books/${book.id}`);
        toast.success(isRTL ? 'تم حذف الكتاب بنجاح' : 'Book deleted successfully');
        fetchBooks();
      } catch (error) {
        toast.error(isRTL ? 'فشل حذف الكتاب' : 'Failed to delete book');
      }
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      APPROVED: 'badge-modern-success',
      PENDING: 'badge-modern-warning',
      REJECTED: 'badge-modern-error',
    };
    return badges[status] || 'badge-modern-info';
  };

  const columns = [
    {
      header: t('pages.books.asset'),
      accessor: 'imageUrls',
      width: '100px',
      hideOnMobile: true,
      render: (book) => {
        const images = Array.isArray(book.imageUrls) ? book.imageUrls : [];
        const firstImage = images[0];
        return (
          <div className="flex items-center justify-center p-1 bg-slate-50 rounded-xl border border-slate-100">
            {firstImage ? (
              <img
                src={firstImage.startsWith('http') ? firstImage : `${api.defaults.baseURL.replace('/api', '')}${firstImage}`}
                alt={book.title}
                className="w-12 h-16 object-cover rounded-lg shadow-sm"
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(book.title)}&background=4f46e5&color=fff&size=64`;
                }}
              />
            ) : (
              <div className="w-12 h-16 bg-slate-100 rounded-lg flex items-center justify-center text-slate-300">
                <BookOpen size={20} />
              </div>
            )}
          </div>
        );
      },
    },
    {
      header: t('pages.books.bookIdentity'),
      accessor: 'title',
      render: (book) => (
        <div className="flex flex-col gap-1">
          <span className="font-black text-slate-900 tracking-tight">{book.title}</span>
          <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">{book.category?.name || t('pages.books.uncategorized')}</span>
        </div>
      ),
    },
    {
      header: t('pages.books.contributor'),
      accessor: 'doctor.user.phone',
      hideOnMobile: true,
      render: (book) => (
        <div className="flex flex-col">
          <span className="text-sm font-bold text-slate-700">{book.doctor?.name || t('pages.books.academicStaff')}</span>
          <span className="text-[10px] font-medium text-slate-400">{book.doctor?.user?.phone || t('pages.books.noPhone')}</span>
        </div>
      ),
    },
    {
      header: t('pages.books.academicUnit'),
      accessor: 'college',
      hideOnMobile: true,
      render: (book) => (
        <div className="flex flex-col">
          <span className="text-xs font-black text-slate-600 uppercase tracking-tight">{book.college?.name || t('pages.books.general')}</span>
          <span className="text-[10px] font-medium text-slate-400">{book.department?.name || t('pages.books.noDept')}</span>
        </div>
      ),
    },
    {
      header: t('pages.books.visibility'),
      accessor: 'approvalStatus',
      align: 'center',
      render: (book) => (
        <span className={`badge-modern ${getStatusBadge(book.approvalStatus)}`}>
          {book.approvalStatus}
        </span>
      ),
    },
    {
      header: t('pages.books.onboarded'),
      accessor: 'createdAt',
      hideOnMobile: true,
      render: (book) => (
        <span className="text-xs font-bold text-slate-500">
          {new Date(book.createdAt).toLocaleDateString(isRTL ? 'ar-EG' : undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 2xl:space-y-8 page-transition">
      <PageHeader
        title={t('pages.books.title')}
        subtitle={t('pages.books.subtitle')}
        breadcrumbs={[
          { label: t('menu.books') },
        ]}
        actionLabel={t('pages.books.addBook')}
        actionPath="/books/add"
      />

      {/* Modern Filter Strip */}
      <div className="card-premium p-4 2xl:p-6 bg-white border-none shadow-xl shadow-slate-200/50">
        <div className="flex flex-col lg:flex-row gap-4 2xl:gap-6">
          <div className="flex-1 relative">
            <Search size={20} className={`absolute top-1/2 -translate-y-1/2 text-slate-400 ${isRTL ? 'right-4' : 'left-4'}`} />
            <input
              type="text"
              placeholder={t('pages.books.search')}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className={`w-full bg-slate-50 border-none rounded-2xl py-3.5 2xl:py-4 font-bold text-sm 2xl:text-base focus:ring-4 focus:ring-blue-500/10 transition-all ${isRTL ? 'pr-12' : 'pl-12'}`}
            />
          </div>
          
          <div className="flex items-center gap-3 2xl:gap-4">
            <div className="relative min-w-[200px] 2xl:min-w-[240px]">
              <Filter size={18} className={`absolute top-1/2 -translate-y-1/2 text-slate-400 ${isRTL ? 'right-4' : 'left-4'}`} />
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setPage(1);
                }}
                className={`w-full bg-slate-50 border-none rounded-2xl py-3.5 2xl:py-4 font-bold text-sm 2xl:text-base focus:ring-4 focus:ring-blue-500/10 transition-all appearance-none ${isRTL ? 'pr-12 pl-10' : 'pl-12 pr-10'}`}
              >
                <option value="">{t('pages.books.allStatus')}</option>
                <option value="APPROVED">{t('pages.books.approved')}</option>
                <option value="PENDING">{t('pages.books.pending')}</option>
                <option value="REJECTED">{t('pages.books.rejected')}</option>
              </select>
              <div className={`absolute top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 ${isRTL ? 'left-4' : 'right-4'}`}>
                <X size={16} className={filterStatus ? 'cursor-pointer pointer-events-auto hover:text-rose-500' : 'hidden'} onClick={() => setFilterStatus('')} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <div className="w-12 h-12 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      ) : books.length === 0 ? (
        <div className="fade-in">
          {searchTerm || filterStatus ? (
            <EmptyStates.Search searchTerm={searchTerm} />
          ) : (
            <EmptyStates.Books />
          )}
        </div>
      ) : (
        <div className="fade-in">
          <DataTable
            data={books}
            columns={columns}
            loading={false}
            searchable={false}
            serverSide={true}
            total={total}
            page={page}
            limit={limit}
            onPageChange={setPage}
            onView={(book) => navigate(`/books/${book.id}`)}
            onEdit={(book) => navigate(`/books/edit/${book.id}`)}
            onDelete={handleDelete}
          />
        </div>
      )}
    </div>
  );
};

export default Books;
