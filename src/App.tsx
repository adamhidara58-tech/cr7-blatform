import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { ImageCache } from "./components/ui/ImageCache";
import Index from "./pages/Index";
import Challenges from "./pages/Challenges";
import Team from "./pages/Team";
import VIP from "./pages/VIP";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// Admin Pages
import { AdminLayout } from "./components/layout/AdminLayout";
import AdminLogin from "./pages/admin/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUsers from "./pages/admin/Users";
import AdminWithdrawals from "./pages/admin/Withdrawals";
import AdminLogs from "./pages/admin/ActivityLogs";
import AdminSettings from "./pages/admin/Settings";

import AdminVIP from "./pages/admin/VIP";
import AdminChallenges from "./pages/admin/Challenges";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, isProfileLoading, profile } = useAuth();
  
  // Only show loading if we are checking auth session
  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-gold border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(212,175,55,0.5)]" />
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // If we have a user but profile is still loading, we can either show a loader 
  // or let the page handle it with skeletons. For better UX, we'll show a loader
  // only if the profile is absolutely required and not yet available.
  if (isProfileLoading && !profile) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-gold border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(212,175,55,0.5)]" />
      </div>
    );
  }
  
  return <>{children}</>;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/auth" element={<Auth />} />
    
    {/* User Routes */}
    <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
    <Route path="/challenges" element={<ProtectedRoute><Challenges /></ProtectedRoute>} />
    <Route path="/team" element={<ProtectedRoute><Team /></ProtectedRoute>} />
    <Route path="/vip" element={<ProtectedRoute><VIP /></ProtectedRoute>} />
    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

    {/* Admin Routes */}
    <Route path="/admin/login" element={<AdminLogin />} />
    <Route path="/admin" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
    <Route path="/admin/users" element={<AdminLayout><AdminUsers /></AdminLayout>} />
    <Route path="/admin/withdrawals" element={<AdminLayout><AdminWithdrawals /></AdminLayout>} />
    <Route path="/admin/vip" element={<AdminLayout><AdminVIP /></AdminLayout>} />
    <Route path="/admin/challenges" element={<AdminLayout><AdminChallenges /></AdminLayout>} />
    <Route path="/admin/logs" element={<AdminLayout><AdminLogs /></AdminLayout>} />
    <Route path="/admin/settings" element={<AdminLayout><AdminSettings /></AdminLayout>} />
    
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => {
  useEffect(() => {
    // Preload critical images
    const criticalImages = [
      '/src/assets/logo-new.png',
      '/src/assets/hero-bg.webp',
      '/src/assets/vip-final/stadium-bg.jpg'
    ];
    
    criticalImages.forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ImageCache />
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
