// src/pages/PartnerDashboard.tsx
import { useEffect, useRef, useState } from "react"; // Import useRef and useState
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Package, Plus, Edit, Trash2, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query"; // Import useQueryClient
import { Skeleton } from "@/components/ui/skeleton";

const fetchMyInventory = async () => {
  // ... (this function remains the same)
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

const PartnerDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient(); // NEW: Get the query client for cache invalidation
  const fileInputRef = useRef<HTMLInputElement>(null); // NEW: A ref for our hidden file input
  const [isUploading, setIsUploading] = useState(false); // NEW: State to track upload status

  const { data: inventory, isLoading, isError, error } = useQuery({
    queryKey: ['myPharmacyInventory'],
    queryFn: fetchMyInventory,
  });

  useEffect(() => {
    if (!localStorage.getItem('pharmacy_token')) {
      navigate('/partner-login');
    }
  }, [navigate]);

  // NEW: This function handles the file upload
  const handleFileSelectAndUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const token = localStorage.getItem('pharmacy_token');
    const formData = new FormData();
    formData.append('inventoryFile', file); // 'inventoryFile' must match our backend

    try {
      const response = await fetch('/api/pharmacies/inventory/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Note: We DO NOT set 'Content-Type'. The browser does it for us with FormData.
        },
        body: formData,
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.msg || 'Upload failed.');

      toast({ title: "Success!", description: "Inventory has been updated." });
      // This is the magic part: it tells react-query to re-fetch the inventory data,
      // so our table updates automatically.
      queryClient.invalidateQueries({ queryKey: ['myPharmacyInventory'] });

    } catch (err) {
      toast({ title: "Upload Failed", description: (err as Error).message, variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const getStatusBadge = (stock: number) => {
    // ... (this function remains the same)
    if (stock === 0) return <Badge variant="destructive">Out of Stock</Badge>;
    if (stock < 50) return <Badge className="bg-warning text-warning-foreground">Low Stock</Badge>;
    return <Badge className="bg-success text-success-foreground">In Stock</Badge>;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        {/* ... (Your other dashboard tabs can stay the same) ... */}
        <Tabs defaultValue="inventory" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="inventory" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Medicine Inventory</CardTitle>
                  <CardDescription>Manage your medicines and stock levels</CardDescription>
                </div>
                <div className="flex gap-2">
                  {/* NEW: Hidden file input */}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileSelectAndUpload}
                    className="hidden"
                    accept=".xlsx, .csv"
                  />
                  {/* NEW: Button now triggers the hidden input and shows loading state */}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {isUploading ? 'Uploading...' : 'Import Excel'}
                  </Button>
                  <Button size="sm"><Plus className="h-4 w-4 mr-2" />Add Medicine</Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* ... (Your table rendering logic remains the same) ... */}
                 {isLoading && <p>Loading your inventory...</p>}
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
                       {inventory.map((item: any) => (
                         <TableRow key={item._id}>
                           <TableCell className="font-medium">{item.medicine.name}</TableCell>
                           <TableCell>{item.medicine.manufacturer}</TableCell>
                           <TableCell>{item.quantity}</TableCell>
                           <TableCell>₹{item.price}</TableCell>
                           <TableCell>{getStatusBadge(item.quantity)}</TableCell>
                           <TableCell>
                             <div className="flex gap-1">
                               <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                               <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4" /></Button>
                             </div>
                           </TableCell>
                         </TableRow>
                       ))}
                     </TableBody>
                   </Table>
                 )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default PartnerDashboard;