import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CalendarIcon, PlusCircle, Settings, Check, Clock, X, Info, Car, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

// Definizione dello schema per l'aggiunta/modifica dei promemoria
const reminderSchema = z.object({
  description: z.string().min(1, "La descrizione è obbligatoria"),
  reminderType: z.string().min(1, "Il tipo di promemoria è obbligatorio"),
  customerId: z.number().min(1, "Il cliente è obbligatorio"),
  vehicleId: z.number().nullable(),
  dueDate: z.date().refine(date => date >= new Date(), {
    message: "La data di scadenza deve essere nel futuro",
  }),
  isCompleted: z.boolean().optional().default(false),
});

// Tipi per i dati
type ReminderFormValues = z.infer<typeof reminderSchema>;
type Customer = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
};
type Vehicle = {
  id: number;
  licensePlate: string;
  vin: string;
  model?: {
    name: string;
  };
  make?: {
    name: string;
  };
};
type Reminder = {
  id: number;
  description: string;
  reminderType: string;
  customerId: number;
  vehicleId: number | null;
  dueDate: string;
  isCompleted: boolean;
  notificationsSent: number;
  lastNotificationSent: string | null;
  createdAt: string;
  customer?: Customer;
  vehicle?: Vehicle;
};

const ReminderPage: React.FC = () => {
  const { toast } = useToast();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(null);
  const [isServiceRunning, setIsServiceRunning] = useState(false);

  // Form di aggiunta/modifica promemoria
  const form = useForm<ReminderFormValues>({
    resolver: zodResolver(reminderSchema),
    defaultValues: {
      description: "",
      reminderType: "manutenzione",
      customerId: 0,
      vehicleId: null,
      dueDate: new Date(new Date().setDate(new Date().getDate() + 30)),
    },
  });

  // Query per caricare i promemoria
  const {
    data: reminders = [],
    isLoading: isLoadingReminders,
    refetch: refetchReminders,
  } = useQuery<Reminder[]>({
    queryKey: ["/api/reminders"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/reminders?pending=true");
      return await res.json();
    },
  });

  // Query per caricare i clienti
  const {
    data: customers = [],
    isLoading: isLoadingCustomers,
  } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  // Query per caricare i veicoli
  const {
    data: vehiclesData,
    isLoading: isLoadingVehicles,
  } = useQuery({
    queryKey: ["/api/vehicles"],
  });
  
  // Extract vehicle items from paginated response or use as-is if it's an array
  const vehicles = vehiclesData && typeof vehiclesData === 'object' && 'items' in vehiclesData 
    ? vehiclesData.items as Array<any> 
    : (vehiclesData as Array<any>) || [];

  // Query per ottenere lo stato del servizio
  const {
    data: serviceStatus,
    isLoading: isLoadingStatus,
    refetch: refetchStatus,
  } = useQuery<{ running: boolean }>({
    queryKey: ["/api/reminders/service/status"],
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", "/api/reminders/service/status");
        const data = await res.json();
        return data;
      } catch (error) {
        console.error("Error fetching service status:", error);
        return { running: false };
      }
    },
  });

  // Mutation per aggiungere un promemoria
  const addReminderMutation = useMutation({
    mutationFn: async (data: ReminderFormValues) => {
      const res = await apiRequest("POST", "/api/reminders", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reminders"] });
      setIsAddModalOpen(false);
      form.reset();
      toast({
        title: "Promemoria creato",
        description: "Il promemoria è stato creato con successo",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante la creazione del promemoria",
        variant: "destructive",
      });
    },
  });

  // Mutation per aggiornare un promemoria
  const updateReminderMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<ReminderFormValues> }) => {
      const res = await apiRequest("PUT", `/api/reminders/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reminders"] });
      setSelectedReminder(null);
      toast({
        title: "Promemoria aggiornato",
        description: "Il promemoria è stato aggiornato con successo",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'aggiornamento del promemoria",
        variant: "destructive",
      });
    },
  });

  // Mutation per eliminare un promemoria
  const deleteReminderMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/reminders/${id}`);
      return res.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reminders"] });
      setSelectedReminder(null);
      toast({
        title: "Promemoria eliminato",
        description: "Il promemoria è stato eliminato con successo",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'eliminazione del promemoria",
        variant: "destructive",
      });
    },
  });

  // Mutation per avviare il servizio
  const startServiceMutation = useMutation({
    mutationFn: async (intervalMinutes: number) => {
      const res = await apiRequest("POST", "/api/reminders/service/start", { intervalMinutes });
      return await res.json();
    },
    onSuccess: () => {
      refetchStatus();
      toast({
        title: "Servizio avviato",
        description: "Il servizio di promemoria è stato avviato con successo",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'avvio del servizio",
        variant: "destructive",
      });
    },
  });

  // Mutation per fermare il servizio
  const stopServiceMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/reminders/service/stop");
      return await res.json();
    },
    onSuccess: () => {
      refetchStatus();
      toast({
        title: "Servizio fermato",
        description: "Il servizio di promemoria è stato fermato con successo",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'arresto del servizio",
        variant: "destructive",
      });
    },
  });

  // Gestione dell'apertura del modulo di modifica
  const handleEditReminder = (reminder: Reminder) => {
    setSelectedReminder(reminder);
    form.reset({
      description: reminder.description,
      reminderType: reminder.reminderType,
      customerId: reminder.customerId,
      vehicleId: reminder.vehicleId,
      dueDate: new Date(reminder.dueDate),
    });
    setIsAddModalOpen(true);
  };

  // Gestione del submit del modulo
  const onSubmit = (values: ReminderFormValues) => {
    if (selectedReminder) {
      // Modifica di un promemoria esistente
      updateReminderMutation.mutate({
        id: selectedReminder.id,
        data: values,
      });
    } else {
      // Creazione di un nuovo promemoria
      addReminderMutation.mutate(values);
    }
  };

  // Gestione della chiusura del modulo
  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setSelectedReminder(null);
    form.reset();
  };

  // Gestione del completamento di un promemoria
  const markAsCompleted = (reminder: Reminder) => {
    updateReminderMutation.mutate({
      id: reminder.id,
      data: { isCompleted: true },
    });
  };

  // Ottieni il nome del cliente
  const getCustomerName = (customerId: number) => {
    const customer = customers.find((c) => c.id === customerId);
    return customer ? `${customer.firstName} ${customer.lastName}` : "Cliente sconosciuto";
  };

  // Ottieni i dettagli del veicolo
  const getVehicleDetails = (vehicleId: number | null) => {
    if (!vehicleId) return "Nessun veicolo";
    const vehicle = vehicles.find((v: any) => v.id === vehicleId);
    if (!vehicle) return "Veicolo sconosciuto";
    
    const makeName = vehicle.make?.name || "";
    const modelName = vehicle.model?.name || "";
    const licensePlate = vehicle.licensePlate || "";
    
    return `${makeName} ${modelName} - ${licensePlate}`;
  };

  // Formatta una data
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: it });
    } catch (error) {
      return "Data non valida";
    }
  };

  // Calcola i giorni rimanenti alla scadenza
  const getDaysRemaining = (dateString: string) => {
    const dueDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Determina lo stile del badge in base ai giorni rimanenti
  const getReminderBadgeStyle = (dateString: string, isCompleted: boolean) => {
    if (isCompleted) return "bg-green-100 text-green-800";
    
    const daysRemaining = getDaysRemaining(dateString);
    
    if (daysRemaining < 0) return "bg-red-100 text-red-800";
    if (daysRemaining <= 3) return "bg-red-100 text-red-800";
    if (daysRemaining <= 10) return "bg-yellow-100 text-yellow-800";
    if (daysRemaining <= 30) return "bg-blue-100 text-blue-800";
    return "bg-gray-100 text-gray-800";
  };

  // Effetto per ricaricare lo stato del servizio
  useEffect(() => {
    if (serviceStatus && 'running' in serviceStatus) {
      setIsServiceRunning(serviceStatus.running);
    }
  }, [serviceStatus]);

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Promemoria e Scadenze</h1>
          <p className="text-muted-foreground mt-1">
            Gestisci promemoria per manutenzioni, scadenze e seguiti
          </p>
        </div>
        <div className="flex space-x-2">
          {isServiceRunning ? (
            <Button 
              variant="outline" 
              className="flex items-center space-x-2 bg-red-50 hover:bg-red-100" 
              onClick={() => stopServiceMutation.mutate()}
            >
              <X size={16} className="text-red-500" />
              <span>Ferma servizio notifiche</span>
            </Button>
          ) : (
            <Button 
              variant="outline" 
              className="flex items-center space-x-2 bg-green-50 hover:bg-green-100" 
              onClick={() => startServiceMutation.mutate(60)}
            >
              <Clock size={16} className="text-green-500" />
              <span>Avvia servizio notifiche</span>
            </Button>
          )}
          <Button 
            onClick={() => {
              setSelectedReminder(null);
              form.reset();
              setIsAddModalOpen(true);
            }} 
            className="flex items-center space-x-2"
          >
            <PlusCircle size={16} />
            <span>Nuovo promemoria</span>
          </Button>
        </div>
      </div>

      {isServiceRunning && (
        <Card className="mb-6 bg-green-50 border-green-200">
          <CardContent className="pt-4 pb-3 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <RefreshCw size={20} className="text-green-600 animate-spin" />
              <div>
                <p className="font-medium text-green-800">Servizio di notifiche automatiche attivo</p>
                <p className="text-sm text-green-600">
                  I promemoria verranno inviati automaticamente ai clienti in base alla configurazione
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetchStatus()} className="border-green-200">
              Aggiorna stato
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Elenco promemoria</CardTitle>
          <CardDescription>
            Visualizza e gestisci tutti i promemoria non completati
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingReminders ? (
            <div className="flex justify-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : reminders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Info className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">Nessun promemoria attivo</h3>
              <p className="text-muted-foreground mt-1 max-w-sm">
                Non ci sono promemoria attivi al momento. Crea un nuovo promemoria per iniziare.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSelectedReminder(null);
                  form.reset();
                  setIsAddModalOpen(true);
                }}
              >
                Crea promemoria
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descrizione</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Veicolo</TableHead>
                    <TableHead>Scadenza</TableHead>
                    <TableHead>Stato</TableHead>
                    <TableHead className="text-right">Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reminders.map((reminder) => (
                    <TableRow key={reminder.id}>
                      <TableCell className="font-medium">{reminder.description}</TableCell>
                      <TableCell>{reminder.reminderType}</TableCell>
                      <TableCell>
                        {reminder.customer ? `${reminder.customer.firstName} ${reminder.customer.lastName}` : getCustomerName(reminder.customerId)}
                      </TableCell>
                      <TableCell>
                        {reminder.vehicle ? 
                          `${reminder.vehicle.make?.name || ''} ${reminder.vehicle.model?.name || ''} ${reminder.vehicle.licensePlate || ''}` : 
                          getVehicleDetails(reminder.vehicleId)
                        }
                      </TableCell>
                      <TableCell>{formatDate(reminder.dueDate)}</TableCell>
                      <TableCell>
                        <Badge className={getReminderBadgeStyle(reminder.dueDate, reminder.isCompleted)}>
                          {reminder.isCompleted 
                            ? "Completato" 
                            : `${getDaysRemaining(reminder.dueDate)} giorni rimanenti`
                          }
                        </Badge>
                        {reminder.notificationsSent > 0 && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {reminder.notificationsSent} notifiche inviate
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditReminder(reminder)}
                          >
                            Modifica
                          </Button>
                          {!reminder.isCompleted && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="bg-green-50 hover:bg-green-100 text-green-700"
                              onClick={() => markAsCompleted(reminder)}
                            >
                              <Check size={16} className="mr-1" />
                              Completa
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal per aggiungere/modificare un promemoria */}
      <Dialog open={isAddModalOpen} onOpenChange={(open) => !open && handleCloseModal()}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>
              {selectedReminder ? "Modifica promemoria" : "Nuovo promemoria"}
            </DialogTitle>
            <DialogDescription>
              {selectedReminder 
                ? "Modifica i dettagli del promemoria selezionato." 
                : "Aggiungi un nuovo promemoria alla lista."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrizione</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descrivi il promemoria..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="reminderType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo di promemoria</FormLabel>
                      <Select 
                        value={field.value} 
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleziona tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="manutenzione">Manutenzione</SelectItem>
                          <SelectItem value="revisione">Revisione</SelectItem>
                          <SelectItem value="bollo">Bollo auto</SelectItem>
                          <SelectItem value="assicurazione">Assicurazione</SelectItem>
                          <SelectItem value="appuntamento">Appuntamento</SelectItem>
                          <SelectItem value="altro">Altro</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Data scadenza</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "justify-start text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value ? format(field.value, "PPP", { locale: it }) : (
                                <span>Seleziona data</span>
                              )}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                            locale={it}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="customerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cliente</FormLabel>
                      <Select
                        value={field.value ? field.value.toString() : ""}
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        disabled={isLoadingCustomers}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleziona cliente" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {customers.map((customer) => (
                            <SelectItem key={customer.id} value={customer.id.toString()}>
                              {customer.firstName} {customer.lastName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="vehicleId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Veicolo (opzionale)</FormLabel>
                      <Select
                        value={field.value?.toString() || "none"}
                        onValueChange={(value) => field.onChange(value !== "none" ? parseInt(value) : null)}
                        disabled={isLoadingVehicles}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleziona veicolo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Nessun veicolo</SelectItem>
                          {vehicles.map((vehicle: any) => (
                            <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                              {vehicle.make?.name || ""} {vehicle.model?.name || ""} - {vehicle.licensePlate || vehicle.vin}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter className="pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleCloseModal}
                  className="mr-2"
                >
                  Annulla
                </Button>
                {selectedReminder && (
                  <Button 
                    type="button" 
                    variant="destructive" 
                    onClick={() => deleteReminderMutation.mutate(selectedReminder.id)}
                    className="mr-auto"
                  >
                    Elimina
                  </Button>
                )}
                <Button type="submit">
                  {selectedReminder ? "Aggiorna" : "Crea"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ReminderPage;