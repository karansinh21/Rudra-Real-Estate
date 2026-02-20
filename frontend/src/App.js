import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './utils/AuthContext';
import { LanguageProvider } from './utils/LanguageContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Navbar from './components/layout/Navbar';

// Essential Public Pages (Load immediately)
import ModernHome from './pages/public/ModernHome';
import CombinedAuthPage from './pages/public/CombinedAuthPage';
import PropertyDetail from './pages/public/PropertyDetail';

// ✅ NEW: RudraAIChatBot (LiveChatWidget deleted & replaced)
import RudraAIChatBot from './components/chat/RudraAIChatBot';

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="relative">
      <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
      <div className="mt-4 text-center text-gray-600">Loading...</div>
    </div>
  </div>
);

// Lazy Load Modern/Enhanced Public Pages (Heavy components)
const GlassPropertyCards = lazy(() => import('./pages/public/GlassPropertyCards'));
const Property3DDetail = lazy(() => import('./pages/public/Property3DDetail'));
const Property3DViewer = lazy(() => import('./pages/public/Property3DViewer'));
const PropertyComparison = lazy(() => import('./pages/public/PropertyComparison'));
const VideoHeroLanding = lazy(() => import('./pages/public/VideoHeroLanding'));
const InteractivePropertyMap = lazy(() => import('./pages/public/InteractivePropertyMap'));
const VirtualTour360 = lazy(() => import('./pages/public/VirtualTour360'));
const AIPropertySearch = lazy(() => import('./pages/public/AIPropertySearch'));
const PublicUserDashboard = lazy(() => import('./pages/public/PublicUserDashboard'));
const PublicAccountSettings = lazy(() => import('./pages/public/PublicAccountSettings'));

// Lazy Load Lawyer Public Pages
const LawyerDirectory = lazy(() => import('./pages/public/LawyerDirectory'));
const LawyerProfile = lazy(() => import('./pages/public/LawyerProfile'));
const BookConsultation = lazy(() => import('./pages/public/BookConsultation'));

// Lazy Load Land Pages
const LandRequirement = lazy(() => import('./pages/public/LandRequirement'));
const LandListings = lazy(() => import('./pages/public/LandListings'));

// Protected Pages - Login Required
const PropertyWishlist = lazy(() => import('./pages/public/PropertyWishlist'));
const PropertyTourScheduler = lazy(() => import('./pages/public/PropertyTourScheduler'));
const PropertyCalculatorSuite = lazy(() => import('./pages/public/PropertyCalculatorSuite'));

// Lazy Load Broker Pages
const BrokerDashboard = lazy(() => import('./pages/broker/BrokerDashboard'));
const BrokerProperties = lazy(() => import('./pages/broker/BrokerProperties'));
const AddProperty = lazy(() => import('./pages/broker/AddProperty'));
const BrokerEnquiries = lazy(() => import('./pages/broker/BrokerEnquiries'));
const RequestLegalService = lazy(() => import('./pages/broker/RequestLegalService'));
const InteractiveBrokerDashboard = lazy(() => import('./pages/broker/InteractiveBrokerDashboard'));

// Lazy Load Lawyer Pages
const LawyerDashboard = lazy(() => import('./pages/lawyer/LawyerDashboard'));
const LawyerDashboardComplete = lazy(() => import('./pages/lawyer/LawyerDashboardComplete'));
const LawyerAccountSettings = lazy(() => import('./pages/lawyer/LawyerAccountSettings'));

// Lazy Load Admin Pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AnimatedStatsDashboard = lazy(() => import('./pages/admin/AnimatedStatsDashboard'));
const CompleteAdminPanel = lazy(() => import('./pages/admin/CompleteAdminPanel'));
const AnalyticsDashboard = lazy(() => import('./pages/admin/AnalyticsDashboard'));

// Lazy Load Common Pages
const UserProfile = lazy(() => import('./pages/common/UserProfile'));

// Role-based Dashboard Router
const RoleDashboardRouter = lazy(() => import('./components/common/RoleDashboardRouter'));

