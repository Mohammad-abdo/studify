import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, BookOpen, DollarSign } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader';
import { useLanguage } from '../context/LanguageContext';

const ACCESS_TYPES = ['READ', 'BUY', 'PRINT'];

const AddBookPricing = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const [loading, setLoading] = useState(false);
  const [books, setBooks] = useState([]);
  const [formData, setFormData] = useState({
    bookId: '',
    accessType: 'READ',
    price: '',
  });

  useEffect(() => {
    api.get('/books?limit=500').then(res => {
      setBooks(res.data.data?.data || res.data.data || res.data || []);
    }).catch(() => {});
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.bookId) {
      toast.error(isRTL ? 'يرجى اختيار كتاب' : 'Please select a book');
      return;
    }
    setLoading(true);
    try {
      await api.post('/book-pricing', {
        bookId: formData.bookId,
        accessType: formData.accessType,
        price: parseFloat(formData.price),
      });
      toast.success(isRTL ? 'تم إضافة تسعيرة الكتاب بنجاح' : 'Book pricing added successfully');
      navigate('/book-pricing');
    } catch (error) {
      toast.error(
        error.response?.data?.error?.message ||
        (isRTL ? 'فشل إضافة التسعيرة' : 'Failed to add pricing')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 page-transition pb-20">
      <PageHeader
        title={isRTL ? 'إضافة تسعيرة كتاب' : 'Add Book Pricing'}
        subtitle={isRTL ? 'تحديد سعر وصول للكتاب' : 'Set an access price tier for a book'}
        breadcrumbs={[{ label: isRTL ? 'تسعيرة الكتب' : 'Book Pricing', path: '/book-pricing' }, { label: isRTL ? 'إضافة' : 'Add' }]}
        backPath="/book-pricing"
      />

      <form onSubmit={handleSubmit} className="flex flex-col xl:flex-row gap-10 items-start">
        <div className="flex-1 w-full space-y-10">
          <div className="card-premium p-10 bg-white">
            <div className="flex items-center gap-4 mb-10 border-b border-slate-50 pb-6">
              <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl"><BookOpen size={24} /></div>
              <div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                  {isRTL ? 'بيانات التسعيرة' : 'Pricing Details'}
                </h3>
                <p className="text-sm font-medium text-slate-400">
                  {isRTL ? 'اختر الكتاب ونوع الوصول والسعر' : 'Select book, access type and price'}
                </p>
              </div>
            </div>
            <div className="space-y-8">
              <div className="space-y-2">
                <label className={`text-[10px] font-black uppercase tracking-widest text-slate-400 ${isRTL ? 'mr-1' : 'ml-1'}`}>
                  {isRTL ? 'الكتاب' : 'Book'} *
                </label>
                <select
                  name="bookId"
                  value={formData.bookId}
                  onChange={handleChange}
                  required
                  className="input-modern font-bold"
                >
                  <option value="">{isRTL ? '— اختر كتاباً —' : '— Select a book —'}</option>
                  {books.map(b => (
                    <option key={b.id} value={b.id}>{b.title}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className={`text-[10px] font-black uppercase tracking-widest text-slate-400 ${isRTL ? 'mr-1' : 'ml-1'}`}>
                  {isRTL ? 'نوع الوصول' : 'Access Type'} *
                </label>
                <div className="flex gap-3 flex-wrap">
                  {ACCESS_TYPES.map(type => (
                    <label key={type} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="accessType"
                        value={type}
                        checked={formData.accessType === type}
                        onChange={handleChange}
                        className="accent-blue-600"
                      />
                      <span className="text-sm font-bold text-slate-700 uppercase">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className={`text-[10px] font-black uppercase tracking-widest text-slate-400 ${isRTL ? 'mr-1' : 'ml-1'}`}>
                  {isRTL ? 'السعر' : 'Price'} *
                </label>
                <div className="relative">
                  <DollarSign size={18} className={`absolute top-1/2 -translate-y-1/2 text-slate-400 ${isRTL ? 'right-4' : 'left-4'}`} />
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className={`input-modern font-black text-lg ${isRTL ? 'pr-10' : 'pl-10'}`}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full xl:w-96 space-y-8 shrink-0 lg:sticky lg:top-28">
          <div className="flex flex-col gap-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-modern-primary py-5 rounded-2xl flex items-center justify-center gap-3 shadow-2xl"
            >
              {loading
                ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><Save size={20} /> {isRTL ? 'حفظ التسعيرة' : 'Save Pricing'}</>}
            </button>
            <button
              type="button"
              onClick={() => navigate('/book-pricing')}
              className="w-full py-4 bg-white text-slate-400 border border-slate-100 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all"
            >
              {isRTL ? 'إلغاء' : 'Cancel'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddBookPricing;
