import FinanceCalculator from "@/components/finance/FinanceCalculator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { VEHICLE_CONDITION, VEHICLE_STATUS } from "@/lib/constants";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  BookOpen,
  Camera,
  CheckCircle,
  Clock,
  Edit,
  Tag,
  Trash2,
  Wrench,
  XCircle,
} from "lucide-react";
import { FC, useEffect, useState } from "react";
import { useLocation, useParams } from "wouter";

const token = localStorage.getItem("jwt_token");
const baseUrl = import.meta.env.VITE_API_BASE_URL;

const fetchWithToken = async (url: string) => {
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`Errore nel fetch di ${url}`);
  }

  return res.json();
};

const VehicleDetailsPage: FC = () => {
  const { id } = useParams<{ id: string }>();
  const [_, navigate] = useLocation();
  const { toast } = useToast();

  function formatPrice(price: string | number) {
    price = price.toString(); // Ensure the input is a string
    // Imposta il separatore delle migliaia come punto e 2 decimali
    return price.replace(/\B(?=(\d{3})+(?!\d))/g, "."); // aggiunge il punto come separatore delle migliaia
  }

  interface Vehicle {
    id: string;
    model_id: number;
    condition: string;
    status: string;
    vin: string;
    images?: string[];
    price: number;
    year: number;
    mileage: number;
    color: string;
    licensePlate?: string;
    fuelType: string;
    description?: string;
    features: string;
  }

  const { data: vehicle, isLoading: isLoadingVehicle } = useQuery<Vehicle>({
    queryKey: [`/api/vehicles/${id}`],
    queryFn: () => fetchWithToken(`${baseUrl}/api/vehicles/${id}`),
  });

  const { data: vehicleModels, isLoading: isLoadingModels } = useQuery<any[]>({
    queryKey: ["/api/vehicle-models"],
    queryFn: () => fetchWithToken(`${baseUrl}/api/vehicle-models`),
  });

  const { data: vehicleMakes, isLoading: isLoadingMakes } = useQuery<any[]>({
    queryKey: ["/api/vehicle-makes"],
    queryFn: () => fetchWithToken(`${baseUrl}/api/vehicle-makes`),
  });

  const { data: services, isLoading: isLoadingServices } = useQuery({
    queryKey: [`/api/services/by-vehicle/${id}`],
    enabled: !!id,
    queryFn: () => fetchWithToken(`${baseUrl}/api/services/by-vehicle/${id}`),
  });

  const getModelById = (model_id: number) => {
    if (!vehicleModels) return null;
    return vehicleModels.find((m: any) => m.id === model_id);
  };

  const getMakeById = (make_id: number) => {
    if (!vehicleMakes) return null;
    return vehicleMakes.find((m: any) => m.id === make_id);
  };

  const getFullVehicleName = () => {
    if (!vehicle || !vehicleModels || !vehicleMakes) return "Caricamento...";

    const model = getModelById(vehicle.model_id);
    if (!model) return "Veicolo";

    const make = getMakeById(model.make_id);
    if (!make) return model.name;

    return `${make.name} ${model.name}`;
  };

  const getSpecifications = () => {
    if (!vehicle || !vehicleModels) return null;

    const model = getModelById(vehicle.model_id);
    if (!model || !model.specifications) return null;

    const parsedSpecs =
      typeof model.specifications === "string"
        ? JSON.parse(model.specifications)
        : model.specifications;
    if (!parsedSpecs) return null;
    return parsedSpecs;
  };

  //console.log(vehicle && vehicle.features);

  const [features, setFeatures] = useState<string[]>([]);

  //const featuresArray = JSON.parse(featuresString);

  useEffect(() => {
    if (vehicle && typeof vehicle === "object" && "features" in vehicle) {
      const parsedFeatures = JSON.parse(
        (vehicle as { features: string }).features
      );
      setFeatures(parsedFeatures);
    }
  }, [vehicle]);

  const handleDeleteVehicle = async () => {
    try {
      await apiRequest("DELETE", `/api/vehicles/${id}`, undefined);

      toast({
        title: "Veicolo eliminato",
        description: "Il veicolo è stato eliminato con successo",
      });

      queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
      navigate("/vehicles");
    } catch (error) {
      toast({
        title: "Errore",
        description:
          "Si è verificato un errore durante l'eliminazione del veicolo",
        variant: "destructive",
      });
    }
  };

  if (isLoadingVehicle || isLoadingModels || isLoadingMakes) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <Clock className="animate-spin h-10 w-10 text-primary mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Caricamento...</p>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <XCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
          <p className="text-lg font-semibold">Veicolo non trovato</p>
          <p className="text-muted-foreground mb-4">
            Il veicolo che stai cercando non esiste o è stato rimosso.
          </p>
          <Button onClick={() => navigate("/vehicles")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Torna al catalogo
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <div className="flex items-center mb-1">
            <Button
              variant="ghost"
              size="sm"
              className="mr-2"
              onClick={() => navigate("/vehicles")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="font-montserrat font-bold text-2xl">
              {getFullVehicleName()}
            </h1>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant="secondary" className="text-xs">
              {
                VEHICLE_CONDITION[
                  vehicle.condition as keyof typeof VEHICLE_CONDITION
                ]
              }
            </Badge>
            <Badge variant="outline" className="text-xs">
              {VEHICLE_STATUS[vehicle.status as keyof typeof VEHICLE_STATUS]}
            </Badge>
            <Badge variant="outline" className="text-xs flex items-center">
              <Tag className="mr-1 h-3 w-3" /> {vehicle.vin}
            </Badge>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/vehicles/manage/${vehicle.id}`)}
          >
            <Edit className="mr-2 h-4 w-4" /> Modifica
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/vehicles/photo/${vehicle.id}`)}
          >
            <Camera className="mr-2 h-4 w-4" /> Foto
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="mr-2 h-4 w-4" /> Elimina
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Sei sicuro di voler eliminare?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Questa azione non può essere annullata. Eliminerai
                  permanentemente questo veicolo dal database.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annulla</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteVehicle}>
                  Elimina
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="md:col-span-2">
          <Card>
            <CardContent className="p-0">
              <div
                className="h-64 md:h-96 bg-neutral-200 bg-cover bg-center"
                style={{ backgroundImage: `url(${vehicle.images?.[0] || ""})` }}
              ></div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardContent className="p-6">
              <div className="text-3xl font-bold mb-4">
                € {formatPrice(vehicle.price)}
              </div>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Anno:</span>
                  <span className="font-medium">{vehicle.year}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Chilometraggio:</span>
                  <span className="font-medium">
                    {vehicle.mileage.toLocaleString()} km
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Colore:</span>
                  <span className="font-medium">{vehicle.color}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Targa:</span>
                  <span className="font-medium">
                    {vehicle.licensePlate || "Non immatricolato"}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Alimentazione:</span>
                  <span className="font-medium capitalize">
                    {vehicle.fuelType}
                  </span>
                </div>

                {vehicle.status === "available" && (
                  <Button className="w-full mt-4">Prenota test drive</Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="info" className="mb-6">
        <TabsList>
          <TabsTrigger value="info">Informazioni</TabsTrigger>
          <TabsTrigger value="specs">Specifiche</TabsTrigger>
          <TabsTrigger value="finance">Finanziamento</TabsTrigger>
          <TabsTrigger value="service">Manutenzione</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="mt-4">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Descrizione</h3>
              <p className="text-muted-foreground mb-6">
                {vehicle.description || "Nessuna descrizione disponibile."}
              </p>

              <h3 className="text-lg font-semibold mb-4">Caratteristiche</h3>
              {features && features.length > 0 ? (
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {features.map((feature: string, index: number) => (
                    <li key={index} className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">
                  Nessuna caratteristica specificata.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="specs" className="mt-4">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                Specifiche tecniche
              </h3>
              {getSpecifications() ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                  {Object.entries(getSpecifications()).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex justify-between border-b pb-2"
                    >
                      <span className="font-medium capitalize">
                        {key.replace(/_/g, " ")}:
                      </span>
                      <span>{String(value)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  Nessuna specifica tecnica disponibile.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="finance" className="mt-4">
          <FinanceCalculator vehiclePrice={vehicle.price} />
        </TabsContent>

        <TabsContent value="service" className="mt-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Storico manutenzione</h3>
                <Button size="sm">
                  <Wrench className="mr-2 h-4 w-4" /> Nuovo intervento
                </Button>
              </div>

              {isLoadingServices ? (
                <p className="text-muted-foreground text-center py-4">
                  Caricamento interventi...
                </p>
              ) : services && services.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Intervento</TableHead>
                      <TableHead>Stato</TableHead>
                      <TableHead className="text-right">Costo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {services.map((service: any) => (
                      <TableRow key={service.id}>
                        <TableCell>
                          {new Date(service.serviceDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{service.description}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              service.status === "completed"
                                ? "default"
                                : service.status === "in_progress"
                                ? "secondary"
                                : service.status === "scheduled"
                                ? "outline"
                                : "destructive"
                            }
                          >
                            {service.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          €{service.cost.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 border rounded-md">
                  <BookOpen className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">
                    Nessun intervento registrato per questo veicolo
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VehicleDetailsPage;
