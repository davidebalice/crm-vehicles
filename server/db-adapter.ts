import { db, pool } from './db';
import * as schema from '../shared/schema';

// Interfaccia comune per adattatori di database
export interface IDatabase {
  execute(query: string, params?: any[]): Promise<any>;
  query(query: string, params?: any[]): Promise<any>;
  getORM(): any;
}

// Implementazione PostgreSQL
export class PostgreSQLAdapter implements IDatabase {
  async execute(query: string, params?: any[]): Promise<any> {
    try {
      const client = await pool.connect();
      try {
        const result = await client.query(query, params);
        return result.rows;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('PostgreSQL execute error:', error);
      throw error;
    }
  }

  async query(query: string, params?: any[]): Promise<any> {
    try {
      const client = await pool.connect();
      try {
        const result = await client.query(query, params);
        return result.rows;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('PostgreSQL query error:', error);
      throw error;
    }
  }

  getORM() {
    return db;
  }
}

// Factory per la creazione dell'implementazione corretta
export class DatabaseFactory {
  private static instance: IDatabase;

  static getDatabase(): IDatabase {
    if (!this.instance) {
      this.instance = new PostgreSQLAdapter();
    }
    return this.instance;
  }
}

// Funzione helper per ottenere l'istanza corrente
export function getDB(): IDatabase {
  return DatabaseFactory.getDatabase();
}

// Funzione helper per ottenere l'ORM
export function getORM() {
  return getDB().getORM();
}