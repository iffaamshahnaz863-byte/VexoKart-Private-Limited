
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation, Navigate, Outlet } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import ProfilePage from './pages/ProfilePage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import MyOrdersPage from './pages/MyOrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import ShippingAddressesPage from './pages/ShippingAddressesPage';
import AddressFormPage from './pages/AddressFormPage';
import WishlistPage from './pages/WishlistPage';
import BottomNav from './components/BottomNav';
import SplashScreen from './components/SplashScreen';
import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { OrderProvider } from './context/OrderContext';
import { ProductProvider } from './context/ProductContext';
import { CategoryProvider } from './context/CategoryContext';
import { RecentlyViewedProvider } from './context/RecentlyViewedContext';
import { VendorProvider, useVendors } from './context/VendorContext';
import { AdminCodeProvider } from './context/AdminCodeContext';

// Auth Pages
import VendorSignupPage from './pages/VendorSignupPage';

// Super Admin Imports
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminProductFormPage from './pages/admin/AdminProductFormPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminCategoryFormPage from './pages/admin/AdminCategoryFormPage';
import AdminVendorsPage from './pages/admin/AdminVendorsPage';
import AdminCodesPage from './pages/admin/AdminCodesPage';

// Vendor Imports
import VendorLayout from './pages/vendor/VendorLayout';
import VendorDashboardPage from './pages/vendor/VendorDashboardPage';
import VendorProductsPage from './pages/vendor/VendorProductsPage';
import VendorProductFormPage from './pages/vendor/VendorProductFormPage';
import VendorOrdersPage from './pages/vendor/VendorOrdersPage';
import VendorProfilePage from './pages/vendor/VendorProfilePage';
import VendorStatusPage from './pages/vendor/VendorStatusPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const SuperAdminRoute: React.FC = () => {
  const { user } = useAuth();
  if (!user || user.role !== 'SUPER_ADMIN') {
    return <Navigate to="/" replace />;
  }
  return <AdminLayout><Outlet /></AdminLayout>;
};

const VendorApprovalGate: React.FC = () => {
    const { user } = useAuth();
    const { getVendorByUserId } = useVendors();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    const vendor = getVendorByUserId(user.email);
    
    if (!vendor) {
        return <div className="min-h-screen flex items-center justify-center bg-background text-text-main"><p>Loading vendor data...</p></div>;
    }

    if (vendor.status === 'approved') {
        return <VendorLayout><Outlet /></VendorLayout>;
    }
    
    // For 'pending', 'rejected', 'suspended' statuses, show the dedicated status page.
    return <VendorStatusPage vendor={vendor} />;
};


const VendorRoute: React.FC = () => {
    const { user } = useAuth();
    if(!user || user.role !== 'VENDOR') {
        return <Navigate to="/" replace />;
    }
    return <VendorApprovalGate />;
}

const AppContent: React.FC = () => {
  const [isInitializing, setIsInitializing] = useState(true);
  const location = useLocation();
  const isAuthPage = ['/login', '/signup', '/vendor/signup'].includes(location.pathname);
  const isAdminPage = location.pathname.startsWith('/admin');
  const isVendorPage = location.pathname.startsWith('/vendor');
  
  const showBottomNav = !isInitializing && !isAuthPage && !isAdminPage && !isVendorPage && !['/checkout'].includes(location.pathname) && !location.pathname.startsWith('/order/') && !location.pathname.startsWith('/product/');

  if (isInitializing) {
    return <SplashScreen onFinish={() => setIsInitializing(false)} />;
  }

  return (
    <div className="min-h-screen bg-background text-text-secondary font-sans animate-in fade-in duration-700">
      <main className={showBottomNav ? "pb-20" : ""}>
        <Routes>
          {/* User Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/vendor/signup" element={<VendorSignupPage />} />

          {/* Protected User Routes */}
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><MyOrdersPage /></ProtectedRoute>} />
          <Route path="/order/:id" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
          <Route path="/addresses" element={<ProtectedRoute><ShippingAddressesPage /></ProtectedRoute>} />
          <Route path="/addresses/new" element={<ProtectedRoute><AddressFormPage /></ProtectedRoute>} />
          <Route path="/addresses/edit/:id" element={<ProtectedRoute><AddressFormPage /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
          <Route path="/wishlist" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
          
          {/* Super Admin Routes */}
          <Route path="/admin" element={<SuperAdminRoute />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="products" element={<AdminProductsPage />} />
            <Route path="products/edit/:id" element={<AdminProductFormPage />} />
            <Route path="orders" element={<AdminOrdersPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="categories" element={<AdminCategoriesPage />} />
            <Route path="categories/new" element={<AdminCategoryFormPage />} />
            <Route path="categories/edit/:id" element={<AdminCategoryFormPage />} />
            <Route path="vendors" element={<AdminVendorsPage />} />
            <Route path="codes" element={<AdminCodesPage />} />
          </Route>

          {/* Vendor Routes */}
           <Route path="/vendor" element={<VendorRoute />}>
            <Route index element={<VendorDashboardPage />} />
            <Route path="products" element={<VendorProductsPage />} />
            <Route path="products/new" element={<VendorProductFormPage />} />
            <Route path="products/edit/:id" element={<VendorProductFormPage />} />
            <Route path="orders" element={<VendorOrdersPage />} />
            <Route path="profile" element={<VendorProfilePage />} />
          </Route>

        </Routes>
      </main>
      {showBottomNav && <BottomNav />}
    </div>
  );
}

const App: React.FC = () => {
  return (
    <AdminCodeProvider>
      <VendorProvider>
        <AuthProvider>
          <ProductProvider>
            <CategoryProvider>
              <CartProvider>
                <OrderProvider>
                  <RecentlyViewedProvider>
                    <HashRouter>
                      <AppContent />
                    </HashRouter>
                  </RecentlyViewedProvider>
                </OrderProvider>
              </CartProvider>
            </CategoryProvider>
          </ProductProvider>
        </AuthProvider>
      </VendorProvider>
    </AdminCodeProvider>
  );
};

export default App;
