
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import HomePage from './pages/HomePage.tsx';
import ProductsPage from './pages/ProductsPage.tsx';
import ProductDetailPage from './pages/ProductDetailPage.tsx';
import CartPage from './pages/CartPage.tsx';
import ProfilePage from './pages/ProfilePage.tsx';
import CheckoutPage from './pages/CheckoutPage.tsx';
import LoginPage from './pages/LoginPage.tsx';
import MyOrdersPage from './pages/MyOrdersPage.tsx';
import OrderDetailPage from './pages/OrderDetailPage.tsx';
import OrderSuccessPage from './pages/OrderSuccessPage.tsx';
import BottomNav from './components/BottomNav.tsx';
import SplashScreen from './components/SplashScreen.tsx';
import { CartProvider } from './context/CartContext.tsx';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { OrderProvider } from './context/OrderContext.tsx';
import { ProductProvider } from './context/ProductContext.tsx';
import { CategoryProvider } from './context/CategoryContext.tsx';

// Admin Imports
import AdminLayout from './pages/admin/AdminLayout.tsx';
import AdminDashboardPage from './pages/admin/AdminDashboardPage.tsx';
import AdminProductsPage from './pages/admin/AdminProductsPage.tsx';
import AdminProductFormPage from './pages/admin/AdminProductFormPage.tsx';
import AdminOrdersPage from './pages/admin/AdminOrdersPage.tsx';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage.tsx';
import AdminCategoryFormPage from './pages/admin/AdminCategoryFormPage.tsx';

const AdminRoute: React.FC = () => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  if (!user || user.role !== 'admin') return <Navigate to="/login" replace />;
  return <Outlet />;
};

const AppContent: React.FC = () => {
  const [isInitializing, setIsInitializing] = useState(true);

  if (isInitializing) return <SplashScreen onFinish={() => setIsInitializing(false)} />;

  return (
    <div className="min-h-screen bg-background text-text-main flex flex-col">
      <main className="flex-grow pb-20">
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          
          {/* User Routes */}
          <Route path="/orders" element={<MyOrdersPage />} />
          <Route path="/order/:id" element={<OrderDetailPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-success" element={<OrderSuccessPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          
          {/* Auth */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Admin Panel */}
          <Route path="/admin" element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route index element={<AdminDashboardPage />} />
              <Route path="orders" element={<AdminOrdersPage />} />
              <Route path="products" element={<AdminProductsPage />} />
              <Route path="products/new" element={<AdminProductFormPage />} />
              <Route path="products/edit/:id" element={<AdminProductFormPage />} />
              <Route path="categories" element={<AdminCategoriesPage />} />
              <Route path="categories/new" element={<AdminCategoryFormPage />} />
              <Route path="categories/edit/:id" element={<AdminCategoryFormPage />} />
            </Route>
          </Route>
        </Routes>
      </main>
      <BottomNav />
    </div>
  );
}

const App: React.FC = () => (
  <AuthProvider>
    <CategoryProvider>
      <ProductProvider>
        <CartProvider>
          <OrderProvider>
            <HashRouter>
              <AppContent />
            </HashRouter>
          </OrderProvider>
        </CartProvider>
      </ProductProvider>
    </CategoryProvider>
  </AuthProvider>
);

export default App;
