import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { RoleProtectedRoute } from "@/components/RoleProtectedRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import ProfileSetup from "./pages/ProfileSetup";
import ClientDashboard from "./pages/ClientDashboard";
import MasterDashboard from "./pages/MasterDashboard";
import SearchMasters from "./pages/SearchMasters";
import BusinessDashboard from "./pages/BusinessDashboard";
import BusinessStats from "./pages/BusinessStats";
import HowItWorks from "./pages/HowItWorks";
import Pricing from "./pages/Pricing";
import Guarantees from "./pages/Guarantees";
import HelpCenter from "./pages/HelpCenter";
import About from "./pages/About";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Contact from "./pages/Contact";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import { DossierMaestros } from "./pages/DossierMaestros";
import { DossierEmpresas } from "./pages/DossierEmpresas";
import PitchDeck from "./pages/PitchDeck";
import Sitemap from "./pages/Sitemap";

const queryClient = new QueryClient();

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, profile, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Check if user needs email verification
  if (user && !user.email_confirmed_at && profile?.login_provider === 'email') {
    const verificationUrl = `/auth?message=verify-email&email=${encodeURIComponent(user.email || '')}`;
    return <Navigate to={verificationUrl} replace />;
  }
  
  return <>{children}</>;
};

// Main App Content component
const AppContent = () => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route 
        path="/auth" 
        element={user ? <Navigate to="/" replace /> : <Auth />} 
      />
      <Route 
        path="/auth/callback" 
        element={<AuthCallback />} 
      />
      <Route 
        path="/profile-setup" 
        element={
          <ProtectedRoute>
            <ProfileSetup />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/" 
        element={<Index userType={profile?.user_type || null} />} 
      />
      <Route 
        path="/client-dashboard" 
        element={
          <RoleProtectedRoute allowedRoles={['client']}>
            <ClientDashboard />
          </RoleProtectedRoute>
        } 
      />
      <Route 
        path="/master-dashboard" 
        element={
          <RoleProtectedRoute allowedRoles={['master']}>
            <MasterDashboard />
          </RoleProtectedRoute>
        } 
      />
      <Route 
        path="/admin/login" 
        element={<AdminLogin />} 
      />
      <Route 
        path="/admin-dashboard" 
        element={
          <RoleProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </RoleProtectedRoute>
        } 
      />
      <Route path="/search-masters" element={<SearchMasters />} />
      <Route 
        path="/business-dashboard" 
        element={
          <RoleProtectedRoute allowedRoles={['business']}>
            <BusinessDashboard />
          </RoleProtectedRoute>
        } 
      />
      <Route path="/business-stats" element={<BusinessStats />} />
      <Route path="/how-it-works" element={<HowItWorks />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/guarantees" element={<Guarantees />} />
      <Route path="/help-center" element={<HelpCenter />} />
      <Route path="/about" element={<About />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/blog/:id" element={<BlogPost />} />
      <Route path="/dossier-maestros" element={<DossierMaestros />} />
      <Route path="/dossier-empresas" element={<DossierEmpresas />} />
      <Route path="/pitch-deck" element={<PitchDeck />} />
      <Route path="/sitemap" element={<Sitemap />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppContent />
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
