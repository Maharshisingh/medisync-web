// src/App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import SearchResults from "./pages/SearchResults";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PartnerDashboard from "./pages/PartnerDashboard";
import NotFound from "./pages/NotFound";
import PharmacyLogin from "./pages/PharmacyLogin";
import { AuthProvider } from "./context/AuthContext";
import AdminDashboard from "./pages/AdminDashboard";
import AdminRoute from "./components/auth/AdminRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider> {/* AuthProvider should wrap your router */}
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
            <Route path="/partner-dashboard" element={<PartnerDashboard />} />
            <Route path="/partner-login" element={<PharmacyLogin />} />
            <Route path="/admin" element={<AdminDashboard />} /> 
            {/* Catch-all "*" route must be last */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;