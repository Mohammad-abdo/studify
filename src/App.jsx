import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './layouts/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Books from './pages/Books';
import AddBook from './pages/AddBook';
import EditBook from './pages/EditBook';
import Products from './pages/Products';
import AddProduct from './pages/AddProduct';
import EditProduct from './pages/EditProduct';
import Orders from './pages/Orders';
import Users from './pages/Users';
import UserDetail from './pages/UserDetail';
import EditUser from './pages/EditUser';
import Settings from './pages/Settings';
import PendingApprovals from './pages/PendingApprovals';
import Colleges from './pages/Colleges';
import AddCollege from './pages/AddCollege';
import EditCollege from './pages/EditCollege';
import Departments from './pages/Departments';
import AddDepartment from './pages/AddDepartment';
import EditDepartment from './pages/EditDepartment';
import Categories from './pages/Categories';
import AddCategory from './pages/AddCategory';
import EditCategory from './pages/EditCategory';
import Reviews from './pages/Reviews';
import BookDetail from './pages/BookDetail';
import ProductDetail from './pages/ProductDetail';
import Onboarding from './pages/Onboarding';
import AddOnboarding from './pages/AddOnboarding';
import EditOnboarding from './pages/EditOnboarding';
import StaticPages from './pages/StaticPages';
import AddStaticPage from './pages/AddStaticPage';
import EditStaticPage from './pages/EditStaticPage';
// RBAC
import Roles from './pages/Roles';
import AddRole from './pages/AddRole';
import EditRole from './pages/EditRole';
import Permissions from './pages/Permissions';
import AddPermission from './pages/AddPermission';
import EditPermission from './pages/EditPermission';
import UserRoles from './pages/UserRoles';
import AddUserRole from './pages/AddUserRole';
// Profiles
import Students from './pages/Students';
import Doctors from './pages/Doctors';
import DoctorDetail from './pages/DoctorDetail';
import Customers from './pages/Customers';
import Delivery from './pages/Delivery';
import PrintCenters from './pages/PrintCenters';
import PrintCenterForm from './pages/PrintCenterForm';
import PrintCenterDetail from './pages/PrintCenterDetail';
// Pricing
import BookPricing from './pages/BookPricing';
import PrintOptions from './pages/PrintOptions';
import ProductPricing from './pages/ProductPricing';
// Financial & Reports
import FinancialTransactions from './pages/FinancialTransactions';
import Reports from './pages/Reports';
import ImportLogs from './pages/ImportLogs';
// Delivery
import DeliveryAssignments from './pages/DeliveryAssignments';
import DeliveryWallets from './pages/DeliveryWallets';
import DeliveryLocations from './pages/DeliveryLocations';
// Dashboard
import DashboardMetrics from './pages/DashboardMetrics';
import Sliders from './pages/Sliders';
// Materials
import Materials from './pages/Materials';
import AddMaterial from './pages/AddMaterial';
import EditMaterial from './pages/EditMaterial';
import MaterialDetail from './pages/MaterialDetail';
// Order & Print Option Details
import OrderDetail from './pages/OrderDetail';
import OrderTracking from './pages/OrderTracking';
import PrintOptionDetail from './pages/PrintOptionDetail';
import AddPrintOption from './pages/AddPrintOption';
// General Pages
import NotFound from './pages/NotFound';
import Unauthorized from './pages/Unauthorized';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { SocketProvider } from './context/SocketContext';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Authenticating Terminal...</p>
        </div>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <SocketProvider>
          <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#fff',
                color: '#333',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              },
              success: {
                iconTheme: {
                  primary: '#14b8a6',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="books" element={<Books />} />
              <Route path="books/add" element={<AddBook />} />
              <Route path="books/edit/:id" element={<EditBook />} />
              <Route path="books/:id" element={<BookDetail />} />
              <Route path="products" element={<Products />} />
              <Route path="products/add" element={<AddProduct />} />
              <Route path="products/edit/:id" element={<EditProduct />} />
              <Route path="products/:id" element={<ProductDetail />} />
              <Route path="orders" element={<Orders />} />
              <Route path="orders/:id" element={<OrderDetail />} />
              <Route path="orders/:id/track" element={<OrderTracking />} />
              <Route path="users/edit/:id" element={<EditUser />} />
              <Route path="users/:id" element={<UserDetail />} />
              <Route path="users" element={<Users />} />
              <Route path="approvals" element={<PendingApprovals />} />
              <Route path="colleges" element={<Colleges />} />
              <Route path="colleges/add" element={<AddCollege />} />
              <Route path="colleges/edit/:id" element={<EditCollege />} />
              <Route path="departments" element={<Departments />} />
              <Route path="departments/add" element={<AddDepartment />} />
              <Route path="departments/edit/:id" element={<EditDepartment />} />
              <Route path="categories" element={<Categories />} />
              <Route path="categories/add" element={<AddCategory />} />
              <Route path="categories/edit/:type/:id" element={<EditCategory />} />
              <Route path="reviews" element={<Reviews />} />
              <Route path="onboarding" element={<Onboarding />} />
              <Route path="onboarding/add" element={<AddOnboarding />} />
              <Route path="onboarding/edit/:id" element={<EditOnboarding />} />
              <Route path="static-pages" element={<StaticPages />} />
              <Route path="static-pages/add" element={<AddStaticPage />} />
              <Route path="static-pages/edit/:id" element={<EditStaticPage />} />
              {/* RBAC */}
              <Route path="roles" element={<Roles />} />
              <Route path="roles/add" element={<AddRole />} />
              <Route path="roles/edit/:id" element={<EditRole />} />
              <Route path="permissions" element={<Permissions />} />
              <Route path="permissions/add" element={<AddPermission />} />
              <Route path="permissions/edit/:id" element={<EditPermission />} />
              <Route path="user-roles" element={<UserRoles />} />
              <Route path="user-roles/add" element={<AddUserRole />} />
              {/* Profiles */}
              <Route path="students" element={<Students />} />
              <Route path="doctors" element={<Doctors />} />
              <Route path="doctors/:id" element={<DoctorDetail />} />
              <Route path="customers" element={<Customers />} />
              <Route path="delivery" element={<Delivery />} />
              <Route path="print-centers" element={<PrintCenters />} />
              <Route path="print-centers/add" element={<PrintCenterForm />} />
              <Route path="print-centers/edit/:id" element={<PrintCenterForm />} />
              <Route path="print-centers/:id" element={<PrintCenterDetail />} />
              {/* Materials */}
              <Route path="materials" element={<Materials />} />
              <Route path="materials/add" element={<AddMaterial />} />
              <Route path="materials/edit/:id" element={<EditMaterial />} />
              <Route path="materials/:id" element={<MaterialDetail />} />
              {/* Pricing */}
              <Route path="book-pricing" element={<BookPricing />} />
              <Route path="print-options" element={<PrintOptions />} />
              <Route path="print-options/add" element={<AddPrintOption />} />
              <Route path="print-options/edit/:id" element={<PrintOptionDetail />} />
              <Route path="print-options/:id" element={<PrintOptionDetail />} />
              <Route path="product-pricing" element={<ProductPricing />} />
              {/* Financial & Reports */}
              <Route path="financial-transactions" element={<FinancialTransactions />} />
              <Route path="reports" element={<Reports />} />
              <Route path="import-logs" element={<ImportLogs />} />
              {/* Delivery */}
              <Route path="delivery-assignments" element={<DeliveryAssignments />} />
              <Route path="delivery-wallets" element={<DeliveryWallets />} />
              <Route path="delivery-locations" element={<DeliveryLocations />} />
              {/* Dashboard */}
              <Route path="dashboard-metrics" element={<DashboardMetrics />} />
              <Route path="sliders" element={<Sliders />} />
              <Route path="settings" element={<Settings />} />
              {/* General Pages */}
              <Route path="unauthorized" element={<Unauthorized />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Router>
        </SocketProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;