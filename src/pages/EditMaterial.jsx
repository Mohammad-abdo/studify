import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader';
import ImageUpload from '../components/ImageUpload';
import LoadingState from '../components/LoadingState';

const EditMaterial = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    fileUrl: '',
    imageUrls: [],
    totalPages: '',
    categoryId: '',
    collegeId: '',
    departmentId: '',
    materialType: '',
  });

  useEffect(() => {
    fetchMaterial();
    fetchCategories();
    fetchColleges();
  }, [id]);

  useEffect(() => {
    if (formData.collegeId) {
      fetchDepartments(formData.collegeId);
    } else {
      setDepartments([]);
    }
  }, [formData.collegeId]);

  const fetchMaterial = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/materials/${id}`);
      const material = response.data.data || response.data;
      
      // Parse imageUrls if it's a string
      let parsedImageUrls = [];
      if (material.imageUrls) {
        try {
          parsedImageUrls = typeof material.imageUrls === 'string' 
            ? JSON.parse(material.imageUrls) 
            : material.imageUrls;
          if (!Array.isArray(parsedImageUrls)) {
            parsedImageUrls = [];
          }
        } catch (error) {
          parsedImageUrls = [];
        }
      }

      setFormData({
        title: material.title || '',
        description: material.description || '',
        fileUrl: material.fileUrl || '',
        imageUrls: parsedImageUrls,
        totalPages: material.totalPages?.toString() || '',
        categoryId: material.categoryId || '',
        collegeId: material.collegeId || '',
        departmentId: material.departmentId || '',
        materialType: material.materialType || '',
      });
    } catch (error) {
      toast.error('Failed to load material');
      navigate('/materials');
    } finally {
      setLoading(false);
    }
  };

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
    setSaving(true);

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        fileUrl: formData.fileUrl,
        ...(formData.imageUrls.length > 0 && { imageUrls: formData.imageUrls }),
        ...(formData.totalPages && { totalPages: parseInt(formData.totalPages) }),
        categoryId: formData.categoryId,
        ...(formData.collegeId && { collegeId: formData.collegeId }),
        ...(formData.departmentId && { departmentId: formData.departmentId }),
        ...(formData.materialType && { materialType: formData.materialType }),
      };

      await api.put(`/materials/${id}`, payload);
      toast.success('Material updated successfully');
      navigate('/materials');
    } catch (error) {
      console.error('Error updating material:', error);
      toast.error(error.response?.data?.message || 'Failed to update material');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading material..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Material"
        subtitle="Update material information"
        breadcrumbs={[
          { label: 'Dashboard', path: '/' },
          { label: 'Materials', path: '/materials' },
          { label: 'Edit' },
        ]}
        backPath="/materials"
      />

      <form onSubmit={handleSubmit} className="card-elevated space-y-6">
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
              placeholder="Enter material title"
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

          {/* Material Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Material Type
            </label>
            <input
              type="text"
              name="materialType"
              value={formData.materialType}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g., Lecture Notes, Summary"
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
              <option value="">Select college</option>
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
              disabled={!formData.collegeId}
              className="input-field"
            >
              <option value="">Select department</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          {/* File URL */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              File URL <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              name="fileUrl"
              value={formData.fileUrl}
              onChange={handleChange}
              required
              className="input-field"
              placeholder="https://example.com/material.pdf"
            />
          </div>

          {/* Total Pages */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Total Pages
            </label>
            <input
              type="number"
              name="totalPages"
              value={formData.totalPages}
              onChange={handleChange}
              min="1"
              className="input-field"
              placeholder="Number of pages"
            />
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
              rows={4}
              className="input-field"
              placeholder="Enter material description"
            />
          </div>

          {/* Images */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Images
            </label>
            <ImageUpload
              images={formData.imageUrls}
              onChange={(urls) => setFormData(prev => ({ ...prev, imageUrls: urls }))}
              multiple
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={() => navigate('/materials')}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="btn-primary flex items-center gap-2"
          >
            <Save size={18} />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditMaterial;

