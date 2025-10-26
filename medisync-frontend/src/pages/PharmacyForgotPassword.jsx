import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Mail, ArrowLeft, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PharmacyForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState(1); // 1: email, 2: reset
  const { toast } = useToast();

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password/pharmacy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      let result;
      try {
        result = await response.json();
      } catch (jsonError) {
        throw new Error('Server returned invalid response. Please try again.');
      }
      
      if (!response.ok) throw new Error(result.msg || 'Failed to send reset token');

      toast({ title: "Reset Token Generated", description: `Your reset token: ${result.resetToken}` });
      setResetToken(result.resetToken);
      setStep(2);
    } catch (err) {
      console.error('Pharmacy forgot password error:', err);
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password/pharmacy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetToken, newPassword }),
      });
      
      const result = await response.json();
      if (!response.ok) throw new Error(result.msg);

      toast({ title: "Success", description: "Password reset successful! You can now login." });
      setStep(1);
      setEmail("");
      setNewPassword("");
      setResetToken("");
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
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
              <div className="flex justify-center mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-trust-blue">
                  <Shield className="h-6 w-6 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold">
                {step === 1 ? "Forgot Password" : "Reset Password"}
              </CardTitle>
              <CardDescription>
                {step === 1 ? "Enter your pharmacy email to get reset token" : "Enter your new password"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {step === 1 ? (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Pharmacy Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-9"
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" variant="trust" disabled={isLoading}>
                    {isLoading ? "Sending..." : "Send Reset Token"}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" variant="trust" disabled={isLoading}>
                    {isLoading ? "Resetting..." : "Reset Password"}
                  </Button>
                  <Button type="button" variant="outline" className="w-full" onClick={() => setStep(1)}>
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back
                  </Button>
                </form>
              )}
              <div className="mt-4 text-center">
                <Link to="/partner-login" className="text-sm text-primary hover:text-primary-hover">
                  Back to Partner Login
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PharmacyForgotPassword;