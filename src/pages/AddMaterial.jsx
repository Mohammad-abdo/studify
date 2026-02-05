import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Printer, Plus, Trash2, FileText, Image as ImageIcon } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader';
import ImageUpload from '../components/ImageUpload';
import LoadingState from '../components/LoadingState';
import { useLanguage } from '../context/LanguageContext';

const AddMaterial = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';
  const [loading, setLoading] = useState(false);
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
  const [printOptions, setPrintOptions] = useState([
    { colorType: 'COLOR', paperType: 'A4', copies: 1, doubleSide: false, enabled: true },
  ]);

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
        ...(formData.totalPages && { totalPages: parseInt(formData.totalPages) }),
        categoryId: formData.categoryId,
        ...(formData.collegeId && { collegeId: formData.collegeId }),
        ...(formData.departmentId && { departmentId: formData.departmentId }),
        ...(formData.materialType && { materialType: formData.materialType }),
      };

      const materialRes = await api.post('/materials', payload);
      const material = materialRes.data?.data || materialRes.data;
      const materialId = material?.id;

      if (materialId && printOptions.length > 0) {
        for (const opt of printOptions) {
          await api.post('/print-options', {
            bookId: null,
            materialId,
            colorType: opt.colorType,
            copies: Number(opt.copies) || 1,
            paperType: opt.paperType,
            doubleSide: Boolean(opt.doubleSide),
            enabled: opt.enabled !== false,
          });
        }
      }

      toast.success(t('pages.addMaterial.success'));
      navigate('/materials');
    } catch (error) {
      toast.error(isRTL ? 'فشل تسجيل المورد' : 'Registration failed: Manifest error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 page-transition pb-20">
      <PageHeader
        title={t('pages.addMaterial.title')}
        subtitle={t('pages.addMaterial.subtitle')}
        breadcrumbs={[{ label: t('menu.materials'), path: '/materials' }, { label: t('pages.addMaterial.addMaterial') }]}
        backPath="/materials"
      />

      <form onSubmit={handleSubmit} className="flex flex-col xl:flex-row gap-10 items-start">
        {/* Main Entry Form */}
        <div className="flex-1 w-full space-y-10">
          <div className="card-premium p-10 bg-white">
            <div className="flex items-center gap-4 mb-10 border-b border-slate-50 pb-6">
              <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl"><FileText size={24} /></div>
              <div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{t('pages.addMaterial.technicalManifest')}</h3>
                <p className="text-sm font-medium text-slate-400">{t('pages.addMaterial.primaryIdentification')}</p>
              </div>
            </div>

            <div className="space-y-8">
              <div className="space-y-2">
                <label className={`text-[10px] font-black uppercase tracking-widest text-slate-400 ${isRTL ? 'mr-1' : 'ml-1'}`}>{t('pages.addMaterial.materialTitle')}</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder={t('pages.addMaterial.enterMaterialTitle')}
                  className="input-modern font-bold text-lg"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className={`text-[10px] font-black uppercase tracking-widest text-slate-400 ${isRTL ? 'mr-1' : 'ml-1'}`}>{t('pages.addMaterial.classification')}</label>
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleChange}
                    required
                    className="input-modern font-bold"
                  >
                    <option value="">{t('pages.addMaterial.selectCategory')}</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className={`text-[10px] font-black uppercase tracking-widest text-slate-400 ${isRTL ? 'mr-1' : 'ml-1'}`}>{t('pages.addMaterial.materialType')}</label>
                  <input
                    type="text"
                    name="materialType"
                    value={formData.materialType}
                    onChange={handleChange}
                    placeholder={t('pages.addMaterial.enterMaterialType')}
                    className="input-modern font-bold"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className={`text-[10px] font-black uppercase tracking-widest text-slate-400 ${isRTL ? 'mr-1' : 'ml-1'}`}>{t('pages.addMaterial.logicalContent')}</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows="5"
                  placeholder={t('pages.addMaterial.enterDescription')}
                  className="input-modern font-medium resize-none leading-relaxed"
                />
              </div>
            </div>
          </div>

          <div className="card-premium p-10 bg-white">
            <div className="flex items-center gap-4 mb-10 border-b border-slate-50 pb-6">
              <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl"><ImageIcon size={24} /></div>
              <div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{t('pages.addMaterial.visualEvidence')}</h3>
                <p className="text-sm font-medium text-slate-400">{t('pages.addMaterial.primaryIdentification')}</p>
              </div>
            </div>
            <ImageUpload
              images={formData.imageUrls}
              onChange={(urls) => setFormData(prev => ({ ...prev, imageUrls: Array.isArray(urls) ? urls : [urls] }))}
              label={t('pages.addMaterial.assetVisualMatrix')}
              multiple={true}
            />
          </div>

          <div className="card-premium p-10 bg-white">
            <div className="flex items-center justify-between mb-6 border-b border-slate-50 pb-6">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl"><Printer size={24} /></div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{t('menu.printOptions')}</h3>
                  <p className="text-sm font-medium text-slate-400">{isRTL ? 'خيارات الطباعة للمادة (لون، ورق، نسخ، مفعّل)' : 'Print options for this material (color, paper, copies, enabled)'}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPrintOptions(prev => [...prev, { colorType: 'COLOR', paperType: 'A4', copies: 1, doubleSide: false, enabled: true }])}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-200"
              >
                <Plus size={18} /> {isRTL ? 'إضافة خيار' : 'Add option'}
              </button>
            </div>
            <div className="space-y-4">
              {printOptions.map((opt, idx) => (
                <div key={idx} className="flex flex-wrap items-end gap-4 p-4 bg-slate-50 rounded-xl">
                  <div className="flex-1 min-w-[120px]">
                    <label className="text-[10px] font-black uppercase text-slate-500">{isRTL ? 'اللون' : 'Color'}</label>
                    <select
                      value={opt.colorType}
                      onChange={(e) => setPrintOptions(prev => prev.map((o, i) => i === idx ? { ...o, colorType: e.target.value } : o))}
                      className="input-modern text-sm w-full"
                    >
                      <option value="COLOR">{isRTL ? 'ملون' : 'Color'}</option>
                      <option value="BLACK_WHITE">{isRTL ? 'أبيض وأسود' : 'Black & White'}</option>
                    </select>
                  </div>
                  <div className="flex-1 min-w-[100px]">
                    <label className="text-[10px] font-black uppercase text-slate-500">{isRTL ? 'الورق' : 'Paper'}</label>
                    <select
                      value={opt.paperType}
                      onChange={(e) => setPrintOptions(prev => prev.map((o, i) => i === idx ? { ...o, paperType: e.target.value } : o))}
                      className="input-modern text-sm w-full"
                    >
                      <option value="A4">A4</option>
                      <option value="A3">A3</option>
                      <option value="LETTER">LETTER</option>
                    </select>
                  </div>
                  <div className="w-20">
                    <label className="text-[10px] font-black uppercase text-slate-500">{isRTL ? 'نسخ' : 'Copies'}</label>
                    <input
                      type="number"
                      min={1}
                      value={opt.copies}
                      onChange={(e) => setPrintOptions(prev => prev.map((o, i) => i === idx ? { ...o, copies: parseInt(e.target.value, 10) || 1 } : o))}
                      className="input-modern text-sm w-full"
                    />
                  </div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={opt.doubleSide}
                      onChange={(e) => setPrintOptions(prev => prev.map((o, i) => i === idx ? { ...o, doubleSide: e.target.checked } : o))}
                      className="rounded"
                    />
                    <span className="text-xs font-bold text-slate-600">{isRTL ? 'وجهين' : 'Double side'}</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={opt.enabled !== false}
                      onChange={(e) => setPrintOptions(prev => prev.map((o, i) => i === idx ? { ...o, enabled: e.target.checked } : o))}
                      className="rounded"
                    />
                    <span className="text-xs font-bold text-slate-600">{isRTL ? 'مفعّل' : 'Enabled'}</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setPrintOptions(prev => prev.filter((_, i) => i !== idx))}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    title={isRTL ? 'حذف' : 'Remove'}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Configuration Sidebar */}
        <div className="w-full xl:w-96 space-y-8 shrink-0 lg:sticky lg:top-28">
          <div className="card-premium p-10 bg-slate-900 text-white border-none shadow-2xl shadow-slate-300">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-10">{t('pages.addMaterial.institutionalMapping')}</h3>
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

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">{t('pages.addMaterial.digitalSource')}</label>
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

                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">{t('pages.addMaterial.nodeVolume')}</label>
                  <input
                    type="number"
                    name="totalPages"
                    value={formData.totalPages}
                    onChange={handleChange}
                    min="1"
                    placeholder={t('pages.addMaterial.enterTotalPages')}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white focus:ring-2 focus:ring-blue-500 transition-all outline-none"
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
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <><Save size={20} /> {t('pages.addMaterial.initializeRegistry')}</>}
            </button>
            <button
              type="button"
              onClick={() => navigate('/materials')}
              className="w-full py-4 bg-white text-slate-400 border border-slate-100 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all"
            >
              {t('pages.addMaterial.abortMission')}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddMaterial;

