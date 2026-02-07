
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
import { VendorProvider } from './context/VendorContext.tsx';
import { AdminCodeProvider } from './context/AdminCodeContext.tsx';
import { BannerProvider } from './context/BannerContext.tsx';
import { ServiceAreaProvider } from './context/ServiceAreaContext.tsx';
import { RecentlyViewedProvider } from './context/RecentlyViewedContext.tsx';
import { ReviewProvider } from './context/ReviewContext.tsx';
import { LocationProvider } from './context/LocationContext.tsx';
import MenuPage from './pages/MenuPage.tsx';
import WishlistPage from './pages/WishlistPage.tsx';
import ShippingAddressesPage from './pages/ShippingAddressesPage.tsx';
import AddressFormPage from './pages/AddressFormPage.tsx';
import CancelOrderPage from './pages/CancelOrderPage.tsx';
import HelpPage from './pages/HelpPage.tsx';
import AboutUsPage from './pages/AboutUsPage.tsx';
import ContactUsPage from './pages/ContactUsPage.tsx';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage.tsx';
import DailyNeedsPage from './pages/DailyNeedsPage.tsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.tsx';
import UpdatePasswordPage from './pages/UpdatePasswordPage.tsx';

// Admin Imports
import AdminLayout from './pages/admin/AdminLayout.tsx';
import AdminDashboardPage from './pages/admin/AdminDashboardPage.tsx';
import AdminProductsPage from './pages/admin/AdminProductsPage.tsx';
import AdminProductFormPage from './pages/admin/AdminProductFormPage.tsx';
import AdminOrdersPage from './pages/admin/AdminOrdersPage.tsx';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage.tsx';
import AdminCategoryFormPage from './pages/admin/AdminCategoryFormPage.tsx';
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage.tsx';
import AdminPincodesPage from './pages/admin/AdminPincodesPage.tsx';
import AdminVendorsPage from './pages/admin/AdminVendorsPage.tsx';
import AdminPayoutsPage from './pages/admin/AdminPayoutsPage.tsx';
import AdminMarketingPage from './pages/admin/AdminBannersPage.tsx'; // Renamed for clarity
import AdminAuditLogsPage from './pages/admin/AdminAuditLogsPage.tsx';
import AdminApprovalsPage from './pages/admin/AdminApprovalsPage.tsx';
import AdminUsersPage from './pages/admin/AdminUsersPage.tsx';
import AdminCodesPage from './pages/admin/AdminCodesPage.tsx';
import AdminNotificationsPage from './pages/admin/AdminNotificationsPage.tsx';


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
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/daily" element={<DailyNeedsPage />} />
          
          {/* User Routes */}
          <Route path="/orders" element={<MyOrdersPage />} />
          <Route path="/order/:id" element={<OrderDetailPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-success" element={<OrderSuccessPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/addresses" element={<ShippingAddressesPage />} />
          <Route path="/addresses/new" element={<AddressFormPage />} />
          <Route path="/addresses/edit/:id" element={<AddressFormPage />} />
          <Route path="/cancel-order/:id" element={<CancelOrderPage />} />
          
          {/* Auth */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/update-password" element={<UpdatePasswordPage />} />
          
          {/* Static Pages */}
          <Route path="/help" element={<HelpPage />} />
          <Route path="/about-us" element={<AboutUsPage />} />
          <Route path="/contact-us" element={<ContactUsPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          
          {/* Admin Panel */}
          <Route path="/admin" element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route index element={<AdminDashboardPage />} />
              <Route path="analytics" element={<AdminAnalyticsPage />} />
              <Route path="pincodes" element={<AdminPincodesPage />} />
              <Route path="vendors" element={<AdminVendorsPage />} />
              <Route path="orders" element={<AdminOrdersPage />} />
              <Route path="payouts" element={<AdminPayoutsPage />} />
              <Route path="marketing" element={<AdminMarketingPage />} />
              <Route path="products" element={<AdminProductsPage />} />
              <Route path="products/new" element={<AdminProductFormPage />} />
              <Route path="products/edit/:id" element={<AdminProductFormPage />} />
              <Route path="categories" element={<AdminCategoriesPage />} />
              <Route path="categories/new" element={<AdminCategoryFormPage />} />
              <Route path="categories/edit/:id" element={<AdminCategoryFormPage />} />
              <Route path="audit" element={<AdminAuditLogsPage />} />
              <Route path="approvals" element={<AdminApprovalsPage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="codes" element={<AdminCodesPage />} />
              <Route path="notifications" element={<AdminNotificationsPage />} />
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
    <ServiceAreaProvider>
     <LocationProvider>
      <CategoryProvider>
        <VendorProvider>
         <ProductProvider>
          <CartProvider>
            <AdminCodeProvider>
             <BannerProvider>
              <RecentlyViewedProvider>
                <ReviewProvider>
                  <OrderProvider>
                    <HashRouter>
                      <AppContent />
                    </HashRouter>
                  </OrderProvider>
                </ReviewProvider>
              </RecentlyViewedProvider>
             </BannerProvider>
            </AdminCodeProvider>
          </CartProvider>
         </ProductProvider>
        </VendorProvider>
      </CategoryProvider>
     </LocationProvider>
    </ServiceAreaProvider>
  </AuthProvider>
);

export default App;
