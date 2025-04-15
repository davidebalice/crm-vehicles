import {
  boolean,
  doublePrecision,
  integer,
  json,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
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
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  role: text("role").notNull().default("staff"),
  avatarUrl: text("avatar_url"),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Vehicle makes
export const vehicleMakes = pgTable("vehicle_makes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  type: text("type").notNull(), // car, motorcycle
  logoUrl: text("logo_url"),
});

export const insertVehicleMakeSchema = createInsertSchema(vehicleMakes).omit({
  id: true,
});
export type InsertVehicleMake = z.infer<typeof insertVehicleMakeSchema>;
export type VehicleMake = typeof vehicleMakes.$inferSelect;

// Vehicle models
export const vehicleModels = pgTable("vehicle_models", {
  id: serial("id").primaryKey(),
  makeId: integer("make_id").notNull(),
  name: text("name").notNull(),
  year: integer("year").notNull(),
  type: text("type").notNull(), // car, motorcycle
  specifications: json("specifications"),
});

export const insertVehicleModelSchema = createInsertSchema(vehicleModels).omit({
  id: true,
});
export type InsertVehicleModel = z.infer<typeof insertVehicleModelSchema>;
export type VehicleModel = typeof vehicleModels.$inferSelect;

// Vehicles
export const vehicles = pgTable("vehicles", {
  id: serial("id").primaryKey(),
  modelId: integer("model_id").notNull(),
  make_name: text("make_name"),
  model_name: text("model_name"),
  vin: text("vin").notNull().unique(),
  licensePlate: text("license_plate"),
  color: text("color").notNull(),
  status: text("status").notNull().default("available"), // available, sold, in_maintenance, reserved
  condition: text("condition").notNull(), // new, used
  fuelType: text("fuel_type").notNull().default("benzina"), // benzina, diesel, ibrido, gas
  mileage: integer("mileage").notNull().default(0),
  price: doublePrecision("price").notNull(),
  costPrice: doublePrecision("cost_price").notNull(),
  description: text("description"),
  year: integer("year").notNull(),
  features: json("features"),
  images: json("images"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertVehicleSchema = createInsertSchema(vehicles).omit({
  id: true,
  createdAt: true,
});
export type InsertVehicle = z.infer<typeof insertVehicleSchema>;
export type Vehicle = typeof vehicles.$inferSelect;

// Customers
export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  address: text("address"),
  city: text("city"),
  zipCode: text("zip_code"),
  documentId: text("document_id"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  createdAt: true,
});
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Customer = typeof customers.$inferSelect;

// Sales
export const sales = pgTable("sales", {
  id: serial("id").primaryKey(),
  vehicleId: integer("vehicle_id").notNull(),
  customerId: integer("customer_id").notNull(),
  userId: integer("user_id").notNull(),
  saleDate: timestamp("sale_date").notNull().defaultNow(),
  salePrice: doublePrecision("sale_price").notNull(),
  paymentMethod: text("payment_method").notNull(), // cash, finance, leasing
  status: text("status").notNull(), // pending, completed, cancelled
  documents: json("documents"),
  notes: text("notes"),
});

export const insertSaleSchema = createInsertSchema(sales).omit({ id: true });
export type InsertSale = z.infer<typeof insertSaleSchema>;
export type Sale = typeof sales.$inferSelect;

// Appointments
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull(),
  vehicleId: integer("vehicle_id"),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // test_drive, service, consultation, trade_in
  date: timestamp("date").notNull(),
  status: text("status").notNull().default("scheduled"), // scheduled, completed, cancelled
  notes: text("notes"),
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
});
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Appointment = typeof appointments.$inferSelect;

// Services
export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  vehicleId: integer("vehicle_id").notNull(),
  customerId: integer("customer_id").notNull(),
  serviceDate: timestamp("service_date").notNull(),
  completionDate: timestamp("completion_date"),
  status: text("status").notNull().default("scheduled"), // scheduled, in_progress, completed, cancelled
  description: text("description").notNull(),
  cost: doublePrecision("cost").notNull(),
  partsCost: doublePrecision("parts_cost").notNull().default(0),
  laborCost: doublePrecision("labor_cost").notNull().default(0),
  notes: text("notes"),
});

export const insertServiceSchema = createInsertSchema(services).omit({
  id: true,
});
export type InsertService = z.infer<typeof insertServiceSchema>;
export type Service = typeof services.$inferSelect;

