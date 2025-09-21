import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import { UserTypeSelector } from "./components/UserTypeSelector";

const queryClient = new QueryClient();

const App = () => {
  const [userType, setUserType] = useState<'client' | 'maestro' | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const handleUserTypeSelect = (type: 'client' | 'maestro') => {
    setUserType(type);
    setShowOnboarding(false);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route 
              path="/" 
              element={
                showOnboarding ? (
                  <UserTypeSelector onSelect={handleUserTypeSelect} />
                ) : (
                  <Index 
                    userType={userType} 
                    onShowOnboarding={() => setShowOnboarding(true)} 
                  />
                )
              } 
            />
            <Route path="/registro" element={<UserTypeSelector onSelect={handleUserTypeSelect} />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminDashboard />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
