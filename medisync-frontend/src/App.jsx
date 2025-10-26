// src/App.js
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index.jsx";
import SearchResults from "./pages/SearchResults.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import PartnerDashboard from "./pages/PartnerDashboard.jsx";
import NotFound from "./pages/NotFound.jsx";
import PharmacyLogin from "./pages/PharmacyLogin.jsx";
import PharmacyRegister from "./pages/PharmacyRegister.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import PharmacyForgotPassword from "./pages/PharmacyForgotPassword.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import AdminRoute from "./components/auth/AdminRoute.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/search" element={<SearchResults />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/partner-dashboard" element={<PartnerDashboard />} />
              <Route path="/partner-login" element={<PharmacyLogin />} />
              <Route path="/partner-register" element={<PharmacyRegister />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/partner-forgot-password" element={<PharmacyForgotPassword />} />
              <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} /> 
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;