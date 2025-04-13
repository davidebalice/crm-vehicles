import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { 
  Eye, Edit, Trash2, Plus, Filter, Search, 
  ChevronLeft, ChevronRight, RefreshCw, 
  AlertCircle, Download, ArrowDownUp
} from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from '@/hooks/use-toast';
import { MainLayout } from '@/components/layout/MainLayout';
import { queryClient } from '@/lib/queryClient';
import { 
  TRANSACTION_TYPES, 
  TRANSACTION_CATEGORIES, 
  TRANSACTION_PAYMENT_METHODS 
} from '@/lib/constants';

// Componente per la pagina delle transazioni
const TransactionsPage = () => {
  const { toast } = useToast();
  
  // Stato per la paginazione e i filtri
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    paymentMethod: '',
    search: '',
    startDate: '',
    endDate: ''
  });
  
  // Stato per il sorting
  const [sortField, setSortField] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // Stato per il dialog di eliminazione
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<number | null>(null);
  
  // Costruiamo il query string per i filtri
  const buildQueryString = () => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    if (filters.type) params.append('type', filters.type);
    if (filters.category) params.append('category', filters.category);
    if (filters.paymentMethod) params.append('paymentMethod', filters.paymentMethod);
    if (filters.search) params.append('search', filters.search);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    
    return params.toString();
  };
  
  // Query per ottenere le transazioni
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/transactions', page, limit, filters],
    queryFn: async () => {
      const response = await fetch(`/api/transactions?${buildQueryString()}`);
      if (!response.ok) {
        throw new Error('Errore nel caricamento delle transazioni');
      }
      return response.json();
    }
  });
  
  // Funzione per gestire il cambio pagina
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };
  
  // Funzione per gestire il sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };
  
  // Funzione per applicare i filtri
  const applyFilters = () => {
    setPage(1); // Reset alla prima pagina
    refetch();
  };
  
  // Funzione per resettare i filtri
  const resetFilters = () => {
    setFilters({
      type: '',
      category: '',
      paymentMethod: '',
      search: '',
      startDate: '',
      endDate: ''
    });
    setPage(1);
  };
  
  // Funzione per eliminare una transazione
  const deleteTransaction = async () => {
    if (!transactionToDelete) return;
    
    try {
      const response = await fetch(`/api/transactions/${transactionToDelete}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Errore durante l\'eliminazione della transazione');
      }
      
      toast({
        title: 'Transazione eliminata',
        description: 'La transazione è stata eliminata con successo',
      });
      
      // Invalidiamo la query per aggiornare i dati
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      
      setDeleteDialogOpen(false);
      setTransactionToDelete(null);
    } catch (error) {
      console.error('Errore eliminazione transazione:', error);
      toast({
        title: 'Errore',
        description: 'Si è verificato un errore durante l\'eliminazione della transazione',
        variant: 'destructive',
      });
    }
  };
  
  // Funzioni per formattare i dati
  const formatAmount = (amount: number, type: string) => {
    const formatted = new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
    
    return (
      <span className={type === 'income' ? 'text-green-600' : 'text-red-600'}>
        {type === 'income' ? '+' : '-'} {formatted}
      </span>
    );
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'dd/MM/yyyy');
  };
  
  const getCategoryLabel = (categoryKey: string) => {
    const category = Object.entries(TRANSACTION_CATEGORIES).find(
      ([key, value]) => key === categoryKey
    );
    return category ? category[1] : categoryKey;
  };
  
  const getTypeLabel = (typeKey: string) => {
    const type = Object.entries(TRANSACTION_TYPES).find(
      ([key, value]) => key === typeKey
    );
    return type ? type[1] : typeKey;
  };
  
  const getPaymentMethodLabel = (methodKey: string) => {
    const method = Object.entries(TRANSACTION_PAYMENT_METHODS).find(
      ([key, value]) => key === methodKey
    );
    return method ? method[1] : methodKey;
  };
  
  // Se sta caricando, mostriamo un indicatore
  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-2">Caricamento transazioni...</span>
        </div>
      </MainLayout>
    );
  }
  
  // Se c'è un errore, lo mostriamo
  if (error) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-64">
          <AlertCircle className="w-10 h-10 text-red-500 mb-2" />
          <h3 className="text-lg font-semibold">Si è verificato un errore</h3>
          <p className="text-gray-500 mt-1">{(error as Error).message}</p>
          <Button onClick={() => refetch()} variant="outline" className="mt-4">
            <RefreshCw className="w-4 h-4 mr-2" />
            Riprova
          </Button>
        </div>
      </MainLayout>
    );
  }
  
  // Calcoli totali entrate e uscite nella pagina corrente
  const totalIncome = data?.items
    .filter((t: any) => t.type === 'income')
    .reduce((sum: number, t: any) => sum + t.amount, 0) || 0;
    
  const totalExpense = data?.items
    .filter((t: any) => t.type === 'expense')
    .reduce((sum: number, t: any) => sum + t.amount, 0) || 0;
    
  const balance = totalIncome - totalExpense;
  
  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Transazioni Finanziarie</h1>
            <p className="text-muted-foreground mt-1">
              Gestisci entrate e uscite del concessionario
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={() => resetFilters()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset Filtri
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Esporta
            </Button>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nuova Transazione
            </Button>
          </div>
        </div>
        
        {/* Riepilogo finanziario */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Entrate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {new Intl.NumberFormat('it-IT', {
                  style: 'currency',
                  currency: 'EUR'
                }).format(totalIncome)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Uscite
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {new Intl.NumberFormat('it-IT', {
                  style: 'currency',
                  currency: 'EUR'
                }).format(totalExpense)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Bilancio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {new Intl.NumberFormat('it-IT', {
                  style: 'currency',
                  currency: 'EUR'
                }).format(balance)}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Filtri */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Filtri</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Tipo</Label>
                <Select 
                  value={filters.type} 
                  onValueChange={(value) => setFilters({...filters, type: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tutti i tipi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tutti i tipi</SelectItem>
                    {Object.entries(TRANSACTION_TYPES).map(([key, value]) => (
                      <SelectItem key={key} value={key}>{value}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Select 
                  value={filters.category} 
                  onValueChange={(value) => setFilters({...filters, category: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tutte le categorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tutte le categorie</SelectItem>
                    {Object.entries(TRANSACTION_CATEGORIES).map(([key, value]) => (
                      <SelectItem key={key} value={key}>{value}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Metodo di Pagamento</Label>
                <Select 
                  value={filters.paymentMethod} 
                  onValueChange={(value) => setFilters({...filters, paymentMethod: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tutti i metodi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tutti i metodi</SelectItem>
                    {Object.entries(TRANSACTION_PAYMENT_METHODS).map(([key, value]) => (
                      <SelectItem key={key} value={key}>{value}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="startDate">Data Inizio</Label>
                <Input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endDate">Data Fine</Label>
                <Input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="search">Ricerca</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Descrizione, riferimento, note..."
                    className="pl-8"
                    value={filters.search}
                    onChange={(e) => setFilters({...filters, search: e.target.value})}
                  />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={applyFilters}>
              <Filter className="w-4 h-4 mr-2" />
              Applica Filtri
            </Button>
          </CardFooter>
        </Card>
        
        {/* Tabella Transazioni */}
        <Card>
          <CardContent className="p-0 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px] cursor-pointer" onClick={() => handleSort('date')}>
                    <div className="flex items-center">
                      Data
                      {sortField === 'date' && (
                        <ArrowDownUp className="h-4 w-4 ml-1" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('description')}>
                    <div className="flex items-center">
                      Descrizione
                      {sortField === 'description' && (
                        <ArrowDownUp className="h-4 w-4 ml-1" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Metodo</TableHead>
                  <TableHead className="cursor-pointer text-right" onClick={() => handleSort('amount')}>
                    <div className="flex items-center justify-end">
                      Importo
                      {sortField === 'amount' && (
                        <ArrowDownUp className="h-4 w-4 ml-1" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="text-right">Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data && data.items.length > 0 ? (
                  data.items.map((transaction: any) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{formatDate(transaction.date)}</TableCell>
                      <TableCell>
                        {transaction.description}
                        {transaction.reference && (
                          <span className="text-xs text-muted-foreground block mt-1">
                            Rif: {transaction.reference}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={transaction.type === 'income' ? 'default' : 'destructive'}>
                          {getTypeLabel(transaction.type)}
                        </Badge>
                      </TableCell>
                      <TableCell>{getCategoryLabel(transaction.category)}</TableCell>
                      <TableCell>{getPaymentMethodLabel(transaction.paymentMethod)}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatAmount(transaction.amount, transaction.type)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-1">
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => {
                              setTransactionToDelete(transaction.id);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                      <div className="flex flex-col items-center">
                        <AlertCircle className="h-10 w-10 mb-2 text-muted-foreground/60" />
                        <p>Nessuna transazione trovata</p>
                        <p className="text-sm mt-1">Prova a modificare i filtri o a creare una nuova transazione</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {data && `Mostrando ${(page - 1) * limit + 1} - ${Math.min(page * limit, data.total)} di ${data.total} transazioni`}
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {data && Array.from({ length: Math.min(5, data.totalPages) }, (_, i) => {
                // Logica per mostrare le pagine in modo intelligente
                let pageNumber;
                if (data.totalPages <= 5) {
                  // Se ci sono 5 o meno pagine, le mostriamo tutte
                  pageNumber = i + 1;
                } else if (page <= 3) {
                  // Se siamo nelle prime pagine
                  pageNumber = i + 1;
                } else if (page >= data.totalPages - 2) {
                  // Se siamo nelle ultime pagine
                  pageNumber = data.totalPages - 4 + i;
                } else {
                  // Siamo nel mezzo
                  pageNumber = page - 2 + i;
                }
                
                return (
                  <Button
                    key={i}
                    variant={page === pageNumber ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(pageNumber)}
                  >
                    {pageNumber}
                  </Button>
                );
              })}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page + 1)}
                disabled={!data || page >= data.totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            <Select 
              value={limit.toString()} 
              onValueChange={(value) => {
                setLimit(parseInt(value));
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Righe per pagina" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 per pagina</SelectItem>
                <SelectItem value="25">25 per pagina</SelectItem>
                <SelectItem value="50">50 per pagina</SelectItem>
                <SelectItem value="100">100 per pagina</SelectItem>
              </SelectContent>
            </Select>
          </CardFooter>
        </Card>
      </div>
      
      {/* Dialog di conferma eliminazione */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Conferma eliminazione</DialogTitle>
            <DialogDescription>
              Sei sicuro di voler eliminare questa transazione? Questa azione non può essere annullata.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Annulla
            </Button>
            <Button variant="destructive" onClick={deleteTransaction}>
              Elimina
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default TransactionsPage;