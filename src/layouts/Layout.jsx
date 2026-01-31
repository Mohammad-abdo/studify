import { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  LayoutDashboard,
  BookOpen,
  Package,
  ShoppingCart,
  Users,
  Settings,
  Menu,
  X,
  LogOut,
  Bell,
  Search,
  UserCheck,
  Building2,
  GraduationCap,
  Tag,
  Star,
  ArrowRight,
  FileText,
  Image,
  Shield,
  Key,
  UserCog,
  UserCircle,
  Stethoscope,
  Truck,
  Briefcase,
  DollarSign,
  Printer,
  TrendingUp,
  FileBarChart,
  Upload,
  ClipboardList,
  MapPin,
  Wallet,
  BarChart3,
  ChevronDown,
  ChevronRight,
  Globe,
  User,
  Check,
} from 'lucide-react';
import Swal from 'sweetalert2';
import Logo from '../components/Logo';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({});
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);
  
  const userDropdownRef = useRef(null);
  const languageDropdownRef = useRef(null);
  
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const isRTL = language === 'ar';

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) setUserDropdownOpen(false);
      if (languageDropdownRef.current && !languageDropdownRef.current.contains(event.target)) setLanguageDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menuItems = [
    { section: t('menu.sections.main'), items: [
      { icon: LayoutDashboard, label: t('menu.dashboard'), path: '/' },
      { icon: ShoppingCart, label: t('menu.orders'), path: '/orders' },
    ]},
    { section: t('menu.sections.inventory'), items: [
      { icon: BookOpen, label: t('menu.books'), path: '/books' },
      { icon: FileText, label: t('menu.materials'), path: '/materials' },
      { icon: Package, label: t('menu.products'), path: '/products' },
    ]},
    { section: t('menu.sections.userManagement'), items: [
      {
        icon: Users,
        label: t('menu.users'),
        key: 'users',
        children: [
          { icon: Users, label: t('menu.users'), path: '/users' },
          { icon: GraduationCap, label: t('menu.students'), path: '/students' },
          { icon: Stethoscope, label: t('menu.doctors'), path: '/doctors' },
          { icon: Truck, label: t('menu.delivery'), path: '/delivery' },
          { icon: Briefcase, label: t('menu.customers'), path: '/customers' },
        ],
      },
      {
        icon: Shield,
        label: t('menu.sections.rbac'),
        key: 'rbac',
        children: [
          { icon: Shield, label: t('menu.roles'), path: '/roles' },
          { icon: Key, label: t('menu.permissions'), path: '/permissions' },
          { icon: UserCog, label: t('menu.userRoles'), path: '/user-roles' },
        ],
      },
    ]},
    { section: t('menu.sections.logistics'), items: [
      {
        icon: Truck,
        label: t('menu.delivery'),
        key: 'delivery-ops',
        children: [
          { icon: ClipboardList, label: t('menu.assignments'), path: '/delivery-assignments' },
          { icon: Wallet, label: t('menu.wallets'), path: '/delivery-wallets' },
          { icon: MapPin, label: t('menu.locations'), path: '/delivery-locations' },
          { icon: Printer, label: isRTL ? 'المطابع' : 'Print Centers', path: '/print-centers' },
        ],
      },
    ]},
    { section: t('menu.sections.system'), items: [
      { icon: UserCheck, label: t('menu.approvals'), path: '/approvals' },
      { icon: Settings, label: t('common.settings'), path: '/settings' },
    ]}
  ];

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: t('common.logout'),
      text: isRTL ? 'هل تريد تسجيل الخروج؟' : 'Do you want to sign out?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#2563eb',
      cancelButtonColor: '#f43f5e',
      confirmButtonText: isRTL ? 'تسجيل الخروج' : 'Sign Out',
      reverseButtons: isRTL
    });
    if (result.isConfirmed) {
      logout();
      navigate('/login');
    }
  };

  const renderMenuItem = (item) => {
    const Icon = item.icon;
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedMenus[item.key];
    const isActive = item.path ? location.pathname === item.path : item.children?.some(c => location.pathname === c.path);

    if (hasChildren) {
      return (
        <div key={item.key} className="mb-1.5">
          <button
            onClick={() => setExpandedMenus(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
            className={`w-full flex items-center justify-between px-3 xl:px-3.5 py-2.5 rounded-xl transition-all duration-200 ${
              isActive ? 'bg-blue-50/50 text-blue-600 font-bold' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Icon size={18} className={`shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
              <span className="text-xs xl:text-sm truncate">{item.label}</span>
            </div>
            <ChevronRight size={14} className={`shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
          </button>
          {isExpanded && (
            <div className={`mt-1 space-y-0.5 ${isRTL ? 'mr-7 border-r' : 'ml-7 border-l'} border-slate-100`}>
              {item.children.map(child => (
                <Link
                  key={child.path}
                  to={child.path}
                  className={`flex items-center gap-2.5 px-3 xl:px-3.5 py-2 rounded-lg text-xs xl:text-sm transition-all ${
                    location.pathname === child.path ? 'text-blue-600 font-bold bg-blue-50/30' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <span className="truncate">{child.label}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.path}
        to={item.path}
        className={`flex items-center gap-2.5 px-3 xl:px-3.5 py-2.5 rounded-xl mb-1.5 transition-all duration-200 ${
          isActive ? 'bg-slate-900 text-white shadow-xl shadow-slate-200 font-bold' : 'text-slate-600 hover:bg-slate-50'
        }`}
      >
        <Icon size={18} className={`shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
        <span className="text-xs xl:text-sm truncate">{item.label}</span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 z-50 w-[var(--sidebar-width)] shrink-0 bg-white border-slate-200 transition-all duration-300 transform lg:static lg:translate-x-0 ${
        isRTL ? `right-0 border-l ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}` : `left-0 border-r ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`
      }`}>
        <div className="flex flex-col h-full">
          <div className="h-[var(--header-height)] flex items-center px-4 xl:px-5 border-b border-slate-100">
            <Link to="/" className="flex items-center gap-2 xl:gap-2.5" dir="ltr">
              <Logo size="medium" />
              <span className="text-lg xl:text-xl font-black text-slate-900 tracking-tighter italic">STUDIFY</span>
            </Link>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-6 xl:px-4 xl:py-6 custom-scrollbar">
            {menuItems.map((section, idx) => (
              <div key={idx} className="mb-6 xl:mb-6">
                <h4 className={`px-3 xl:px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 ${isRTL ? 'text-right' : 'text-left'}`}>{section.section}</h4>
                {section.items.map(item => renderMenuItem(item))}
              </div>
            ))}
          </nav>

          <div className="p-4 xl:p-5 border-t border-slate-100">
            <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 xl:gap-2.5 px-3 xl:px-4 py-2.5 xl:py-3 rounded-xl bg-slate-50 text-slate-600 font-bold hover:bg-rose-50 hover:text-rose-600 transition-all duration-200 text-sm">
              <LogOut size={18} className={isRTL ? 'rotate-180' : ''} />
              <span className="text-sm">{t('common.logout')}</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header */}
        <header className="h-[var(--header-height)] bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-30">
          <div className="w-full max-w-[1400px] lg:max-w-[1600px] xl:max-w-[1800px] 2xl:max-w-[2200px] 3xl:max-w-[2600px] mx-auto h-full px-4 sm:px-6 lg:px-8 xl:px-8 2xl:px-10 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2.5 bg-slate-100 rounded-xl text-slate-600 shrink-0">
                <Menu size={22} />
              </button>
              <div className="hidden sm:flex flex-1 items-center gap-3 px-3 xl:px-4 py-2 xl:py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus-within:bg-white focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all max-w-[280px] lg:max-w-[340px] xl:max-w-[400px] 2xl:max-w-[500px] 3xl:max-w-[600px] min-w-0">
                <Search size={18} className="text-slate-400 shrink-0" />
                <input type="text" placeholder={t('common.search')} className="bg-transparent border-none outline-none text-sm w-full min-w-0" />
              </div>
            </div>

          <div className="flex items-center gap-2 lg:gap-4 shrink-0">
            {/* Language Picker */}
            <div className="relative" ref={languageDropdownRef}>
              <button onClick={() => setLanguageDropdownOpen(!languageDropdownOpen)} className="p-2.5 hover:bg-slate-50 rounded-xl text-slate-600 flex items-center gap-2 transition-colors">
                <Globe size={20} />
                <span className="text-xs font-black uppercase">{language}</span>
              </button>
              {languageDropdownOpen && (
                <div className={`absolute mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 py-2 ${isRTL ? 'left-0' : 'right-0'}`}>
                  {['en', 'ar'].map(l => (
                    <button key={l} onClick={() => { setLanguage(l); setLanguageDropdownOpen(false); }} className={`w-full px-5 py-3 text-sm flex items-center justify-between hover:bg-slate-50 ${language === l ? 'text-blue-600 font-bold bg-blue-50/20' : 'text-slate-600'}`}>
                      <span>{l === 'en' ? 'English' : 'العربية'}</span>
                      {language === l && <Check size={16} />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button className="p-2.5 hover:bg-slate-50 rounded-xl text-slate-600 relative transition-colors">
              <Bell size={20} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-blue-600 rounded-full border-2 border-white"></span>
            </button>

            <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>

            <div className="relative" ref={userDropdownRef}>
              <button onClick={() => setUserDropdownOpen(!userDropdownOpen)} className="flex items-center gap-3 p-1 rounded-full hover:bg-slate-50 transition-all">
                <div className="w-10 h-10 rounded-full bg-slate-900 border-2 border-white shadow-lg flex items-center justify-center text-white overflow-hidden">
                  {user?.avatarUrl ? <img src={user.avatarUrl} className="w-full h-full object-cover" /> : <User size={20} />}
                </div>
                <div className={`hidden xl:block pr-2 ${isRTL ? 'text-right pl-2 pr-0' : 'text-left pr-2'}`}>
                  <p className="text-xs font-black text-slate-900 leading-none mb-1 uppercase tracking-tighter">{user?.phone || 'Admin'}</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase">{user?.type || 'Manager'}</p>
                </div>
              </button>
              {userDropdownOpen && (
                <div className={`absolute mt-3 w-64 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 py-2 overflow-hidden ${isRTL ? 'left-0' : 'right-0'}`}>
                  <div className="px-5 py-4 bg-slate-50/50 border-b border-slate-100 mb-2">
                    <p className="text-sm font-black text-slate-900">{user?.phone || t('dashboard.admin')}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{user?.email || (isRTL ? 'لا يوجد بريد إلكتروني' : 'No email set')}</p>
                  </div>
                  <Link to="/settings" onClick={() => setUserDropdownOpen(false)} className="flex items-center gap-3 px-5 py-3 text-sm text-slate-600 hover:bg-slate-50 font-medium"><UserCircle size={18} /> {t('common.settings')}</Link>
                  <Link to="/settings" onClick={() => setUserDropdownOpen(false)} className="flex items-center gap-3 px-5 py-3 text-sm text-slate-600 hover:bg-slate-50 font-medium"><Settings size={18} /> {isRTL ? 'تهيئة النظام' : 'Platform Config'}</Link>
                  <div className="h-px bg-slate-100 my-2 mx-5"></div>
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-5 py-3 text-sm text-rose-600 hover:bg-rose-50 font-bold">
                    <LogOut size={18} /> {t('common.logout')}
                  </button>
                </div>
              )}
            </div>
            </div>
          </div>
        </header>

        {/* Content View */}
        <main className="flex-1 overflow-y-auto bg-slate-50/50 p-4 sm:p-6 lg:p-8 xl:p-8 2xl:p-10 3xl:p-12 custom-scrollbar relative min-w-0">
          <div className="w-full max-w-[1400px] lg:max-w-[1600px] xl:max-w-[1800px] 2xl:max-w-[2200px] 3xl:max-w-[2600px] mx-auto page-transition">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
