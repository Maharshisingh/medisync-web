// src/App.js
import { Toaster } from "@/components/ui/toaster.js";
import { Toaster as Sonner } from "@/components/ui/sonner.js";
import { TooltipProvider } from "@/components/ui/tooltip.js";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index.js";
import SearchResults from "./pages/SearchResults.js";
import Login from "./pages/Login.js";
import Register from "./pages/Register.js";
import PartnerDashboard from "./pages/PartnerDashboard.js";
import NotFound from "./pages/NotFound.js";
import PharmacyLogin from "./pages/PharmacyLogin.js";
import PharmacyRegister from "./pages/PharmacyRegister.js";
import ForgotPassword from "./pages/ForgotPassword.js";
import PharmacyForgotPassword from "./pages/PharmacyForgotPassword.js";
import { AuthProvider } from "./context/AuthContext.js";
import AdminDashboard from "./pages/AdminDashboard.js";
import AdminRoute from "./components/auth/AdminRoute.js";
import ErrorBoundary from "./components/ErrorBoundary.js";

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