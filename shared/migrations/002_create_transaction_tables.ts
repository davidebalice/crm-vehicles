import { pool } from '../../server/db';

/**
 * This migration creates the transactions and scheduled_transactions tables
 * These tables are used for managing financial transactions and recurring/scheduled payments
 */
export async function applyMigration() {
  // Create transactions table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS transactions (
      id SERIAL PRIMARY KEY,
      description TEXT NOT NULL,
      amount DOUBLE PRECISION NOT NULL,
      type TEXT NOT NULL,
      category TEXT NOT NULL,
      date TIMESTAMP NOT NULL,
      payment_method TEXT NOT NULL,
      reference TEXT,
      related_entity_type TEXT,
      related_entity_id INTEGER,
      notes TEXT,
      receipts JSONB,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      created_by INTEGER NOT NULL
    )
  `);

  // Create scheduled_transactions table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS scheduled_transactions (
      id SERIAL PRIMARY KEY,
      description TEXT NOT NULL,
      amount DOUBLE PRECISION NOT NULL,
      type TEXT NOT NULL,
      category TEXT NOT NULL,
      due_date TIMESTAMP NOT NULL,
      payment_method TEXT NOT NULL,
      frequency TEXT,
      is_recurring BOOLEAN NOT NULL DEFAULT FALSE,
      reference TEXT,
      related_entity_type TEXT,
      related_entity_id INTEGER,
      status TEXT NOT NULL DEFAULT 'pending',
      notification_days INTEGER DEFAULT 7,
      last_notification_sent TIMESTAMP,
      notes TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      created_by INTEGER NOT NULL
    )
  `);

  console.log('Migration 002: Created transactions and scheduled_transactions tables');
}