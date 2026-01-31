import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';

const EditDepartment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [colleges, setColleges] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    collegeId: '',
  });

  useEffect(() => {
    fetchColleges();
    fetchDepartment();
  }, [id]);

  const fetchColleges = async () => {
    try {
      const response = await api.get('/colleges');
      setColleges(response.data.data || response.data || []);
    } catch (error) {
      toast.error('Failed to load colleges');
    }
  };

  const fetchDepartment = async () => {
    try {
      const response = await api.get(`/departments/${id}`);
      const dept = response.data.data || response.data;
      setFormData({
        name: dept.name || '',
        collegeId: dept.collegeId || '',
      });
    } catch (error) {
      toast.error(isRTL ? 'فشل تحميل القسم' : 'Failed to load department');
      navigate('/departments');
    } finally {
      setFetching(false);
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
      await api.put(`/departments/${id}`, formData);
      toast.success(t('pages.editDepartment.success'));
      navigate('/departments');
    } catch (error) {
      toast.error(isRTL ? 'فشل تحديث القسم' : 'Failed to update department');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="py-24 flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-slate-100 border-t-slate-900 rounded-full animate-spin"></div>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('pages.editDepartment.loading')}</span>
      </div>
    );
  }

  return (
    <div className="space-y-10 page-transition pb-20">
      <PageHeader
        title={t('pages.editDepartment.title')}
        subtitle={t('pages.editDepartment.subtitle')}
        breadcrumbs={[{ label: t('menu.departments'), path: '/departments' }, { label: t('pages.editDepartment.updateDepartment') }]}
        backPath="/departments"
      />

      <form onSubmit={handleSubmit} className="flex flex-col xl:flex-row gap-10 items-start">
        {/* Main Entry Form */}
        <div className="flex-1 w-full space-y-10">
          <div className="card-premium p-10 bg-white">
            <div className="flex items-center gap-4 mb-10 border-b border-slate-50 pb-6">
              <div className="p-4 bg-violet-50 text-violet-600 rounded-2xl"><GraduationCap size={24} /></div>
              <div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{t('pages.addDepartment.technicalManifest')}</h3>
                <p className="text-sm font-medium text-slate-400">{t('pages.addDepartment.primaryIdentification')}</p>
              </div>
            </div>

            <div className="space-y-8">
              <div className="space-y-2">
                <label className={`text-[10px] font-black uppercase tracking-widest text-slate-400 ${isRTL ? 'mr-1' : 'ml-1'}`}>{t('pages.addDepartment.departmentName')}</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder={t('pages.addDepartment.enterDepartmentName')}
                  className="input-modern font-bold text-lg"
                />
              </div>

              <div className="space-y-2">
                <label className={`text-[10px] font-black uppercase tracking-widest text-slate-400 ${isRTL ? 'mr-1' : 'ml-1'}`}>{t('pages.addDepartment.parentUnit')}</label>
                <select
                  name="collegeId"
                  value={formData.collegeId}
                  onChange={handleChange}
                  required
                  className="input-modern font-bold"
                >
                  <option value="">{t('pages.addDepartment.selectCollege')}</option>
                  {colleges.map((college) => (
                    <option key={college.id} value={college.id}>{college.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Configuration Sidebar */}
        <div className="w-full xl:w-96 space-y-8 shrink-0 lg:sticky lg:top-28">
          <div className="flex flex-col gap-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-modern-primary py-5 rounded-2xl flex items-center justify-center gap-3 shadow-2xl"
            >
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <><Save size={20} /> {t('pages.editDepartment.updateDepartment')}</>}
            </button>
            <button
              type="button"
              onClick={() => navigate('/departments')}
              className="w-full py-4 bg-white text-slate-400 border border-slate-100 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all"
            >
              {t('pages.editDepartment.abortMission')}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditDepartment;


