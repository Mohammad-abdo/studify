import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
      width: '100px',
      align: 'center',
      render: (book) => {
        const images = book.imageUrls || [];
        const firstImage = images[0];
        return (
          <div className="flex justify-center">
            {firstImage ? (
              <img
                src={firstImage.startsWith('http') ? firstImage : `${api.defaults.baseURL.replace('/api', '')}${firstImage}`}
                alt={book.title}
                className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(book.title)}&background=4f46e5&color=fff&size=64`;
                }}
              />
            ) : (
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                <BookOpen className="text-gray-400" size={24} />
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
        <div>
          <div className="font-medium text-gray-900">{book.title}</div>
          <div className="text-sm text-gray-500">{book.category?.name}</div>
        </div>
      ),
    },
    {
      header: 'Description',
      accessor: 'description',
      render: (book) => (
        <div className="max-w-md">
          <p className="text-sm text-gray-600 line-clamp-2">{book.description}</p>
        </div>
      ),
    },
    {
      header: 'Doctor',
      accessor: 'doctor.user.phone',
      render: (book) => (
        <div className="text-sm text-gray-600">{book.doctor?.user?.phone || 'N/A'}</div>
      ),
    },
    {
      header: 'College/Dept',
      accessor: 'college',
      render: (book) => (
        <div className="text-sm">
          <div className="text-gray-900">{book.college?.name || '—'}</div>
          <div className="text-gray-500">{book.department?.name || ''}</div>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: 'approvalStatus',
      align: 'center',
      render: (book) => (
        <span
          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            book.approvalStatus === 'APPROVED'
              ? 'bg-green-100 text-green-800'
              : book.approvalStatus === 'PENDING'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {book.approvalStatus}
        </span>
      ),
    },
    {
      header: 'Created',
      accessor: 'createdAt',
      render: (book) => (
        <div className="text-sm text-gray-600">
          {new Date(book.createdAt).toLocaleDateString()}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Books</h1>
          <p className="text-gray-600 mt-1">Manage all books in the system</p>
        </div>
        <button 
          onClick={() => navigate('/books/add')}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Add Book
        </button>
      </motion.div>

      <DataTable
        data={filteredBooks}
        columns={columns}
        loading={loading}
        searchable
        searchPlaceholder="Search books by title, category, or description..."
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
