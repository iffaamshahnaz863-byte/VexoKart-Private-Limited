
import React from 'react';
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
import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { OrderProvider } from './context/OrderContext';
import { ProductProvider } from './context/ProductContext';
import { CategoryProvider } from './context/CategoryContext';
import { RecentlyViewedProvider } from './context/RecentlyViewedContext';

// Admin Imports
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminProductFormPage from './pages/admin/AdminProductFormPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminCategoryFormPage from './pages/admin/AdminCategoryFormPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const AdminRoute: React.FC = () => {
  const { user } = useAuth();
  if (!user || user.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }
  return <AdminLayout><Outlet /></AdminLayout>;
};

const AppContent: React.FC = () => {
  const location = useLocation();
  const showBottomNav = !['/checkout', '/login', '/signup'].includes(location.pathname) 
    && !location.pathname.startsWith('/admin') 
    && !location.pathname.startsWith('/order/')
    && !location.pathname.startsWith('/product/');

  return (
    <div className="min-h-screen bg-navy-charcoal text-gray-100 font-sans">
      <main className={showBottomNav ? "pb-20" : ""}>
        <Routes>
          {/* User Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Protected User Routes */}
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><MyOrdersPage /></ProtectedRoute>} />
          <Route path="/order/:id" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
          <Route path="/addresses" element={<ProtectedRoute><ShippingAddressesPage /></ProtectedRoute>} />
          <Route path="/addresses/new" element={<ProtectedRoute><AddressFormPage /></ProtectedRoute>} />
          <Route path="/addresses/edit/:id" element={<ProtectedRoute><AddressFormPage /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
          <Route path="/wishlist" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminRoute />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="products" element={<AdminProductsPage />} />
            <Route path="products/new" element={<AdminProductFormPage />} />
            <Route path="products/edit/:id" element={<AdminProductFormPage />} />
            <Route path="orders" element={<AdminOrdersPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="categories" element={<AdminCategoriesPage />} />
            <Route path="categories/new" element={<AdminCategoryFormPage />} />
            <Route path="categories/edit/:id" element={<AdminCategoryFormPage />} />
          </Route>
        </Routes>
      </main>
      {showBottomNav && <BottomNav />}
    </div>
  );
}

const App: React.FC = () => {
  return (
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
  );
};

export default App;
