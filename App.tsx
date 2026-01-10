
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation, Navigate, Outlet } from 'react-router-dom';
import HomePage from './pages/HomePage.tsx';
import LandingPage from './pages/LandingPage.tsx'; // New Landing Page
import DailyNeedsPage from './pages/DailyNeedsPage.tsx'; // New Daily Needs Page
import ProductsPage from './pages/ProductsPage.tsx';
import ProductDetailPage from './pages/ProductDetailPage.tsx';
import CartPage from './pages/CartPage.tsx';
import ProfilePage from './pages/ProfilePage.tsx';
import CheckoutPage from './pages/CheckoutPage.tsx';
import LoginPage from './pages/LoginPage.tsx';
import SignupPage from './pages/SignupPage.tsx';
import MyOrdersPage from './pages/MyOrdersPage.tsx';
import OrderDetailPage from './pages/OrderDetailPage.tsx';
import OrderSuccessPage from './pages/OrderSuccessPage.tsx';
import ShippingAddressesPage from './pages/ShippingAddressesPage.tsx';
import AddressFormPage from './pages/AddressFormPage.tsx';
import WishlistPage from './pages/WishlistPage.tsx';
import NotificationsPage from './pages/NotificationsPage.tsx';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage.tsx';
import AboutUsPage from './pages/AboutUsPage.tsx';
import ContactUsPage from './pages/ContactUsPage.tsx';
import HelpPage from './pages/HelpPage.tsx';
import SafeShoppingPage from './pages/blog/SafeShoppingPage.tsx';
import ProductQualityPage from './pages/blog/ProductQualityPage.tsx';
import EcommerceIndiaPage from './pages/blog/EcommerceIndiaPage.tsx';
import BuyingGuidePage from './pages/blog/BuyingGuidePage.tsx';
import BottomNav from './components/BottomNav.tsx';
import Footer from './components/Footer.tsx';
import SplashScreen from './components/SplashScreen.tsx';
import ShippingLabelPreviewModal from './components/ShippingLabelPreviewModal.tsx';
import { CartProvider } from './context/CartContext.tsx';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { OrderProvider } from './context/OrderContext.tsx';
import { ProductProvider } from './context/ProductContext.tsx';
import { CategoryProvider } from './context/CategoryContext.tsx';
import { RecentlyViewedProvider } from './context/RecentlyViewedContext.tsx';
import { VendorProvider } from './context/VendorContext.tsx';
import { AdminCodeProvider } from './context/AdminCodeContext.tsx';
import { BannerProvider } from './context/BannerContext.tsx';
import { NotificationProvider } from './context/NotificationContext.tsx';
import { ReviewProvider } from './context/ReviewContext.tsx';
import { LocationProvider } from './context/LocationContext.tsx'; // NEW
import VendorSignupPage from './pages/VendorSignupPage.tsx';
import AdminLayout from './pages/admin/AdminLayout.tsx';
import AdminDashboardPage from './pages/admin/AdminDashboardPage.tsx';
import AdminProductsPage from './pages/admin/AdminProductsPage.tsx';
import AdminProductFormPage from './pages/admin/AdminProductFormPage.tsx';
import AdminOrdersPage from './pages/admin/AdminOrdersPage.tsx';
import AdminUsersPage from './pages/admin/AdminUsersPage.tsx';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage.tsx';
import AdminCategoryFormPage from './pages/admin/AdminCategoryFormPage.tsx';
import AdminVendorsPage from './pages/admin/AdminVendorsPage.tsx';
import AdminCodesPage from './pages/admin/AdminCodesPage.tsx';
import AdminBannersPage from './pages/admin/AdminBannersPage.tsx';
import AdminNotificationsPage from './pages/admin/AdminNotificationsPage.tsx';
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage.tsx';
import AdminPayoutsPage from './pages/admin/AdminPayoutsPage.tsx';
import AdminAuditLogsPage from './pages/admin/AdminAuditLogsPage.tsx';
import VendorLayout from './pages/vendor/VendorLayout.tsx';
import VendorDashboardPage from './pages/vendor/VendorDashboardPage.tsx';
import VendorProductsPage from './pages/vendor/VendorProductsPage.tsx';
import VendorProductFormPage from './pages/vendor/VendorProductFormPage.tsx';
import VendorOrdersPage from './pages/vendor/VendorOrdersPage.tsx';
import VendorOrderDetailPage from './pages/vendor/VendorOrderDetailPage.tsx';
import VendorWalletPage from './pages/vendor/VendorWalletPage.tsx';
import VendorProfilePage from './pages/vendor/VendorProfilePage.tsx';
import CourierScanPage from './pages/CourierScanPage.tsx';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const AdminRoute: React.FC = () => {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
        <h1 className="text-4xl font-black text-red-500 mb-4 uppercase italic">Access Denied</h1>
        <p className="text-text-secondary mb-8 font-medium">This section is restricted to Platform Administrators.</p>
        <button onClick={() => window.location.href = '#/'} className="bg-accent text-white font-black uppercase tracking-widest text-[10px] py-3 px-8 rounded-xl">Return Home</button>
      </div>
    );
  }
  return <AdminLayout><Outlet /></AdminLayout>;
};

