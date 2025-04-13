import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { useLocation } from "wouter";
import { insertPartSchema, type InsertPart } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Schema di validazione esteso
const partFormSchema = insertPartSchema.extend({
  price: z.coerce.number().min(0, "Il prezzo deve essere maggiore o uguale a 0"),
  cost: z.coerce.number().min(0, "Il costo deve essere maggiore o uguale a 0"),
  stockQuantity: z.coerce.number().min(0, "La quantità deve essere maggiore o uguale a 0"),
  minQuantity: z.coerce.number().min(0, "La quantità minima deve essere maggiore o uguale a 0"),
});

const NewPartPage = () => {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Categorie predefinite
  const categories = [
    "Motore",
    "Trasmissione",
    "Freni",
    "Sospensioni",
    "Elettrico",
    "Carrozzeria",
    "Interni",
    "Filtri",
    "Illuminazione",
    "Altro"
  ];

  // Stati predefiniti
  const statusOptions = [
    { value: "active", label: "Attivo" },
    { value: "discontinued", label: "Discontinuato" },
    { value: "on_order", label: "In ordine" }
  ];

  // Fornitori
  const { data: suppliersData } = useQuery({
    queryKey: ["/api/suppliers"],
    queryFn: ({ signal }) => 
      fetch("/api/suppliers", { signal })
        .then(res => res.json())
  });
  
  // Estrai gli elementi dalla risposta paginata o usa l'array direttamente
  const suppliers = suppliersData && typeof suppliersData === 'object' && 'items' in suppliersData 
    ? suppliersData.items 
    : (Array.isArray(suppliersData) ? suppliersData : []);

  // Form
  const form = useForm<z.infer<typeof partFormSchema>>({
    resolver: zodResolver(partFormSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      cost: 0,
      stockQuantity: 0,
      minQuantity: 1,
      location: "",
      category: "Altro",
      partNumber: "",
      barcode: "",
      status: "active",
      compatibility: [],
      images: []
    }
  });

  // Mutation per creare un nuovo ricambio
  const createPartMutation = useMutation({
    mutationFn: async (data: InsertPart) => {
      const res = await apiRequest("POST", "/api/parts", data);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Errore durante il salvataggio del ricambio");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/parts"] });
      toast({
        title: "Ricambio aggiunto",
        description: "Il ricambio è stato aggiunto con successo",
        variant: "default",
      });
      setLocation("/parts");
    },
    onError: (error: Error) => {
      toast({
        title: "Errore",
        description: error.message,
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  });

  // Gestione invio form
  const onSubmit = async (data: z.infer<typeof partFormSchema>) => {
    setIsSubmitting(true);
    createPartMutation.mutate(data);
  };

  return (
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <Button variant="outline" className="mb-2" onClick={() => setLocation("/parts")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Torna all'elenco
          </Button>
          <h1 className="text-3xl font-bold">Nuovo Ricambio</h1>
          <p className="text-muted-foreground mt-1">
            Aggiungi un nuovo ricambio al catalogo
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Informazioni Ricambio</CardTitle>
                <CardDescription>
                  Inserisci le informazioni dettagliate del ricambio
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome *</FormLabel>
                            <FormControl>
                              <Input placeholder="Inserisci nome ricambio" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="partNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Codice Ricambio *</FormLabel>
                            <FormControl>
                              <Input placeholder="Inserisci codice" {...field} />
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
                              placeholder="Descrizione dettagliata del ricambio" 
                              className="min-h-[100px]" 
                              {...field} 
                              value={field.value || ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Categoria *</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleziona categoria" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {categories.map((category) => (
                                  <SelectItem key={category} value={category}>
                                    {category}
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
                        name="supplierId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fornitore</FormLabel>
                            <Select 
                              onValueChange={(value) => field.onChange(Number(value) || null)} 
                              defaultValue={field.value?.toString() || ""}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleziona fornitore" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {suppliers.map((supplier: any) => (
                                  <SelectItem 
                                    key={supplier.id} 
                                    value={supplier.id.toString()}
                                  >
                                    {supplier.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Prezzo di Vendita (€) *</FormLabel>
                            <FormControl>
                              <Input type="number" min="0" step="0.01" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="cost"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Costo di Acquisto (€) *</FormLabel>
                            <FormControl>
                              <Input type="number" min="0" step="0.01" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="stockQuantity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quantità in Magazzino *</FormLabel>
                            <FormControl>
                              <Input type="number" min="0" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="minQuantity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quantità Minima *</FormLabel>
                            <FormControl>
                              <Input type="number" min="0" {...field} />
                            </FormControl>
                            <FormDescription>
                              Quantità minima prima di generare un avviso di riordino
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Posizione in Magazzino</FormLabel>
                            <FormControl>
                              <Input placeholder="es. A12, Scaffale 3" {...field} value={field.value || ''} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="barcode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Codice a Barre</FormLabel>
                            <FormControl>
                              <Input placeholder="Codice a barre" {...field} value={field.value || ''} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Stato *</FormLabel>
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
                              {statusOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end">
                      <Button 
                        type="submit" 
                        className="w-full md:w-auto" 
                        disabled={isSubmitting}
                      >
                        <Save className="mr-2 h-4 w-4" />
                        Salva Ricambio
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Informazioni</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground space-y-4">
                  <p>
                    Compila tutti i campi obbligatori (segnati con *) per aggiungere un nuovo ricambio all'inventario.
                  </p>
                  <p>
                    Il <strong>Codice Ricambio</strong> è il codice identificativo utilizzato dal produttore o dal fornitore.
                  </p>
                  <p>
                    La <strong>Quantità Minima</strong> viene utilizzata per generare avvisi quando le scorte scendono sotto questa soglia.
                  </p>
                  <p>
                    Se non avete un <strong>Fornitore</strong> specificato, potete aggiungerlo in seguito nella sezione fornitori.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
  );
};

export default NewPartPage;