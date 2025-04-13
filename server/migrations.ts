import path from 'path';
import fs from 'fs';
import { applyMigration as migration001 } from '../shared/migrations/001_finance_remove_saleId_constraint';
import { applyMigration as migration002 } from '../shared/migrations/002_create_transaction_tables';

// Migration registry
const migrations = [
  { id: 1, name: 'Remove Sale ID Constraint from Finances', apply: migration001 },
  { id: 2, name: 'Create Transaction Tables', apply: migration002 }
];

// Function to get the current migration version
async function getCurrentVersion(): Promise<number> {
  try {
    const migrationPath = path.join(process.cwd(), 'migration_version.txt');
    if (fs.existsSync(migrationPath)) {
      const version = parseInt(fs.readFileSync(migrationPath, 'utf8'), 10);
      return isNaN(version) ? 0 : version;
    }
    return 0;
  } catch (error) {
    console.error('Error reading migration version:', error);
    return 0;
  }
}

// Function to save the current migration version
async function saveCurrentVersion(version: number): Promise<void> {
  const migrationPath = path.join(process.cwd(), 'migration_version.txt');
  fs.writeFileSync(migrationPath, version.toString(), 'utf8');
}

// Function to apply all pending migrations
export async function applyMigrations(): Promise<void> {
  try {
    const currentVersion = await getCurrentVersion();
    console.log(`Current database version: ${currentVersion}`);
    
    const pendingMigrations = migrations.filter(m => m.id > currentVersion);
    if (pendingMigrations.length === 0) {
      console.log('No pending migrations to apply');
      return;
    }
    
    console.log(`Applying ${pendingMigrations.length} pending migrations...`);
    
    for (const migration of pendingMigrations) {
      console.log(`Applying migration ${migration.id}: ${migration.name}`);
      await migration.apply();
      await saveCurrentVersion(migration.id);
      console.log(`Migration ${migration.id} applied successfully`);
    }
    
    console.log('All migrations applied successfully');
  } catch (error) {
    console.error('Error applying migrations:', error);
    throw error;
  }
}