function App() {
  return (
    <Router>
      <LanguageProvider>
        <AuthProvider>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<ModernHome />} />
                <Route path="/auth" element={<CombinedAuthPage />} />
                <Route path="/login" element={<CombinedAuthPage />} />
                <Route path="/register" element={<CombinedAuthPage />} />
                <Route path="/property/:id" element={<PropertyDetail />} />

                {/* Modern/Enhanced Public Routes */}
                <Route path="/modern" element={<ModernHome />} />
                <Route path="/glass-cards" element={<GlassPropertyCards />} />
                <Route path="/3d-property/:id" element={<Property3DDetail />} />
                <Route path="/3d-viewer" element={<Property3DViewer />} />
                <Route path="/compare" element={<PropertyComparison />} />
                <Route path="/video-hero" element={<VideoHeroLanding />} />
                <Route path="/map" element={<InteractivePropertyMap />} />
                <Route path="/virtual-tour" element={<VirtualTour360 />} />
                <Route path="/ai-search" element={<AIPropertySearch />} />

                {/* Lawyer Public Routes */}
                <Route path="/lawyers" element={<LawyerDirectory />} />
                <Route path="/lawyer/:id" element={<LawyerProfile />} />
                <Route path="/book-consultation" element={<BookConsultation />} />

                {/* Land Routes */}
                <Route path="/land-requirement" element={<LandRequirement />} />
                <Route path="/land-listings" element={<LandListings />} />

                {/* Role-based Dashboard */}
                <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['PUBLIC', 'ADMIN', 'BROKER', 'LAWYER']}><RoleDashboardRouter /></ProtectedRoute>} />

                {/* Public User Routes */}
                <Route path="/public/dashboard" element={<ProtectedRoute allowedRoles={['PUBLIC']}><PublicUserDashboard /></ProtectedRoute>} />
                <Route path="/account/settings" element={<ProtectedRoute allowedRoles={['PUBLIC']}><PublicAccountSettings /></ProtectedRoute>} />
                <Route path="/wishlist" element={<ProtectedRoute allowedRoles={['PUBLIC', 'ADMIN', 'BROKER', 'LAWYER']}><PropertyWishlist /></ProtectedRoute>} />
                <Route path="/schedule-tour" element={<ProtectedRoute allowedRoles={['PUBLIC', 'ADMIN', 'BROKER', 'LAWYER']}><PropertyTourScheduler /></ProtectedRoute>} />
                <Route path="/calculators" element={<ProtectedRoute allowedRoles={['PUBLIC', 'ADMIN', 'BROKER', 'LAWYER']}><PropertyCalculatorSuite /></ProtectedRoute>} />

                {/* Broker Routes */}
                <Route path="/broker/dashboard" element={<ProtectedRoute allowedRoles={['BROKER', 'ADMIN']}><BrokerDashboard /></ProtectedRoute>} />
                <Route path="/broker/properties" element={<ProtectedRoute allowedRoles={['BROKER', 'ADMIN']}><BrokerProperties /></ProtectedRoute>} />
                <Route path="/broker/properties/add" element={<ProtectedRoute allowedRoles={['BROKER', 'ADMIN']}><AddProperty /></ProtectedRoute>} />
                <Route path="/broker/enquiries" element={<ProtectedRoute allowedRoles={['BROKER', 'ADMIN']}><BrokerEnquiries /></ProtectedRoute>} />
                <Route path="/broker/legal/request" element={<ProtectedRoute allowedRoles={['BROKER', 'ADMIN']}><RequestLegalService /></ProtectedRoute>} />
                <Route path="/interactive-dashboard" element={<ProtectedRoute allowedRoles={['BROKER', 'ADMIN']}><InteractiveBrokerDashboard /></ProtectedRoute>} />

                {/* Lawyer Routes */}
                <Route path="/lawyer/dashboard" element={<ProtectedRoute allowedRoles={['LAWYER', 'ADMIN']}><LawyerDashboard /></ProtectedRoute>} />
                <Route path="/lawyer/settings" element={<ProtectedRoute allowedRoles={['LAWYER', 'ADMIN']}><LawyerAccountSettings /></ProtectedRoute>} />
                <Route path="/lawyer/dashboard-complete" element={<ProtectedRoute allowedRoles={['LAWYER', 'ADMIN']}><LawyerDashboardComplete /></ProtectedRoute>} />

                {/* Admin Routes */}
                <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
                <Route path="/animated-stats" element={<ProtectedRoute allowedRoles={['ADMIN']}><AnimatedStatsDashboard /></ProtectedRoute>} />
                <Route path="/admin/panel" element={<ProtectedRoute allowedRoles={['ADMIN']}><CompleteAdminPanel /></ProtectedRoute>} />
                <Route path="/admin/analytics" element={<ProtectedRoute allowedRoles={['ADMIN']}><AnalyticsDashboard /></ProtectedRoute>} />
                <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['ADMIN']}><CompleteAdminPanel /></ProtectedRoute>} />
                <Route path="/admin/users/add" element={<ProtectedRoute allowedRoles={['ADMIN']}><CompleteAdminPanel /></ProtectedRoute>} />
                <Route path="/admin/properties" element={<ProtectedRoute allowedRoles={['ADMIN']}><CompleteAdminPanel /></ProtectedRoute>} />
                <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={['ADMIN']}><AnalyticsDashboard /></ProtectedRoute>} />

                {/* Common Protected Routes */}
                <Route path="/profile" element={<ProtectedRoute allowedRoles={['BROKER']}><UserProfile /></ProtectedRoute>} />

                {/* 404 Page */}
                <Route path="*" element={
                  <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                      <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
                      <p className="text-xl text-gray-600 mb-4">Page Not Found</p>
                      <Link to="/" className="text-blue-600 hover:underline">Go to Home</Link>
                    </div>
                  </div>
                } />
              </Routes>
            </Suspense>

            {/* ✅ Global Chat - RudraAIChatBot (replaces old LiveChatWidget) */}
            <RudraAIChatBot />
          </div>
        </AuthProvider>
      </LanguageProvider>
    </Router>
  );
}

export default App;