import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Phone, Star, Plus, Minus, ShoppingCart, MessageSquare, Search, Filter } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { apiUrl } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const PharmacyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [pharmacy, setPharmacy] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [cart, setCart] = useState({});
  const [loading, setLoading] = useState(true);
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [stockFilter, setStockFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("medicines");

  useEffect(() => {
    fetchPharmacyDetails();
    fetchInventory();
    fetchReviews();
  }, [id]);

  useEffect(() => {
    filterInventory();
  }, [inventory, searchTerm, stockFilter]);

  const filterInventory = () => {
    let filtered = inventory.filter(medicine => {
      const name = medicine?.medicine?.name || medicine?.name || '';
      const manufacturer = medicine?.medicine?.manufacturer || medicine?.manufacturer || '';
      const searchLower = searchTerm.toLowerCase();
      
      return name.toLowerCase().includes(searchLower) ||
             manufacturer.toLowerCase().includes(searchLower);
    });

    if (stockFilter === "instock") {
      filtered = filtered.filter(m => m.quantity > 0);
    } else if (stockFilter === "outofstock") {
      filtered = filtered.filter(m => m.quantity === 0);
    }

    setFilteredInventory(filtered);
  };

  const fetchPharmacyDetails = async () => {
    try {
      const response = await fetch(apiUrl(`api/pharmacies/${id}`));
      const data = await response.json();
      setPharmacy(data);
    } catch (error) {
      console.error("Error fetching pharmacy:", error);
    }
  };

  const fetchInventory = async () => {
    try {
      const response = await fetch(apiUrl(`api/pharmacies/${id}/inventory`));
      const data = await response.json();
      setInventory(data);
    } catch (error) {
      console.error("Error fetching inventory:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await fetch(apiUrl(`api/pharmacies/${id}/reviews`));
      const data = await response.json();
      setReviews(data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const updateQuantity = (medicineId, change) => {
    setCart(prev => {
      const current = prev[medicineId] || 0;
      const newQuantity = Math.max(0, current + change);
      if (newQuantity === 0) {
        const { [medicineId]: removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [medicineId]: newQuantity };
    });
  };

  const submitReview = async () => {
    if (!token) {
      alert("Please login to submit a review");
      return;
    }

    try {
      const response = await fetch(apiUrl(`api/pharmacies/${id}/reviews`), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating, comment: reviewText }),
      });

      if (response.ok) {
        setReviewText("");
        setRating(5);
        fetchReviews();
        alert("Review submitted successfully!");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
    }
  };

  const getTotalItems = () => {
    return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  };

  const getTotalPrice = () => {
    return Object.entries(cart).reduce((sum, [medicineId, qty]) => {
      const medicine = inventory.find(m => m._id === medicineId);
      return sum + (medicine?.price || 0) * qty;
    }, 0);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        {pharmacy && (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{pharmacy.name}</CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <MapPin className="h-4 w-4" />
                    <span>{pharmacy.address}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Phone className="h-4 w-4" />
                    <span>{pharmacy.contactNumber}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{pharmacy.rating || 0}</span>
                  <span className="text-muted-foreground">({reviews.length} reviews)</span>
                </div>
              </div>
            </CardHeader>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="medicines">Medicines ({filteredInventory.length})</TabsTrigger>
                <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
              </TabsList>
              
              <TabsContent value="medicines" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Available Medicines</CardTitle>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search medicines..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-9"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant={stockFilter === "all" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setStockFilter("all")}
                        >
                          All
                        </Button>
                        <Button
                          variant={stockFilter === "instock" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setStockFilter("instock")}
                        >
                          In Stock
                        </Button>
                        <Button
                          variant={stockFilter === "outofstock" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setStockFilter("outofstock")}
                        >
                          Out of Stock
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {filteredInventory.length > 0 ? filteredInventory.map((item) => {
                        const medicine = item.medicine || item;
                        return (
                        <div key={item._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="flex-1">
                            <h3 className="font-medium">{medicine.name}</h3>
                            <p className="text-sm text-muted-foreground">{medicine.manufacturer}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="font-bold text-primary">₹{item.price}</span>
                              <Badge variant={item.quantity > 10 ? "default" : item.quantity > 0 ? "secondary" : "destructive"}>
                                {item.quantity > 0 ? `${item.quantity} in stock` : "Out of stock"}
                              </Badge>
                            </div>
                          </div>
                          
                          {item.quantity > 0 && (
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateQuantity(item._id, -1)}
                                disabled={!cart[item._id]}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="w-8 text-center font-medium">{cart[item._id] || 0}</span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateQuantity(item._id, 1)}
                                disabled={cart[item._id] >= item.quantity}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                        );
                      }) : (
                        <div className="text-center py-8 text-muted-foreground">
                          No medicines found matching your criteria
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Customer Reviews</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {reviews.length > 0 ? reviews.map((review, index) => (
                        <div key={index} className="border-b pb-4 last:border-b-0">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                                />
                              ))}
                            </div>
                            <span className="font-medium">{review.user?.name || "Anonymous"}</span>
                          </div>
                          <p className="text-muted-foreground">{review.comment}</p>
                        </div>
                      )) : (
                        <div className="text-center py-8 text-muted-foreground">
                          No reviews yet. Be the first to review!
                        </div>
                      )}
                      
                      {token && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" className="w-full">
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Write a Review
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Write a Review</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <label className="text-sm font-medium">Rating</label>
                                <div className="flex gap-1 mt-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className={`h-6 w-6 cursor-pointer transition-colors ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300 hover:text-yellow-200"}`}
                                      onClick={() => setRating(star)}
                                    />
                                  ))}
                                </div>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Comment</label>
                                <Textarea
                                  value={reviewText}
                                  onChange={(e) => setReviewText(e.target.value)}
                                  placeholder="Share your experience..."
                                  className="mt-1"
                                />
                              </div>
                              <Button onClick={submitReview} className="w-full">
                                Submit Review
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Cart Summary</CardTitle>
              </CardHeader>
              <CardContent>
                {getTotalItems() > 0 ? (
                  <div className="space-y-4">
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {Object.entries(cart).map(([medicineId, qty]) => {
                        const medicine = inventory.find(m => m._id === medicineId);
                        return (
                          <div key={medicineId} className="flex justify-between text-sm p-2 bg-muted/50 rounded">
                            <span className="font-medium">{medicine?.name} x{qty}</span>
                            <span className="text-primary font-medium">₹{(medicine?.price || 0) * qty}</span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between font-medium">
                        <span>Total ({getTotalItems()} items)</span>
                        <span>₹{getTotalPrice()}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Button className="w-full" onClick={() => window.open(`tel:${pharmacy?.contactNumber}`, '_self')}>
                        <Phone className="h-4 w-4 mr-2" />
                        Call to Order
                      </Button>
                      <Button variant="outline" className="w-full" onClick={() => setCart({})}>
                        Clear Cart
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center">No items in cart</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PharmacyDetail;