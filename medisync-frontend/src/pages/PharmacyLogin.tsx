// src/pages/PharmacyLogin.tsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Mail, Lock, Shield, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PharmacyLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch('/api/auth/login/pharmacy', { // Calls the pharmacy login URL
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const result = await response.json();
      if (!response.ok) { throw new Error(result.msg || 'Login failed.'); }

      toast({ title: "Partner Login Successful", description: "Redirecting to your dashboard..." });

      // We save the pharmacy token under a different name to keep it separate from the user token
      localStorage.setItem('pharmacy_token', result.token); 

      // Redirect to the partner dashboard
      setTimeout(() => navigate('/partner-dashboard'), 1000); 

    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-12">
        <div className="mx-auto max-w-md">
          <Card className="card-elevated">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-trust-blue"><Shield className="h-6 w-6 text-white" /></div></div>
              <CardTitle className="text-2xl font-bold">Partner Portal</CardTitle>
              <CardDescription>Sign in to manage your pharmacy</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2"><Label htmlFor="email">Email Address</Label><div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input id="email" type="email" placeholder="Enter your pharmacy email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-9" required /></div></div>
                <div className="space-y-2"><Label htmlFor="password">Password</Label><div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input id="password" type={showPassword ? "text" : "password"} placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-9 pr-9" required /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" className="w-full" variant="trust" disabled={isLoading}>{isLoading ? "Signing in..." : "Sign In"}</Button>
              </form>
            </CardContent>
            <CardFooter className="justify-center">
              <p className="text-sm text-muted-foreground">Not a partner yet? <span className="text-muted-foreground">Join Here</span></p>
            </CardFooter>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PharmacyLogin;