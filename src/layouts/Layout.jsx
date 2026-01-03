import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import Logo from '../components/Logo';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [expandedMenus, setExpandedMenus] = useState({});
  const { user, logout } = useAuth();
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
            className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              isActive
                ? 'bg-primary-50 text-primary-600 font-medium'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <Icon size={20} />
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
                <div className="pl-4 space-y-1 border-l-2 border-gray-200 ml-6">
                  {item.children.map((child) => {
                    const ChildIcon = child.icon;
                    const isChildActive = location.pathname === child.path;
                    return (
                      <Link
                        key={child.path}
                        to={child.path}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors duration-200 ${
                          isChildActive
                            ? 'bg-primary-50 text-primary-600 font-medium border-l-2 border-primary-600 -ml-[2px]'
                            : 'text-gray-600 hover:bg-gray-50'
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
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
            isActive
              ? 'bg-primary-600 text-white font-medium shadow-md'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <Icon size={20} />
          <span>{item.label}</span>
        </Link>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden backdrop-blur-sm"
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
        className="fixed top-0 left-0 z-50 w-72 h-screen bg-white shadow-2xl border-r border-gray-200"
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between h-20 px-6 border-b border-gray-200 bg-gradient-to-r from-primary-600 to-primary-700"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-black/30 backdrop-blur-sm flex items-center justify-center p-1.5">
                <Logo size="small" />
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-white/80 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </motion.div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
            {menuItems.map((item, index) => renderMenuItem(item, index))}
          </nav>

          {/* User Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 border-t border-gray-200 bg-gray-50"
          >
            <div className="flex items-center gap-3 mb-3 p-3 rounded-lg bg-white shadow-sm">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-semibold shadow-md overflow-hidden">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <Logo variant="icon" size="small" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user?.phone || 'Admin'}
                </p>
                <p className="text-xs text-gray-500 truncate capitalize">
                  {user?.type?.toLowerCase() || 'Admin'}
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors font-medium"
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
          className="bg-white shadow-md sticky top-0 z-30 backdrop-blur-lg bg-white/95 border-b border-gray-200"
        >
          <div className="flex items-center justify-between h-20 px-4 lg:px-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu size={24} />
            </button>

            <div className="flex-1 flex items-center justify-end gap-4">
              {/* Search */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="hidden md:flex items-center gap-3 px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-200 transition-all"
              >
                <Search size={18} className="text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="bg-transparent outline-none text-sm w-64 placeholder-gray-400"
                />
              </motion.div>

              {/* Notifications */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <Bell size={20} />
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white"></span>
              </motion.button>

              {/* User Avatar */}
              <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-sm font-semibold shadow-md cursor-pointer hover:shadow-lg transition-shadow overflow-hidden">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <Logo variant="icon" size="small" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Page Content */}
        <main className="p-4 lg:p-8">
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
