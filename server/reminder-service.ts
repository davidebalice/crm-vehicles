import { storage } from './storage';
import { emailService } from './email-service';
import { Reminder } from '@shared/schema';

// Intervalli di invio dei promemoria (in giorni)
const REMINDER_INTERVALS = [60, 30, 10, 3]; // 2 mesi, 1 mese, 10 giorni, 3 giorni

/**
 * Classe che gestisce il sistema di promemoria automatici
 */
export class ReminderService {
  // Reso pubblico per consentire il controllo dello stato dai controller
  public scheduledTask: NodeJS.Timeout | null = null;
  
  /**
   * Inizializza il servizio di promemoria
   */
  constructor() {
    console.log('Inizializzazione del servizio di promemoria');
  }
  
  /**
   * Avvia il servizio di promemoria con un intervallo specificato
   * @param intervalMinutes Intervallo in minuti per il controllo dei promemoria
   */
  start(intervalMinutes: number = 60) {
    console.log(`Avvio del servizio di promemoria con intervallo di ${intervalMinutes} minuti`);
    
    // Se c'è già un task schedulato, lo cancelliamo
    if (this.scheduledTask) {
      clearInterval(this.scheduledTask);
    }
    
    // Convertiamo i minuti in millisecondi
    const intervalMs = intervalMinutes * 60 * 1000;
    
    // Eseguiamo subito il controllo dei promemoria
    this.checkReminders().catch(err => {
      console.error('Errore nel controllo iniziale dei promemoria:', err);
    });
    
    // Schedula il controllo periodico
    this.scheduledTask = setInterval(() => {
      this.checkReminders().catch(err => {
        console.error('Errore nel controllo periodico dei promemoria:', err);
      });
    }, intervalMs);
    
    console.log(`Servizio di promemoria avviato, prossimo controllo tra ${intervalMinutes} minuti`);
  }
  
  /**
   * Ferma il servizio di promemoria
   */
  stop() {
    if (this.scheduledTask) {
      clearInterval(this.scheduledTask);
      this.scheduledTask = null;
      console.log('Servizio di promemoria fermato');
    }
  }
  
  /**
   * Controlla i promemoria e invia email per quelli in scadenza
   */
  async checkReminders() {
    console.log('Controllo dei promemoria in corso...');
    
    try {
      // Otteniamo tutti i promemoria non completati
      const pendingReminders = await storage.getPendingReminders();
      console.log(`Trovati ${pendingReminders.length} promemoria pendenti`);
      
      // Per ogni promemoria controlliamo se è il momento di inviare una notifica
      for (const reminder of pendingReminders) {
        await this.processReminder(reminder);
      }
      
      console.log('Controllo dei promemoria completato');
    } catch (error) {
      console.error('Errore durante il controllo dei promemoria:', error);
      throw error;
    }
  }
  
  /**
   * Elabora un singolo promemoria
   * @param reminder Il promemoria da elaborare
   */
  private async processReminder(reminder: Reminder) {
    try {
      const now = new Date();
      const dueDate = new Date(reminder.dueDate);
      
      // Calcola giorni rimanenti alla scadenza
      const daysRemaining = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      console.log(`Promemoria #${reminder.id}: ${daysRemaining} giorni rimanenti alla scadenza`);
      
      // Se la scadenza è già passata, non fare nulla
      if (daysRemaining < 0) {
        return;
      }
      
      // Determina se dobbiamo inviare una notifica in base agli intervalli
      const shouldSendNotification = REMINDER_INTERVALS.includes(daysRemaining);
      
      if (shouldSendNotification) {
        // Verifichiamo che questo intervallo non sia già stato notificato
        if (this.hasIntervalBeenNotified(reminder, daysRemaining)) {
          console.log(`Promemoria #${reminder.id}: notifica per ${daysRemaining} giorni già inviata`);
          return;
        }
        
        // Ottieni i dati del cliente per l'email
        const customer = await storage.getCustomer(reminder.customerId);
        if (!customer || !customer.email) {
          console.warn(`Promemoria #${reminder.id}: cliente #${reminder.customerId} non trovato o senza email`);
          return;
        }
        
        // Invia l'email di promemoria
        console.log(`Invio notifica per promemoria #${reminder.id} a ${customer.email} (${daysRemaining} giorni rimanenti)`);
        const emailSent = await emailService.sendReminderEmail(reminder, customer.email);
        
        if (emailSent) {
          // Aggiorna il promemoria con l'informazione dell'invio
          await storage.updateReminder(reminder.id, {
            notificationsSent: reminder.notificationsSent + 1,
            lastNotificationSent: new Date()
          });
          console.log(`Promemoria #${reminder.id}: email inviata con successo`);
        } else {
          console.error(`Promemoria #${reminder.id}: invio email fallito`);
        }
      }
    } catch (error) {
      console.error(`Errore durante l'elaborazione del promemoria #${reminder.id}:`, error);
    }
  }
  
  /**
   * Verifica se una notifica è già stata inviata per un particolare intervallo
   * @param reminder Il promemoria da verificare
   * @param daysRemaining I giorni rimanenti alla scadenza
   * @returns true se la notifica è già stata inviata, false altrimenti
   */
  private hasIntervalBeenNotified(reminder: Reminder, daysRemaining: number): boolean {
    // Se non è mai stata inviata una notifica, sicuramente non è stata notificata per questo intervallo
    if (!reminder.lastNotificationSent || reminder.notificationsSent === 0) {
      return false;
    }
    
    // Calcola quanti giorni fa è stata inviata l'ultima notifica
    const lastNotificationDate = new Date(reminder.lastNotificationSent);
    const now = new Date();
    const daysSinceLastNotification = Math.ceil((now.getTime() - lastNotificationDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Se l'ultima notifica è stata inviata più di 24 ore fa, potrebbe essere relativa a un altro intervallo
    if (daysSinceLastNotification >= 1) {
      return false;
    }
    
    // Se siamo arrivati qui, significa che l'ultima notifica è stata inviata nelle ultime 24 ore
    // e potrebbe essere relativa all'intervallo corrente
    return true;
  }
}

// Istanza singleton del servizio di promemoria
export const reminderService = new ReminderService();