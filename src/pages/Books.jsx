import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, CheckCircle, Clock, XCircle, X, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';
import DataTable from '../components/DataTable';
import PageHeader from '../components/PageHeader';
import EmptyState, { EmptyStates } from '../components/EmptyState';
import LoadingState from '../components/LoadingState';
import { useLanguage } from '../context/LanguageContext';

const Books = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
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
      
      // Parse imageUrls if it's a string
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
      toast.error('Failed to load books');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (book) => {
    if (!window.confirm(`Are you sure you want to delete "${book.title}"?`)) {
      return;
    }

    try {
      await api.delete(`/books/${book.id}`);
      toast.success('Book deleted successfully');
      fetchBooks();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete book');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      APPROVED: 'badge-success',
      PENDING: 'badge-warning',
      REJECTED: 'badge-danger',
    };
    return badges[status] || 'badge-neutral';
  };

  const columns = [
    {
      header: 'Image',
      accessor: 'imageUrls',
      width: '80px',
      align: 'center',
      hideOnMobile: true,
      render: (book) => {
        const images = Array.isArray(book.imageUrls) ? book.imageUrls : [];
        const firstImage = images[0];
        return (
          <div className="flex justify-center">
            {firstImage ? (
              <img
                src={firstImage.startsWith('http') ? firstImage : `${api.defaults.baseURL.replace('/api', '')}${firstImage}`}
                alt={book.title}
                className="w-12 h-12 sm:w-14 sm:h-14 object-cover rounded-md border border-gray-200"
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(book.title)}&background=4f46e5&color=fff&size=64`;
                }}
              />
            ) : (
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-100 rounded-md flex items-center justify-center">
                <BookOpen className="text-gray-400" size={18} />
              </div>
            )}
          </div>
        );
      },
    },
    {
      header: 'Title',
      accessor: 'title',
      render: (book) => (
        <div className="min-w-0">
          <div className="font-medium text-sm sm:text-base text-gray-900 truncate">{book.title}</div>
          <div className="text-xs sm:text-sm text-gray-500 truncate">{book.category?.name}</div>
        </div>
      ),
    },
    {
      header: 'Description',
      accessor: 'description',
      hideOnMobile: true,
      render: (book) => (
        <div className="max-w-xs">
          <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">{book.description}</p>
        </div>
      ),
    },
    {
      header: 'Doctor',
      accessor: 'doctor.user.phone',
      hideOnMobile: true,
      render: (book) => (
        <div className="text-xs sm:text-sm text-gray-600 truncate">{book.doctor?.user?.phone || 'N/A'}</div>
      ),
    },
    {
      header: 'College/Dept',
      accessor: 'college',
      hideOnMobile: true,
      render: (book) => (
        <div className="text-xs sm:text-sm min-w-0">
          <div className="text-gray-900 truncate">{book.college?.name || '—'}</div>
          <div className="text-gray-500 truncate">{book.department?.name || ''}</div>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: 'approvalStatus',
      align: 'center',
      render: (book) => (
        <span className={`badge ${getStatusBadge(book.approvalStatus)}`}>
          {book.approvalStatus}
        </span>
      ),
    },
    {
      header: 'Created',
      accessor: 'createdAt',
      hideOnMobile: true,
      render: (book) => (
        <div className="text-xs sm:text-sm text-gray-600">
          {new Date(book.createdAt).toLocaleDateString()}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('pages.books.title')}
        subtitle={t('pages.books.subtitle')}
        breadcrumbs={[
          { label: t('menu.dashboard'), path: '/' },
          { label: t('menu.books') },
        ]}
        actionLabel={t('pages.books.addBook')}
        actionPath="/books/add"
      />

      {/* Filters */}
      <div className="card-elevated">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder={t('pages.books.search')}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="input-field w-full"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setPage(1);
            }}
            className="input-field"
          >
            <option value="">{t('pages.books.allStatus')}</option>
            <option value="APPROVED">{t('pages.books.approved')}</option>
            <option value="PENDING">{t('pages.books.pending')}</option>
            <option value="REJECTED">{t('pages.books.rejected')}</option>
          </select>
        </div>

        {/* Active Filters */}
        {(searchTerm || filterStatus) && (
          <div className="mt-4 flex flex-wrap gap-2">
            {searchTerm && (
              <span className="badge badge-info flex items-center gap-1">
                {t('common.search')}: {searchTerm}
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setPage(1);
                  }}
                  className="ml-1 hover:text-blue-800"
                >
                  <X size={12} />
                </button>
              </span>
            )}
            {filterStatus && (
              <span className="badge badge-info flex items-center gap-1">
                {t('common.status')}: {t(`status.${filterStatus.toLowerCase()}`)}
                <button
                  onClick={() => {
                    setFilterStatus('');
                    setPage(1);
                  }}
                  className="ml-1 hover:text-blue-800"
                >
                  <X size={12} />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Data Table */}
      {loading ? (
        <LoadingState message={t('common.loading')} />
      ) : books.length === 0 ? (
        searchTerm || filterStatus ? (
          <EmptyStates.Search searchTerm={searchTerm} />
        ) : (
          <EmptyStates.Books />
        )
      ) : (
        <>
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
        </>
      )}
    </div>
  );
};

export default Books;
