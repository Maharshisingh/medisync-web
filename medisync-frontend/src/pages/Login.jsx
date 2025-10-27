// src/pages/Login.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Eye, EyeOff, Mail, Lock, Stethoscope } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
// NEW: Imports for robust form handling and validation
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { apiUrl } from "@/lib/api";

// NEW: Define the validation rules for the login form
const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(1, { message: "Password cannot be empty." }),
});



const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { login } = useAuth();

  // NEW: Set up react-hook-form
  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { handleSubmit, control, formState: { isSubmitting } } = form;

  // NEW: This function now uses a real API call
  const onSubmit = async (data) => {
    setServerError(null);
    try {
      // First check if backend is reachable
      let healthCheck;
      try {
        healthCheck = await fetch(apiUrl('api/health'), { method: 'GET' });
      } catch (networkError) {
        throw new Error('Cannot connect to server. Please check if the backend is running.');
      }

      const response = await fetch(apiUrl('api/auth/login/user'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      let result;
      try {
        result = await response.json();
      } catch (jsonError) {
        console.error('JSON parse error:', jsonError);
        throw new Error('Server returned invalid response. Please check if the backend is running properly.');
      }

      if (!response.ok) {
        throw new Error(result.msg || 'Login failed. Please try again.');
      }

      if (!result.token) {
        throw new Error('No authentication token received.');
      }

      // Use the login function from our context
      login(result.token);

      toast({
        title: "Login Successful",
        description: "Welcome back to MediSync!",
      });

      setTimeout(() => navigate('/'), 1000); // Redirect to homepage
    } catch (err) {
      console.error('Login error:', err);
      let errorMessage = err.message;
      
      // Provide more specific error messages
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        errorMessage = 'Cannot connect to server. Please ensure the backend is running on port 5001.';
      } else if (err.message.includes('JSON')) {
        errorMessage = 'Server communication error. Please check backend logs.';
      }
      
      setServerError(errorMessage);
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-12">
        <div className="mx-auto max-w-md">
          {/* NEW: Updated form structure */}
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Card className="card-elevated">
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary"><Stethoscope className="h-6 w-6 text-primary-foreground" /></div></div>
                  <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
                  <CardDescription>Sign in to your MediSync account</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField control={control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl><div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input type="email" placeholder="Enter your email" className="pl-9" {...field} /></div></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}/>
                  <FormField control={control} name="password" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl><div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input type={showPassword ? "text" : "password"} placeholder="Enter your password" className="pl-9 pr-9" {...field} /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4" />}</button></div></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}/>
                  {serverError && <p className="text-sm text-destructive text-center">{serverError}</p>}
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Signing in..." : "Sign In"}
                  </Button>
                  <div className="text-center">
                    <Link to="/forgot-password" className="text-sm text-primary hover:text-primary-hover">
                      Forgot Password?
                    </Link>
                  </div>
                </CardContent>
                <CardFooter className="justify-center">
                  <p className="text-sm text-muted-foreground">Don't have an account?{" "}
                    <Link to="/register" className="text-primary hover:text-primary-hover transition-colors font-medium">
                      Sign up here
                    </Link>
                  </p>
                </CardFooter>
              </Card>
            </form>
          </Form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Login;