import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './utils/AuthContext';
import { LanguageProvider } from './utils/LanguageContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Navbar from './components/layout/Navbar';
import AdminRoutes from './pages/admin/AdminRoutes';

// Essential Public Pages (Load immediately)
import ModernHome        from './pages/public/ModernHome';
import CombinedAuthPage  from './pages/public/CombinedAuthPage';
import PropertyDetail    from './pages/public/PropertyDetail';
import ResetPasswordPage from './pages/public/ResetPasswordPage';
import UnifiedChatWidget from './components/chat/UnifiedChatWidget';
import SocialSidebar     from './components/layout/SocialSidebar'; // ✅ NEW

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="relative">
      <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-orange-600" />
      <div className="mt-3 text-center text-gray-500 text-sm">Loading...</div>
    </div>
  </div>
);

// ─── Public Pages ─────────────────────────────────────────────────
const GlassPropertyCards         = lazy(() => import('./pages/public/GlassPropertyCards'));
const Property3DDetail           = lazy(() => import('./pages/public/Property3DDetail'));
const PropertyComparisonEnhanced = lazy(() => import('./pages/public/PropertyComparisonEnhanced'));
const VideoHeroLanding           = lazy(() => import('./pages/public/VideoHeroLanding'));
const InteractivePropertyMap     = lazy(() => import('./pages/public/InteractivePropertyMap'));
const VirtualTour360             = lazy(() => import('./pages/public/VirtualTour360'));
const AIPropertySearch           = lazy(() => import('./pages/public/AIPropertySearch'));
const PublicUserDashboard        = lazy(() => import('./pages/public/PublicUserDashboard'));
const PublicAccountSettings      = lazy(() => import('./pages/public/PublicAccountSettings'));
const LawyerDirectory            = lazy(() => import('./pages/public/LawyerDirectory'));
const LawyerProfile              = lazy(() => import('./pages/public/LawyerProfile'));
const BookConsultation           = lazy(() => import('./pages/public/BookConsultation'));
const LandRequirement            = lazy(() => import('./pages/public/LandRequirement'));
const LandListings               = lazy(() => import('./pages/public/LandListings'));
const PropertyWishlist           = lazy(() => import('./pages/public/PropertyWishlist'));
const PropertyTourScheduler      = lazy(() => import('./pages/public/PropertyTourScheduler'));
const PropertyCalculatorSuite    = lazy(() => import('./pages/public/PropertyCalculatorSuite'));

// ─── Broker Pages ─────────────────────────────────────────────────
const BrokerDashboard            = lazy(() => import('./pages/broker/BrokerDashboard'));
const BrokerProperties           = lazy(() => import('./pages/broker/BrokerProperties'));
const AddProperty                = lazy(() => import('./pages/broker/AddProperty'));
const BrokerEnquiries            = lazy(() => import('./pages/broker/BrokerEnquiries'));
const RequestLegalService        = lazy(() => import('./pages/broker/RequestLegalService'));
const BrokerProfile              = lazy(() => import('./pages/broker/BrokerProfile'));
const InteractiveBrokerDashboard = lazy(() => import('./pages/broker/InteractiveBrokerDashboard'));

// ─── Lawyer Pages ─────────────────────────────────────────────────
const LawyerDashboard = lazy(() => import('./pages/lawyer/LawyerDashboard'));
const LawyerRequests  = lazy(() => import('./pages/lawyer/LawyerRequests'));
const LawyerServices  = lazy(() => import('./pages/lawyer/LawyerServices'));

// ─── Admin Pages ──────────────────────────────────────────────────
const AdminDashboard     = lazy(() => import('./pages/admin/AdminDashboard'));
const CompleteAdminPanel = lazy(() => import('./pages/admin/CompleteAdminPanel'));

// ─── Common ───────────────────────────────────────────────────────
const UserProfile         = lazy(() => import('./pages/common/UserProfile'));
const RoleDashboardRouter = lazy(() => import('./components/common/RoleDashboardRouter'));

const Protected = ({ children, roles }) => (
  <ProtectedRoute allowedRoles={roles}>{children}</ProtectedRoute>
);

const ALL_ROLES    = ['PUBLIC', 'USER', 'ADMIN', 'BROKER', 'LAWYER'];
const BROKER_ROLES = ['BROKER', 'ADMIN'];
const LAWYER_ROLES = ['LAWYER', 'ADMIN'];
const ADMIN_ROLES  = ['ADMIN'];

