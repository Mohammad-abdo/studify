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
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => toggleMenu(item.key)}
            className={`relative w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all duration-300 overflow-hidden group ${
              isActive
                ? 'bg-gradient-to-r from-indigo-500/30 via-purple-500/30 to-pink-500/30 text-indigo-700 font-bold shadow-lg border border-white/40 backdrop-blur-md'
                : 'text-gray-700 hover:bg-white/40 hover:backdrop-blur-md border border-transparent hover:border-white/30 hover:shadow-md'
            }`}
          >
            {/* Hover effect background */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-indigo-500/10 group-hover:via-purple-500/10 group-hover:to-pink-500/10 transition-all duration-300"></div>
            
            <div className="relative z-10 flex items-center gap-3">
              <div className={`p-1.5 rounded-lg transition-all ${
                isActive 
                  ? 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg' 
                  : 'bg-white/50 text-gray-600 group-hover:bg-gradient-to-br group-hover:from-indigo-500 group-hover:to-purple-500 group-hover:text-white group-hover:shadow-md'
              }`}>
                <Icon size={18} />
              </div>
              <span className="font-semibold">{item.label}</span>
            </div>
            <motion.div
              animate={{ rotate: isExpanded ? 90 : 0 }}
              transition={{ duration: 0.3 }}
              className="relative z-10"
            >
              <ChevronRight size={16} className={isActive ? 'text-indigo-600' : 'text-gray-500'} />
            </motion.div>
          </motion.button>
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="pl-4 space-y-1 border-l-2 border-indigo-300/50 ml-6 mt-1">
                  {item.children.map((child, childIndex) => {
                    const ChildIcon = child.icon;
                    const isChildActive = location.pathname === child.path;
                    return (
                      <motion.div
                        key={child.path}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: childIndex * 0.05 }}
                      >
                        <Link
                          to={child.path}
                          onClick={() => setSidebarOpen(false)}
                          className={`relative flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-300 group ${
                            isChildActive
                              ? 'bg-gradient-to-r from-indigo-500/40 to-purple-500/40 text-indigo-700 font-bold shadow-md border-l-4 border-indigo-500 -ml-[2px] backdrop-blur-sm'
                              : 'text-gray-600 hover:bg-white/30 hover:backdrop-blur-sm hover:shadow-sm'
                          }`}
                        >
                          <div className={`p-1 rounded-md transition-all ${
                            isChildActive
                              ? 'bg-indigo-500/20 text-indigo-600'
                              : 'text-gray-500 group-hover:bg-indigo-500/10 group-hover:text-indigo-600'
                          }`}>
                            <ChildIcon size={16} />
                          </div>
                          <span className="text-sm font-medium">{child.label}</span>
                          {isChildActive && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="ml-auto w-2 h-2 rounded-full bg-indigo-500"
                            />
                          )}
                        </Link>
                      </motion.div>
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
          className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 overflow-hidden group ${
            isActive
              ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-bold shadow-2xl scale-[1.02]'
              : 'text-gray-700 hover:bg-white/40 hover:backdrop-blur-md border border-transparent hover:border-white/30 hover:shadow-lg'
          }`}
        >
          {/* Active indicator */}
          {isActive && (
            <motion.div
              layoutId="activeIndicator"
              className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full"
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          )}
          
          {/* Hover gradient effect */}
          <div className={`absolute inset-0 transition-all duration-300 ${
            isActive 
              ? 'bg-gradient-to-r from-indigo-600/100 to-purple-600/100' 
              : 'bg-gradient-to-r from-indigo-500/0 to-purple-500/0 group-hover:from-indigo-500/10 group-hover:to-purple-500/10'
          }`}></div>
          
          <div className={`relative z-10 p-1.5 rounded-lg transition-all ${
            isActive
              ? 'bg-white/20 text-white shadow-lg'
              : 'bg-white/50 text-gray-600 group-hover:bg-gradient-to-br group-hover:from-indigo-500 group-hover:to-purple-500 group-hover:text-white group-hover:shadow-md'
          }`}>
            <Icon size={18} />
          </div>
          <span className="relative z-10 font-semibold">{item.label}</span>
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
        className="fixed top-0 left-0 z-50 w-72 h-screen bg-gradient-to-br from-white/90 via-white/70 to-white/50 backdrop-blur-2xl border-r border-white/40 shadow-2xl"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 50%, rgba(255, 255, 255, 0.5) 100%)',
        }}
      >
        {/* Sidebar Background Pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(99, 102, 241, 0.3) 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}></div>
        </div>

        <div className="flex flex-col h-full relative z-10">
          {/* Logo Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative flex items-center justify-between h-20 px-6 border-b border-white/40 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 backdrop-blur-xl overflow-hidden"
          >
            {/* Animated gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/90 via-purple-600/90 to-pink-600/90 backdrop-blur-sm"></div>
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)',
              backgroundSize: '200% 200%',
              animation: 'shimmer 3s infinite',
            }}></div>
            
            <div className="relative z-10 flex items-center gap-3">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-12 h-12 rounded-xl bg-white/25 backdrop-blur-md flex items-center justify-center p-1.5 shadow-2xl border-2 border-white/40"
              >
                <Logo size="small" />
              </motion.div>
              <span className="text-white font-extrabold text-xl tracking-tight drop-shadow-lg">Studify</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="relative z-10 lg:hidden text-white/90 hover:text-white transition-all p-2 rounded-xl hover:bg-white/20 backdrop-blur-sm"
            >
              <X size={24} />
            </button>
          </motion.div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar-sidebar">
            <div className="space-y-1">
              {menuItems.map((item, index) => renderMenuItem(item, index))}
            </div>
          </nav>

          {/* User Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 border-t border-white/40 bg-gradient-to-br from-white/50 to-white/30 backdrop-blur-xl"
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-3 mb-3 p-3 rounded-xl bg-white/60 backdrop-blur-md border border-white/40 shadow-xl"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-full blur-lg opacity-60 animate-pulse"></div>
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className="relative w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold shadow-2xl overflow-hidden ring-2 ring-white/50"
                >
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <User size={20} />
                  )}
                </motion.div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-extrabold text-gray-900 truncate">
                  {user?.phone || 'Admin'}
                </p>
                <p className="text-xs font-bold text-gray-600 truncate capitalize">
                  {user?.type?.toLowerCase() || 'Admin'}
                </p>
              </div>
            </motion.div>
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: '0 10px 25px rgba(239, 68, 68, 0.3)' }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogout}
              className="relative w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-500 via-rose-500 to-pink-500 text-white rounded-xl transition-all font-bold shadow-xl hover:shadow-2xl overflow-hidden group"
            >
              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <LogOut size={18} className="relative z-10" />
              <span className="relative z-10">Logout</span>
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
