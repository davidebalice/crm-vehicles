import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { Reminder } from '@shared/schema';

// Configurazione dell'interfaccia delle opzioni di invio email
export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

// Interfaccia del servizio email
export interface IEmailService {
  sendEmail(options: EmailOptions): Promise<boolean>;
  sendReminderEmail(reminder: Reminder, customerEmail: string): Promise<boolean>;
}

// Implementazione del servizio email
export class EmailService implements IEmailService {
  private transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo>;
  private fromEmail: string;
  
  constructor() {
    // Verifichiamo che siano impostate le variabili d'ambiente per SMTP
    if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || 
        !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn('Configurazione SMTP incompleta. Le email non verranno inviate.');
    }
    
    // Configurazione del transporter SMTP
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    
    // Email mittente (default)
    this.fromEmail = process.env.SMTP_FROM || 'noreply@automotoplus.com';
  }
  
  // Metodo per l'invio di email generiche
  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      if (!process.env.SMTP_HOST) {
        console.warn('Configurazione SMTP non disponibile, email non inviata');
        return false;
      }
      
      const result = await this.transporter.sendMail({
        from: this.fromEmail,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });
      
      console.log(`Email inviata: ${result.messageId}`);
      return true;
    } catch (error) {
      console.error('Errore nell\'invio dell\'email:', error);
      return false;
    }
  }
  
  // Metodo per l'invio di email di promemoria
  async sendReminderEmail(reminder: Reminder, customerEmail: string): Promise<boolean> {
    try {
      const dueDate = new Date(reminder.dueDate);
      const formattedDate = `${dueDate.getDate().toString().padStart(2, '0')}/${(dueDate.getMonth() + 1).toString().padStart(2, '0')}/${dueDate.getFullYear()}`;
      
      // Preparazione del contenuto dell'email
      const subject = `Promemoria: ${reminder.reminderType} - ${formattedDate}`;
      
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #333;">Promemoria ${reminder.reminderType}</h1>
          </div>
          
          <div style="margin-bottom: 30px; padding: 15px; background-color: #f9f9f9; border-radius: 5px;">
            <p>Gentile cliente,</p>
            <p>Le ricordiamo che il <strong>${formattedDate}</strong> è previsto il seguente intervento:</p>
            <p style="font-size: 18px; padding: 10px; background-color: #f0f0f0; border-left: 4px solid #4a90e2;">
              ${reminder.description}
            </p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #666; font-size: 14px;">
            <p>Per qualsiasi informazione o per modificare la data dell'appuntamento, non esiti a contattarci.</p>
            <p>Cordiali saluti,<br>Auto Moto Plus</p>
          </div>
        </div>
      `;
      
      // Testo semplice come alternativa all'HTML
      const textContent = `
        Promemoria: ${reminder.reminderType} - ${formattedDate}
        
        Gentile cliente,
        
        Le ricordiamo che il ${formattedDate} è previsto il seguente intervento:
        ${reminder.description}
        
        Per qualsiasi informazione o per modificare la data dell'appuntamento, non esiti a contattarci.
        
        Cordiali saluti,
        Auto Moto Plus
      `;
      
      // Invio dell'email
      return await this.sendEmail({
        to: customerEmail,
        subject,
        text: textContent,
        html: htmlContent
      });
    } catch (error) {
      console.error('Errore nell\'invio dell\'email di promemoria:', error);
      return false;
    }
  }
}

// Istanza singleton del servizio email
export const emailService = new EmailService();