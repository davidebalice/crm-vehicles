import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertTriangle,
  Search,
  Plus,
  Filter,
  Package,
  ShoppingCart
} from "lucide-react";

import type { Part, Supplier } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";


const PartsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [supplierId, setSupplierId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [showLowStock, setShowLowStock] = useState(false);
  
  // Costruisce i parametri della query in base ai filtri
  const buildQueryParams = () => {
    const params = new URLSearchParams();
    if (searchTerm) params.append("search", searchTerm);
    if (category) params.append("category", category);
    if (supplierId) params.append("supplierId", supplierId);
    if (status) params.append("status", status);
    if (showLowStock) params.append("lowStock", "true");
    return params.toString();
  };
  
  // Query per le parti con filtri
  const { 
    data: partsData, 
    isLoading: isLoadingParts,
    refetch: refetchParts
  } = useQuery<{ data: Part[], total: number, page: number, limit: number, totalPages: number }>({
    queryKey: ["/api/parts", buildQueryParams()],
  });
  
  // Verifica se il risultato è un array o un oggetto paginato e gestisci di conseguenza
  const parts = partsData?.data || [];
  
  // Query per i fornitori (per il filtro)
  const { 
    data: suppliersData,
    isLoading: isLoadingSuppliers 
  } = useQuery<{ items: Supplier[], total: number, page: number, limit: number, totalPages: number }>({
    queryKey: ["/api/suppliers"],
  });
  
  // Verifica se il risultato è un array o un oggetto paginato e gestisci di conseguenza
  const suppliers = suppliersData?.items || [];
  
  // Categorie uniche estratte dalle parti
  const categories = parts && parts.length ? Array.from(new Set(parts.map(part => part.category))) : [];
  
  // Gestisce la ricerca
  const handleSearch = () => {
    refetchParts();
  };
  
  // Resetta tutti i filtri
  const resetFilters = () => {
    setSearchTerm("");
    setCategory(null);
    setSupplierId(null);
    setStatus(null);
    setShowLowStock(false);
    refetchParts();
  };
  
  // Formatta il prezzo in valuta
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('it-IT', { 
      style: 'currency', 
      currency: 'EUR' 
    }).format(price);
  };
  
  // Ottiene il nome del fornitore
  const getSupplierName = (supplierId: number | null) => {
    if (!supplierId) return "N/D";
    const supplier = suppliers.find(s => s.id === supplierId);
    return supplier ? supplier.name : "N/D";
  };
  
  // Categorie per lo stato
  const statusOptions = [
    { value: "active", label: "Attivo" },
    { value: "low_stock", label: "Scorta bassa" },
    { value: "out_of_stock", label: "Esaurito" },
    { value: "discontinued", label: "Fuori catalogo" },
  ];
  
  // Badge per lo stato del ricambio
  const StatusBadge = ({ status }: { status: string }) => {
    const getStatusColor = () => {
      switch (status) {
        case 'active': return 'bg-green-100 text-green-800';
        case 'low_stock': return 'bg-yellow-100 text-yellow-800';
        case 'out_of_stock': return 'bg-red-100 text-red-800';
        case 'discontinued': return 'bg-gray-100 text-gray-800';
        case 'on_order': return 'bg-blue-100 text-blue-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    };
    
    const getStatusText = () => {
      switch (status) {
        case 'active': return 'Attivo';
        case 'low_stock': return 'Scorta bassa';
        case 'out_of_stock': return 'Esaurito';
        case 'discontinued': return 'Fuori catalogo';
        case 'on_order': return 'Ordinato';
        default: return status;
      }
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
        {getStatusText()}
      </span>
    );
  };
  
  const loadingMessage = isLoadingParts ? (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  ) : null;
  
  const emptyMessage = !isLoadingParts && parts.length === 0 ? (
    <div className="flex flex-col justify-center items-center h-64 text-center">
      <Package className="h-12 w-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900">Nessun ricambio trovato</h3>
      <p className="mt-1 text-sm text-gray-500">
        Non ci sono ricambi che corrispondono ai criteri di ricerca.
      </p>
      {Object.values({ searchTerm, category, supplierId, status }).some(v => v) || showLowStock ? (
        <Button variant="outline" className="mt-4" onClick={resetFilters}>
          Reset filtri
        </Button>
      ) : (
        <Button asChild className="mt-4">
          <Link href="/parts/new">
            <Plus className="mr-2 h-4 w-4" />
            Aggiungi ricambio
          </Link>
        </Button>
      )}
    </div>
  ) : null;
  
  return (
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Gestione Ricambi</h1>
            <p className="text-muted-foreground mt-1">
              Gestisci inventario, prezzi e ordini di ricambi
            </p>
          </div>
          <Button asChild>
            <Link href="/parts/new">
              <Plus className="mr-2 h-4 w-4" />
              Nuovo Ricambio
            </Link>
          </Button>
        </div>
        
        {/* Statistiche Ricambi */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Totale Ricambi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{parts.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Valore Inventario</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {parts && parts.length ? formatPrice(parts.reduce((sum, part) => sum + part.price * part.stockQuantity, 0)) : formatPrice(0)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Ricambi con Scorta Bassa</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {parts && parts.length ? parts.filter(part => part.stockQuantity <= part.minQuantity).length : 0}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Ricambi Esauriti</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {parts && parts.length ? parts.filter(part => part.stockQuantity === 0).length : 0}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Filtri e Ricerca */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  type="text"
                  placeholder="Cerca per nome, codice o descrizione..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Select value={category || "all"} onValueChange={(value) => setCategory(value === "all" ? null : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutte le categorie</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Select value={supplierId || "all"} onValueChange={(value) => setSupplierId(value === "all" ? null : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Fornitore" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti i fornitori</SelectItem>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id.toString()}>{supplier.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Select value={status || "all"} onValueChange={(value) => setStatus(value === "all" ? null : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Stato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti gli stati</SelectItem>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="default" 
                onClick={handleSearch}
                className="flex-1"
              >
                <Filter className="mr-2 h-4 w-4" />
                Filtra
              </Button>
              
              <Button 
                variant={showLowStock ? "destructive" : "outline"} 
                onClick={() => {
                  setShowLowStock(!showLowStock);
                  setTimeout(() => refetchParts(), 0);
                }}
                className="whitespace-nowrap"
              >
                <AlertTriangle className={`mr-2 h-4 w-4 ${showLowStock ? 'text-white' : 'text-yellow-500'}`} />
                Scorta Bassa
              </Button>
            </div>
          </div>
        </div>
        
        {/* Tabella dei Ricambi */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loadingMessage}
          {emptyMessage}
          
          {!isLoadingParts && parts.length > 0 && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Codice</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Fornitore</TableHead>
                    <TableHead className="text-right">Prezzo</TableHead>
                    <TableHead className="text-right">Quantità</TableHead>
                    <TableHead>Stato</TableHead>
                    <TableHead className="text-right">Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parts.map((part) => (
                    <TableRow key={part.id}>
                      <TableCell className="font-medium">{part.partNumber}</TableCell>
                      <TableCell>{part.name}</TableCell>
                      <TableCell>{part.category}</TableCell>
                      <TableCell>{getSupplierName(part.supplierId)}</TableCell>
                      <TableCell className="text-right">{formatPrice(part.price)}</TableCell>
                      <TableCell className="text-right">
                        {part.stockQuantity}
                        {part.stockQuantity <= part.minQuantity && (
                          <span className="ml-2 inline-block">
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={part.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/parts/${part.id}`}>
                              Dettagli
                            </Link>
                          </Button>
                          <Button variant="outline" size="icon" className="h-8 w-8">
                            <ShoppingCart className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    );
};

export default PartsPage;