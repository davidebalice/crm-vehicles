import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import {
  Bell,
  Briefcase,
  Camera,
  Database,
  Lock,
  Save,
  User,
  Users,
} from "lucide-react";
import { FC, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation } from "wouter";
import { z } from "zod";

const imageFormSchema = z.object({
  image: z.any().optional(),
});

type ImageFormValues = z.infer<typeof imageFormSchema>;

const SettingsPage: FC = () => {
  const { toast } = useToast();
  const isEditing = true;
  const [activeTab, setActiveTab] = useState("profile");
  const [_, navigate] = useLocation();
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("jwt_token");
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [image, setImage] = useState<File | null>(null);
  const [user, setUser] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);

  const fetchWithToken = async (url: string) => {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    console.log(res);
    if (!res.ok) {
      throw new Error(`Errore nel fetch di ${url}`);
    }

    return res.json();
  };

  const handleSave = () => {
    toast({
      title: "Impostazioni salvate",
      description: "Le modifiche sono state salvate con successo.",
      duration: 3000,
    });
  };

  const form = useForm<ImageFormValues>({
    resolver: zodResolver(imageFormSchema),
  });

  const { data: settingsData, isLoading } = useQuery({
    queryKey: [baseUrl + "/api/settings"],
    queryFn: () => fetchWithToken(baseUrl + "/api/settings"),
    enabled: isEditing,
  });

  console.log(settingsData);

  useEffect(() => {
    if (settingsData) {
      setUser(settingsData.user);
      setSettings(settingsData.settings);
    }
  }, [settingsData]);

  const onPhotoSubmit = async (data: ImageFormValues) => {
    try {
      // Verifica se ci sono immagini da inviare
      if (!image && selectedImages.length === 0) {
        toast({
          title: "Errore",
          description: "Nessuna immagine selezionata.",
          variant: "destructive",
        });
        return;
      }

      const formData = new FormData();

      // Aggiungi l'immagine principale
      if (image) {
        formData.append("profileImage", image);
      }

      console.log(image);

      // Invio della richiesta per caricare le immagini
      const response = await fetch(`${baseUrl}/api/settings/upload-images`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      console.log("response aa");
      console.log(response);

      if (!response.ok) {
        throw new Error("Errore durante il caricamento delle immagini");
      }

      toast({
        title: "Foto caricata",
        description: "Le immagini sono state caricate con successo",
      });

      //queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
      navigate("/settings");
    } catch (error) {
      toast({
        title: "Errore",
        description: `Errore durante il caricamento: ${
          error instanceof Error ? error.message : "Sconosciuto"
        }`,
        variant: "destructive",
      });
    }
  };

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImage(e.target.files[0]);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="font-montserrat font-bold text-2xl mb-1">
            Impostazioni
          </h1>
          <p className="text-neutral-600">
            Configura le impostazioni del gestionale
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <Card className="md:w-[240px] shrink-0">
          <CardContent className="px-2 py-6">
            <nav className="flex flex-col space-y-1">
              <Button
                variant={activeTab === "profile" ? "default" : "ghost"}
                className="justify-start"
                onClick={() => setActiveTab("profile")}
              >
                <User className="mr-2 h-4 w-4" />
                Profilo
              </Button>
              <Button
                variant={activeTab === "account" ? "default" : "ghost"}
                className="justify-start"
                onClick={() => setActiveTab("account")}
              >
                <Lock className="mr-2 h-4 w-4" />
                Account e Sicurezza
              </Button>
              <Button
                variant={activeTab === "notifications" ? "default" : "ghost"}
                className="justify-start"
                onClick={() => setActiveTab("notifications")}
              >
                <Bell className="mr-2 h-4 w-4" />
                Notifiche
              </Button>
              <Button
                variant={activeTab === "users" ? "default" : "ghost"}
                className="justify-start"
                onClick={() => setActiveTab("users")}
              >
                <Users className="mr-2 h-4 w-4" />
                Utenti e Permessi
              </Button>
              <Button
                variant={activeTab === "company" ? "default" : "ghost"}
                className="justify-start"
                onClick={() => setActiveTab("company")}
              >
                <Briefcase className="mr-2 h-4 w-4" />
                Dati Aziendali
              </Button>
              <Button
                variant={activeTab === "system" ? "default" : "ghost"}
                className="justify-start"
                onClick={() => setActiveTab("system")}
              >
                <Database className="mr-2 h-4 w-4" />
                Sistema
              </Button>
            </nav>
          </CardContent>
        </Card>

        <div className="flex-1">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informazioni Profilo</CardTitle>
                  <CardDescription>
                    Gestisci le tue informazioni personali
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col sm:flex-row gap-4 items-start">
                    <div className="relative">
                      <img
                        src="https://randomuser.me/api/portraits/men/32.jpg"
                        alt="Avatar"
                        className="h-24 w-24 rounded-full object-cover border"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        className="absolute bottom-0 right-0"
                      >
                        <Camera />
                      </Button>
                    </div>

                    <CardContent>
                      {isEditing && isLoading ? (
                        <div className="text-center py-4 text-muted-foreground">
                          Caricamento...
                        </div>
                      ) : (
                        <Form {...form}>
                          <form
                            onSubmit={form.handleSubmit(onPhotoSubmit)}
                            className="space-y-6"
                          >
                            <FormField
                              control={form.control}
                              name="image"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Immagine principale</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="file"
                                      name="profileName"
                                      accept="image/*"
                                      onChange={handleMainImageChange}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="outline"
                                type="button"
                                onClick={() => navigate("/vehicles")}
                              >
                                Annulla
                              </Button>
                              <Button type="submit">Carica immagini</Button>
                            </div>
                          </form>
                        </Form>
                      )}
                    </CardContent>

                    <div className="space-y-1 flex-1">
                      <h3 className="font-medium text-lg">Mario Rossi</h3>
                      <p className="text-sm text-muted-foreground">
                        Amministratore
                      </p>
                      <p className="text-sm">
                        Ultimo accesso: 24/06/2023, 14:30
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Nome</label>
                      <Input defaultValue="Mario" />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Cognome</label>
                      <Input defaultValue="Rossi" />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email</label>
                      <Input defaultValue="mario.rossi@automotoplus.com" />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Telefono</label>
                      <Input defaultValue="+39 123 456 7890" />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleSave}>
                    <Save className="mr-2 h-4 w-4" /> Salva Modifiche
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="account" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Sicurezza Account</CardTitle>
                  <CardDescription>
                    Gestisci la sicurezza del tuo account
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Modifica Password</h3>

                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Password Attuale
                        </label>
                        <Input type="password" placeholder="••••••••" />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Nuova Password
                        </label>
                        <Input type="password" placeholder="••••••••" />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Conferma Nuova Password
                        </label>
                        <Input type="password" placeholder="••••••••" />
                      </div>
                    </div>

                    <Button variant="outline">
                      <Lock className="mr-2 h-4 w-4" /> Cambia Password
                    </Button>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">
                      Autenticazione a Due Fattori
                    </h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          Attiva l'autenticazione a due fattori
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Aumenta la sicurezza del tuo account richiedendo un
                          codice oltre alla password
                        </p>
                      </div>
                      <Switch />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Sessioni Attive</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <p className="font-medium">Chrome - Windows</p>
                          <p className="text-sm text-muted-foreground">
                            Questo dispositivo • IP: 192.168.1.1 • Attiva ora
                          </p>
                        </div>
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                          Attiva
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <p className="font-medium">Safari - MacOS</p>
                          <p className="text-sm text-muted-foreground">
                            IP: 192.168.1.2 • Ultima attività: 2 giorni fa
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                        >
                          Termina
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Preferenze di Notifica</CardTitle>
                  <CardDescription>
                    Configura come e quando ricevere notifiche
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Notifiche Email</h3>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Riassunto giornaliero</p>
                          <p className="text-sm text-muted-foreground">
                            Ricevi un riassunto giornaliero delle attività
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Nuove vendite</p>
                          <p className="text-sm text-muted-foreground">
                            Ricevi una notifica quando viene registrata una
                            nuova vendita
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Nuovi appuntamenti</p>
                          <p className="text-sm text-muted-foreground">
                            Ricevi una notifica quando viene programmato un
                            nuovo appuntamento
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Livelli di stock bassi</p>
                          <p className="text-sm text-muted-foreground">
                            Ricevi avvisi quando i ricambi sono quasi esauriti
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">
                      Notifiche nel Sistema
                    </h3>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Notifiche desktop</p>
                          <p className="text-sm text-muted-foreground">
                            Mostra notifiche sul desktop quando l'applicazione è
                            aperta
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Suoni di notifica</p>
                          <p className="text-sm text-muted-foreground">
                            Riproduci un suono quando arriva una nuova notifica
                          </p>
                        </div>
                        <Switch />
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleSave}>
                    <Save className="mr-2 h-4 w-4" /> Salva Preferenze
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="users" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Utenti e Permessi</CardTitle>
                  <CardDescription>
                    Gestisci gli utenti e i loro livelli di accesso
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex justify-between">
                    <h3 className="text-lg font-medium">Utenti del Sistema</h3>
                    <Button>
                      <Users className="mr-2 h-4 w-4" /> Aggiungi Utente
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center">
                        <img
                          src="https://randomuser.me/api/portraits/men/32.jpg"
                          alt="Avatar"
                          className="h-10 w-10 rounded-full object-cover border mr-3"
                        />
                        <div>
                          <p className="font-medium">Mario Rossi</p>
                          <p className="text-sm text-muted-foreground">
                            mario.rossi@automotoplus.com • Amministratore
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        Modifica
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center">
                        <img
                          src="https://randomuser.me/api/portraits/women/65.jpg"
                          alt="Avatar"
                          className="h-10 w-10 rounded-full object-cover border mr-3"
                        />
                        <div>
                          <p className="font-medium">Laura Bianchi</p>
                          <p className="text-sm text-muted-foreground">
                            laura.bianchi@automotoplus.com • Vendite
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        Modifica
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center">
                        <img
                          src="https://randomuser.me/api/portraits/men/44.jpg"
                          alt="Avatar"
                          className="h-10 w-10 rounded-full object-cover border mr-3"
                        />
                        <div>
                          <p className="font-medium">Marco Verdi</p>
                          <p className="text-sm text-muted-foreground">
                            marco.verdi@automotoplus.com • Officina
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        Modifica
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Ruoli e Permessi</h3>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <p className="font-medium">Amministratore</p>
                          <p className="text-sm text-muted-foreground">
                            Accesso completo a tutte le funzionalità
                          </p>
                        </div>
                        <Button variant="ghost" size="sm">
                          Configura
                        </Button>
                      </div>

                      <div className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <p className="font-medium">Vendite</p>
                          <p className="text-sm text-muted-foreground">
                            Gestione clienti, veicoli e vendite
                          </p>
                        </div>
                        <Button variant="ghost" size="sm">
                          Configura
                        </Button>
                      </div>

                      <div className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <p className="font-medium">Officina</p>
                          <p className="text-sm text-muted-foreground">
                            Gestione interventi, ricambi e appuntamenti
                          </p>
                        </div>
                        <Button variant="ghost" size="sm">
                          Configura
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="company" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informazioni Aziendali</CardTitle>
                  <CardDescription>
                    Gestisci i dati della tua concessionaria
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Nome Azienda
                      </label>
                      <Input defaultValue="AutoMoto Plus s.r.l." />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Partita IVA / Codice Fiscale
                      </label>
                      <Input defaultValue="IT12345678901" />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Indirizzo</label>
                      <Input defaultValue="Via Roma 123" />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Città</label>
                      <Input defaultValue="Milano" />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">CAP</label>
                      <Input defaultValue="20100" />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Provincia</label>
                      <Input defaultValue="MI" />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Telefono</label>
                      <Input defaultValue="+39 02 1234567" />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email</label>
                      <Input defaultValue="info@automotoplus.it" />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Sito Web</label>
                      <Input defaultValue="www.automotoplus.it" />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">PEC</label>
                      <Input defaultValue="automotoplus@pec.it" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Logo Aziendale
                    </label>
                    <div className="flex items-center justify-center border rounded-lg p-6">
                      <div className="text-center">
                        <div className="mb-4">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="48"
                            height="48"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="mx-auto text-muted-foreground"
                          >
                            <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                            <circle cx="12" cy="13" r="3" />
                          </svg>
                        </div>
                        <Button variant="outline" size="sm">
                          Carica Logo
                        </Button>
                        <p className="text-xs text-muted-foreground mt-2">
                          SVG, PNG o JPG (max. 2MB)
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleSave}>
                    <Save className="mr-2 h-4 w-4" /> Salva Modifiche
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="system" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Impostazioni di Sistema</CardTitle>
                  <CardDescription>
                    Configura le impostazioni generali del gestionale
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Aspetto</h3>

                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Tema</label>
                          <Select defaultValue="light">
                            <SelectTrigger>
                              <SelectValue placeholder="Seleziona tema" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="light">Chiaro</SelectItem>
                              <SelectItem value="dark">Scuro</SelectItem>
                              <SelectItem value="system">Sistema</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Lingua</label>
                          <Select defaultValue="it">
                            <SelectTrigger>
                              <SelectValue placeholder="Seleziona lingua" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="it">Italiano</SelectItem>
                              <SelectItem value="en">English</SelectItem>
                              <SelectItem value="fr">Français</SelectItem>
                              <SelectItem value="de">Deutsch</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">
                      Impostazioni Regionali
                    </h3>

                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Formato Data
                          </label>
                          <Select defaultValue="dd/mm/yyyy">
                            <SelectTrigger>
                              <SelectValue placeholder="Seleziona formato" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="dd/mm/yyyy">
                                DD/MM/YYYY
                              </SelectItem>
                              <SelectItem value="mm/dd/yyyy">
                                MM/DD/YYYY
                              </SelectItem>
                              <SelectItem value="yyyy-mm-dd">
                                YYYY-MM-DD
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Valuta</label>
                          <Select defaultValue="eur">
                            <SelectTrigger>
                              <SelectValue placeholder="Seleziona valuta" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="eur">Euro (€)</SelectItem>
                              <SelectItem value="usd">Dollaro ($)</SelectItem>
                              <SelectItem value="gbp">Sterlina (£)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Backup e Ripristino</h3>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Backup automatici</p>
                          <p className="text-sm text-muted-foreground">
                            Crea backup automatici del database ogni giorno
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Ultimo backup</p>
                          <p className="text-sm text-muted-foreground">
                            24/06/2023, 02:00
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          <Database className="mr-2 h-4 w-4" /> Backup Manuale
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleSave}>
                    <Save className="mr-2 h-4 w-4" /> Salva Impostazioni
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

function Badge({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export default SettingsPage;
