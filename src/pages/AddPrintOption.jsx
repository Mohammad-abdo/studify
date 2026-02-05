import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Printer, BookOpen, FileText } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader';
import { useLanguage } from '../context/LanguageContext';

const AddPrintOption = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';
  const [loading, setLoading] = useState(false);
  const [books, setBooks] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [formData, setFormData] = useState({
    sourceType: 'book',
    bookId: '',
    materialId: '',
    colorType: 'BLACK_WHITE',
    copies: 1,
    paperType: 'A4',
    doubleSide: false,
    enabled: true,
  });

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoadingOptions(true);
        const [booksRes, materialsRes] = await Promise.all([
          api.get('/books?limit=500'),
          api.get('/materials?limit=500'),
        ]);
        setBooks(booksRes.data.data || booksRes.data || []);
        setMaterials(materialsRes.data.data || materialsRes.data || []);
      } catch (error) {
        toast.error(t('pages.addPrintOption.error'));
      } finally {
        setLoadingOptions(false);
      }
    };
    fetch();
  }, [t]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? (parseInt(value, 10) || 0) : value,
    }));
    if (name === 'sourceType') {
      setFormData(prev => ({ ...prev, bookId: '', materialId: '', [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const bookId = formData.sourceType === 'book' && formData.bookId ? formData.bookId : null;
    const materialId = formData.sourceType === 'material' && formData.materialId ? formData.materialId : null;
    if (!bookId && !materialId) {
      toast.error(t('pages.addPrintOption.sourceRequired'));
      return;
    }
    if (formData.copies < 1) {
      toast.error(isRTL ? 'عدد النسخ يجب أن يكون 1 على الأقل' : 'Copies must be at least 1');
      return;
    }
    setLoading(true);
    try {
      await api.post('/print-options', {
        bookId: bookId || undefined,
        materialId: materialId || undefined,
        colorType: formData.colorType,
        copies: formData.copies,
        paperType: formData.paperType,
        doubleSide: formData.doubleSide,
        enabled: formData.enabled !== false,
      });
      toast.success(t('pages.addPrintOption.success'));
      navigate('/print-options');
    } catch (error) {
      const msg = error.response?.data?.message || t('pages.addPrintOption.error');
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 page-transition pb-20">
      <PageHeader
        title={t('pages.addPrintOption.title')}
        subtitle={t('pages.addPrintOption.subtitle')}
        breadcrumbs={[
          { label: t('menu.printOptions'), path: '/print-options' },
          { label: t('pages.addPrintOption.title') },
        ]}
        backPath="/print-options"
      />

      <div className="card-premium p-6 2xl:p-8 bg-white">
        {loadingOptions ? (
          <div className="py-16 flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-slate-100 border-t-violet-600 rounded-full animate-spin" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('common.loading')}</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="flex items-center gap-4 mb-8 border-b border-slate-50 pb-6">
              <div className="p-3 bg-violet-50 text-violet-600 rounded-2xl"><Printer size={22} /></div>
              <div>
                <h3 className="text-lg font-black text-slate-900">{t('pages.addPrintOption.source')}</h3>
                <p className="text-xs font-medium text-slate-400">{t('pages.addPrintOption.sourceHint')}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className={`text-[10px] font-black uppercase tracking-widest text-slate-400 ${isRTL ? 'mr-1' : 'ml-1'}`}>{t('pages.addPrintOption.source')}</label>
                <select
                  name="sourceType"
                  value={formData.sourceType}
                  onChange={handleChange}
                  className="input-modern font-bold"
                >
                  <option value="book">{t('pages.addPrintOption.book')}</option>
                  <option value="material">{t('pages.addPrintOption.material')}</option>
                </select>
              </div>

              {formData.sourceType === 'book' ? (
                <div className="space-y-2">
                  <label className={`text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <BookOpen size={14} /> {t('pages.addPrintOption.book')}
                  </label>
                  <select
                    name="bookId"
                    value={formData.bookId}
                    onChange={handleChange}
                    className="input-modern font-bold"
                    required
                  >
                    <option value="">{t('pages.addPrintOption.selectBook')}</option>
                    {books.map((b) => (
                      <option key={b.id} value={b.id}>{b.title}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className={`text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <FileText size={14} /> {t('pages.addPrintOption.material')}
                  </label>
                  <select
                    name="materialId"
                    value={formData.materialId}
                    onChange={handleChange}
                    className="input-modern font-bold"
                    required
                  >
                    <option value="">{t('pages.addPrintOption.selectMaterial')}</option>
                    {materials.map((m) => (
                      <option key={m.id} value={m.id}>{m.title}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-2">
                <label className={`text-[10px] font-black uppercase tracking-widest text-slate-400 ${isRTL ? 'mr-1' : 'ml-1'}`}>{t('pages.addPrintOption.colorType')}</label>
                <select
                  name="colorType"
                  value={formData.colorType}
                  onChange={handleChange}
                  className="input-modern font-bold"
                >
                  <option value="COLOR">{t('pages.addPrintOption.colorColor')}</option>
                  <option value="BLACK_WHITE">{t('pages.addPrintOption.colorBlackWhite')}</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className={`text-[10px] font-black uppercase tracking-widest text-slate-400 ${isRTL ? 'mr-1' : 'ml-1'}`}>{t('pages.addPrintOption.copies')}</label>
                <input
                  type="number"
                  name="copies"
                  min={1}
                  value={formData.copies}
                  onChange={handleChange}
                  className="input-modern font-bold"
                />
              </div>

              <div className="space-y-2">
                <label className={`text-[10px] font-black uppercase tracking-widest text-slate-400 ${isRTL ? 'mr-1' : 'ml-1'}`}>{t('pages.addPrintOption.paperType')}</label>
                <select
                  name="paperType"
                  value={formData.paperType}
                  onChange={handleChange}
                  className="input-modern font-bold"
                >
                  <option value="A4">{t('pages.addPrintOption.paperA4')}</option>
                  <option value="A3">{t('pages.addPrintOption.paperA3')}</option>
                  <option value="LETTER">{t('pages.addPrintOption.paperLetter')}</option>
                </select>
              </div>

              <div className="space-y-2 flex items-center gap-4 pt-6">
                <input
                  type="checkbox"
                  id="doubleSide"
                  name="doubleSide"
                  checked={formData.doubleSide}
                  onChange={handleChange}
                  className="w-5 h-5 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                />
                <label htmlFor="doubleSide" className={`text-sm font-bold text-slate-700 cursor-pointer ${isRTL ? 'mr-1' : 'ml-1'}`}>
                  {t('pages.addPrintOption.doubleSide')}
                </label>
              </div>
              <div className="space-y-2 flex items-center gap-4 pt-2">
                <input
                  type="checkbox"
                  id="enabled"
                  name="enabled"
                  checked={formData.enabled !== false}
                  onChange={handleChange}
                  className="w-5 h-5 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                />
                <label htmlFor="enabled" className={`text-sm font-bold text-slate-700 cursor-pointer ${isRTL ? 'mr-1' : 'ml-1'}`}>
                  {isRTL ? 'مفعّل' : 'Enabled'}
                </label>
              </div>
            </div>

            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                disabled={loading}
                className="btn-modern-primary py-4 px-8 rounded-2xl"
              >
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save size={18} /> {t('pages.addPrintOption.save')}</>}
              </button>
              <button
                type="button"
                onClick={() => navigate('/print-options')}
                className="btn-modern-secondary py-4 px-8 rounded-2xl"
              >
                {t('common.cancel')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AddPrintOption;
