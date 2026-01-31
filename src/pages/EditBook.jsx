import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';
import ImageUpload from '../components/ImageUpload';

const EditBook = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
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
    fetchBook();
  }, [id]);

  useEffect(() => {
    if (formData.collegeId) {
      fetchDepartments(formData.collegeId);
    } else {
      setDepartments([]);
    }
  }, [formData.collegeId]);

  const fetchBook = async () => {
    try {
      const response = await api.get(`/books/${id}`);
      const book = response.data.data || response.data;
      setFormData({
        title: book.title || '',
        description: book.description || '',
        fileUrl: book.fileUrl || '',
        imageUrls: Array.isArray(book.imageUrls) ? book.imageUrls : (book.imageUrls ? JSON.parse(book.imageUrls) : []),
        totalPages: book.totalPages?.toString() || '',
        categoryId: book.categoryId || '',
        collegeId: book.collegeId || '',
        departmentId: book.departmentId || '',
      });
    } catch (error) {
      toast.error(isRTL ? 'فشل تحميل الكتاب' : 'Failed to load book');
      navigate('/books');
    } finally {
      setFetching(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories/books');
      setCategories(response.data.data || response.data || []);
    } catch (error) {
      toast.error(isRTL ? 'فشل تحميل الفئات' : 'Failed to load categories');
    }
  };

  const fetchColleges = async () => {
    try {
      const response = await api.get('/colleges');
      setColleges(response.data.data || response.data || []);
    } catch (error) {
      toast.error(isRTL ? 'فشل تحميل الكليات' : 'Failed to load colleges');
    }
  };

  const fetchDepartments = async (collegeId) => {
    try {
      const response = await api.get(`/departments?collegeId=${collegeId}`);
      setDepartments(response.data.data || response.data || []);
    } catch (error) {
      toast.error(isRTL ? 'فشل تحميل الأقسام' : 'Failed to load departments');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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

      await api.put(`/books/${id}`, payload);
      toast.success(t('pages.editBook.success'));
      navigate('/books');
    } catch (error) {
      toast.error(isRTL ? 'فشل تحديث الكتاب' : 'Failed to update book');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="py-24 flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-slate-100 border-t-slate-900 rounded-full animate-spin"></div>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('pages.editBook.loading')}</span>
      </div>
    );
  }

  return (
    <div className="space-y-10 page-transition pb-20">
      <PageHeader
        title={t('pages.editBook.title')}
        subtitle={t('pages.editBook.subtitle')}
        breadcrumbs={[{ label: t('menu.books'), path: '/books' }, { label: t('pages.editBook.updateBook') }]}
        backPath="/books"
      />

      <form onSubmit={handleSubmit} className="flex flex-col xl:flex-row gap-10 items-start">
        {/* Main Entry Form */}
        <div className="flex-1 w-full space-y-10">
          <div className="card-premium p-10 bg-white">
            <div className="flex items-center gap-4 mb-10 border-b border-slate-50 pb-6">
              <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl"><BookOpen size={24} /></div>
              <div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{t('pages.editBook.technicalManifest')}</h3>
                <p className="text-sm font-medium text-slate-400">{t('pages.editBook.primaryIdentification')}</p>
              </div>
            </div>

            <div className="space-y-8">
              <div className="space-y-2">
                <label className={`text-[10px] font-black uppercase tracking-widest text-slate-400 ${isRTL ? 'mr-1' : 'ml-1'}`}>{t('pages.books.bookIdentity')}</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder={t('pages.books.search')}
                  className="input-modern font-bold text-lg"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className={`text-[10px] font-black uppercase tracking-widest text-slate-400 ${isRTL ? 'mr-1' : 'ml-1'}`}>{t('pages.books.category')}</label>
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleChange}
                    required
                    className="input-modern font-bold"
                  >
                    <option value="">{t('pages.addCategory.selectCategory')}</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className={`text-[10px] font-black uppercase tracking-widest text-slate-400 ${isRTL ? 'mr-1' : 'ml-1'}`}>{t('pages.bookDetail.dimension')}</label>
                  <input
                    type="number"
                    name="totalPages"
                    value={formData.totalPages}
                    onChange={handleChange}
                    required
                    min="1"
                    placeholder="Total units..."
                    className="input-modern font-bold"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className={`text-[10px] font-black uppercase tracking-widest text-slate-400 ${isRTL ? 'mr-1' : 'ml-1'}`}>{t('pages.addBook.logicalContent')}</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows="5"
                  placeholder={t('pages.addBook.enterDescription')}
                  className="input-modern font-medium resize-none leading-relaxed"
                />
              </div>
            </div>
          </div>

          <div className="card-premium p-10 bg-white">
            <div className="flex items-center gap-4 mb-10 border-b border-slate-50 pb-6">
              <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl"><ImageIcon size={24} /></div>
              <div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{t('pages.editBook.visualEvidence')}</h3>
                <p className="text-sm font-medium text-slate-400">{t('pages.editBook.primaryIdentification')}</p>
              </div>
            </div>
            <ImageUpload
              value={formData.imageUrls}
              onChange={(urls) => setFormData(prev => ({ ...prev, imageUrls: Array.isArray(urls) ? urls : [urls] }))}
              label={t('pages.editBook.assetVisualMatrix')}
              multiple={true}
              maxImages={10}
            />
          </div>
        </div>

        {/* Configuration Sidebar */}
        <div className="w-full xl:w-96 space-y-8 shrink-0 lg:sticky lg:top-28">
          <div className="card-premium p-10 bg-slate-900 text-white border-none shadow-2xl shadow-slate-300">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-10">{t('pages.editBook.institutionalMapping')}</h3>
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">{t('pages.addDepartment.parentUnit')}</label>
                  <select
                    name="collegeId"
                    value={formData.collegeId}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-black text-white focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                  >
                    <option value="" className="text-slate-900">{t('pages.addMaterial.selectCollege')}</option>
                    {colleges.map((college) => (
                      <option key={college.id} value={college.id} className="text-slate-900">{college.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">{t('pages.addDepartment.departmentName')}</label>
                  <select
                    name="departmentId"
                    value={formData.departmentId}
                    onChange={handleChange}
                    disabled={!formData.collegeId}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-black text-white focus:ring-2 focus:ring-blue-500 transition-all outline-none disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <option value="" className="text-slate-900">{t('pages.addMaterial.selectDepartment')}</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id} className="text-slate-900">{dept.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="h-px bg-white/10"></div>

              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">{t('pages.editBook.digitalSource')}</label>
                <div className="relative">
                  <FileText size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="url"
                    name="fileUrl"
                    value={formData.fileUrl}
                    onChange={handleChange}
                    required
                    placeholder="https://cloud.manifest/..."
                    className={`w-full bg-white/5 border border-white/10 rounded-xl pr-4 py-3 text-xs font-bold text-white focus:ring-2 focus:ring-blue-500 transition-all outline-none ${isRTL ? 'pl-4 pr-10' : 'pl-10 pr-4'}`}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-modern-primary py-5 rounded-2xl flex items-center justify-center gap-3 shadow-2xl"
            >
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <><Save size={20} /> {t('pages.editBook.deployUpdates')}</>}
            </button>
            <button
              type="button"
              onClick={() => navigate('/books')}
              className="w-full py-4 bg-white text-slate-400 border border-slate-100 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all"
            >
              {t('pages.editBook.abortMission')}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditBook;

