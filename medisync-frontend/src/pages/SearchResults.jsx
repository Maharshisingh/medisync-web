// src/pages/SearchResults.jsx
import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PharmacyCard from "@/components/PharmacyCard";
import { Search, Filter, MapPin, ArrowUpDown } from "lucide-react";

// ---- API call ----
const fetchMedicineSearch = async (query, lat, lng) => {
  const response = await fetch(
    `/api/users/search?name=${query}&lat=${lat}&lng=${lng}`
  );
  if (!response.ok) {
    throw new Error("Something went wrong on the server.");
  }
  return response.json();
};

// ---- Main Component ----
const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [sortBy, setSortBy] = useState("distance");
  const [filterBy, setFilterBy] = useState("all");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);

  const medicineName = searchParams.get("q") || "";

  // Get user location from settings or default
  const getUserLocation = () => {
    const saved = localStorage.getItem("locationSettings");
    if (saved) {
      const settings = JSON.parse(saved);
      if (settings.enabled && settings.latitude && settings.longitude) {
        return { lat: settings.latitude, lng: settings.longitude };
      }
    }
    return { lat: 19.0760, lng: 72.8777 }; // Default Mumbai
  };
  
  const userLocation = getUserLocation();

  // Fetch data with react-query
  const {
    data: results = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["medicineSearch", medicineName],
    queryFn: () =>
      fetchMedicineSearch(medicineName, userLocation.lat, userLocation.lng),
    enabled: !!medicineName && medicineName.length > 0,
    retry: 1,
  });

  // Derived state: filtering + sorting
  const [displayResults, setDisplayResults] = useState([]);

  useEffect(() => {
    if (!results) return;

    let filtered = [...results];

    // Filter
    if (filterBy === "available") {
      filtered = filtered.filter((r) => r.quantity > 0);
    } else if (filterBy === "open") {
      filtered = filtered.filter((r) => r.pharmacy.isOpen);
    }

    // Sort
    if (sortBy === "price-low") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating") {
      filtered.sort(
        (a, b) => (b.pharmacy.rating || 0) - (a.pharmacy.rating || 0)
      );
    } else if (sortBy === "distance") {
      filtered.sort((a, b) => a.distance - b.distance);
    }

    setDisplayResults(filtered);
  }, [results, filterBy, sortBy]);

  // Helpers
  const formatDistance = (meters) => {
    if (meters < 1000) return `${Math.round(meters)} m`;
    return `${(meters / 1000).toFixed(1)} km`;
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery.trim() });
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
    setSearchParams({ q: medicineName });
  };

  const availableCount = displayResults.filter((r) => r.quantity > 0).length;
  const averagePrice =
    displayResults.length > 0
      ? Math.round(
          displayResults.reduce((sum, r) => sum + r.price, 0) /
            displayResults.length
        )
      : 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Search Results for "{medicineName}"
          </h1>

          {/* Stats */}
          {!isLoading && !isError && results && results.length > 0 && (
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
              <span>{displayResults.length} pharmacies found</span>
              <span>•</span>
              <span>{availableCount} have it in stock</span>
              <span>•</span>
              <span>Avg. price: ₹{averagePrice}</span>
            </div>
          )}

          {/* New Search */}
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                ref={inputRef}
                type="text"
                placeholder="Search for another medicine..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="pl-9"
              />
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-b-md shadow-lg z-10 max-h-60 overflow-y-auto">
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
            <Button type="submit" className="w-full sm:w-auto">Search</Button>
          </form>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="space-y-4">
            <p>Searching for pharmacies...</p>
            <Skeleton className="h-48 w-full rounded-lg" />
            <Skeleton className="h-48 w-full rounded-lg" />
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="card-medical p-6 text-center">
            <p className="text-destructive">
              Error: {error.message}
            </p>
          </div>
        )}

        {/* Filters + Sorting */}
        {!isLoading && !isError && results && results.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-4 mb-6 p-4 bg-surface-muted rounded-lg">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filters:</span>
              </div>
              <Select value={filterBy} onValueChange={setFilterBy}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="available">In Stock</SelectItem>
                  <SelectItem value="open">Open Now</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <div className="flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Sort by:</span>
              </div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="distance">Distance</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Results */}
        {!isLoading && !isError && (
          <div className="space-y-4">
            {displayResults.length > 0 ? (
              displayResults.map((result) => (
                <PharmacyCard
                  key={result.pharmacy.id}
                  medicineName={result.medicine.name}
                  pharmacy={{
                    id: result.pharmacy.id,
                    name: result.pharmacy.name,
                    address: result.pharmacy.address,
                    distance: formatDistance(result.distance),
                    phone: result.pharmacy.contactNumber || "9876543210",
                    rating: result.pharmacy.rating || 0,
                    reviewCount: result.pharmacy.numReviews || 0,
                    isOpen: result.pharmacy.isOpen ?? true,
                    availability:
                      result.quantity > 10
                        ? "available"
                        : result.quantity > 0
                        ? "limited"
                        : "out-of-stock",
                    price: result.price,
                    lastUpdated: "Just now",
                    location: result.pharmacy.location,
                  }}
                />
              ))
            ) : (
              <div className="text-center py-12">
                <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No pharmacies found
                </h3>
                <p className="text-muted-foreground mb-6">
                  Try adjusting your filters or search for a different medicine.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSortBy("distance");
                    setFilterBy("all");
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default SearchResults;
