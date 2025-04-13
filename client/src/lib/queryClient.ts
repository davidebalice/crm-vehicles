import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { jwtDecode } from "jwt-decode";
const baseUrl = import.meta.env.VITE_API_BASE_URL;

// Funzione per verificare se il token è scaduto
function isTokenExpired(token: string): boolean {
  try {
    const decoded: any = jwtDecode(token); // Decodifica il JWT
    const expDate = decoded.exp * 1000; // La scadenza è in secondi, quindi moltiplichiamo per 1000
    return Date.now() >= expDate; // Verifica se la data di scadenza è passata
  } catch (error) {
    console.error("Errore nel decodificare il token:", error);
    return true; // Se c'è un errore nella decodifica, consideriamo il token scaduto
  }
}

// Funzione per rimuovere il token al logout
export function logout() {
  localStorage.removeItem("jwt_token");
  // Puoi anche fare altre azioni, come reindirizzare l'utente alla pagina di login
}

// Funzione che verifica se la risposta API è ok
async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    try {
      const text = (await res.text()) || res.statusText;
      throw new Error(`${res.status}: ${text}`);
    } catch (error) {
      console.error("Error processing response:", error);
      throw new Error(`${res.status}: ${res.statusText}`);
    }
  }
}

// Funzione per fare una richiesta API generica con gestione del token
export async function apiRequest(
method: string, url: string, data?: unknown, p0?: { headers: { "Content-Type": string; }; }): Promise<Response> {
  // Recupera il token JWT da LocalStorage o da dove lo stai memorizzando
  const token = localStorage.getItem("jwt_token");

  // Verifica se il token è scaduto e rimuovilo se necessario
  if (token && isTokenExpired(token)) {
    console.log("Token scaduto, logout...");
    logout();
    throw new Error("Token scaduto");
  }

  try {
    console.log(`${baseUrl}${url}`);
    const res = await fetch(`${baseUrl}${url}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include", // Aggiungi i cookie se necessario
    });

    await throwIfResNotOk(res);
    return res;
  } catch (error) {
    console.error(`API request error (${method} ${baseUrl}${url}):`, error);
    throw error;
  }
}

// Tipi di comportamento in caso di errore 401
type UnauthorizedBehavior = "returnNull" | "throw";

// Funzione per la query di React Query con gestione dell'autenticazione
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const apiUrl = queryKey[0] as string;

    console.log("apiUrl" + apiUrl);

    const params =
      queryKey.length > 1 && typeof queryKey[1] === "object" ? queryKey[1] : {};

    // Costruire URL con parametri di query
    const url = new URL(baseUrl + apiUrl, window.location.origin);

    console.log("url" + url);

    // Aggiunge i parametri alla URL
    if (params && typeof params === "object" && params !== null) {
      const entries = Object.entries(params as Record<string, unknown>);
      for (const [key, value] of entries) {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      }
    }

    const res = await fetch(url.toString(), {
      credentials: "include",
    });

    console.log(res);

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    //await throwIfResNotOk(res);
    return await res.json();

    /*
 try {
      const baseUrl = queryKey[0] as string;
      const params =
        queryKey.length > 1 && typeof queryKey[1] === "object"
          ? queryKey[1]
          : {};

      // Costruire URL con parametri di query
      const url = new URL(baseUrl, window.location.origin);

      // Aggiunge i parametri alla URL
      if (params && typeof params === "object" && params !== null) {
        const entries = Object.entries(params as Record<string, unknown>);
        for (const [key, value] of entries) {
          if (value !== undefined && value !== null) {
            url.searchParams.append(key, String(value));
          }
        }
      }

      const res = await fetch(url.toString(), {
        credentials: "include",
      });

      console.log(res);

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      //await throwIfResNotOk(res);
      return await res.json();
    } catch (error) {
      console.error(`Query error (${queryKey[0]}):`, error);
      throw error;
    }
*/
  };

// Configurazione di React Query Client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
