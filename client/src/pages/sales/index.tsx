import { FC, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  Plus, 
  Search, 
  Calendar, 
  User, 
  Car, 
  CreditCard, 
  MoreHorizontal, 
  FileText, 
  BanknoteIcon
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PAYMENT_METHODS } from "@/lib/constants";

const SalesPage: FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("all");
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  const token = localStorage.getItem("jwt_token");

  const fetchWithToken = async (url: string) => {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      throw new Error(`Errore nel fetch di ${url}`);
    }

    return res.json();
  };

  const { data: sales, isLoading } = useQuery({
    queryKey: ["/api/sales"],
    queryFn: () => fetchWithToken("/api/sales"),
  });

  const { data: customers } = useQuery({
    queryKey: ["/api/customers"],
    queryFn: () => fetchWithToken("/api/customers"),
  });

  const { data: vehicles } = useQuery({
    queryKey: ["/api/vehicles"],
    queryFn: () => fetchWithToken("/api/vehicles"),
  });

  // Helper function to get customer name by id
  const getCustomerName = (customerId: number) => {
    if (!customers) return "Cliente #" + customerId;
    
    const customer = customers.find((c: any) => c.id === customerId);
    return customer ? `${customer.firstName} ${customer.lastName}` : "Cliente #" + customerId;
  };
  
  // Helper function to get vehicle info by id
  const getVehicleInfo = (vehicleId: number) => {
    if (!vehicles) return "Veicolo #" + vehicleId;
    
    const vehicle = vehicles.find((v: any) => v.id === vehicleId);
    return vehicle ? `${vehicle.vin} (${vehicle.color})` : "Veicolo #" + vehicleId;
  };
  
  // Filter sales
  const filteredSales = sales?.filter((sale: any) => {
    // Filter by search query (check in customer name)
    const customerName = getCustomerName(sale.customerId).toLowerCase();
    const matchesSearch = 
      !searchQuery || 
      customerName.includes(searchQuery.toLowerCase());
    
    // Filter by status
    const matchesStatus = statusFilter === "all" || sale.status === statusFilter;
    
    // Filter by payment method
    const matchesPaymentMethod = paymentMethodFilter === "all" || sale.paymentMethod === paymentMethodFilter;
    
    return matchesSearch && matchesStatus && matchesPaymentMethod;
  });
  
  // Calculate total sales
  const totalSales = filteredSales?.reduce((total, sale) => total + sale.salePrice, 0) || 0;
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="font-montserrat font-bold text-2xl mb-1">Vendite</h1>
          <p className="text-neutral-600">Gestisci le vendite di veicoli</p>
        </div>
        <Button asChild>
          <Link href="/sales/new">
            <Plus className="mr-2 h-4 w-4" /> Nuova Vendita
          </Link>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <p className="text-muted-foreground text-sm">Vendite totali</p>
                <p className="text-2xl font-bold">
                  €{totalSales.toLocaleString()}
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                <BanknoteIcon className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <p className="text-muted-foreground text-sm">Veicoli venduti</p>
                <p className="text-2xl font-bold">
                  {filteredSales?.length || 0}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                <Car className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <p className="text-muted-foreground text-sm">Vendite in attesa</p>
                <p className="text-2xl font-bold">
                  {filteredSales?.filter(sale => sale.status === "pending").length || 0}
                </p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600">
                <Calendar className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cerca per cliente..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filtra per stato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti gli stati</SelectItem>
                  <SelectItem value="pending">In attesa</SelectItem>
                  <SelectItem value="completed">Completato</SelectItem>
                  <SelectItem value="cancelled">Cancellato</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Metodo di pagamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti i metodi</SelectItem>
                  {Object.entries(PAYMENT_METHODS).map(([key, value]) => (
                    <SelectItem key={key} value={key}>{value}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Lista Vendite</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4 text-muted-foreground">
              Caricamento vendite...
            </div>
          ) : filteredSales && filteredSales.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">Data</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Veicolo</TableHead>
                    <TableHead>Metodo Pagamento</TableHead>
                    <TableHead>Stato</TableHead>
                    <TableHead className="text-right">Importo</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSales.map((sale: any) => (
                    <TableRow key={sale.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                          <div>{new Date(sale.saleDate).toLocaleDateString("it-IT")}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{getCustomerName(sale.customerId)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Car className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{getVehicleInfo(sale.vehicleId)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <CreditCard className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{PAYMENT_METHODS[sale.paymentMethod as keyof typeof PAYMENT_METHODS]}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            sale.status === "completed" ? "default" : 
                            sale.status === "cancelled" ? "destructive" : 
                            "secondary"
                          }
                        >
                          {sale.status === "pending" && "In attesa"}
                          {sale.status === "completed" && "Completato"}
                          {sale.status === "cancelled" && "Cancellato"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        €{sale.salePrice.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <FileText className="mr-2 h-4 w-4" /> Dettagli
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Calendar className="mr-2 h-4 w-4" /> Aggiorna stato
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Nessuna vendita trovata.
              {searchQuery && " Prova a modificare i criteri di ricerca."}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesPage;
