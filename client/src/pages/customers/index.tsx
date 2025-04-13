import { useQuery } from "@tanstack/react-query";
import {
  Calendar,
  FileText,
  Mail,
  MapPin,
  MoreHorizontal,
  Phone,
  Plus,
  Search,
  Trash,
  User,
} from "lucide-react";
import { FC, useState } from "react";
import { Link } from "wouter";

import CustomerForm from "@/components/customer/CustomerForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const CustomersPage: FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewCustomerDialog, setShowNewCustomerDialog] = useState(false);

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

  const { data: customers, isLoading } = useQuery({
    queryKey: ["/api/customers"],
    queryFn: () => fetchWithToken("/api/customers"),
  });

  // Filter customers based on search query
  const filteredCustomers = Array.isArray(customers)
    ? customers.filter((customer: any) => {
        if (!searchQuery) return true;

        const fullName =
          `${customer.firstName} ${customer.lastName}`.toLowerCase();
        return (
          fullName.includes(searchQuery.toLowerCase()) ||
          customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          customer.phone.toLowerCase().includes(searchQuery.toLowerCase())
        );
      })
    : [];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="font-montserrat font-bold text-2xl mb-1">Clienti</h1>
          <p className="text-neutral-600">
            Gestisci i clienti della concessionaria
          </p>
        </div>
        <Dialog
          open={showNewCustomerDialog}
          onOpenChange={setShowNewCustomerDialog}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Nuovo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Aggiungi Nuovo Cliente</DialogTitle>
              <DialogDescription>
                Inserisci i dati del nuovo cliente. Tutti i campi contrassegnati
                con * sono obbligatori.
              </DialogDescription>
            </DialogHeader>
            <CustomerForm onSuccess={() => setShowNewCustomerDialog(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cerca clienti per nome, email o telefono..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista Clienti</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4 text-muted-foreground">
              Caricamento clienti...
            </div>
          ) : filteredCustomers && filteredCustomers.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Contatti</TableHead>
                    <TableHead>Indirizzo</TableHead>
                    <TableHead>Data Registrazione</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer: any) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <div className="font-medium">
                          {customer.firstName} {customer.lastName}
                        </div>
                        {customer.documentId && (
                          <div className="text-xs text-muted-foreground mt-1">
                            ID: {customer.documentId}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm">
                          <Mail className="h-4 w-4 mr-1 text-muted-foreground" />
                          <span>{customer.email}</span>
                        </div>
                        <div className="flex items-center text-sm mt-1">
                          <Phone className="h-4 w-4 mr-1 text-muted-foreground" />
                          <span>{customer.phone}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-start text-sm">
                          <MapPin className="h-4 w-4 mr-1 text-muted-foreground shrink-0 mt-0.5" />
                          <span>
                            {customer.address ? (
                              <>
                                {customer.address}
                                {customer.city && `, ${customer.city}`}
                                {customer.zipCode && ` (${customer.zipCode})`}
                              </>
                            ) : (
                              <span className="text-muted-foreground">
                                Indirizzo non specificato
                              </span>
                            )}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm">
                          <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                          <span>
                            {new Date(customer.createdAt).toLocaleDateString(
                              "it-IT"
                            )}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/customers/${customer.id}`}>
                                <User className="mr-2 h-4 w-4" /> Dettagli
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/appointments?customerId=${customer.id}`}
                              >
                                <Calendar className="mr-2 h-4 w-4" />{" "}
                                Appuntamenti
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/sales?customerId=${customer.id}`}>
                                <FileText className="mr-2 h-4 w-4" /> Acquisti
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <Trash className="mr-2 h-4 w-4" /> Elimina
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
              Nessun cliente trovato.
              {searchQuery && " Prova a modificare i criteri di ricerca."}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomersPage;
