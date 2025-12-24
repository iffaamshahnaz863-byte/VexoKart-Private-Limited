
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
import ShippingAddressesPage from './pages/ShippingAddressesPage';
import AddressFormPage from './pages/AddressFormPage';
import BottomNav from './components/BottomNav';
import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { OrderProvider } from './context/OrderContext';
import { ProductProvider } from './context/ProductContext';

// Admin Imports
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminProductFormPage from './pages/admin/AdminProductFormPage';

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
  const showBottomNav = !['/checkout', '/login', '/signup'].includes(location.pathname) && !location.pathname.startsWith('/admin');

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
          <Route path="/addresses" element={<ProtectedRoute><ShippingAddressesPage /></ProtectedRoute>} />
          <Route path="/addresses/new" element={<ProtectedRoute><AddressFormPage /></ProtectedRoute>} />
          <Route path="/addresses/edit/:id" element={<ProtectedRoute><AddressFormPage /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminRoute />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="products" element={<AdminProductsPage />} />
            <Route path="products/new" element={<AdminProductFormPage />} />
            <Route path="products/edit/:id" element={<AdminProductFormPage />} />
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
        <CartProvider>
          <OrderProvider>
            <HashRouter>
              <AppContent />
            </HashRouter>
          </OrderProvider>
        </CartProvider>
      </ProductProvider>
    </AuthProvider>
  );
};

export default App;
