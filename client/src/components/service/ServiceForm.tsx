import { FC } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertServiceSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

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
  onSuccess
}) => {
  const { toast } = useToast();
  
  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });
  
  const { data: customersData, isLoading: isLoadingCustomers } = useQuery({
    queryKey: ["/api/customers"],
  });
  
  // Ensure customers is an array
  const customers = Array.isArray(customersData) ? customersData : [];
  
  const { data: vehiclesData, isLoading: isLoadingVehicles } = useQuery({
    queryKey: ["/api/vehicles"],
  });
  
  // Extract vehicle items from paginated response or use as-is if it's an array
  const vehicles = vehiclesData && typeof vehiclesData === 'object' && 'items' in vehiclesData 
    ? vehiclesData.items as Array<any> 
    : (vehiclesData as Array<any>) || [];
  
  const onSubmit = async (data: ServiceFormValues) => {
    try {
      // Convert string dates to ISO format for the API
      const processedData = {
        ...data,
        serviceDate: new Date(data.serviceDate).toISOString(),
        completionDate: data.completionDate ? new Date(data.completionDate).toISOString() : undefined,
        // Calculate total cost
        cost: (parseFloat(data.partsCost?.toString() || "0") || 0) + (parseFloat(data.laborCost?.toString() || "0") || 0)
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
        description: `Si è verificato un errore: ${error instanceof Error ? error.message : 'Sconosciuto'}`,
        variant: "destructive",
      });
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="customerId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cliente</FormLabel>
                <Select 
                  disabled={isLoadingCustomers} 
                  onValueChange={(value) => field.onChange(parseInt(value))} 
                  value={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona cliente" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {customers?.map((customer: any) => (
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
                <FormLabel>Veicolo</FormLabel>
                <Select 
                  disabled={isLoadingVehicles} 
                  onValueChange={(value) => field.onChange(parseInt(value))} 
                  value={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona veicolo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {vehicles?.map((vehicle: any) => (
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
