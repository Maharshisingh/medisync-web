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
        <div className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary"><Stethoscope className="h-5 w-5 text-primary-foreground" /></div>
          <span className="text-xl font-bold text-medical-blue">MediSync</span>
        </div>

        <nav className="hidden md:flex items-center space-x-6">
          {/* Navigation links can be added here if needed */}
        </nav>

        <div className="hidden md:flex items-center space-x-3">
          {token || localStorage.getItem('pharmacy_token') ? (
            <>
              {localStorage.getItem('pharmacy_token') ? (
                <Button variant="outline" size="sm" onClick={() => {
                  localStorage.removeItem('pharmacy_token');
                  window.location.href = '/partner-login';
                }}>
                  <LogOut className="h-4 w-4 mr-2" /> Logout
                </Button>
              ) : (
                <>
                  <Button variant="ghost" size="sm" disabled>
                    <User className="h-4 w-4 mr-2" />
                    My Profile {user?.role === 'admin' && '(Admin)'}
                  </Button>
                  {user?.role === 'admin' && (
                    <Button variant="secondary" size="sm" asChild>
                      <Link to="/admin"><Shield className="h-4 w-4 mr-2" /> Admin Panel</Link>
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={logout}>
                    <LogOut className="h-4 w-4 mr-2" /> Logout
                  </Button>
                </>
              )}
            </>
          ) : (
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
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <div className="container py-4 space-y-2">
            {token || localStorage.getItem('pharmacy_token') ? (
              <>
                {localStorage.getItem('pharmacy_token') ? (
                  <Button 
                    variant="outline" 
                    className="w-full justify-start" 
                    onClick={() => {
                      localStorage.removeItem('pharmacy_token');
                      setIsMenuOpen(false);
                      window.location.href = '/partner-login';
                    }}
                  >
                    <LogOut className="h-4 w-4 mr-2" /> Logout
                  </Button>
                ) : (
                  <>
                    <Button variant="ghost" className="w-full justify-start" disabled>
                      <User className="h-4 w-4 mr-2" />
                      My Profile {user?.role === 'admin' && '(Admin)'}
                    </Button>
                    {user?.role === 'admin' && (
                      <Button variant="secondary" className="w-full justify-start" asChild>
                        <Link to="/admin" onClick={() => setIsMenuOpen(false)}><Shield className="h-4 w-4 mr-2" /> Admin Panel</Link>
                      </Button>
                    )}
                    <Button variant="outline" className="w-full justify-start" onClick={() => { logout(); setIsMenuOpen(false); }}>
                      <LogOut className="h-4 w-4 mr-2" /> Logout
                    </Button>
                  </>
                )}
              </>
            ) : (
              <>
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link to="/login" onClick={() => setIsMenuOpen(false)}><User className="h-4 w-4 mr-2" /> Login</Link>
                </Button>
                <Button variant="default" className="w-full justify-start" asChild>
                  <Link to="/register" onClick={() => setIsMenuOpen(false)}>Sign Up</Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/partner-login" onClick={() => setIsMenuOpen(false)}><Shield className="h-4 w-4 mr-2" /> Partner Portal</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
export default Header;