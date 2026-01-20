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
import toast from 'react-hot-toast';
import Logo from '../components/Logo';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1025);
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
      setIsMobile(window.innerWidth < 1025);
      if (window.innerWidth >= 1025) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
      if (languageDropdownRef.current && !languageDropdownRef.current.contains(event.target)) {
        setLanguageDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMenu = (menuKey) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuKey]: !prev[menuKey],
    }));
  };

  const menuItems = [
    { icon: LayoutDashboard, label: t('menu.dashboard'), path: '/' },
    { icon: BookOpen, label: t('menu.books'), path: '/books' },
    { icon: FileText, label: t('menu.materials'), path: '/materials' },
    { icon: Package, label: t('menu.products'), path: '/products' },
    { icon: ShoppingCart, label: t('menu.orders'), path: '/orders' },
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
      label: 'RBAC',
      key: 'rbac',
      children: [
        { icon: Shield, label: t('menu.roles'), path: '/roles' },
        { icon: Key, label: t('menu.permissions'), path: '/permissions' },
        { icon: UserCog, label: t('menu.userRoles'), path: '/user-roles' },
      ],
    },
    { icon: Building2, label: t('menu.colleges'), path: '/colleges' },
    { icon: GraduationCap, label: t('menu.departments'), path: '/departments' },
    { icon: Tag, label: t('menu.categories'), path: '/categories' },
    {
      icon: DollarSign,
      label: t('menu.bookPricing'),
      key: 'pricing',
      children: [
        { icon: DollarSign, label: t('menu.bookPricing'), path: '/book-pricing' },
        { icon: Printer, label: t('menu.printOptions'), path: '/print-options' },
        { icon: TrendingUp, label: t('menu.productPricing'), path: '/product-pricing' },
      ],
    },
    { icon: Star, label: t('menu.reviews'), path: '/reviews' },
    {
      icon: FileBarChart,
      label: t('menu.reports'),
      key: 'financial',
      children: [
        { icon: DollarSign, label: t('menu.transactions'), path: '/financial-transactions' },
        { icon: FileBarChart, label: t('menu.reports'), path: '/reports' },
        { icon: Upload, label: t('menu.importLogs'), path: '/import-logs' },
      ],
    },
    {
      icon: Truck,
      label: t('menu.delivery'),
      key: 'delivery',
      children: [
        { icon: ClipboardList, label: t('menu.assignments'), path: '/delivery-assignments' },
        { icon: Wallet, label: t('menu.wallets'), path: '/delivery-wallets' },
        { icon: MapPin, label: t('menu.locations'), path: '/delivery-locations' },
      ],
    },
    { icon: ArrowRight, label: t('menu.onboarding'), path: '/onboarding' },
    { icon: Image, label: t('menu.sliders'), path: '/sliders' },
    { icon: FileText, label: t('menu.staticPages'), path: '/static-pages' },
    { icon: UserCheck, label: t('menu.approvals'), path: '/approvals' },
    { icon: BarChart3, label: t('menu.dashboardMetrics'), path: '/dashboard-metrics' },
    { icon: Settings, label: t('common.settings'), path: '/settings' },
  ];

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const renderMenuItem = (item) => {
    const Icon = item.icon;
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedMenus[item.key];
    const isActive = item.path ? location.pathname === item.path : item.children?.some((child) => location.pathname === child.path);

    if (hasChildren) {
      return (
        <div key={item.key || item.path} className="space-y-1">
          <button
            onClick={() => toggleMenu(item.key)}
            className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-md transition-colors duration-150 ${
              isActive
                ? 'bg-gray-100 text-gray-900 font-medium'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Icon size={18} className={isActive ? 'text-gray-900' : 'text-gray-600'} />
              <span className="text-sm">{item.label}</span>
            </div>
            {isRTL ? (
              <ChevronRight
                size={16}
                className={`text-gray-400 transition-transform duration-150 ${isExpanded ? '-rotate-90' : ''}`}
              />
            ) : (
              <ChevronRight
                size={16}
                className={`text-gray-400 transition-transform duration-150 ${isExpanded ? 'rotate-90' : ''}`}
              />
            )}
          </button>
          {isExpanded && (
            <div className={`space-y-0.5 border-gray-200 ${
              isRTL 
                ? 'pr-4 border-r mr-3' 
                : 'pl-4 border-l ml-3'
            }`}>
              {item.children.map((child) => {
                const ChildIcon = child.icon;
                const isChildActive = location.pathname === child.path;
                return (
                  <Link
                    key={child.path}
                    to={child.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors duration-150 ${
                      isRTL ? 'flex-row-reverse' : ''
                    } ${
                      isChildActive
                        ? 'bg-gray-100 text-gray-900 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <ChildIcon size={16} />
                    <span className="text-sm">{child.label}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.path}
        to={item.path}
        onClick={() => setSidebarOpen(false)}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors duration-150 ${
          isRTL ? 'flex-row-reverse' : ''
        } ${
          isActive
            ? 'bg-gray-900 text-white font-medium'
            : 'text-gray-700 hover:bg-gray-50'
        }`}
      >
        <Icon size={18} />
        <span className="text-sm">{item.label}</span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 z-50 w-64 h-screen bg-white transition-transform duration-150 ${
          isRTL 
            ? `right-0 border-l border-blue-200 ${isMobile ? (sidebarOpen ? 'translate-x-0' : 'translate-x-full') : 'translate-x-0'}`
            : `left-0 border-r border-blue-200 ${isMobile ? (sidebarOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}`
        }`}
        style={{
          boxShadow: isRTL ? '-2px 0 8px 0 rgba(0, 0, 0, 0.05)' : '2px 0 8px 0 rgba(0, 0, 0, 0.05)',
        }}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div 
            className="relative flex items-center justify-center h-16 px-4 border-b border-blue-200 bg-blue-50"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 flex items-center justify-center">
                <Logo size="small" />
              </div>
              <span className="text-lg font-semibold text-blue-600">Studify</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className={`absolute lg:hidden p-1.5 text-gray-500 hover:text-gray-700 hover:bg-white/20 rounded-md transition-colors duration-150 ${
                isRTL ? 'left-2 sm:left-3' : 'right-2 sm:right-3'
              }`}
            >
              <X size={18} className="sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
            {menuItems.map((item) => renderMenuItem(item))}
          </nav>

          {/* User Section */}
          <div className="p-3 border-t border-blue-200 bg-blue-50">
            <div className="flex items-center gap-3 mb-2.5 p-2.5 rounded-md bg-white">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium text-sm overflow-hidden flex-shrink-0">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User size={16} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.phone || 'Admin'}
                </p>
                <p className="text-xs text-gray-600 truncate capitalize">
                  {user?.type?.toLowerCase() || 'Admin'}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-md text-sm font-medium transition-colors duration-150 hover:bg-blue-700 ${
                isRTL ? 'flex-row-reverse' : ''
              }`}
            >
              <LogOut size={16} />
              <span>{t('common.logout')}</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={isRTL ? 'lg:pr-64' : 'lg:pl-64'}>
        {/* Top Bar */}
        <header 
          className="sticky top-0 z-30 bg-white border-b border-blue-200"
          style={{
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          }}
        >
          <div className="flex items-center justify-between h-16 px-4 lg:px-6 xl:px-8">
              <button
                onClick={() => setSidebarOpen(true)}
                className={`lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors duration-150 ${
                  isRTL ? 'ml-auto' : ''
                }`}
              >
                <Menu size={20} />
              </button>

            <div className={`flex-1 flex items-center gap-1.5 sm:gap-2 ${
              isRTL ? 'justify-start' : 'justify-end'
            }`}>
              {/* Search */}
              <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-md border border-gray-300 bg-white focus-within:border-gray-900 focus-within:ring-1 focus-within:ring-gray-900 transition-all duration-150">
                <Search size={16} className="text-gray-400" />
                <input
                  type="text"
                  placeholder={t('common.search')}
                  className="bg-transparent outline-none text-sm w-48 lg:w-64 xl:w-80 text-gray-900 placeholder-gray-400"
                />
              </div>

              {/* Language Toggle */}
              <div className="relative" ref={languageDropdownRef}>
                <button
                  onClick={() => setLanguageDropdownOpen(!languageDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                >
                  <Globe size={16} />
                  <span className="text-sm font-medium">{language === 'en' ? 'EN' : 'AR'}</span>
                  <ChevronDown
                    size={14}
                    className={`text-gray-400 transition-transform duration-150 ${languageDropdownOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {languageDropdownOpen && (
                  <div className={`absolute mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden z-50 ${
                    isRTL ? 'left-0' : 'right-0'
                  }`}>
                    <button
                      onClick={() => {
                        setLanguage('en');
                        setLanguageDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-2.5 flex items-center justify-between text-sm transition-colors duration-150 ${
                        isRTL ? 'text-right flex-row-reverse' : 'text-left'
                      } ${
                        language === 'en'
                          ? 'bg-gray-50 text-gray-900 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span>English</span>
                      {language === 'en' && <Check size={16} className="text-gray-900" />}
                    </button>
                    <button
                      onClick={() => {
                        setLanguage('ar');
                        setLanguageDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-2.5 flex items-center justify-between text-sm border-t border-gray-100 transition-colors duration-150 ${
                        isRTL ? 'text-right flex-row-reverse' : 'text-left'
                      } ${
                        language === 'ar'
                          ? 'bg-gray-50 text-gray-900 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span>العربية</span>
                      {language === 'ar' && <Check size={16} className="text-gray-900" />}
                    </button>
                  </div>
                )}
              </div>

              {/* Notifications */}
              <button className="relative p-2 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors duration-150">
                <Bell size={18} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-600 rounded-full"></span>
              </button>

              {/* User Dropdown */}
              <div className="relative" ref={userDropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-2 rounded-md border border-gray-300 bg-white hover:bg-gray-50 transition-colors duration-150"
                >
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 text-xs font-medium overflow-hidden flex-shrink-0">
                    {user?.avatarUrl ? (
                      <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User size={16} />
                    )}
                  </div>
                  <ChevronDown
                    size={14}
                    className={`hidden md:block text-gray-400 transition-transform duration-150 ${userDropdownOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {userDropdownOpen && (
                  <div className={`absolute mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden z-50 ${
                    isRTL ? 'left-0' : 'right-0'
                  }`}>
                    <div className="p-4 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user?.phone || 'Admin'}</p>
                      <p className="text-xs text-gray-500 capitalize mt-0.5">
                        {user?.type?.toLowerCase() || 'Admin'}
                      </p>
                    </div>
                    <div className="py-1">
                      <Link
                        to="/settings"
                        onClick={() => setUserDropdownOpen(false)}
                        className={`flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150 ${
                          isRTL ? 'flex-row-reverse' : ''
                        }`}
                      >
                        <UserCircle size={16} />
                        <span>Profile</span>
                      </Link>
                      <Link
                        to="/settings"
                        onClick={() => setUserDropdownOpen(false)}
                        className={`flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150 ${
                          isRTL ? 'flex-row-reverse' : ''
                        }`}
                      >
                        <Settings size={16} />
                        <span>{t('common.settings')}</span>
                      </Link>
                      <button
                        onClick={() => {
                          handleLogout();
                          setUserDropdownOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150 border-t border-gray-100 mt-1 ${
                          isRTL ? 'flex-row-reverse' : ''
                        }`}
                      >
                        <LogOut size={16} />
                        <span>{t('common.logout')}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 md:p-5 lg:p-6 xl:p-8 max-w-[1920px] mx-auto">
          <div className="container-responsive">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
