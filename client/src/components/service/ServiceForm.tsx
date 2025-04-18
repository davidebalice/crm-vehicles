import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertServiceSchema } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { Check, Loader2, Search, X } from "lucide-react";
import { FC, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
const baseUrl = import.meta.env.VITE_API_BASE_URL;

const formSchema = insertServiceSchema.extend({
  serviceDate: z.string().min(1, "La data è obbligatoria"),
  completionDate: z.string().optional(),
});

type ServiceFormValues = z.infer<typeof formSchema>;

interface ServiceFormProps {
  defaultValues?: Partial<ServiceFormValues>;
  isEditing?: boolean;
  onSuccess?: () => void;
}

const ServiceForm: FC<ServiceFormProps> = ({
  defaultValues = {
    status: "scheduled",
    partsCost: 0,
    laborCost: 0,
  },
  isEditing = false,
  onSuccess,
}) => {
  const { toast } = useToast();
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");
  const [customerPage, setCustomerPage] = useState(1);
  const [vehicleSearchQuery, setVehicleSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);
  const [showVehicleSearch, setShowVehicleSearch] = useState(false);
  const [vehiclesSearch, setVehiclesSearch] = useState<any[]>([]);
  const [customersSearch, setCustomersSearch] = useState<any[]>([]);

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

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
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

  const onSubmit = async (data: ServiceFormValues) => {
    try {
      // Convert string dates to ISO format for the API
      const processedData = {
        ...data,
        serviceDate: new Date(data.serviceDate).toISOString(),
        completionDate: data.completionDate
          ? new Date(data.completionDate).toISOString()
          : undefined,
        // Calculate total cost
        cost:
          (parseFloat(data.partsCost?.toString() || "0") || 0) +
          (parseFloat(data.laborCost?.toString() || "0") || 0),
      };

      await apiRequest("POST", "/api/services", processedData);
      toast({
        title: "Intervento creato",
        description: "L'intervento è stato creato con successo",
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast({
        title: "Errore",
        description: `Si è verificato un errore: ${
          error instanceof Error ? error.message : "Sconosciuto"
        }`,
        variant: "destructive",
      });
    }
  };

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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
          <FormField
            control={form.control}
            name="customerId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cliente</FormLabel>

                {selectedCustomer ? (
                  <div className="flex items-center justify-between p-2 border rounded-md">
                    <div>
                      <div className="font-medium">
                        {selectedCustomer.first_name}{" "}
                        {selectedCustomer.last_name}
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
                                    onClick={() =>
                                      handleCustomerSelect(customer)
                                    }
                                  >
                                    <div>
                                      <div className="font-medium">
                                        {customer.first_name}{" "}
                                        {customer.last_name}
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

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="vehicleId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Veicolo</FormLabel>

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
                          onChange={(e) =>
                            setVehicleSearchQuery(e.target.value)
                          }
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
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="serviceDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data intervento</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="completionDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data completamento</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stato</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona stato" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="scheduled">Programmato</SelectItem>
                    <SelectItem value="in_progress">In corso</SelectItem>
                    <SelectItem value="completed">Completato</SelectItem>
                    <SelectItem value="cancelled">Cancellato</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="partsCost"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Costo ricambi (€)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="0.00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="laborCost"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Costo manodopera (€)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="0.00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrizione intervento</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descrizione dell'intervento"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Note aggiuntive</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Note aggiuntive"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button variant="outline" type="button" onClick={() => onSuccess?.()}>
            Annulla
          </Button>
          <Button type="submit">
            {isEditing ? "Aggiorna intervento" : "Crea intervento"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ServiceForm;
