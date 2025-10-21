// src/pages/AdminDashboard.tsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

// API function to fetch pending pharmacies
const fetchPendingPharmacies = async () => {
  const token = localStorage.getItem('token'); // Assuming admin logs in as a user
  const response = await fetch('/api/admin/pharmacies/pending', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!response.ok) throw new Error('Failed to fetch pending pharmacies.');
  return response.json();
};

// API function to approve a pharmacy
const approvePharmacy = async (pharmacyId: string) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`/api/admin/pharmacies/approve/${pharmacyId}`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!response.ok) throw new Error('Failed to approve pharmacy.');
  return response.json();
};

// API function to reject a pharmacy
const rejectPharmacy = async (pharmacyId: string) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`/api/admin/pharmacies/reject/${pharmacyId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!response.ok) throw new Error('Failed to reject pharmacy.');
  return response.json();
};

const AdminDashboard = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch the list of pending pharmacies
  const { data: pendingPharmacies, isLoading, isError, error } = useQuery({
    queryKey: ['pendingPharmacies'],
    queryFn: fetchPendingPharmacies
  });

  // Set up the mutation for approving a pharmacy
  const approveMutation = useMutation({
    mutationFn: approvePharmacy,
    onSuccess: () => {
      toast({ title: "Success", description: "Pharmacy has been approved." });
      queryClient.invalidateQueries({ queryKey: ['pendingPharmacies'] });
    },
    onError: (err) => {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    }
  });

  // Set up the mutation for rejecting a pharmacy
  const rejectMutation = useMutation({
    mutationFn: rejectPharmacy,
    onSuccess: () => {
      toast({ title: "Success", description: "Pharmacy application rejected." });
      queryClient.invalidateQueries({ queryKey: ['pendingPharmacies'] });
    },
    onError: (err) => {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    }
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle>Admin Dashboard</CardTitle>
            <CardDescription>Manage pending pharmacy approvals.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && <Skeleton className="h-40 w-full" />}
            {isError && <p className="text-destructive">Error: {(error as Error).message}</p>}
            {pendingPharmacies && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pharmacy Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingPharmacies.length === 0 && (
                    <TableRow><TableCell colSpan={4} className="text-center">No pending approvals.</TableCell></TableRow>
                  )}
                  {pendingPharmacies.map((pharmacy: any) => (
                    <TableRow key={pharmacy._id}>
                      <TableCell>{pharmacy.pharmacyName}</TableCell>
                      <TableCell>{pharmacy.email}</TableCell>
                      <TableCell>{pharmacy.address}</TableCell>
                      <TableCell>{pharmacy.contactNumber}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => approveMutation.mutate(pharmacy._id)}
                            disabled={approveMutation.isPending}
                          >
                            {approveMutation.isPending ? 'Approving...' : 'Approve'}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => rejectMutation.mutate(pharmacy._id)}
                            disabled={rejectMutation.isPending}
                          >
                            {rejectMutation.isPending ? 'Rejecting...' : 'Reject'}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;