function App() {
  return (
    <Router>
      <LanguageProvider>
        <AuthProvider>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>

                {/* ── Admin wildcard routes ─────────────────────── */}
                <Route path="/admin/*" element={<AdminRoutes />} />

                {/* ══ PUBLIC ROUTES ════════════════════════════════ */}
                <Route path="/"           element={<ModernHome />} />
                <Route path="/auth"       element={<CombinedAuthPage />} />
                <Route path="/login"      element={<CombinedAuthPage />} />
                <Route path="/register"   element={<CombinedAuthPage />} />
                <Route path="/modern"     element={<ModernHome />} />

                <Route path="/reset-password" element={<ResetPasswordPage />} />

                {/* Property routes */}
                <Route path="/property/:id"   element={<PropertyDetail />} />
                <Route path="/properties/:id" element={<PropertyDetail />} />
                <Route path="/properties"     element={<GlassPropertyCards />} />
                <Route path="/glass-cards"    element={<GlassPropertyCards />} />
                <Route path="/ai-search"      element={<AIPropertySearch />} />

                {/* Other public pages */}
                <Route path="/3d-property/:id"  element={<Property3DDetail />} />
                <Route path="/video-hero"       element={<VideoHeroLanding />} />
                <Route path="/map"              element={<InteractivePropertyMap />} />
                <Route path="/virtual-tour"     element={<VirtualTour360 />} />
                <Route path="/virtual-tour/:id" element={<VirtualTour360 />} />
                <Route path="/compare"          element={<PropertyComparisonEnhanced />} />

                {/* Land */}
                <Route path="/land-requirement" element={<LandRequirement />} />
                <Route path="/land-listings"    element={<LandListings />} />

                {/* Lawyers */}
                <Route path="/lawyers"           element={<LawyerDirectory />} />
                <Route path="/lawyer/:id"        element={<LawyerProfile />} />
                <Route path="/book-consultation" element={<BookConsultation />} />

                {/* ══ ROLE DASHBOARD ═══════════════════════════════ */}
                <Route path="/dashboard" element={
                  <Protected roles={ALL_ROLES}><RoleDashboardRouter /></Protected>} />

                {/* ══ PUBLIC USER ROUTES ═══════════════════════════ */}
                <Route path="/public/dashboard" element={
                  <Protected roles={['PUBLIC', 'USER']}><PublicUserDashboard /></Protected>} />

                <Route path="/account/settings" element={
                  <Protected roles={['PUBLIC', 'USER']}><PublicAccountSettings /></Protected>} />

                <Route path="/wishlist" element={
                  <Protected roles={ALL_ROLES}><PropertyWishlist /></Protected>} />

                <Route path="/schedule-tour" element={
                  <Protected roles={ALL_ROLES}><PropertyTourScheduler /></Protected>} />

                <Route path="/calculators" element={
                  <Protected roles={ALL_ROLES}><PropertyCalculatorSuite /></Protected>} />

                {/* ══ BROKER ROUTES ════════════════════════════════ */}
                <Route path="/broker/dashboard" element={
                  <Protected roles={BROKER_ROLES}><BrokerDashboard /></Protected>} />

                <Route path="/broker/properties" element={
                  <Protected roles={BROKER_ROLES}><BrokerProperties /></Protected>} />

                <Route path="/broker/add-property" element={
                  <Protected roles={BROKER_ROLES}><AddProperty /></Protected>} />
                <Route path="/broker/properties/add" element={
                  <Protected roles={BROKER_ROLES}><AddProperty /></Protected>} />

                <Route path="/broker/edit-property/:id" element={
                  <Protected roles={BROKER_ROLES}><AddProperty /></Protected>} />
                <Route path="/broker/properties/edit/:id" element={
                  <Protected roles={BROKER_ROLES}><AddProperty /></Protected>} />

                <Route path="/broker/enquiries" element={
                  <Protected roles={BROKER_ROLES}><BrokerEnquiries /></Protected>} />

                <Route path="/broker/legal/request" element={
                  <Protected roles={BROKER_ROLES}><RequestLegalService /></Protected>} />

                <Route path="/broker/profile" element={
                  <Protected roles={BROKER_ROLES}><BrokerProfile /></Protected>} />

                <Route path="/interactive-dashboard" element={
                  <Protected roles={BROKER_ROLES}><InteractiveBrokerDashboard /></Protected>} />

                {/* ══ LAWYER ROUTES ════════════════════════════════ */}
                <Route path="/lawyer/dashboard" element={
                  <Protected roles={LAWYER_ROLES}><LawyerDashboard /></Protected>} />

                <Route path="/lawyer/settings" element={
                  <Protected roles={LAWYER_ROLES}><LawyerDashboard /></Protected>} />

                <Route path="/lawyer/requests" element={
                  <Protected roles={LAWYER_ROLES}><LawyerRequests /></Protected>} />

                <Route path="/lawyer/services" element={
                  <Protected roles={LAWYER_ROLES}><LawyerServices /></Protected>} />

                {/* ══ ADMIN ROUTES ═════════════════════════════════ */}
                <Route path="/admin/dashboard"  element={<Protected roles={ADMIN_ROLES}><AdminDashboard /></Protected>} />
                <Route path="/admin/panel"      element={<Protected roles={ADMIN_ROLES}><CompleteAdminPanel /></Protected>} />
                <Route path="/admin/analytics"  element={<Protected roles={ADMIN_ROLES}><CompleteAdminPanel /></Protected>} />
                <Route path="/admin/reports"    element={<Protected roles={ADMIN_ROLES}><CompleteAdminPanel /></Protected>} />
                <Route path="/admin/users"      element={<Protected roles={ADMIN_ROLES}><CompleteAdminPanel /></Protected>} />
                <Route path="/admin/users/add"  element={<Protected roles={ADMIN_ROLES}><CompleteAdminPanel /></Protected>} />
                <Route path="/admin/properties" element={<Protected roles={ADMIN_ROLES}><CompleteAdminPanel /></Protected>} />
                <Route path="/animated-stats"   element={<Protected roles={ADMIN_ROLES}><CompleteAdminPanel /></Protected>} />

                {/* Common */}
                <Route path="/profile" element={
                  <Protected roles={BROKER_ROLES}><UserProfile /></Protected>} />

                {/* 404 */}
                <Route path="*" element={
                  <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                      <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
                      <p className="text-xl text-gray-500 mb-6">Page not found</p>
                      <Link to="/" className="text-orange-600 hover:underline font-semibold">← Go Home</Link>
                    </div>
                  </div>} />

              </Routes>
            </Suspense>

            {/* ✅ Single unified chat — AI + Broker + Lawyer */}
            <UnifiedChatWidget />

            {/* ✅ Social Media Sidebar — Instagram, Facebook, WhatsApp */}
            <SocialSidebar />

          </div>
        </AuthProvider>
      </LanguageProvider>
    </Router>
  );
}

export default App;