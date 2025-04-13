import { mysqlTable, varchar, int, text, tinyint, timestamp, decimal, json } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define i risultati paginati per tutti i tipi
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Users table
export const users = mysqlTable("users", {
  id: int("id").primaryKey().autoincrement(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).notNull().default("staff"),
  avatarUrl: varchar("avatar_url", { length: 255 }),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Vehicle makes
export const vehicleMakes = mysqlTable("vehicle_makes", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  type: varchar("type", { length: 50 }).notNull(), // car, motorcycle
  logoUrl: varchar("logo_url", { length: 255 }),
});

export const insertVehicleMakeSchema = createInsertSchema(vehicleMakes).omit({ id: true });
export type InsertVehicleMake = z.infer<typeof insertVehicleMakeSchema>;
export type VehicleMake = typeof vehicleMakes.$inferSelect;

// Vehicle models
export const vehicleModels = mysqlTable("vehicle_models", {
  id: int("id").primaryKey().autoincrement(),
  makeId: int("make_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  year: int("year").notNull(),
  type: varchar("type", { length: 50 }).notNull(), // car, motorcycle
  specifications: json("specifications"),
});

export const insertVehicleModelSchema = createInsertSchema(vehicleModels).omit({ id: true });
export type InsertVehicleModel = z.infer<typeof insertVehicleModelSchema>;
export type VehicleModel = typeof vehicleModels.$inferSelect;

// Vehicles
export const vehicles = mysqlTable("vehicles", {
  id: int("id").primaryKey().autoincrement(),
  modelId: int("model_id").notNull(),
  vin: varchar("vin", { length: 50 }).notNull().unique(),
  licensePlate: varchar("license_plate", { length: 20 }),
  color: varchar("color", { length: 50 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default("available"), // available, sold, in_maintenance, reserved
  condition: varchar("condition", { length: 50 }).notNull(), // new, used
  fuelType: varchar("fuel_type", { length: 50 }).notNull().default("benzina"), // benzina, diesel, ibrido, gas
  mileage: int("mileage").notNull().default(0),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  costPrice: decimal("cost_price", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  year: int("year").notNull(),
  features: json("features"),
  images: json("images"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertVehicleSchema = createInsertSchema(vehicles).omit({ id: true, createdAt: true });
export type InsertVehicle = z.infer<typeof insertVehicleSchema>;
export type Vehicle = typeof vehicles.$inferSelect;

// Customers
export const customers = mysqlTable("customers", {
  id: int("id").primaryKey().autoincrement(),
  firstName: varchar("first_name", { length: 255 }).notNull(),
  lastName: varchar("last_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }).notNull(),
  address: varchar("address", { length: 255 }),
  city: varchar("city", { length: 100 }),
  zipCode: varchar("zip_code", { length: 20 }),
  documentId: varchar("document_id", { length: 50 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertCustomerSchema = createInsertSchema(customers).omit({ id: true, createdAt: true });
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Customer = typeof customers.$inferSelect;

// Sales
export const sales = mysqlTable("sales", {
  id: int("id").primaryKey().autoincrement(),
  vehicleId: int("vehicle_id").notNull(),
  customerId: int("customer_id").notNull(),
  userId: int("user_id").notNull(),
  saleDate: timestamp("sale_date").notNull().defaultNow(),
  salePrice: decimal("sale_price", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: varchar("payment_method", { length: 50 }).notNull(), // cash, finance, leasing
  status: varchar("status", { length: 50 }).notNull(), // pending, completed, cancelled
  documents: json("documents"),
  notes: text("notes"),
});

export const insertSaleSchema = createInsertSchema(sales).omit({ id: true });
export type InsertSale = z.infer<typeof insertSaleSchema>;
export type Sale = typeof sales.$inferSelect;

// Appointments
export const appointments = mysqlTable("appointments", {
  id: int("id").primaryKey().autoincrement(),
  customerId: int("customer_id").notNull(),
  vehicleId: int("vehicle_id"),
  userId: int("user_id").notNull(),
  type: varchar("type", { length: 50 }).notNull(), // test_drive, service, consultation, trade_in
  date: timestamp("date").notNull(),
  status: varchar("status", { length: 50 }).notNull().default("scheduled"), // scheduled, completed, cancelled
  notes: text("notes"),
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({ id: true });
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Appointment = typeof appointments.$inferSelect;

// Services
export const services = mysqlTable("services", {
  id: int("id").primaryKey().autoincrement(),
  vehicleId: int("vehicle_id").notNull(),
  customerId: int("customer_id").notNull(),
  serviceDate: timestamp("service_date").notNull(),
  completionDate: timestamp("completion_date"),
  status: varchar("status", { length: 50 }).notNull().default("scheduled"), // scheduled, in_progress, completed, cancelled
  description: text("description").notNull(),
  cost: decimal("cost", { precision: 10, scale: 2 }).notNull(),
  partsCost: decimal("parts_cost", { precision: 10, scale: 2 }).notNull().default("0"),
  laborCost: decimal("labor_cost", { precision: 10, scale: 2 }).notNull().default("0"),
  notes: text("notes"),
});

export const insertServiceSchema = createInsertSchema(services).omit({ id: true });
export type InsertService = z.infer<typeof insertServiceSchema>;
export type Service = typeof services.$inferSelect;

// Suppliers
export const suppliers = mysqlTable("suppliers", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
  contactPerson: varchar("contact_person", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }).notNull(),
  address: varchar("address", { length: 255 }).notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  zipCode: varchar("zip_code", { length: 20 }).notNull(),
  country: varchar("country", { length: 100 }).notNull().default("Italia"),
  vatNumber: varchar("vat_number", { length: 50 }).notNull(),
  website: varchar("website", { length: 255 }),
  paymentTerms: varchar("payment_terms", { length: 255 }),
  notes: text("notes"),
  isActive: tinyint("is_active").notNull().default(1),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertSupplierSchema = createInsertSchema(suppliers).omit({ id: true, createdAt: true });
export type InsertSupplier = z.infer<typeof insertSupplierSchema>;
export type Supplier = typeof suppliers.$inferSelect;

// Parts
export const parts = mysqlTable("parts", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  cost: decimal("cost", { precision: 10, scale: 2 }).notNull(),
  stockQuantity: int("stock_quantity").notNull().default(0),
  minQuantity: int("min_quantity").notNull().default(1),
  location: varchar("location", { length: 100 }), // Posizione nel magazzino (es. "A12", "Scaffale 3")
  category: varchar("category", { length: 100 }).notNull(),
  supplierId: int("supplier_id"), // Riferimento al fornitore
  partNumber: varchar("part_number", { length: 100 }).notNull(),
  barcode: varchar("barcode", { length: 100 }),
  status: varchar("status", { length: 50 }).notNull().default("active"), // active, discontinued, on_order
  lastOrderDate: timestamp("last_order_date"),
  compatibility: json("compatibility"), // Lista di modelli compatibili
  images: json("images"), // URLs delle immagini
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertPartSchema = createInsertSchema(parts).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
  lastOrderDate: true
});
export type InsertPart = z.infer<typeof insertPartSchema>;
export type Part = typeof parts.$inferSelect;

// PartOrders - Ordini di ricambi
export const partOrders = mysqlTable("part_orders", {
  id: int("id").primaryKey().autoincrement(),
  supplierId: int("supplier_id").notNull(),
  orderNumber: varchar("order_number", { length: 100 }).notNull(),
  orderDate: timestamp("order_date").notNull().defaultNow(),
  expectedDeliveryDate: timestamp("expected_delivery_date"),
  deliveryDate: timestamp("delivery_date"),
  status: varchar("status", { length: 50 }).notNull().default("pending"), // pending, partial, delivered, cancelled
  totalCost: decimal("total_cost", { precision: 10, scale: 2 }).notNull().default("0"),
  notes: text("notes"),
  createdBy: int("created_by").notNull(), // user ID
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertPartOrderSchema = createInsertSchema(partOrders).omit({ 
  id: true, 
  createdAt: true 
});
export type InsertPartOrder = z.infer<typeof insertPartOrderSchema>;
export type PartOrder = typeof partOrders.$inferSelect;

// PartOrderItems - Elementi di un ordine
export const partOrderItems = mysqlTable("part_order_items", {
  id: int("id").primaryKey().autoincrement(),
  orderId: int("order_id").notNull(),
  partId: int("part_id").notNull(),
  quantity: int("quantity").notNull(),
  unitCost: decimal("unit_cost", { precision: 10, scale: 2 }).notNull(),
  quantityReceived: int("quantity_received").notNull().default(0),
  notes: text("notes"),
});

export const insertPartOrderItemSchema = createInsertSchema(partOrderItems).omit({ id: true });
export type InsertPartOrderItem = z.infer<typeof insertPartOrderItemSchema>;
export type PartOrderItem = typeof partOrderItems.$inferSelect;

// Finances
export const finances = mysqlTable("finances", {
  id: int("id").primaryKey().autoincrement(),
  saleId: int("sale_id"),
  customerId: int("customer_id").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  interestRate: decimal("interest_rate", { precision: 5, scale: 2 }),
  term: int("term"), // in months
  downPayment: decimal("down_payment", { precision: 10, scale: 2 }),
  monthlyPayment: decimal("monthly_payment", { precision: 10, scale: 2 }),
  type: varchar("type", { length: 50 }).notNull(), // loan, leasing
  status: varchar("status", { length: 50 }).notNull().default("pending"), // pending, approved, rejected, completed
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  notes: text("notes"),
});

export const insertFinanceSchema = createInsertSchema(finances).omit({ id: true });
export type InsertFinance = z.infer<typeof insertFinanceSchema>;
export type Finance = typeof finances.$inferSelect;

// Tasks
export const tasks = mysqlTable("tasks", {
  id: int("id").primaryKey().autoincrement(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  assignedTo: int("assigned_to").notNull(),
  dueDate: timestamp("due_date"),
  priority: varchar("priority", { length: 50 }).notNull().default("medium"), // low, medium, high
  status: varchar("status", { length: 50 }).notNull().default("pending"), // pending, in_progress, completed
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertTaskSchema = createInsertSchema(tasks).omit({ id: true, createdAt: true });
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

// Reminders (Scadenziario)
export const reminders = mysqlTable("reminders", {
  id: int("id").primaryKey().autoincrement(),
  vehicleId: int("vehicle_id").notNull(),
  customerId: int("customer_id").notNull(),
  reminderType: varchar("reminder_type", { length: 50 }).notNull(), // service, maintenance, revisione, assicurazione, bollo
  dueDate: timestamp("due_date").notNull(),
  description: text("description").notNull(),
  isCompleted: tinyint("is_completed").notNull().default(0),
  lastNotificationSent: timestamp("last_notification_sent"),
  notificationsSent: int("notifications_sent").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertReminderSchema = createInsertSchema(reminders).omit({ id: true, createdAt: true, notificationsSent: true, lastNotificationSent: true });
export type InsertReminder = z.infer<typeof insertReminderSchema>;
export type Reminder = typeof reminders.$inferSelect;

// Schema per l'importazione di catalogo veicoli
export const vehicleCatalogImportSchema = z.object({
  makes: z.array(
    z.object({
      name: z.string().min(1, "Nome marca richiesto"),
      type: z.enum(["car", "motorcycle"], { 
        errorMap: () => ({ message: "Tipo deve essere 'car' o 'motorcycle'" })
      }),
      logoUrl: z.string().url("URL logo non valido").optional(),
      models: z.array(
        z.object({
          name: z.string().min(1, "Nome modello richiesto"),
          year: z.number().int().min(1900, "Anno non valido").max(new Date().getFullYear() + 2, "Anno futuro non valido"),
          type: z.enum(["car", "motorcycle"], { 
            errorMap: () => ({ message: "Tipo deve essere 'car' o 'motorcycle'" })
          }),
          specifications: z.record(z.any()).optional(),
          vehicles: z.array(
            z.object({
              vin: z.string().min(1, "VIN richiesto"),
              licensePlate: z.string().optional(),
              color: z.string().min(1, "Colore richiesto"),
              status: z.enum(["available", "sold", "in_maintenance", "reserved"], {
                errorMap: () => ({ message: "Stato non valido. Valori accettati: available, sold, in_maintenance, reserved" })
              }).default("available"),
              condition: z.enum(["new", "used"], {
                errorMap: () => ({ message: "Condizione deve essere 'new' o 'used'" })
              }),
              fuelType: z.enum(["benzina", "diesel", "ibrido", "gas"], {
                errorMap: () => ({ message: "Alimentazione deve essere 'benzina', 'diesel', 'ibrido', o 'gas'" })
              }).default("benzina"),
              mileage: z.number().int().min(0, "Il chilometraggio non può essere negativo").default(0),
              price: z.number().positive("Il prezzo deve essere positivo"),
              costPrice: z.number().positive("Il prezzo di costo deve essere positivo"),
              description: z.string().optional(),
              year: z.number().int().min(1900, "Anno non valido").max(new Date().getFullYear() + 2, "Anno futuro non valido"),
              features: z.record(z.any()).optional(),
              images: z.array(z.string().url("URL immagine non valido")).optional(),
            })
          ).optional().default([])
        })
      ).optional().default([])
    })
  )
});

export type VehicleCatalogImport = z.infer<typeof vehicleCatalogImportSchema>;

// Schema per l'esportazione di catalogo veicoli
export const vehicleCatalogExportSchema = z.object({
  makes: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
      type: z.enum(["car", "motorcycle"]),
      logoUrl: z.string().optional(),
      models: z.array(
        z.object({
          id: z.number(),
          name: z.string(),
          year: z.number(),
          type: z.enum(["car", "motorcycle"]),
          specifications: z.record(z.any()).optional(),
          vehicles: z.array(
            z.object({
              id: z.number(),
              vin: z.string(),
              licensePlate: z.string().optional(),
              color: z.string(),
              status: z.enum(["available", "sold", "in_maintenance", "reserved"]),
              condition: z.enum(["new", "used"]),
              fuelType: z.enum(["benzina", "diesel", "ibrido", "gas"]),
              mileage: z.number(),
              price: z.number(),
              costPrice: z.number(),
              description: z.string().optional(),
              year: z.number(),
              features: z.record(z.any()).optional(),
              images: z.array(z.string()).optional(),
              createdAt: z.string().or(z.date())
            })
          ).optional()
        })
      ).optional()
    })
  )
});

export type VehicleCatalogExport = z.infer<typeof vehicleCatalogExportSchema>;

// Transazioni finanziarie (entrate e uscite)
export const transactions = mysqlTable("transactions", {
  id: int("id").primaryKey().autoincrement(),
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // income, expense
  category: varchar("category", { length: 100 }).notNull(), // vendita, acquisto, stipendi, tasse, manutenzione, affitto, pubblicità, altro
  date: timestamp("date").notNull(),
  paymentMethod: varchar("payment_method", { length: 50 }).notNull(), // contanti, bonifico, carta, assegno
  reference: varchar("reference", { length: 100 }), // Numero fattura o riferimento
  relatedEntityType: varchar("related_entity_type", { length: 50 }), // sale, service, part_order, altro
  relatedEntityId: int("related_entity_id"), // ID dell'entità correlata (vendita, servizio, ordine)
  notes: text("notes"),
  receipts: json("receipts"), // URL di eventuali ricevute o fatture scansionate
  createdAt: timestamp("created_at").notNull().defaultNow(),
  createdBy: int("created_by").notNull(), // ID utente che ha creato la transazione
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({ id: true, createdAt: true });
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

// Pianificazione transazioni ricorrenti o future
export const scheduledTransactions = mysqlTable("scheduled_transactions", {
  id: int("id").primaryKey().autoincrement(),
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // income, expense
  category: varchar("category", { length: 100 }).notNull(),
  dueDate: timestamp("due_date").notNull(),
  paymentMethod: varchar("payment_method", { length: 50 }).notNull(),
  frequency: varchar("frequency", { length: 50 }), // one-time, weekly, monthly, quarterly, yearly
  isRecurring: tinyint("is_recurring").notNull().default(0),
  reference: varchar("reference", { length: 100 }),
  relatedEntityType: varchar("related_entity_type", { length: 50 }),
  relatedEntityId: int("related_entity_id"),
  status: varchar("status", { length: 50 }).notNull().default("pending"), // pending, paid, cancelled
  notificationDays: int("notification_days").default(7), // Giorni di anticipo per la notifica
  lastNotificationSent: timestamp("last_notification_sent"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  createdBy: int("created_by").notNull(),
});

export const insertScheduledTransactionSchema = createInsertSchema(scheduledTransactions).omit({ 
  id: true, 
  createdAt: true, 
  lastNotificationSent: true 
});
export type InsertScheduledTransaction = z.infer<typeof insertScheduledTransactionSchema>;
export type ScheduledTransaction = typeof scheduledTransactions.$inferSelect;