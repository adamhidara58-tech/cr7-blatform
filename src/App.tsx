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
  const { user, loading } = useAuth();
  console.log("CR7-DEBUG: SimpleAuthCheck - User:", user?.id, "Loading:", loading);
  
  // We remove the blocking loading state to ensure the app renders
  // If there's no user and we're not loading, redirect to auth
  if (!loading && !user) return <Navigate to="/auth" replace />;
  
  // Otherwise, show children (Index) which has its own loading handling
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
