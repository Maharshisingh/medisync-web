// src/pages/PartnerDashboard.tsx
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Package, Plus, Edit, Trash2, Upload, TrendingUp, Users, ShoppingCart, Star, Phone, MapPin, Mail, Search, Filter, Download, RefreshCw } from "lucide-react";
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAddingMedicine, setIsAddingMedicine] = useState(false);
  const [newMedicine, setNewMedicine] = useState({ name: '', manufacturer: '', price: '', quantity: '' });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [medicineToDelete, setMedicineToDelete] = useState<any>(null);
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
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + K to focus search
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        const searchInput = document.querySelector('input[placeholder="Search medicines..."]') as HTMLInputElement;
        searchInput?.focus();
      }
      // Ctrl/Cmd + N to add new medicine
      if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
        event.preventDefault();
        setIsDialogOpen(true);
      }
      // Escape to close dialogs
      if (event.key === 'Escape') {
        setIsDialogOpen(false);
        setIsEditDialogOpen(false);
        setIsDeleteDialogOpen(false);
        setIsProfileEditOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleFileSelectAndUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
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
      toast({ title: "Upload Failed", description: (err as Error).message, variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const validateMedicineForm = (medicine: typeof newMedicine) => {
    const errors: string[] = [];
    
    if (!medicine.name.trim()) errors.push('Medicine name is required');
    if (!medicine.price || parseFloat(medicine.price) <= 0) errors.push('Valid price is required');
    if (!medicine.quantity || parseInt(medicine.quantity) < 0) errors.push('Valid quantity is required');
    if (medicine.name.length > 100) errors.push('Medicine name is too long');
    
    return errors;
  };

  const handleAddMedicine = async () => {
    const errors = validateMedicineForm(newMedicine);
    if (errors.length > 0) {
      toast({ title: "Validation Error", description: errors.join(', '), variant: "destructive" });
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
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    } finally {
      setIsAddingMedicine(false);
    }
  };

  const handleEditMedicine = (medicine: any) => {
    setEditingMedicine({
      id: medicine._id,
      name: medicine.medicine.name,
      manufacturer: medicine.medicine.manufacturer,
      price: medicine.price.toString(),
      quantity: medicine.quantity.toString()
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateMedicine = async () => {
    if (!editingMedicine.name || !editingMedicine.price || !editingMedicine.quantity) {
      toast({ title: "Error", description: "Please fill all required fields", variant: "destructive" });
      return;
    }

    setIsUpdating(true);
    const token = localStorage.getItem('pharmacy_token');

    try {
      const response = await fetch(`/api/pharmacies/inventory/update/${editingMedicine.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          price: parseFloat(editingMedicine.price),
          quantity: parseInt(editingMedicine.quantity)
        })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.msg || 'Failed to update medicine');

      toast({ title: "Success!", description: "Medicine updated successfully" });
      setIsEditDialogOpen(false);
      setEditingMedicine(null);
      queryClient.invalidateQueries({ queryKey: ['myPharmacyInventory'] });
    } catch (err) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteMedicine = async () => {
    if (!medicineToDelete) return;

    setIsDeleting(true);
    const token = localStorage.getItem('pharmacy_token');

    try {
      const response = await fetch(`/api/pharmacies/inventory/delete/${medicineToDelete._id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.msg || 'Failed to delete medicine');

      toast({ title: "Success!", description: "Medicine deleted successfully" });
      setIsDeleteDialogOpen(false);
      setMedicineToDelete(null);
      queryClient.invalidateQueries({ queryKey: ['myPharmacyInventory'] });
    } catch (err) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    } finally {
      setIsDeleting(false);
    }
  };

  const validateProfileForm = (profile: typeof editProfile) => {
    const errors: string[] = [];
    
    if (!profile.pharmacyName.trim()) errors.push('Pharmacy name is required');
    if (!profile.contactNumber.trim()) errors.push('Contact number is required');
    if (!profile.address.trim()) errors.push('Address is required');
    if (!/^[0-9]{10}$/.test(profile.contactNumber.replace(/[^0-9]/g, ''))) {
      errors.push('Valid 10-digit contact number is required');
    }
    
    return errors;
  };

  const handleUpdateProfile = async () => {
    const errors = validateProfileForm(editProfile);
    if (errors.length > 0) {
      toast({ title: "Validation Error", description: errors.join(', '), variant: "destructive" });
      return;
    }

    const token = localStorage.getItem('pharmacy_token');

    try {
      const response = await fetch('/api/pharmacies/profile/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          pharmacyName: editProfile.pharmacyName.trim(),
          contactNumber: editProfile.contactNumber.trim(),
          address: editProfile.address.trim()
        })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.msg || 'Failed to update profile');

      toast({ title: "Success!", description: "Profile updated successfully" });
      setIsProfileEditOpen(false);
      queryClient.invalidateQueries({ queryKey: ['pharmacyProfile'] });
    } catch (err) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    }
  };

  const openProfileEdit = () => {
    if (profile) {
      setEditProfile({
        pharmacyName: profile.pharmacyName,
        contactNumber: profile.contactNumber,
        address: profile.address
      });
      setIsProfileEditOpen(true);
    }
  };

  const getStatusBadge = (stock: number) => {
    if (stock === 0) return <Badge variant="destructive">Out of Stock</Badge>;
    if (stock < 50) return <Badge className="bg-yellow-500 text-white">Low Stock</Badge>;
    return <Badge className="bg-green-500 text-white">In Stock</Badge>;
  };

  const getInventoryStats = () => {
    if (!inventory) return { total: 0, inStock: 0, lowStock: 0, outOfStock: 0, totalValue: 0 };
    
    const stats = inventory.reduce((acc: any, item: any) => {
      acc.total += 1;
      acc.totalValue += item.price * item.quantity;
      if (item.quantity === 0) acc.outOfStock += 1;
      else if (item.quantity < 50) acc.lowStock += 1;
      else acc.inStock += 1;
      return acc;
    }, { total: 0, inStock: 0, lowStock: 0, outOfStock: 0, totalValue: 0 });
    
    return stats;
  };

  const getFilteredInventory = () => {
    if (!inventory) return [];
    
    let filtered = inventory.filter((item: any) => {
      const matchesSearch = item.medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.medicine.manufacturer.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = filterStatus === 'all' ||
                           (filterStatus === 'inStock' && item.quantity > 50) ||
                           (filterStatus === 'lowStock' && item.quantity > 0 && item.quantity <= 50) ||
                           (filterStatus === 'outOfStock' && item.quantity === 0);
      
      return matchesSearch && matchesFilter;
    });
    
    return filtered;
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ['myPharmacyInventory'] });
    await queryClient.invalidateQueries({ queryKey: ['pharmacyProfile'] });
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const exportToCSV = () => {
    if (!inventory) return;
    
    const csvContent = [
      ['Medicine Name', 'Manufacturer', 'Price', 'Quantity', 'Status'],
      ...inventory.map((item: any) => [
        item.medicine.name,
        item.medicine.manufacturer,
        item.price,
        item.quantity,
        item.quantity === 0 ? 'Out of Stock' : item.quantity < 50 ? 'Low Stock' : 'In Stock'
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const stats = getInventoryStats();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Medicines</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">In Stock</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats.inStock}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{stats.lowStock}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹{stats.totalValue.toLocaleString()}</div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Inventory updated successfully</p>
                        <p className="text-xs text-muted-foreground">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">New medicine added</p>
                        <p className="text-xs text-muted-foreground">5 hours ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full">
                        <Plus className="h-4 w-4 mr-2" />Add New Medicine
                      </Button>
                    </DialogTrigger>
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
                  <Button variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="h-4 w-4 mr-2" />Import from Excel
                  </Button>
                  <div className="pt-4 border-t">
                    <h4 className="text-sm font-medium mb-2">Keyboard Shortcuts</h4>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div className="flex justify-between">
                        <span>Search medicines</span>
                        <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Ctrl+K</kbd>
                      </div>
                      <div className="flex justify-between">
                        <span>Add medicine</span>
                        <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Ctrl+N</kbd>
                      </div>
                      <div className="flex justify-between">
                        <span>Close dialogs</span>
                        <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Esc</kbd>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="inventory" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Medicine Inventory</CardTitle>
                  <CardDescription>Manage your medicines and stock levels</CardDescription>
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
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={exportToCSV}
                    disabled={!inventory || inventory.length === 0}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
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
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search medicines..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="inStock">In Stock</option>
                    <option value="lowStock">Low Stock</option>
                    <option value="outOfStock">Out of Stock</option>
                  </select>
                </div>
                
                {isLoading && <div className="space-y-2"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-full" /></div>}
                {isError && <p className="text-destructive">Error: {(error as Error).message}</p>}
                {inventory && (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Medicine</TableHead>
                        <TableHead>Brand</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getFilteredInventory().length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            {searchTerm || filterStatus !== 'all' ? 'No medicines match your search criteria' : 'No medicines in inventory'}
                          </TableCell>
                        </TableRow>
                      ) : (
                        getFilteredInventory().map((item: any) => (
                          <TableRow key={item._id}>
                            <TableCell className="font-medium">{item.medicine.name}</TableCell>
                            <TableCell>{item.medicine.manufacturer}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>₹{item.price}</TableCell>
                            <TableCell>{getStatusBadge(item.quantity)}</TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => handleEditMedicine(item)}
                                  title="Edit medicine"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => {
                                    setMedicineToDelete(item);
                                    setIsDeleteDialogOpen(true);
                                  }}
                                  title="Delete medicine"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Stock Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">In Stock</span>
                      <span className="text-sm font-medium">{stats.inStock} items</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{width: `${(stats.inStock/stats.total)*100}%`}}></div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Low Stock</span>
                      <span className="text-sm font-medium">{stats.lowStock} items</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{width: `${(stats.lowStock/stats.total)*100}%`}}></div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Out of Stock</span>
                      <span className="text-sm font-medium">{stats.outOfStock} items</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-red-500 h-2 rounded-full" style={{width: `${(stats.outOfStock/stats.total)*100}%`}}></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">Average Stock Level</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {inventory ? Math.round(inventory.reduce((acc: number, item: any) => acc + item.quantity, 0) / inventory.length) : 0}
                        </p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-blue-600" />
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">Stock Health</p>
                        <p className="text-2xl font-bold text-green-600">
                          {stats.total > 0 ? Math.round(((stats.inStock + stats.lowStock) / stats.total) * 100) : 0}%
                        </p>
                      </div>
                      <Package className="h-8 w-8 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pharmacy Profile</CardTitle>
                <CardDescription>Your pharmacy information and settings</CardDescription>
              </CardHeader>
              <CardContent>
                {profile ? (
                  <div className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Pharmacy Name</Label>
                        <p className="text-lg font-semibold">{profile.pharmacyName}</p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Status</Label>
                        <Badge variant={profile.isApproved ? "default" : "secondary"}>
                          {profile.isApproved ? "Approved" : "Pending Approval"}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <Label className="text-sm font-medium">Email</Label>
                        </div>
                        <p>{profile.email}</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <Label className="text-sm font-medium">Contact Number</Label>
                        </div>
                        <p>{profile.contactNumber}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <Label className="text-sm font-medium">Address</Label>
                      </div>
                      <p>{profile.address}</p>
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-muted-foreground" />
                          <Label className="text-sm font-medium">Rating</Label>
                        </div>
                        <p className="text-lg font-semibold">{profile.rating.toFixed(1)} / 5.0</p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Total Reviews</Label>
                        <p className="text-lg font-semibold">{profile.numReviews}</p>
                      </div>
                    </div>
                    
                    <div className="pt-4">
                      <Button onClick={openProfileEdit}>
                        <Edit className="h-4 w-4 mr-2" />Edit Profile
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Edit Medicine Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Medicine</DialogTitle>
              <DialogDescription>Update medicine details</DialogDescription>
            </DialogHeader>
            {editingMedicine && (
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Medicine Name</Label>
                  <Input value={editingMedicine.name} disabled className="bg-gray-100" />
                </div>
                <div className="grid gap-2">
                  <Label>Manufacturer</Label>
                  <Input value={editingMedicine.manufacturer} disabled className="bg-gray-100" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-price">Price (₹) *</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    value={editingMedicine.price}
                    onChange={(e) => setEditingMedicine({...editingMedicine, price: e.target.value})}
                    placeholder="Enter price"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-quantity">Quantity *</Label>
                  <Input
                    id="edit-quantity"
                    type="number"
                    value={editingMedicine.quantity}
                    onChange={(e) => setEditingMedicine({...editingMedicine, quantity: e.target.value})}
                    placeholder="Enter quantity"
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleUpdateMedicine} disabled={isUpdating}>
                {isUpdating ? 'Updating...' : 'Update Medicine'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Medicine</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete {medicineToDelete?.medicine?.name}? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleDeleteMedicine} disabled={isDeleting}>
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Profile Edit Dialog */}
        <Dialog open={isProfileEditOpen} onOpenChange={setIsProfileEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
              <DialogDescription>Update your pharmacy information</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-pharmacy-name">Pharmacy Name *</Label>
                <Input
                  id="edit-pharmacy-name"
                  value={editProfile.pharmacyName}
                  onChange={(e) => setEditProfile({...editProfile, pharmacyName: e.target.value})}
                  placeholder="Enter pharmacy name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-contact">Contact Number *</Label>
                <Input
                  id="edit-contact"
                  value={editProfile.contactNumber}
                  onChange={(e) => setEditProfile({...editProfile, contactNumber: e.target.value})}
                  placeholder="Enter contact number"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-address">Address *</Label>
                <Textarea
                  id="edit-address"
                  value={editProfile.address}
                  onChange={(e) => setEditProfile({...editProfile, address: e.target.value})}
                  placeholder="Enter address"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsProfileEditOpen(false)}>Cancel</Button>
              <Button onClick={handleUpdateProfile}>
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