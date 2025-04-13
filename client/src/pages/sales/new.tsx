import { FC, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { ArrowLeft, CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { PAYMENT_METHODS, FINANCE_TYPES, FINANCE_STATUS } from "@/lib/constants";
import { apiRequest } from "@/lib/queryClient";

// Schema per la creazione di una nuova vendita
const newSaleSchema = z.object({
  customerId: z.string().min(1, "Seleziona un cliente"),
  vehicleId: z.string().min(1, "Seleziona un veicolo"),
  saleDate: z.date(),
  salePrice: z.string().min(1, "Inserisci il prezzo di vendita"),
  paymentMethod: z.string().min(1, "Seleziona un metodo di pagamento"),
  // Campi per il finanziamento
  financeType: z.string().optional(),
  financeAmount: z.string().optional(),
  financeDuration: z.string().optional(),
  financeInterestRate: z.string().optional(),
  financeStatus: z.string().optional(),
  notes: z.string().optional(),
});

type NewSaleFormValues = z.infer<typeof newSaleSchema>;

const NewSalePage: FC = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showFinanceFields, setShowFinanceFields] = useState(false);
  
  // Ottenere la lista dei clienti
  const { data: customers, isLoading: isLoadingCustomers } = useQuery({
    queryKey: ["/api/customers"],
  });
  
  // Ottenere la lista dei veicoli
  const { data: vehicles, isLoading: isLoadingVehicles } = useQuery({
    queryKey: ["/api/vehicles"],
  });

  // Preparazione form
  const form = useForm<NewSaleFormValues>({
    resolver: zodResolver(newSaleSchema),
    defaultValues: {
      saleDate: new Date(),
      notes: "",
      paymentMethod: "",
      financeType: "",
      financeStatus: "pending",
    },
  });
  
  // Osserva i cambiamenti nel metodo di pagamento
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "paymentMethod" || name === undefined) {
        setShowFinanceFields(value.paymentMethod === "finance");
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);

  // Mutazione per creare una nuova vendita
  const createSaleMutation = useMutation({
    mutationFn: async (data: NewSaleFormValues) => {
      const response = await apiRequest("POST", "/api/sales", {
        ...data,
        salePrice: parseFloat(data.salePrice),
        customerId: parseInt(data.customerId),
        vehicleId: parseInt(data.vehicleId),
        status: "pending", // Stato iniziale
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Vendita creata",
        description: "La vendita è stata creata con successo",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/sales"] });
      navigate("/sales");
    },
    onError: (error) => {
      toast({
        title: "Errore",
        description: `Si è verificato un errore durante la creazione della vendita: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Handler per il form
  const onSubmit = (data: NewSaleFormValues) => {
    createSaleMutation.mutate(data);
  };

  // Filtro per mostrare solo i veicoli disponibili
  const availableVehicles = vehicles?.items ? vehicles.items.filter((vehicle: any) => 
    vehicle.status === "available" || vehicle.status === "in_stock"
  ) : [];

  return (
    <div>
      <div className="mb-6">
        <Button 
          variant="ghost" 
          className="mb-2" 
          onClick={() => navigate("/sales")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Torna alle vendite
        </Button>
        <h1 className="font-montserrat font-bold text-2xl mb-1">Nuova Vendita</h1>
        <p className="text-neutral-600">Crea una nuova vendita di veicolo</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dati Vendita</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Cliente */}
                <FormField
                  control={form.control}
                  name="customerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cliente</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleziona cliente" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {isLoadingCustomers ? (
                            <SelectItem value="loading">Caricamento...</SelectItem>
                          ) : customers && Array.isArray(customers) && customers.length > 0 ? (
                            customers.map((customer: any) => (
                              <SelectItem key={customer.id} value={String(customer.id)}>
                                {customer.firstName} {customer.lastName}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="none">Nessun cliente disponibile</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Veicolo */}
                <FormField
                  control={form.control}
                  name="vehicleId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Veicolo</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleziona veicolo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {isLoadingVehicles ? (
                            <SelectItem value="loading">Caricamento...</SelectItem>
                          ) : availableVehicles && availableVehicles.length > 0 ? (
                            availableVehicles.map((vehicle: any) => (
                              <SelectItem key={vehicle.id} value={String(vehicle.id)}>
                                {vehicle.make?.name} {vehicle.model?.name} - {vehicle.licensePlate || vehicle.vin.substring(0, 8)}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="none">Nessun veicolo disponibile</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Data vendita */}
                <FormField
                  control={form.control}
                  name="saleDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Data Vendita</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={
                                "w-full pl-3 text-left font-normal"
                              }
                            >
                              {field.value ? (
                                format(field.value, "d MMMM yyyy", { locale: it })
                              ) : (
                                <span>Seleziona una data</span>
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
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Metodo pagamento */}
                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Metodo di Pagamento</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleziona metodo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(PAYMENT_METHODS).map(([key, value]) => (
                            <SelectItem key={key} value={key}>{value}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Prezzo */}
                <FormField
                  control={form.control}
                  name="salePrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prezzo di Vendita (€)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0.00" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Campi finanziamento */}
              {showFinanceFields && (
                <div className="space-y-6">
                  <Separator className="my-2" />
                  <h3 className="text-lg font-medium">Dettagli Finanziamento</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Tipo finanziamento */}
                    <FormField
                      control={form.control}
                      name="financeType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo di Finanziamento</FormLabel>
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
                              {Object.entries(FINANCE_TYPES).map(([key, value]) => (
                                <SelectItem key={key} value={key}>{value}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Importo finanziamento */}
                    <FormField
                      control={form.control}
                      name="financeAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Importo Finanziamento (€)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="0.00" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Durata finanziamento (mesi) */}
                    <FormField
                      control={form.control}
                      name="financeDuration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Durata (mesi)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="36" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Tasso di interesse */}
                    <FormField
                      control={form.control}
                      name="financeInterestRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tasso di Interesse (%)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="3.5" 
                              step="0.01"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Stato finanziamento */}
                    <FormField
                      control={form.control}
                      name="financeStatus"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Stato Finanziamento</FormLabel>
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
                              {Object.entries(FINANCE_STATUS).map(([key, value]) => (
                                <SelectItem key={key} value={key}>{value}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              {/* Note */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Note</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Informazioni aggiuntive sulla vendita" 
                        className="h-32" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => navigate("/sales")}
                  type="button"
                >
                  Annulla
                </Button>
                <Button 
                  type="submit" 
                  disabled={createSaleMutation.isPending}
                >
                  {createSaleMutation.isPending ? "Creazione in corso..." : "Crea Vendita"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewSalePage;