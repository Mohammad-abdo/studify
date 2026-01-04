import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Plus } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';
import DataTable from '../components/DataTable';

const Books = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchBooks();
  }, [page]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/books?page=${page}&limit=100`);
      setBooks(response.data.data || []);
      setTotal(response.data.pagination?.total || 0);
    } catch (error) {
      toast.error('Failed to load books');
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

  const filteredBooks = books.filter((book) =>
    book.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.category?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      header: 'Image',
      accessor: 'imageUrls',
      width: '80px',
      align: 'center',
      hideOnMobile: true,
      render: (book) => {
        const images = book.imageUrls || [];
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
        <span
          className={`badge ${
            book.approvalStatus === 'APPROVED'
              ? 'badge-success'
              : book.approvalStatus === 'PENDING'
              ? 'badge-warning'
              : 'badge-danger'
          }`}
        >
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
    <div className="space-y-4 sm:space-y-5 lg:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-900 mb-0.5 sm:mb-1">Books</h1>
          <p className="text-xs sm:text-sm text-gray-600">Manage all books in the system</p>
        </div>
        <button 
          onClick={() => navigate('/books/add')}
          className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto"
        >
          <Plus size={16} className="sm:w-5 sm:h-5" />
          <span>Add Book</span>
        </button>
      </div>

      {/* Data Table */}
      <DataTable
        data={filteredBooks}
        columns={columns}
        loading={loading}
        searchable
        searchPlaceholder="Search books..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        onView={(book) => navigate(`/books/${book.id}`)}
        onEdit={(book) => navigate(`/books/edit/${book.id}`)}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default Books;
