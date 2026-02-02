import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useSocket } from '../context/SocketContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../config/api';
import toast from 'react-hot-toast';
import { Package, MapPin, Navigation, Clock, Phone, ArrowLeft } from 'lucide-react';
import PageHeader from '../components/PageHeader';

// Fix Leaflet marker icons
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Custom marker for delivery
const deliveryIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/4766/4766928.png',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

// Component to auto-center map
const ChangeView = ({ center }) => {
  const map = useMap();
  map.setView(center, map.getZoom());
  return null;
};

const OrderTracking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const socket = useSocket();
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';

  const [order, setOrder] = useState(null);
  const [deliveryLocation, setDeliveryLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  useEffect(() => {
    if (socket && id) {
      console.log('📡 Joining tracking room for order:', id);
      socket.emit('track_order', { orderId: id });

      socket.on('location_updated', (data) => {
        console.log('📍 Real-time location received:', data);
        setDeliveryLocation({
          lat: data.latitude,
          lng: data.longitude,
          address: data.address,
          timestamp: data.timestamp
        });
      });

      return () => {
        socket.emit('untrack_order', { orderId: id });
        socket.off('location_updated');
      };
    }
  }, [socket, id]);

  const fetchOrder = async () => {
    try {
      const response = await api.get(`/orders/${id}`);
      const orderData = response.data.data || response.data;
      setOrder(orderData);

      // If delivery assignment exists, try to get initial location
      if (orderData.assignment?.deliveryId) {
        try {
          const locRes = await api.get(`/delivery-locations?deliveryId=${orderData.assignment.deliveryId}&limit=1`);
          const latestLoc = locRes.data.data?.[0];
          if (latestLoc) {
            setDeliveryLocation({
              lat: latestLoc.latitude,
              lng: latestLoc.longitude,
              address: latestLoc.address,
              timestamp: latestLoc.createdAt
            });
          }
        } catch (e) {
          console.error('Could not fetch initial delivery location', e);
        }
      }
    } catch (error) {
      toast.error(t('pages.orderTracking.error'));
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-slate-100 border-t-slate-900 rounded-full animate-spin"></div>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Initializing Satellite Link...</span>
      </div>
    );
  }

  if (!order) return null;

  // Center: delivery location if available, else order destination (latitude/longitude), else Cairo
  const defaultCenter = [30.0444, 31.2357];
  const orderDest = (order.latitude != null && order.longitude != null) ? [order.latitude, order.longitude] : null;
  const mapCenter = deliveryLocation ? [deliveryLocation.lat, deliveryLocation.lng] : (orderDest || defaultCenter);

  return (
    <div className="space-y-6 page-transition pb-20">
      <PageHeader
        title={`${t('pages.orderTracking.title')} #ORD-${order.id.substring(0, 8)}`}
        subtitle={t('pages.orderTracking.subtitle')}
        breadcrumbs={[
          { label: t('menu.orders'), path: '/orders' },
          { label: t('pages.orderDetail.title'), path: `/orders/${id}` },
          { label: t('pages.orderTracking.title') }
        ]}
        backPath={`/orders/${id}`}
      />

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Map Area */}
        <div className="xl:col-span-3">
          <div className="card-premium h-[600px] overflow-hidden relative border-none shadow-2xl">
            {!deliveryLocation && (
              <div className="absolute inset-0 z-[1000] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-10 text-center">
                <div className="max-w-md bg-white p-8 rounded-3xl shadow-2xl">
                  <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Navigation size={32} className="animate-pulse" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tight">{t('pages.orderTracking.waitingTitle')}</h3>
                  <p className="text-sm font-medium text-slate-400 leading-relaxed">{t('pages.orderTracking.waitingDesc')}</p>
                </div>
              </div>
            )}
            
            <MapContainer center={mapCenter} zoom={15} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {orderDest && (
                <Marker position={orderDest}>
                  <Popup>
                    <div className={`p-2 ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
                      <p className="font-black text-slate-900 uppercase tracking-tight mb-1">{t('pages.orderTracking.destination')}</p>
                      <p className="text-xs font-bold text-slate-500">{order.address || '—'}</p>
                    </div>
                  </Popup>
                </Marker>
              )}
              {deliveryLocation && (
                <>
                  <ChangeView center={[deliveryLocation.lat, deliveryLocation.lng]} />
                  <Marker position={[deliveryLocation.lat, deliveryLocation.lng]} icon={deliveryIcon}>
                    <Popup>
                      <div className={`p-2 ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
                        <p className="font-black text-slate-900 uppercase tracking-tight mb-1">{t('pages.orderTracking.deliveryLocation')}</p>
                        <p className="text-xs font-bold text-slate-500">{deliveryLocation.address || t('pages.orderTracking.moving')}</p>
                      </div>
                    </Popup>
                  </Marker>
                </>
              )}
            </MapContainer>
          </div>
        </div>

        {/* Info Sidebar */}
        <div className="space-y-6">
          {/* Order Info Card */}
          <div className="card-premium p-6 space-y-6 bg-white">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">{t('pages.orderTracking.orderInfo')}</h3>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Package size={20} /></div>
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{t('pages.orderTracking.status')}</p>
                <p className="text-sm font-black text-slate-900 uppercase">{order.status}</p>
              </div>
            </div>
            {order.address && (
              <div className="flex items-start gap-4">
                <div className="p-3 bg-rose-50 text-rose-600 rounded-xl mt-1"><MapPin size={20} /></div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{t('pages.orderTracking.destination')}</p>
                  <p className="text-sm font-bold text-slate-700 leading-snug">{order.address}</p>
                </div>
              </div>
            )}
          </div>

          {/* Delivery Personnel Card */}
          {order.assignment?.delivery && (
            <div className="card-premium p-6 space-y-6 bg-slate-900 text-white border-none shadow-xl shadow-slate-200">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">{t('pages.orderTracking.agentInfo')}</h3>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden">
                  {order.assignment.delivery.user?.avatarUrl ? (
                    <img src={order.assignment.delivery.user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xl font-black">D</span>
                  )}
                </div>
                <div>
                  <p className="text-lg font-black tracking-tight">{order.assignment.delivery.name}</p>
                  <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{order.assignment.delivery.vehicleType} - {order.assignment.delivery.vehiclePlateNumber}</p>
                </div>
              </div>
              <a 
                href={`tel:${order.assignment.delivery.user?.phone}`}
                className="flex items-center justify-center gap-3 w-full py-4 bg-blue-500 hover:bg-blue-600 rounded-xl text-white font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20"
              >
                <Phone size={16} />
                {t('pages.orderTracking.callAgent')}
              </a>
            </div>
          )}

          {/* Telemetry Card */}
          {deliveryLocation && (
            <div className="card-premium p-6 space-y-6 bg-white animate-in slide-in-from-bottom-4 duration-500">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">{t('pages.orderTracking.telemetry')}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">{t('pages.orderTracking.latitude')}</p>
                  <p className="font-mono text-xs font-black text-slate-900">{deliveryLocation.lat.toFixed(6)}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">{t('pages.orderTracking.longitude')}</p>
                  <p className="font-mono text-xs font-black text-slate-900">{deliveryLocation.lng.toFixed(6)}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-slate-400">
                <Clock size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  {t('pages.orderTracking.lastUpdate')}: {new Date(deliveryLocation.timestamp).toLocaleTimeString(isRTL ? 'ar-EG' : undefined)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
