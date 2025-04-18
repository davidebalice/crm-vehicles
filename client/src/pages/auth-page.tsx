import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { FC, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useRoute } from "wouter";
import { z } from "zod";

// Schema di validazione per il login
const loginSchema = z.object({
  username: z
    .string()
    .min(3, "Il nome utente deve contenere almeno 3 caratteri"),
  password: z.string().min(6, "La password deve contenere almeno 6 caratteri"),
});

const baseUrl = import.meta.env.VITE_API_BASE_URL;

type LoginFormValues = z.infer<typeof loginSchema>;

const AuthPage: FC = () => {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isMatchingAuthRoute] = useRoute("/auth");

  // Verifica se l'utente è già autenticato
  const token = localStorage.getItem("jwt_token");

  useEffect(() => {
    if (token && isMatchingAuthRoute) {
      console.log("Utente già autenticato, reindirizzamento alla dashboard");
      // window.location.href = "/";
    }
    console.log("Token:", token);
  }, [token, isMatchingAuthRoute]);

  // Form login
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "admin",
      password: "admin123",
    },
  });

  // Mutation per il login
  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormValues) => {
      const res = await apiRequest("POST", "/api/login", data);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Errore durante il login");
      }
      return await res.json();
    },
    onSuccess: (data) => {
      console.log("Login effettuato con successo:", data);

      // Salva il token nel localStorage
      localStorage.setItem("jwt_token", data.token);

      // Salva i dati dell'utente nella cache
      queryClient.setQueryData(["/api/user"], data);
      toast({
        title: "Login effettuato",
        description: `Benvenuto, ${data.username}!`,
      });

      // Forza il reindirizzamento alla dashboard
      window.location.href = "/";
    },
    onError: (error: Error) => {
      toast({
        title: "Errore di login",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handler per il form di login
  const onLoginSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="flex min-h-screen">
      {/* Form di login */}
      <div className="w-full md:w-1/2 p-8 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              Gestionale concessionaria
            </CardTitle>
            <CardDescription className="text-center">
              Sistema di gestione veicoli, ricambi, interventi e clienti
            </CardDescription>
          </CardHeader>

          <form onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
            <CardContent className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="username">Nome utente</Label>
                <Input
                  id="username"
                  placeholder="mario"
                  {...loginForm.register("username")}
                />
                {loginForm.formState.errors.username && (
                  <p className="text-sm text-red-500">
                    {loginForm.formState.errors.username.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...loginForm.register("password")}
                />
                {loginForm.formState.errors.password && (
                  <p className="text-sm text-red-500">
                    {loginForm.formState.errors.password.message}
                  </p>
                )}
              </div>
            </CardContent>

            <CardFooter>
              <Button
                type="submit"
                className="w-full"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? "Accesso in corso..." : "Accedi"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>

      {/* Hero section */}
      <div className="hidden md:flex md:w-1/2 bg-gray-100 dark:bg-gray-800 p-8 flex-col justify-center">
        <div className="max-w-lg mx-auto">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-400 bg-clip-text text-transparent">
            Gestionale concessionaria
          </h1>
          <p className="text-lg mb-6">
            La piattaforma completa per la gestione della tua concessionaria
            auto e moto. Gestisci inventario, clienti, vendite e assistenza in
            un unico strumento.
          </p>

          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.6-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
                  <circle cx="7" cy="17" r="2" />
                  <path d="M9 17h6" />
                  <circle cx="17" cy="17" r="2" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">Gestione veicoli</h3>
                <p className="text-sm text-muted-foreground">
                  Cataloga veicoli nuovi e usati con tutti i dettagli e
                  fotografie.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">Gestione clienti</h3>
                <p className="text-sm text-muted-foreground">
                  Archivia e gestisci le informazioni su tutti i clienti e il
                  loro storico.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <rect width="20" height="5" x="2" y="3" rx="1" />
                  <rect width="20" height="5" x="2" y="10" rx="1" />
                  <rect width="20" height="5" x="2" y="17" rx="1" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">Vendite e fatturazione</h3>
                <p className="text-sm text-muted-foreground">
                  Gestisci vendite, finanziamenti e documenti in modo semplice e
                  veloce.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
