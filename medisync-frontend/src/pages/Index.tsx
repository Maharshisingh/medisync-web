import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { 
  Search, 
  MapPin, 
  Shield, 
  Clock, 
  TrendingUp, 
  Users, 
  Heart,
  Star,
  CheckCircle
} from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <HeroSection />

      {/* How It Works Section */}
      <section className="py-16 bg-surface-muted">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              How MediSync Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Find medicines at local pharmacies in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-6">
                <Search className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">1. Search Medicine</h3>
              <p className="text-muted-foreground">
                Enter the medicine name you're looking for. Our smart search handles typos and suggests alternatives.
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-medical-green/10 mb-6">
                <MapPin className="h-8 w-8 text-medical-green" />
              </div>
              <h3 className="text-xl font-semibold mb-3">2. Compare Nearby</h3>
              <p className="text-muted-foreground">
                View real-time prices and availability from pharmacies within 5-10km of your location.
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-trust-blue/10 mb-6">
                <Shield className="h-8 w-8 text-trust-blue" />
              </div>
              <h3 className="text-xl font-semibold mb-3">3. Buy Locally</h3>
              <p className="text-muted-foreground">
                Call the pharmacy or visit directly. Support your local medical stores while getting the best prices.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Why Choose MediSync?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The trusted platform connecting patients with local pharmacies
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="card-medical hover:card-hover transition-all duration-200">
              <CardHeader>
                <Clock className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Real-time Updates</CardTitle>
                <CardDescription>
                  Live inventory tracking ensures you know exactly what's available before you visit.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="card-medical hover:card-hover transition-all duration-200">
              <CardHeader>
                <TrendingUp className="h-10 w-10 text-medical-green mb-2" />
                <CardTitle>Price Transparency</CardTitle>
                <CardDescription>
                  Compare prices across multiple pharmacies to find the best deals in your area.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="card-medical hover:card-hover transition-all duration-200">
              <CardHeader>
                <Users className="h-10 w-10 text-trust-blue mb-2" />
                <CardTitle>Support Local Business</CardTitle>
                <CardDescription>
                  Help neighborhood pharmacies thrive while getting convenient access to medicines.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="card-medical hover:card-hover transition-all duration-200">
              <CardHeader>
                <Shield className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Verified Pharmacies</CardTitle>
                <CardDescription>
                  All partner pharmacies are licensed and verified for authentic medicines and fair pricing.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="card-medical hover:card-hover transition-all duration-200">
              <CardHeader>
                <MapPin className="h-10 w-10 text-medical-green mb-2" />
                <CardTitle>Location-Based</CardTitle>
                <CardDescription>
                  Find medicines within your preferred distance range, from 1km to 10km radius.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="card-medical hover:card-hover transition-all duration-200">
              <CardHeader>
                <Heart className="h-10 w-10 text-trust-blue mb-2" />
                <CardTitle>Community First</CardTitle>
                <CardDescription>
                  Built for the community, by the community. Connecting patients with trusted local care.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-surface-muted">
        <div className="container">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl lg:text-5xl font-bold text-primary mb-2">500+</div>
              <p className="text-muted-foreground">Partner Pharmacies</p>
            </div>
            <div>
              <div className="text-4xl lg:text-5xl font-bold text-medical-green mb-2">10K+</div>
              <p className="text-muted-foreground">Medicines Listed</p>
            </div>
            <div>
              <div className="text-4xl lg:text-5xl font-bold text-trust-blue mb-2">25K+</div>
              <p className="text-muted-foreground">Happy Customers</p>
            </div>
            <div>
              <div className="text-4xl lg:text-5xl font-bold text-primary mb-2">4.8★</div>
              <p className="text-muted-foreground">Average Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container">
          <div className="card-elevated max-w-4xl mx-auto text-center p-8 lg:p-12 bg-gradient-to-br from-primary/5 to-medical-green/5">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Ready to Find Your Medicine?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of people who trust MediSync to find medicines at the best prices from local pharmacies.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="medical" asChild className="px-8">
                <Link to="/search">
                  <Search className="h-5 w-5 mr-2" />
                  Search Medicines
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/about">
                  Learn More
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
