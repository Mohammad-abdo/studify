import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, Package, Tag, DollarSign, Calendar, Layout, Layers, ShieldCheck, Star, ShoppingBag, Box } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader';
import { useLanguage } from '../context/LanguageContext';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/products/${id}`);
      const productData = response.data.data || response.data;
      if (productData.imageUrls && typeof productData.imageUrls === 'string') {
        productData.imageUrls = JSON.parse(productData.imageUrls);
      }
      setProduct(productData);
    } catch (error) {
      toast.error(t('pages.productDetail.retrieveFailed'));
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-slate-100 border-t-slate-900 rounded-full animate-spin"></div>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('pages.productDetail.retrievingAsset')}</span>
      </div>
    );
  }

  if (!product) return null;

  const images = Array.isArray(product.imageUrls) ? product.imageUrls : [];

  return (
    <div className="space-y-10 page-transition pb-20">
      <PageHeader
        title={product.name}
        subtitle={t('pages.productDetail.subtitle')}
        breadcrumbs={[{ label: t('menu.products'), path: '/products' }, { label: t('pages.productDetail.title') }]}
        backPath="/products"
        actionLabel={t('pages.productDetail.modifyAsset')}
        actionPath={`/products/edit/${product.id}`}
      />

      <div className="flex flex-col xl:flex-row gap-10 items-start">
        {/* Main Asset Area */}
        <div className="flex-1 w-full space-y-10">
          {/* Core Specifications */}
          <div className="card-premium p-10 bg-white">
            <div className="flex flex-col md:flex-row gap-10">
              <div className="w-full md:w-72 shrink-0">
                <div className="aspect-square rounded-3xl bg-slate-100 overflow-hidden border-4 border-white shadow-2xl shadow-slate-200 group">
                  {images[0] ? (
                    <img 
                      src={images[0].startsWith('http') ? images[0] : `${api.defaults.baseURL.replace('/api', '')}${images[0]}`} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                      alt="" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300"><Box size={64} /></div>
                  )}
                </div>
              </div>
              
              <div className="flex-1 space-y-8">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">{t('pages.productDetail.inventoryNode')}</span>
                    <div className="h-px flex-1 bg-slate-50"></div>
                  </div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">{product.name}</h2>
                  <p className="text-slate-500 font-medium mt-4 leading-relaxed">{product.description}</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-8 p-8 bg-slate-50 rounded-3xl border border-slate-100">
                  <div className="space-y-1">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{t('pages.productDetail.nodeIdentity')}</span>
                    <p className="font-mono text-xs font-bold text-slate-900 uppercase">#{product.id.slice(0, 8)}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{t('pages.productDetail.classification')}</span>
                    <p className="text-sm font-black text-slate-900 truncate">{product.category?.name || t('pages.productDetail.uncategorized')}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{t('pages.productDetail.operationalState')}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                      <span className="text-[10px] font-black uppercase text-slate-900">{t('pages.productDetail.inCatalog')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Visual Assets Matrix */}
          {images.length > 1 && (
            <div className="card-premium p-10 bg-white">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-8">{t('pages.productDetail.visualEvidenceMatrix')}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {images.slice(1).map((img, i) => (
                  <div key={i} className="aspect-square rounded-2xl bg-slate-50 overflow-hidden border-2 border-white shadow-sm hover:border-indigo-500 transition-all cursor-pointer">
                    <img 
                      src={img.startsWith('http') ? img : `${api.defaults.baseURL.replace('/api', '')}${img}`} 
                      className="w-full h-full object-cover" 
                      alt="" 
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Commerce Tiers */}
          <div className="card-premium overflow-hidden bg-white">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
              <div>
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">{t('pages.productDetail.wholesaleTiers')}</h3>
                <p className="text-xs font-medium text-slate-400">{t('pages.productDetail.volumeThresholds')}</p>
              </div>
              <ShoppingBag size={24} className="text-slate-200" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-x divide-slate-50">
              {product.pricing?.map((p, i) => (
                <div key={i} className="p-8 space-y-4 hover:bg-slate-50/50 transition-all">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{t('pages.productDetail.minThreshold')}</span>
                    <span className="text-xs font-black text-slate-900">{p.minQuantity} {t('pages.productDetail.units')}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-3xl font-black text-slate-900 tracking-tighter">${p.price?.toFixed(2)}</span>
                    <span className="text-[10px] font-black uppercase text-indigo-500">{t('pages.productDetail.unitRate')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* System Sidebar */}
        <div className="w-full xl:w-96 space-y-8 shrink-0 lg:sticky lg:top-28">
          <div className="card-premium p-10 bg-slate-900 text-white border-none shadow-2xl shadow-slate-300">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-10">{t('pages.productDetail.registryMeta')}</h3>
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('pages.productDetail.entryDate')}</span>
                  <span className="text-xs font-black text-white">{new Date(product.createdAt).toLocaleDateString(isRTL ? 'ar-EG' : undefined)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('pages.productDetail.pricingNodes')}</span>
                  <span className="text-xs font-black text-white">{product.pricing?.length || 0} {t('pages.productDetail.tiers')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('pages.productDetail.totalReviews')}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-white">{product.reviews?.length || 0}</span>
                    <Star size={12} className="text-amber-400 fill-current" />
                  </div>
                </div>
              </div>
              
              <div className="h-px bg-white/10"></div>

              <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                <div className="flex items-center gap-3 text-emerald-400 mb-2">
                  <ShieldCheck size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">{t('pages.productDetail.assetSecured')}</span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium leading-relaxed uppercase tracking-wider">{t('pages.productDetail.assetSecuredDesc')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