const VendorRoute: React.FC = () => {
    const { user, isLoading } = useAuth();
    if (isLoading) return null;
    if (!user) {
      return <Navigate to="/login" replace />;
    }
    if (user.role !== 'vendor') {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
          <h1 className="text-4xl font-black text-red-500 mb-4 uppercase italic">Access Denied</h1>
          <p className="text-text-secondary mb-8 font-medium">This section is restricted to Authorized Vendors.</p>
          <button onClick={() => window.location.href = '#/'} className="bg-accent text-white font-black uppercase tracking-widest text-[10px] py-3 px-8 rounded-xl">Return Home</button>
        </div>
      );
    }
    return <VendorLayout><Outlet /></VendorLayout>;
  };

const AppContent: React.FC = () => {
  const [isInitializing, setIsInitializing] = useState(true);
  const location = useLocation();
  const isAuthPage = ['/login', '/signup', '/vendor/signup'].includes(location.pathname);
  const isAdminPage = location.pathname.startsWith('/admin');
  const isVendorPage = location.pathname.startsWith('/vendor');
  const isLogisticsPage = location.pathname.startsWith('/scan');
  
  // Update BottomNav visibility: Hide on Landing Page ('/') and Daily Needs ('/daily') as they have their own flows
  const showBottomNav = !isInitializing && !isAuthPage && !isAdminPage && !isVendorPage && !isLogisticsPage && !['/checkout', '/order-success', '/', '/daily'].includes(location.pathname) && !location.pathname.startsWith('/order/') && !location.pathname.startsWith('/product/');
  const showFooter = !isInitializing && !isAdminPage && !isVendorPage && !isLogisticsPage && !isAuthPage && !['/', '/daily'].includes(location.pathname);

  if (isInitializing) {
    return <SplashScreen onFinish={() => setIsInitializing(false)} />;
  }

  return (
    <div className="min-h-screen bg-background text-text-secondary font-sans animate-in fade-in duration-700 flex flex-col">
      <main className={`flex-grow ${showBottomNav ? "pb-20" : ""}`}>
        <Routes>
          <Route path="/" element={<LandingPage />} /> {/* New Entry Point */}
          <Route path="/home" element={<HomePage />} /> {/* Moved original Home */}
          <Route path="/daily" element={<DailyNeedsPage />} /> {/* New Flow */}
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/about-us" element={<AboutUsPage />} />
          <Route path="/contact-us" element={<ContactUsPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/blog/safe-shopping" element={<SafeShoppingPage />} />
          <Route path="/blog/quality-guide" element={<ProductQualityPage />} />
          <Route path="/blog/ecommerce-india" element={<EcommerceIndiaPage />} />
          <Route path="/blog/buying-guide" element={<BuyingGuidePage />} />
          <Route path="/scan/:token" element={<CourierScanPage />} />
          <Route path="/order-success" element={<OrderSuccessPage />} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><MyOrdersPage /></ProtectedRoute>} />
          <Route path="/order/:id" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
          <Route path="/addresses" element={<ProtectedRoute><ShippingAddressesPage /></ProtectedRoute>} />
          <Route path="/addresses/new" element={<ProtectedRoute><AddressFormPage /></ProtectedRoute>} />
          <Route path="/addresses/edit/:id" element={<ProtectedRoute><AddressFormPage /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
          <Route path="/wishlist" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
          <Route path="/admin" element={<AdminRoute />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="analytics" element={<AdminAnalyticsPage />} />
            <Route path="products" element={<AdminProductsPage />} />
            <Route path="products/edit/:id" element={<AdminProductFormPage />} />
            <Route path="banners" element={<AdminBannersPage />} />
            <Route path="marketing" element={<AdminBannersPage />} />
            <Route path="orders" element={<AdminOrdersPage />} />
            <Route path="payouts" element={<AdminPayoutsPage />} />
            <Route path="audit" element={<AdminAuditLogsPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="categories" element={<AdminCategoriesPage />} />
            <Route path="categories/new" element={<AdminCategoryFormPage />} />
            <Route path="categories/edit/:id" element={<AdminCategoryFormPage />} />
            <Route path="vendors" element={<AdminVendorsPage />} />
            <Route path="codes" element={<AdminCodesPage />} />
            <Route path="notifications" element={<AdminNotificationsPage />} />
          </Route>
           <Route path="/vendor" element={<VendorRoute />}>
            <Route index element={<VendorDashboardPage />} />
            <Route path="products" element={<VendorProductsPage />} />
            <Route path="products/new" element={<VendorProductFormPage />} />
            <Route path="products/edit/:id" element={<VendorProductFormPage />} />
            <Route path="orders" element={<VendorOrdersPage />} />
            <Route path="order/:id" element={<VendorOrderDetailPage />} />
            <Route path="wallet" element={<VendorWalletPage />} />
            <Route path="profile" element={<VendorProfilePage />} />
          </Route>
        </Routes>
      </main>
      <ShippingLabelPreviewModal />
      {showFooter && <Footer />}
      {showBottomNav && <BottomNav />}
    </div>
  );
}

const App: React.FC = () => {
  return (
    <AdminCodeProvider>
      <VendorProvider>
        <NotificationProvider>
          <AuthProvider>
            <ProductProvider>
              <ReviewProvider>
                <CategoryProvider>
                  <BannerProvider>
                    <CartProvider>
                      <OrderProvider>
                        <RecentlyViewedProvider>
                          <LocationProvider>
                            <HashRouter>
                              <AppContent />
                            </HashRouter>
                          </LocationProvider>
                        </RecentlyViewedProvider>
                      </OrderProvider>
                    </CartProvider>
                  </BannerProvider>
                </CategoryProvider>
              </ReviewProvider>
            </ProductProvider>
          </AuthProvider>
        </NotificationProvider>
      </VendorProvider>
    </AdminCodeProvider>
  );
};

export default App;
