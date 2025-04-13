import { FC, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertVehicleModelSchema } from "@shared/schema";
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
import { Textarea } from "@/components/ui/textarea";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

// Ampliamo lo schema con nuove validazioni
const formSchema = insertVehicleModelSchema.extend({
  specifications: z.record(z.string()).optional(),
});

type ModelFormValues = z.infer<typeof formSchema>;

interface ModelFormProps {
  defaultValues?: Partial<ModelFormValues>;
  isEditing?: boolean;
  onSuccess?: () => void;
  preselectedMakeId?: number;
}

const ModelForm: FC<ModelFormProps> = ({
  defaultValues = {
    type: "car",
    year: new Date().getFullYear(),
  },
  isEditing = false,
  onSuccess,
  preselectedMakeId
}) => {
  const { toast } = useToast();
  
  // Stato per le specifiche tecniche
  const [specificationsJson, setSpecificationsJson] = useState<string>("");
  
  const form = useForm<ModelFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...defaultValues,
      makeId: preselectedMakeId || defaultValues.makeId
    },
  });
  
  // Fetch delle marche disponibili
  const { data: vehicleMakes, isLoading: isLoadingMakes } = useQuery({
    queryKey: ["/api/vehicle-makes"],
  });
  
  // Converti le specifiche tecniche da oggetto a JSON e viceversa
  useEffect(() => {
    if (defaultValues.specifications) {
      setSpecificationsJson(JSON.stringify(defaultValues.specifications, null, 2));
    }
  }, [defaultValues.specifications]);
  
  const onSubmit = async (data: ModelFormValues) => {
    try {
      // Aggiungi le specifiche tecniche se sono state inserite
      let specifications = {};
      try {
        if (specificationsJson) {
          specifications = JSON.parse(specificationsJson);
        }
      } catch (e) {
        toast({
          title: "Errore nelle specifiche",
          description: "Il formato JSON delle specifiche non è valido",
          variant: "destructive",
        });
        return;
      }
      
      const submitData = {
        ...data,
        specifications: Object.keys(specifications).length > 0 ? specifications : undefined
      };
      
      if (isEditing && defaultValues.id) {
        await apiRequest("PUT", `/api/vehicle-models/${defaultValues.id}`, submitData);
        toast({
          title: "Modello aggiornato",
          description: "Il modello è stato aggiornato con successo",
        });
      } else {
        await apiRequest("POST", "/api/vehicle-models", submitData);
        toast({
          title: "Modello creato",
          description: "Il modello è stato creato con successo",
        });
      }
      
      // Invalida la cache per forzare un refresh
      queryClient.invalidateQueries({ queryKey: ["/api/vehicle-models"] });
      
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
          name="makeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Marca</FormLabel>
              <Select 
                disabled={isLoadingMakes || !!preselectedMakeId} 
                onValueChange={(value) => field.onChange(parseInt(value))} 
                value={field.value?.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona marca" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {vehicleMakes?.map((make: any) => (
                    <SelectItem key={make.id} value={make.id.toString()}>
                      {make.name} ({make.type === 'car' ? 'Auto' : 'Moto'})
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
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome Modello</FormLabel>
              <FormControl>
                <Input placeholder="Es. A4 Avant, 320i, CB500F" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Anno</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Anno" 
                    {...field} 
                    onChange={e => field.onChange(parseInt(e.target.value) || new Date().getFullYear())}
                  />
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
        </div>
        
        <div>
          <FormLabel>Specifiche Tecniche (formato JSON)</FormLabel>
          <p className="text-sm text-muted-foreground mb-2">
            Inserisci le specifiche tecniche in formato JSON ({`{ "motore": "2.0 TDI", "potenza": "150 CV" }`})
          </p>
          <Textarea
            placeholder='{
  "motore": "2.0 TDI",
  "potenza": "150 CV",
  "cambio": "automatico",
  "trazione": "integrale"
}'
            className="font-mono text-sm min-h-[200px]"
            value={specificationsJson}
            onChange={(e) => setSpecificationsJson(e.target.value)}
          />
        </div>
        
        <div className="flex justify-end space-x-2 pt-2">
          <Button variant="outline" type="button" onClick={() => onSuccess?.()}>
            Annulla
          </Button>
          <Button type="submit">
            {isEditing ? "Aggiorna modello" : "Crea modello"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ModelForm;