import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';

const AddUserRole = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [formData, setFormData] = useState({
    userId: '',
    roleId: '',
  });

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data.data || response.data || []);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await api.get('/roles');
      setRoles(response.data.data || response.data || []);
    } catch (error) {
      console.error('Failed to load roles:', error);
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
      await api.post('/user-roles', formData);
      toast.success(t('pages.addUserRole.success'));
      navigate('/user-roles');
    } catch (error) {
      toast.error(isRTL ? 'فشل تعيين الدور' : 'Failed to assign role');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 page-transition pb-20">
      <PageHeader
        title={t('pages.addUserRole.title')}
        subtitle={t('pages.addUserRole.subtitle')}
        breadcrumbs={[{ label: isRTL ? 'صلاحيات الوصول' : 'RBAC' }, { label: t('pages.addUserRole.assignAccess') }]}
        backPath="/user-roles"
      />

      <form onSubmit={handleSubmit} className="flex flex-col xl:flex-row gap-10 items-start">
        {/* Main Entry Form */}
        <div className="flex-1 w-full space-y-10">
          <div className="card-premium p-10 bg-white">
            <div className="flex items-center gap-4 mb-10 border-b border-slate-50 pb-6">
              <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl"><UserCog size={24} /></div>
              <div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{t('pages.addUserRole.technicalManifest')}</h3>
                <p className="text-sm font-medium text-slate-400">{t('pages.addUserRole.primaryIdentification')}</p>
              </div>
            </div>

            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className={`text-[10px] font-black uppercase tracking-widest text-slate-400 ${isRTL ? 'mr-1' : 'ml-1'}`}>{t('pages.addUserRole.user')}</label>
                  <select
                    name="userId"
                    value={formData.userId}
                    onChange={handleChange}
                    required
                    className="input-modern font-bold"
                  >
                    <option value="">{t('pages.addUserRole.selectUser')}</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>{user.phone} ({user.type})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className={`text-[10px] font-black uppercase tracking-widest text-slate-400 ${isRTL ? 'mr-1' : 'ml-1'}`}>{t('pages.addUserRole.role')}</label>
                  <select
                    name="roleId"
                    value={formData.roleId}
                    onChange={handleChange}
                    required
                    className="input-modern font-bold"
                  >
                    <option value="">{t('pages.addUserRole.selectRole')}</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>{role.name}</option>
                    ))}
                  </select>
                </div>
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
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <><Save size={20} /> {t('pages.addUserRole.initializeRegistry')}</>}
            </button>
            <button
              type="button"
              onClick={() => navigate('/user-roles')}
              className="w-full py-4 bg-white text-slate-400 border border-slate-100 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all"
            >
              {t('pages.addUserRole.abortMission')}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddUserRole;


