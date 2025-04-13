export const VEHICLE_STATUS = {
  available: "Disponibile",
  sold: "Venduto",
  in_maintenance: "In manutenzione",
  reserved: "Prenotato"
};

export const VEHICLE_CONDITION = {
  new: "Nuovo",
  used: "Usato"
};

export const APPOINTMENT_TYPES = {
  test_drive: "Test Drive",
  maintenance: "Tagliando",
  revision: "Revisione",
  scheduled_maintenance: "Manutenzione Programmata",
  other: "Altro"
};

export const APPOINTMENT_STATUS = {
  scheduled: "Programmato",
  completed: "Completato",
  cancelled: "Cancellato"
};

export const SERVICE_STATUS = {
  scheduled: "Programmato",
  in_progress: "In corso",
  completed: "Completato",
  cancelled: "Cancellato"
};

export const TASK_PRIORITY = {
  low: "Bassa",
  medium: "Media",
  high: "Alta"
};

export const TASK_STATUS = {
  pending: "In attesa",
  in_progress: "In corso",
  completed: "Completato"
};

export const PAYMENT_METHODS = {
  cash: "Contanti",
  credit_card: "Carta di credito",
  bank_transfer: "Bonifico bancario",
  finance: "Finanziamento"
};

export const FINANCE_TYPES = {
  loan: "Prestito",
  leasing: "Leasing"
};

export const FINANCE_STATUS = {
  pending: "In attesa",
  approved: "Approvato",
  rejected: "Rifiutato",
  completed: "Completato"
};

export const VEHICLE_MAKES = [
  { id: 1, name: "Audi", type: "car" },
  { id: 2, name: "BMW", type: "car" },
  { id: 3, name: "Mercedes", type: "car" },
  { id: 4, name: "Volkswagen", type: "car" },
  { id: 5, name: "Ducati", type: "motorcycle" },
  { id: 6, name: "Harley Davidson", type: "motorcycle" },
  { id: 7, name: "Honda", type: "motorcycle" },
  { id: 8, name: "Yamaha", type: "motorcycle" }
];

export const TRANSACTION_TYPES = {
  income: "Entrata",
  expense: "Uscita"
};

export const TRANSACTION_CATEGORIES = {
  // Entrate
  sale: "Vendita veicolo",
  service: "Servizio/Riparazione",
  parts_sale: "Vendita ricambi",
  financing: "Finanziamento",
  insurance: "Commissione assicurazione",
  other_income: "Altra entrata",
  
  // Uscite
  vehicle_purchase: "Acquisto veicolo",
  parts_purchase: "Acquisto ricambi",
  salary: "Stipendi",
  rent: "Affitto",
  utilities: "Utenze",
  maintenance: "Manutenzione",
  advertising: "Pubblicità/Marketing",
  taxes: "Tasse",
  insurance_payment: "Assicurazione",
  equipment: "Attrezzature",
  fuel: "Carburante",
  travel: "Trasferte",
  other_expense: "Altra uscita"
};

export const TRANSACTION_PAYMENT_METHODS = {
  cash: "Contanti",
  bank_transfer: "Bonifico bancario",
  credit_card: "Carta di credito/debito",
  check: "Assegno",
  pos: "POS",
  direct_debit: "Addebito diretto",
  digital_payment: "Pagamento digitale"
};

export const TRANSACTION_FREQUENCIES = {
  one_time: "Una tantum",
  weekly: "Settimanale",
  monthly: "Mensile",
  quarterly: "Trimestrale",
  semi_annual: "Semestrale",
  annual: "Annuale"
};
