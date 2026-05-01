import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, Clock, Star, Navigation, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PharmacyCard = ({ pharmacy, medicineName }) => {
  const navigate = useNavigate();
  
  const handleCall = () => {
    window.open(`tel:${pharmacy.phone}`, '_self');
  };
  
  const handleViewPharmacy = () => {
    navigate(`/pharmacy/${pharmacy.id}`);
  };

  const handleDirections = () => {
    if (pharmacy.location) {
      const [lng, lat] = pharmacy.location;
      const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
      window.open(url, '_blank');
    } else {
      const encodedAddress = encodeURIComponent(pharmacy.address);
      const url = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
      window.open(url, '_blank');
    }
  };

  const getAvailabilityColor = (availability) => {
    switch (availability) {
      case "available":
        return "bg-success text-success-foreground";
      case "limited":
        return "bg-warning text-warning-foreground";
      case "out-of-stock":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getAvailabilityText = (availability) => {
    switch (availability) {
      case "available":
        return "In Stock";
      case "limited":
        return "Limited Stock";
      case "out-of-stock":
        return "Out of Stock";
      default:
        return "Unknown";
    }
  };

  return (
    <div className="card-medical hover:card-hover transition-all duration-200 p-4 sm:p-6">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
        <div className="flex-1">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">
                {pharmacy.name}
              </h3>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm text-muted-foreground mb-2">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  <span className="break-words">{pharmacy.address}</span>
                </div>
                <Badge variant="outline" className="text-xs w-fit">
                  {pharmacy.distance}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{pharmacy.rating}</span>
              <span className="text-xs text-muted-foreground">
                ({pharmacy.reviewCount})
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-1">
              <Phone className="h-4 w-4 flex-shrink-0" />
              <span>{pharmacy.phone}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 flex-shrink-0" />
              {pharmacy.isOpen ? (
                <span className="text-success">
                  Open {pharmacy.openUntil && `until ${pharmacy.openUntil}`}
                </span>
              ) : (
                <span className="text-destructive">Closed</span>
              )}
            </div>
          </div>
        </div>

        <div className="lg:text-right lg:min-w-[200px]">
          <div className="mb-4">
            <Badge className={`${getAvailabilityColor(pharmacy.availability)} mb-2`}>
              {getAvailabilityText(pharmacy.availability)}
            </Badge>
            <div className="flex lg:justify-end items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-bold text-primary">
                ₹{pharmacy.price}
              </span>
              {pharmacy.originalPrice && pharmacy.originalPrice > pharmacy.price && (
                <span className="text-sm text-muted-foreground line-through">
                  ₹{pharmacy.originalPrice}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Updated {pharmacy.lastUpdated}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-2">
            <Button
              variant="default"
              size="sm"
              className="flex-1"
              onClick={handleViewPharmacy}
            >
              <Eye className="h-4 w-4 mr-2" />
              View Pharmacy
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={handleCall}
              >
                <Phone className="h-4 w-4 mr-2" />
                Call
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={handleDirections}
              >
                <Navigation className="h-4 w-4 mr-2" />
                Directions
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PharmacyCard;