import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { User, MapPin, Settings, Save, ShoppingBag, Phone, Calendar } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { apiUrl } from "@/lib/api";

const UserProfile = () => {
  const { user, token } = useAuth();
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: ""
  });
  const [locationSettings, setLocationSettings] = useState({
    enabled: false,
    radius: 5,
    latitude: null,
    longitude: null
  });
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    if (user) {
      fetchUserProfile();
      loadLocationSettings();
      fetchOrders();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(apiUrl("api/users/profile"), {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadLocationSettings = () => {
    const saved = localStorage.getItem("locationSettings");
    if (saved) {
      setLocationSettings(JSON.parse(saved));
    }
  };

  const fetchOrders = () => {
    // Mock orders data - replace with actual API call
    const mockOrders = [
      {
        id: "ORD001",
        date: "2024-01-15",
        pharmacy: "City Pharmacy",
        items: [{name: "Paracetamol", quantity: 2, price: 50}],
        total: 100,
        status: "Completed"
      },
      {
        id: "ORD002", 
        date: "2024-01-10",
        pharmacy: "Health Plus",
        items: [{name: "Crocin", quantity: 1, price: 25}],
        total: 25,
        status: "Purchased"
      },
      {
        id: "ORD003", 
        date: "2024-01-08",
        pharmacy: "MedCare",
        items: [{name: "Aspirin", quantity: 1, price: 30}],
        total: 30,
        status: "Contacted"
      }
    ];
    setOrders(mockOrders);
  };

  const saveLocationSettings = (newSettings) => {
    setLocationSettings(newSettings);
    localStorage.setItem("locationSettings", JSON.stringify(newSettings));
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newSettings = {
            ...locationSettings,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            enabled: true
          };
          saveLocationSettings(newSettings);
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Unable to get your location. Please enable location services.");
        }
      );
    }
  };

  const updateProfile = async () => {
    try {
      const response = await fetch(apiUrl("api/users/profile"), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(profile)
      });
      
      if (response.ok) {
        alert("Profile updated successfully!");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-2 mb-6">
            <User className="h-6 w-6" />
            <h1 className="text-2xl font-bold">My Account</h1>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="orders">My Orders ({orders.length})</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">

              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => setProfile({...profile, name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({...profile, email: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={profile.phone}
                  onChange={(e) => setProfile({...profile, phone: e.target.value})}
                />
              </div>
                <Button onClick={updateProfile} className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>
            </TabsContent>

            <TabsContent value="orders" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5" />
                    Order History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {orders.length > 0 ? (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-medium">Order #{order.id}</h3>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {new Date(order.date).toLocaleDateString()}
                              </p>
                            </div>
                            <Badge variant={
                              order.status === "Completed" ? "default" : 
                              order.status === "Purchased" ? "secondary" : 
                              "outline"
                            }>
                              {order.status}
                            </Badge>
                          </div>
                          
                          <div className="space-y-2 mb-3">
                            <p className="text-sm font-medium">{order.pharmacy}</p>
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between text-sm">
                                <span>{item.name} x{item.quantity}</span>
                                <span>₹{item.price * item.quantity}</span>
                              </div>
                            ))}
                          </div>
                          
                          <div className="flex justify-between items-center pt-2 border-t">
                            <span className="font-medium">Total: ₹{order.total}</span>
                            <Button variant="outline" size="sm">
                              <Phone className="h-4 w-4 mr-2" />
                              Contact Pharmacy
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No orders yet</p>
                      <p className="text-sm">Your order history will appear here</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Location Settings
                  </CardTitle>
                </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Location Services</Label>
                  <p className="text-sm text-muted-foreground">
                    Find nearby pharmacies based on your location
                  </p>
                </div>
                <Switch
                  checked={locationSettings.enabled}
                  onCheckedChange={(enabled) => {
                    if (enabled) {
                      getCurrentLocation();
                    } else {
                      saveLocationSettings({...locationSettings, enabled: false});
                    }
                  }}
                />
              </div>

              {locationSettings.enabled && (
                <>
                  <div>
                    <Label>Search Radius</Label>
                    <Select
                      value={locationSettings.radius.toString()}
                      onValueChange={(value) => 
                        saveLocationSettings({...locationSettings, radius: parseInt(value)})
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 km</SelectItem>
                        <SelectItem value="2">2 km</SelectItem>
                        <SelectItem value="5">5 km</SelectItem>
                        <SelectItem value="10">10 km</SelectItem>
                        <SelectItem value="20">20 km</SelectItem>
                        <SelectItem value="50">50 km</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {locationSettings.latitude && locationSettings.longitude && (
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium">Current Location:</p>
                      <p className="text-sm text-muted-foreground">
                        Lat: {locationSettings.latitude.toFixed(4)}, 
                        Lng: {locationSettings.longitude.toFixed(4)}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={getCurrentLocation}
                        className="mt-2"
                      >
                        Update Location
                      </Button>
                    </div>
                  )}
                  </>
                )}
              </CardContent>
            </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Preferences
                  </CardTitle>
                </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive updates about medicine availability
                    </p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Get SMS alerts for important updates
                    </p>
                  </div>
                  <Switch />
                  </div>
                </div>
              </CardContent>
            </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default UserProfile;