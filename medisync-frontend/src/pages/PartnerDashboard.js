// src/pages/PartnerDashboard.jsx
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Package, Plus, Edit, Trash2, Upload, TrendingUp, Users, ShoppingCart, Star, Phone, MapPin, Mail, Search, Filter, Download, RefreshCw, AlertTriangle, CheckCircle, Clock, DollarSign, BarChart3, Activity, Eye, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

const fetchMyInventory = async () => {
  const token = localStorage.getItem('pharmacy_token');
  if (!token) throw new Error("No authorization token found. Please log in.");
  const response = await fetch('/api/pharmacies/inventory/me', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!response.ok) {
    if (response.status === 401) throw new Error("Authentication failed. Please log in again.");
    throw new Error("Failed to fetch inventory.");
  }
  return response.json();
};

const fetchPharmacyProfile = async () => {
  const token = localStorage.getItem('pharmacy_token');
  if (!token) throw new Error("No authorization token found. Please log in.");
  const response = await fetch('/api/pharmacies/profile', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!response.ok) throw new Error("Failed to fetch profile.");
  return response.json();
};

const PartnerDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAddingMedicine, setIsAddingMedicine] = useState(false);
  const [newMedicine, setNewMedicine] = useState({ name: '', manufacturer: '', price: '', quantity: '' });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [medicineToDelete, setMedicineToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isProfileEditOpen, setIsProfileEditOpen] = useState(false);
  const [editProfile, setEditProfile] = useState({ pharmacyName: '', contactNumber: '', address: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: inventory, isLoading, isError, error } = useQuery({
    queryKey: ['myPharmacyInventory'],
    queryFn: fetchMyInventory,
  });

  const { data: profile } = useQuery({
    queryKey: ['pharmacyProfile'],
    queryFn: fetchPharmacyProfile,
  });

  useEffect(() => {
    if (!localStorage.getItem('pharmacy_token')) {
      navigate('/partner-login');
    }
  }, [navigate]);

  useEffect(() => {
    if (profile) {
      setEditProfile({
        pharmacyName: profile.pharmacyName || '',
        contactNumber: profile.contactNumber || '',
        address: profile.address || ''
      });
    }
  }, [profile]);

  const handleFileSelectAndUpload = async (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const token = localStorage.getItem('pharmacy_token');
    const formData = new FormData();
    formData.append('inventoryFile', file);

    try {
      const response = await fetch('/api/pharmacies/inventory/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.msg || 'Upload failed.');

      toast({ title: "Success!", description: "Inventory has been updated." });
      queryClient.invalidateQueries({ queryKey: ['myPharmacyInventory'] });
    } catch (err) {
      toast({ title: "Upload Failed", description: err.message, variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddMedicine = async () => {
    if (!newMedicine.name || !newMedicine.price || !newMedicine.quantity) {
      toast({ title: "Error", description: "Please fill all required fields", variant: "destructive" });
      return;
    }

    setIsAddingMedicine(true);
    const token = localStorage.getItem('pharmacy_token');

    try {
      const response = await fetch('/api/pharmacies/inventory/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newMedicine.name.trim(),
          manufacturer: newMedicine.manufacturer.trim() || 'N/A',
          price: parseFloat(newMedicine.price),
          quantity: parseInt(newMedicine.quantity)
        })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.msg || 'Failed to add medicine');

      toast({ title: "Success!", description: "Medicine added successfully" });
      setNewMedicine({ name: '', manufacturer: '', price: '', quantity: '' });
      setIsDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['myPharmacyInventory'] });
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsAddingMedicine(false);
    }
  };

  const getStatusBadge = (stock) => {
    if (stock === 0) return <Badge variant="destructive">Out of Stock</Badge>;
    if (stock < 50) return <Badge className="bg-yellow-500 text-white">Low Stock</Badge>;
    return <Badge className="bg-green-500 text-white">In Stock</Badge>;
  };

  const getInventoryStats = () => {
    if (!inventory) return { total: 0, inStock: 0, lowStock: 0, outOfStock: 0, totalValue: 0 };
    
    const stats = inventory.reduce((acc, item) => {
      acc.total += 1;
      acc.totalValue += item.price * item.quantity;
      if (item.quantity === 0) acc.outOfStock += 1;
      else if (item.quantity < 50) acc.lowStock += 1;
      else acc.inStock += 1;
      return acc;
    }, { total: 0, inStock: 0, lowStock: 0, outOfStock: 0, totalValue: 0 });
    
    return stats;
  };

  const stats = getInventoryStats();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        {/* Dashboard Header */}
        <div className="flex flex-col gap-3 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Partner Dashboard</h1>
              <p className="text-sm sm:text-base text-muted-foreground">Manage your pharmacy operations and inventory</p>
            </div>
            <Badge variant="outline" className="text-xs w-fit">
              {profile?.isApproved ? 'Verified Partner' : 'Pending Verification'}
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-4 h-10 sm:h-12 bg-muted p-1">
            <TabsTrigger value="overview" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 data-[state=active]:bg-background text-xs sm:text-sm">
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="inventory" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 data-[state=active]:bg-background text-xs sm:text-sm">
              <Package className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline sm:inline">Inventory</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 data-[state=active]:bg-background text-xs sm:text-sm">
              <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 data-[state=active]:bg-background text-xs sm:text-sm">
              <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline sm:inline">Profile</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
              <Card className="border-l-4 border-l-primary">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
                  <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Total Medicines</CardTitle>
                  <Package className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </CardHeader>
                <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                  <div className="text-xl sm:text-3xl font-bold text-foreground">{stats.total}</div>
                  <p className="text-xs text-muted-foreground mt-1">Active products</p>
                </CardContent>
              </Card>
              
              <Card className="border-l-4 border-l-green-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
                  <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">In Stock</CardTitle>
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                </CardHeader>
                <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                  <div className="text-xl sm:text-3xl font-bold text-green-600">{stats.inStock}</div>
                  <p className="text-xs text-muted-foreground mt-1">{((stats.inStock/stats.total)*100).toFixed(1)}% availability</p>
                </CardContent>
              </Card>
              
              <Card className="border-l-4 border-l-yellow-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
                  <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Low Stock Alert</CardTitle>
                  <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
                </CardHeader>
                <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                  <div className="text-xl sm:text-3xl font-bold text-yellow-600">{stats.lowStock}</div>
                  <p className="text-xs text-muted-foreground mt-1">Needs restocking</p>
                </CardContent>
              </Card>
              
              <Card className="border-l-4 border-l-blue-500 col-span-2 lg:col-span-1">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
                  <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Inventory Value</CardTitle>
                  <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                </CardHeader>
                <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                  <div className="text-xl sm:text-3xl font-bold text-blue-600">₹{stats.totalValue.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground mt-1">Total stock worth</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
                <CardDescription>Manage your pharmacy operations efficiently</CardDescription>
              </CardHeader>
              <CardContent>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileSelectAndUpload}
                  className="hidden"
                  accept=".xlsx, .csv"
                />
                <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
                  <Button className="h-16 sm:h-20 flex-col gap-1 sm:gap-2 text-sm" variant="outline" onClick={() => setIsDialogOpen(true)}>
                    <Plus className="h-5 w-5 sm:h-6 sm:w-6" />
                    <span>Add Medicine</span>
                  </Button>
                  <Button className="h-16 sm:h-20 flex-col gap-1 sm:gap-2 text-sm" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                    <Upload className="h-5 w-5 sm:h-6 sm:w-6" />
                    <span>{isUploading ? 'Uploading...' : 'Bulk Import'}</span>
                  </Button>
                  <Button className="h-16 sm:h-20 flex-col gap-1 sm:gap-2 text-sm" variant="outline" onClick={() => {
                    setIsRefreshing(true);
                    queryClient.invalidateQueries({ queryKey: ['myPharmacyInventory'] });
                    setTimeout(() => setIsRefreshing(false), 1000);
                  }} disabled={isRefreshing}>
                    <RefreshCw className={`h-5 w-5 sm:h-6 sm:w-6 ${isRefreshing ? 'animate-spin' : ''}`} />
                    <span>{isRefreshing ? 'Refreshing...' : 'Refresh Data'}</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Stock Status Overview */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Stock Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>In Stock ({stats.inStock})</span>
                      <span>{((stats.inStock/stats.total)*100).toFixed(1)}%</span>
                    </div>
                    <Progress value={(stats.inStock/stats.total)*100} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Low Stock ({stats.lowStock})</span>
                      <span>{((stats.lowStock/stats.total)*100).toFixed(1)}%</span>
                    </div>
                    <Progress value={(stats.lowStock/stats.total)*100} className="h-2 [&>div]:bg-yellow-500" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Out of Stock ({stats.outOfStock})</span>
                      <span>{((stats.outOfStock/stats.total)*100).toFixed(1)}%</span>
                    </div>
                    <Progress value={(stats.outOfStock/stats.total)*100} className="h-2 [&>div]:bg-red-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Avg. Medicine Price</span>
                    <span className="text-lg font-bold">₹{Math.round(stats.totalValue / stats.total) || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Stock Health Score</span>
                    <Badge variant={stats.inStock > stats.lowStock + stats.outOfStock ? "default" : "secondary"}>
                      {stats.inStock > stats.lowStock + stats.outOfStock ? "Good" : "Needs Attention"}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Last Updated</span>
                    <span className="text-sm text-muted-foreground">Just now</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="inventory" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Medicine Inventory
                    </CardTitle>
                    <CardDescription>Manage your medicines and stock levels efficiently</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileSelectAndUpload}
                      className="hidden"
                      accept=".xlsx, .csv"
                    />
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {isUploading ? 'Uploading...' : 'Import Excel'}
                    </Button>
                    <Button size="sm" onClick={() => setIsDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />Add Medicine
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              {/* Search and Filter Controls */}
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search medicines..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 sm:gap-3">
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="flex-1 sm:w-48">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Items</SelectItem>
                        <SelectItem value="in-stock">In Stock</SelectItem>
                        <SelectItem value="low-stock">Low Stock</SelectItem>
                        <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm" onClick={() => setIsRefreshing(true)} disabled={isRefreshing} className="px-3">
                      <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''} sm:mr-2`} />
                      <span className="hidden sm:inline">Refresh</span>
                    </Button>
                  </div>
                </div>

                {/* Inventory Table */}
                {isLoading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : isError ? (
                  <div className="text-center py-8">
                    <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
                    <p className="text-destructive font-medium">Error loading inventory</p>
                    <p className="text-muted-foreground text-sm">{error.message}</p>
                  </div>
                ) : (
                  <div className="border rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <Table className="min-w-full">
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead className="font-semibold min-w-[150px]">Medicine Name</TableHead>
                            <TableHead className="font-semibold min-w-[120px] hidden sm:table-cell">Manufacturer</TableHead>
                            <TableHead className="font-semibold text-center min-w-[80px]">Stock</TableHead>
                            <TableHead className="font-semibold text-right min-w-[80px]">Price</TableHead>
                            <TableHead className="font-semibold text-center min-w-[80px]">Status</TableHead>
                            <TableHead className="font-semibold text-center min-w-[100px]">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                      <TableBody>
                        {!inventory || inventory.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-12">
                              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                              <p className="text-muted-foreground font-medium">No medicines in inventory</p>
                              <p className="text-muted-foreground text-sm">Add your first medicine to get started</p>
                            </TableCell>
                          </TableRow>
                        ) : (
                          inventory
                            .filter(item => {
                              const matchesSearch = item.medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                  item.medicine.manufacturer.toLowerCase().includes(searchTerm.toLowerCase());
                              const matchesFilter = filterStatus === 'all' || 
                                                  (filterStatus === 'in-stock' && item.quantity > 50) ||
                                                  (filterStatus === 'low-stock' && item.quantity > 0 && item.quantity <= 50) ||
                                                  (filterStatus === 'out-of-stock' && item.quantity === 0);
                              return matchesSearch && matchesFilter;
                            })
                            .map((item) => (
                              <TableRow key={item._id} className="hover:bg-muted/30">
                                <TableCell className="font-medium">
                                  <div>
                                    <div className="font-medium">{item.medicine.name}</div>
                                    <div className="text-xs text-muted-foreground sm:hidden">{item.medicine.manufacturer}</div>
                                  </div>
                                </TableCell>
                                <TableCell className="text-muted-foreground hidden sm:table-cell">{item.medicine.manufacturer}</TableCell>
                                <TableCell className="text-center font-mono text-sm">{item.quantity}</TableCell>
                                <TableCell className="text-right font-mono text-sm">₹{item.price.toLocaleString()}</TableCell>
                                <TableCell className="text-center">{getStatusBadge(item.quantity)}</TableCell>
                                <TableCell className="text-center">
                                  <div className="flex justify-center gap-1">
                                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 sm:h-8 sm:w-8">
                                      <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 sm:h-8 sm:w-8">
                                      <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 sm:h-8 sm:w-8 text-destructive hover:text-destructive">
                                      <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                        )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {/* Analytics Header */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Business Analytics
                </CardTitle>
                <CardDescription>Insights and performance metrics for your pharmacy</CardDescription>
              </CardHeader>
            </Card>

            {/* Key Performance Indicators */}
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="pb-3 px-4 sm:px-6">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Revenue Potential</CardTitle>
                </CardHeader>
                <CardContent className="px-4 sm:px-6">
                  <div className="text-xl sm:text-2xl font-bold text-green-600">₹{stats.totalValue.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground mt-1">Total inventory worth</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">Healthy portfolio</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3 px-4 sm:px-6">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Stock Efficiency</CardTitle>
                </CardHeader>
                <CardContent className="px-4 sm:px-6">
                  <div className="text-xl sm:text-2xl font-bold">{((stats.inStock/stats.total)*100).toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground mt-1">Items available</p>
                  <div className="flex items-center mt-2">
                    <CheckCircle className="h-4 w-4 text-blue-500 mr-1" />
                    <span className="text-sm text-blue-600">Good availability</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="sm:col-span-2 lg:col-span-1">
                <CardHeader className="pb-3 px-4 sm:px-6">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Medicine Price</CardTitle>
                </CardHeader>
                <CardContent className="px-4 sm:px-6">
                  <div className="text-xl sm:text-2xl font-bold">₹{Math.round(stats.totalValue / stats.total) || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">Per medicine</p>
                  <div className="flex items-center mt-2">
                    <DollarSign className="h-4 w-4 text-purple-500 mr-1" />
                    <span className="text-sm text-purple-600">Competitive pricing</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Analytics */}
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Stock Health Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium">In Stock</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{stats.inStock}</div>
                        <div className="text-xs text-muted-foreground">{((stats.inStock/stats.total)*100).toFixed(1)}%</div>
                      </div>
                    </div>
                    <Progress value={(stats.inStock/stats.total)*100} className="h-2" />
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <span className="text-sm font-medium">Low Stock</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{stats.lowStock}</div>
                        <div className="text-xs text-muted-foreground">{((stats.lowStock/stats.total)*100).toFixed(1)}%</div>
                      </div>
                    </div>
                    <Progress value={(stats.lowStock/stats.total)*100} className="h-2 [&>div]:bg-yellow-500" />
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span className="text-sm font-medium">Out of Stock</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{stats.outOfStock}</div>
                        <div className="text-xs text-muted-foreground">{((stats.outOfStock/stats.total)*100).toFixed(1)}%</div>
                      </div>
                    </div>
                    <Progress value={(stats.outOfStock/stats.total)*100} className="h-2 [&>div]:bg-red-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Business Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-900">Strong Inventory</h4>
                        <p className="text-sm text-blue-700">You have {stats.inStock} medicines in stock with good availability.</p>
                      </div>
                    </div>
                  </div>

                  {stats.lowStock > 0 && (
                    <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-yellow-900">Restock Alert</h4>
                          <p className="text-sm text-yellow-700">{stats.lowStock} medicines need restocking soon.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {stats.outOfStock > 0 && (
                    <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-red-900">Urgent Action</h4>
                          <p className="text-sm text-red-700">{stats.outOfStock} medicines are out of stock.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-start gap-3">
                      <DollarSign className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-green-900">Revenue Opportunity</h4>
                        <p className="text-sm text-green-700">Your inventory is worth ₹{stats.totalValue.toLocaleString()} in total value.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            {/* Profile Header */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Pharmacy Profile
                </CardTitle>
                <CardDescription>Manage your pharmacy information and account settings</CardDescription>
              </CardHeader>
            </Card>

            {profile ? (
              <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Basic Information</CardTitle>
                    <CardDescription>Your pharmacy details and contact information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">Pharmacy Name</Label>
                      <p className="text-lg font-semibold">{profile.pharmacyName}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">Email Address</Label>
                      <p className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        {profile.email}
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">Contact Number</Label>
                      <p className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        {profile.contactNumber}
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">Address</Label>
                      <p className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <span className="text-sm">{profile.address}</span>
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Account Status */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Account Status</CardTitle>
                    <CardDescription>Your account verification and performance metrics</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">Verification Status</Label>
                      <div className="flex items-center gap-2">
                        {profile.isApproved ? (
                          <>
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                              Verified & Approved
                            </Badge>
                          </>
                        ) : (
                          <>
                            <Clock className="h-5 w-5 text-yellow-500" />
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                              Pending Approval
                            </Badge>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">Member Since</Label>
                      <p className="text-sm">{new Date(profile.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">Rating</Label>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`h-4 w-4 ${
                                i < Math.floor(profile.rating || 0) 
                                  ? 'text-yellow-400 fill-yellow-400' 
                                  : 'text-gray-300'
                              }`} 
                            />
                          ))}
                        </div>
                        <span className="text-sm font-medium">
                          {(profile.rating || 0).toFixed(1)} ({profile.numReviews || 0} reviews)
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">Total Medicines</Label>
                      <p className="text-2xl font-bold text-primary">{stats.total}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Account Actions */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-lg">Account Management</CardTitle>
                    <CardDescription>Update your information and manage account settings</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap lg:gap-3">
                      <Button variant="outline" onClick={() => setIsProfileEditOpen(true)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                      <Button variant="outline" onClick={() => {
                        toast({ title: "Settings", description: "Account settings feature coming soon!" });
                      }}>
                        <Settings className="h-4 w-4 mr-2" />
                        Account Settings
                      </Button>
                      <Button variant="outline" onClick={() => {
                        const csvContent = inventory?.map(item => 
                          `${item.medicine.name},${item.medicine.manufacturer},${item.quantity},${item.price}`
                        ).join('\n');
                        const blob = new Blob([`Medicine Name,Manufacturer,Quantity,Price\n${csvContent}`], { type: 'text/csv' });
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${profile?.pharmacyName || 'pharmacy'}-inventory-${new Date().toISOString().split('T')[0]}.csv`;
                        a.click();
                        window.URL.revokeObjectURL(url);
                        toast({ title: "Success", description: "Inventory report downloaded successfully!" });
                      }}>
                        <Download className="h-4 w-4 mr-2" />
                        Download Reports
                      </Button>
                      <Button variant="outline" className="text-destructive hover:text-destructive" onClick={() => {
                        if (window.confirm('Are you sure you want to deactivate your account? This action cannot be undone.')) {
                          toast({ 
                            title: "Account Deactivation", 
                            description: "Please contact support to deactivate your account.",
                            variant: "destructive"
                          });
                        }
                      }}>
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Deactivate Account
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="py-8">
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Add Medicine Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Medicine</DialogTitle>
              <DialogDescription>Add a new medicine to your inventory</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Medicine Name *</Label>
                <Input
                  id="name"
                  value={newMedicine.name}
                  onChange={(e) => setNewMedicine({...newMedicine, name: e.target.value})}
                  placeholder="Enter medicine name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="manufacturer">Manufacturer</Label>
                <Input
                  id="manufacturer"
                  value={newMedicine.manufacturer}
                  onChange={(e) => setNewMedicine({...newMedicine, manufacturer: e.target.value})}
                  placeholder="Enter manufacturer name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="price">Price (₹) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={newMedicine.price}
                  onChange={(e) => setNewMedicine({...newMedicine, price: e.target.value})}
                  placeholder="Enter price"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={newMedicine.quantity}
                  onChange={(e) => setNewMedicine({...newMedicine, quantity: e.target.value})}
                  placeholder="Enter quantity"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddMedicine} disabled={isAddingMedicine}>
                {isAddingMedicine ? 'Adding...' : 'Add Medicine'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Profile Dialog */}
        <Dialog open={isProfileEditOpen} onOpenChange={setIsProfileEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
              <DialogDescription>Update your pharmacy information</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="editPharmacyName">Pharmacy Name</Label>
                <Input
                  id="editPharmacyName"
                  value={editProfile.pharmacyName}
                  onChange={(e) => setEditProfile({...editProfile, pharmacyName: e.target.value})}
                  placeholder="Enter pharmacy name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="editContactNumber">Contact Number</Label>
                <Input
                  id="editContactNumber"
                  value={editProfile.contactNumber}
                  onChange={(e) => setEditProfile({...editProfile, contactNumber: e.target.value})}
                  placeholder="Enter contact number"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="editAddress">Address</Label>
                <Textarea
                  id="editAddress"
                  value={editProfile.address}
                  onChange={(e) => setEditProfile({...editProfile, address: e.target.value})}
                  placeholder="Enter address"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsProfileEditOpen(false)}>Cancel</Button>
              <Button onClick={() => {
                toast({ title: "Profile Update", description: "Profile update feature coming soon!" });
                setIsProfileEditOpen(false);
              }}>
                Update Profile
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
      <Footer />
    </div>
  );
};

export default PartnerDashboard;