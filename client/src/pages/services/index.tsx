import { useQuery } from "@tanstack/react-query";
import {
  Calendar,
  Car,
  MoreHorizontal,
  Plus,
  Search,
  User,
  Wrench,
} from "lucide-react";
import { FC, useState } from "react";

import ServiceForm from "@/components/service/ServiceForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SERVICE_STATUS } from "@/lib/constants";
import { queryClient } from "@/lib/queryClient";

const ServicesPage: FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showNewServiceDialog, setShowNewServiceDialog] = useState(false);
  const token = localStorage.getItem("jwt_token");

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
  
  
  const { data: services, isLoading } = useQuery({
    queryKey: ["/api/services"],
    queryFn: () => fetchWithToken("/api/services"),
  });
  
  const { data: customers } = useQuery({
    queryKey: ["/api/customers"],
    queryFn: () => fetchWithToken("/api/customers"),
  });
  
  const { data: vehicles } = useQuery({
    queryKey: ["/api/vehicles"],
    queryFn: () => fetchWithToken("/api/vehicles"),
  });




  // Helper function to get customer name by id
  const getCustomerName = (customerId: number) => {
    if (!customers) return "Cliente #" + customerId;

    const customer = customers.find((c: any) => c.id === customerId);
    return customer
      ? `${customer.firstName} ${customer.lastName}`
      : "Cliente #" + customerId;
  };

  // Helper function to get vehicle info by id
  const getVehicleInfo = (vehicleId: number) => {
    if (!vehicles) return "Veicolo #" + vehicleId;

    const vehicle = vehicles.find((v: any) => v.id === vehicleId);
    return vehicle
      ? `${vehicle.vin} (${vehicle.color})`
      : "Veicolo #" + vehicleId;
  };

  // Filter services
  const filteredServices = services?.filter((service: any) => {
    // Filter by search query (check in description)
    const matchesSearch =
      !searchQuery ||
      service.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getCustomerName(service.customerId)
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    // Filter by status
    const matchesStatus =
      statusFilter === "all" || service.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleServiceCreated = () => {
    setShowNewServiceDialog(false);
    queryClient.invalidateQueries({ queryKey: ["/api/services"] });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="font-montserrat font-bold text-2xl mb-1">
            Servizi & Interventi
          </h1>
          <p className="text-neutral-600">
            Gestisci gli interventi di manutenzione e riparazione
          </p>
        </div>
        <Dialog
          open={showNewServiceDialog}
          onOpenChange={setShowNewServiceDialog}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Nuovo Intervento
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Registra Nuovo Intervento</DialogTitle>
              <DialogDescription>
                Inserisci i dati dell'intervento di manutenzione o riparazione.
              </DialogDescription>
            </DialogHeader>
            <ServiceForm onSuccess={handleServiceCreated} />
          </DialogContent>
        </Dialog>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cerca interventi per descrizione o cliente..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filtra per stato" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti gli stati</SelectItem>
                {Object.entries(SERVICE_STATUS).map(([key, value]) => (
                  <SelectItem key={key} value={key}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista Interventi</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4 text-muted-foreground">
              Caricamento interventi...
            </div>
          ) : filteredServices && filteredServices.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">Data</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Veicolo</TableHead>
                    <TableHead>Descrizione</TableHead>
                    <TableHead>Stato</TableHead>
                    <TableHead className="text-right">Costo</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredServices.map((service: any) => (
                    <TableRow key={service.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                          <div>
                            <div>
                              {new Date(service.serviceDate).toLocaleDateString(
                                "it-IT"
                              )}
                            </div>
                            {service.completionDate && (
                              <div className="text-xs text-muted-foreground">
                                Completato:{" "}
                                {new Date(
                                  service.completionDate
                                ).toLocaleDateString("it-IT")}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{getCustomerName(service.customerId)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Car className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{getVehicleInfo(service.vehicleId)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[250px] truncate">
                        {service.description}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            service.status === "completed"
                              ? "default"
                              : service.status === "in_progress"
                              ? "secondary"
                              : service.status === "cancelled"
                              ? "destructive"
                              : "outline"
                          }
                        >
                          {
                            SERVICE_STATUS[
                              service.status as keyof typeof SERVICE_STATUS
                            ]
                          }
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        €{service.cost.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Wrench className="mr-2 h-4 w-4" /> Dettagli
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Calendar className="mr-2 h-4 w-4" /> Aggiorna
                              stato
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Nessun intervento trovato.
              {searchQuery && " Prova a modificare i criteri di ricerca."}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ServicesPage;
