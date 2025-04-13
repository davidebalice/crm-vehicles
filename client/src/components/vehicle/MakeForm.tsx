import { FC } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertVehicleMakeSchema } from "@shared/schema";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

// Ampliamo lo schema con nuove validazioni
const formSchema = insertVehicleMakeSchema.extend({
  name: z.string().min(2, "Il nome deve avere almeno 2 caratteri"),
  logoUrl: z.string().url("L'URL del logo non è valido").nullish().optional(),
});

type MakeFormValues = z.infer<typeof formSchema>;

interface MakeFormProps {
  defaultValues?: Partial<MakeFormValues>;
  isEditing?: boolean;
  onSuccess?: () => void;
}

const MakeForm: FC<MakeFormProps> = ({
  defaultValues = {
    type: "car"
  },
  isEditing = false,
  onSuccess
}) => {
  const { toast } = useToast();
  
  const form = useForm<MakeFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });
  
  const onSubmit = async (data: MakeFormValues) => {
    try {
      if (isEditing && defaultValues.id) {
        await apiRequest("PUT", `/api/vehicle-makes/${defaultValues.id}`, data);
        toast({
          title: "Marca aggiornata",
          description: "La marca è stata aggiornata con successo",
        });
      } else {
        await apiRequest("POST", "/api/vehicle-makes", data);
        toast({
          title: "Marca creata",
          description: "La marca è stata creata con successo",
        });
      }
      
      // Invalida la cache per forzare un refresh
      queryClient.invalidateQueries({ queryKey: ["/api/vehicle-makes"] });
      
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome Marca</FormLabel>
              <FormControl>
                <Input placeholder="Es. Audi, BMW, Honda" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="car">Auto</SelectItem>
                  <SelectItem value="motorcycle">Moto</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="logoUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL Logo</FormLabel>
              <FormControl>
                <Input 
                  placeholder="https://example.com/logo.png" 
                  {...field} 
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-2 pt-2">
          <Button variant="outline" type="button" onClick={() => onSuccess?.()}>
            Annulla
          </Button>
          <Button type="submit">
            {isEditing ? "Aggiorna marca" : "Crea marca"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default MakeForm;