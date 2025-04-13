import { FC, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Calendar as CalendarIcon,
  Plus,
  FileText,
  ArrowUpCircle,
  ArrowDownCircle,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import {
  TRANSACTION_TYPES,
  TRANSACTION_CATEGORIES,
  TRANSACTION_PAYMENT_METHODS,
  TRANSACTION_FREQUENCIES
} from "@/lib/constants";
import { apiRequest } from "@/lib/queryClient";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

const FinancePage: FC = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("all");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    type: "",
    category: "",
    startDate: "",
    endDate: "",
    paymentMethod: "",
    search: ""
  });
  
  // Stato per il dialogo di nuova transazione
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    description: "",
    amount: "",
    type: "income",
    category: "",
    date: new Date(),
    paymentMethod: "",
    reference: "",
    notes: ""
  });

  // Recupera le transazioni
  const { data: transactionsData, isLoading } = useQuery({
    queryKey: ["/api/transactions", page, limit, activeTab, filters],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      queryParams.append("page", page.toString());
      queryParams.append("limit", limit.toString());
      
      if (activeTab !== "all") {
        queryParams.append("type", activeTab);
      }
      
      if (filters.category) queryParams.append("category", filters.category);
      if (filters.startDate) queryParams.append("startDate", filters.startDate);
      if (filters.endDate) queryParams.append("endDate", filters.endDate);
      if (filters.paymentMethod) queryParams.append("paymentMethod", filters.paymentMethod);
      if (filters.search) queryParams.append("search", filters.search);
      
      const response = await fetch(`/api/transactions?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error("Errore nel recupero delle transazioni");
      }
      return response.json();
    },
  });

  // Recupera le transazioni programmate
  const { data: scheduledTransactionsData, isLoading: isLoadingScheduled } = useQuery({
    queryKey: ["/api/scheduled-transactions"],
    queryFn: async () => {
      const response = await fetch("/api/scheduled-transactions");
      if (!response.ok) {
        throw new Error("Errore nel recupero delle transazioni programmate");
      }
      return response.json();
    },
  });

  // Mutazione per creare una nuova transazione
  const createTransactionMutation = useMutation({
    mutationFn: async (transaction: any) => {
      const response = await apiRequest("POST", "/api/transactions", transaction);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Transazione creata",
        description: "La transazione è stata registrata con successo",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Errore",
        description: `Si è verificato un errore: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Handler per inviare il form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validazione dei campi obbligatori
    if (!newTransaction.description || !newTransaction.amount || !newTransaction.category) {
      toast({
        title: "Errore di validazione",
        description: "Compila tutti i campi obbligatori",
        variant: "destructive",
      });
      return;
    }
    
    createTransactionMutation.mutate({
      ...newTransaction,
      amount: parseFloat(newTransaction.amount),
      createdBy: 1, // ID dell'utente corrente
    });
  };

  // Reset del form
  const resetForm = () => {
    setNewTransaction({
      description: "",
      amount: "",
      type: "income",
      category: "",
      date: new Date(),
      paymentMethod: "",
      reference: "",
      notes: ""
    });
  };

  // Calcolo del totale delle entrate e uscite
  const calculateTotals = () => {
    if (!transactionsData?.items) return { income: 0, expense: 0, balance: 0 };
    
    const income = transactionsData.items
      .filter((transaction: any) => transaction.type === "income")
      .reduce((sum: number, transaction: any) => sum + transaction.amount, 0);
      
    const expense = transactionsData.items
      .filter((transaction: any) => transaction.type === "expense")
      .reduce((sum: number, transaction: any) => sum + transaction.amount, 0);
      
    return {
      income,
      expense,
      balance: income - expense
    };
  };

  const totals = calculateTotals();
  
  // Categorie filtrate in base al tipo (entrata/uscita)
  const filteredCategories = Object.entries(TRANSACTION_CATEGORIES).filter(([key]) => {
    if (newTransaction.type === "income") {
      return ["sale", "service", "parts_sale", "financing", "insurance", "other_income"].includes(key);
    } else {
      return !["sale", "service", "parts_sale", "financing", "insurance", "other_income"].includes(key);
    }
  });

  // Funzione per formattare l'importo come valuta
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  // Funzione per ottenere l'etichetta della categoria
  const getCategoryLabel = (categoryKey: string) => {
    return TRANSACTION_CATEGORIES[categoryKey as keyof typeof TRANSACTION_CATEGORIES] || categoryKey;
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Gestione Finanziaria</h1>
          <p className="text-muted-foreground">Monitora entrate, uscite e movimenti finanziari</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Nuova Transazione
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Registra nuova transazione</DialogTitle>
              <DialogDescription>
                Inserisci i dettagli della transazione finanziaria
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="transaction-type" className="text-right">
                    Tipo
                  </Label>
                  <Select
                    value={newTransaction.type}
                    onValueChange={(value) => setNewTransaction({...newTransaction, type: value})}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Seleziona tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(TRANSACTION_TYPES).map(([key, value]) => (
                        <SelectItem key={key} value={key}>
                          {value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="transaction-category" className="text-right">
                    Categoria
                  </Label>
                  <Select
                    value={newTransaction.category}
                    onValueChange={(value) => setNewTransaction({...newTransaction, category: value})}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Seleziona categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredCategories.map(([key, value]) => (
                        <SelectItem key={key} value={key}>
                          {value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="transaction-description" className="text-right">
                    Descrizione
                  </Label>
                  <Input
                    id="transaction-description"
                    className="col-span-3"
                    value={newTransaction.description}
                    onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="transaction-amount" className="text-right">
                    Importo (€)
                  </Label>
                  <Input
                    id="transaction-amount"
                    type="number"
                    step="0.01"
                    className="col-span-3"
                    value={newTransaction.amount}
                    onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="transaction-date" className="text-right">
                    Data
                  </Label>
                  <Input
                    id="transaction-date"
                    type="date"
                    className="col-span-3"
                    value={format(newTransaction.date, "yyyy-MM-dd")}
                    onChange={(e) => setNewTransaction({...newTransaction, date: new Date(e.target.value)})}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="transaction-payment" className="text-right">
                    Metodo Pagamento
                  </Label>
                  <Select
                    value={newTransaction.paymentMethod}
                    onValueChange={(value) => setNewTransaction({...newTransaction, paymentMethod: value})}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Seleziona metodo" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(TRANSACTION_PAYMENT_METHODS).map(([key, value]) => (
                        <SelectItem key={key} value={key}>
                          {value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="transaction-reference" className="text-right">
                    Riferimento
                  </Label>
                  <Input
                    id="transaction-reference"
                    className="col-span-3"
                    placeholder="Numero fattura, ecc."
                    value={newTransaction.reference}
                    onChange={(e) => setNewTransaction({...newTransaction, reference: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="transaction-notes" className="text-right pt-2">
                    Note
                  </Label>
                  <Textarea
                    id="transaction-notes"
                    className="col-span-3"
                    rows={3}
                    value={newTransaction.notes}
                    onChange={(e) => setNewTransaction({...newTransaction, notes: e.target.value})}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createTransactionMutation.isPending}>
                  {createTransactionMutation.isPending ? "Salvataggio..." : "Salva"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Entrate Totali
            </CardTitle>
            <ArrowUpCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totals.income)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Uscite Totali
            </CardTitle>
            <ArrowDownCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totals.expense)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Saldo
            </CardTitle>
            <FileText className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totals.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(totals.balance)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="all">Tutte</TabsTrigger>
              <TabsTrigger value="income">Entrate</TabsTrigger>
              <TabsTrigger value="expense">Uscite</TabsTrigger>
              <TabsTrigger value="scheduled">Pianificate</TabsTrigger>
            </TabsList>
            
            <div className="flex space-x-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cerca..."
                  className="pl-8 w-[200px]"
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                />
              </div>
              <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
                <Filter className="mr-2 h-4 w-4" />
                Filtri
              </Button>
            </div>
          </div>

          {showFilters && (
            <Card className="mt-4">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label>Categoria</Label>
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
                  <div>
                    <Label>Data Inizio</Label>
                    <Input
                      type="date"
                      value={filters.startDate}
                      onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Data Fine</Label>
                    <Input
                      type="date"
                      value={filters.endDate}
                      onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Metodo Pagamento</Label>
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
                </div>
                <div className="flex justify-end mt-4 space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setFilters({
                      type: "",
                      category: "",
                      startDate: "",
                      endDate: "",
                      paymentMethod: "",
                      search: ""
                    })}
                  >
                    Resetta
                  </Button>
                  <Button onClick={() => {
                    setPage(1);
                    // Refresh query viene fatto automaticamente quando cambiano i queryKey
                  }}>
                    Applica
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <TabsContent value="all" className="space-y-4">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Descrizione</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Riferimento</TableHead>
                      <TableHead className="text-right">Importo</TableHead>
                      <TableHead>Tipo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">
                          Caricamento...
                        </TableCell>
                      </TableRow>
                    ) : !transactionsData?.items?.length ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">
                          Nessuna transazione trovata
                        </TableCell>
                      </TableRow>
                    ) : (
                      transactionsData.items.map((transaction: any) => (
                        <TableRow key={transaction.id}>
                          <TableCell>{format(new Date(transaction.date), "dd/MM/yyyy")}</TableCell>
                          <TableCell className="font-medium">{transaction.description}</TableCell>
                          <TableCell>{getCategoryLabel(transaction.category)}</TableCell>
                          <TableCell>{transaction.reference || "-"}</TableCell>
                          <TableCell className={`text-right font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(transaction.amount)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={transaction.type === 'income' ? 'success' : 'destructive'}>
                              {TRANSACTION_TYPES[transaction.type as keyof typeof TRANSACTION_TYPES]}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
                
                {transactionsData?.totalPages > 1 && (
                  <div className="py-4 px-6">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                          />
                        </PaginationItem>
                        
                        {Array.from({ length: transactionsData.totalPages }, (_, i) => i + 1).map((p) => (
                          <PaginationItem key={p}>
                            <PaginationLink
                              onClick={() => setPage(p)}
                              isActive={page === p}
                            >
                              {p}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        
                        <PaginationItem>
                          <PaginationNext 
                            onClick={() => setPage(p => Math.min(transactionsData.totalPages, p + 1))}
                            disabled={page === transactionsData.totalPages}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="income" className="space-y-4">
            {/* Contenuto identico a "all" ma filtrato per entrate */}
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Descrizione</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Riferimento</TableHead>
                      <TableHead className="text-right">Importo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">
                          Caricamento...
                        </TableCell>
                      </TableRow>
                    ) : !transactionsData?.items?.length ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">
                          Nessuna entrata trovata
                        </TableCell>
                      </TableRow>
                    ) : (
                      transactionsData.items.map((transaction: any) => (
                        <TableRow key={transaction.id}>
                          <TableCell>{format(new Date(transaction.date), "dd/MM/yyyy")}</TableCell>
                          <TableCell className="font-medium">{transaction.description}</TableCell>
                          <TableCell>{getCategoryLabel(transaction.category)}</TableCell>
                          <TableCell>{transaction.reference || "-"}</TableCell>
                          <TableCell className="text-right font-semibold text-green-600">
                            {formatCurrency(transaction.amount)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
                
                {transactionsData?.totalPages > 1 && (
                  <div className="py-4 px-6">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                          />
                        </PaginationItem>
                        
                        {Array.from({ length: transactionsData.totalPages }, (_, i) => i + 1).map((p) => (
                          <PaginationItem key={p}>
                            <PaginationLink
                              onClick={() => setPage(p)}
                              isActive={page === p}
                            >
                              {p}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        
                        <PaginationItem>
                          <PaginationNext 
                            onClick={() => setPage(p => Math.min(transactionsData.totalPages, p + 1))}
                            disabled={page === transactionsData.totalPages}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="expense" className="space-y-4">
            {/* Contenuto identico a "all" ma filtrato per uscite */}
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Descrizione</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Riferimento</TableHead>
                      <TableHead className="text-right">Importo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">
                          Caricamento...
                        </TableCell>
                      </TableRow>
                    ) : !transactionsData?.items?.length ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">
                          Nessuna uscita trovata
                        </TableCell>
                      </TableRow>
                    ) : (
                      transactionsData.items.map((transaction: any) => (
                        <TableRow key={transaction.id}>
                          <TableCell>{format(new Date(transaction.date), "dd/MM/yyyy")}</TableCell>
                          <TableCell className="font-medium">{transaction.description}</TableCell>
                          <TableCell>{getCategoryLabel(transaction.category)}</TableCell>
                          <TableCell>{transaction.reference || "-"}</TableCell>
                          <TableCell className="text-right font-semibold text-red-600">
                            {formatCurrency(transaction.amount)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
                
                {transactionsData?.totalPages > 1 && (
                  <div className="py-4 px-6">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                          />
                        </PaginationItem>
                        
                        {Array.from({ length: transactionsData.totalPages }, (_, i) => i + 1).map((p) => (
                          <PaginationItem key={p}>
                            <PaginationLink
                              onClick={() => setPage(p)}
                              isActive={page === p}
                            >
                              {p}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        
                        <PaginationItem>
                          <PaginationNext 
                            onClick={() => setPage(p => Math.min(transactionsData.totalPages, p + 1))}
                            disabled={page === transactionsData.totalPages}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scheduled" className="space-y-4">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data scadenza</TableHead>
                      <TableHead>Descrizione</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Frequenza</TableHead>
                      <TableHead className="text-right">Importo</TableHead>
                      <TableHead>Stato</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingScheduled ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">
                          Caricamento...
                        </TableCell>
                      </TableRow>
                    ) : !scheduledTransactionsData?.items?.length ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">
                          Nessuna transazione programmata trovata
                        </TableCell>
                      </TableRow>
                    ) : (
                      scheduledTransactionsData.items.map((transaction: any) => (
                        <TableRow key={transaction.id}>
                          <TableCell>{format(new Date(transaction.dueDate), "dd/MM/yyyy")}</TableCell>
                          <TableCell className="font-medium">{transaction.description}</TableCell>
                          <TableCell>{getCategoryLabel(transaction.category)}</TableCell>
                          <TableCell>
                            {transaction.isRecurring ? 
                              TRANSACTION_FREQUENCIES[transaction.frequency as keyof typeof TRANSACTION_FREQUENCIES] : 
                              "Una tantum"}
                          </TableCell>
                          <TableCell className={`text-right font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(transaction.amount)}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                transaction.status === "pending" ? "outline" : 
                                transaction.status === "paid" ? "success" :
                                "destructive"
                              }
                            >
                              {transaction.status === "pending" ? "In attesa" : 
                               transaction.status === "paid" ? "Pagato" : "Annullato"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FinancePage;