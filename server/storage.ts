import {
  appointments,
  customers,
  finances,
  partOrderItems,
  partOrders,
  parts,
  reminders,
  sales,
  scheduledTransactions,
  services,
  suppliers,
  tasks,
  transactions,
  users,
  vehicleMakes,
  vehicleModels,
  vehicles,
  type Appointment,
  type Customer,
  type Finance,
  type InsertAppointment,
  type InsertCustomer,
  type InsertFinance,
  type InsertPart,
  type InsertPartOrder,
  type InsertPartOrderItem,
  type InsertReminder,
  type InsertSale,
  type InsertScheduledTransaction,
  type InsertService,
  type InsertSupplier,
  type InsertTask,
  type InsertTransaction,
  type InsertUser,
  type InsertVehicle,
  type InsertVehicleMake,
  type InsertVehicleModel,
  type PaginatedResult,
  type Part,
  type PartOrder,
  type PartOrderItem,
  type Reminder,
  type Sale,
  type ScheduledTransaction,
  type Service,
  type Supplier,
  type Task,
  type Transaction,
  type User,
  type Vehicle,
  type VehicleMake,
  type VehicleModel,
} from "@shared/schema";

import { and, asc, desc, eq, gte, like, lte, or, sql } from "drizzle-orm";
import { db } from "./db";

import session from "express-session";
import fs from "fs";
import memorystore from "memorystore";
import path from "path";

const __dirname = process.env.IMAGE_URL;

export interface IStorage {
  // Session store
  sessionStore: session.Store;

  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUsers(): Promise<User[]>;

  // Vehicle Makes
  getVehicleMake(id: number): Promise<VehicleMake | undefined>;
  getVehicleMakes(): Promise<VehicleMake[]>;
  createVehicleMake(make: InsertVehicleMake): Promise<VehicleMake>;
  updateVehicleMake(
    id: number,
    make: Partial<VehicleMake>
  ): Promise<VehicleMake | undefined>;
  deleteVehicleMake(id: number): Promise<boolean>;

  // Suppliers
  getSupplier(id: number): Promise<Supplier | undefined>;
  getSuppliers(activeOnly?: boolean): Promise<Supplier[]>;
  createSupplier(supplier: InsertSupplier): Promise<Supplier>;
  updateSupplier(
    id: number,
    supplier: Partial<Supplier>
  ): Promise<Supplier | undefined>;
  deleteSupplier(id: number): Promise<boolean>;

  // Parts
  getPart(id: number): Promise<Part | undefined>;
  getParts(options?: {
    filters?: {
      category?: string;
      supplierId?: number;
      status?: string;
      lowStock?: boolean;
      search?: string;
    };
    pagination?: {
      page: number;
      limit: number;
    };
  }): Promise<{
    data: Part[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
  createPart(part: InsertPart): Promise<Part>;
  updatePart(id: number, part: Partial<Part>): Promise<Part | undefined>;
  deletePart(id: number): Promise<boolean>;
  updatePartStock(id: number, quantity: number): Promise<Part | undefined>;
  getLowStockParts(): Promise<Part[]>;

  // Part Orders
  getPartOrder(id: number): Promise<PartOrder | undefined>;
  getPartOrders(status?: string): Promise<PartOrder[]>;
  createPartOrder(order: InsertPartOrder): Promise<PartOrder>;
  updatePartOrder(
    id: number,
    order: Partial<PartOrder>
  ): Promise<PartOrder | undefined>;
  deletePartOrder(id: number): Promise<boolean>;

  // Part Order Items
  getPartOrderItems(orderId: number): Promise<PartOrderItem[]>;
  createPartOrderItem(item: InsertPartOrderItem): Promise<PartOrderItem>;
  updatePartOrderItem(
    id: number,
    item: Partial<PartOrderItem>
  ): Promise<PartOrderItem | undefined>;
  deletePartOrderItem(id: number): Promise<boolean>;
  receivePartOrderItems(
    orderId: number,
    items: { id: number; quantityReceived: number }[]
  ): Promise<boolean>;

  // Vehicle Models
  getVehicleModel(id: number): Promise<VehicleModel | undefined>;
  getVehicleModelsByMake(makeId: number): Promise<VehicleModel[]>;
  getVehicleModels(): Promise<VehicleModel[]>;
  createVehicleModel(model: InsertVehicleModel): Promise<VehicleModel>;
  updateVehicleModel(
    id: number,
    model: Partial<VehicleModel>
  ): Promise<VehicleModel | undefined>;
  deleteVehicleModel(id: number): Promise<boolean>;

  // Vehicles
  getVehicle(id: number): Promise<Vehicle | undefined>;
  getVehicles(options?: {
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
  }): Promise<PaginatedResult<Vehicle> | Vehicle[]>;
  searchVehicles(
    searchTerm: string,
    page: number,
    limit: number
  ): Promise<Vehicle[]>;
  createVehicle(vehicle: InsertVehicle): Promise<Vehicle>;
  updateVehicle(
    id: number,
    vehicle: Partial<Vehicle>
  ): Promise<Vehicle | undefined>;
  deleteVehicle(id: number): Promise<boolean>;
  saveVehicleImages(
    id: number,
    images: { mainImage: string | null; otherImages: string[] }
  ): Promise<Vehicle | undefined>;

  saveUserImage(
    id: number,
    images: { profileImage: string | null }
  ): Promise<User | undefined>;

  // Customers
  getCustomer(id: number): Promise<Customer | undefined>;
  getCustomers(): Promise<Customer[]>;
  searchCustomers(
    searchTerm: string,
    page: number,
    limit: number
  ): Promise<Customer[]>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(
    id: number,
    customer: Partial<Customer>
  ): Promise<Customer | undefined>;

  // Sales
  getSale(id: number): Promise<Sale | undefined>;
  getSales(): Promise<Sale[]>;
  getSalesByCustomer(customerId: number): Promise<Sale[]>;
  createSale(sale: InsertSale): Promise<Sale>;

  // Appointments
  getAppointment(id: number): Promise<Appointment | undefined>;
  getAppointments(): Promise<Appointment[]>;
  getAppointmentsByCustomer(customerId: number): Promise<Appointment[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(
    id: number,
    appointment: Partial<Appointment>
  ): Promise<Appointment | undefined>;

  // Services
  getService(id: number): Promise<Service | undefined>;
  getServices(): Promise<Service[]>;
  getServicesByVehicle(vehicleId: number): Promise<Service[]>;
  createService(service: InsertService): Promise<Service>;

  // Finances
  getFinance(id: number): Promise<Finance | undefined>;
  getFinancesBySale(saleId: number): Promise<Finance[]>;
  getAllFinances(): Promise<Finance[]>;
  createFinance(finance: InsertFinance): Promise<Finance>;

  // Tasks
  getTask(id: number): Promise<Task | undefined>;
  getTasks(): Promise<Task[]>;
  getTasksByAssignee(userId: number): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<Task>): Promise<Task | undefined>;

  // Reminders (Scadenziario)
  getReminder(id: number): Promise<Reminder | undefined>;
  getReminders(): Promise<Reminder[]>;
  getRemindersByVehicle(vehicleId: number): Promise<Reminder[]>;
  getRemindersByCustomer(customerId: number): Promise<Reminder[]>;
  getPendingReminders(): Promise<Reminder[]>;
  getDueReminders(days: number): Promise<Reminder[]>;
  createReminder(reminder: InsertReminder): Promise<Reminder>;
  updateReminder(
    id: number,
    reminder: Partial<Reminder>
  ): Promise<Reminder | undefined>;
  deleteReminder(id: number): Promise<boolean>;

  // Transazioni (Entrate e Uscite)
  getTransaction(id: number): Promise<Transaction | undefined>;
  getTransactions(options?: {
    filters?: {
      type?: string;
      category?: string;
      startDate?: Date;
      endDate?: Date;
      paymentMethod?: string;
      search?: string;
    };
    pagination?: {
      page: number;
      limit: number;
    };
  }): Promise<PaginatedResult<Transaction>>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(
    id: number,
    transaction: Partial<Transaction>
  ): Promise<Transaction | undefined>;
  deleteTransaction(id: number): Promise<boolean>;

  // Transazioni programmate
  getScheduledTransaction(
    id: number
  ): Promise<ScheduledTransaction | undefined>;
  getScheduledTransactions(options?: {
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
  }): Promise<PaginatedResult<ScheduledTransaction>>;
  createScheduledTransaction(
    scheduledTransaction: InsertScheduledTransaction
  ): Promise<ScheduledTransaction>;
  updateScheduledTransaction(
    id: number,
    scheduledTransaction: Partial<ScheduledTransaction>
  ): Promise<ScheduledTransaction | undefined>;
  deleteScheduledTransaction(id: number): Promise<boolean>;
  getUpcomingScheduledTransactions(
    daysAhead: number
  ): Promise<ScheduledTransaction[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private vehicleMakes: Map<number, VehicleMake>;
  private vehicleModels: Map<number, VehicleModel>;
  private vehicles: Map<number, Vehicle>;
  private customers: Map<number, Customer>;
  private sales: Map<number, Sale>;
  private appointments: Map<number, Appointment>;
  private services: Map<number, Service>;
  private parts: Map<number, Part>;
  private finances: Map<number, Finance>;
  private tasks: Map<number, Task>;
  private reminders: Map<number, Reminder>;
  private suppliers: Map<number, Supplier>;
  private partOrders: Map<number, PartOrder>;
  private partOrderItems: Map<number, PartOrderItem>;
  private transactions: Map<number, Transaction>;
  private scheduledTransactions: Map<number, ScheduledTransaction>;

  private userCurrentId: number;
  private vehicleMakeCurrentId: number;
  private vehicleModelCurrentId: number;
  private vehicleCurrentId: number;
  private customerCurrentId: number;
  private saleCurrentId: number;
  private appointmentCurrentId: number;
  private serviceCurrentId: number;
  private partCurrentId: number;
  private financeCurrentId: number;
  private taskCurrentId: number;
  private reminderCurrentId: number;
  private supplierCurrentId: number;
  private partOrderCurrentId: number;
  private partOrderItemCurrentId: number;
  private transactionCurrentId: number;
  private scheduledTransactionCurrentId: number;

  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.vehicleMakes = new Map();
    this.vehicleModels = new Map();
    this.vehicles = new Map();
    this.customers = new Map();
    this.sales = new Map();
    this.appointments = new Map();
    this.services = new Map();
    this.parts = new Map();
    this.finances = new Map();
    this.tasks = new Map();
    this.reminders = new Map();
    this.suppliers = new Map();
    this.partOrders = new Map();
    this.partOrderItems = new Map();
    this.transactions = new Map();
    this.scheduledTransactions = new Map();

    this.userCurrentId = 1;
    this.vehicleMakeCurrentId = 1;
    this.vehicleModelCurrentId = 1;
    this.vehicleCurrentId = 1;
    this.customerCurrentId = 1;
    this.saleCurrentId = 1;
    this.appointmentCurrentId = 1;
    this.serviceCurrentId = 1;
    this.partCurrentId = 1;
    this.financeCurrentId = 1;
    this.taskCurrentId = 1;
    this.reminderCurrentId = 1;
    this.supplierCurrentId = 1;
    this.partOrderCurrentId = 1;
    this.partOrderItemCurrentId = 1;
    this.transactionCurrentId = 1;
    this.scheduledTransactionCurrentId = 1;

    // Initialize session store
    const MemoryStore = memorystore(session);
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });

    // Add seed data
    //this.seedData();
  }

