
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/layout/AppLayout";

const NotFound = () => {
  return (
    <AppLayout>
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-6xl font-bold text-primary">404</h1>
          <h2 className="text-2xl font-semibold">Pagina non trovata</h2>
          <p className="text-muted-foreground">
            La pagina che stai cercando non esiste o è stata spostata.
          </p>
          <Button asChild className="mt-4">
            <Link to="/">Torna alla Home</Link>
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default NotFound;
