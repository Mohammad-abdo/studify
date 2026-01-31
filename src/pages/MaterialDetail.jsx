import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Edit, CheckCircle, Clock, XCircle, FileText, User, Building, Tag, Calendar, Download, Layers, ShieldCheck, Box, Activity } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader';
import LoadingState from '../components/LoadingState';
import { useLanguage } from '../context/LanguageContext';

const MaterialDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';
  const [material, setMaterial] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMaterial();
  }, [id]);

  const fetchMaterial = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/materials/${id}`);
      const materialData = response.data.data || response.data;
      if (materialData.imageUrls && typeof materialData.imageUrls === 'string') {
        materialData.imageUrls = JSON.parse(materialData.imageUrls);
      }
      setMaterial(materialData);
    } catch (error) {
      toast.error(t('pages.materialDetail.syncError'));
      navigate('/materials');
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case 'APPROVED': return { icon: CheckCircle, badge: 'badge-modern-success' };
      case 'PENDING': return { icon: Clock, badge: 'badge-modern-warning' };
      case 'REJECTED': return { icon: XCircle, badge: 'badge-modern-error' };
      default: return { icon: Clock, badge: 'badge-modern-info' };
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-slate-100 border-t-slate-900 rounded-full animate-spin"></div>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('pages.materialDetail.loading')}</span>
      </div>
    );
  }

  if (!material) return null;

  const images = Array.isArray(material.imageUrls) ? material.imageUrls : [];
  const status = getStatusStyles(material.approvalStatus);

  return (
    <div className="space-y-10 page-transition pb-20">
      <PageHeader
        title={material.title}
        subtitle={t('pages.materialDetail.subtitle')}
        breadcrumbs={[{ label: t('menu.materials'), path: '/materials' }, { label: t('pages.materialDetail.title') }]}
        backPath="/materials"
        actionLabel={t('pages.materialDetail.modifyResource')}
        actionPath={`/materials/edit/${material.id}`}
      />

      <div className="flex flex-col xl:flex-row gap-10 items-start">
        {/* Main Resource Area */}
        <div className="flex-1 w-full space-y-10">
          {/* Technical Specifications */}
          <div className="card-premium p-10 bg-white">
            <div className="flex flex-col md:flex-row gap-10">
              <div className="w-full md:w-64 shrink-0">
                <div className="aspect-[3/4] rounded-3xl bg-slate-100 overflow-hidden border-4 border-white shadow-2xl shadow-slate-200 group">
                  {images[0] ? (
                    <img 
                      src={images[0].startsWith('http') ? images[0] : `${api.defaults.baseURL.replace('/api', '')}${images[0]}`} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                      alt="" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300"><FileText size={64} /></div>
                  )}
                </div>
              </div>
              
              <div className="flex-1 space-y-8">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">{t('pages.materialDetail.digitalAssetNode')}</span>
                    <div className="h-px flex-1 bg-slate-50"></div>
                  </div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">{material.title}</h2>
                  <p className="text-slate-500 font-medium mt-4 leading-relaxed">{material.description}</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-8 p-8 bg-slate-50 rounded-3xl border border-slate-100">
                  <div className="space-y-1">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{t('pages.materialDetail.resourceType')}</span>
                    <p className="text-sm font-black text-slate-900 uppercase">{material.materialType || t('pages.materialDetail.digital')}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{t('pages.materialDetail.nodeVolume')}</span>
                    <p className="text-sm font-black text-slate-900">{material.totalPages || 'N/A'} {isRTL ? 'وحدات' : 'Units'}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{t('pages.materialDetail.missionState')}</span>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${material.approvalStatus === 'APPROVED' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                      <span className="text-[10px] font-black uppercase text-slate-900">{material.approvalStatus}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Commerce Protocol */}
          {material.pricing && material.pricing.length > 0 && (
            <div className="card-premium overflow-hidden bg-white">
              <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                <div>
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">{t('pages.materialDetail.accessProtocol')}</h3>
                  <p className="text-xs font-medium text-slate-400">{t('pages.materialDetail.licensingTiers')}</p>
                </div>
                <Activity size={24} className="text-slate-200" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-x divide-slate-50">
                {material.pricing.map((p, i) => (
                  <div key={i} className="p-8 space-y-4 hover:bg-slate-50/50 transition-all">
                    <span className="badge-modern badge-modern-info">{p.accessType}</span>
                    <div className="flex flex-col">
                      <span className="text-3xl font-black text-slate-900 tracking-tighter">${p.price?.toFixed(2)}</span>
                      <span className="text-[10px] font-black uppercase text-slate-400">{t('pages.materialDetail.setValuation')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Operational Sidebar */}
        <div className="w-full xl:w-96 space-y-8 shrink-0 lg:sticky lg:top-28">
          <div className="card-premium p-10 bg-slate-900 text-white border-none shadow-2xl shadow-slate-300">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-10">{t('pages.materialDetail.originNode')}</h3>
            <div className="space-y-8">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-emerald-400 border border-white/10"><User size={32} /></div>
                <div className={`flex flex-col ${isRTL ? 'text-right' : 'text-left'}`}>
                  <span className="text-lg font-black tracking-tight">{material.doctor?.name || t('pages.materialDetail.academicLead')}</span>
                  <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest">{material.doctor?.user?.phone || t('pages.materialDetail.terminalOffline')}</span>
                </div>
              </div>
              
              <div className="h-px bg-white/10"></div>

              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('pages.materialDetail.institutionalUnit')}</span>
                  <span className="text-xs font-black text-white">{material.college?.name || t('pages.materialDetail.rootNode')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('pages.materialDetail.majorSegment')}</span>
                  <span className="text-xs font-black text-white">{material.department?.name || t('pages.materialDetail.general')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('pages.materialDetail.impactFactor')}</span>
                  <span className="text-xs font-black text-white">{material.downloadCount || 0} {isRTL ? 'تحميلات' : 'Downloads'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="card-premium p-8 bg-white border-2 border-slate-50">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-8">{t('pages.materialDetail.resourceDeployment')}</h4>
            {material.fileUrl ? (
              <a href={material.fileUrl} target="_blank" rel="noopener noreferrer" className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all">
                <Download size={18} /> {t('pages.materialDetail.deployManifest')}
              </a>
            ) : (
              <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center">
                <span className="text-[10px] font-black uppercase text-slate-400">{t('pages.materialDetail.noManifestSynced')}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialDetail;