  private seedData() {
    // Seed admin user
    this.createUser({
      username: "admin",
      password: "admin123", // In a real app, this would be hashed
      fullName: "Mario Rossi",
      email: "admin@automotoplus.com",
      role: "admin",
      avatarUrl: "https://randomuser.me/api/portraits/men/32.jpg",
    });
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Vehicle Make methods
  async getVehicleMake(id: number): Promise<VehicleMake | undefined> {
    return this.vehicleMakes.get(id);
  }

  async createVehicleMake(make: InsertVehicleMake): Promise<VehicleMake> {
    const id = this.vehicleMakeCurrentId++;
    const vehicleMake: VehicleMake = { ...make, id };
    this.vehicleMakes.set(id, vehicleMake);
    return vehicleMake;
  }

  async updateVehicleMake(
    id: number,
    makeUpdate: Partial<VehicleMake>
  ): Promise<VehicleMake | undefined> {
    const existingMake = this.vehicleMakes.get(id);
    if (!existingMake) return undefined;

    const updatedMake = { ...existingMake, ...makeUpdate };
    this.vehicleMakes.set(id, updatedMake);
    return updatedMake;
  }

  async deleteVehicleMake(id: number): Promise<boolean> {
    // Prima verifichiamo se ci sono modelli collegati a questa marca
    const relatedModels = Array.from(this.vehicleModels.values()).filter(
      (model) => model.makeId === id
    );

    // Non permettiamo l'eliminazione se ci sono modelli collegati
    if (relatedModels.length > 0) {
      return false;
    }

    return this.vehicleMakes.delete(id);
  }

  // Vehicle Model methods
  async getVehicleModel(id: number): Promise<VehicleModel | undefined> {
    return this.vehicleModels.get(id);
  }

  async getVehicleModelsByMake(makeId: number): Promise<VehicleModel[]> {
    const query = `SELECT * FROM vehicle_models WHERE make_id = ${makeId}`;
    try {
      const results = await db.execute(query); // Usa db.execute direttamente
      //console.log(results);
      return results as VehicleModel[];
    } catch (error) {
      console.error("Errore durante l'esecuzione della query", error);
      throw error;
    }
  }

  async createVehicleModel(model: InsertVehicleModel): Promise<VehicleModel> {
    const id = this.vehicleModelCurrentId++;
    const vehicleModel: VehicleModel = { ...model, id };
    this.vehicleModels.set(id, vehicleModel);
    return vehicleModel;
  }

  async updateVehicleModel(
    id: number,
    modelUpdate: Partial<VehicleModel>
  ): Promise<VehicleModel | undefined> {
    const existingModel = this.vehicleModels.get(id);
    if (!existingModel) return undefined;

    const updatedModel = { ...existingModel, ...modelUpdate };
    this.vehicleModels.set(id, updatedModel);
    return updatedModel;
  }

  async deleteVehicleModel(id: number): Promise<boolean> {
    // Prima verifichiamo se ci sono veicoli collegati a questo modello
    const relatedVehicles = Array.from(this.vehicles.values()).filter(
      (vehicle) => vehicle.modelId === id
    );

    // Non permettiamo l'eliminazione se ci sono veicoli collegati
    if (relatedVehicles.length > 0) {
      return false;
    }

    return this.vehicleModels.delete(id);
  }

  async createVehicle(vehicle: InsertVehicle): Promise<Vehicle> {
    const id = this.vehicleCurrentId++;
    const newVehicle: Vehicle = {
      ...vehicle,
      id,
      createdAt: new Date(),
    };
    this.vehicles.set(id, newVehicle);
    return newVehicle;
  }

  async updateVehicle(
    id: number,
    vehicleUpdate: Partial<Vehicle>
  ): Promise<Vehicle | undefined> {
    const existingVehicle = this.vehicles.get(id);
    if (!existingVehicle) return undefined;

    const updatedVehicle = { ...existingVehicle, ...vehicleUpdate };
    this.vehicles.set(id, updatedVehicle);
    return updatedVehicle;
  }

  async deleteVehicle(id: number): Promise<boolean> {
    return this.vehicles.delete(id);
  }

  async searchVehicles(
    searchTerm: string,
    page: number,
    limit: number
  ): Promise<Vehicle[]> {
    // Filtriamo i veicoli in base al termine di ricerca
    const allVehicles = Array.from(this.vehicles.values());
    const searchLower = searchTerm.toLowerCase();

    // Ottieni tutti i modelli e le marche per la ricerca
    const allModels = Array.from(this.vehicleModels.values());
    const allMakes = Array.from(this.vehicleMakes.values());

    // Ricerca per targa, VIN, o trova modelli e marche che corrispondono al termine di ricerca
    const filteredVehicles = allVehicles.filter((vehicle) => {
      // Ricerca diretta su veicolo
      const directMatch =
        vehicle.licensePlate?.toLowerCase().includes(searchLower) ||
        vehicle.vin.toLowerCase().includes(searchLower);

      if (directMatch) return true;

      // Ricerca per marca o modello
      const model = allModels.find((m) => m.id === vehicle.modelId);
      if (!model) return false;

      // Verifica se il modello corrisponde
      if (model.name.toLowerCase().includes(searchLower)) return true;

      // Verifica se la marca corrisponde
      const make = allMakes.find((m) => m.id === model.makeId);
      if (make && make.name.toLowerCase().includes(searchLower)) return true;

      return false;
    });

    // Calcolo dell'offset in base alla pagina richiesta
    const offset = (page - 1) * limit;

    // Restituiamo solo i veicoli nella pagina corrente
    return filteredVehicles.slice(offset, offset + limit);
  }

  // Customer methods
  async getCustomer(id: number): Promise<Customer | undefined> {
    return this.customers.get(id);
  }

  async getCustomers(): Promise<Customer[]> {
    return Array.from(this.customers.values());
  }

  async searchCustomers(
    searchTerm: string,
    page: number,
    limit: number
  ): Promise<Customer[]> {
    // Filtriamo i clienti in base al termine di ricerca
    const allCustomers = Array.from(this.customers.values());

    // Ricerca per cognome, nome o telefono
    const filteredCustomers = allCustomers.filter((customer) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        customer.lastName?.toLowerCase().includes(searchLower) ||
        customer.firstName?.toLowerCase().includes(searchLower) ||
        customer.phone?.toLowerCase().includes(searchLower) ||
        customer.email?.toLowerCase().includes(searchLower)
      );
    });

    // Calcolo dell'offset in base alla pagina richiesta
    const offset = (page - 1) * limit;

