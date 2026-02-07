import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import React from 'react';

const queryClient = new QueryClient();

const SimpleAuthCheck = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, error } = useAuth();
  console.log("CR7-DEBUG: SimpleAuthCheck - User:", user?.id, "Loading:", loading, "Error:", error);
  
  if (loading) {
    return (
      <div style={{ background: '#050505', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#D4AF37' }}>
        <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid gold', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
        <span style={{ marginTop: '15px', fontWeight: 'bold' }}>جاري التحميل...</span>
        {error && <p style={{ color: 'red', marginTop: '10px', fontSize: '12px' }}>{error}</p>}
      </div>
    );
  }
  
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/" element={<SimpleAuthCheck><Index /></SimpleAuthCheck>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
