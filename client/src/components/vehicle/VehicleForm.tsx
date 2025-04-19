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
import { fetchWithToken } from "@/lib/fetchWithToken";
import { apiRequest } from "@/lib/queryClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertVehicleSchema } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { Check, Loader2, Search, X } from "lucide-react";
import { FC, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useRoute } from "wouter";
import { z } from "zod";
const baseUrl = import.meta.env.VITE_API_BASE_URL;
const formSchema = insertVehicleSchema.extend({
  images: z.array(z.string()).optional(),
  features: z.array(z.string()).optional(),
});

type VehicleFormValues = z.infer<typeof formSchema> & { id?: number };
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
  onSuccess,
}) => {
  const { toast } = useToast();
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [selectedModel, setSelectedModel] = useState<any>(null);
  const [showModelSearch, setShowModelSearch] = useState(false);
  const [modelsSearch, setModelsSearch] = useState<any[]>([]);
  const [modelSearchQuery, setModelSearchQuery] = useState("");
  //router
  const [match, params] = useRoute("/vehicles/manage/:id");
  if (!match) return <div>Not found</div>;
  const id = params.id;
  //

  const form = useForm<VehicleFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const { data: vehicleData, isLoading: isLoadingVehicle } = useQuery({
    queryKey: [`${baseUrl}/api/vehicles/${id}`],
    queryFn: () => fetchWithToken(`${baseUrl}/api/vehicles/${id}`),
    enabled: isEditing,
  });

  // Query per la ricerca paginata dei veicoli
  const { data: searchedModelsData = [], isFetching: isSearchingModels } =
    useQuery({
      queryKey: [baseUrl + "/api/vehicle-makes-models", modelSearchQuery],
      queryFn: async () => {
        if (!modelSearchQuery || modelSearchQuery.length < 3) return [];

        const url = `${baseUrl}/api/vehicle-makes-models?search=${encodeURIComponent(
          modelSearchQuery
        )}&page=1&limit=10`;
        const response = await fetchWithToken(url);

        console.log("response");
        console.log(response);

        setModelsSearch(response);

        if (!response.ok) throw new Error("Errore nella ricerca dei veicoli");

        const data = await response.json();
        console.log("Parsed JSON", data);

        return response;
      },
      enabled: modelSearchQuery.length >= 3 && showModelSearch,
      staleTime: 1000 * 30, // 30 secondi
    });

  const handleModelSelect = (vehicle: any) => {
    setSelectedModel(vehicle);
    form.setValue("modelId", models.id);
    setShowModelSearch(false);
  };

  useEffect(() => {
    if (selectedModel) {
      form.setValue("modelId", selectedModel.id);
    }
  }, [selectedModel]);

  useEffect(() => {
    if (!isLoadingVehicle) {
      const modelToSet = {
        id: vehicleData?.model_id,
        make_name: vehicleData?.make_name,
        model_name: vehicleData?.model_name,
        year: vehicleData?.model_year,
      };

      setSelectedModel(modelToSet);
      form.setValue("modelId", vehicleData.model_id);
    }
  }, [vehicleData]);

  console.log("vehicleData");
  console.log(vehicleData);

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
        description: `Si è verificato un errore: ${
          error instanceof Error ? error.message : "Sconosciuto"
        }`,
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {vehicleData && vehicleData.model_id}
        {selectedModel && selectedModel.id}
        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
          <FormField
            control={form.control}
            name="modelId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Modello</FormLabel>

                {selectedModel ? (
                  <div className="flex items-center justify-between p-2 border rounded-md">
                    <div>
                      <div className="font-medium">
                        {selectedModel.make_name} {selectedModel.model_name} (
                        {selectedModel.year})
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedModel(null);
                        form.setValue("modelId", null);
                        setShowModelSearch(false);
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
                      onClick={() => setShowModelSearch(true)}
                    >
                      <Search className="mr-2 h-4 w-4" />
                      Cerca marca / modello
                    </Button>
                  </div>
                )}

                {showModelSearch && (
                  <Card className="mt-2">
                    <CardContent className="p-3">
                      <div className="space-y-3">
                        <Input
                          placeholder="Cerca per targa, marca o modello..."
                          value={modelSearchQuery}
                          onChange={(e) => setModelSearchQuery(e.target.value)}
                          autoFocus
                        />
                        {modelSearchQuery.length < 2 ? (
                          <div className="text-center py-2 text-muted-foreground">
                            Digita almeno 3 caratteri per iniziare la ricerca
                          </div>
                        ) : (
                          <div className="max-h-[200px] overflow-y-auto space-y-2">
                            {isSearchingModels ? (
                              <div className="flex justify-center items-center py-4">
                                <Loader2 className="h-6 w-6 animate-spin" />
                              </div>
                            ) : modelsSearch.length > 0 ? (
                              modelsSearch.map((model: any) => (
                                <div
                                  key={model.id}
                                  className="flex justify-between items-center p-2 hover:bg-accent rounded-md cursor-pointer"
                                  onClick={() => handleModelSelect(model)}
                                >
                                  <div>
                                    <div className="font-medium">
                                      {model.make_name} {model.model_name} (
                                      {model.year})
                                    </div>
                                  </div>
                                  <Button variant="ghost" size="sm">
                                    <Check className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-2 text-muted-foreground">
                                Nessuna marca/modello trovata
                              </div>
                            )}
                          </div>
                        )}
                        <div className="flex justify-end">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setShowModelSearch(false)}
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
            name="vin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Numero di telaio (VIN)</FormLabel>
                <FormControl>
                  <Input placeholder="Telaio" {...field} />
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
                    <SelectItem value="in_maintenance">
                      In manutenzione
                    </SelectItem>
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
                  <Input
                    type="number"
                    placeholder="Chilometraggio"
                    {...field}
                  />
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
                  <Input
                    type="number"
                    placeholder="Prezzo di costo"
                    {...field}
                  />
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
