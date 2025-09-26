// src/pages/SearchResults.tsx
import { useState, useEffect } from "react";
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
const fetchMedicineSearch = async (query: string, lat: number, lng: number) => {
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

  const medicineName = searchParams.get("q") || "";

  // Fixed user location (later replace with geolocation)
  const userLocation = { lat: 18.52, lng: 73.85 };

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
    enabled: !!medicineName,
  });

  // Derived state: filtering + sorting
  const [displayResults, setDisplayResults] = useState<any[]>([]);

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
  const formatDistance = (meters: number) => {
    if (meters < 1000) return `${Math.round(meters)} m`;
    return `${(meters / 1000).toFixed(1)} km`;
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery.trim() });
    }
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
          <form onSubmit={handleSearch} className="flex gap-3 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for another medicine..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button type="submit">Search</Button>
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
              Error: {(error as Error).message}
            </p>
          </div>
        )}

        {/* Filters + Sorting */}
        {!isLoading && !isError && results && results.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-4 mb-6 p-4 bg-surface-muted rounded-lg">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters:</span>
              <Select value={filterBy} onValueChange={setFilterBy}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="available">In Stock</SelectItem>
                  <SelectItem value="open">Open Now</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Sort by:</span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-36">
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
              displayResults.map((result: any) => (
                <PharmacyCard
                  key={result.pharmacy.id}
                  medicineName={result.medicine.name}
                  pharmacy={{
                    id: result.pharmacy.id,
                    name: result.pharmacy.name,
                    address: result.pharmacy.address,
                    distance: formatDistance(result.distance),
                    phone: result.pharmacy.phone || "9876543210",
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
