import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Clock, Shield } from "lucide-react";

const HeroSection = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSuggestions(false);
    }
  };

  const fetchSuggestions = async (query) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }
    try {
      const response = await fetch(`/api/users/suggestions?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      setSuggestions(data);
    } catch (error) {
      setSuggestions([]);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSuggestions(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSuggestionClick = (medicineName) => {
    setSearchQuery(medicineName);
    setShowSuggestions(false);
    navigate(`/search?q=${encodeURIComponent(medicineName)}`);
  };

  return (
    <section className="relative py-20 lg:py-32 overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 hero-gradient opacity-90" />
      
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj4KPGcgZmlsbD0iIzAwMCIgZmlsbC1vcGFjaXR5PSIwLjAzIj4KPHBhdGggZD0iTTM2IDM0djJoMnYtMmgtMnptLTEwIDRWMGgydjM4aC0yem0tOCA0VjBoMnY0MmgtMnptMTQgNFYwaDJ2NDZoLTJ6Ii8+CjwvZz4KPC9nPgo8L3N2Zz4=')] opacity-20" />
      
      <div className="container relative">
        <div className="mx-auto max-w-4xl text-center">
          {/* Hero Content */}
          <div className="animate-fade-in">
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6">
              Find Your Medicine at
              <span className="block text-medical-green">Local Pharmacies</span>
            </h1>
            <p className="text-xl lg:text-2xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
              Compare prices, check availability, and support your neighborhood pharmacies. 
              Fast, reliable, and always nearby.
            </p>
          </div>

          {/* Search Bar */}
          <div className="animate-slide-up">
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-12">
              <div className="relative flex items-center bg-white rounded-xl shadow-[var(--shadow-elevated)] overflow-hidden">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    ref={inputRef}
                    type="text"
                    placeholder="Search for medicines (e.g., Paracetamol, Vitamin D, etc.)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    className="pl-12 pr-4 py-6 text-lg border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
                  />
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-b-xl shadow-lg z-10 max-h-60 overflow-y-auto">
                      {suggestions.map((medicine, index) => (
                        <div
                          key={index}
                          className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                          onClick={() => handleSuggestionClick(medicine.name)}
                        >
                          <div className="font-medium text-gray-900">{medicine.name}</div>
                          <div className="text-sm text-gray-500">{medicine.manufacturer}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <Button type="submit" size="lg" className="m-2 btn-medical">
                  <Search className="h-5 w-5 mr-2" />
                  Search
                </Button>
              </div>
            </form>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto animate-slide-up">
            <div className="card-medical bg-white/10 backdrop-blur-sm border-white/20 text-white p-6">
              <MapPin className="h-10 w-10 text-medical-green mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nearby Pharmacies</h3>
              <p className="text-white/80 text-sm">
                Find medicines within 5-10km radius from your location
              </p>
            </div>
            <div className="card-medical bg-white/10 backdrop-blur-sm border-white/20 text-white p-6">
              <Clock className="h-10 w-10 text-medical-green mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Real-time Updates</h3>
              <p className="text-white/80 text-sm">
                Live inventory and pricing information from partner stores
              </p>
            </div>
            <div className="card-medical bg-white/10 backdrop-blur-sm border-white/20 text-white p-6">
              <Shield className="h-10 w-10 text-medical-green mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Trusted Network</h3>
              <p className="text-white/80 text-sm">
                Verified pharmacies with authentic medicines and fair pricing
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;