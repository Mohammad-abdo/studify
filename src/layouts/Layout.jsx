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
  const { language, setLanguage } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

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
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: BookOpen, label: 'Books', path: '/books' },
    { icon: Package, label: 'Products', path: '/products' },
    { icon: ShoppingCart, label: 'Orders', path: '/orders' },
    {
      icon: Users,
      label: 'Users & Profiles',
      key: 'users',
      children: [
        { icon: Users, label: 'All Users', path: '/users' },
        { icon: GraduationCap, label: 'Students', path: '/students' },
        { icon: Stethoscope, label: 'Doctors', path: '/doctors' },
        { icon: Truck, label: 'Delivery', path: '/delivery' },
        { icon: Briefcase, label: 'Customers', path: '/customers' },
      ],
    },
    {
      icon: Shield,
      label: 'RBAC',
      key: 'rbac',
      children: [
        { icon: Shield, label: 'Roles', path: '/roles' },
        { icon: Key, label: 'Permissions', path: '/permissions' },
        { icon: UserCog, label: 'User Roles', path: '/user-roles' },
      ],
    },
    { icon: Building2, label: 'Colleges', path: '/colleges' },
    { icon: GraduationCap, label: 'Departments', path: '/departments' },
    { icon: Tag, label: 'Categories', path: '/categories' },
    {
      icon: DollarSign,
      label: 'Pricing',
      key: 'pricing',
      children: [
        { icon: DollarSign, label: 'Book Pricing', path: '/book-pricing' },
        { icon: Printer, label: 'Print Options', path: '/print-options' },
        { icon: TrendingUp, label: 'Product Pricing', path: '/product-pricing' },
      ],
    },
    { icon: Star, label: 'Reviews', path: '/reviews' },
    {
      icon: FileBarChart,
      label: 'Financial & Reports',
      key: 'financial',
      children: [
        { icon: DollarSign, label: 'Transactions', path: '/financial-transactions' },
        { icon: FileBarChart, label: 'Reports', path: '/reports' },
        { icon: Upload, label: 'Import Logs', path: '/import-logs' },
      ],
    },
    {
      icon: Truck,
      label: 'Delivery Management',
      key: 'delivery',
      children: [
        { icon: ClipboardList, label: 'Assignments', path: '/delivery-assignments' },
        { icon: Wallet, label: 'Wallets', path: '/delivery-wallets' },
        { icon: MapPin, label: 'Locations', path: '/delivery-locations' },
      ],
    },
    { icon: ArrowRight, label: 'Onboarding', path: '/onboarding' },
    { icon: FileText, label: 'Static Pages', path: '/static-pages' },
    { icon: UserCheck, label: 'Approvals', path: '/approvals' },
    { icon: BarChart3, label: 'Dashboard Metrics', path: '/dashboard-metrics' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const renderMenuItem = (item, index) => {
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
            <div className="flex items-center gap-2 sm:gap-3">
              <Icon size={16} className={`sm:w-[18px] sm:h-[18px] ${isActive ? 'text-gray-900' : 'text-gray-600'}`} />
              <span className="text-xs sm:text-sm">{item.label}</span>
            </div>
            <ChevronRight
              size={14}
              className={`text-gray-400 transition-transform duration-150 sm:w-4 sm:h-4 ${isExpanded ? 'rotate-90' : ''}`}
            />
          </button>
          {isExpanded && (
            <div className="pl-4 space-y-0.5 border-l border-gray-200 ml-3">
              {item.children.map((child) => {
                const ChildIcon = child.icon;
                const isChildActive = location.pathname === child.path;
                return (
                  <Link
                    key={child.path}
                    to={child.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md transition-colors duration-150 ${
                      isChildActive
                        ? 'bg-gray-100 text-gray-900 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <ChildIcon size={14} className="sm:w-4 sm:h-4" />
                    <span className="text-xs sm:text-sm">{child.label}</span>
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
        className={`flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 sm:py-2.5 rounded-md transition-colors duration-150 ${
          isActive
            ? 'bg-gray-900 text-white font-medium'
            : 'text-gray-700 hover:bg-gray-50'
        }`}
      >
        <Icon size={16} className="sm:w-[18px] sm:h-[18px]" />
        <span className="text-xs sm:text-sm">{item.label}</span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 w-56 sm:w-64 h-screen border-r border-white/30 transition-transform duration-150 ${
          isMobile ? (sidebarOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'
        }`}
        style={{
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(16px) saturate(180%)',
          WebkitBackdropFilter: 'blur(16px) saturate(180%)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37), inset 0 0 0 1px rgba(255, 255, 255, 0.3)',
        }}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div 
            className="flex items-center justify-between h-14 sm:h-16 px-3 sm:px-4 border-b border-white/30"
            style={{
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.3), rgba(118, 75, 162, 0.3))',
            }}
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center">
                <Logo size="small" />
              </div>
              <span className="text-base sm:text-lg font-semibold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">Studify</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors duration-150"
            >
              <X size={18} className="sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 sm:px-3 py-3 sm:py-4 space-y-0.5 sm:space-y-1 overflow-y-auto custom-scrollbar">
            {menuItems.map((item, index) => renderMenuItem(item, index))}
          </nav>

          {/* User Section */}
          <div className="p-2.5 sm:p-3 border-t border-white/20">
            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-2.5 p-2 sm:p-2.5 rounded-md" style={{ background: 'rgba(255, 255, 255, 0.3)', backdropFilter: 'blur(8px)' }}>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-medium text-xs sm:text-sm overflow-hidden flex-shrink-0 shadow-md">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User size={14} className="sm:w-4 sm:h-4" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                  {user?.phone || 'Admin'}
                </p>
                <p className="text-xs text-gray-600 truncate capitalize">
                  {user?.type?.toLowerCase() || 'Admin'}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 text-white rounded-md text-xs sm:text-sm md:text-base font-medium transition-colors duration-150"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                boxShadow: '0 2px 8px 0 rgba(102, 126, 234, 0.3)',
              }}
            >
              <LogOut size={14} className="sm:w-4 sm:h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-56 xl:pl-64">
        {/* Top Bar */}
        <header 
          className="sticky top-0 z-30 border-b border-white/30"
          style={{
            background: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(16px) saturate(180%)',
            WebkitBackdropFilter: 'blur(16px) saturate(180%)',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
          }}
        >
          <div className="flex items-center justify-between h-14 sm:h-16 px-3 sm:px-4 lg:px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors duration-150"
            >
              <Menu size={20} />
            </button>

            <div className="flex-1 flex items-center justify-end gap-1.5 sm:gap-2">
              {/* Search */}
              <div className="hidden md:flex items-center gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md border border-gray-300 bg-white focus-within:border-gray-900 focus-within:ring-1 focus-within:ring-gray-900 transition-all duration-150">
                <Search size={14} className="sm:w-4 sm:h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="bg-transparent outline-none text-xs sm:text-sm w-40 sm:w-48 lg:w-64 text-gray-900 placeholder-gray-400"
                />
              </div>

              {/* Language Toggle */}
              <div className="relative" ref={languageDropdownRef}>
                <button
                  onClick={() => setLanguageDropdownOpen(!languageDropdownOpen)}
                  className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                >
                  <Globe size={14} className="sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm font-medium">{language === 'en' ? 'EN' : 'AR'}</span>
                  <ChevronDown
                    size={12}
                    className={`text-gray-400 transition-transform duration-150 sm:w-3.5 sm:h-3.5 ${languageDropdownOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {languageDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden z-50">
                    <button
                      onClick={() => {
                        setLanguage('en');
                        setLanguageDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-2.5 text-left flex items-center justify-between text-sm transition-colors duration-150 ${
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
                      className={`w-full px-4 py-2.5 text-left flex items-center justify-between text-sm border-t border-gray-100 transition-colors duration-150 ${
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
              <button className="relative p-1.5 sm:p-2 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors duration-150">
                <Bell size={16} className="sm:w-[18px] sm:h-[18px]" />
                <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-600 rounded-full"></span>
              </button>

              {/* User Dropdown */}
              <div className="relative" ref={userDropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-1.5 sm:gap-2 pl-1.5 sm:pl-2 pr-2 sm:pr-3 py-1.5 sm:py-2 rounded-md border border-gray-300 bg-white hover:bg-gray-50 transition-colors duration-150"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 text-xs font-medium overflow-hidden flex-shrink-0">
                    {user?.avatarUrl ? (
                      <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User size={14} className="sm:w-4 sm:h-4" />
                    )}
                  </div>
                  <ChevronDown
                    size={12}
                    className={`hidden sm:block text-gray-400 transition-transform duration-150 w-3.5 h-3.5 ${userDropdownOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden z-50">
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
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                      >
                        <UserCircle size={16} />
                        <span>Profile</span>
                      </Link>
                      <Link
                        to="/settings"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                      >
                        <Settings size={16} />
                        <span>Settings</span>
                      </Link>
                      <button
                        onClick={() => {
                          handleLogout();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150 border-t border-gray-100 mt-1"
                      >
                        <LogOut size={16} />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-2.5 sm:p-3 md:p-4 lg:p-5 xl:p-6 max-w-[1920px] mx-auto">
          <div className="container-responsive">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
