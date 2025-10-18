import { Link } from "react-router-dom";
import { Stethoscope, Facebook, Twitter, Instagram, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-surface-muted border-t">
      <div className="container py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Stethoscope className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-medical-blue">MediSync</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              Connecting you with local pharmacies for better healthcare access and competitive pricing.
            </p>
            <div className="flex space-x-3">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* For Users */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">For Users</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/search" className="text-muted-foreground hover:text-primary transition-colors">
                  Find Medicine
                </Link>
              </li>
              <li>
                <span className="text-muted-foreground">
                  Browse Pharmacies
                </span>
              </li>
              <li>
                <span className="text-muted-foreground">
                  How it Works
                </span>
              </li>
              <li>
                <span className="text-muted-foreground">
                  FAQ
                </span>
              </li>
            </ul>
          </div>

          {/* For Partners */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">For Partners</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <span className="text-muted-foreground">
                  Join as Pharmacy
                </span>
              </li>
              <li>
                <Link to="/partner-login" className="text-muted-foreground hover:text-primary transition-colors">
                  Partner Login
                </Link>
              </li>
              <li>
                <span className="text-muted-foreground">
                  Benefits
                </span>
              </li>
              <li>
                <span className="text-muted-foreground">
                  Support
                </span>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center space-x-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>support@medisync.com</span>
              </li>
              <li className="flex items-center space-x-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-start space-x-2 text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5" />
                <span>123 Healthcare St, Medical District, Mumbai 400001</span>
              </li>
            </ul>
          </div>
        </div>

        <hr className="my-8" />
        
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>&copy; 2024 MediSync. All rights reserved.</p>
          <div className="flex space-x-6">
            <span className="text-muted-foreground">
              Privacy Policy
            </span>
            <span className="text-muted-foreground">
              Terms of Service
            </span>
            <span className="text-muted-foreground">
              Cookie Policy
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;