import {
  insertAppointmentSchema,
  insertCustomerSchema,
  insertFinanceSchema,
  insertPartOrderItemSchema,
  insertPartOrderSchema,
  insertPartSchema,
  insertReminderSchema,
  insertSaleSchema,
  insertScheduledTransactionSchema,
  insertServiceSchema,
  insertSupplierSchema,
  insertTaskSchema,
  insertTransactionSchema,
  insertUserSchema,
  insertVehicleMakeSchema,
  insertVehicleModelSchema,
  insertVehicleSchema,
  vehicleCatalogExportSchema,
  vehicleCatalogImportSchema,
} from "@shared/schema";
import type { Express } from "express";
import fs from "fs";
import { createServer, type Server } from "http";
import { marked } from "marked";
import multer from "multer";
import path from "path";
import { z } from "zod";
import { requireAdmin, requireAuth, setupAuth } from "./auth";
import { reminderService } from "./reminder-service";
import { storage } from "./storage";
const __dirname = path.dirname(new URL(import.meta.url).pathname);

// Extend the Request type to include the 'files' property

const storageConfig = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = "uploads/vehicles";

    console.log("file.fieldname");
    console.log(file.fieldname);
    console.log("file.fieldname");
    console.log(req);
    console.log("file.fieldname");

    if (file.fieldname === "profileImage") {
      folder = "uploads/users";
    } else if (file.fieldname === "document") {
      folder = "uploads/documents";
    }

    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${file.fieldname}${ext}`;

    cb(null, uniqueName);
  },
});

const upload = multer({ storage: storageConfig });

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Setup authentication routes and middleware
  setupAuth(app);

  //Settings routes
  app.get("/api/settings", requireAuth, async (req, res) => {
    console.log("SETTINGS");
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const idUser = req.user.id;
      const user = await storage.getUser(idUser);
      if (user) {
        user.password = "";
      }
      console.log("logged user");
      console.log(user);
      const settings = { lang: "en", currency: "USD" };

      const response = {
        user,
        settings,
      };
      res.json(response);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post(
    "/api/settings/upload-images",
    requireAuth,
    upload.fields([{ name: "profileImage", maxCount: 1 }]),
    async (req, res) => {
      const image =
        (req.files as { [fieldname: string]: Express.Multer.File[] })
          ?.profileImage?.[0] ?? null;
      try {
        let id = 0;
        if (req.user) {
          id = parseInt(req.user.id.toString());
        }

        if (isNaN(id)) {
          return res.status(400).json({ message: "User non trovato" });
        }

        // const mainImage =
        // (req as Request & { files?: any }).files?.["mainImage"]?.[0] || null;

        console.log("image");
        console.log(image);
        //  const otherImages = (req as MulterRequest).files?.["otherImages"] || [];

        // Qui puoi salvare i percorsi delle immagini nel DB associati al veicolo `id`
        const result = await storage.saveUserImage(id, {
          profileImage: image?.filename || null,
        });

        res.json({ message: "Immagini caricate con successo", data: result });
      } catch (err) {
        console.error(err);
        res
          .status(500)
          .json({ message: "Errore durante il caricamento immagini" });
      }
    }
  );

  // User routes
  app.get("/api/users", requireAuth, async (req, res) => {
    try {
      const users = await storage.getUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get("/api/users/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.post("/api/users", requireAuth, async (req, res) => {
    try {
      const userInput = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userInput);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: "Invalid user data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  // Vehicle Make routes
  app.get("/api/vehicle-makes", async (req, res) => {
    try {
      const vehicleMakes = await storage.getVehicleMakes();
      res.json(vehicleMakes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch vehicle makes" });
    }
  });

  app.get("/api/vehicle-makes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const make = await storage.getVehicleMake(id);
      if (!make) {
        return res.status(404).json({ message: "Vehicle make not found" });
      }
      res.json(make);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch vehicle make" });
    }
  });

  app.post("/api/vehicle-makes", requireAuth, async (req, res) => {
    try {
      const makeInput = insertVehicleMakeSchema.parse(req.body);
      const make = await storage.createVehicleMake(makeInput);
      res.status(201).json(make);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: "Invalid vehicle make data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create vehicle make" });
    }
  });

  app.post("/api/vehicle-makes", requireAuth, async (req, res) => {
    try {
      const makeInput = insertVehicleMakeSchema.parse(req.body);
      const make = await storage.createVehicleMake(makeInput);
      res.status(201).json(make);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: "Invalid vehicle make data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create vehicle make" });
    }
  });

  app.get("/uploads/:type/:imageName", (req, res) => {
    const { imageName, type } = req.params;

    // Risolvi il percorso e normalizzalo
    let imagePath = path.join(__dirname, "uploads", type, imageName);
    imagePath = imagePath.replace(/^([A-Z]:)\{2,}/, "$1\\");
    imagePath = imagePath.replace("\\C:", "C:");
    imagePath = imagePath.replace("\\server", "");
    const normalizedPath = path.normalize(imagePath); // Normalizza il percorso

    console.log("Normalized Image path:", imagePath); // Verifica il percorso completo

    // Verifica se il file esiste e rispondi correttamente
    if (fs.existsSync(normalizedPath)) {
      res.sendFile(normalizedPath); // Usa il percorso normalizzato
    } else {
      res.status(404).send("File not found");
    }
  });

  app.post(
    "/api/vehicles/:id/upload-images",
    requireAuth,
    upload.fields([
      { name: "mainImage", maxCount: 1 },
      { name: "otherImages", maxCount: 10 },
    ]),
    async (req, res) => {
      const mainImage =
        (req.files as { [fieldname: string]: Express.Multer.File[] })
          ?.mainImage?.[0] ?? null; // Gestisci l'immagine principale
      const otherImages =
        (req.files as { [fieldname: string]: Express.Multer.File[] })
          ?.otherImages || []; //
      try {
        const id = parseInt(req.params.id);

        if (isNaN(id)) {
          return res.status(400).json({ message: "ID veicolo non valido" });
        }

        // const mainImage =
        // (req as Request & { files?: any }).files?.["mainImage"]?.[0] || null;

        console.log("mainImage");
        console.log(mainImage);
        //  const otherImages = (req as MulterRequest).files?.["otherImages"] || [];

        // Qui puoi salvare i percorsi delle immagini nel DB associati al veicolo `id`
        const result = await storage.saveVehicleImages(id, {
          mainImage: mainImage?.filename || null,
          otherImages: otherImages.map((f) => f.filename),
        });

        res.json({ message: "Immagini caricate con successo", data: result });
      } catch (err) {
        console.error(err);
        res
          .status(500)
          .json({ message: "Errore durante il caricamento immagini" });
      }
    }
  );

  app.delete("/api/vehicle-makes/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const result = await storage.deleteVehicleMake(id);

      if (!result) {
        return res
          .status(404)
          .json({ message: "Vehicle make not found or could not be deleted" });
      }

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete vehicle make" });
    }
  });

  // Vehicle Model routes
  app.get("/api/vehicle-models", async (req, res) => {
    try {
      const vehicleModels = await storage.getVehicleModels();
      res.json(vehicleModels);
      //console.log(vehicleModels);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch vehicle models" });
    }
  });

  app.get("/api/vehicle-models/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const model = await storage.getVehicleModel(id);
      if (!model) {
        return res.status(404).json({ message: "Vehicle model not found" });
      }
      res.json(model);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch vehicle model" });
    }
  });

  app.get("/api/vehicle-models/by-make/:makeId", async (req, res) => {
    try {
      const makeId = parseInt(req.params.makeId);
      const vehicleModels = await storage.getVehicleModelsByMake(makeId);
      res.json(vehicleModels);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to fetch vehicle models by make" });
    }
  });

  app.post("/api/vehicle-models", requireAuth, async (req, res) => {
    try {
      const modelInput = insertVehicleModelSchema.parse(req.body);
      const model = await storage.createVehicleModel(modelInput);
      res.status(201).json(model);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Invalid vehicle model data",
          errors: error.errors,
        });
      }
      res.status(500).json({ message: "Failed to create vehicle model" });
    }
  });

  app.put("/api/vehicle-models/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const modelInput = insertVehicleModelSchema.parse(req.body);
      const updatedModel = await storage.updateVehicleModel(id, modelInput);

      if (!updatedModel) {
        return res.status(404).json({ message: "Vehicle model not found" });
      }

      res.json(updatedModel);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Invalid vehicle model data",
          errors: error.errors,
        });
      }
      res.status(500).json({ message: "Failed to update vehicle model" });
    }
  });

  app.delete("/api/vehicle-models/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const result = await storage.deleteVehicleModel(id);

      if (!result) {
        return res
          .status(404)
          .json({ message: "Vehicle model not found or could not be deleted" });
      }

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete vehicle model" });
    }
  });

  // Vehicle routes
  app.get("/api/vehicles", requireAuth, async (req, res, next) => {
    //console.log("GET /api/vehicles");

    try {
      /*
      if (req.headers["authorization"]) {
        const result = await requireAuth(req, res, next);
        if (!result) return;
      } else if (req.headers["x-api-key"]) {
        const result = await requireApiKey(req, res, next);
        if (!result) return;
      } else {
        return res.status(401).json({ error: "Autenticazione richiesta" });
      }
*/
      // Parametri di paginazione e filtri
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as string;
      const condition = req.query.condition as string;
      const fuelType = req.query.fuelType as string;
      const makeId = req.query.makeId
        ? parseInt(req.query.makeId as string)
        : undefined;
      const modelId = req.query.modelId
        ? parseInt(req.query.modelId as string)
        : undefined;
      const minPrice = req.query.minPrice
        ? parseFloat(req.query.minPrice as string)
        : undefined;
      const maxPrice = req.query.maxPrice
        ? parseFloat(req.query.maxPrice as string)
        : undefined;
      const minYear = req.query.minYear
        ? parseInt(req.query.minYear as string)
        : undefined;
      const maxYear = req.query.maxYear
        ? parseInt(req.query.maxYear as string)
        : undefined;
      const search = req.query.search as string;

      // Costruiamo gli oggetti per il filtro e la paginazione
      const options: {
        filters?: {
          status?: string;
          condition?: string;
          fuelType?: string;
          makeId?: number;
          modelId?: number;
          minPrice?: number;
          maxPrice?: number;
          minYear?: number;
          maxYear?: number;
          search?: string;
        };
        pagination: {
          page: number;
          limit: number;
        };
      } = {
        pagination: { page, limit },
      };

      // Aggiungiamo i filtri solo se sono definiti
      if (
        status ||
        condition ||
        fuelType ||
        makeId ||
        modelId ||
        minPrice ||
        maxPrice ||
        minYear ||
        maxYear ||
        search
      ) {
        options.filters = {};

        if (status) options.filters.status = status;
        if (condition) options.filters.condition = condition;
        if (fuelType) options.filters.fuelType = fuelType;
        if (makeId) options.filters.makeId = makeId;
        if (modelId) options.filters.modelId = modelId;
        if (minPrice) options.filters.minPrice = minPrice;
        if (maxPrice) options.filters.maxPrice = maxPrice;
        if (minYear) options.filters.minYear = minYear;
        if (maxYear) options.filters.maxYear = maxYear;
        if (search) options.filters.search = search;
      }

      const result = await storage.getVehicles(options);

      // Se abbiamo un formato paginato, arricchiamo i risultati
      let vehiclesToEnrich = Array.isArray(result) ? result : result.items;

      // Arricchiamo i risultati con le informazioni di make e model
      const enrichedVehicles = await Promise.all(
        vehiclesToEnrich.map(async (vehicle) => {
          const model = await storage.getVehicleModel(vehicle.modelId);
          let make = null;
          if (model) {
            make = await storage.getVehicleMake(model.makeId);
          }
          return {
            ...vehicle,
            model,
            make,
          };
        })
      );

      //console.log("enrichedVehicles");
      // console.log(enrichedVehicles);

      // Se il risultato era paginato, restituiamo un oggetto paginato arricchito
      if (!Array.isArray(result)) {
        return res.json({
          items: enrichedVehicles,
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        });
      }

      // Altrimenti restituiamo l'array arricchito
      res.json(enrichedVehicles);
    } catch (error) {
      console.error("Error getting vehicles:", error);
      res.status(500).json({ message: "Failed to fetch vehicles" });
    }
  });

  app.get("/api/vehicles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const vehicle = await storage.getVehicle(id);
      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }
      res.json(vehicle);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch vehicle" });
    }
  });

  app.post("/api/vehicles", requireAuth, async (req, res) => {
    try {
      const vehicleInput = insertVehicleSchema.parse(req.body);
      const vehicle = await storage.createVehicle(vehicleInput);
      res.status(201).json(vehicle);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: "Invalid vehicle data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create vehicle" });
    }
  });

  app.put("/api/vehicles/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      // We don't use the insertVehicleSchema because updates can be partial
      const updatedVehicle = await storage.updateVehicle(id, req.body);
      if (!updatedVehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }
      res.json(updatedVehicle);
    } catch (error) {
      res.status(500).json({ message: "Failed to update vehicle" });
    }
  });

  app.delete("/api/vehicles/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteVehicle(id);
      if (!success) {
        return res.status(404).json({ message: "Vehicle not found" });
      }
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete vehicle" });
    }
  });

  // Customer routes
  app.get("/api/customers", requireAuth, async (req, res) => {
    try {
      // Se ci sono parametri di ricerca, utilizziamo la ricerca avanzata
      if (req.query.search) {
        const searchTerm = req.query.search as string;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        const customers = await storage.searchCustomers(
          searchTerm,
          page,
          limit
        );
        res.json(customers);
      } else {
        // Altrimenti restituiamo tutti i clienti (comportamento esistente)
        const customers = await storage.getCustomers();
        res.json(customers);
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });

  app.get("/api/customers/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const customer = await storage.getCustomer(id);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customer" });
    }
  });

  app.post("/api/customers", requireAuth, async (req, res) => {
    try {
      const customerInput = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(customerInput);
      res.status(201).json(customer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: "Invalid customer data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create customer" });
    }
  });

  app.put("/api/customers/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updatedCustomer = await storage.updateCustomer(id, req.body);
      if (!updatedCustomer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.json(updatedCustomer);
    } catch (error) {
      res.status(500).json({ message: "Failed to update customer" });
    }
  });

  // Sale routes
  app.get("/api/sales", requireAuth, async (req, res) => {
    try {
      const sales = await storage.getSales();
      res.json(sales);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sales" });
    }
  });

  app.get("/api/sales/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const sale = await storage.getSale(id);
      if (!sale) {
        return res.status(404).json({ message: "Sale not found" });
      }
      res.json(sale);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sale" });
    }
  });

  app.get(
    "/api/sales/by-customer/:customerId",
    requireAuth,
    async (req, res) => {
      try {
        const customerId = parseInt(req.params.customerId);
        const sales = await storage.getSalesByCustomer(customerId);
        res.json(sales);
      } catch (error) {
        res.status(500).json({ message: "Failed to fetch sales by customer" });
      }
    }
  );

  app.post("/api/sales", requireAuth, async (req, res) => {
    try {
      const saleInput = insertSaleSchema.parse(req.body);
      const sale = await storage.createSale(saleInput);
      res.status(201).json(sale);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: "Invalid sale data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create sale" });
    }
  });

  // Appointment routes
  app.get("/api/appointments", requireAuth, async (req, res) => {
    try {
      const appointments = await storage.getAppointments();
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });

  app.get("/api/appointments/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const appointment = await storage.getAppointment(id);
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }

      // Se l'appuntamento ha un veicolo associato, arricchisci i dati con marca e modello
      if (appointment.vehicleId) {
        const vehicle = await storage.getVehicle(appointment.vehicleId);
        if (vehicle) {
          const model = await storage.getVehicleModel(vehicle.modelId);
          let make = null;
          if (model) {
            make = await storage.getVehicleMake(model.makeId);
          }

          const enrichedAppointment = {
            ...appointment,
            vehicle: {
              ...vehicle,
              model,
              make,
            },
          };

          return res.json(enrichedAppointment);
        }
      }

      res.json(appointment);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch appointment" });
    }
  });

  app.post("/api/appointments", requireAuth, async (req, res) => {
    try {
      const appointmentInput = insertAppointmentSchema.parse(req.body);
      const appointment = await storage.createAppointment(appointmentInput);
      res.status(201).json(appointment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: "Invalid appointment data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create appointment" });
    }
  });

  app.put("/api/appointments/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updatedAppointment = await storage.updateAppointment(id, req.body);
      if (!updatedAppointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      res.json(updatedAppointment);
    } catch (error) {
      res.status(500).json({ message: "Failed to update appointment" });
    }
  });

  // Service routes
  app.get("/api/services", requireAuth, async (req, res) => {
    try {
      const services = await storage.getServices();
      res.json(services);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch services" });
    }
  });

  app.get("/api/services/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const service = await storage.getService(id);
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }
      res.json(service);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch service" });
    }
  });

  app.post("/api/services", requireAuth, async (req, res) => {
    try {
      const serviceInput = insertServiceSchema.parse(req.body);
      const service = await storage.createService(serviceInput);
      res.status(201).json(service);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: "Invalid service data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create service" });
    }
  });

  // Part routes
  app.get("/api/parts", requireAuth, async (req, res) => {
    try {
      // Estraiamo i parametri di query
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const category = req.query.category as string;
      const supplierId = req.query.supplierId
        ? parseInt(req.query.supplierId as string)
        : undefined;
      const status = req.query.status as string;
      const lowStock = req.query.lowStock === "true";
      const search = req.query.search as string;

      // Costruiamo gli oggetti per il filtro e la paginazione
      const options: {
        filters?: {
          category?: string;
          supplierId?: number;
          status?: string;
          lowStock?: boolean;
          search?: string;
        };
        pagination: {
          page: number;
          limit: number;
        };
      } = {
        pagination: { page, limit },
      };

      // Aggiungiamo i filtri solo se sono definiti
      if (category || supplierId || status || lowStock || search) {
        options.filters = {};

        if (category) options.filters.category = category;
        if (supplierId) options.filters.supplierId = supplierId;
        if (status) options.filters.status = status;
        if (lowStock) options.filters.lowStock = true;
        if (search) options.filters.search = search;
      }

      const result = await storage.getParts(options);
      res.json(result);
    } catch (error) {
      console.error("Error fetching parts:", error);
      res.status(500).json({ message: "Failed to fetch parts" });
    }
  });

  app.get("/api/parts/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const part = await storage.getPart(id);
      if (!part) {
        return res.status(404).json({ message: "Part not found" });
      }
      res.json(part);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch part" });
    }
  });

  app.post("/api/parts", requireAuth, async (req, res) => {
    try {
      const partInput = insertPartSchema.parse(req.body);
      const part = await storage.createPart(partInput);
      res.status(201).json(part);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: "Invalid part data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create part" });
    }
  });

  app.put("/api/parts/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updatedPart = await storage.updatePart(id, req.body);
      if (!updatedPart) {
        return res.status(404).json({ message: "Part not found" });
      }
      res.json(updatedPart);
    } catch (error) {
      res.status(500).json({ message: "Failed to update part" });
    }
  });

  // Finance routes
  app.get("/api/finances", requireAuth, async (req, res) => {
    try {
      if (req.query.saleId) {
        const finances = await storage.getFinancesBySale(
          parseInt(req.query.saleId as string)
        );
        return res.json(finances);
      } else {
        const finances = await storage.getAllFinances();
        return res.json(finances);
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch finances" });
    }
  });

  app.get("/api/finances/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const finance = await storage.getFinance(id);
      if (!finance) {
        return res.status(404).json({ message: "Finance not found" });
      }
      res.json(finance);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch finance" });
    }
  });

  app.post("/api/finances", requireAuth, async (req, res) => {
    try {
      const financeInput = insertFinanceSchema.parse(req.body);
      const finance = await storage.createFinance(financeInput);
      res.status(201).json(finance);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: "Invalid finance data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create finance" });
    }
  });

  // Task routes
  app.get("/api/tasks", requireAuth, async (req, res) => {
    try {
      const tasks = await storage.getTasks();
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.get("/api/tasks/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const task = await storage.getTask(id);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      res.json(task);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch task" });
    }
  });

  app.get("/api/tasks/by-assignee/:userId", requireAuth, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const tasks = await storage.getTasksByAssignee(userId);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tasks by assignee" });
    }
  });

  app.post("/api/tasks", requireAuth, async (req, res) => {
    try {
      const taskInput = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(taskInput);
      res.status(201).json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: "Invalid task data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create task" });
    }
  });

  app.put("/api/tasks/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updatedTask = await storage.updateTask(id, req.body);
      if (!updatedTask) {
        return res.status(404).json({ message: "Task not found" });
      }
      res.json(updatedTask);
    } catch (error) {
      res.status(500).json({ message: "Failed to update task" });
    }
  });

  // Add seed data route for development
  app.post("/api/seed", async (req, res) => {
    try {
      // Seed makes
      const audiMake = await storage.createVehicleMake({
        name: "Audi",
        type: "car",
        logoUrl: "https://www.carlogos.org/car-logos/audi-logo.png",
      });

      const volkswagenMake = await storage.createVehicleMake({
        name: "Volkswagen",
        type: "car",
        logoUrl: "https://www.carlogos.org/car-logos/volkswagen-logo.png",
      });

      const ducatiMake = await storage.createVehicleMake({
        name: "Ducati",
        type: "motorcycle",
        logoUrl: "https://www.carlogos.org/motorcycle-logos/ducati-logo.png",
      });

      const harleyMake = await storage.createVehicleMake({
        name: "Harley Davidson",
        type: "motorcycle",
        logoUrl:
          "https://www.carlogos.org/motorcycle-logos/harley-davidson-logo.png",
      });

      // Seed models
      const a4Model = await storage.createVehicleModel({
        makeId: audiMake.id,
        name: "A4 Avant",
        year: 2023,
        type: "car",
        specifications: {
          engine: "2.0L TFSI",
          power: "204 HP",
          transmission: "Automatic",
          fuel: "Gasoline",
        },
      });

      const golfModel = await storage.createVehicleModel({
        makeId: volkswagenMake.id,
        name: "Golf GTI",
        year: 2021,
        type: "car",
        specifications: {
          engine: "2.0L TSI",
          power: "245 HP",
          transmission: "Manual",
          fuel: "Gasoline",
        },
      });

      const panigaleModel = await storage.createVehicleModel({
        makeId: ducatiMake.id,
        name: "Panigale V4",
        year: 2022,
        type: "motorcycle",
        specifications: {
          engine: "1103cc V4",
          power: "214 HP",
          transmission: "6-speed",
          fuel: "Gasoline",
        },
      });

      const streetGlideModel = await storage.createVehicleModel({
        makeId: harleyMake.id,
        name: "Street Glide",
        year: 2023,
        type: "motorcycle",
        specifications: {
          engine: "1868cc V-Twin",
          power: "90 HP",
          transmission: "6-speed",
          fuel: "Gasoline",
        },
      });

      // Seed vehicles
      const audiVehicle = await storage.createVehicle({
        modelId: a4Model.id,
        vin: "WAUZZZ8K9NA123456",
        licensePlate: "",
        color: "Blue",
        status: "available",
        condition: "new",
        fuelType: "diesel",
        mileage: 0,
        price: 38500,
        costPrice: 35000,
        description: "Brand new Audi A4 Avant with premium features",
        year: 2023,
        features: [
          "Leather seats",
          "Navigation",
          "Climate control",
          "LED headlights",
        ],
        images: [
          "https://images.unsplash.com/photo-1494976388531-d1058494cdd8",
        ],
      });

      const volkswagenVehicle = await storage.createVehicle({
        modelId: golfModel.id,
        vin: "WVWZZZ1KZAW987654",
        licensePlate: "AB123CD",
        color: "Red",
        status: "available",
        condition: "used",
        fuelType: "benzina",
        mileage: 25420,
        price: 28900,
        costPrice: 25000,
        description:
          "Well-maintained Volkswagen Golf GTI in excellent condition",
        year: 2021,
        features: [
          "Sport seats",
          "Panoramic roof",
          "Digital dashboard",
          "Adaptive cruise control",
        ],
        images: [
          "https://images.unsplash.com/photo-1583121274602-3e2820c69888",
        ],
      });

      const ducatiVehicle = await storage.createVehicle({
        modelId: panigaleModel.id,
        vin: "ZDMH123AB456C789D",
        licensePlate: "MC789EF",
        color: "Red",
        status: "available",
        condition: "used",
        fuelType: "benzina",
        mileage: 1250,
        price: 22450,
        costPrice: 20000,
        description: "Ducati Panigale V4 with low mileage, perfect condition",
        year: 2022,
        features: [
          "Öhlins suspension",
          "Brembo brakes",
          "Quick shifter",
          "Traction control",
        ],
        images: [
          "https://images.unsplash.com/photo-1608921619105-dc9921761093",
        ],
      });

      const harleyVehicle = await storage.createVehicle({
        modelId: streetGlideModel.id,
        vin: "1HD1KTC14EB012345",
        licensePlate: "",
        color: "Black",
        status: "available",
        condition: "new",
        fuelType: "benzina",
        mileage: 0,
        price: 29900,
        costPrice: 27000,
        description: "New Harley Davidson Street Glide with touring package",
        year: 2023,
        features: [
          "Infotainment system",
          "ABS",
          "Cruise control",
          "Heated grips",
        ],
        images: [
          "https://images.unsplash.com/photo-1631192928737-d0e4d1805e79",
        ],
      });

      // Seed customers
      const customer1 = await storage.createCustomer({
        firstName: "Paolo",
        lastName: "Bianchi",
        email: "paolo.bianchi@example.com",
        phone: "+39 123 456 7890",
        address: "Via Roma 123",
        city: "Milano",
        zipCode: "20100",
        documentId: "AB12345CD",
        notes: "Interested in premium vehicles",
      });

      const customer2 = await storage.createCustomer({
        firstName: "Marco",
        lastName: "Verdi",
        email: "marco.verdi@example.com",
        phone: "+39 098 765 4321",
        address: "Via Napoli 45",
        city: "Roma",
        zipCode: "00100",
        documentId: "EF67890GH",
        notes: "Returning customer, has purchased 2 vehicles",
      });

      const customer3 = await storage.createCustomer({
        firstName: "Laura",
        lastName: "Neri",
        email: "laura.neri@example.com",
        phone: "+39 456 789 0123",
        address: "Via Torino 78",
        city: "Torino",
        zipCode: "10100",
        documentId: "IJ12345KL",
        notes: "Looking for financing options",
      });

      // Seed appointments
      const appointment1 = await storage.createAppointment({
        customerId: customer1.id,
        vehicleId: audiVehicle.id,
        userId: 1, // Admin user
        type: "test_drive",
        date: new Date(),
        status: "scheduled",
        notes: "Test drive for the new Audi A4",
      });

      const appointment2 = await storage.createAppointment({
        customerId: customer2.id,
        vehicleId: volkswagenVehicle.id,
        userId: 1, // Admin user
        type: "service",
        date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        status: "scheduled",
        notes: "Regular maintenance for Volkswagen Golf",
      });

      const appointment3 = await storage.createAppointment({
        customerId: customer3.id,
        vehicleId: null,
        userId: 1, // Admin user
        type: "consultation",
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
        status: "scheduled",
        notes: "Financial consultation for vehicle purchase",
      });

      // Seed dummy sales for finance examples
      const sale1 = await storage.createSale({
        vehicleId: audiVehicle.id,
        customerId: customer1.id,
        userId: 1,
        saleDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        salePrice: 38500,
        paymentMethod: "finance",
        status: "completed",
        notes: "Customer financed through bank",
      });

      const sale2 = await storage.createSale({
        vehicleId: volkswagenVehicle.id,
        customerId: customer2.id,
        userId: 1,
        saleDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
        salePrice: 28900,
        paymentMethod: "leasing",
        status: "completed",
        notes: "Customer opted for leasing",
      });

      // Seed finances
      const finance1 = await storage.createFinance({
        saleId: sale1.id,
        customerId: customer1.id,
        amount: 30000,
        interestRate: 4.5,
        term: 48, // 48 months
        downPayment: 8500,
        monthlyPayment: 685.5,
        type: "loan",
        status: "approved",
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        endDate: new Date(Date.now() + 48 * 30 * 24 * 60 * 60 * 1000), // 48 months from now
        notes: "Approved finance through dealership partner bank",
      });

      const finance2 = await storage.createFinance({
        saleId: sale2.id,
        customerId: customer2.id,
        amount: 28900,
        interestRate: 3.9,
        term: 36, // 36 months
        downPayment: 5000,
        monthlyPayment: 709.72,
        type: "leasing",
        status: "completed",
        startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
        endDate: new Date(Date.now() + 36 * 30 * 24 * 60 * 60 * 1000), // 36 months from now
        notes: "Leasing completed with residual value option",
      });

      const finance3 = await storage.createFinance({
        saleId: null, // No sale yet
        customerId: customer3.id,
        amount: 25000,
        interestRate: 5.2,
        term: 60, // 60 months
        downPayment: 3000,
        monthlyPayment: 419.85,
        type: "loan",
        status: "pending",
        startDate: null,
        endDate: null,
        notes: "Customer applied for financing, pending approval",
      });

      // Seed tasks
      const task1 = await storage.createTask({
        title: "Aggiornare listino prezzi",
        description:
          "Aggiornare i prezzi delle auto nuove con i nuovi listini forniti da BMW.",
        assignedTo: 1, // Admin user
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        priority: "medium",
        status: "pending",
      });

      const task2 = await storage.createTask({
        title: "Contattare fornitori ricambi",
        description:
          "Ordinare nuovi ricambi per il reparto officina, scorte in esaurimento.",
        assignedTo: 1, // Admin user
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        priority: "high",
        status: "pending",
      });

      const task3 = await storage.createTask({
        title: "Preparare campagna social",
        description:
          "Pianificare post promozionali per i nuovi arrivi di moto Honda.",
        assignedTo: 1, // Admin user
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        priority: "low",
        status: "pending",
      });

      // I finanziamenti di esempio sono già presenti, non è necessario aggiungerli nuovamente

      // Return success
      res.status(200).json({ message: "Seed data created successfully" });
    } catch (error) {
      console.error("Error seeding data:", error);
      res.status(500).json({ message: "Failed to seed data" });
    }
  });

  /**
   * API Catalogo Veicoli
   *
   * Queste API consentono l'integrazione con sistemi esterni per importare ed esportare
   * il catalogo completo dei veicoli, compresi marche e modelli, in un formato gerarchico.
   */

  /**
   * @api {get} /api/catalog/export Esporta Catalogo Veicoli
   * @apiName ExportVehicleCatalog
   * @apiGroup Catalogo
   * @apiDescription Esporta l'intero catalogo dei veicoli in formato gerarchico.
   *
   * @apiSuccess {Object} catalog Catalogo completo in formato JSON.
   * @apiSuccess {Array} catalog.makes Lista delle marche dei veicoli.
   * @apiSuccess {Number} catalog.makes.id ID univoco della marca.
   * @apiSuccess {String} catalog.makes.name Nome della marca.
   * @apiSuccess {String} catalog.makes.type Tipo della marca (car o motorcycle).
   * @apiSuccess {String} [catalog.makes.logoUrl] URL del logo della marca.
   * @apiSuccess {Array} [catalog.makes.models] Lista dei modelli per questa marca.
   * @apiSuccess {Number} catalog.makes.models.id ID univoco del modello.
   * @apiSuccess {String} catalog.makes.models.name Nome del modello.
   * @apiSuccess {Number} catalog.makes.models.year Anno del modello.
   * @apiSuccess {String} catalog.makes.models.type Tipo del modello (car o motorcycle).
   * @apiSuccess {Object} [catalog.makes.models.specifications] Specifiche tecniche del modello.
   * @apiSuccess {Array} [catalog.makes.models.vehicles] Lista dei veicoli disponibili per questo modello.
   *
   * @apiExample {curl} Esempio di utilizzo:
   *     curl -X GET http://localhost:3000/api/catalog/export
   *
   * @apiSuccessExample {json} Risposta di successo:
   *     HTTP/1.1 200 OK
   *     {
   *       "makes": [
   *         {
   *           "id": 1,
   *           "name": "Ford",
   *           "type": "car",
   *           "logoUrl": "https://example.com/ford.png",
   *           "models": [
   *             {
   *               "id": 1,
   *               "name": "Mustang",
   *               "year": 2023,
   *               "type": "car",
   *               "specifications": {
   *                 "engine": "V8",
   *                 "power": "450hp"
   *               },
   *               "vehicles": [
   *                 {
   *                   "id": 1,
   *                   "vin": "1FATP8UH3K5159596",
   *                   "licensePlate": "AB123CD",
   *                   "color": "Rosso",
   *                   "status": "available",
   *                   "condition": "new",
   *                   "mileage": 0,
   *                   "price": 59000,
   *                   "costPrice": 55000,
   *                   "description": "Nuova Ford Mustang GT",
   *                   "year": 2023,
   *                   "features": {
   *                     "leather": true,
   *                     "navigation": true
   *                   },
   *                   "images": [
   *                     "https://example.com/mustang1.jpg",
   *                     "https://example.com/mustang2.jpg"
   *                   ],
   *                   "createdAt": "2023-01-15T12:00:00Z"
   *                 }
   *               ]
   *             }
   *           ]
   *         }
   *       ]
   *     }
   */
  app.get("/api/catalog/export", requireAuth, async (req, res) => {
    try {
      // Ottieni tutte le marche
      const makes = await storage.getVehicleMakes();

      // Per ogni marca, ottieni i modelli e per ogni modello, ottieni i veicoli
      const enrichedMakes = await Promise.all(
        makes.map(async (make) => {
          // Ottieni tutti i modelli per questa marca
          const models = await storage.getVehicleModelsByMake(make.id);

          // Per ogni modello, ottieni i veicoli associati
          const enrichedModels = await Promise.all(
            models.map(async (model) => {
              // Ottieni i veicoli per questo modello
              const vehiclesForModel = await storage.getVehicles({
                modelId: model.id,
              });

              return {
                ...model,
                vehicles: vehiclesForModel,
              };
            })
          );

          return {
            ...make,
            models: enrichedModels,
          };
        })
      );

      // Restituisci il catalogo strutturato gerarchicamente
      const catalog = {
        makes: enrichedMakes,
      };

      // Valida l'output con lo schema Zod
      const validatedCatalog = vehicleCatalogExportSchema.parse(catalog);

      res.json(validatedCatalog);
    } catch (error) {
      console.error("Errore durante l'esportazione del catalogo:", error);

      if (error instanceof z.ZodError) {
        return res.status(500).json({
          message: "Errore di validazione durante l'esportazione del catalogo",
          errors: error.errors,
        });
      }

      res.status(500).json({
        message: "Errore durante l'esportazione del catalogo veicoli",
      });
    }
  });

  /**
   * @api {post} /api/catalog/import Importa Catalogo Veicoli
   * @apiName ImportVehicleCatalog
   * @apiGroup Catalogo
   * @apiDescription Importa un catalogo veicoli completo o parziale in formato gerarchico.
   *
   * @apiParam {Object} catalog Catalogo da importare in formato JSON.
   * @apiParam {Array} catalog.makes Lista delle marche dei veicoli da importare.
   * @apiParam {String} catalog.makes.name Nome della marca.
   * @apiParam {String} catalog.makes.type Tipo della marca (car o motorcycle).
   * @apiParam {String} [catalog.makes.logoUrl] URL del logo della marca.
   * @apiParam {Array} [catalog.makes.models] Lista dei modelli per questa marca.
   * @apiParam {String} catalog.makes.models.name Nome del modello.
   * @apiParam {Number} catalog.makes.models.year Anno del modello.
   * @apiParam {String} catalog.makes.models.type Tipo del modello (car o motorcycle).
   * @apiParam {Object} [catalog.makes.models.specifications] Specifiche tecniche del modello.
   * @apiParam {Array} [catalog.makes.models.vehicles] Lista dei veicoli per questo modello.
   *
   * @apiExample {curl} Esempio di utilizzo:
   *     curl -X POST -H "Content-Type: application/json" -d '{
   *       "makes": [
   *         {
   *           "name": "Ferrari",
   *           "type": "car",
   *           "logoUrl": "https://example.com/ferrari.png",
   *           "models": [
   *             {
   *               "name": "F8 Tributo",
   *               "year": 2023,
   *               "type": "car",
   *               "specifications": {
   *                 "engine": "V8 Twin-Turbo",
   *                 "power": "720hp"
   *               },
   *               "vehicles": [
   *                 {
   *                   "vin": "ZFF92LMC000249185",
   *                   "color": "Rosso Corsa",
   *                   "condition": "new",
   *                   "price": 329000,
   *                   "costPrice": 310000,
   *                   "description": "Ferrari F8 Tributo nuova",
   *                   "year": 2023
   *                 }
   *               ]
   *             }
   *           ]
   *         }
   *       ]
   *     }' http://localhost:3000/api/catalog/import
   *
   * @apiSuccess {Object} result Risultato dell'importazione.
   * @apiSuccess {Number} result.makesImported Numero di marche importate.
   * @apiSuccess {Number} result.modelsImported Numero di modelli importati.
   * @apiSuccess {Number} result.vehiclesImported Numero di veicoli importati.
   *
   * @apiSuccessExample {json} Risposta di successo:
   *     HTTP/1.1 200 OK
   *     {
   *       "makesImported": 1,
   *       "modelsImported": 1,
   *       "vehiclesImported": 1,
   *       "message": "Importazione completata con successo"
   *     }
   *
   * @apiError (400) ValidationError Dati del catalogo non validi.
   * @apiError (500) ServerError Errore durante l'importazione.
   *
   * @apiErrorExample {json} Errore di validazione:
   *     HTTP/1.1 400 Bad Request
   *     {
   *       "message": "Dati del catalogo non validi",
   *       "errors": [
   *         {
   *           "code": "invalid_type",
   *           "path": ["makes", 0, "type"],
   *           "message": "Tipo deve essere 'car' o 'motorcycle'"
   *         }
   *       ]
   *     }
   */
  app.post("/api/catalog/import", requireAuth, async (req, res) => {
    try {
      // Valida i dati di input
      const catalogData = vehicleCatalogImportSchema.parse(req.body);

      // Statistiche per il risultato
      let makesImported = 0;
      let modelsImported = 0;
      let vehiclesImported = 0;

      // Processa ogni marca
      for (const makeData of catalogData.makes) {
        // Cerca se la marca esiste già
        let existingMake = (await storage.getVehicleMakes()).find(
          (m) =>
            m.name.toLowerCase() === makeData.name.toLowerCase() &&
            m.type === makeData.type
        );

        // Se non esiste, crea la marca
        if (!existingMake) {
          existingMake = await storage.createVehicleMake({
            name: makeData.name,
            type: makeData.type,
            logoUrl: makeData.logoUrl,
          });
          makesImported++;
        }

        // Processa i modelli di questa marca
        if (makeData.models && makeData.models.length > 0) {
          for (const modelData of makeData.models) {
            // Cerca se il modello esiste già
            let existingModel = (
              await storage.getVehicleModelsByMake(existingMake.id)
            ).find(
              (m) =>
                m.name.toLowerCase() === modelData.name.toLowerCase() &&
                m.year === modelData.year
            );

            // Se non esiste, crea il modello
            if (!existingModel) {
              existingModel = await storage.createVehicleModel({
                makeId: existingMake.id,
                name: modelData.name,
                year: modelData.year,
                type: modelData.type,
                specifications: modelData.specifications,
              });
              modelsImported++;
            }

            // Processa i veicoli di questo modello
            if (modelData.vehicles && modelData.vehicles.length > 0) {
              for (const vehicleData of modelData.vehicles) {
                // Cerca se il veicolo esiste già basandosi sul VIN
                const existingVehicles = await storage.getVehicles();
                const existingVehicle = existingVehicles.find(
                  (v) => v.vin === vehicleData.vin
                );

                // Se non esiste, crea il veicolo
                if (!existingVehicle) {
                  await storage.createVehicle({
                    modelId: existingModel.id,
                    vin: vehicleData.vin,
                    licensePlate: vehicleData.licensePlate,
                    color: vehicleData.color,
                    status: vehicleData.status,
                    condition: vehicleData.condition,
                    fuelType: vehicleData.fuelType || "benzina",
                    mileage: vehicleData.mileage,
                    price: vehicleData.price,
                    costPrice: vehicleData.costPrice,
                    description: vehicleData.description,
                    year: vehicleData.year,
                    features: vehicleData.features,
                    images: vehicleData.images,
                  });
                  vehiclesImported++;
                }
              }
            }
          }
        }
      }

      // Restituisci il risultato dell'importazione
      res.json({
        makesImported,
        modelsImported,
        vehiclesImported,
        message: "Importazione completata con successo",
      });
    } catch (error) {
      console.error("Errore durante l'importazione del catalogo:", error);

      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Dati del catalogo non validi",
          errors: error.errors,
        });
      }

      res.status(500).json({
        message: "Errore durante l'importazione del catalogo veicoli",
      });
    }
  });

  // Documentation API Routes - Convert Markdown to HTML
  app.get("/api/documentation/it", async (req, res) => {
    try {
      const markdownPath = path.join(
        process.cwd(),
        "public",
        "CATALOG_API_IT.md"
      );
      const markdownContent = fs.readFileSync(markdownPath, "utf-8");

      // Convertire il markdown in HTML
      const htmlContent = marked.parse(markdownContent);

      // Aggiungere stili CSS base per migliorare la visualizzazione
      const styledHtml = `
        <style>
          .markdown-body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
            font-size: 16px;
            line-height: 1.5;
            word-wrap: break-word;
          }
          .markdown-body h1 { font-size: 2em; margin-top: 1.5em; margin-bottom: 0.5em; }
          .markdown-body h2 { font-size: 1.5em; margin-top: 1.5em; margin-bottom: 0.5em; }
          .markdown-body h3 { font-size: 1.25em; margin-top: 1.5em; margin-bottom: 0.5em; }
          .markdown-body p, .markdown-body blockquote, .markdown-body ul, .markdown-body ol, .markdown-body dl, .markdown-body table, .markdown-body pre {
            margin-top: 0;
            margin-bottom: 16px;
          }
          .markdown-body code {
            padding: 0.2em 0.4em;
            margin: 0;
            font-family: SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace;
            font-size: 85%;
            background-color: rgba(27, 31, 35, 0.05);
            border-radius: 3px;
          }
          .markdown-body pre {
            padding: 16px;
            overflow: auto;
            font-size: 85%;
            line-height: 1.45;
            background-color: #f6f8fa;
            border-radius: 3px;
          }
          .markdown-body pre code {
            padding: 0;
            margin: 0;
            background-color: transparent;
            border: 0;
            word-break: normal;
            white-space: pre;
          }
          .markdown-body table {
            border-spacing: 0;
            border-collapse: collapse;
            width: 100%;
            overflow: auto;
          }
          .markdown-body table th, .markdown-body table td {
            padding: 6px 13px;
            border: 1px solid #dfe2e5;
          }
          .markdown-body table tr {
            background-color: #fff;
            border-top: 1px solid #c6cbd1;
          }
          .markdown-body table tr:nth-child(2n) {
            background-color: #f6f8fa;
          }
        </style>
        <div class="markdown-body">
          ${htmlContent}
        </div>
      `;

      res.setHeader("Content-Type", "text/html");
      res.send(styledHtml);
    } catch (error) {
      console.error("Errore nel caricamento della documentazione IT:", error);
      res.status(500).send("Errore nel caricamento della documentazione");
    }
  });

  app.get("/api/documentation/en", async (req, res) => {
    try {
      const markdownPath = path.join(
        process.cwd(),
        "public",
        "CATALOG_API_EN.md"
      );
      const markdownContent = fs.readFileSync(markdownPath, "utf-8");

      // Convert markdown to HTML
      const htmlContent = marked.parse(markdownContent);

      // Add basic CSS styles to improve display
      const styledHtml = `
        <style>
          .markdown-body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
            font-size: 16px;
            line-height: 1.5;
            word-wrap: break-word;
          }
          .markdown-body h1 { font-size: 2em; margin-top: 1.5em; margin-bottom: 0.5em; }
          .markdown-body h2 { font-size: 1.5em; margin-top: 1.5em; margin-bottom: 0.5em; }
          .markdown-body h3 { font-size: 1.25em; margin-top: 1.5em; margin-bottom: 0.5em; }
          .markdown-body p, .markdown-body blockquote, .markdown-body ul, .markdown-body ol, .markdown-body dl, .markdown-body table, .markdown-body pre {
            margin-top: 0;
            margin-bottom: 16px;
          }
          .markdown-body code {
            padding: 0.2em 0.4em;
            margin: 0;
            font-family: SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace;
            font-size: 85%;
            background-color: rgba(27, 31, 35, 0.05);
            border-radius: 3px;
          }
          .markdown-body pre {
            padding: 16px;
            overflow: auto;
            font-size: 85%;
            line-height: 1.45;
            background-color: #f6f8fa;
            border-radius: 3px;
          }
          .markdown-body pre code {
            padding: 0;
            margin: 0;
            background-color: transparent;
            border: 0;
            word-break: normal;
            white-space: pre;
          }
          .markdown-body table {
            border-spacing: 0;
            border-collapse: collapse;
            width: 100%;
            overflow: auto;
          }
          .markdown-body table th, .markdown-body table td {
            padding: 6px 13px;
            border: 1px solid #dfe2e5;
          }
          .markdown-body table tr {
            background-color: #fff;
            border-top: 1px solid #c6cbd1;
          }
          .markdown-body table tr:nth-child(2n) {
            background-color: #f6f8fa;
          }
        </style>
        <div class="markdown-body">
          ${htmlContent}
        </div>
      `;

      res.setHeader("Content-Type", "text/html");
      res.send(styledHtml);
    } catch (error) {
      console.error("Error loading EN documentation:", error);
      res.status(500).send("Error loading documentation");
    }
  });

  // Reminder routes
  app.get("/api/reminders", requireAuth, async (req, res) => {
    try {
      let reminders;

      // Filtri opzionali per veicolo o cliente
      if (req.query.vehicleId) {
        const vehicleId = parseInt(req.query.vehicleId as string);
        reminders = await storage.getRemindersByVehicle(vehicleId);
      } else if (req.query.customerId) {
        const customerId = parseInt(req.query.customerId as string);
        reminders = await storage.getRemindersByCustomer(customerId);
      } else if (req.query.pending === "true") {
        // Solo promemoria non completati
        reminders = await storage.getPendingReminders();
      } else {
        // Tutti i promemoria
        reminders = await storage.getReminders();
      }

      // Arricchisci i risultati con informazioni sul veicolo e cliente
      const enrichedReminders = await Promise.all(
        reminders.map(async (reminder) => {
          const customer = await storage.getCustomer(reminder.customerId);
          let vehicle = null;
          let model = null;
          let make = null;

          if (reminder.vehicleId) {
            vehicle = await storage.getVehicle(reminder.vehicleId);
            if (vehicle) {
              model = await storage.getVehicleModel(vehicle.modelId);
              if (model) {
                make = await storage.getVehicleMake(model.makeId);
              }
            }
          }

          return {
            ...reminder,
            customer: customer
              ? {
                  id: customer.id,
                  firstName: customer.firstName,
                  lastName: customer.lastName,
                  email: customer.email,
                  phone: customer.phone,
                }
              : null,
            vehicle: vehicle
              ? {
                  ...vehicle,
                  model,
                  make,
                }
              : null,
          };
        })
      );

      res.json(enrichedReminders);
    } catch (error) {
      console.error("Failed to fetch reminders:", error);
      res.status(500).json({ message: "Failed to fetch reminders" });
    }
  });

  app.get("/api/reminders/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const reminder = await storage.getReminder(id);
      if (!reminder) {
        return res.status(404).json({ message: "Reminder not found" });
      }

      // Arricchisci il risultato con informazioni sul veicolo e cliente
      const customer = await storage.getCustomer(reminder.customerId);
      let vehicle = null;
      let model = null;
      let make = null;

      if (reminder.vehicleId) {
        vehicle = await storage.getVehicle(reminder.vehicleId);
        if (vehicle) {
          model = await storage.getVehicleModel(vehicle.modelId);
          if (model) {
            make = await storage.getVehicleMake(model.makeId);
          }
        }
      }

      const enrichedReminder = {
        ...reminder,
        customer: customer
          ? {
              id: customer.id,
              firstName: customer.firstName,
              lastName: customer.lastName,
              email: customer.email,
              phone: customer.phone,
            }
          : null,
        vehicle: vehicle
          ? {
              ...vehicle,
              model,
              make,
            }
          : null,
      };

      res.json(enrichedReminder);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reminder" });
    }
  });

  app.post("/api/reminders", requireAuth, async (req, res) => {
    try {
      const reminderInput = insertReminderSchema.parse(req.body);
      const reminder = await storage.createReminder(reminderInput);
      res.status(201).json(reminder);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: "Invalid reminder data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create reminder" });
    }
  });

  app.put("/api/reminders/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updatedReminder = await storage.updateReminder(id, req.body);
      if (!updatedReminder) {
        return res.status(404).json({ message: "Reminder not found" });
      }
      res.json(updatedReminder);
    } catch (error) {
      res.status(500).json({ message: "Failed to update reminder" });
    }
  });

  app.delete("/api/reminders/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteReminder(id);
      if (!success) {
        return res.status(404).json({ message: "Reminder not found" });
      }
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete reminder" });
    }
  });

  // Endpoint per avviare o fermare il servizio di promemoria
  app.post("/api/reminders/service/start", requireAdmin, async (req, res) => {
    try {
      const intervalMinutes = req.body.intervalMinutes || 60;
      reminderService.start(intervalMinutes);
      res.json({
        message: `Reminder service started with ${intervalMinutes} minutes interval`,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to start reminder service" });
    }
  });

  app.post("/api/reminders/service/stop", requireAdmin, async (req, res) => {
    try {
      reminderService.stop();
      res.json({ message: "Reminder service stopped" });
    } catch (error) {
      res.status(500).json({ message: "Failed to stop reminder service" });
    }
  });

  app.get("/api/reminders/service/status", requireAdmin, async (req, res) => {
    try {
      const isRunning = reminderService.scheduledTask !== null;
      res.json({ running: isRunning });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to get reminder service status" });
    }
  });

  // Avvia il servizio di promemoria al startup dell'app se configurato
  if (process.env.AUTO_START_REMINDER_SERVICE === "true") {
    try {
      const intervalMinutes = parseInt(
        process.env.REMINDER_SERVICE_INTERVAL || "60"
      );
      reminderService.start(intervalMinutes);
      console.log(
        `Reminder service auto-started with ${intervalMinutes} minutes interval`
      );
    } catch (error) {
      console.error("Failed to auto-start reminder service:", error);
    }
  }

  // Supplier routes
  app.get("/api/suppliers", requireAuth, async (req, res) => {
    try {
      // Supporto per la paginazione
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const isActive =
        req.query.isActive === "true"
          ? true
          : req.query.isActive === "false"
          ? false
          : undefined;
      const search = req.query.search as string;

      // Costruiamo gli oggetti per il filtro e la paginazione
      const options: {
        filters?: {
          isActive?: boolean;
          search?: string;
        };
        pagination: {
          page: number;
          limit: number;
        };
      } = {
        pagination: { page, limit },
      };

      // Aggiungiamo i filtri solo se sono definiti
      if (isActive !== undefined || search) {
        options.filters = {};

        if (isActive !== undefined) options.filters.isActive = isActive;
        if (search) options.filters.search = search;
      }

      const result = await storage.getSuppliers(options);

      // Gestiamo la risposta in base al tipo restituito
      if (Array.isArray(result)) {
        res.json(result);
      } else {
        res.json({
          items: result.items,
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        });
      }
    } catch (error) {
      console.error("Error getting suppliers:", error);
      res.status(500).json({ message: "Failed to fetch suppliers" });
    }
  });

  app.get("/api/suppliers/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const supplier = await storage.getSupplier(id);
      if (!supplier) {
        return res.status(404).json({ message: "Supplier not found" });
      }
      res.json(supplier);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch supplier" });
    }
  });

  app.post("/api/suppliers", requireAuth, async (req, res) => {
    try {
      const supplierInput = insertSupplierSchema.parse(req.body);
      const supplier = await storage.createSupplier(supplierInput);
      res.status(201).json(supplier);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: "Invalid supplier data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create supplier" });
    }
  });

  app.put("/api/suppliers/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      // We allow partial updates
      const updatedSupplier = await storage.updateSupplier(id, req.body);
      if (!updatedSupplier) {
        return res.status(404).json({ message: "Supplier not found" });
      }
      res.json(updatedSupplier);
    } catch (error) {
      res.status(500).json({ message: "Failed to update supplier" });
    }
  });

  app.delete("/api/suppliers/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteSupplier(id);
      if (!success) {
        return res
          .status(404)
          .json({ message: "Supplier not found or could not be deleted" });
      }
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete supplier" });
    }
  });

  // Part routes extended
  app.get("/api/parts/low-stock", requireAuth, async (req, res) => {
    try {
      // Supporto per la paginazione
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await storage.getLowStockParts({
        page,
        limit,
      });
      res.json(result);
    } catch (error) {
      console.error("Error getting low stock parts:", error);
      res.status(500).json({ message: "Failed to fetch low stock parts" });
    }
  });

  app.get(
    "/api/parts/by-supplier/:supplierId",
    requireAuth,
    async (req, res) => {
      try {
        const supplierId = parseInt(req.params.supplierId);

        // Supporto per la paginazione
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        const result = await storage.getPartsBySupplier(supplierId, {
          page,
          limit,
        });
        res.json(result);
      } catch (error) {
        console.error("Error getting parts by supplier:", error);
        res.status(500).json({ message: "Failed to fetch parts by supplier" });
      }
    }
  );

  // Part Order routes
  app.get("/api/part-orders", requireAuth, async (req, res) => {
    try {
      // Supporto per la paginazione
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as string;
      const supplierId = req.query.supplierId
        ? parseInt(req.query.supplierId as string)
        : undefined;
      const search = req.query.search as string;

      // Costruiamo gli oggetti per il filtro e la paginazione
      const options: {
        filters?: {
          status?: string;
          supplierId?: number;
          search?: string;
        };
        pagination: {
          page: number;
          limit: number;
        };
      } = {
        pagination: { page, limit },
      };

      // Aggiungiamo i filtri solo se sono definiti
      if (status || supplierId || search) {
        options.filters = {};

        if (status) options.filters.status = status;
        if (supplierId) options.filters.supplierId = supplierId;
        if (search) options.filters.search = search;
      }

      const partOrdersResult = await storage.getPartOrders(options);

      if (!partOrdersResult || !("items" in partOrdersResult)) {
        return res.json([]);
      }

      // Enrich with supplier information
      const enrichedOrders = await Promise.all(
        partOrdersResult.items.map(async (order) => {
          const supplier = await storage.getSupplier(order.supplierId);
          return {
            ...order,
            supplier: supplier
              ? {
                  id: supplier.id,
                  name: supplier.name,
                  contactPerson: supplier.contactPerson,
                  email: supplier.email,
                  phone: supplier.phone,
                }
              : null,
          };
        })
      );

      res.json({
        items: enrichedOrders,
        total: partOrdersResult.total,
        page: partOrdersResult.page,
        limit: partOrdersResult.limit,
        totalPages: partOrdersResult.totalPages,
      });
    } catch (error) {
      console.error("Error getting part orders:", error);
      res.status(500).json({ message: "Failed to fetch part orders" });
    }
  });

  app.get("/api/part-orders/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const partOrder = await storage.getPartOrder(id);
      if (!partOrder) {
        return res.status(404).json({ message: "Part order not found" });
      }

      // Get supplier info
      const supplier = await storage.getSupplier(partOrder.supplierId);

      // Get order items
      const orderItems = await storage.getPartOrderItemsByOrder(id);

      // Enrich items with part information
      const enrichedItems = await Promise.all(
        orderItems.map(async (item) => {
          const part = await storage.getPart(item.partId);
          return {
            ...item,
            part: part || null,
          };
        })
      );

      // Return enriched order
      const enrichedOrder = {
        ...partOrder,
        supplier: supplier
          ? {
              id: supplier.id,
              name: supplier.name,
              contactPerson: supplier.contactPerson,
              email: supplier.email,
              phone: supplier.phone,
            }
          : null,
        items: enrichedItems,
      };

      res.json(enrichedOrder);
    } catch (error) {
      console.error("Error getting part order:", error);
      res.status(500).json({ message: "Failed to fetch part order" });
    }
  });

  app.post("/api/part-orders", requireAuth, async (req, res) => {
    try {
      const partOrderInput = insertPartOrderSchema.parse(req.body);
      const partOrder = await storage.createPartOrder(partOrderInput);
      res.status(201).json(partOrder);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: "Invalid part order data", errors: error.errors });
      }
      console.error("Error creating part order:", error);
      res.status(500).json({ message: "Failed to create part order" });
    }
  });

  app.put("/api/part-orders/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      // Allow partial updates
      const updatedPartOrder = await storage.updatePartOrder(id, req.body);
      if (!updatedPartOrder) {
        return res.status(404).json({ message: "Part order not found" });
      }
      res.json(updatedPartOrder);
    } catch (error) {
      console.error("Error updating part order:", error);
      res.status(500).json({ message: "Failed to update part order" });
    }
  });

  app.delete("/api/part-orders/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deletePartOrder(id);
      if (!success) {
        return res
          .status(404)
          .json({ message: "Part order not found or could not be deleted" });
      }
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting part order:", error);
      res.status(500).json({ message: "Failed to delete part order" });
    }
  });

  // Part Order Item routes
  app.get(
    "/api/part-order-items/by-order/:orderId",
    requireAuth,
    async (req, res) => {
      try {
        const orderId = parseInt(req.params.orderId);

        // Supporto per la paginazione
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        const result = await storage.getPartOrderItemsByOrder(orderId, {
          page,
          limit,
        });

        if (!result || !("items" in result)) {
          return res.json([]);
        }

        // Enrich with part information
        const enrichedItems = await Promise.all(
          result.items.map(async (item) => {
            const part = await storage.getPart(item.partId);
            return {
              ...item,
              part: part || null,
            };
          })
        );

        res.json({
          items: enrichedItems,
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        });
      } catch (error) {
        console.error("Error getting order items:", error);
        res.status(500).json({ message: "Failed to fetch order items" });
      }
    }
  );

  app.post("/api/part-order-items", requireAuth, async (req, res) => {
    try {
      const orderItemInput = insertPartOrderItemSchema.parse(req.body);
      const orderItem = await storage.createPartOrderItem(orderItemInput);
      res.status(201).json(orderItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: "Invalid order item data", errors: error.errors });
      }
      console.error("Error creating order item:", error);
      res.status(500).json({ message: "Failed to create order item" });
    }
  });

  app.put("/api/part-order-items/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updatedOrderItem = await storage.updatePartOrderItem(id, req.body);
      if (!updatedOrderItem) {
        return res.status(404).json({ message: "Order item not found" });
      }
      res.json(updatedOrderItem);
    } catch (error) {
      console.error("Error updating order item:", error);
      res.status(500).json({ message: "Failed to update order item" });
    }
  });

  app.delete("/api/part-order-items/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deletePartOrderItem(id);
      if (!success) {
        return res
          .status(404)
          .json({ message: "Order item not found or could not be deleted" });
      }
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting order item:", error);
      res.status(500).json({ message: "Failed to delete order item" });
    }
  });

  // Endpoint to receive parts
  app.post("/api/part-orders/:id/receive", requireAuth, async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const { items } = req.body;

      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: "Items array is required" });
      }

      // Validate each item
      for (const item of items) {
        if (
          !item.id ||
          !Number.isInteger(item.id) ||
          !Number.isInteger(item.quantityReceived) ||
          item.quantityReceived < 0
        ) {
          return res.status(400).json({
            message: "Each item must have a valid id and quantityReceived",
          });
        }
      }

      // Process the received items
      const results = await Promise.all(
        items.map(async (item) => {
          // Update order item
          const orderItem = await storage.updatePartOrderItem(item.id, {
            quantityReceived: item.quantityReceived,
          });

          if (!orderItem) {
            return {
              id: item.id,
              success: false,
              message: "Order item not found",
            };
          }

          // Get the part details
          const part = await storage.getPart(orderItem.partId);
          if (!part) {
            return { id: item.id, success: false, message: "Part not found" };
          }

          // Update part stock quantity
          const newStockQuantity =
            (part.stockQuantity || 0) + item.quantityReceived;
          const updatedPart = await storage.updatePart(part.id, {
            stockQuantity: newStockQuantity,
            lastOrderDate: new Date(),
          });

          return {
            id: item.id,
            success: true,
            partId: part.id,
            partName: part.name,
            quantityReceived: item.quantityReceived,
            newStockQuantity,
          };
        })
      );

      // Update order status if all items received
      const allOrderItems = await storage.getPartOrderItemsByOrder(orderId);

      if (
        !allOrderItems ||
        (Array.isArray(allOrderItems) && allOrderItems.length === 0)
      ) {
        res.json({
          success: true,
          results,
          message: "No order items found to check completion status",
        });
        return;
      }

      // Check if items is an array or has items property
      const itemsToCheck = Array.isArray(allOrderItems)
        ? allOrderItems
        : allOrderItems && "items" in allOrderItems
        ? allOrderItems.items
        : [];

      const allItemsReceived = itemsToCheck.every(
        (item) => (item.quantityReceived || 0) >= (item.quantity || 0)
      );

      if (allItemsReceived) {
        await storage.updatePartOrder(orderId, {
          status: "completed",
          deliveryDate: new Date(),
        });
      }

      res.json({ success: true, results });
    } catch (error) {
      console.error("Error receiving parts:", error);
      res.status(500).json({ message: "Failed to process received parts" });
    }
  });

  // Transazioni (Entrate e Uscite)
  app.get("/api/transactions", requireAuth, async (req, res) => {
    try {
      // Parametri di paginazione e filtri
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const type = req.query.type as string;
      const category = req.query.category as string;
      const paymentMethod = req.query.paymentMethod as string;
      const search = req.query.search as string;

      // Gestione date
      const startDate = req.query.startDate
        ? new Date(req.query.startDate as string)
        : undefined;
      const endDate = req.query.endDate
        ? new Date(req.query.endDate as string)
        : undefined;

      // Costruiamo gli oggetti per il filtro e la paginazione
      const options: {
        filters?: {
          type?: string;
          category?: string;
          paymentMethod?: string;
          startDate?: Date;
          endDate?: Date;
          search?: string;
        };
        pagination?: {
          page: number;
          limit: number;
        };
      } = {
        pagination: { page, limit },
      };

      // Aggiungiamo i filtri solo se sono definiti
      if (type || category || paymentMethod || startDate || endDate || search) {
        options.filters = {};

        if (type) options.filters.type = type;
        if (category) options.filters.category = category;
        if (paymentMethod) options.filters.paymentMethod = paymentMethod;
        if (startDate) options.filters.startDate = startDate;
        if (endDate) options.filters.endDate = endDate;
        if (search) options.filters.search = search;
      }

      const transactions = await storage.getTransactions(options);
      res.json(transactions);
    } catch (error) {
      console.error("Error getting transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.get("/api/transactions/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const transaction = await storage.getTransaction(id);

      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }

      res.json(transaction);
    } catch (error) {
      console.error("Error getting transaction:", error);
      res.status(500).json({ message: "Failed to fetch transaction" });
    }
  });

  app.post("/api/transactions", requireAuth, async (req, res) => {
    try {
      const transactionInput = insertTransactionSchema.parse(req.body);

      // Assicuriamoci che l'utente corrente venga registrato come creatore
      transactionInput.createdBy = req.user!.id;

      const transaction = await storage.createTransaction(transactionInput);
      res.status(201).json(transaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: "Invalid transaction data", errors: error.errors });
      }
      console.error("Error creating transaction:", error);
      res.status(500).json({ message: "Failed to create transaction" });
    }
  });

  app.put("/api/transactions/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updatedTransaction = await storage.updateTransaction(id, req.body);

      if (!updatedTransaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }

      res.json(updatedTransaction);
    } catch (error) {
      console.error("Error updating transaction:", error);
      res.status(500).json({ message: "Failed to update transaction" });
    }
  });

  app.delete("/api/transactions/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const result = await storage.deleteTransaction(id);

      if (!result) {
        return res.status(404).json({ message: "Transaction not found" });
      }

      res.status(204).end();
    } catch (error) {
      console.error("Error deleting transaction:", error);
      res.status(500).json({ message: "Failed to delete transaction" });
    }
  });

  // Transazioni programmate
  app.get("/api/scheduled-transactions", requireAuth, async (req, res) => {
    try {
      // Parametri di paginazione e filtri
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const type = req.query.type as string;
      const status = req.query.status as string;
      const search = req.query.search as string;
      const isRecurring = req.query.isRecurring
        ? req.query.isRecurring === "true"
          ? true
          : false
        : undefined;

      // Gestione date
      const startDate = req.query.startDate
        ? new Date(req.query.startDate as string)
        : undefined;
      const endDate = req.query.endDate
        ? new Date(req.query.endDate as string)
        : undefined;

      // Costruiamo gli oggetti per il filtro e la paginazione
      const options: {
        filters?: {
          type?: string;
          status?: string;
          startDate?: Date;
          endDate?: Date;
          isRecurring?: boolean;
          search?: string;
        };
        pagination?: {
          page: number;
          limit: number;
        };
      } = {
        pagination: { page, limit },
      };

      // Aggiungiamo i filtri solo se sono definiti
      if (
        type ||
        status ||
        startDate ||
        endDate ||
        isRecurring !== undefined ||
        search
      ) {
        options.filters = {};

        if (type) options.filters.type = type;
        if (status) options.filters.status = status;
        if (startDate) options.filters.startDate = startDate;
        if (endDate) options.filters.endDate = endDate;
        if (isRecurring !== undefined)
          options.filters.isRecurring = isRecurring;
        if (search) options.filters.search = search;
      }

      const scheduledTransactions = await storage.getScheduledTransactions(
        options
      );
      res.json(scheduledTransactions);
    } catch (error) {
      console.error("Error getting scheduled transactions:", error);
      res
        .status(500)
        .json({ message: "Failed to fetch scheduled transactions" });
    }
  });

  app.get(
    "/api/scheduled-transactions/upcoming",
    requireAuth,
    async (req, res) => {
      try {
        const daysAhead = parseInt(req.query.days as string) || 30;
        const upcomingTransactions =
          await storage.getUpcomingScheduledTransactions(daysAhead);
        res.json(upcomingTransactions);
      } catch (error) {
        console.error("Error getting upcoming scheduled transactions:", error);
        res
          .status(500)
          .json({ message: "Failed to fetch upcoming scheduled transactions" });
      }
    }
  );

  app.get("/api/scheduled-transactions/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const scheduledTransaction = await storage.getScheduledTransaction(id);

      if (!scheduledTransaction) {
        return res
          .status(404)
          .json({ message: "Scheduled transaction not found" });
      }

      res.json(scheduledTransaction);
    } catch (error) {
      console.error("Error getting scheduled transaction:", error);
      res
        .status(500)
        .json({ message: "Failed to fetch scheduled transaction" });
    }
  });

  app.post("/api/scheduled-transactions", requireAuth, async (req, res) => {
    try {
      const scheduledTransactionInput = insertScheduledTransactionSchema.parse(
        req.body
      );

      // Assicuriamoci che l'utente corrente venga registrato come creatore
      scheduledTransactionInput.createdBy = req.user!.id;

      const scheduledTransaction = await storage.createScheduledTransaction(
        scheduledTransactionInput
      );
      res.status(201).json(scheduledTransaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Invalid scheduled transaction data",
          errors: error.errors,
        });
      }
      console.error("Error creating scheduled transaction:", error);
      res
        .status(500)
        .json({ message: "Failed to create scheduled transaction" });
    }
  });

  app.put("/api/scheduled-transactions/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updatedScheduledTransaction =
        await storage.updateScheduledTransaction(id, req.body);

      if (!updatedScheduledTransaction) {
        return res
          .status(404)
          .json({ message: "Scheduled transaction not found" });
      }

      res.json(updatedScheduledTransaction);
    } catch (error) {
      console.error("Error updating scheduled transaction:", error);
      res
        .status(500)
        .json({ message: "Failed to update scheduled transaction" });
    }
  });

  app.delete(
    "/api/scheduled-transactions/:id",
    requireAuth,
    async (req, res) => {
      try {
        const id = parseInt(req.params.id);
        const result = await storage.deleteScheduledTransaction(id);

        if (!result) {
          return res
            .status(404)
            .json({ message: "Scheduled transaction not found" });
        }

        res.status(204).end();
      } catch (error) {
        console.error("Error deleting scheduled transaction:", error);
        res
          .status(500)
          .json({ message: "Failed to delete scheduled transaction" });
      }
    }
  );

  return httpServer;
}
