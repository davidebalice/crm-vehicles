import { useQuery } from "@tanstack/react-query";
import { Calendar, MapPin, Plus, Search, Tag } from "lucide-react";
import { FC, useState } from "react";
import { Link } from "wouter";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PaginationControls } from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VEHICLE_CONDITION, VEHICLE_STATUS } from "@/lib/constants";

const VehiclesPage: FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [conditionFilter, setConditionFilter] = useState("all");
  const [vehicleType, setVehicleType] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
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

  const { data: vehicles, isLoading } = useQuery({
    queryKey: [
      baseUrl + "/api/vehicles",
      { page: currentPage, limit: itemsPerPage },
    ],
    queryFn: () => fetchWithToken(baseUrl + "/api/vehicles"),
  });
/*
  const { data: vehicleModels, isLoading: isLoadingModels } = useQuery({
    queryKey: [baseUrl + "/api/vehicle-models"],
    queryFn: () => fetchWithToken(baseUrl + "/api/vehicle-models"),
  });

  const { data: vehicleMakes, isLoading: isLoadingMakes } = useQuery({
    queryKey: [baseUrl + "/api/vehicle-makes"],
    queryFn: () => fetchWithToken(baseUrl + "/api/vehicle-makes"),
  });
*/

/*
  console.log(vehicleModels);
  console.log(vehicleMakes);

  // Helper function to get make name by model id
  const getMakeNameByModelId = (modelId: number) => {
    if (!vehicleModels || !vehicleMakes) return "Sconosciuto";

    const model = vehicleModels.find((m: any) => m.id === modelId);
    if (!model) return "Sconosciuto";

    const make = vehicleMakes.find((m: any) => m.id === model.make_id);
    return make ? make.name : "Sconosciuto";
  };

  // Helper function to get model name by id
  const getModelNameById = (modelId: number) => {
    if (!vehicleModels) return "Sconosciuto";

    const model = vehicleModels.find((m: any) => m.id === modelId);
    return model ? model.name : "Sconosciuto";
  };
*/
  // Filter vehicles
  const vehicleItems =
    vehicles && "items" in vehicles
      ? vehicles.items
      : Array.isArray(vehicles)
      ? vehicles
      : [];

  const filteredVehicles = vehicleItems.filter((vehicle: any) => {
    // Filter by search query (check in description or VIN)
    const matchesSearch =
      !searchQuery ||
      vehicle.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.vin?.toLowerCase().includes(searchQuery.toLowerCase());

    // Filter by status
    const matchesStatus =
      statusFilter === "all" || vehicle.status === statusFilter;

    // Filter by condition
    const matchesCondition =
      conditionFilter === "all" || vehicle.condition === conditionFilter;

    // Filter by vehicle type (car or motorcycle)
    const matchesType =
      vehicleType === "all" ||
      (vehicleModels && vehicleType === getModelTypeById(vehicle.modelId));

    return matchesSearch && matchesStatus && matchesCondition && matchesType;
  });

  // Helper function to get model type by id
  const getModelTypeById = (modelId: number) => {
    if (!vehicleModels) return "";

    const model = vehicleModels.find((m: any) => m.id === modelId);
    return model ? model.type : "";
  };

  // Calcola pagina totale in base a veicoli e filtri
  const totalItems =
    vehicles && "total" in vehicles ? vehicles.total : filteredVehicles.length;
  const totalPages =
    vehicles && "totalPages" in vehicles
      ? vehicles.totalPages
      : Math.ceil(totalItems / itemsPerPage);

  // Handle pagination changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800";
      case "sold":
        return "bg-blue-100 text-blue-800";
      case "in_maintenance":
        return "bg-yellow-100 text-yellow-800";
      case "reserved":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="font-montserrat font-bold text-2xl mb-1">
            Catalogo Veicoli
          </h1>
          <p className="text-neutral-600">
            Gestisci l'inventario di auto e moto
          </p>
        </div>
        <Link href="/vehicles/manage">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Aggiungi Veicolo
          </Button>
        </Link>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cerca per descrizione o numero telaio..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[160px]">
                  <SelectValue placeholder="Stato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti gli stati</SelectItem>
                  {Object.entries(VEHICLE_STATUS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={conditionFilter}
                onValueChange={setConditionFilter}
              >
                <SelectTrigger className="w-full sm:w-[160px]">
                  <SelectValue placeholder="Condizione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutte le condizioni</SelectItem>
                  {Object.entries(VEHICLE_CONDITION).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={vehicleType} onValueChange={setVehicleType}>
                <SelectTrigger className="w-full sm:w-[160px]">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti i tipi</SelectItem>
                  <SelectItem value="car">Auto</SelectItem>
                  <SelectItem value="motorcycle">Moto</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="grid" className="mb-6 veichles-container">
        <TabsList>
          <TabsTrigger value="grid">Griglia</TabsTrigger>
          <TabsTrigger value="list">Lista</TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="mt-4">
          {isLoading  ? (
            <div className="text-center py-8 text-muted-foreground">
              Caricamento veicoli...
            </div>
          ) : filteredVehicles && filteredVehicles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
              {filteredVehicles.map((vehicle: any) => (
                <Link key={vehicle.id} href={`/vehicles/details/${vehicle.id}`}>
                  <Card className="hover:shadow-md transition cursor-pointer">
                    <div
                      className="h-48 bg-neutral-200 bg-cover bg-center relative"
                      style={{
                        // Parsing della stringa JSON e accesso al primo elemento
                        backgroundImage: `url(${
                          vehicle.images ? JSON.parse(vehicle.images)[0] : ""
                        })`,
                      }}
                    >
                      <div className="absolute top-2 right-2">
                        <Badge
                          variant="secondary"
                          className={getStatusColor(vehicle.status)}
                        >
                          {
                            VEHICLE_STATUS[
                              vehicle.status as keyof typeof VEHICLE_STATUS
                            ]
                          }
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold">
                        {vehicle.model_name} {vehicle.make_name}
                      </h3>
                      <div className="flex items-center text-sm text-muted-foreground mt-2">
                        <Calendar className="mr-1 h-4 w-4" />
                        <span className="mr-4">{vehicle.year}</span>
                        <MapPin className="mr-1 h-4 w-4" />
                        <span>{vehicle.mileage.toLocaleString()} km</span>
                      </div>
                      <div className="flex justify-between items-center mt-3">
                        <Badge
                          variant={
                            vehicle.condition === "new" ? "default" : "outline"
                          }
                        >
                          {
                            VEHICLE_CONDITION[
                              vehicle.condition as keyof typeof VEHICLE_CONDITION
                            ]
                          }
                        </Badge>
                        <span className="font-bold text-lg">
                          €{vehicle.price.toLocaleString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Nessun veicolo trovato con i filtri selezionati.
            </div>
          )}
        </TabsContent>

        <TabsContent value="list" className="mt-4">
          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Caricamento veicoli...
                </div>
              ) : filteredVehicles && filteredVehicles.length > 0 ? (
                <div className="divide-y">
                  {filteredVehicles.map((vehicle: any) => (
                    <Link
                      key={vehicle.id}
                      href={`/vehicles/details/${vehicle.id}`}
                    >
                      <div className="flex items-center p-4 hover:bg-neutral-50 transition cursor-pointer">
                        <div
                          className="w-20 h-14 bg-neutral-200 rounded mr-4 bg-cover bg-center"
                          style={{
                            backgroundImage: `url(${
                              vehicle.images?.[0] || ""
                            })`,
                          }}
                        ></div>
                        <div className="flex-1">
                          <h4 className="font-medium">
                            {vehicle.model_name} {vehicle.make_name}
                          </h4>
                          <div className="flex text-sm text-neutral-600 mt-1">
                            <span className="flex items-center mr-3">
                              <Calendar className="mr-1 h-4 w-4" />{" "}
                              {vehicle.year}
                            </span>
                            <span className="flex items-center mr-3">
                              <MapPin className="mr-1 h-4 w-4" />{" "}
                              {vehicle.mileage.toLocaleString()} km
                            </span>
                            <span className="flex items-center capitalize">
                              <Tag className="mr-1 h-4 w-4" />{" "}
                              {vehicle.fuelType}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            €{vehicle.price.toLocaleString()}
                          </p>
                          <div className="flex items-center justify-end mt-1">
                            <Badge
                              variant="secondary"
                              className={getStatusColor(vehicle.status)}
                            >
                              {
                                VEHICLE_STATUS[
                                  vehicle.status as keyof typeof VEHICLE_STATUS
                                ]
                              }
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Nessun veicolo trovato con i filtri selezionati.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Controlli di paginazione */}
      <div className="mt-6">
        <PaginationControls
          totalItems={totalItems}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      </div>
    </div>
  );
};

export default VehiclesPage;
