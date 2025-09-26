// src/components/Header.tsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, Stethoscope, User, Shield, Menu, X, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext"; // <-- Import our hook

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { token, user, logout } = useAuth(); // <-- Get token, user, and logout function

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary"><Stethoscope className="h-5 w-5 text-primary-foreground" /></div>
          <span className="text-xl font-bold text-medical-blue">MediSync</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/search" className="text-sm font-medium text-foreground hover:text-primary transition-colors">Find Medicine</Link>
          {/* You can add more links here later */}
        </nav>

        {/* --- NEW: Conditionally Render Buttons --- */}
        <div className="hidden md:flex items-center space-x-3">
          {token ? (
            // If a token exists, show Profile and Logout
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/profile">
                  <User className="h-4 w-4 mr-2" />
                  My Profile {user?.role === 'admin' && '(Admin)'}
                </Link>
              </Button>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" /> Logout
              </Button>
            </>
          ) : (
            // Otherwise, show Login and Sign Up
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login"><User className="h-4 w-4 mr-2" /> Login</Link>
              </Button>
              <Button variant="default" size="sm" asChild>
                <Link to="/register">Sign Up</Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link to="/partner-login"><Shield className="h-4 w-4 mr-2" /> Partner Portal</Link>
              </Button>
            </>
          )}
        </div>

        <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X /> : <Menu />}
        </button>
      </div>
      {/* You can update the mobile menu with similar logic later */}
    </header>
  );
};
export default Header;