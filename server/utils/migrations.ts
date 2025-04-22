import fs from 'fs';
import path from 'path';
import { executeRawQuery } from '../db';

export class Logger {
  static info(message: string): void {
    console.log(`[INFO] ${message}`);
  }

  static error(message: string, error?: any): void {
    console.error(`[ERROR] ${message}`, error || '');
  }

  static warn(message: string): void {
    console.warn(`[WARN] ${message}`);
  }

  static success(message: string): void {
    console.log(`[SUCCESS] ${message}`);
  }
}

interface MigrationInfo {
  id: number;
  name: string;
  timestamp: Date;
  applied: boolean;
}

// Ensures that the migrations table exists
export const ensureMigrationsTable = async (): Promise<void> => {
  Logger.info('Ensuring migrations table exists...');
  
  try {
    const query = `
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
        applied BOOLEAN NOT NULL DEFAULT TRUE
      )
    `;
    
    await executeRawQuery(query);
    Logger.success('Migrations table is ready');
  } catch (error) {
    Logger.error('Failed to create migrations table', error);
    throw error;
  }
};

// Get list of applied migrations
export const getAppliedMigrations = async (): Promise<string[]> => {
  Logger.info('Getting list of applied migrations...');
  
  try {
    await ensureMigrationsTable();
    
    const result = await executeRawQuery('SELECT name FROM migrations WHERE applied = TRUE ORDER BY id ASC');
    const appliedMigrations = result.rows.map((row: any) => row.name);
    
    Logger.info(`Found ${appliedMigrations.length} applied migrations`);
    return appliedMigrations;
  } catch (error) {
    Logger.error('Failed to get applied migrations', error);
    throw error;
  }
};

// Get all available migrations from the migrations directory
export const getAvailableMigrations = (): string[] => {
  const migrationsDir = path.join(process.cwd(), 'migrations');
  Logger.info(`Looking for migrations in ${migrationsDir}`);
  
  if (!fs.existsSync(migrationsDir)) {
    Logger.warn('Migrations directory does not exist');
    return [];
  }
  
  const files = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort();
  
  Logger.info(`Found ${files.length} migration files`);
  return files;
};

// Record a migration as applied
export const recordMigration = async (name: string): Promise<void> => {
  Logger.info(`Recording migration: ${name}`);
  
  try {
    await executeRawQuery('INSERT INTO migrations (name) VALUES ($1)', [name]);
    Logger.success(`Migration ${name} recorded as applied`);
  } catch (error) {
    Logger.error(`Failed to record migration ${name}`, error);
    throw error;
  }
};

// Apply a specific migration
export const applyMigration = async (name: string): Promise<void> => {
  const migrationsDir = path.join(process.cwd(), 'migrations');
  const migrationPath = path.join(migrationsDir, name);
  
  Logger.info(`Applying migration: ${name}`);
  
  try {
    // Read migration SQL content
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute migration SQL
    await executeRawQuery(sql);
    
    // Record migration as applied
    await recordMigration(name);
    
    Logger.success(`Migration ${name} applied successfully`);
  } catch (error) {
    Logger.error(`Failed to apply migration ${name}`, error);
    throw error;
  }
};

// Run all pending migrations
export const runMigrations = async (): Promise<void> => {
  Logger.info('Running pending migrations...');
  
  try {
    const appliedMigrations = await getAppliedMigrations();
    const availableMigrations = getAvailableMigrations();
    
    const pendingMigrations = availableMigrations.filter(
      migration => !appliedMigrations.includes(migration)
    );
    
    if (pendingMigrations.length === 0) {
      Logger.info('No pending migrations to apply');
      return;
    }
    
    Logger.info(`Found ${pendingMigrations.length} pending migrations to apply`);
    
    for (const migration of pendingMigrations) {
      await applyMigration(migration);
    }
    
    Logger.success('All pending migrations applied successfully');
  } catch (error) {
    Logger.error('Migration process failed', error);
    throw error;
  }
};

// Generate a new migration file
export const generateMigration = (name: string): string => {
  const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0];
  const fileName = `${timestamp}_${name}.sql`;
  const migrationPath = path.join(process.cwd(), 'migrations', fileName);
  
  Logger.info(`Generating new migration: ${fileName}`);
  
  // Ensure migrations directory exists
  const migrationsDir = path.join(process.cwd(), 'migrations');
  if (!fs.existsSync(migrationsDir)) {
    fs.mkdirSync(migrationsDir, { recursive: true });
  }
  
  // Create empty migration file
  fs.writeFileSync(migrationPath, `-- Migration: ${name}\n-- Timestamp: ${timestamp}\n\n-- Write your SQL here\n`);
  
  Logger.success(`Migration file created: ${migrationPath}`);
  return fileName;
};