// Suppliers
export const suppliers = pgTable("suppliers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  contactPerson: text("contact_person").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  zipCode: text("zip_code").notNull(),
  country: text("country").notNull().default("Italia"),
  vatNumber: text("vat_number").notNull(),
  website: text("website"),
  paymentTerms: text("payment_terms"),
  notes: text("notes"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertSupplierSchema = createInsertSchema(suppliers).omit({
  id: true,
  createdAt: true,
});
export type InsertSupplier = z.infer<typeof insertSupplierSchema>;
export type Supplier = typeof suppliers.$inferSelect;

// Parts
export const parts = pgTable("parts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: doublePrecision("price").notNull(),
  cost: doublePrecision("cost").notNull(),
  stockQuantity: integer("stock_quantity").notNull().default(0),
  minQuantity: integer("min_quantity").notNull().default(1),
  location: text("location"), // Posizione nel magazzino (es. "A12", "Scaffale 3")
  category: text("category").notNull(),
  supplierId: integer("supplier_id"), // Riferimento al fornitore
  partNumber: text("part_number").notNull(),
  barcode: text("barcode"),
  status: text("status").notNull().default("active"), // active, discontinued, on_order
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
  lastOrderDate: true,
});
export type InsertPart = z.infer<typeof insertPartSchema>;
export type Part = typeof parts.$inferSelect;

// PartOrders - Ordini di ricambi
export const partOrders = pgTable("part_orders", {
  id: serial("id").primaryKey(),
  supplierId: integer("supplier_id").notNull(),
  orderNumber: text("order_number").notNull(),
  orderDate: timestamp("order_date").notNull().defaultNow(),
  expectedDeliveryDate: timestamp("expected_delivery_date"),
  deliveryDate: timestamp("delivery_date"),
  status: text("status").notNull().default("pending"), // pending, partial, delivered, cancelled
  totalCost: doublePrecision("total_cost").notNull().default(0),
  notes: text("notes"),
  createdBy: integer("created_by").notNull(), // user ID
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertPartOrderSchema = createInsertSchema(partOrders).omit({
  id: true,
  createdAt: true,
});
export type InsertPartOrder = z.infer<typeof insertPartOrderSchema>;
export type PartOrder = typeof partOrders.$inferSelect;

// PartOrderItems - Elementi di un ordine
export const partOrderItems = pgTable("part_order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  partId: integer("part_id").notNull(),
  quantity: integer("quantity").notNull(),
  unitCost: doublePrecision("unit_cost").notNull(),
  quantityReceived: integer("quantity_received").notNull().default(0),
  notes: text("notes"),
});

export const insertPartOrderItemSchema = createInsertSchema(
  partOrderItems
).omit({ id: true });
export type InsertPartOrderItem = z.infer<typeof insertPartOrderItemSchema>;
export type PartOrderItem = typeof partOrderItems.$inferSelect;

// Finances
export const finances = pgTable("finances", {
  id: serial("id").primaryKey(),
  saleId: integer("sale_id"),
  customerId: integer("customer_id").notNull(),
  amount: doublePrecision("amount").notNull(),
  interestRate: doublePrecision("interest_rate"),
  term: integer("term"), // in months
  downPayment: doublePrecision("down_payment"),
  monthlyPayment: doublePrecision("monthly_payment"),
  type: text("type").notNull(), // loan, leasing
  status: text("status").notNull().default("pending"), // pending, approved, rejected, completed
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  notes: text("notes"),
});

export const insertFinanceSchema = createInsertSchema(finances).omit({
  id: true,
});
export type InsertFinance = z.infer<typeof insertFinanceSchema>;
export type Finance = typeof finances.$inferSelect;

// Tasks
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  assignedTo: integer("assigned_to").notNull(),
  dueDate: timestamp("due_date"),
  priority: text("priority").notNull().default("medium"), // low, medium, high
  status: text("status").notNull().default("pending"), // pending, in_progress, completed
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
});
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

