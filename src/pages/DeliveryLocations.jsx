import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Plus, Edit, Trash2, Truck, Search, Filter, Globe, Navigation, Clock } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../config/api';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import DataTable from '../components/DataTable';
import PageHeader from '../components/PageHeader';
import { useLanguage } from '../context/LanguageContext';
import { useSocket } from '../context/SocketContext';

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
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const DeliveryLocations = () => {
  const navigate = useNavigate();
  const socket = useSocket();
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';
  const [locations, setLocations] = useState([]);
  const [liveLocations, setLiveLocations] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLocations();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.emit('join_admin_tracking');

      socket.on('delivery_moved', (data) => {
        setLiveLocations(prev => ({
          ...prev,
          [data.deliveryId]: {
            ...data,
            lastUpdate: new Date()
          }
        }));
      });

      return () => {
        socket.off('delivery_moved');
      };
    }
  }, [socket]);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const response = await api.get('/delivery-locations');
      const staticLocs = response.data.data || response.data || [];
      setLocations(staticLocs);
      
      // Initialize live locations with static ones
      const initialLive = {};
      staticLocs.forEach(loc => {
        if (loc.deliveryId) {
          initialLive[loc.deliveryId] = {
            deliveryId: loc.deliveryId,
            latitude: loc.latitude,
            longitude: loc.longitude,
            address: loc.address,
            name: loc.delivery?.name,
            lastUpdate: loc.createdAt
          };
        }
      });
      setLiveLocations(initialLive);
    } catch (error) {
      toast.error(isRTL ? 'لوجستيات: فشل مزامنة الموقع الجغرافي' : 'Logistics: Geo-location sync failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (location) => {
    const result = await Swal.fire({
      title: t('pages.deliveryLocations.purgeLocation'),
      text: t('pages.deliveryLocations.purgeLocationDesc'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f43f5e',
      confirmButtonText: t('pages.deliveryLocations.confirmPurge'),
      reverseButtons: isRTL
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/delivery-locations/${location.id}`);
        toast.success(isRTL ? 'تم حذف الموقع الجغرافي' : 'Geo-location purged');
        fetchLocations();
      } catch (error) {
        toast.error(isRTL ? 'فشل عملية الحذف: السجل مقفل' : 'Purge operation failed: Registry locked');
      }
    }
  };

  const columns = [
    {
      header: t('pages.deliveryLocations.assignedAgent'),
      accessor: 'delivery',
      render: (location) => (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 shadow-sm">
            <Truck size={20} />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-slate-900 tracking-tight">{location.delivery?.name || t('pages.deliveryLocations.logisticAgent')}</span>
            <span className="text-[10px] font-bold text-slate-400 font-mono">ID: {location.deliveryId?.slice(0, 8)}</span>
          </div>
        </div>
      ),
    },
    {
      header: t('pages.deliveryLocations.geographicTarget'),
      accessor: 'address',
      render: (location) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
            <MapPin size={16} strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-slate-700">{location.address || t('pages.deliveryLocations.registryAddress')}</span>
            {location.latitude && location.longitude && (
              <span className="text-[10px] font-mono font-medium text-slate-400">
                GPS: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      header: t('pages.deliveryLocations.telemetryStatus'),
      accessor: 'id',
      align: 'center',
      render: (location) => (
        <div className="flex items-center justify-center gap-2">
          <Globe size={14} className="text-blue-500 animate-pulse" />
          <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{t('pages.deliveryLocations.activeLink')}</span>
        </div>
      )
    },
    {
      header: t('pages.deliveryLocations.operations'),
      accessor: 'actions',
      align: 'right',
      render: (location) => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={() => navigate(`/delivery-locations/edit/${location.id}`)} className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Edit size={18} /></button>
          <button onClick={() => handleDelete(location)} className="p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"><Trash2 size={18} /></button>
        </div>
      ),
    },
  ];

  const filteredLocations = locations.filter((location) => {
    const address = location.address?.toLowerCase() || '';
    const deliveryName = location.delivery?.name?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    return address.includes(search) || deliveryName.includes(search);
  });

  return (
    <div className="space-y-10 page-transition pb-20">
      <PageHeader
        title={t('pages.deliveryLocations.title')}
        subtitle={t('pages.deliveryLocations.subtitle')}
        breadcrumbs={[{ label: t('menu.sections.logistics') }, { label: isRTL ? 'التتبع الجغرافي' : 'Geo-Tracking' }]}
        actionLabel={t('pages.deliveryLocations.registerNode')}
        actionPath="/delivery-locations/add"
      />

      {/* Global Real-time Map */}
      <div className="card-premium h-[500px] overflow-hidden bg-white border-none shadow-2xl relative">
        <div className="absolute top-6 left-6 z-[1000] space-y-2">
          <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-xl shadow-lg border border-slate-100 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">{Object.keys(liveLocations).length} {isRTL ? 'مندوبين نشطين' : 'Active Agents'}</span>
          </div>
        </div>

        <MapContainer center={[30.0444, 31.2357]} zoom={12} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {Object.values(liveLocations).map((loc) => (
            <Marker key={loc.deliveryId} position={[loc.latitude, loc.longitude]} icon={deliveryIcon}>
              <Popup>
                <div className={`p-3 min-w-[200px] ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
                  <div className="flex items-center gap-3 mb-3 pb-3 border-b border-slate-100">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                      <Truck size={20} />
                    </div>
                    <div>
                      <p className="font-black text-slate-900 uppercase tracking-tight">{loc.name || isRTL ? 'مندوب' : 'Agent'}</p>
                      <p className="text-[10px] font-bold text-slate-400">ID: {loc.deliveryId.slice(0, 8)}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2 text-slate-600">
                      <MapPin size={14} className="mt-0.5 shrink-0" />
                      <p className="text-xs font-bold leading-snug">{loc.address || (isRTL ? 'موقع نشط' : 'Active Location')}</p>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <Clock size={14} className="shrink-0" />
                      <p className="text-[10px] font-black uppercase tracking-widest">{isRTL ? 'آخر تحديث' : 'Last update'}: {new Date(loc.lastUpdate).toLocaleTimeString(isRTL ? 'ar-EG' : undefined)}</p>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <div className="card-premium p-6 bg-white border-none shadow-xl shadow-slate-200/50">
        <div className="relative max-w-2xl">
          <Search size={20} className={`absolute top-1/2 -translate-y-1/2 text-slate-400 ${isRTL ? 'right-4' : 'left-4'}`} />
          <input
            type="text"
            placeholder={t('pages.deliveryLocations.search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full bg-slate-50 border-none rounded-2xl py-4 font-bold text-sm focus:ring-4 focus:ring-blue-500/10 transition-all ${isRTL ? 'pr-12' : 'pl-12'}`}
          />
        </div>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-slate-100 border-t-rose-600 rounded-full animate-spin"></div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('pages.deliveryLocations.syncingNetwork')}</span>
        </div>
      ) : (
        <div className="fade-in">
          <DataTable
            data={filteredLocations}
            columns={columns}
            loading={false}
            searchable={false}
          />
        </div>
      )}
    </div>
  );
};

export default DeliveryLocations;
