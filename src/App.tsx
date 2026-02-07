import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Challenges from "./pages/Challenges";
import Team from "./pages/Team";
import VIP from "./pages/VIP";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import React, { useEffect } from 'react';

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
  const { user, loading, error } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-gold border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-gold font-bold">جاري التحميل...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
          <span className="text-red-500 text-2xl">⚠️</span>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">حدث خطأ في الاتصال</h2>
        <p className="text-white/60 mb-6">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-gradient-gold text-black px-8 py-3 rounded-xl font-bold"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  return (
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
};

const App = () => {
  useEffect(() => {
    // Auto-remove loader from index.html
    const loader = document.querySelector('.initial-loader');
    if (loader) loader.remove();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
