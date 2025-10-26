// src/pages/NotFound.jsx
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center bg-background p-6">
      <h1 className="text-6xl font-extrabold text-primary">404</h1>
      <h2 className="mt-4 text-2xl font-semibold text-foreground">
        Page Not Found
      </h2>
      <p className="mt-2 max-w-md text-muted-foreground">
        Sorry, the page you are looking for doesn’t exist or has been moved.
      </p>
      <Button asChild size="lg" className="mt-6">
        <Link to="/">Go Back Home</Link>
      </Button>
    </div>
  );
}
