import { FC } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertVehicleSchema } from "@shared/schema";
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

const formSchema = insertVehicleSchema.extend({
  images: z.array(z.string()).optional(),
  features: z.array(z.string()).optional(),
});

type VehicleFormValues = z.infer<typeof formSchema>;

interface VehicleFormProps {
  defaultValues?: Partial<VehicleFormValues>;
  isEditing?: boolean;
  onSuccess?: () => void;
}

const VehicleForm: FC<VehicleFormProps> = ({
  defaultValues = {
    condition: "new",
    status: "available",
    fuelType: "benzina",
    mileage: 0,
    images: [],
    features: [],
  },
  isEditing = false,
  onSuccess
}) => {
  const { toast } = useToast();
  
  const form = useForm<VehicleFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });
  
  const { data: vehicleModels, isLoading: isLoadingModels } = useQuery({
    queryKey: ["/api/vehicle-models"],
  });
  
  const onSubmit = async (data: VehicleFormValues) => {
    try {
      if (isEditing && defaultValues.id) {
        await apiRequest("PUT", `/api/vehicles/${defaultValues.id}`, data);
        toast({
          title: "Veicolo aggiornato",
          description: "Il veicolo è stato aggiornato con successo",
        });
      } else {
        await apiRequest("POST", "/api/vehicles", data);
        toast({
          title: "Veicolo creato",
          description: "Il veicolo è stato creato con successo",
        });
      }
      
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
            name="modelId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Modello</FormLabel>
                <Select 
                  disabled={isLoadingModels} 
                  onValueChange={(value) => field.onChange(parseInt(value))} 
                  value={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona modello" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {vehicleModels?.map((model: any) => (
                      <SelectItem key={model.id} value={model.id.toString()}>
                        {model.name} ({model.year})
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
            name="vin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Numero di telaio (VIN)</FormLabel>
                <FormControl>
                  <Input placeholder="VIN" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="licensePlate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Targa</FormLabel>
                <FormControl>
                  <Input placeholder="Targa" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Colore</FormLabel>
                <FormControl>
                  <Input placeholder="Colore" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="condition"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Condizione</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona condizione" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="new">Nuovo</SelectItem>
                    <SelectItem value="used">Usato</SelectItem>
                  </SelectContent>
                </Select>
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
                    <SelectItem value="available">Disponibile</SelectItem>
                    <SelectItem value="sold">Venduto</SelectItem>
                    <SelectItem value="in_maintenance">In manutenzione</SelectItem>
                    <SelectItem value="reserved">Prenotato</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="fuelType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Alimentazione</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona alimentazione" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="benzina">Benzina</SelectItem>
                    <SelectItem value="diesel">Diesel</SelectItem>
                    <SelectItem value="ibrido">Ibrido</SelectItem>
                    <SelectItem value="gas">Gas</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="mileage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Chilometraggio</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Chilometraggio" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Anno</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Anno" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prezzo di vendita (€)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Prezzo" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="costPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prezzo di acquisto (€)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Prezzo di costo" {...field} />
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
              <FormLabel>Descrizione</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Descrizione del veicolo" 
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
            {isEditing ? "Aggiorna veicolo" : "Crea veicolo"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default VehicleForm;
