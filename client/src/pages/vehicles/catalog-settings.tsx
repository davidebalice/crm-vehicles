import { FC, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { 
  ArrowLeft, 
  Plus, 
  SearchIcon, 
  Trash2, 
  PencilIcon, 
  Car, 
  Bike,
  Tag,
  BadgeIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import MakeForm from "@/components/vehicle/MakeForm";
import ModelForm from "@/components/vehicle/ModelForm";
import { apiRequest, queryClient } from "@/lib/queryClient";

const CatalogSettingsPage: FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("makes");
  
  // Stati per la ricerca
  const [searchMake, setSearchMake] = useState("");
  const [searchModel, setSearchModel] = useState("");
  
  // Stati per i dialog
  const [showNewMakeDialog, setShowNewMakeDialog] = useState(false);
  const [showNewModelDialog, setShowNewModelDialog] = useState(false);
  const [showEditMakeDialog, setShowEditMakeDialog] = useState(false);
  const [showEditModelDialog, setShowEditModelDialog] = useState(false);
  
  // Stati per i dati in fase di modifica
  const [editingMake, setEditingMake] = useState<any>(null);
  const [editingModel, setEditingModel] = useState<any>(null);
  const [selectedMakeId, setSelectedMakeId] = useState<number | null>(null);
  
  // Query per le marche e i modelli
  const { data: makes, isLoading: isLoadingMakes } = useQuery({
    queryKey: ["/api/vehicle-makes"],
  });
  
  const { data: models, isLoading: isLoadingModels } = useQuery({
    queryKey: ["/api/vehicle-models"],
  });
  
  // Filtraggio marche
  const filteredMakes = makes?.filter((make: any) => 
    make.name.toLowerCase().includes(searchMake.toLowerCase())
  );
  
  // Filtraggio modelli
  const filteredModels = models?.filter((model: any) => 
    model.name.toLowerCase().includes(searchModel.toLowerCase())
  );
  
  // Funzioni per i dialog
  const handleMakeCreated = () => {
    setShowNewMakeDialog(false);
    queryClient.invalidateQueries({ queryKey: ["/api/vehicle-makes"] });
  };
  
  const handleMakeUpdated = () => {
    setShowEditMakeDialog(false);
    setEditingMake(null);
    queryClient.invalidateQueries({ queryKey: ["/api/vehicle-makes"] });
  };
  
  const handleModelCreated = () => {
    setShowNewModelDialog(false);
    setSelectedMakeId(null);
    queryClient.invalidateQueries({ queryKey: ["/api/vehicle-models"] });
  };
  
  const handleModelUpdated = () => {
    setShowEditModelDialog(false);
    setEditingModel(null);
    queryClient.invalidateQueries({ queryKey: ["/api/vehicle-models"] });
  };
  
  // Funzioni per eliminazione
  const handleDeleteMake = async (id: number) => {
    try {
      await apiRequest("DELETE", `/api/vehicle-makes/${id}`, undefined);
      toast({
        title: "Marca eliminata",
        description: "La marca è stata eliminata con successo"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/vehicle-makes"] });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'eliminazione della marca. Potrebbe essere associata a modelli esistenti.",
        variant: "destructive"
      });
    }
  };
  
  const handleDeleteModel = async (id: number) => {
    try {
      await apiRequest("DELETE", `/api/vehicle-models/${id}`, undefined);
      toast({
        title: "Modello eliminato",
        description: "Il modello è stato eliminato con successo"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/vehicle-models"] });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'eliminazione del modello. Potrebbe essere associato a veicoli esistenti.",
        variant: "destructive"
      });
    }
  };
  
  // Helper per ottenere il nome della marca dal suo ID
  const getMakeName = (makeId: number) => {
    const make = makes?.find((m: any) => m.id === makeId);
    return make ? make.name : `Marca #${makeId}`;
  };
  
  return (
    <div>
      <div className="flex items-center mb-6">
        <Link href="/vehicles">
          <Button variant="outline" size="icon" className="mr-4">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="font-montserrat font-bold text-2xl mb-1">Gestione Catalogo</h1>
          <p className="text-neutral-600">Configura marche, modelli e impostazioni del catalogo</p>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="makes">Marche</TabsTrigger>
          <TabsTrigger value="models">Modelli</TabsTrigger>
        </TabsList>
        
        {/* TAB MARCHE */}
        <TabsContent value="makes">
          <div className="flex justify-between items-center mb-6">
            <div className="relative flex-1 max-w-md">
              <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cerca marche..."
                className="pl-10"
                value={searchMake}
                onChange={(e) => setSearchMake(e.target.value)}
              />
            </div>
            
            <Button onClick={() => setShowNewMakeDialog(true)}>
              <Plus className="mr-2 h-4 w-4" /> Nuova Marca
            </Button>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Marche Veicoli</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingMakes ? (
                <div className="text-center py-4">Caricamento marche...</div>
              ) : filteredMakes && filteredMakes.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Logo</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Modelli</TableHead>
                      <TableHead className="text-right">Azioni</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMakes.map((make: any) => {
                      const makeModels = models?.filter((model: any) => model.makeId === make.id) || [];
                      
                      return (
                        <TableRow key={make.id}>
                          <TableCell className="font-medium">{make.id}</TableCell>
                          <TableCell>
                            {make.logoUrl ? (
                              <img 
                                src={make.logoUrl} 
                                alt={make.name} 
                                className="h-8 w-8 object-contain"
                              />
                            ) : (
                              <BadgeIcon className="h-8 w-8 text-muted-foreground" />
                            )}
                          </TableCell>
                          <TableCell>{make.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {make.type === 'car' ? (
                                <Car className="mr-1 h-3 w-3" />
                              ) : (
                                <Bike className="mr-1 h-3 w-3" />
                              )}
                              {make.type === 'car' ? 'Auto' : 'Moto'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <span className="mr-2">{makeModels.length} modelli</span>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => {
                                  setSelectedMakeId(make.id);
                                  setShowNewModelDialog(true);
                                }}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell className="text-right space-x-1">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => {
                                setEditingMake(make);
                                setShowEditMakeDialog(true);
                              }}
                            >
                              <PencilIcon className="h-4 w-4" />
                            </Button>
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Sei sicuro di voler eliminare?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    L'eliminazione di una marca comporterà anche l'eliminazione di tutti i modelli associati. Questa azione non può essere annullata.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Annulla</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDeleteMake(make.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Elimina
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Nessuna marca trovata.
                  {searchMake && " Prova a modificare la ricerca."}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* TAB MODELLI */}
        <TabsContent value="models">
          <div className="flex justify-between items-center mb-6">
            <div className="relative flex-1 max-w-md">
              <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cerca modelli..."
                className="pl-10"
                value={searchModel}
                onChange={(e) => setSearchModel(e.target.value)}
              />
            </div>
            
            <Button onClick={() => setShowNewModelDialog(true)}>
              <Plus className="mr-2 h-4 w-4" /> Nuovo Modello
            </Button>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Modelli Veicoli</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingModels ? (
                <div className="text-center py-4">Caricamento modelli...</div>
              ) : filteredModels && filteredModels.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Marca</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Anno</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Specifiche</TableHead>
                      <TableHead className="text-right">Azioni</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredModels.map((model: any) => (
                      <TableRow key={model.id}>
                        <TableCell className="font-medium">{model.id}</TableCell>
                        <TableCell>{getMakeName(model.makeId)}</TableCell>
                        <TableCell>{model.name}</TableCell>
                        <TableCell>{model.year}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {model.type === 'car' ? (
                              <Car className="mr-1 h-3 w-3" />
                            ) : (
                              <Bike className="mr-1 h-3 w-3" />
                            )}
                            {model.type === 'car' ? 'Auto' : 'Moto'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {model.specifications ? (
                            <Badge variant="secondary">
                              <Tag className="mr-1 h-3 w-3" />
                              {Object.keys(model.specifications).length} specifiche
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">Nessuna</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => {
                              setEditingModel(model);
                              setShowEditModelDialog(true);
                            }}
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Sei sicuro di voler eliminare?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  L'eliminazione di un modello potrebbe influire sui veicoli esistenti. Questa azione non può essere annullata.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annulla</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDeleteModel(model.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Elimina
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Nessun modello trovato.
                  {searchModel && " Prova a modificare la ricerca."}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* DIALOG PER NUOVA MARCA */}
      <Dialog open={showNewMakeDialog} onOpenChange={setShowNewMakeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aggiungi Nuova Marca</DialogTitle>
            <DialogDescription>
              Inserisci i dettagli della nuova marca di veicoli.
            </DialogDescription>
          </DialogHeader>
          <MakeForm onSuccess={handleMakeCreated} />
        </DialogContent>
      </Dialog>
      
      {/* DIALOG PER MODIFICA MARCA */}
      <Dialog open={showEditMakeDialog} onOpenChange={setShowEditMakeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifica Marca</DialogTitle>
            <DialogDescription>
              Aggiorna i dettagli della marca.
            </DialogDescription>
          </DialogHeader>
          {editingMake && (
            <MakeForm 
              defaultValues={editingMake} 
              isEditing={true} 
              onSuccess={handleMakeUpdated} 
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* DIALOG PER NUOVO MODELLO */}
      <Dialog open={showNewModelDialog} onOpenChange={setShowNewModelDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Aggiungi Nuovo Modello</DialogTitle>
            <DialogDescription>
              Inserisci i dettagli del nuovo modello di veicolo.
            </DialogDescription>
          </DialogHeader>
          <ModelForm 
            onSuccess={handleModelCreated} 
            preselectedMakeId={selectedMakeId !== null ? selectedMakeId : undefined}
          />
        </DialogContent>
      </Dialog>
      
      {/* DIALOG PER MODIFICA MODELLO */}
      <Dialog open={showEditModelDialog} onOpenChange={setShowEditModelDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modifica Modello</DialogTitle>
            <DialogDescription>
              Aggiorna i dettagli del modello.
            </DialogDescription>
          </DialogHeader>
          {editingModel && (
            <ModelForm 
              defaultValues={editingModel} 
              isEditing={true} 
              onSuccess={handleModelUpdated} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CatalogSettingsPage;