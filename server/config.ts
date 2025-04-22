import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables from .env file if present
dotenv.config();

interface DbConfig {
  host: string;
  port: string;
  database: string;
  username: string;
  password: string;
  connectionString?: string;
}

const DEFAULT_CONFIG: DbConfig = {
  host: process.env.PGHOST || 'localhost',
  port: process.env.PGPORT || '5432',
  database: process.env.PGDATABASE || 'postgres',
  username: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || '',
  connectionString: process.env.DATABASE_URL,
};

// Function to load database configuration from secrets file
const loadFromSecretsFile = (): DbConfig | null => {
  try {
    const secretsPath = path.join(process.cwd(), 'secrets.json');
    console.log(`Attempting to load secrets from ${secretsPath}`);
    
    if (fs.existsSync(secretsPath)) {
      const secretsContent = fs.readFileSync(secretsPath, 'utf8');
      const secrets = JSON.parse(secretsContent);
      
      console.log('Secrets file found and loaded successfully');
      
      return {
        host: secrets.PGHOST,
        port: secrets.PGPORT,
        database: secrets.PGDATABASE,
        username: secrets.PGUSER,
        password: secrets.PGPASSWORD,
        connectionString: secrets.DATABASE_URL,
      };
    }
    
    console.log('Secrets file not found');
    return null;
  } catch (error) {
    console.error('Failed to load secrets file:', error);
    return null;
  }
};

// Function to save database configuration to secrets file
export const saveToSecretsFile = (config: DbConfig): boolean => {
  try {
    const secretsPath = path.join(process.cwd(), 'secrets.json');
    console.log(`Saving secrets to ${secretsPath}`);
    
    const secrets = {
      PGHOST: config.host,
      PGPORT: config.port,
      PGDATABASE: config.database,
      PGUSER: config.username,
      PGPASSWORD: config.password,
      DATABASE_URL: config.connectionString || `postgresql://${config.username}:${config.password}@${config.host}:${config.port}/${config.database}`,
    };
    
    fs.writeFileSync(secretsPath, JSON.stringify(secrets, null, 2), 'utf8');
    console.log('Secrets saved successfully');
    return true;
  } catch (error) {
    console.error('Failed to save secrets file:', error);
    return false;
  }
};

// Load database configuration from secrets file or fallback to environment variables
export const loadDatabaseConfig = (): DbConfig => {
  const secretsConfig = loadFromSecretsFile();
  
  if (secretsConfig) {
    console.log('Using database configuration from secrets file');
    return secretsConfig;
  }
  
  console.log('Using database configuration from environment variables');
  return DEFAULT_CONFIG;
};

// Generate connection string from config parts
export const generateConnectionString = (config: DbConfig): string => {
  return `postgresql://${config.username}:${config.password}@${config.host}:${config.port}/${config.database}`;
};

// Check if initial setup has been completed
export const isSetupComplete = (): boolean => {
  const secretsConfig = loadFromSecretsFile();
  return !!secretsConfig || !!process.env.DATABASE_URL;
};
