import { FC, useState } from "react";
import { useParams, useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { 
  ArrowLeft, 
  Calendar, 
  Car, 
  Clock, 
  Edit, 
  FileText, 
  Mail, 
  MapPin, 
  Phone, 
  User, 
  XCircle, 
  Pencil, 
  CalendarClock,
  ShoppingCart,
  BanknoteIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
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
} from "@/components/ui/dialog";
import CustomerForm from "@/components/customer/CustomerForm";
import { Badge } from "@/components/ui/badge";
import { queryClient } from "@/lib/queryClient";

const CustomerDetailsPage: FC = () => {
  const { id } = useParams<{ id: string }>();
  const [_, navigate] = useLocation();
  const [showEditDialog, setShowEditDialog] = useState(false);
  
  const { data: customer, isLoading: isLoadingCustomer } = useQuery({
    queryKey: [`/api/customers/${id}`],
  });
  
  const { data: appointments, isLoading: isLoadingAppointments } = useQuery({
    queryKey: [`/api/appointments/by-customer/${id}`],
    enabled: !!id
  });
  
  const { data: sales, isLoading: isLoadingSales } = useQuery({
    queryKey: [`/api/sales/by-customer/${id}`],
    enabled: !!id
  });
  
  const handleEditSuccess = () => {
    setShowEditDialog(false);
    queryClient.invalidateQueries({ queryKey: [`/api/customers/${id}`] });
  };
  
  if (isLoadingCustomer) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <Clock className="animate-spin h-10 w-10 text-primary mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Caricamento dettagli cliente...</p>
        </div>
      </div>
    );
  }
  
  if (!customer) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <XCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
          <p className="text-lg font-semibold">Cliente non trovato</p>
          <p className="text-muted-foreground mb-4">Il cliente che stai cercando non esiste o è stato rimosso.</p>
          <Button onClick={() => navigate("/customers")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Torna alla lista clienti
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mr-2" 
            onClick={() => navigate("/customers")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="font-montserrat font-bold text-2xl">
            {customer.firstName} {customer.lastName}
          </h1>
        </div>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setShowEditDialog(true)}
        >
          <Edit className="mr-2 h-4 w-4" /> Modifica
        </Button>
        
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Modifica Cliente</DialogTitle>
              <DialogDescription>
                Modifica i dati del cliente. Tutti i campi contrassegnati con * sono obbligatori.
              </DialogDescription>
            </DialogHeader>
            <CustomerForm 
              defaultValues={customer} 
              isEditing={true} 
              onSuccess={handleEditSuccess} 
            />
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Informazioni Personali</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <User className="h-4 w-4 mr-3 text-muted-foreground" />
                <div>
                  <div className="font-medium">{customer.firstName} {customer.lastName}</div>
                  {customer.documentId && (
                    <div className="text-xs text-muted-foreground">ID: {customer.documentId}</div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-3 text-muted-foreground" />
                <span>{customer.email}</span>
              </div>
              
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-3 text-muted-foreground" />
                <span>{customer.phone}</span>
              </div>
              
              <div className="flex items-start">
                <MapPin className="h-4 w-4 mr-3 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  {customer.address ? (
                    <>
                      <div>{customer.address}</div>
                      {customer.city && <div>{customer.city}</div>}
                      {customer.zipCode && <div>{customer.zipCode}</div>}
                    </>
                  ) : (
                    <span className="text-muted-foreground">Indirizzo non specificato</span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-3 text-muted-foreground" />
                <div>
                  <div className="text-sm">Cliente dal</div>
                  <div>{new Date(customer.createdAt).toLocaleDateString("it-IT")}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between py-4">
              <CardTitle className="text-base">Note</CardTitle>
              <Button variant="ghost" size="sm">
                <Pencil className="h-4 w-4 mr-1" /> Modifica
              </Button>
            </CardHeader>
            <CardContent>
              {customer.notes ? (
                <p>{customer.notes}</p>
              ) : (
                <p className="text-muted-foreground">
                  Nessuna nota disponibile per questo cliente.
                </p>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between py-4">
              <CardTitle className="text-base">Riepilogo Attività</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <ShoppingCart className="h-5 w-5 text-blue-500 mr-2" />
                    <span className="font-medium">Acquisti</span>
                  </div>
                  <div className="text-2xl font-semibold mt-2">
                    {isLoadingSales ? "..." : sales?.length || 0}
                  </div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <CalendarClock className="h-5 w-5 text-green-500 mr-2" />
                    <span className="font-medium">Appuntamenti</span>
                  </div>
                  <div className="text-2xl font-semibold mt-2">
                    {isLoadingAppointments ? "..." : appointments?.length || 0}
                  </div>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <BanknoteIcon className="h-5 w-5 text-purple-500 mr-2" />
                    <span className="font-medium">Valore</span>
                  </div>
                  <div className="text-2xl font-semibold mt-2">
                    €{isLoadingSales ? "..." : (
                      sales?.reduce((total: number, sale: any) => total + sale.salePrice, 0).toLocaleString() || 0
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Tabs defaultValue="appointments" className="mb-6">
        <TabsList>
          <TabsTrigger value="appointments">Appuntamenti</TabsTrigger>
          <TabsTrigger value="purchases">Acquisti</TabsTrigger>
        </TabsList>
        
        <TabsContent value="appointments" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between py-4">
              <CardTitle className="text-base">Appuntamenti</CardTitle>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" /> Nuovo Appuntamento
              </Button>
            </CardHeader>
            <CardContent>
              {isLoadingAppointments ? (
                <div className="text-center py-4 text-muted-foreground">
                  Caricamento appuntamenti...
                </div>
              ) : appointments && appointments.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Veicolo</TableHead>
                      <TableHead>Stato</TableHead>
                      <TableHead>Note</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {appointments.map((appointment: any) => (
                      <TableRow key={appointment.id}>
                        <TableCell>
                          {new Date(appointment.date).toLocaleDateString("it-IT")}
                          <div className="text-xs text-muted-foreground">
                            {new Date(appointment.date).toLocaleTimeString("it-IT", {
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </div>
                        </TableCell>
                        <TableCell>
                          {appointment.type === "test_drive" && "Test Drive"}
                          {appointment.type === "service" && "Assistenza"}
                          {appointment.type === "consultation" && "Consulenza"}
                          {appointment.type === "trade_in" && "Permuta"}
                        </TableCell>
                        <TableCell>
                          {appointment.vehicleId ? appointment.vehicleId : "Nessun veicolo"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={appointment.status === "completed" ? "default" : 
                              appointment.status === "cancelled" ? "destructive" : 
                              "outline"}
                          >
                            {appointment.status === "scheduled" && "Programmato"}
                            {appointment.status === "completed" && "Completato"}
                            {appointment.status === "cancelled" && "Cancellato"}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {appointment.notes || "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Nessun appuntamento registrato per questo cliente.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="purchases" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between py-4">
              <CardTitle className="text-base">Acquisti</CardTitle>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" /> Nuova Vendita
              </Button>
            </CardHeader>
            <CardContent>
              {isLoadingSales ? (
                <div className="text-center py-4 text-muted-foreground">
                  Caricamento acquisti...
                </div>
              ) : sales && sales.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Veicolo</TableHead>
                      <TableHead>Metodo Pagamento</TableHead>
                      <TableHead>Stato</TableHead>
                      <TableHead className="text-right">Importo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sales.map((sale: any) => (
                      <TableRow key={sale.id}>
                        <TableCell>
                          {new Date(sale.saleDate).toLocaleDateString("it-IT")}
                        </TableCell>
                        <TableCell>
                          {sale.vehicleId}
                        </TableCell>
                        <TableCell>
                          {sale.paymentMethod === "cash" && "Contanti"}
                          {sale.paymentMethod === "finance" && "Finanziamento"}
                          {sale.paymentMethod === "leasing" && "Leasing"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={sale.status === "completed" ? "default" : 
                              sale.status === "cancelled" ? "destructive" : 
                              "secondary"}
                          >
                            {sale.status === "pending" && "In attesa"}
                            {sale.status === "completed" && "Completato"}
                            {sale.status === "cancelled" && "Cancellato"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          €{sale.salePrice.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Nessun acquisto registrato per questo cliente.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomerDetailsPage;
