import { applyMigration } from './shared/migrations/002_create_transaction_tables';

async function runMigration() {
  try {
    await applyMigration();
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

runMigration();