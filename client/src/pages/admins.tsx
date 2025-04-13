import { FC, useState } from "react";
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage 
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Definizione dei tipi
type Admin = {
  id: number;
  name: string;
  email: string;
  role: string;
  lastLogin: string;
};

// Schema di validazione per amministratori
const adminSchema = z.object({
  name: z.string().min(3, "Il nome deve avere almeno 3 caratteri"),
  email: z.string().email("Inserisci un indirizzo email valido"),
  password: z.string().min(8, "La password deve avere almeno 8 caratteri"),
  role: z.string().min(2, "Seleziona un ruolo valido")
});

type AdminFormValues = z.infer<typeof adminSchema>;

// Dati dummy per la demo
const dummyAdmins: Admin[] = [
  {
    id: 1,
    name: "Mario Rossi",
    email: "mario.rossi@automotoplus.it",
    role: "Amministratore",
    lastLogin: "10/03/2025 14:32"
  },
  {
    id: 2,
    name: "Laura Bianchi",
    email: "laura.bianchi@automotoplus.it",
    role: "Responsabile Vendite",
    lastLogin: "01/04/2025 08:15"
  },
  {
    id: 3,
    name: "Giuseppe Verdi",
    email: "giuseppe.verdi@automotoplus.it",
    role: "Responsabile Officina",
    lastLogin: "31/03/2025 17:45"
  }
];

const AdminPage: FC = () => {
  const [admins, setAdmins] = useState<Admin[]>(dummyAdmins);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const { toast } = useToast();

  const form = useForm<AdminFormValues>({
    resolver: zodResolver(adminSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: ""
    }
  });

  const editForm = useForm<AdminFormValues>({
    resolver: zodResolver(adminSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: ""
    }
  });

  const onSubmit = (values: AdminFormValues) => {
    const newAdmin: Admin = {
      id: admins.length + 1,
      name: values.name,
      email: values.email,
      role: values.role,
      lastLogin: "N/A"
    };
    
    setAdmins([...admins, newAdmin]);
    setIsAddDialogOpen(false);
    form.reset();
    
    toast({
      title: "Amministratore aggiunto",
      description: `${values.name} è stato aggiunto come ${values.role}`,
    });
  };

  const onEditSubmit = (values: AdminFormValues) => {
    if (!selectedAdmin) return;
    
    const updatedAdmins = admins.map(admin => 
      admin.id === selectedAdmin.id 
        ? { ...admin, name: values.name, email: values.email, role: values.role } 
        : admin
    );
    
    setAdmins(updatedAdmins);
    setIsEditDialogOpen(false);
    editForm.reset();
    
    toast({
      title: "Amministratore aggiornato",
      description: `I dati di ${values.name} sono stati aggiornati`,
    });
  };

  const handleEditClick = (admin: Admin) => {
    setSelectedAdmin(admin);
    editForm.setValue("name", admin.name);
    editForm.setValue("email", admin.email);
    editForm.setValue("password", ""); // Password vuota per il form di modifica
    editForm.setValue("role", admin.role);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (admin: Admin) => {
    const updatedAdmins = admins.filter(a => a.id !== admin.id);
    setAdmins(updatedAdmins);
    
    toast({
      title: "Amministratore rimosso",
      description: `${admin.name} è stato rimosso dal sistema`,
      variant: "destructive"
    });
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestione Amministratori</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus size={16} />
              Nuovo Amministratore
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Aggiungi nuovo amministratore</DialogTitle>
              <DialogDescription>
                Inserisci i dati per creare un nuovo account amministratore
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Mario Rossi" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="mario.rossi@automotoplus.it" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="********" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ruolo</FormLabel>
                      <FormControl>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          {...field}
                        >
                          <option value="">Seleziona un ruolo</option>
                          <option value="Amministratore">Amministratore</option>
                          <option value="Responsabile Vendite">Responsabile Vendite</option>
                          <option value="Responsabile Officina">Responsabile Officina</option>
                          <option value="Contabilità">Contabilità</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button type="submit">Salva</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Amministratori del Sistema</CardTitle>
          <CardDescription>
            Gestisci gli utenti che hanno accesso al sistema di amministrazione
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Cerca amministratore..."
              className="max-w-sm"
            />
          </div>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Ruolo</TableHead>
                  <TableHead>Ultimo accesso</TableHead>
                  <TableHead className="w-[100px]">Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell className="font-medium">{admin.name}</TableCell>
                    <TableCell>{admin.email}</TableCell>
                    <TableCell>{admin.role}</TableCell>
                    <TableCell>{admin.lastLogin}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEditClick(admin)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(admin)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog per la modifica */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Modifica amministratore</DialogTitle>
            <DialogDescription>
              Modifica i dati dell'account amministratore
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome completo</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password (lascia vuoto per non modificare)</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Nuova password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ruolo</FormLabel>
                    <FormControl>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        {...field}
                      >
                        <option value="">Seleziona un ruolo</option>
                        <option value="Amministratore">Amministratore</option>
                        <option value="Responsabile Vendite">Responsabile Vendite</option>
                        <option value="Responsabile Officina">Responsabile Officina</option>
                        <option value="Contabilità">Contabilità</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="submit">Aggiorna</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPage;