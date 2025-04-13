import { FC, useState, useEffect } from "react";
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { 
  PlusCircle, 
  Search, 
  RefreshCw, 
  FileSpreadsheet, 
  DollarSign, 
  Calendar, 
  Car, 
  User, 
  BarChart4,
  BadgeCheck,
  BadgeX,
  Clock,
  Filter,
  CircleAlert
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

const FinancingPage: FC = () => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFinanceId, setSelectedFinanceId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  // Query per ottenere tutti i finanziamenti
  const { data: finances, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/finances'],
    queryFn: async () => {
      const response = await fetch('/api/finances');
      if (!response.ok) {
        throw new Error('Errore nel caricamento dei finanziamenti');
      }
      return response.json();
    }
  });

  // Funzione per formattare lo stato del finanziamento
  const formatStatus = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-amber-500"><Clock className="w-3 h-3 mr-1" />In attesa</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-600"><BadgeCheck className="w-3 h-3 mr-1" />Approvato</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><BadgeX className="w-3 h-3 mr-1" />Rifiutato</Badge>;
      case 'completed':
        return <Badge variant="default" className="bg-blue-600"><FileSpreadsheet className="w-3 h-3 mr-1" />Completato</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Funzione per formattare il tipo di finanziamento
  const formatType = (type: string) => {
    switch (type) {
      case 'loan':
        return <Badge variant="outline" className="text-blue-500">Finanziamento</Badge>;
      case 'leasing':
        return <Badge variant="outline" className="text-purple-500">Leasing</Badge>;
      default:
        return <Badge>{type}</Badge>;
    }
  };

  // Formattazione importi in Euro
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };
  
  // Formattazione date
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/D";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('it-IT').format(date);
  };

  // Filtraggio dei finanziamenti
  const filteredFinances = finances ? finances.filter((finance: any) => {
    // Filtro per ricerca
    const matchesSearch = 
      finance.customer?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      finance.customer?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      finance.vehicle?.vin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(finance.amount).includes(searchTerm);

    // Filtro per stato
    const matchesStatus = statusFilter === 'all' || finance.status === statusFilter;
    
    // Filtro per tipo
    const matchesType = typeFilter === 'all' || finance.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  }) : [];

  // Gestore per l'apertura del form di dettaglio
  const handleOpenDetail = (id: number) => {
    setSelectedFinanceId(id);
    setIsDialogOpen(true);
  };

  // Gestore per l'aggiornamento dello stato del finanziamento
  const handleUpdateStatus = async (id: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/finances/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Errore nell\'aggiornamento dello stato');
      }

      toast({
        title: 'Stato aggiornato',
        description: `Il finanziamento è stato aggiornato a: ${newStatus}`,
      });

      refetch();
    } catch (error) {
      toast({
        title: 'Errore',
        description: `Si è verificato un errore: ${(error as Error).message}`,
        variant: 'destructive',
      });
    }
  };

  // Stato di caricamento
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-primary mr-2" />
        <span>Caricamento finanziamenti...</span>
      </div>
    );
  }

  // Gestione dell'errore
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <CircleAlert className="w-10 h-10 text-red-500 mb-2" />
        <h3 className="text-lg font-semibold">Si è verificato un errore</h3>
        <p className="text-gray-500 mt-1">{(error as Error).message}</p>
        <Button onClick={() => refetch()} variant="outline" className="mt-4">
          <RefreshCw className="w-4 h-4 mr-2" />
          Riprova
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Finanziamenti</h1>
          <p className="text-muted-foreground">Gestione dei finanziamenti e leasing per i clienti</p>
        </div>
        <div className="flex space-x-2">
          <Button>
            <PlusCircle className="h-4 w-4 mr-2" />
            Nuovo Finanziamento
          </Button>
        </div>
      </div>

      {/* Statistiche */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Totale Finanziamenti
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {finances?.length || 0} <span className="text-sm font-normal text-muted-foreground">finanziamenti</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Valore Totale
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(finances?.reduce((total: number, finance: any) => total + finance.amount, 0) || 0)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tasso Medio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {finances?.length ? (finances.reduce((total: number, finance: any) => total + (finance.interestRate || 0), 0) / finances.length).toFixed(2) : 0}%
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              In Attesa di Approvazione
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">
              {finances?.filter((finance: any) => finance.status === 'pending').length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtri */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle>Filtri</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Cerca</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Cerca per cliente, VIN o importo..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="statusFilter">Stato</Label>
              <Select 
                value={statusFilter} 
                onValueChange={setStatusFilter}
              >
                <SelectTrigger id="statusFilter">
                  <SelectValue placeholder="Tutti gli stati" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti gli stati</SelectItem>
                  <SelectItem value="pending">In attesa</SelectItem>
                  <SelectItem value="approved">Approvati</SelectItem>
                  <SelectItem value="rejected">Rifiutati</SelectItem>
                  <SelectItem value="completed">Completati</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="typeFilter">Tipo</Label>
              <Select 
                value={typeFilter} 
                onValueChange={setTypeFilter}
              >
                <SelectTrigger id="typeFilter">
                  <SelectValue placeholder="Tutti i tipi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti i tipi</SelectItem>
                  <SelectItem value="loan">Finanziamento</SelectItem>
                  <SelectItem value="leasing">Leasing</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="secondary" size="sm" onClick={() => {
            setSearchTerm("");
            setStatusFilter("all");
            setTypeFilter("all");
          }}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Azzera filtri
          </Button>
        </CardFooter>
      </Card>

      {/* Tabella Finanziamenti */}
      <Card>
        <CardHeader>
          <CardTitle>Finanziamenti</CardTitle>
          <CardDescription>Lista dei finanziamenti e leasing attivi per i clienti</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredFinances.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Veicolo</TableHead>
                  <TableHead>Importo</TableHead>
                  <TableHead>Rata Mensile</TableHead>
                  <TableHead>Tasso</TableHead>
                  <TableHead>Durata</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Stato</TableHead>
                  <TableHead>Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFinances.map((finance: any) => (
                  <TableRow key={finance.id}>
                    <TableCell className="font-medium">
                      {finance.customer ? `${finance.customer.firstName} ${finance.customer.lastName}` : "N/D"}
                    </TableCell>
                    <TableCell>
                      {finance.vehicle ? (
                        <div className="flex flex-col">
                          <span>{`${finance.vehicle.make?.name || ''} ${finance.vehicle.model?.name || ''}`}</span>
                          <span className="text-xs text-muted-foreground">{finance.vehicle.vin}</span>
                        </div>
                      ) : "N/D"}
                    </TableCell>
                    <TableCell>{formatCurrency(finance.amount)}</TableCell>
                    <TableCell>{formatCurrency(finance.monthlyPayment || 0)}</TableCell>
                    <TableCell>{finance.interestRate ? `${finance.interestRate}%` : "N/D"}</TableCell>
                    <TableCell>{finance.term ? `${finance.term} mesi` : "N/D"}</TableCell>
                    <TableCell>{formatType(finance.type)}</TableCell>
                    <TableCell>{formatStatus(finance.status)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleOpenDetail(finance.id)}
                        >
                          Dettagli
                        </Button>
                        {finance.status === 'pending' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-green-600"
                            onClick={() => handleUpdateStatus(finance.id, 'approved')}
                          >
                            Approva
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-24 text-center">
              <CircleAlert className="h-10 w-10 mx-auto text-muted-foreground/60 mb-4" />
              <p className="text-lg font-semibold">Nessun finanziamento trovato</p>
              <p className="text-muted-foreground mt-1">Non ci sono finanziamenti che corrispondono ai criteri di ricerca.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog per i dettagli del finanziamento */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Dettagli Finanziamento</DialogTitle>
            <DialogDescription>
              Informazioni complete sul finanziamento selezionato
            </DialogDescription>
          </DialogHeader>
          
          {selectedFinanceId && finances && (
            <>
              {/* Qui mostreremo i dettagli del finanziamento selezionato */}
              {/* Per ora è un placeholder per la demo */}
              <div className="grid grid-cols-1 gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Importo Totale</Label>
                    <div className="text-lg font-semibold mt-1">
                      {formatCurrency(120000)}
                    </div>
                  </div>
                  <div>
                    <Label>Tasso d'Interesse</Label>
                    <div className="text-lg font-semibold mt-1">4.5%</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Durata</Label>
                    <div className="text-lg font-semibold mt-1">48 mesi</div>
                  </div>
                  <div>
                    <Label>Rata Mensile</Label>
                    <div className="text-lg font-semibold mt-1">
                      {formatCurrency(2800)}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Anticipo</Label>
                    <div className="text-lg font-semibold mt-1">
                      {formatCurrency(20000)}
                    </div>
                  </div>
                  <div>
                    <Label>Tipo</Label>
                    <div className="text-lg font-semibold mt-1">
                      {formatType('loan')}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Stato</Label>
                    <div className="text-lg font-semibold mt-1">
                      {formatStatus('approved')}
                    </div>
                  </div>
                  <div>
                    <Label>Data Inizio</Label>
                    <div className="text-lg font-semibold mt-1">
                      {formatDate('2023-09-15')}
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label>Note</Label>
                  <div className="text-sm mt-1">
                    Finanziamento approvato con tasso agevolato. Cliente prioritario.
                  </div>
                </div>
              </div>
              
              <DialogFooter className="flex justify-between items-center">
                <div>
                  <Button variant="destructive" size="sm">
                    Annulla Finanziamento
                  </Button>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Chiudi
                  </Button>
                  <Button>
                    Modifica
                  </Button>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default FinancingPage;