import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';
import ImageUpload from '../components/ImageUpload';

const AddBook = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    fileUrl: '',
    imageUrls: [], // For book images (multiple)
    totalPages: '',
    categoryId: '',
    collegeId: '',
    departmentId: '',
  });

  useEffect(() => {
    fetchCategories();
    fetchColleges();
  }, []);

  useEffect(() => {
    if (formData.collegeId) {
      fetchDepartments(formData.collegeId);
    } else {
      setDepartments([]);
    }
  }, [formData.collegeId]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories/books');
      setCategories(response.data.data || response.data || []);
    } catch (error) {
      toast.error('Failed to load categories');
    }
  };

  const fetchColleges = async () => {
    try {
      const response = await api.get('/colleges');
      setColleges(response.data.data || response.data || []);
    } catch (error) {
      toast.error('Failed to load colleges');
    }
  };

  const fetchDepartments = async (collegeId) => {
    try {
      const response = await api.get(`/departments?collegeId=${collegeId}`);
      setDepartments(response.data.data || response.data || []);
    } catch (error) {
      toast.error('Failed to load departments');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        fileUrl: formData.fileUrl,
        ...(formData.imageUrls.length > 0 && { imageUrls: formData.imageUrls }),
        totalPages: parseInt(formData.totalPages),
        categoryId: formData.categoryId,
        ...(formData.collegeId && { collegeId: formData.collegeId }),
        ...(formData.departmentId && { departmentId: formData.departmentId }),
      };

      await api.post('/books', payload);
      toast.success('Book created successfully');
      navigate('/books');
    } catch (error) {
      console.error('Error creating book:', error);
      toast.error(error.response?.data?.message || 'Failed to create book');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <button
          onClick={() => navigate('/books')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add New Book</h1>
          <p className="text-gray-600 mt-1">Create a new book entry</p>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit} className="card space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Title */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="input-field"
              placeholder="Enter book title"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              required
              className="input-field"
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Total Pages */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Total Pages <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="totalPages"
              value={formData.totalPages}
              onChange={handleChange}
              required
              min="1"
              className="input-field"
              placeholder="Enter total pages"
            />
          </div>

          {/* College */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              College
            </label>
            <select
              name="collegeId"
              value={formData.collegeId}
              onChange={handleChange}
              className="input-field"
            >
              <option value="">Select college (optional)</option>
              {colleges.map((college) => (
                <option key={college.id} value={college.id}>
                  {college.name}
                </option>
              ))}
            </select>
          </div>

          {/* Department */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Department
            </label>
            <select
              name="departmentId"
              value={formData.departmentId}
              onChange={handleChange}
              className="input-field"
              disabled={!formData.collegeId}
            >
              <option value="">Select department (optional)</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          {/* Book Images */}
          <div className="md:col-span-2">
            <ImageUpload
              value={formData.imageUrls}
              onChange={(urls) => setFormData(prev => ({ ...prev, imageUrls: Array.isArray(urls) ? urls : [urls] }))}
              label="Book Images"
              multiple={true}
              maxImages={10}
            />
          </div>

          {/* File URL */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Book File URL (PDF) <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              name="fileUrl"
              value={formData.fileUrl}
              onChange={handleChange}
              required
              className="input-field"
              placeholder="https://example.com/book.pdf"
            />
            <p className="text-sm text-gray-500 mt-1">
              Enter the URL where the book PDF file is hosted
            </p>
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="6"
              className="input-field resize-none"
              placeholder="Enter book description"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4 pt-4 border-t">
          <button
            type="button"
            onClick={() => navigate('/books')}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Creating...
              </>
            ) : (
              <>
                <Save size={18} />
                Create Book
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddBook;

