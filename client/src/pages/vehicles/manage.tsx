import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import VehicleForm from "@/components/vehicle/VehicleForm";
import { queryClient } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { FC } from "react";
import { useLocation, useParams } from "wouter";

const VehicleManagePage: FC = () => {
  const { id } = useParams<{ id: string }>();
  const [_, navigate] = useLocation();

  const isEditing = !!id;

  // Load vehicle data if editing
  const { data: vehicle, isLoading } = useQuery({
    queryKey: [`/api/vehicles/${id}`],
    enabled: isEditing,
  });

  const handleSuccess = () => {
    // Invalidate vehicles query to refresh list after add/edit
    queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });

    // Navigate vehicle detail page
    navigate(`/vehicles/details/${id}`);
  };

  return (
    <div>
      <div className="flex items-center mb-6">
        {isEditing ? (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="mr-2"
              onClick={() => navigate(`/vehicles/details/${id}`)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="font-montserrat font-bold text-2xl">
              {isEditing ? "Modifica Veicolo" : "Aggiungi Veicolo"}
            </h1>
          </>
        ) : (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="mr-2"
              onClick={() => navigate(`/vehicles`)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="font-montserrat font-bold text-2xl">
              {isEditing ? "Modifica Veicolo" : "Aggiungi Veicolo"}
            </h1>
          </>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">
            {isEditing
              ? "Modifica i dettagli del veicolo"
              : "Inserisci i dettagli del nuovo veicolo"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing && isLoading ? (
            <div className="text-center py-4 text-muted-foreground">
              Caricamento dati del veicolo...
            </div>
          ) : (
            <VehicleForm
              defaultValues={isEditing ? vehicle : undefined}
              isEditing={isEditing}
              onSuccess={handleSuccess}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VehicleManagePage;
