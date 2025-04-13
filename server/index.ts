import cors from "cors";
import express, { NextFunction, type Request, Response } from "express";
import { initializeDatabase, testConnection } from "./db";
import { registerRoutes } from "./routes";
import { DatabaseStorage, StorageFactory } from "./storage";
import { log, serveStatic, setupVite } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

console.log("AVVIO SERVER");

interface CorsOptions {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) => void;
  credentials: boolean;
}

//origin: 'http://localhost:5137',

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (
      !origin || // Permette richieste senza origine (ad esempio, richieste da Postman)
      origin.startsWith("http://localhost") || // Consenti qualsiasi localhost
      origin.endsWith(".davidebalice.dev") // Consenti domini *.davidebalice.dev
    ) {
      return callback(null, true);
    }
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true, // Consenti l'invio di credenziali (cookie, etc.)
};

app.use(cors(corsOptions));
/*
app.use((req, res, next) => {
  console.log("Sessione prima della richiesta:", req.session);
  next();
});
*/
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Test e inizializza la connessione al database
  const dbConnected = await testConnection();
  if (!dbConnected) {
    log(
      "Error: Database connection failed. Application cannot start without database connection."
    );
    process.exit(1); // Termina il processo in caso di mancata connessione al database
  }

  log("Database connection successful");
  await initializeDatabase();

  // Inizializza lo storage factory e attendi il completamento
  const initializedStorage = await StorageFactory.initialize();
  log(
    `Storage initialized successfully using ${
      initializedStorage instanceof DatabaseStorage ? "database" : "memory"
    } storage`
  );

  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    log(`Error: ${message}`);
    res.status(status).json({ message });
    // Non rilanciamo l'errore per evitare che l'applicazione si blocchi
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`serving on port ${port}`);
    }
  );
})();