    // Restituiamo solo i clienti nella pagina corrente
    return filteredCustomers.slice(offset, offset + limit);
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const id = this.customerCurrentId++;
    const newCustomer: Customer = {
      ...customer,
      id,
      createdAt: new Date(),
    };
    this.customers.set(id, newCustomer);
    return newCustomer;
  }

  async updateCustomer(
    id: number,
    customerUpdate: Partial<Customer>
  ): Promise<Customer | undefined> {
    const existingCustomer = this.customers.get(id);
    if (!existingCustomer) return undefined;

    const updatedCustomer = { ...existingCustomer, ...customerUpdate };
    this.customers.set(id, updatedCustomer);
    return updatedCustomer;
  }

  // Sale methods
  async getSale(id: number): Promise<Sale | undefined> {
    return this.sales.get(id);
  }

  async getSales(): Promise<Sale[]> {
    return Array.from(this.sales.values());
  }

  async getSalesByCustomer(customerId: number): Promise<Sale[]> {
    return Array.from(this.sales.values()).filter(
      (sale) => sale.customerId === customerId
    );
  }

  async createSale(sale: InsertSale): Promise<Sale> {
    const id = this.saleCurrentId++;
    const newSale: Sale = { ...sale, id };
    this.sales.set(id, newSale);
    return newSale;
  }

  // Appointment methods
  async getAppointment(id: number): Promise<Appointment | undefined> {
    return this.appointments.get(id);
  }

  async getAppointments(): Promise<Appointment[]> {
    return Array.from(this.appointments.values());
  }

  async getAppointmentsByCustomer(customerId: number): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).filter(
      (appointment) => appointment.customerId === customerId
    );
  }

  async createAppointment(
    appointment: InsertAppointment
  ): Promise<Appointment> {
    const id = this.appointmentCurrentId++;
    const newAppointment: Appointment = { ...appointment, id };
    this.appointments.set(id, newAppointment);
    return newAppointment;
  }

  async updateAppointment(
    id: number,
    appointmentUpdate: Partial<Appointment>
  ): Promise<Appointment | undefined> {
    const existingAppointment = this.appointments.get(id);
    if (!existingAppointment) return undefined;

    const updatedAppointment = { ...existingAppointment, ...appointmentUpdate };
    this.appointments.set(id, updatedAppointment);
    return updatedAppointment;
  }

  // Service methods
  async getService(id: number): Promise<Service | undefined> {
    return this.services.get(id);
  }

  async getServices(): Promise<Service[]> {
    const query = `SELECT * FROM services `;
    const results = await db.execute(query);
    console.log("results");
    console.log(results);
    return results as Service[];
  }

  async getServicesByVehicle(vehicleId: number): Promise<Service[]> {
    return (await db.select())
      .from(services)
      .where(eq(services.vehicleId, vehicleId));
  }

  async createService(service: InsertService): Promise<Service> {
    const id = this.serviceCurrentId++;
    const newService: Service = { ...service, id };
    this.services.set(id, newService);
    return newService;
  }

  // Part methods
  async getPart(id: number): Promise<Part | undefined> {
    return this.parts.get(id);
  }

  async getParts(options?: {
    filters?: {
      category?: string;
      supplierId?: number;
      status?: string;
      lowStock?: boolean;
      search?: string;
    };
    pagination?: {
      page: number;
      limit: number;
    };
  }): Promise<{
    data: Part[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    // Ottieni tutti i ricambi
    let parts = Array.from(this.parts.values());

    // Filtra i ricambi in base ai filtri forniti
    if (options?.filters) {
      const filters = options.filters;

      if (filters.category) {
        parts = parts.filter((part) => part.category === filters.category);
      }

      if (filters.supplierId) {
        parts = parts.filter((part) => part.supplierId === filters.supplierId);
      }

      if (filters.status) {
        parts = parts.filter((part) => part.status === filters.status);
      }

      if (filters.lowStock) {
        parts = parts.filter((part) => part.stockQuantity <= part.minQuantity);
      }

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        parts = parts.filter(
          (part) =>
            part.name.toLowerCase().includes(searchLower) ||
            part.partNumber.toLowerCase().includes(searchLower) ||
            (part.description &&
              part.description.toLowerCase().includes(searchLower))
        );
      }
    }

    // Calcola il numero totale di elementi
    const total = parts.length;

    // Applica la paginazione se richiesto
    const page = options?.pagination?.page || 1;
    const limit = options?.pagination?.limit || 10;
    const offset = (page - 1) * limit;

    // Calcola il numero totale di pagine
    const totalPages = Math.ceil(total / limit);

    // Applica la paginazione
    const data = parts.slice(offset, offset + limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async createPart(part: InsertPart): Promise<Part> {
    const id = this.partCurrentId++;
    const newPart: Part = { ...part, id };
    this.parts.set(id, newPart);
    return newPart;
  }

  async updatePart(
    id: number,
    partUpdate: Partial<Part>
  ): Promise<Part | undefined> {
    const existingPart = this.parts.get(id);
    if (!existingPart) return undefined;

    const updatedPart = { ...existingPart, ...partUpdate };
    this.parts.set(id, updatedPart);
    return updatedPart;
  }

  async deletePart(id: number): Promise<boolean> {
    return this.parts.delete(id);
  }

  async updatePartStock(
    id: number,
    quantity: number
  ): Promise<Part | undefined> {
    const existingPart = this.parts.get(id);
    if (!existingPart) return undefined;

    const updatedPart = {
      ...existingPart,
      stockQuantity: Math.max(0, (existingPart.stockQuantity || 0) + quantity),
    };
    this.parts.set(id, updatedPart);
    return updatedPart;
  }

  async getLowStockParts(): Promise<Part[]> {
    const response = await this.getParts({
      filters: {
        lowStock: true,
      },
    });
    return response.data;
  }

  // Supplier methods
  async getSupplier(id: number): Promise<Supplier | undefined> {
    return this.suppliers.get(id);
  }

  async getSuppliers(options?: {
    filters?: {
      isActive?: boolean;
      search?: string;
    };
    pagination: {
      page: number;
      limit: number;
    };
  }): Promise<PaginatedResult<Supplier> | Supplier[]> {
    let suppliers = Array.from(this.suppliers.values());

    // Comportamento originale: se non ci sono opzioni o è passato solo un boolean
    if (!options || typeof options === "boolean") {
      const activeOnly = typeof options === "boolean" ? options : false;
      if (activeOnly) {
        suppliers = suppliers.filter((supplier) => supplier.isActive);
      }
      return suppliers;
    }

    // Applica i filtri se sono definiti
    if (options.filters) {
      if (options.filters.isActive !== undefined) {
        suppliers = suppliers.filter(
          (supplier) => supplier.isActive === options.filters!.isActive
        );
      }

      if (options.filters.search) {
        const searchLower = options.filters.search.toLowerCase();
        suppliers = suppliers.filter(
          (supplier) =>
            supplier.name.toLowerCase().includes(searchLower) ||
            supplier.contactPerson.toLowerCase().includes(searchLower) ||
            supplier.email.toLowerCase().includes(searchLower) ||
            supplier.phone.toLowerCase().includes(searchLower) ||
            (supplier.notes &&
              supplier.notes.toLowerCase().includes(searchLower))
        );
      }
    }

    // Se non è definita la paginazione, restituisci tutti i risultati filtrati
    if (!options.pagination) {
      return suppliers;
    }

    // Altrimenti, applica la paginazione
    const { page, limit } = options.pagination;
    const offset = (page - 1) * limit;
    const paginatedItems = suppliers.slice(offset, offset + limit);

    // Calcola il numero totale di pagine
    const total = suppliers.length;
    const totalPages = Math.ceil(total / limit);

    return {
      items: paginatedItems,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async createSupplier(supplier: InsertSupplier): Promise<Supplier> {
    const id = this.supplierCurrentId++;
    const newSupplier: Supplier = {
      ...supplier,
      id,
      createdAt: new Date(),
    };
    this.suppliers.set(id, newSupplier);
    return newSupplier;
  }

  async updateSupplier(
    id: number,
    supplierUpdate: Partial<Supplier>
  ): Promise<Supplier | undefined> {
    const existingSupplier = this.suppliers.get(id);
    if (!existingSupplier) return undefined;

    const updatedSupplier = { ...existingSupplier, ...supplierUpdate };
    this.suppliers.set(id, updatedSupplier);
    return updatedSupplier;
  }

  async deleteSupplier(id: number): Promise<boolean> {
    // Verifica se ci sono parti collegate a questo fornitore
    const relatedParts = Array.from(this.parts.values()).filter(
      (part) => part.supplierId === id
    );

    // Non permettiamo l'eliminazione se ci sono parti associate
    if (relatedParts.length > 0) {
      return false;
    }

    return this.suppliers.delete(id);
  }

  // Part Order methods
  async getPartOrder(id: number): Promise<PartOrder | undefined> {
    return this.partOrders.get(id);
  }

  async getPartOrders(options?: {
    filters?: {
      status?: string;
      supplierId?: number;
      search?: string;
    };
    pagination: {
      page: number;
      limit: number;
    };
  }): Promise<PaginatedResult<PartOrder> | PartOrder[]> {
    let orders = Array.from(this.partOrders.values());

    // Comportamento originale
    if (!options) {
      return orders;
    }

    if (typeof options === "string") {
      const status = options;
      return orders.filter((order) => order.status === status);
    }

    // Applica i filtri
    if (options.filters) {
      if (options.filters.status) {
        orders = orders.filter(
          (order) => order.status === options.filters!.status
        );
      }

      if (options.filters.supplierId) {
        orders = orders.filter(
          (order) => order.supplierId === options.filters!.supplierId
        );
      }

      if (options.filters.search) {
        const searchLower = options.filters.search.toLowerCase();
        orders = orders.filter(
          (order) =>
            order.orderNumber.toLowerCase().includes(searchLower) ||
            (order.notes && order.notes.toLowerCase().includes(searchLower))
        );
      }
    }

    // Se non è definita la paginazione, restituisci tutti i risultati filtrati
    if (!options.pagination) {
      return orders;
    }

    // Altrimenti, applica la paginazione
    const { page, limit } = options.pagination;
    const offset = (page - 1) * limit;
    const paginatedItems = orders.slice(offset, offset + limit);

    // Calcola il numero totale di pagine
    const total = orders.length;
    const totalPages = Math.ceil(total / limit);

    return {
      items: paginatedItems,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async createPartOrder(order: InsertPartOrder): Promise<PartOrder> {
    const id = this.partOrderCurrentId++;
    const newOrder: PartOrder = {
      ...order,
      id,
      createdAt: new Date(),
    };
    this.partOrders.set(id, newOrder);
    return newOrder;
  }

  async updatePartOrder(
    id: number,
    orderUpdate: Partial<PartOrder>
  ): Promise<PartOrder | undefined> {
    const existingOrder = this.partOrders.get(id);
    if (!existingOrder) return undefined;

    const updatedOrder = { ...existingOrder, ...orderUpdate };
    this.partOrders.set(id, updatedOrder);
    return updatedOrder;
  }

  async deletePartOrder(id: number): Promise<boolean> {
    // Prima eliminiamo tutti gli elementi dell'ordine
    const items = await this.getPartOrderItems(id);
    for (const item of items) {
      await this.deletePartOrderItem(item.id);
    }

    return this.partOrders.delete(id);
  }

  // Part Order Item methods
  async getPartOrderItems(orderId: number): Promise<PartOrderItem[]> {
    return Array.from(this.partOrderItems.values()).filter(
      (item) => item.orderId === orderId
    );
  }

  async createPartOrderItem(item: InsertPartOrderItem): Promise<PartOrderItem> {
    const id = this.partOrderItemCurrentId++;
    const newItem: PartOrderItem = { ...item, id };
    this.partOrderItems.set(id, newItem);
    return newItem;
  }

  async updatePartOrderItem(
    id: number,
    itemUpdate: Partial<PartOrderItem>
  ): Promise<PartOrderItem | undefined> {
    const existingItem = this.partOrderItems.get(id);
    if (!existingItem) return undefined;

    const updatedItem = { ...existingItem, ...itemUpdate };
    this.partOrderItems.set(id, updatedItem);
    return updatedItem;
  }

  async deletePartOrderItem(id: number): Promise<boolean> {
    return this.partOrderItems.delete(id);
  }

  async receivePartOrderItems(
    orderId: number,
    items: { id: number; quantityReceived: number }[]
  ): Promise<boolean> {
    const order = await this.getPartOrder(orderId);
    if (!order) return false;

    // Aggiorna ogni elemento dell'ordine
    for (const item of items) {
      const orderItem = await this.partOrderItems.get(item.id);
      if (!orderItem || orderItem.orderId !== orderId) continue;

      // Aggiorna il numero di pezzi ricevuti
      const newQuantityReceived =
        orderItem.quantityReceived + item.quantityReceived;
      await this.updatePartOrderItem(item.id, {
        quantityReceived: newQuantityReceived,
      });

      // Aggiorna lo stock del prodotto
      const part = await this.getPart(orderItem.partId);
      if (part) {
        await this.updatePartStock(part.id, item.quantityReceived);
      }
    }

    // Controlla se tutti gli elementi sono stati ricevuti
    const updatedItems = await this.getPartOrderItems(orderId);
    const isComplete = updatedItems.every(
      (item) => item.quantityReceived >= item.quantity
    );
    const isPartial = updatedItems.some((item) => item.quantityReceived > 0);

    // Aggiorna lo stato dell'ordine
    let status = order.status;
    if (isComplete) {
      status = "delivered";
    } else if (isPartial) {
      status = "partial";
    }

    // Imposta la data di consegna se l'ordine è completato
    const deliveryDate = isComplete ? new Date() : order.deliveryDate;

    await this.updatePartOrder(orderId, {
      status,
      deliveryDate,
    });

    return true;
  }

  // Finance methods
  async getFinance(id: number): Promise<Finance | undefined> {
    return this.finances.get(id);
  }

  async getFinancesBySale(saleId: number): Promise<Finance[]> {
    return Array.from(this.finances.values()).filter(
      (finance) => finance.saleId === saleId
    );
  }

  async getAllFinances(): Promise<Finance[]> {
    return Array.from(this.finances.values());
  }

  async createFinance(finance: InsertFinance): Promise<Finance> {
    const id = this.financeCurrentId++;
    const status = finance.status || "pending";
    const newFinance: Finance = {
      ...finance,
      id,
      status,
      saleId: finance.saleId || null,
    };
    this.finances.set(id, newFinance);
    return newFinance;
  }

  // Task methods
  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async getTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values());
  }

  async getTasksByAssignee(userId: number): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      (task) => task.assignedTo === userId
    );
  }

  async createTask(task: InsertTask): Promise<Task> {
    const id = this.taskCurrentId++;
    const newTask: Task = {
      ...task,
      id,
      createdAt: new Date(),
    };
    this.tasks.set(id, newTask);
    return newTask;
  }

  async updateTask(
    id: number,
    taskUpdate: Partial<Task>
  ): Promise<Task | undefined> {
    const existingTask = this.tasks.get(id);
    if (!existingTask) return undefined;

    const updatedTask = { ...existingTask, ...taskUpdate };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  // Reminder methods
  async getReminder(id: number): Promise<Reminder | undefined> {
    return this.reminders.get(id);
  }

  async getReminders(): Promise<Reminder[]> {
    return Array.from(this.reminders.values());
  }

  async getRemindersByVehicle(vehicleId: number): Promise<Reminder[]> {
    return Array.from(this.reminders.values()).filter(
      (reminder) => reminder.vehicleId === vehicleId
    );
  }

  async getRemindersByCustomer(customerId: number): Promise<Reminder[]> {
    return Array.from(this.reminders.values()).filter(
      (reminder) => reminder.customerId === customerId
    );
  }

  async getPendingReminders(): Promise<Reminder[]> {
    return Array.from(this.reminders.values()).filter(
      (reminder) => !reminder.isCompleted
    );
  }

  async getDueReminders(days: number): Promise<Reminder[]> {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + days);

    return Array.from(this.reminders.values()).filter((reminder) => {
      // Solo promemoria non completati
      if (reminder.isCompleted) return false;

      // Data di scadenza deve essere tra oggi e il numero di giorni specificato nel futuro
      const dueDate = new Date(reminder.dueDate);
      return dueDate >= now && dueDate <= futureDate;
    });
  }

  async createReminder(reminder: InsertReminder): Promise<Reminder> {
    const id = this.reminderCurrentId++;
    const newReminder: Reminder = {
      ...reminder,
      id,
      isCompleted: false,
      lastNotificationSent: null,
      notificationsSent: 0,
      createdAt: new Date(),
    };
    this.reminders.set(id, newReminder);
    return newReminder;
  }

  async updateReminder(
    id: number,
    reminderUpdate: Partial<Reminder>
  ): Promise<Reminder | undefined> {
    const existingReminder = this.reminders.get(id);
    if (!existingReminder) return undefined;

    const updatedReminder = { ...existingReminder, ...reminderUpdate };
    this.reminders.set(id, updatedReminder);
    return updatedReminder;
  }

  async deleteReminder(id: number): Promise<boolean> {
    return this.reminders.delete(id);
  }

  // Metodi per le transazioni
  async getTransaction(id: number): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  async getTransactions(options?: {
    filters?: {
      type?: string;
      category?: string;
      startDate?: Date;
      endDate?: Date;
      paymentMethod?: string;
      search?: string;
    };
    pagination?: {
      page: number;
      limit: number;
    };
  }): Promise<PaginatedResult<Transaction>> {
    let results = Array.from(this.transactions.values());

    // Applica i filtri se definiti
    if (options?.filters) {
      const filters = options.filters;

      if (filters.type) {
        results = results.filter(
          (transaction) => transaction.type === filters.type
        );
      }

      if (filters.category) {
        results = results.filter(
          (transaction) => transaction.category === filters.category
        );
      }

      if (filters.paymentMethod) {
        results = results.filter(
          (transaction) => transaction.paymentMethod === filters.paymentMethod
        );
      }

      if (filters.startDate) {
        results = results.filter(
          (transaction) => transaction.date >= filters.startDate
        );
      }

      if (filters.endDate) {
        results = results.filter(
          (transaction) => transaction.date <= filters.endDate
        );
      }

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        results = results.filter(
          (transaction) =>
            transaction.description.toLowerCase().includes(searchLower) ||
            (transaction.reference &&
              transaction.reference.toLowerCase().includes(searchLower)) ||
            (transaction.notes &&
              transaction.notes.toLowerCase().includes(searchLower))
        );
      }
    }

    // Ordina le transazioni per data (più recenti prima)
    results.sort((a, b) => b.date.getTime() - a.date.getTime());

    // Applica la paginazione
    const page = options?.pagination?.page || 1;
    const limit = options?.pagination?.limit || 50;
    const offset = (page - 1) * limit;
    const paginatedItems = results.slice(offset, offset + limit);

    // Calcola il numero totale di pagine
    const total = results.length;
    const totalPages = Math.ceil(total / limit);

    return {
      items: paginatedItems,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async createTransaction(
    transaction: InsertTransaction
  ): Promise<Transaction> {
    const id = this.transactionCurrentId++;
    const newTransaction: Transaction = {
      ...transaction,
      id,
      createdAt: new Date(),
    };
    this.transactions.set(id, newTransaction);
    return newTransaction;
  }

  async updateTransaction(
    id: number,
    transactionUpdate: Partial<Transaction>
  ): Promise<Transaction | undefined> {
    const existingTransaction = this.transactions.get(id);
    if (!existingTransaction) return undefined;

    const updatedTransaction = { ...existingTransaction, ...transactionUpdate };
    this.transactions.set(id, updatedTransaction);
    return updatedTransaction;
  }

  async deleteTransaction(id: number): Promise<boolean> {
    return this.transactions.delete(id);
  }

  // Metodi per le transazioni programmate
  async getScheduledTransaction(
    id: number
  ): Promise<ScheduledTransaction | undefined> {
    return this.scheduledTransactions.get(id);
  }

  async getScheduledTransactions(options?: {
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
  }): Promise<PaginatedResult<ScheduledTransaction>> {
    let results = Array.from(this.scheduledTransactions.values());

    // Applica i filtri se definiti
    if (options?.filters) {
      const filters = options.filters;

      if (filters.type) {
        results = results.filter(
          (transaction) => transaction.type === filters.type
        );
      }

      if (filters.status) {
        results = results.filter(
          (transaction) => transaction.status === filters.status
        );
      }

      if (filters.isRecurring !== undefined) {
        results = results.filter(
          (transaction) => transaction.isRecurring === filters.isRecurring
        );
      }

      if (filters.startDate) {
        results = results.filter(
          (transaction) => transaction.dueDate >= filters.startDate
        );
      }

      if (filters.endDate) {
        results = results.filter(
          (transaction) => transaction.dueDate <= filters.endDate
        );
      }

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        results = results.filter(
          (transaction) =>
            transaction.description.toLowerCase().includes(searchLower) ||
            (transaction.reference &&
              transaction.reference.toLowerCase().includes(searchLower)) ||
            (transaction.notes &&
              transaction.notes.toLowerCase().includes(searchLower))
        );
      }
    }

    // Ordina le transazioni per data di scadenza
    results.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

    // Applica la paginazione
    const page = options?.pagination?.page || 1;
    const limit = options?.pagination?.limit || 50;
    const offset = (page - 1) * limit;
    const paginatedItems = results.slice(offset, offset + limit);

    // Calcola il numero totale di pagine
    const total = results.length;
    const totalPages = Math.ceil(total / limit);

    return {
      items: paginatedItems,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async createScheduledTransaction(
    scheduledTransaction: InsertScheduledTransaction
  ): Promise<ScheduledTransaction> {
    const id = this.scheduledTransactionCurrentId++;
    const newScheduledTransaction: ScheduledTransaction = {
      ...scheduledTransaction,
      id,
      createdAt: new Date(),
      lastNotificationSent: null,
    };
    this.scheduledTransactions.set(id, newScheduledTransaction);
    return newScheduledTransaction;
  }

  async updateScheduledTransaction(
    id: number,
    scheduledTransactionUpdate: Partial<ScheduledTransaction>
  ): Promise<ScheduledTransaction | undefined> {
    const existingScheduledTransaction = this.scheduledTransactions.get(id);
    if (!existingScheduledTransaction) return undefined;

    const updatedScheduledTransaction = {
      ...existingScheduledTransaction,
      ...scheduledTransactionUpdate,
    };
    this.scheduledTransactions.set(id, updatedScheduledTransaction);
    return updatedScheduledTransaction;
  }

  async deleteScheduledTransaction(id: number): Promise<boolean> {
    return this.scheduledTransactions.delete(id);
  }

  async getUpcomingScheduledTransactions(
    daysAhead: number
  ): Promise<ScheduledTransaction[]> {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + daysAhead);

    // Filtra le transazioni programmate che sono in scadenza nei prossimi X giorni
    // e che hanno stato "pending"
    const upcomingTransactions = Array.from(
      this.scheduledTransactions.values()
    ).filter(
      (transaction) =>
        transaction.status === "pending" &&
        transaction.dueDate >= today &&
        transaction.dueDate <= futureDate
    );

    // Ordina per data di scadenza (prima le più imminenti)
    return upcomingTransactions.sort(
      (a, b) => a.dueDate.getTime() - b.dueDate.getTime()
    );
  }
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    // Per ora utilizziamo un MemoryStore per le sessioni
    // In un ambiente di produzione, si dovrebbe usare un modulo MySQL per le sessioni
    const MemoryStore = memorystore(session);
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const query = `SELECT * FROM users WHERE id = ?`;
    const result: any = await db.execute(query, [id]);

    if (Array.isArray(result) && result.length > 0) {
      console.log("Utente trovato:", result[0]); // Log del risultato per debug
      return Array.isArray(result) && result.length > 0
        ? (result[0] as User) // Cast result[0] to User
        : undefined; // Restituisci undefined se non ci sono risultati
    } else {
      console.log("Nessun utente trovato con ID:", id); // Log nel caso non ci siano risultati
      return undefined; // Nessun risultato
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const query = `SELECT * FROM users WHERE username = ? LIMIT 1`;

    try {
      // Eseguiamo la query utilizzando db.execute
      const results = await db.execute(query, [username]);

      // Verifica il tipo di risultato
      if (Array.isArray(results)) {
        //console.log("Risultati della query:", results);
        return Array.isArray(results) && results.length > 0
          ? (results[0] as User)
          : undefined;
      } else {
        console.error(
          "La query non ha restituito un array. Risultato:",
          results
        );
        return undefined;
      }
    } catch (error) {
      console.error("Errore durante la ricerca dell'utente:", error);
      throw error;
    }
  }

  async createUser(user: InsertUser): Promise<User> {
    const results = await (await db.insert(users)).values(user).returning();
    return results[0];
  }

  // Metodo per ottenere tutti i modelli di veicoli
  async getVehicleModels(): Promise<VehicleModel[]> {
    const query = `SELECT * FROM vehicle_models`;
    try {
      const results = await db.execute(query);
      //console.log(results);
      return results as VehicleModel[];
    } catch (error) {
      console.error("Errore durante l'esecuzione della query", error);
      throw error;
    }
  }

  async getVehicleMakes(): Promise<VehicleMake[]> {
    const query = `SELECT * FROM vehicle_makes`;
    try {
      const results = await db.execute(query);
      //console.log(results);
      return results as VehicleMake[];
    } catch (error) {
      console.error("Errore durante l'esecuzione della query", error);
      throw error;
    }
  }

  // Vehicle Make methods
  async getVehicleMake(id: number): Promise<VehicleMake | undefined> {
    const results = await (await db.select())
      .from(vehicleMakes)
      .where(eq(vehicleMakes.id, id));
    return Array.isArray(results) && results.length > 0
      ? results[0]
      : undefined;
  }

  async createVehicleMake(make: InsertVehicleMake): Promise<VehicleMake> {
    // Esegui l'inserimento
    const insertQuery = await db.insert(vehicleMakes);
    const result = await insertQuery.values(make);

    // Dopo l'inserimento, possiamo usare un altro query per recuperare il record inserito
    const insertedId = result.insertId; // MySQL restituisce l'ID tramite `insertId`

    // Recupera il record inserito usando l'ID
    const newMake = await (await db.select())
      .from(vehicleMakes)
      .where(eq(vehicleMakes.id, insertedId));

    return newMake[0]; // Restituisci il primo elemento trovato
  }

  async updateVehicleMake(
    id: number,
    makeUpdate: Partial<VehicleMake>
  ): Promise<VehicleMake | undefined> {
    const results = await db
      .update(vehicleMakes)
      .set(makeUpdate)
      .where(eq(vehicleMakes.id, id))
      .returning();

    return Array.isArray(results) && results.length > 0
      ? (results[0] as Vehicle)
      : undefined;
  }

  async deleteVehicleMake(id: number): Promise<boolean> {
    // Prima verifichiamo se ci sono modelli collegati a questa marca
    const relatedModels = await (await db.select())
      .from(vehicleModels)
      .where(eq(vehicleModels.makeId, id));

    // Non permettiamo l'eliminazione se ci sono modelli collegati
    if (relatedModels.length > 0) {
      return false;
    }

    const results = await db
      .delete(vehicleMakes)
      .where(eq(vehicleMakes.id, id))
      .returning();

    return results.length > 0;
  }

  // Vehicle Model methods
  async getVehicleModel(id: number): Promise<VehicleModel | undefined> {
    const results = await (await db.select())
      .from(vehicleModels)
      .where(eq(vehicleModels.id, id));
    return (results as any[]).length > 0 ? (results as any[])[0] : undefined;
  }

  async createVehicleModel(model: InsertVehicleModel): Promise<VehicleModel> {
    const results = await (await db.insert(vehicleModels))
      .values(model)
      .returning();
    return results[0];
  }

  async updateVehicleModel(
    id: number,
    modelUpdate: Partial<VehicleModel>
  ): Promise<VehicleModel | undefined> {
    const results = await db
      .update(vehicleModels)
      .set(modelUpdate)
      .where(eq(vehicleModels.id, id))
      .returning();

    return Array.isArray(results) && results.length > 0
      ? results[0]
      : undefined;
  }

  async deleteVehicleModel(id: number): Promise<boolean> {
    // Prima verifichiamo se ci sono veicoli collegati a questo modello
    const relatedVehicles = await (await db.select())
      .from(vehicles)
      .where(eq(vehicles.modelId, id));

    // Non permettiamo l'eliminazione se ci sono veicoli collegati
    if (relatedVehicles.length > 0) {
      return false;
    }

    const results = await db
      .delete(vehicleModels)
      .where(eq(vehicleModels.id, id))
      .returning();

    return results.length > 0;
  }

  async getVehicle(id: number): Promise<Vehicle | undefined> {
    const query = `SELECT * FROM vehicles WHERE id = ?`;
    const result: any = await db.execute(query, [id]);

    if (Array.isArray(result) && result.length > 0) {
      const vehicle = result[0] as Vehicle;

      // Se il campo image è una stringa JSON, facciamo il parsing
      if (vehicle.images) {
        try {
          vehicle.images =
            typeof vehicle.images === "string"
              ? JSON.parse(vehicle.images)
              : [];
        } catch (error) {
          console.warn("Errore nel parsing del campo image:", error);
          vehicle.images = [];
        }
      } else {
        vehicle.images = [];
      }

      return vehicle;
    }

    return undefined;
  }

  async getVehicles(options: {
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
  }): Promise<Vehicle[]> {
    let query = `SELECT * FROM vehicles`; // Query di base per ottenere tutti i veicoli

    const { filters, pagination } = options;
    const conditions: string[] = []; // Array per memorizzare le condizioni WHERE dinamiche

    // Aggiungi le condizioni in base ai filtri
    if (filters) {
      if (filters.status) {
        conditions.push(`status = ?`);
      }

      if (filters.condition) {
        conditions.push(`condition = ?`);
      }

      if (filters.fuelType) {
        conditions.push(`fuel_type = ?`);
      }

      if (filters.modelId) {
        conditions.push(`model_id = ?`);
      }

      if (filters.makeId) {
        conditions.push(
          `model_id IN (SELECT id FROM models WHERE make_id = ?)`
        );
      }

      if (filters.minPrice !== undefined) {
        conditions.push(`price >= ?`);
      }

      if (filters.maxPrice !== undefined) {
        conditions.push(`price <= ?`);
      }

      if (filters.minYear !== undefined) {
        conditions.push(`year >= ?`);
      }

      if (filters.maxYear !== undefined) {
        conditions.push(`year <= ?`);
      }

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        conditions.push(`(LOWER(vin) LIKE ? OR LOWER(license_plate) LIKE ?)`);
      }
    }

    // Se ci sono condizioni, aggiungile alla query
    if (conditions.length > 0) {
      query = `SELECT * FROM vehicles WHERE ${sql.join(conditions, " AND ")}`;
    }

    // Aggiungi la paginazione (se presente)
    if (pagination) {
      const { page, limit } = pagination;
      const offset = (page - 1) * limit;

      // Modifica la query per includere la paginazione
      query = `${query} LIMIT ${limit} OFFSET ${offset}`;
    }

    try {
      // Esegui la query con i parametri necessari
      const parameters: any[] = [];

      if (filters) {
        if (filters.status) parameters.push(filters.status);
        if (filters.condition) parameters.push(filters.condition);
        if (filters.fuelType) parameters.push(filters.fuelType);
        if (filters.modelId) parameters.push(filters.modelId);
        if (filters.makeId) parameters.push(filters.makeId);
        if (filters.minPrice !== undefined) parameters.push(filters.minPrice);
        if (filters.maxPrice !== undefined) parameters.push(filters.maxPrice);
        if (filters.minYear !== undefined) parameters.push(filters.minYear);
        if (filters.maxYear !== undefined) parameters.push(filters.maxYear);
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          parameters.push(`%${searchLower}%`);
          parameters.push(`%${searchLower}%`);
        }
      }

      // Esegui la query
      const results = await db.execute(query, parameters);
      //console.log("results");
      // console.log(results);

      // Restituisci i risultati come array di veicoli
      return results as Vehicle[]; // Cast a Vehicle[] per il tipo corretto
    } catch (error) {
      console.error("Errore durante l'esecuzione della query:", error);
      console.log(error);
      throw error;
    }
  }

  async saveVehicleImages(
    id: number,
    images: { mainImage: string | null; otherImages: string[] }
  ): Promise<Vehicle | undefined> {
    const { mainImage, otherImages } = images;

    const vehicleDir = path.join("uploads", "vehicles");

    if (!fs.existsSync(vehicleDir)) {
      fs.mkdirSync(vehicleDir, { recursive: true });
    }

    // Costruisci i percorsi completi delle immagini
    const imageUrls = [];

    if (mainImage) {
      imageUrls.push(`${process.env.BASE_URL}uploads/vehicles/${mainImage}`);
    }

    const otherImageUrls = otherImages.map(
      (image) => `${process.env.BASE_URL}uploads/vehicles/${image}`
    );

    imageUrls.push(...otherImageUrls);

    try {
      await db.execute(
        `
        UPDATE vehicles
        SET images = ?
        WHERE id = ?
      `,
        [JSON.stringify(imageUrls), id]
      );

      const updatedVehicle = await this.getVehicle(id);
      return updatedVehicle;
    } catch (error) {
      console.error(
        "Errore nel salvataggio delle immagini del veicolo:",
        error
      );
      throw new Error("Errore nel salvataggio delle immagini del veicolo");
    }
  }

  async saveUserImage(
    id: number,
    images: { profileImage: string | null }
  ): Promise<User | undefined> {
    const { profileImage } = images;

    const usersDir = path.join("uploads", "users");

    if (!fs.existsSync(usersDir)) {
      fs.mkdirSync(usersDir, { recursive: true });
    }

    const imageUrls = `${process.env.BASE_URL}uploads/users/${profileImage}`;

    console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
    console.log(imageUrls);

    try {
      await db.execute(
        `
        UPDATE users
        SET avatar_url = ?
        WHERE id = ?
      `,
        [imageUrls, id]
      );

      const updatedUser = await this.getUser(id);
      return updatedUser;
    } catch (error) {
      console.error("Errore nel salvataggio delle immagini:", error);
      throw new Error("Errore nel salvataggio delle immagini");
    }
  }

  async createVehicle(vehicle: InsertVehicle): Promise<Vehicle> {
    const results = await (await db.insert(vehicles))
      .values(vehicle)
      .returning();
    return results[0];
  }

  async updateVehicle(
    id: number,
    vehicleUpdate: Partial<Vehicle>
  ): Promise<Vehicle | undefined> {
    const results = await db
      .update(vehicles)
      .set(vehicleUpdate)
      .where(eq(vehicles.id, id))
      .returning();

    return results.length > 0 ? results[0] : undefined;
  }

  async deleteVehicle(id: number): Promise<boolean> {
    const results = await db
      .delete(vehicles)
      .where(eq(vehicles.id, id))
      .returning();

    return results.length > 0;
  }

  async searchVehicles(
    searchTerm: string,
    page: number,
    limit: number
  ): Promise<Vehicle[]> {
    // Per PostgreSQL, utilizziamo la funzione ILIKE per una ricerca case-insensitive
    const searchLower = `%${searchTerm.toLowerCase()}%`;

    // Utilizziamo una JOIN per poter cercare anche per marca e modello
    const results = await (
      await db.select({
        vehicle: vehicles,
      })
    )
      .from(vehicles)
      .leftJoin(vehicleModels, eq(vehicles.modelId, vehicleModels.id))
      .leftJoin(vehicleMakes, eq(vehicleModels.makeId, vehicleMakes.id))
      .where(
        // Utilizziamo OR per cercare in più campi
        db.or(
          // Ricerca per targa
          db.sql`LOWER(${vehicles.licensePlate}) ILIKE ${searchLower}`,
          // Ricerca per VIN
          db.sql`LOWER(${vehicles.vin}) ILIKE ${searchLower}`,
          // Ricerca per marca
          db.sql`LOWER(${vehicleMakes.name}) ILIKE ${searchLower}`,
          // Ricerca per modello
          db.sql`LOWER(${vehicleModels.name}) ILIKE ${searchLower}`
        )
      )
      // Paginazione
      .limit(limit)
      .offset((page - 1) * limit);

    // Estraiamo i veicoli dai risultati
    return results.map((r) => r.vehicle);
  }

  // Customer methods
  async getCustomer(id: number): Promise<Customer | undefined> {
    const results = await (await db.select())
      .from(customers)
      .where(eq(customers.id, id));
    return results.length > 0 ? results[0] : undefined;
  }

  async getCustomers(): Promise<Customer[]> {
    return (await db.select()).from(customers);
  }

  async searchCustomers(
    searchTerm: string,
    page: number,
    limit: number
  ): Promise<Customer[]> {
    // Per PostgreSQL, utilizziamo la funzione ILIKE per una ricerca case-insensitive
    const searchLower = `%${searchTerm.toLowerCase()}%`;

    // Ricerca nei campi rilevanti (cognome, nome, telefono, email)
    const results = await (
      await db.select()
    )
      .from(customers)
      .where(
        // Utilizziamo OR per cercare in più campi
        db.or(
          db.sql`LOWER(${customers.lastName}) ILIKE ${searchLower}`,
          db.sql`LOWER(${customers.firstName}) ILIKE ${searchLower}`,
          db.sql`LOWER(${customers.phone}) ILIKE ${searchLower}`,
          db.sql`LOWER(${customers.email}) ILIKE ${searchLower}`
        )
      )
      // Ordinamento alfabetico per cognome
      .orderBy(customers.lastName)
      // Paginazione
      .limit(limit)
      .offset((page - 1) * limit);

    return results;
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const results = await (await db.insert(customers))
      .values(customer)
      .returning();
    return results[0];
  }

  async updateCustomer(
    id: number,
    customerUpdate: Partial<Customer>
  ): Promise<Customer | undefined> {
    const results = await db
      .update(customers)
      .set(customerUpdate)
      .where(eq(customers.id, id))
      .returning();

    return results.length > 0 ? results[0] : undefined;
  }

  // Sale methods
  async getSale(id: number): Promise<Sale | undefined> {
    const results = await (await db.select())
      .from(sales)
      .where(eq(sales.id, id));
    return results.length > 0 ? results[0] : undefined;
  }

  async getSales(): Promise<Sale[]> {
    return (await db.select()).from(sales);
  }

  async getSalesByCustomer(customerId: number): Promise<Sale[]> {
    return (await db.select())
      .from(sales)
      .where(eq(sales.customerId, customerId));
  }

  async createSale(sale: InsertSale): Promise<Sale> {
    const results = await (await db.insert(sales)).values(sale).returning();
    return results[0];
  }

  // Appointment methods
  async getAppointment(id: number): Promise<Appointment | undefined> {
    const results = await (await db.select())
      .from(appointments)
      .where(eq(appointments.id, id));
    return results.length > 0 ? results[0] : undefined;
  }

  async getAppointments(): Promise<Appointment[]> {
    return (await db.select())
      .from(appointments)
      .orderBy(desc(appointments.date));
  }

  async getAppointmentsByCustomer(customerId: number): Promise<Appointment[]> {
    return (await db.select())
      .from(appointments)
      .where(eq(appointments.customerId, customerId))
      .orderBy(desc(appointments.date));
  }

  async createAppointment(
    appointment: InsertAppointment
  ): Promise<Appointment> {
    const results = await (await db.insert(appointments))
      .values(appointment)
      .returning();
    return results[0];
  }

  async updateAppointment(
    id: number,
    appointmentUpdate: Partial<Appointment>
  ): Promise<Appointment | undefined> {
    const results = await db
      .update(appointments)
      .set(appointmentUpdate)
      .where(eq(appointments.id, id))
      .returning();

    return results.length > 0 ? results[0] : undefined;
  }

  // Service methods
  async getService(id: number): Promise<Service | undefined> {
    const results = await (await db.select())
      .from(services)
      .where(eq(services.id, id));
    return results.length > 0 ? results[0] : undefined;
  }

  async createService(service: InsertService): Promise<Service> {
    const results = await (await db.insert(services))
      .values(service)
      .returning();
    return results[0];
  }

  // Part methods
  async getPart(id: number): Promise<Part | undefined> {
    const results = await (await db.select())
      .from(parts)
      .where(eq(parts.id, id));
    return results.length > 0 ? results[0] : undefined;
  }

  async getParts(): Promise<Part[]> {
    return (await db.select()).from(parts);
  }

  async createPart(part: InsertPart): Promise<Part> {
    const results = await (await db.insert(parts)).values(part).returning();
    return results[0];
  }

  async updatePart(
    id: number,
    partUpdate: Partial<Part>
  ): Promise<Part | undefined> {
    const results = await db
      .update(parts)
      .set(partUpdate)
      .where(eq(parts.id, id))
      .returning();

    return results.length > 0 ? results[0] : undefined;
  }

  // Finance methods
  async getFinance(id: number): Promise<Finance | undefined> {
    const results = await (await db.select())
      .from(finances)
      .where(eq(finances.id, id));
    return results.length > 0 ? results[0] : undefined;
  }

  async getFinancesBySale(saleId: number): Promise<Finance[]> {
    return (await db.select())
      .from(finances)
      .where(eq(finances.saleId, saleId));
  }

  async getAllFinances(): Promise<Finance[]> {
    return (await db.select()).from(finances);
  }

  async createFinance(finance: InsertFinance): Promise<Finance> {
    const results = await (await db.insert(finances))
      .values(finance)
      .returning();
    return results[0];
  }

  // Task methods
  async getTask(id: number): Promise<Task | undefined> {
    const results = await (await db.select())
      .from(tasks)
      .where(eq(tasks.id, id));
    return results.length > 0 ? results[0] : undefined;
  }

  async getTasks(): Promise<Task[]> {
    return (await db.select()).from(tasks).orderBy(desc(tasks.createdAt));
  }

  async getTasksByAssignee(userId: number): Promise<Task[]> {
    return (await db.select())
      .from(tasks)
      .where(eq(tasks.assignedTo, userId))
      .orderBy(desc(tasks.createdAt));
  }

  async createTask(task: InsertTask): Promise<Task> {
    const results = await (await db.insert(tasks)).values(task).returning();
    return results[0];
  }

  async updateTask(
    id: number,
    taskUpdate: Partial<Task>
  ): Promise<Task | undefined> {
    const results = await db
      .update(tasks)
      .set(taskUpdate)
      .where(eq(tasks.id, id))
      .returning();

    return results.length > 0 ? results[0] : undefined;
  }

  // Reminder methods
  async getReminder(id: number): Promise<Reminder | undefined> {
    const results = await (await db.select())
      .from(reminders)
      .where(eq(reminders.id, id));
    return results.length > 0 ? results[0] : undefined;
  }

  async getReminders(): Promise<Reminder[]> {
    return (await db.select()).from(reminders).orderBy(desc(reminders.dueDate));
  }

  async getRemindersByVehicle(vehicleId: number): Promise<Reminder[]> {
    return (await db.select())
      .from(reminders)
      .where(eq(reminders.vehicleId, vehicleId))
      .orderBy(desc(reminders.dueDate));
  }

  async getRemindersByCustomer(customerId: number): Promise<Reminder[]> {
    return (await db.select())
      .from(reminders)
      .where(eq(reminders.customerId, customerId))
      .orderBy(desc(reminders.dueDate));
  }

  async getPendingReminders(): Promise<Reminder[]> {
    return (await db.select())
      .from(reminders)
      .where(eq(reminders.isCompleted, false))
      .orderBy(reminders.dueDate);
  }

  async getDueReminders(days: number): Promise<Reminder[]> {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + days);

    return (await db.select())
      .from(reminders)
      .where(
        and(
          eq(reminders.isCompleted, false),
          // dueDate >= now
          db.sql`${reminders.dueDate} >= ${now}`,
          // dueDate <= futureDate
          db.sql`${reminders.dueDate} <= ${futureDate}`
        )
      )
      .orderBy(reminders.dueDate);
  }

  async createReminder(reminder: InsertReminder): Promise<Reminder> {
    const results = await (await db.insert(reminders))
      .values(reminder)
      .returning();
    return results[0];
  }

  async updateReminder(
    id: number,
    reminderUpdate: Partial<Reminder>
  ): Promise<Reminder | undefined> {
    const results = await db
      .update(reminders)
      .set(reminderUpdate)
      .where(eq(reminders.id, id))
      .returning();

    return results.length > 0 ? results[0] : undefined;
  }

  async deleteReminder(id: number): Promise<boolean> {
    const results = await db
      .delete(reminders)
      .where(eq(reminders.id, id))
      .returning();

    return results.length > 0;
  }

  // Metodi per le transazioni
  async getTransaction(id: number): Promise<Transaction | undefined> {
    const results = await (await db.select())
      .from(transactions)
      .where(eq(transactions.id, id));

    return results.length > 0 ? results[0] : undefined;
  }

  async getTransactions(options?: {
    filters?: {
      type?: string;
      category?: string;
      startDate?: Date;
      endDate?: Date;
      paymentMethod?: string;
      search?: string;
    };
    pagination?: {
      page: number;
      limit: number;
    };
  }): Promise<PaginatedResult<Transaction>> {
    let query = (await db.select()).from(transactions);

    // Applica i filtri se definiti
    if (options?.filters) {
      const filters = options.filters;

      if (filters.type) {
        query = query.where(eq(transactions.type, filters.type));
      }

      if (filters.category) {
        query = query.where(eq(transactions.category, filters.category));
      }

      if (filters.paymentMethod) {
        query = query.where(
          eq(transactions.paymentMethod, filters.paymentMethod)
        );
      }

      if (filters.startDate) {
        query = query.where(gte(transactions.date, filters.startDate));
      }

      if (filters.endDate) {
        query = query.where(lte(transactions.date, filters.endDate));
      }

      if (filters.search) {
        const searchLower = `%${filters.search.toLowerCase()}%`;
        query = query.where(
          db.or(
            db.sql`LOWER(${transactions.description}) ILIKE ${searchLower}`,
            db.sql`LOWER(${transactions.reference}) ILIKE ${searchLower}`,
            db.sql`LOWER(${transactions.notes}) ILIKE ${searchLower}`
          )
        );
      }
    }

    // Conteggio totale risultati per la paginazione
    const countQuery = (await db.select({ count: sql`count(*)`.as("count") }))
      .from(transactions)
      .as("count_query");

    const [{ count }] = await (
      await db.select({ count: countQuery.count })
    ).from(countQuery);
    const total = Number(count);

    // Applica ordinamento e paginazione
    const page = options?.pagination?.page || 1;
    const limit = options?.pagination?.limit || 50;
    const offset = (page - 1) * limit;

    query = query.orderBy(desc(transactions.date)).limit(limit).offset(offset);

    const items = await query;
    const totalPages = Math.ceil(total / limit);

    return {
      items,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async createTransaction(
    transaction: InsertTransaction
  ): Promise<Transaction> {
    const results = await (await db.insert(transactions))
      .values(transaction)
      .returning();

    return results[0];
  }

  async updateTransaction(
    id: number,
    transactionUpdate: Partial<Transaction>
  ): Promise<Transaction | undefined> {
    const results = await db
      .update(transactions)
      .set(transactionUpdate)
      .where(eq(transactions.id, id))
      .returning();

    return results.length > 0 ? results[0] : undefined;
  }

  async deleteTransaction(id: number): Promise<boolean> {
    const results = await db
      .delete(transactions)
      .where(eq(transactions.id, id))
      .returning();

    return results.length > 0;
  }

  // Metodi per le transazioni programmate
  async getScheduledTransaction(
    id: number
  ): Promise<ScheduledTransaction | undefined> {
    const results = await (await db.select())
      .from(scheduledTransactions)
      .where(eq(scheduledTransactions.id, id));

    return results.length > 0 ? results[0] : undefined;
  }

  async getScheduledTransactions(options?: {
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
  }): Promise<PaginatedResult<ScheduledTransaction>> {
    let query = (await db.select()).from(scheduledTransactions);

    // Applica i filtri se definiti
    if (options?.filters) {
      const filters = options.filters;

      if (filters.type) {
        query = query.where(eq(scheduledTransactions.type, filters.type));
      }

      if (filters.status) {
        query = query.where(eq(scheduledTransactions.status, filters.status));
      }

      if (filters.isRecurring !== undefined) {
        query = query.where(
          eq(scheduledTransactions.isRecurring, filters.isRecurring)
        );
      }

      if (filters.startDate) {
        query = query.where(
          gte(scheduledTransactions.dueDate, filters.startDate)
        );
      }

      if (filters.endDate) {
        query = query.where(
          lte(scheduledTransactions.dueDate, filters.endDate)
        );
      }

      if (filters.search) {
        const searchLower = `%${filters.search.toLowerCase()}%`;
        query = query.where(
          db.or(
            db.sql`LOWER(${scheduledTransactions.description}) ILIKE ${searchLower}`,
            db.sql`LOWER(${scheduledTransactions.reference}) ILIKE ${searchLower}`,
            db.sql`LOWER(${scheduledTransactions.notes}) ILIKE ${searchLower}`
          )
        );
      }
    }

    // Conteggio totale risultati per la paginazione
    const countQuery = (await db.select({ count: sql`count(*)`.as("count") }))
      .from(scheduledTransactions)
      .as("count_query");

    const [{ count }] = await (
      await db.select({ count: countQuery.count })
    ).from(countQuery);
    const total = Number(count);

    // Applica ordinamento e paginazione
    const page = options?.pagination?.page || 1;
    const limit = options?.pagination?.limit || 50;
    const offset = (page - 1) * limit;

    query = query
      .orderBy(asc(scheduledTransactions.dueDate))
      .limit(limit)
      .offset(offset);

    const items = await query;
    const totalPages = Math.ceil(total / limit);

    return {
      items,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async createScheduledTransaction(
    scheduledTransaction: InsertScheduledTransaction
  ): Promise<ScheduledTransaction> {
    const results = await (await db.insert(scheduledTransactions))
      .values(scheduledTransaction)
      .returning();

    return results[0];
  }

  async updateScheduledTransaction(
    id: number,
    scheduledTransactionUpdate: Partial<ScheduledTransaction>
  ): Promise<ScheduledTransaction | undefined> {
    const results = await db
      .update(scheduledTransactions)
      .set(scheduledTransactionUpdate)
      .where(eq(scheduledTransactions.id, id))
      .returning();

    return results.length > 0 ? results[0] : undefined;
  }

  async deleteScheduledTransaction(id: number): Promise<boolean> {
    const results = await db
      .delete(scheduledTransactions)
      .where(eq(scheduledTransactions.id, id))
      .returning();

    return results.length > 0;
  }

  async getUpcomingScheduledTransactions(
    daysAhead: number
  ): Promise<ScheduledTransaction[]> {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + daysAhead);

    const results = await (
      await db.select()
    )
      .from(scheduledTransactions)
      .where(
        and(
          eq(scheduledTransactions.status, "pending"),
          gte(scheduledTransactions.dueDate, today),
          lte(scheduledTransactions.dueDate, futureDate)
        )
      )
      .orderBy(asc(scheduledTransactions.dueDate));

    return results;
  }

  // Supplier methods
  async getSupplier(id: number): Promise<Supplier | undefined> {
    const results = await (await db.select())
      .from(suppliers)
      .where(eq(suppliers.id, id));
    return results.length > 0 ? results[0] : undefined;
  }

  async getSuppliers(activeOnly: boolean = false): Promise<Supplier[]> {
    if (activeOnly) {
      return (await db.select())
        .from(suppliers)
        .where(eq(suppliers.isActive, true));
    }
    return (await db.select()).from(suppliers);
  }

  async createSupplier(supplier: InsertSupplier): Promise<Supplier> {
    const results = await (await db.insert(suppliers))
      .values(supplier)
      .returning();
    return results[0];
  }

  async updateSupplier(
    id: number,
    supplierUpdate: Partial<Supplier>
  ): Promise<Supplier | undefined> {
    const results = await db
      .update(suppliers)
      .set(supplierUpdate)
      .where(eq(suppliers.id, id))
      .returning();

    return results.length > 0 ? results[0] : undefined;
  }

  async deleteSupplier(id: number): Promise<boolean> {
    // Verifica se ci sono parti collegate a questo fornitore
    const relatedParts = await (await db.select({ id: parts.id }))
      .from(parts)
      .where(eq(parts.supplierId, id));

    // Non permettiamo l'eliminazione se ci sono parti associate
    if (relatedParts.length > 0) {
      return false;
    }

    const results = await db
      .delete(suppliers)
      .where(eq(suppliers.id, id))
      .returning();

    return results.length > 0;
  }

  // Advanced Part methods
  async getParts(options?: {
    filters?: {
      category?: string;
      supplierId?: number;
      status?: string;
      lowStock?: boolean;
      search?: string;
    };
    pagination?: {
      page: number;
      limit: number;
    };
  }): Promise<{
    data: Part[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    let query = (await db.select()).from(parts);

    // Applica i filtri se presenti
    if (options?.filters) {
      const filters = options.filters;

      if (filters.category) {
        query = query.where(eq(parts.category, filters.category));
      }

      if (filters.supplierId) {
        query = query.where(eq(parts.supplierId, filters.supplierId));
      }

      if (filters.status) {
        query = query.where(eq(parts.status, filters.status));
      }

      if (filters.lowStock) {
        // Le parti in cui la quantità è inferiore o uguale alla soglia minima
        query = query.where(
          sql`${parts.stockQuantity} <= ${parts.minQuantity}`
        );
      }

      if (filters.search) {
        const searchTerm = `%${filters.search}%`;
        query = query.where(
          or(
            like(parts.name, searchTerm),
            like(parts.partNumber, searchTerm),
            like(parts.description || "", searchTerm)
          )
        );
      }
    }

    // Copia della query per contare il totale degli elementi
    const countQuery = query;

    // Conteggio totale delle parti con i filtri applicati
    const totalCountResult = await (
      await db.select({ count: sql`count(*)`.as("count") })
    ).from(countQuery.as("filtered_parts"));
    const totalCount = Number(totalCountResult[0].count);

    // Applica paginazione se richiesta
    const page = options?.pagination?.page || 1;
    const limit = options?.pagination?.limit || 10;
    const offset = (page - 1) * limit;

    // Ordina per ID e applica paginazione
    query = query.orderBy(parts.id).limit(limit).offset(offset);

    // Esegui la query
    const data = await query;

    // Calcola il numero totale di pagine
    const totalPages = Math.ceil(totalCount / limit);

    return {
      data,
      total: totalCount,
      page,
      limit,
      totalPages,
    };
  }

  async updatePart(
    id: number,
    partUpdate: Partial<Part>
  ): Promise<Part | undefined> {
    const results = await db
      .update(parts)
      .set(partUpdate)
      .where(eq(parts.id, id))
      .returning();

    return results.length > 0 ? results[0] : undefined;
  }

  async deletePart(id: number): Promise<boolean> {
    // Verifica se ci sono elementi di ordine collegati a questa parte
    const relatedOrderItems = await (await db.select({ id: partOrderItems.id }))
      .from(partOrderItems)
      .where(eq(partOrderItems.partId, id));

    // Non permettiamo l'eliminazione se ci sono elementi di ordine associati
    if (relatedOrderItems.length > 0) {
      return false;
    }

    const results = await db.delete(parts).where(eq(parts.id, id)).returning();

    return results.length > 0;
  }

  async updatePartStock(
    id: number,
    quantity: number
  ): Promise<Part | undefined> {
    const part = await this.getPart(id);
    if (!part) return undefined;

    const newQuantity = part.stockQuantity + quantity;

    // Aggiorna la quantità e lo stato se necessario
    let updates: Partial<Part> = {
      stockQuantity: newQuantity,
    };

    // Aggiorna lo stato in base alla nuova quantità
    if (newQuantity <= 0) {
      updates.status = "out_of_stock";
    } else if (newQuantity <= part.minQuantity) {
      updates.status = "low_stock";
    } else {
      updates.status = "active";
    }

    return this.updatePart(id, updates);
  }

  async getLowStockParts(): Promise<Part[]> {
    const response = await this.getParts({
      filters: {
        lowStock: true,
      },
    });
    return response.data;
  }

  // Part Order methods
  async getPartOrder(id: number): Promise<PartOrder | undefined> {
    const results = await (await db.select())
      .from(partOrders)
      .where(eq(partOrders.id, id));
    return results.length > 0 ? results[0] : undefined;
  }

  async getPartOrders(status?: string): Promise<PartOrder[]> {
    if (status) {
      return (await db.select())
        .from(partOrders)
        .where(eq(partOrders.status, status));
    }
    return (await db.select()).from(partOrders);
  }

  async createPartOrder(order: InsertPartOrder): Promise<PartOrder> {
    const results = await (await db.insert(partOrders))
      .values(order)
      .returning();
    return results[0];
  }

  async updatePartOrder(
    id: number,
    orderUpdate: Partial<PartOrder>
  ): Promise<PartOrder | undefined> {
    const results = await db
      .update(partOrders)
      .set(orderUpdate)
      .where(eq(partOrders.id, id))
      .returning();

    return results.length > 0 ? results[0] : undefined;
  }

  async deletePartOrder(id: number): Promise<boolean> {
    // Verifica se ci sono elementi di ordine collegati a questo ordine
    const relatedOrderItems = await (await db.select({ id: partOrderItems.id }))
      .from(partOrderItems)
      .where(eq(partOrderItems.orderId, id));

    // Elimina tutti gli elementi prima dell'ordine
    if (relatedOrderItems.length > 0) {
      await db.delete(partOrderItems).where(eq(partOrderItems.orderId, id));
    }

    const results = await db
      .delete(partOrders)
      .where(eq(partOrders.id, id))
      .returning();

    return results.length > 0;
  }

  // Part Order Items methods
  async getPartOrderItems(orderId: number): Promise<PartOrderItem[]> {
    return (await db.select())
      .from(partOrderItems)
      .where(eq(partOrderItems.orderId, orderId));
  }

  async createPartOrderItem(item: InsertPartOrderItem): Promise<PartOrderItem> {
    const results = await (await db.insert(partOrderItems))
      .values(item)
      .returning();
    return results[0];
  }

  async updatePartOrderItem(
    id: number,
    itemUpdate: Partial<PartOrderItem>
  ): Promise<PartOrderItem | undefined> {
    const results = await db
      .update(partOrderItems)
      .set(itemUpdate)
      .where(eq(partOrderItems.id, id))
      .returning();

    return results.length > 0 ? results[0] : undefined;
  }

  async deletePartOrderItem(id: number): Promise<boolean> {
    const results = await db
      .delete(partOrderItems)
      .where(eq(partOrderItems.id, id))
      .returning();

    return results.length > 0;
  }

  async receivePartOrderItems(
    orderId: number,
    items: { id: number; quantityReceived: number }[]
  ): Promise<boolean> {
    // Ottieni l'ordine
    const order = await this.getPartOrder(orderId);
    if (!order) return false;

    // Avvolgi tutte le operazioni in una transazione
    return db.transaction(async (tx) => {
      // Aggiorna ogni elemento dell'ordine
      for (const item of items) {
        // Ottieni l'elemento dell'ordine
        const orderItem = await tx
          .select()
          .from(partOrderItems)
          .where(
            and(
              eq(partOrderItems.id, item.id),
              eq(partOrderItems.orderId, orderId)
            )
          );

        if (orderItem.length === 0) continue;

        // Aggiorna la quantità ricevuta
        await tx
          .update(partOrderItems)
          .set({ quantityReceived: item.quantityReceived })
          .where(eq(partOrderItems.id, item.id));

        // Aggiorna la quantità in magazzino della parte
        const part = await tx
          .select()
          .from(parts)
          .where(eq(parts.id, orderItem[0].partId));

        if (part.length === 0) continue;

        const quantityToAdd =
          item.quantityReceived - orderItem[0].quantityReceived;

        if (quantityToAdd > 0) {
          await tx
            .update(parts)
            .set({
              stockQuantity: part[0].stockQuantity + quantityToAdd,
              lastOrderDate: new Date(),
            })
            .where(eq(parts.id, part[0].id));
        }
      }

      // Verifica se tutti gli elementi sono stati ricevuti
      const allItems = await tx
        .select()
        .from(partOrderItems)
        .where(eq(partOrderItems.orderId, orderId));

      const allReceived = allItems.every(
        (item) => item.quantity === item.quantityReceived
      );
      const anyReceived = allItems.some((item) => item.quantityReceived > 0);

      // Aggiorna lo stato dell'ordine
      let status: string;
      if (allReceived) {
        status = "delivered";
      } else if (anyReceived) {
        status = "partial";
      } else {
        status = order.status;
      }

      // Aggiorna l'ordine solo se lo stato è cambiato
      if (status !== order.status) {
        await tx
          .update(partOrders)
          .set({
            status,
            deliveryDate: allReceived ? new Date() : order.deliveryDate,
          })
          .where(eq(partOrders.id, orderId));
      }

      return true;
    });
  }
}

// Implementazione della fabbrica di storage
// Ora non usiamo più la fabbrica per alternare tra memoria e database
// Usiamo sempre il database per garantire persistenza
export class StorageFactory {
  private static instance: IStorage;
  private static initializationPromise: Promise<IStorage> | null = null;

  static async initialize(): Promise<IStorage> {
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = (async () => {
      if (this.instance) {
        return this.instance;
      }

      try {
        // Verifica connessione al database
        await db.execute(`SELECT 1`);
        console.log("Database connection successful, using DatabaseStorage");
        this.instance = new DatabaseStorage();
      } catch (error) {
        // In caso di errore, forzare sempre l'arresto dell'applicazione
        console.error(
          "Database connection failed. Application cannot start:",
          error
        );
        throw new Error(
          "Database connection failed. Application cannot start without database."
        );
      }

      return this.instance;
    })();

    return this.initializationPromise;
  }

  static get(): IStorage {
    if (this.instance) {
      return this.instance;
    }

    // Se non è ancora inizializzato, inizializza immediatamente
    // Non supportiamo più l'inizializzazione in background
    console.warn("Storage not initialized. Creating database connection now.");
    try {
      // Crea una nuova istanza di DatabaseStorage
      this.instance = new DatabaseStorage();
      // Avvia l'inizializzazione in background per verificare la connessione
      this.initialize().catch((err) => {
        console.error("Database connection failed:", err);
        process.exit(1); // Termina l'applicazione in caso di errore
      });
    } catch (err) {
      console.error("Failed to create database storage:", err);
      process.exit(1);
    }

    return this.instance;
  }
}

// Esporta un'istanza dello storage
// Usiamo sempre il DatabaseStorage per garantire la persistenza dei dati
export const storage: IStorage = new DatabaseStorage();
