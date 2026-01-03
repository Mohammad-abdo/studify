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
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import Logo from '../components/Logo';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [expandedMenus, setExpandedMenus] = useState({});
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);
  const userDropdownRef = useRef(null);
  const languageDropdownRef = useRef(null);
  const { user, logout } = useAuth();
  const { language, toggleLanguage } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
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
            className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              isActive
                ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-700 font-bold border border-white/30 backdrop-blur-sm shadow-lg'
                : 'text-gray-700 hover:bg-white/30 hover:backdrop-blur-sm border border-transparent hover:border-white/20'
            }`}
          >
            <div className="flex items-center gap-3">
              <Icon size={20} className={isActive ? 'text-indigo-600' : 'text-gray-600'} />
              <span>{item.label}</span>
            </div>
            <motion.div
              animate={{ rotate: isExpanded ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronRight size={16} />
            </motion.div>
          </button>
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="pl-4 space-y-1 border-l-2 border-white/30 ml-6">
                  {item.children.map((child) => {
                    const ChildIcon = child.icon;
                    const isChildActive = location.pathname === child.path;
                    return (
                      <Link
                        key={child.path}
                        to={child.path}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-all duration-200 ${
                          isChildActive
                            ? 'bg-gradient-to-r from-indigo-500/30 to-purple-500/30 text-indigo-700 font-bold border-l-2 border-indigo-500 -ml-[2px] backdrop-blur-sm'
                            : 'text-gray-600 hover:bg-white/20 hover:backdrop-blur-sm'
                        }`}
                      >
                        <ChildIcon size={18} />
                        <span className="text-sm">{child.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }

    return (
      <motion.div
        key={item.path}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.02 }}
      >
        <Link
          to={item.path}
          onClick={() => setSidebarOpen(false)}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
            isActive
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold shadow-xl scale-105'
              : 'text-gray-700 hover:bg-white/30 hover:backdrop-blur-sm border border-transparent hover:border-white/20'
          }`}
        >
          <Icon size={20} />
          <span>{item.label}</span>
        </Link>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-2000"></div>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-md z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          x: isMobile ? (sidebarOpen ? 0 : -320) : 0,
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed top-0 left-0 z-50 w-72 h-screen glass-card border-r border-white/30 shadow-2xl backdrop-blur-xl"
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between h-20 px-6 border-b border-white/30 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 backdrop-blur-xl"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center p-1.5 shadow-lg border border-white/30">
                <Logo size="small" />
              </div>
              <span className="text-white font-bold text-lg">Studify</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-white/80 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/20"
            >
              <X size={24} />
            </button>
          </motion.div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
            <div className="space-y-1">
              {menuItems.map((item, index) => renderMenuItem(item, index))}
            </div>
          </nav>

          {/* User Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 border-t border-white/30 glass-card"
          >
            <div className="flex items-center gap-3 mb-3 p-3 rounded-xl glass border border-white/30 shadow-lg">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full blur-md opacity-50"></div>
                <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold shadow-lg overflow-hidden">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <Logo variant="icon" size="small" />
                  )}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">
                  {user?.phone || 'Admin'}
                </p>
                <p className="text-xs font-semibold text-gray-600 truncate capitalize">
                  {user?.type?.toLowerCase() || 'Admin'}
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl transition-all font-bold shadow-lg hover:shadow-xl"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </motion.button>
          </motion.div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="lg:pl-72">
        {/* Top Bar */}
        <motion.header
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className="sticky top-0 z-30 glass-card border-b border-white/30 shadow-2xl backdrop-blur-xl"
        >
          <div className="flex items-center justify-between h-20 px-4 lg:px-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2.5 glass rounded-xl text-gray-700 hover:bg-white/50 transition-all"
            >
              <Menu size={24} />
            </button>

            <div className="flex-1 flex items-center justify-end gap-3">
              {/* Search */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="hidden md:flex items-center gap-3 px-4 py-2.5 glass rounded-xl border border-white/30 focus-within:border-indigo-500/50 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all"
              >
                <Search size={18} className="text-indigo-600" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="bg-transparent outline-none text-sm w-64 placeholder-gray-400 font-medium text-gray-900"
                />
              </motion.div>

              {/* Language Toggle */}
              <div className="relative" ref={languageDropdownRef}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setLanguageDropdownOpen(!languageDropdownOpen)}
                  className="relative p-2.5 glass rounded-xl border border-white/30 text-gray-700 hover:bg-white/50 transition-all flex items-center gap-2"
                >
                  <Globe size={20} className="text-indigo-600" />
                  <span className="font-bold text-sm">{language === 'en' ? 'EN' : 'AR'}</span>
                  <ChevronDown size={16} className={`transition-transform ${languageDropdownOpen ? 'rotate-180' : ''}`} />
                </motion.button>

                <AnimatePresence>
                  {languageDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-40 glass-card rounded-xl border border-white/30 shadow-2xl overflow-hidden backdrop-blur-xl z-50"
                    >
                      <button
                        onClick={() => {
                          if (language !== 'en') toggleLanguage();
                          setLanguageDropdownOpen(false);
                        }}
                        className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-all ${
                          language === 'en'
                            ? 'bg-gradient-to-r from-indigo-500/30 to-purple-500/30 text-indigo-700 font-bold'
                            : 'text-gray-700 hover:bg-white/30'
                        }`}
                      >
                        <Globe size={18} />
                        <span>English</span>
                        {language === 'en' && <span className="ml-auto">✓</span>}
                      </button>
                      <button
                        onClick={() => {
                          if (language !== 'ar') toggleLanguage();
                          setLanguageDropdownOpen(false);
                        }}
                        className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-all border-t border-white/20 ${
                          language === 'ar'
                            ? 'bg-gradient-to-r from-indigo-500/30 to-purple-500/30 text-indigo-700 font-bold'
                            : 'text-gray-700 hover:bg-white/30'
                        }`}
                      >
                        <Globe size={18} />
                        <span>العربية</span>
                        {language === 'ar' && <span className="ml-auto">✓</span>}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Notifications */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative p-2.5 glass rounded-xl border border-white/30 text-gray-700 hover:bg-white/50 transition-all"
              >
                <Bell size={20} className="text-indigo-600" />
                <span className="absolute top-1 right-1 w-3 h-3 bg-gradient-to-r from-red-500 to-rose-500 rounded-full ring-2 ring-white shadow-lg"></span>
              </motion.button>

              {/* User Dropdown */}
              <div className="relative" ref={userDropdownRef}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-3 pl-3 pr-2 py-2 glass rounded-xl border border-white/30 hover:bg-white/50 transition-all"
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full blur-md opacity-50"></div>
                    <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold shadow-lg overflow-hidden">
                      {user?.avatarUrl ? (
                        <img src={user.avatarUrl} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <User size={20} />
                      )}
                    </div>
                  </div>
                  <ChevronDown size={16} className={`text-gray-700 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} />
                </motion.button>

                <AnimatePresence>
                  {userDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-56 glass-card rounded-xl border border-white/30 shadow-2xl overflow-hidden backdrop-blur-xl z-50"
                    >
                      <div className="p-4 border-b border-white/20">
                        <p className="font-bold text-gray-900 text-sm">{user?.phone || 'Admin'}</p>
                        <p className="text-xs font-semibold text-gray-600 capitalize mt-1">{user?.type?.toLowerCase() || 'Admin'}</p>
                      </div>
                      <div className="py-2">
                        <Link
                          to="/settings"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-white/30 transition-all"
                        >
                          <UserCircle size={18} />
                          <span className="font-medium">Profile</span>
                        </Link>
                        <Link
                          to="/settings"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-white/30 transition-all"
                        >
                          <Settings size={18} />
                          <span className="font-medium">Settings</span>
                        </Link>
                        <button
                          onClick={() => {
                            handleLogout();
                            setUserDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50/50 transition-all border-t border-white/20 mt-2"
                        >
                          <LogOut size={18} />
                          <span className="font-bold">Logout</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Page Content */}
        <main className="p-4 lg:p-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>

    </div>
  );
};

export default Layout;
