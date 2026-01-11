
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation, Navigate, Outlet } from 'react-router-dom';
import HomePage from './pages/HomePage.tsx';
import LandingPage from './pages/LandingPage.tsx'; 
import DailyNeedsPage from './pages/DailyNeedsPage.tsx'; 
import MenuPage from './pages/MenuPage.tsx'; 
import ProductsPage from './pages/ProductsPage.tsx';
import ProductDetailPage from './pages/ProductDetailPage.tsx';
import CartPage from './pages/CartPage.tsx';
import ProfilePage from './pages/ProfilePage.tsx';
import CheckoutPage from './pages/CheckoutPage.tsx';
import LoginPage from './pages/LoginPage.tsx';
import SignupPage from './pages/SignupPage.tsx';
import MyOrdersPage from './pages/MyOrdersPage.tsx';
import OrderDetailPage from './pages/OrderDetailPage.tsx';
import CancelOrderPage from './pages/CancelOrderPage.tsx'; 
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
import { LocationProvider } from './context/LocationContext.tsx'; 
import { ServiceAreaProvider } from './context/ServiceAreaContext.tsx'; 
import VendorLayout from './pages/vendor/VendorLayout.tsx';
import VendorDashboardPage from './pages/vendor/VendorDashboardPage.tsx';
import VendorProductsPage from './pages/vendor/VendorProductsPage.tsx';
import VendorProductFormPage from './pages/vendor/VendorProductFormPage.tsx';
import VendorOrdersPage from './pages/vendor/VendorOrdersPage.tsx';
import VendorOrderDetailPage from './pages/vendor/VendorOrderDetailPage.tsx';
import VendorWalletPage from './pages/vendor/VendorWalletPage.tsx';
import VendorProfilePage from './pages/vendor/VendorProfilePage.tsx';
import CourierScanPage from './pages/CourierScanPage.tsx';
import VendorLoginPage from './pages/vendor/VendorLoginPage.tsx';
import VendorSignupPage from './pages/VendorSignupPage.tsx';

// Admin Imports
import AdminLayout from './pages/admin/AdminLayout.tsx';
import AdminDashboardPage from './pages/admin/AdminDashboardPage.tsx';
import AdminProductsPage from './pages/admin/AdminProductsPage.tsx';
import AdminProductFormPage from './pages/admin/AdminProductFormPage.tsx';
import AdminOrdersPage from './pages/admin/AdminOrdersPage.tsx';
import AdminUsersPage from './pages/admin/AdminUsersPage.tsx';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage.tsx';
import AdminCategoryFormPage from './pages/admin/AdminCategoryFormPage.tsx';
import AdminServiceAreasPage from './pages/admin/AdminServiceAreasPage.tsx';
import AdminCodesPage from './pages/admin/AdminCodesPage.tsx';
import AdminPayoutsPage from './pages/admin/AdminPayoutsPage.tsx';
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage.tsx';
import AdminAuditLogsPage from './pages/admin/AdminAuditLogsPage.tsx';
import AdminApprovalsPage from './pages/admin/AdminApprovalsPage.tsx';
import AdminBannersPage from './pages/admin/AdminBannersPage.tsx';
import AdminNotificationsPage from './pages/admin/AdminNotificationsPage.tsx';
import AdminVendorsPage from './pages/admin/AdminVendorsPage.tsx';

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin"></div></div>;
  if (!isAuthenticated || user?.role !== 'admin') return <Navigate to="/vendor/login" replace />;
  return <>{children}</>;
};

const VendorRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, isAuthenticated, isLoading } = useAuth();
    if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin"></div></div>;
    if (!isAuthenticated || user?.role !== 'vendor') return <Navigate to="/vendor/login" replace />;
    return <>{children}</>;
};

