import { pool } from '../../server/db';

/**
 * This migration modifies the finances table to make the sale_id column nullable
 * It's necessary to handle financing requests that don't have an associated sale yet
 */
export async function applyMigration() {
  // Make the sale_id column nullable
  await pool.query(
    `ALTER TABLE finances ALTER COLUMN sale_id DROP NOT NULL`
  );

  console.log('Migration 001: Sale ID constraint removed from finances table');
}