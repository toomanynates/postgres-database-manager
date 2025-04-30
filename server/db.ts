import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import { loadDatabaseConfig } from './config';
import { createClient } from '@neondatabase/serverless';
import { Logger } from './utils/migrations';

neonConfig.webSocketConstructor = ws;

console.log("Initializing database connection...");

export const getConnectionPool = () => {
  const config = loadDatabaseConfig();
  console.log(`Creating connection pool with config: ${JSON.stringify({
    host: config.host,
    port: config.port,
    database: config.database,
    user: config.username,
    // password is hidden for security
  })}`);

  try {
    return new Pool({ 
      connectionString: config.connectionString || process.env.DATABASE_URL 
    });
  } catch (error) {
    console.error("Failed to create connection pool:", error);
    throw error;
  }
};

// Initialize pool and db client
let poolInstance: Pool;
let dbInstance: ReturnType<typeof drizzle>;

try {
  poolInstance = getConnectionPool();
  dbInstance = drizzle({ client: poolInstance, schema });
  console.log("Database connection established successfully.");
} catch (error) {
  console.error("Failed to establish database connection:", error);
  throw error;
}

export const pool = poolInstance;
export const db = dbInstance;

// Function to test database connection
export const testConnection = async (connectionString: string): Promise<boolean> => {
  console.log("Testing database connection...");
  
  // Check if this is a localhost connection
  const isLocalConnection = connectionString.includes('localhost') || 
                           connectionString.includes('127.0.0.1');
  
  let testPool;
  
  try {
    if (isLocalConnection) {
      // For local connections, use standard pg Pool without WebSockets
      const { Pool: PgPool } = require('pg');
      testPool = new PgPool({ connectionString });
    } else {
      // For remote connections, use the serverless Pool with WebSockets
      testPool = new Pool({ connectionString });
    }
    
    const client = await testPool.connect();
    console.log("Test connection successful");
    client.release();
    await testPool.end();
    return true;
  } catch (error) {
    console.error("Test connection failed:", error);
    if (testPool) {
      try {
        await testPool.end();
      } catch (endError) {
        console.error("Error closing test pool:", endError);
      }
    }
    return false;
  }
};

// Execute raw SQL query
export const executeRawQuery = async (sql: string, params: any[] = []): Promise<any> => {
  console.log(`Executing raw query: ${sql} with params: ${JSON.stringify(params)}`);
  try {
    const result = await pool.query(sql, params);
    console.log(`Query executed successfully. Rows affected: ${result.rowCount}`);
    return result;
  } catch (error) {
    console.error("Failed to execute query:", error);
    throw error;
  }
};

// Close database connection pool
export const closePool = async (): Promise<void> => {
  console.log("Closing database connection pool...");
  await pool.end();
  console.log("Database connection pool closed.");
};
