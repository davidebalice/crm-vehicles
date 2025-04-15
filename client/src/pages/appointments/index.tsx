import { useQuery } from "@tanstack/react-query";
import {
  Calendar,
  Car,
  Check,
  Edit,
  Plus,
  Search,
  User,
  X,
} from "lucide-react";
import { FC, useState } from "react";

import { AppointmentForm } from "@/components/appointment/AppointmentForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useToast } from "@/hooks/use-toast";
import { APPOINTMENT_STATUS, APPOINTMENT_TYPES } from "@/lib/constants";
import { apiRequest, queryClient } from "@/lib/queryClient";
const baseUrl = import.meta.env.VITE_API_BASE_URL;

const AppointmentsPage: FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [appointmentToEdit, setAppointmentToEdit] = useState<any>(null);
  const { toast } = useToast();
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

  const { data: appointments, isLoading } = useQuery({
    queryKey: [baseUrl + "/api/appointments"],
    queryFn: () => fetchWithToken(baseUrl + "/api/appointments"),
  });

  const { data: customers } = useQuery({
    queryKey: [baseUrl + "/api/customers"],
    queryFn: () => fetchWithToken(baseUrl + "/api/customers"),
  });

  const { data: vehiclesData } = useQuery({
    queryKey: [baseUrl + "/api/vehicles"],
    queryFn: () => fetchWithToken(baseUrl + "/api/vehicles"),
  });

  // Extract vehicle items from paginated response or use as-is if it's an array
  const vehicles =
    vehiclesData && typeof vehiclesData === "object" && "items" in vehiclesData
      ? vehiclesData.items
      : vehiclesData;

  // Helper function to get customer name by id
  const getCustomerName = (customerId: number) => {
    if (!customers || !Array.isArray(customers))
      return "Cliente #" + customerId;

    const customer = customers.find((c: any) => c.id === customerId);
    return customer
      ? `${customer.firstName} ${customer.lastName}`
      : "Cliente #" + customerId;
  };

  // Helper function to get vehicle info by id
  const getVehicleInfo = (vehicleId: number | null) => {
    if (!vehicleId) return "Nessun veicolo";
    if (!vehicles || !Array.isArray(vehicles)) return "Veicolo #" + vehicleId;

    const vehicle = vehicles.find((v: any) => v.id === vehicleId);
    if (!vehicle) return "Veicolo #" + vehicleId;

    // Mostra marca, modello, targa (se presente) e telaio
    const makeModel = `${vehicle.make?.name || ""} ${
      vehicle.model?.name || ""
    }`;
    const licensePlate = vehicle.licensePlate
      ? `Targa: ${vehicle.licensePlate}`
      : "";
    const vin = `Telaio: ${vehicle.vin || ""}`;

    return `${makeModel} ${licensePlate ? `(${licensePlate})` : ""}`;
  };

  // Filter appointments
  const filteredAppointments = Array.isArray(appointments)
    ? appointments.filter((appointment: any) => {
        // Filter by search query (check in customer name)
        const customerName = getCustomerName(
          appointment.customerId
        ).toLowerCase();
        const matchesSearch =
          !searchQuery ||
          customerName.includes(searchQuery.toLowerCase()) ||
          appointment.notes?.toLowerCase().includes(searchQuery.toLowerCase());

        // Filter by status
        const matchesStatus =
          statusFilter === "all" || appointment.status === statusFilter;

        // Filter by type
        const matchesType =
          typeFilter === "all" || appointment.type === typeFilter;

        return matchesSearch && matchesStatus && matchesType;
      })
    : [];

  // Sort appointments by date
  const sortedAppointments = filteredAppointments?.sort((a: any, b: any) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  // Update appointment status
  const updateAppointmentStatus = async (id: number, status: string) => {
    try {
      await apiRequest("PUT", `/api/appointments/${id}`, { status });

      toast({
        title: "Stato aggiornato",
        description: `L'appuntamento è stato ${
          status === "completed" ? "completato" : "cancellato"
        }.`,
      });

      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
    } catch (error) {
      toast({
        title: "Errore",
        description:
          "Si è verificato un errore durante l'aggiornamento dello stato.",
        variant: "destructive",
      });
    }
  };

  // Open the appointment form for editing
  const handleEditAppointment = (appointment: any) => {
    setAppointmentToEdit(appointment);
    setIsFormOpen(true);
  };

  // Open the appointment form for creating
  const handleNewAppointment = () => {
    setAppointmentToEdit(null);
    setIsFormOpen(true);
  };

  // Close the form
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setAppointmentToEdit(null);
  };

  // Form success handler
  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setAppointmentToEdit(null);
    queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="font-montserrat font-bold text-2xl mb-1">
            Appuntamenti
          </h1>
          <p className="text-neutral-600">
            Gestisci i test drive e gli appuntamenti con i clienti
          </p>
        </div>
        <Button onClick={handleNewAppointment}>
          <Plus className="mr-2 h-4 w-4" /> Nuovo Appuntamento
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cerca per cliente o note..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filtra per stato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti gli stati</SelectItem>
                  {Object.entries(APPOINTMENT_STATUS).map(([key, value]) => (
                    <SelectItem key={key} value={key}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filtra per tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti i tipi</SelectItem>
                  {Object.entries(APPOINTMENT_TYPES).map(([key, value]) => (
                    <SelectItem key={key} value={key}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista Appuntamenti</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4 text-muted-foreground">
              Caricamento appuntamenti...
            </div>
          ) : sortedAppointments && sortedAppointments.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">Data e Ora</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Veicolo</TableHead>
                    <TableHead>Stato</TableHead>
                    <TableHead>Note</TableHead>
                    <TableHead className="w-[100px]">Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedAppointments.map((appointment: any) => (
                    <TableRow key={appointment.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                          <div>
                            <div>
                              {new Date(appointment.date).toLocaleDateString(
                                "it-IT"
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(appointment.date).toLocaleTimeString(
                                "it-IT",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{getCustomerName(appointment.customerId)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {
                          APPOINTMENT_TYPES[
                            appointment.type as keyof typeof APPOINTMENT_TYPES
                          ]
                        }
                      </TableCell>
                      <TableCell>
                        {appointment.vehicleId && (
                          <div className="flex items-center">
                            <Car className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>{getVehicleInfo(appointment.vehicleId)}</span>
                          </div>
                        )}
                        {!appointment.vehicleId && "Nessun veicolo"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            appointment.status === "completed"
                              ? "default"
                              : appointment.status === "cancelled"
                              ? "destructive"
                              : "outline"
                          }
                        >
                          {
                            APPOINTMENT_STATUS[
                              appointment.status as keyof typeof APPOINTMENT_STATUS
                            ]
                          }
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {appointment.notes || "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEditAppointment(appointment)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>

                          {appointment.status === "scheduled" && (
                            <>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() =>
                                  updateAppointmentStatus(
                                    appointment.id,
                                    "completed"
                                  )
                                }
                              >
                                <Check className="h-4 w-4 text-green-500" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() =>
                                  updateAppointmentStatus(
                                    appointment.id,
                                    "cancelled"
                                  )
                                }
                              >
                                <X className="h-4 w-4 text-red-500" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Nessun appuntamento trovato.
              {searchQuery && " Prova a modificare i criteri di ricerca."}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <AppointmentForm
        isOpen={isFormOpen}
        appointmentToEdit={appointmentToEdit}
        onClose={handleCloseForm}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
};

export default AppointmentsPage;
