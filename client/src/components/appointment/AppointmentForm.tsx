import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarIcon, Check, Loader2, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useToast } from "@/hooks/use-toast";
import { APPOINTMENT_STATUS, APPOINTMENT_TYPES } from "@/lib/constants";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertAppointmentSchema } from "@shared/schema";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

// Schema per la validazione del form
const appointmentFormSchema = insertAppointmentSchema.extend({
  date: z.date({
    required_error: "La data è obbligatoria",
  }),
  time: z.string({
    required_error: "L'orario è obbligatorio",
  }),
});

type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;

interface AppointmentFormProps {
  isOpen: boolean;
  appointmentToEdit?: any;
  onClose: () => void;
  onSuccess: () => void;
}

export function AppointmentForm({
  isOpen,
  appointmentToEdit,
  onClose,
  onSuccess,
}: AppointmentFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");
  const [customerPage, setCustomerPage] = useState(1);
  const [vehicleSearchQuery, setVehicleSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);
  const [showVehicleSearch, setShowVehicleSearch] = useState(false);
  const [vehiclesSearch, setVehiclesSearch] = useState<any[]>([]);
  const [customersSearch, setCustomersSearch] = useState<any[]>([]);
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const isEditing = !!appointmentToEdit;

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

  // Form con validazione
  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      type: appointmentToEdit?.type || "test_drive",
      status: appointmentToEdit?.status || "scheduled",
      notes: appointmentToEdit?.notes || "",
      vehicleId: appointmentToEdit?.vehicleId || null,
      customerId: appointmentToEdit?.customerId || 0,
      userId: 1, // Per ora hardcoded, in un'app reale sarebbe l'utente loggato
      date: appointmentToEdit?.date
        ? new Date(appointmentToEdit.date)
        : new Date(),
      time: appointmentToEdit?.date
        ? format(new Date(appointmentToEdit.date), "HH:mm")
        : format(new Date(), "HH:mm"),
    },
  });

  // Query per i clienti iniziali (solo per l'editing di appuntamenti esistenti)
  const { data: initialCustomers = [] } = useQuery({
    queryKey: [baseUrl + "/api/customers"],
    queryFn: () => fetchWithToken(baseUrl + "/api/customers"),
    staleTime: 1000 * 60, // 1 minuto
  });

  // Query per la ricerca paginata dei clienti
  const { data: searchedCustomers = [], isFetching: isSearchingCustomers } =
    useQuery({
      queryKey: [baseUrl + "/api/customers", customerSearchQuery, customerPage],
      queryFn: async () => {
        if (!customerSearchQuery || customerSearchQuery.length < 3) return [];
        const url = `${baseUrl}/api/customers?search=${encodeURIComponent(
          customerSearchQuery
        )}&page=${customerPage}&limit=10`;
        const response = await fetchWithToken(url);

        console.log("response customers");
        console.log(response);

        setCustomersSearch(response);

        if (!response.ok) throw new Error("Errore nella ricerca dei clienti");
        return response.json();
      },
      enabled: customerSearchQuery.length >= 3 && showCustomerSearch,
      staleTime: 1000 * 30, // 30 secondi
    });

  // Query per i veicoli iniziali (solo per l'editing di appuntamenti esistenti)
  const { data: vehiclesData = [] } = useQuery({
    queryKey: [baseUrl + "/api/vehicles"],
    queryFn: () => fetchWithToken(baseUrl + "/api/vehicles"),
    staleTime: 1000 * 60, // 1 minuto
  });

  // Estrai gli item dei veicoli dalla risposta paginata o usa così com'è se è un array
  const vehicles =
    vehiclesData && typeof vehiclesData === "object" && "items" in vehiclesData
      ? vehiclesData.items
      : vehiclesData;

  // Query per la ricerca paginata dei veicoli
  const { data: searchedVehiclesData = [], isFetching: isSearchingVehicles } =
    useQuery({
      queryKey: [baseUrl + "/api/vehicles", vehicleSearchQuery],
      queryFn: async () => {
        if (!vehicleSearchQuery || vehicleSearchQuery.length < 3) return [];

        const url = `${baseUrl}/api/vehicles?search=${encodeURIComponent(
          vehicleSearchQuery
        )}&page=1&limit=10`;
        const response = await fetchWithToken(url);

        console.log("response");
        console.log(response);

        setVehiclesSearch(response);

        if (!response.ok) throw new Error("Errore nella ricerca dei veicoli");

        const data = await response.json();
        console.log("Parsed JSON", data);

        return response;
      },
      enabled: vehicleSearchQuery.length >= 3 && showVehicleSearch,
      staleTime: 1000 * 30, // 30 secondi
    });

  const dataToRender =
    searchedVehiclesData.length > 0 ? searchedVehiclesData : [];

  // Estrai gli items dalla risposta paginata o usa come è se è un array
  const searchedVehicles =
    searchedVehiclesData && "items" in searchedVehiclesData
      ? searchedVehiclesData.items
      : searchedVehiclesData;

  // Caricamento dati per la modifica
  useEffect(() => {
    if (isEditing && appointmentToEdit) {
      // Cerca il cliente selezionato
      if (Array.isArray(initialCustomers)) {
        const customer = initialCustomers.find(
          (c: any) => c.id === appointmentToEdit.customerId
        );
        if (customer) {
          setSelectedCustomer(customer);
        }
      }

      // Usa il veicolo arricchito se presente nell'appuntamento
      if (appointmentToEdit.vehicle) {
        setSelectedVehicle(appointmentToEdit.vehicle);
      }
      // Altrimenti cerca il veicolo usando l'ID
      else if (appointmentToEdit.vehicleId && Array.isArray(vehicles)) {
        const vehicle = vehicles.find(
          (v: any) => v.id === appointmentToEdit.vehicleId
        );
        if (vehicle) {
          setSelectedVehicle(vehicle);
        }
      }

      // Imposta i valori del form
      form.reset({
        type: appointmentToEdit.type,
        status: appointmentToEdit.status,
        notes: appointmentToEdit.notes || "",
        vehicleId: appointmentToEdit.vehicleId || null,
        customerId: appointmentToEdit.customerId,
        userId: appointmentToEdit.userId,
        date: new Date(appointmentToEdit.date),
        time: format(new Date(appointmentToEdit.date), "HH:mm"),
      });
    }
  }, [appointmentToEdit, isEditing, form, initialCustomers, vehicles]);

  // Gestione invio form
  const onSubmit = async (values: AppointmentFormValues) => {
    if (!selectedCustomer) {
      toast({
        title: "Errore",
        description: "Seleziona un cliente per continuare",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

      // Combina data e ora
      const dateTime = new Date(values.date);
      const [hours, minutes] = values.time.split(":").map(Number);
      dateTime.setHours(hours, minutes, 0, 0);

      // Prepara i dati per l'API
      const appointmentData = {
        ...values,
        customerId: selectedCustomer.id,
        vehicleId: selectedVehicle?.id || null,
        date: dateTime.toISOString(),
      };

      // Crea una copia senza il campo time
      const { time, ...dataToSend } = appointmentData;

      if (isEditing) {
        // Aggiorna appuntamento esistente
        await apiRequest(
          "PUT",
          `/api/appointments/${appointmentToEdit.id}`,
          dataToSend
        );
        toast({
          title: "Successo",
          description: "Appuntamento aggiornato con successo.",
        });
      } else {
        // Crea nuovo appuntamento
        await apiRequest("POST", "/api/appointments", dataToSend);
        toast({
          title: "Successo",
          description: "Appuntamento creato con successo.",
        });
      }

      // Invalida la cache per aggiornare la lista
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });

      // Resetta il form e chiudi il modale
      form.reset();
      setSelectedCustomer(null);
      setSelectedVehicle(null);
      onSuccess();
    } catch (error) {
      console.error("Errore durante il salvataggio:", error);
      toast({
        title: "Errore",
        description:
          "Si è verificato un errore durante il salvataggio dell'appuntamento.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Non abbiamo più bisogno di questo filtro, usiamo searchedVehicles dall'API

  // Memorizza il cliente selezionato
  const handleCustomerSelect = (customer: any) => {
    setSelectedCustomer(customer);
    form.setValue("customerId", customer.id);
    setShowCustomerSearch(false);
  };

  // Memorizza il veicolo selezionato
  const handleVehicleSelect = (vehicle: any) => {
    setSelectedVehicle(vehicle);
    form.setValue("vehicleId", vehicle.id);
    setShowVehicleSearch(false);
  };

  // Carica più risultati
  const loadMoreCustomers = () => {
    setCustomerPage((prev) => prev + 1);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Modifica Appuntamento" : "Nuovo Appuntamento"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Selezione cliente con ricerca */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Cliente *</label>

              {selectedCustomer ? (
                <div className="flex items-center justify-between p-2 border rounded-md">
                  <div>
                    <div className="font-medium">
                      {selectedCustomer.first_name} {selectedCustomer.last_name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {selectedCustomer.phone} - {selectedCustomer.email}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedCustomer(null);
                      form.setValue("customerId", 0);
                      setShowCustomerSearch(true);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setShowCustomerSearch(true)}
                  >
                    <Search className="mr-2 h-4 w-4" />
                    Cerca cliente per cognome o telefono
                  </Button>
                </div>
              )}

              {showCustomerSearch && (
                <Card className="mt-2">
                  <CardContent className="p-3">
                    <div className="space-y-3">
                      <Input
                        placeholder="Cerca per cognome o telefono..."
                        value={customerSearchQuery}
                        onChange={(e) => {
                          setCustomerSearchQuery(e.target.value);
                          setCustomerPage(1); // Reset alla prima pagina ad ogni nuova ricerca
                        }}
                        autoFocus
                      />

                      {customerSearchQuery.length < 3 ? (
                        <div className="text-center py-2 text-muted-foreground">
                          Digita almeno 3 caratteri per iniziare la ricerca
                        </div>
                      ) : (
                        <div className="max-h-[200px] overflow-y-auto space-y-2">
                          {isSearchingCustomers ? (
                            <div className="flex justify-center items-center py-4">
                              <Loader2 className="h-6 w-6 animate-spin" />
                            </div>
                          ) : customersSearch.length > 0 ? (
                            <>
                              {customersSearch.map((customer: any) => (
                                <div
                                  key={customer.id}
                                  className="flex justify-between items-center p-2 hover:bg-accent rounded-md cursor-pointer"
                                  onClick={() => handleCustomerSelect(customer)}
                                >
                                  <div>
                                    <div className="font-medium">
                                      {customer.first_name} {customer.last_name}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      {customer.phone} - {customer.email}
                                    </div>
                                  </div>
                                  <Button variant="ghost" size="sm">
                                    <Check className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                              <div className="flex justify-center">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={loadMoreCustomers}
                                  disabled={isSearchingCustomers}
                                >
                                  {isSearchingCustomers ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  ) : null}
                                  Carica altri risultati
                                </Button>
                              </div>
                            </>
                          ) : (
                            <div className="text-center py-2 text-muted-foreground">
                              Nessun cliente trovato
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex justify-end">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowCustomerSearch(false)}
                        >
                          Chiudi
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Tipo di appuntamento */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo di appuntamento *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(APPOINTMENT_TYPES).map(([key, value]) => (
                        <SelectItem key={key} value={key}>
                          {value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Data e ora */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "dd/MM/yyyy")
                            ) : (
                              <span>Seleziona data</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          disabled={(date) => date < new Date("1900-01-01")}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ora *</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Stato (solo per modifica) */}
            {isEditing && (
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stato</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleziona stato" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(APPOINTMENT_STATUS).map(
                          ([key, value]) => (
                            <SelectItem key={key} value={key}>
                              {value}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Selezione veicolo opzionale */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Veicolo (opzionale)</label>

              {selectedVehicle ? (
                <div className="flex items-center justify-between p-2 border rounded-md">
                  <div>
                    <div className="font-medium">
                      {selectedVehicle.make_name} {selectedVehicle.model_name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {selectedVehicle.licensePlate
                        ? selectedVehicle.licensePlate
                        : "Nessuna targa"}{" "}
                      - {selectedVehicle.color}
                    </div>
                    {selectedVehicle.vin && (
                      <div className="text-xs text-muted-foreground">
                        Telaio: {selectedVehicle.vin}
                      </div>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedVehicle(null);
                      form.setValue("vehicleId", null);
                      setShowVehicleSearch(false);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setShowVehicleSearch(true)}
                  >
                    <Search className="mr-2 h-4 w-4" />
                    Cerca veicolo per targa, marca o modello
                  </Button>
                </div>
              )}

              {showVehicleSearch && (
                <Card className="mt-2">
                  <CardContent className="p-3">
                    <div className="space-y-3">
                      <Input
                        placeholder="Cerca per targa, marca o modello..."
                        value={vehicleSearchQuery}
                        onChange={(e) => setVehicleSearchQuery(e.target.value)}
                        autoFocus
                      />
                      {vehicleSearchQuery.length < 2 ? (
                        <div className="text-center py-2 text-muted-foreground">
                          Digita almeno 3 caratteri per iniziare la ricerca
                        </div>
                      ) : (
                        <div className="max-h-[200px] overflow-y-auto space-y-2">
                          {isSearchingVehicles ? (
                            <div className="flex justify-center items-center py-4">
                              <Loader2 className="h-6 w-6 animate-spin" />
                            </div>
                          ) : vehiclesSearch.length > 0 ? (
                            vehiclesSearch.map((vehicle: any) => (
                              <div
                                key={vehicle.id}
                                className="flex justify-between items-center p-2 hover:bg-accent rounded-md cursor-pointer"
                                onClick={() => handleVehicleSelect(vehicle)}
                              >
                                <div>
                                  <div className="font-medium">
                                    {vehicle.make_name} {vehicle.model_name}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {vehicle.licensePlate
                                      ? vehicle.licensePlate
                                      : "Nessuna targa"}{" "}
                                    - {vehicle.color}
                                  </div>
                                  {vehicle.vin && (
                                    <div className="text-xs text-muted-foreground">
                                      Telaio: {vehicle.vin}
                                    </div>
                                  )}
                                </div>
                                <Button variant="ghost" size="sm">
                                  <Check className="h-4 w-4" />
                                </Button>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-2 text-muted-foreground">
                              Nessun veicolo trovato
                            </div>
                          )}
                        </div>
                      )}
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowVehicleSearch(false)}
                        >
                          Chiudi
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Note */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Inserisci eventuali note sull'appuntamento..."
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Pulsanti */}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Annulla
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Aggiorna" : "Crea"} Appuntamento
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