const AppContent: React.FC = () => {
  const [isInitializing, setIsInitializing] = useState(true);
  const location = useLocation();
  const { user } = useAuth();
  
  // Logic to hide BottomNav on checkout/admin pages
  const hideNavRoutes = ['/checkout', '/order-success', '/vendor/login', '/vendor/signup', '/scan'];
  const isHideNav = hideNavRoutes.includes(location.pathname) || location.pathname.startsWith('/admin') || location.pathname.startsWith('/vendor');
  
  const showBottomNav = !isInitializing && !isHideNav && !location.pathname.startsWith('/order/') && !location.pathname.startsWith('/cancel-order/') && !location.pathname.startsWith('/product/');

  if (isInitializing) return <SplashScreen onFinish={() => setIsInitializing(false)} />;

  return (
    <div className="min-h-screen bg-background text-text-secondary font-sans flex flex-col">
      <main className={`flex-grow ${showBottomNav ? "pb-20" : ""}`}>
        <Routes>
          {/* Main App - Direct Access */}
          <Route path="/" element={<Navigate to="/home" replace />} />
          
          <Route path="/home" element={<HomePage />} />
          <Route path="/menu" element={<MenuPage />} /> 
          <Route path="/daily" element={<DailyNeedsPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          
          {/* User Routes (Now Guest Accessible) */}
          <Route path="/orders" element={<MyOrdersPage />} />
          <Route path="/order/:id" element={<OrderDetailPage />} />
          <Route path="/cancel-order/:id" element={<CancelOrderPage />} /> 
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-success" element={<OrderSuccessPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/addresses" element={<ShippingAddressesPage />} />
          <Route path="/addresses/new" element={<AddressFormPage />} />
          <Route path="/addresses/edit/:id" element={<AddressFormPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          
          {/* Redirects for Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/onboarding" element={<Navigate to="/" replace />} />
          <Route path="/welcome" element={<Navigate to="/" replace />} />

          {/* Info Pages */}
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/about-us" element={<AboutUsPage />} />
          <Route path="/contact-us" element={<ContactUsPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/blog/safe-shopping" element={<SafeShoppingPage />} />
          <Route path="/blog/quality-guide" element={<ProductQualityPage />} />
          <Route path="/blog/ecommerce-india" element={<EcommerceIndiaPage />} />
          <Route path="/blog/buying-guide" element={<BuyingGuidePage />} />
          <Route path="/scan/:token" element={<CourierScanPage />} />
          
          {/* Internal Access Routes */}
          <Route path="/vendor/login" element={<VendorLoginPage />} />
          <Route path="/vendor/signup" element={<VendorSignupPage />} />

          {/* Admin Panel */}
          <Route path="/admin" element={<AdminRoute><AdminLayout><Outlet /></AdminLayout></AdminRoute>}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="analytics" element={<AdminAnalyticsPage />} />
            <Route path="service-areas" element={<AdminServiceAreasPage />} />
            <Route path="vendors" element={<AdminVendorsPage />} />
            <Route path="orders" element={<AdminOrdersPage />} />
            <Route path="payouts" element={<AdminPayoutsPage />} />
            <Route path="marketing" element={<AdminBannersPage />} />
            <Route path="products" element={<AdminProductsPage />} />
            <Route path="products/new" element={<AdminProductFormPage />} />
            <Route path="products/edit/:id" element={<AdminProductFormPage />} />
            <Route path="categories" element={<AdminCategoriesPage />} />
            <Route path="categories/new" element={<AdminCategoryFormPage />} />
            <Route path="categories/edit/:id" element={<AdminCategoryFormPage />} />
            <Route path="audit" element={<AdminAuditLogsPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="notifications" element={<AdminNotificationsPage />} />
            <Route path="approvals" element={<AdminApprovalsPage />} />
            <Route path="codes" element={<AdminCodesPage />} />
          </Route>

           {/* Vendor Panel */}
           <Route path="/vendor" element={<VendorRoute><VendorLayout><Outlet /></VendorLayout></VendorRoute>}>
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
      {showBottomNav && <BottomNav />}
    </div>
  );
}

const App: React.FC = () => (
  <AdminCodeProvider>
    <VendorProvider>
      <NotificationProvider>
        <AuthProvider>
          <ServiceAreaProvider>
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
          </ServiceAreaProvider>
        </AuthProvider>
      </NotificationProvider>
    </VendorProvider>
  </AdminCodeProvider>
);

export default App;
