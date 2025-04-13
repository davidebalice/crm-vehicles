import { useToast } from "@/hooks/use-toast";
import { User as SelectUser } from "@shared/schema";
import {
  useMutation,
  UseMutationResult,
  useQuery,
} from "@tanstack/react-query";
import { createContext, ReactNode, useContext } from "react";
import { queryClient } from "../lib/queryClient";

type AuthContextType = {
  user: SelectUser | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<SelectUser, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<SelectUser, Error, RegisterData>;
};

type LoginData = {
  username: string;
  password: string;
};

type RegisterData = {
  username: string;
  password: string;
  fullName: string;
  email: string;
  role?: string;
};

export const AuthContext = createContext<AuthContextType | null>(null);
const baseUrl = import.meta.env.VITE_API_BASE_URL;

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();

  // Recupera i dati dell'utente (se esiste un token valido)
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<SelectUser | null, Error>({
    queryKey: [baseUrl + "/api/user"],
    queryFn: async () => {
      try {
        const token = localStorage.getItem("jwt_token"); // Ottieni il token dal localStorage
        const res = await fetch(baseUrl + "/api/user", {
          headers: {
            Authorization: `Bearer ${token}`, // Includi il token nell'intestazione
          },
        });
        if (!res.ok) return null;
        return await res.json();
      } catch (error) {
        return null;
      }
    },
  });

  // Funzione di login
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", baseUrl + "/api/login", credentials);


      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Errore durante il login");
      }
      const data = await res.json();
      // Salva il token nel localStorage
   
      if (data.token) {
        localStorage.setItem("jwt_token", data.token);
      }
      return data.user;
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData([baseUrl + "/api/user"], user);
      toast({
        title: "Login effettuato",
        description: `Benvenuto, ${user.fullName}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login fallito",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Funzione di registrazione (disabilitata per ora)
  const registerMutation = useMutation({
    mutationFn: async (credentials: RegisterData) => {
      const res = await apiRequest(
        "POST",
        baseUrl + "/api/register",
        credentials
      );
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Errore durante la registrazione");
      }
      return await res.json();
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData([baseUrl + "/api/user"], user);
      toast({
        title: "Registrazione completata",
        description: `Account creato con successo per ${user.fullName}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registrazione fallita",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Funzione di logout
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", baseUrl + "/api/logout");
      if (!res.ok) {
        throw new Error("Errore durante il logout");
      }
      // Rimuovi il token dal localStorage
      localStorage.removeItem("jwt_token");
    },
    onSuccess: () => {
      queryClient.setQueryData([baseUrl + "/api/user"], null);
      toast({
        title: "Logout effettuato",
        description: "Hai effettuato il logout con successo.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout fallito",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error(
      "useAuth deve essere utilizzato all'interno di un AuthProvider"
    );
  }
  return context;
}

// Funzione per inviare le richieste API con il token
const apiRequest = async (method: string, url: string, body: any = null) => {
  const token = localStorage.getItem("jwt_token");
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`; // Aggiungi il token all'intestazione
  }
  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });
  return res;
};