// Reminders (Scadenziario)
export const reminders = pgTable("reminders", {
  id: serial("id").primaryKey(),
  vehicleId: integer("vehicle_id").notNull(),
  customerId: integer("customer_id").notNull(),
  reminderType: text("reminder_type").notNull(), // service, maintenance, revisione, assicurazione, bollo
  dueDate: timestamp("due_date").notNull(),
  description: text("description").notNull(),
  isCompleted: boolean("is_completed").notNull().default(false),
  lastNotificationSent: timestamp("last_notification_sent"),
  notificationsSent: integer("notifications_sent").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertReminderSchema = createInsertSchema(reminders).omit({
  id: true,
  createdAt: true,
  notificationsSent: true,
  lastNotificationSent: true,
});
export type InsertReminder = z.infer<typeof insertReminderSchema>;
export type Reminder = typeof reminders.$inferSelect;

// Schema per l'importazione di catalogo veicoli
export const vehicleCatalogImportSchema = z.object({
  makes: z.array(
    z.object({
      name: z.string().min(1, "Nome marca richiesto"),
      type: z.enum(["car", "motorcycle"], {
        errorMap: () => ({ message: "Tipo deve essere 'car' o 'motorcycle'" }),
      }),
      logoUrl: z.string().url("URL logo non valido").optional(),
      models: z
        .array(
          z.object({
            name: z.string().min(1, "Nome modello richiesto"),
            year: z
              .number()
              .int()
              .min(1900, "Anno non valido")
              .max(new Date().getFullYear() + 2, "Anno futuro non valido"),
            type: z.enum(["car", "motorcycle"], {
              errorMap: () => ({
                message: "Tipo deve essere 'car' o 'motorcycle'",
              }),
            }),
            specifications: z.record(z.any()).optional(),
            vehicles: z
              .array(
                z.object({
                  vin: z.string().min(1, "VIN richiesto"),
                  licensePlate: z.string().optional(),
                  color: z.string().min(1, "Colore richiesto"),
                  status: z
                    .enum(["available", "sold", "in_maintenance", "reserved"], {
                      errorMap: () => ({
                        message:
                          "Stato non valido. Valori accettati: available, sold, in_maintenance, reserved",
                      }),
                    })
                    .default("available"),
                  condition: z.enum(["new", "used"], {
                    errorMap: () => ({
                      message: "Condizione deve essere 'new' o 'used'",
                    }),
                  }),
                  fuelType: z
                    .enum(["benzina", "diesel", "ibrido", "gas"], {
                      errorMap: () => ({
                        message:
                          "Alimentazione deve essere 'benzina', 'diesel', 'ibrido', o 'gas'",
                      }),
                    })
                    .default("benzina"),
                  mileage: z
                    .number()
                    .int()
                    .min(0, "Il chilometraggio non può essere negativo")
                    .default(0),
                  price: z.number().positive("Il prezzo deve essere positivo"),
                  costPrice: z
                    .number()
                    .positive("Il prezzo di costo deve essere positivo"),
                  description: z.string().optional(),
                  year: z
                    .number()
                    .int()
                    .min(1900, "Anno non valido")
                    .max(
                      new Date().getFullYear() + 2,
                      "Anno futuro non valido"
                    ),
                  features: z.record(z.any()).optional(),
                  images: z
                    .array(z.string().url("URL immagine non valido"))
                    .optional(),
                })
              )
              .optional()
              .default([]),
          })
        )
        .optional()
        .default([]),
    })
  ),
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
      models: z
        .array(
          z.object({
            id: z.number(),
            name: z.string(),
            year: z.number(),
            type: z.enum(["car", "motorcycle"]),
            specifications: z.record(z.any()).optional(),
            vehicles: z
              .array(
                z.object({
                  id: z.number(),
                  vin: z.string(),
                  licensePlate: z.string().optional(),
                  color: z.string(),
                  status: z.enum([
                    "available",
                    "sold",
                    "in_maintenance",
                    "reserved",
                  ]),
                  condition: z.enum(["new", "used"]),
                  fuelType: z.enum(["benzina", "diesel", "ibrido", "gas"]),
                  mileage: z.number(),
                  price: z.number(),
                  costPrice: z.number(),
                  description: z.string().optional(),
                  year: z.number(),
                  features: z.record(z.any()).optional(),
                  images: z.array(z.string()).optional(),
                  createdAt: z.string().or(z.date()),
                })
              )
              .optional(),
          })
        )
        .optional(),
    })
  ),
});

export type VehicleCatalogExport = z.infer<typeof vehicleCatalogExportSchema>;

// Transazioni finanziarie (entrate e uscite)
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  description: text("description").notNull(),
  amount: doublePrecision("amount").notNull(),
  type: text("type").notNull(), // income, expense
  category: text("category").notNull(), // vendita, acquisto, stipendi, tasse, manutenzione, affitto, pubblicità, altro
  date: timestamp("date").notNull(),
  paymentMethod: text("payment_method").notNull(), // contanti, bonifico, carta, assegno
  reference: text("reference"), // Numero fattura o riferimento
  relatedEntityType: text("related_entity_type"), // sale, service, part_order, altro
  relatedEntityId: integer("related_entity_id"), // ID dell'entità correlata (vendita, servizio, ordine)
  notes: text("notes"),
  receipts: json("receipts"), // URL di eventuali ricevute o fatture scansionate
  createdAt: timestamp("created_at").notNull().defaultNow(),
  createdBy: integer("created_by").notNull(), // ID utente che ha creato la transazione
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

// Pianificazione transazioni ricorrenti o future
export const scheduledTransactions = pgTable("scheduled_transactions", {
  id: serial("id").primaryKey(),
  description: text("description").notNull(),
  amount: doublePrecision("amount").notNull(),
  type: text("type").notNull(), // income, expense
  category: text("category").notNull(),
  dueDate: timestamp("due_date").notNull(),
  paymentMethod: text("payment_method").notNull(),
  frequency: text("frequency"), // one-time, weekly, monthly, quarterly, yearly
  isRecurring: boolean("is_recurring").notNull().default(false),
  reference: text("reference"),
  relatedEntityType: text("related_entity_type"),
  relatedEntityId: integer("related_entity_id"),
  status: text("status").notNull().default("pending"), // pending, paid, cancelled
  notificationDays: integer("notification_days").default(7), // Giorni di anticipo per la notifica
  lastNotificationSent: timestamp("last_notification_sent"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  createdBy: integer("created_by").notNull(),
});

export const insertScheduledTransactionSchema = createInsertSchema(
  scheduledTransactions
).omit({
  id: true,
  createdAt: true,
  lastNotificationSent: true,
});
export type InsertScheduledTransaction = z.infer<
  typeof insertScheduledTransactionSchema
>;
export type ScheduledTransaction = typeof scheduledTransactions.$inferSelect;
