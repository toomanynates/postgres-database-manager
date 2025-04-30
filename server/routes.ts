import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { saveToSecretsFile, loadDatabaseConfig, generateConnectionString } from "./config";
import { testConnection } from "./db";
import { insertConnectionSchema, insertTableSchema, insertColumnSchema } from "@shared/schema";
import { runMigrations, generateMigration } from "./utils/migrations";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  console.log("Registering API routes...");
  
  const httpServer = createServer(app);
  
  // Middleware to parse JSON requests
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
  
  // Health check endpoint
  app.get('/api/health', (req, res) => {
    console.log('Health check requested');
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });
  
  // Setup wizard routes
  app.post('/api/setup/test-connection', async (req, res) => {
    console.log('Testing database connection');
    
    try {
      const connectionData = req.body;
      console.log('Connection data:', {
        host: connectionData.host,
        port: connectionData.port,
        database: connectionData.database,
        username: connectionData.username,
        // Password omitted for security
      });
      
      // Try the standard connection string approach first
      try {
        const connectionString = generateConnectionString(connectionData);
        const isConnected = await testConnection(connectionString);
        
        console.log(`Connection test result: ${isConnected ? 'Success' : 'Failed'}`);
        
        if (isConnected) {
          res.json({ success: true, message: 'Connection successful' });
        } else {
          res.status(400).json({ success: false, message: 'Connection failed' });
        }
      } catch (connError) {
        console.error('Connection test failed with error:', connError);
        res.status(400).json({ 
          success: false, 
          message: `Connection failed: ${(connError as Error).message}` 
        });
      }
    } catch (error) {
      console.error('Connection test error:', error);
      res.status(500).json({ 
        success: false, 
        message: `Connection error: ${(error as Error).message}` 
      });
    }
  });
  
  app.post('/api/setup/save-connection', async (req, res) => {
    console.log('Saving database connection');
    
    try {
      const connectionData = req.body;
      const shouldStoreSecurely = req.body.storeSecurely;
      
      if (shouldStoreSecurely) {
        console.log('Storing connection details in secrets file');
        saveToSecretsFile(connectionData);
      }
      
      // Store connection in the database
      const parsedData = insertConnectionSchema.parse(connectionData);
      const connection = await storage.createConnection(parsedData);
      
      if (req.body.setActive) {
        await storage.activateConnection(connection.id);
      }
      
      console.log('Connection saved successfully');
      res.json({ success: true, connection });
    } catch (error) {
      console.error('Failed to save connection:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: 'Invalid connection data', errors: error.format() });
      } else {
        res.status(500).json({ success: false, message: `Error: ${(error as Error).message}` });
      }
    }
  });
  
  app.get('/api/setup/status', (req, res) => {
    console.log('Checking setup status');
    const config = loadDatabaseConfig();
    const isComplete = !!config.connectionString || (config.host && config.username && config.database);
    
    res.json({ isComplete });
  });
  
  // Database connection routes
  app.get('/api/connections', async (req, res) => {
    console.log('Getting all database connections');
    
    try {
      const connections = await storage.getConnections();
      res.json(connections);
    } catch (error) {
      console.error('Failed to get connections:', error);
      res.status(500).json({ message: `Error: ${(error as Error).message}` });
    }
  });
  
  app.get('/api/connections/active', async (req, res) => {
    console.log('Getting active database connection');
    
    try {
      const connection = await storage.getActiveConnection();
      if (connection) {
        res.json(connection);
      } else {
        res.status(404).json({ message: 'No active connection found' });
      }
    } catch (error) {
      console.error('Failed to get active connection:', error);
      res.status(500).json({ message: `Error: ${(error as Error).message}` });
    }
  });
  
  app.post('/api/connections', async (req, res) => {
    console.log('Creating new database connection');
    
    try {
      const parsedData = insertConnectionSchema.parse(req.body);
      const connection = await storage.createConnection(parsedData);
      res.status(201).json(connection);
    } catch (error) {
      console.error('Failed to create connection:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid connection data', errors: error.format() });
      } else {
        res.status(500).json({ message: `Error: ${(error as Error).message}` });
      }
    }
  });
  
  app.put('/api/connections/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    console.log(`Updating connection with id: ${id}`);
    
    try {
      const connection = await storage.updateConnection(id, req.body);
      if (connection) {
        res.json(connection);
      } else {
        res.status(404).json({ message: 'Connection not found' });
      }
    } catch (error) {
      console.error(`Failed to update connection ${id}:`, error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid connection data', errors: error.format() });
      } else {
        res.status(500).json({ message: `Error: ${(error as Error).message}` });
      }
    }
  });
  
  app.delete('/api/connections/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    console.log(`Deleting connection with id: ${id}`);
    
    try {
      const success = await storage.deleteConnection(id);
      if (success) {
        res.json({ success });
      } else {
        res.status(404).json({ message: 'Connection not found' });
      }
    } catch (error) {
      console.error(`Failed to delete connection ${id}:`, error);
      res.status(500).json({ message: `Error: ${(error as Error).message}` });
    }
  });
  
  app.post('/api/connections/:id/activate', async (req, res) => {
    const id = parseInt(req.params.id);
    console.log(`Activating connection with id: ${id}`);
    
    try {
      const connection = await storage.activateConnection(id);
      if (connection) {
        res.json(connection);
      } else {
        res.status(404).json({ message: 'Connection not found' });
      }
    } catch (error) {
      console.error(`Failed to activate connection ${id}:`, error);
      res.status(500).json({ message: `Error: ${(error as Error).message}` });
    }
  });
  
  // Tables routes - metadata stored in our database
  app.get('/api/connections/:connectionId/stored-tables', async (req, res) => {
    const connectionId = parseInt(req.params.connectionId);
    console.log(`Getting stored tables for connection id: ${connectionId}`);
    
    try {
      const tables = await storage.getTables(connectionId);
      res.json(tables);
    } catch (error) {
      console.error(`Failed to get tables for connection ${connectionId}:`, error);
      res.status(500).json({ message: `Error: ${(error as Error).message}` });
    }
  });
  
  app.post('/api/tables', async (req, res) => {
    console.log('Creating new table');
    
    try {
      const parsedData = insertTableSchema.parse(req.body);
      const table = await storage.createTable(parsedData);
      res.status(201).json(table);
    } catch (error) {
      console.error('Failed to create table:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid table data', errors: error.format() });
      } else {
        res.status(500).json({ message: `Error: ${(error as Error).message}` });
      }
    }
  });
  
  app.put('/api/tables/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    console.log(`Updating table with id: ${id}`);
    
    try {
      const table = await storage.updateTable(id, req.body);
      if (table) {
        res.json(table);
      } else {
        res.status(404).json({ message: 'Table not found' });
      }
    } catch (error) {
      console.error(`Failed to update table ${id}:`, error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid table data', errors: error.format() });
      } else {
        res.status(500).json({ message: `Error: ${(error as Error).message}` });
      }
    }
  });
  
  app.delete('/api/tables/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    console.log(`Deleting table with id: ${id}`);
    
    try {
      const success = await storage.deleteTable(id);
      if (success) {
        res.json({ success });
      } else {
        res.status(404).json({ message: 'Table not found' });
      }
    } catch (error) {
      console.error(`Failed to delete table ${id}:`, error);
      res.status(500).json({ message: `Error: ${(error as Error).message}` });
    }
  });
  
  // Columns routes
  app.get('/api/tables/:tableId/columns', async (req, res) => {
    const tableId = parseInt(req.params.tableId);
    console.log(`Getting columns for table id: ${tableId}`);
    
    try {
      const columns = await storage.getColumns(tableId);
      res.json(columns);
    } catch (error) {
      console.error(`Failed to get columns for table ${tableId}:`, error);
      res.status(500).json({ message: `Error: ${(error as Error).message}` });
    }
  });
  
  app.post('/api/columns', async (req, res) => {
    console.log('Creating new column');
    
    try {
      const parsedData = insertColumnSchema.parse(req.body);
      const column = await storage.createColumn(parsedData);
      res.status(201).json(column);
    } catch (error) {
      console.error('Failed to create column:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid column data', errors: error.format() });
      } else {
        res.status(500).json({ message: `Error: ${(error as Error).message}` });
      }
    }
  });
  
  app.put('/api/columns/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    console.log(`Updating column with id: ${id}`);
    
    try {
      const column = await storage.updateColumn(id, req.body);
      if (column) {
        res.json(column);
      } else {
        res.status(404).json({ message: 'Column not found' });
      }
    } catch (error) {
      console.error(`Failed to update column ${id}:`, error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid column data', errors: error.format() });
      } else {
        res.status(500).json({ message: `Error: ${(error as Error).message}` });
      }
    }
  });
  
  app.delete('/api/columns/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    console.log(`Deleting column with id: ${id}`);
    
    try {
      const success = await storage.deleteColumn(id);
      if (success) {
        res.json({ success });
      } else {
        res.status(404).json({ message: 'Column not found' });
      }
    } catch (error) {
      console.error(`Failed to delete column ${id}:`, error);
      res.status(500).json({ message: `Error: ${(error as Error).message}` });
    }
  });
  
  // Activity logs
  app.get('/api/connections/:connectionId/activity', async (req, res) => {
    const connectionId = parseInt(req.params.connectionId);
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    console.log(`Getting activity logs for connection id: ${connectionId}, limit: ${limit}`);
    
    try {
      const logs = await storage.getActivityLogs(connectionId, limit);
      res.json(logs);
    } catch (error) {
      console.error(`Failed to get activity logs for connection ${connectionId}:`, error);
      res.status(500).json({ message: `Error: ${(error as Error).message}` });
    }
  });
  
  // Settings
  app.get('/api/settings/:key', async (req, res) => {
    const key = req.params.key;
    console.log(`Getting setting with key: ${key}`);
    
    try {
      const setting = await storage.getSetting(key);
      if (setting) {
        res.json(setting);
      } else {
        res.status(404).json({ message: 'Setting not found' });
      }
    } catch (error) {
      console.error(`Failed to get setting ${key}:`, error);
      res.status(500).json({ message: `Error: ${(error as Error).message}` });
    }
  });
  
  app.post('/api/settings', async (req, res) => {
    const { key, value } = req.body;
    console.log(`Setting key: ${key}`);
    
    try {
      const setting = await storage.setSetting(key, value);
      res.json(setting);
    } catch (error) {
      console.error(`Failed to set setting ${key}:`, error);
      res.status(500).json({ message: `Error: ${(error as Error).message}` });
    }
  });
  
  // Raw SQL execution
  app.post('/api/query', async (req, res) => {
    const { connectionId, query, params } = req.body;
    console.log(`Executing raw query for connection id: ${connectionId}`);
    console.log(`Query: ${query}`);
    
    try {
      const result = await storage.executeRawQuery(connectionId, query, params);
      res.json(result);
    } catch (error) {
      console.error('Query execution failed:', error);
      res.status(500).json({ message: `Error: ${(error as Error).message}` });
    }
  });
  
  // Database operations
  app.get('/api/connections/:connectionId/tables', async (req, res) => {
    const connectionId = parseInt(req.params.connectionId);
    console.log(`Fetching database tables for connection id: ${connectionId}`);
    
    try {
      const tables = await storage.fetchDatabaseTables(connectionId);
      res.json(tables);
    } catch (error) {
      console.error(`Failed to fetch tables for connection ${connectionId}:`, error);
      res.status(500).json({ message: `Error: ${(error as Error).message}` });
    }
  });
  
  app.get('/api/connections/:connectionId/tables/:tableName/columns', async (req, res) => {
    const connectionId = parseInt(req.params.connectionId);
    const tableName = req.params.tableName;
    console.log(`Fetching columns for table ${tableName}, connection id: ${connectionId}`);
    
    try {
      const columns = await storage.fetchTableColumns(connectionId, tableName);
      res.json(columns);
    } catch (error) {
      console.error(`Failed to fetch columns for table ${tableName}:`, error);
      res.status(500).json({ message: `Error: ${(error as Error).message}` });
    }
  });
  
  app.get('/api/connections/:connectionId/tables/:tableName/data', async (req, res) => {
    const connectionId = parseInt(req.params.connectionId);
    const tableName = req.params.tableName;
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string) : 10;
    
    console.log(`Fetching data for table ${tableName}, connection id: ${connectionId}, page: ${page}, pageSize: ${pageSize}`);
    
    try {
      const result = await storage.fetchTableData(connectionId, tableName, page, pageSize);
      res.json(result);
    } catch (error) {
      console.error(`Failed to fetch data for table ${tableName}:`, error);
      res.status(500).json({ message: `Error: ${(error as Error).message}` });
    }
  });
  
  app.post('/api/connections/:connectionId/tables/:tableName/rows', async (req, res) => {
    const connectionId = parseInt(req.params.connectionId);
    const tableName = req.params.tableName;
    const data = req.body;
    
    console.log(`Inserting row into table ${tableName}, connection id: ${connectionId}`);
    
    try {
      const result = await storage.insertRow(connectionId, tableName, data);
      res.status(201).json(result);
    } catch (error) {
      console.error(`Failed to insert row into table ${tableName}:`, error);
      res.status(500).json({ message: `Error: ${(error as Error).message}` });
    }
  });
  
  app.put('/api/connections/:connectionId/tables/:tableName/rows/:primaryKey/:primaryKeyValue', async (req, res) => {
    const connectionId = parseInt(req.params.connectionId);
    const tableName = req.params.tableName;
    const primaryKey = req.params.primaryKey;
    const primaryKeyValue = req.params.primaryKeyValue;
    const data = req.body;
    
    console.log(`Updating row in table ${tableName} where ${primaryKey} = ${primaryKeyValue}, connection id: ${connectionId}`);
    
    try {
      const result = await storage.updateRow(connectionId, tableName, primaryKey, primaryKeyValue, data);
      if (result) {
        res.json(result);
      } else {
        res.status(404).json({ message: 'Row not found' });
      }
    } catch (error) {
      console.error(`Failed to update row in table ${tableName}:`, error);
      res.status(500).json({ message: `Error: ${(error as Error).message}` });
    }
  });
  
  app.delete('/api/connections/:connectionId/tables/:tableName/rows/:primaryKey/:primaryKeyValue', async (req, res) => {
    const connectionId = parseInt(req.params.connectionId);
    const tableName = req.params.tableName;
    const primaryKey = req.params.primaryKey;
    const primaryKeyValue = req.params.primaryKeyValue;
    
    console.log(`Deleting row from table ${tableName} where ${primaryKey} = ${primaryKeyValue}, connection id: ${connectionId}`);
    
    try {
      const success = await storage.deleteRow(connectionId, tableName, primaryKey, primaryKeyValue);
      if (success) {
        res.json({ success });
      } else {
        res.status(404).json({ message: 'Row not found' });
      }
    } catch (error) {
      console.error(`Failed to delete row from table ${tableName}:`, error);
      res.status(500).json({ message: `Error: ${(error as Error).message}` });
    }
  });
  
  // Migrations
  app.post('/api/migrations/run', async (req, res) => {
    console.log('Running migrations');
    
    try {
      await runMigrations();
      res.json({ success: true, message: 'Migrations completed successfully' });
    } catch (error) {
      console.error('Failed to run migrations:', error);
      res.status(500).json({ success: false, message: `Error: ${(error as Error).message}` });
    }
  });
  
  app.post('/api/migrations/generate', async (req, res) => {
    const { name } = req.body;
    console.log(`Generating migration: ${name}`);
    
    try {
      const fileName = generateMigration(name);
      res.json({ success: true, fileName });
    } catch (error) {
      console.error('Failed to generate migration:', error);
      res.status(500).json({ success: false, message: `Error: ${(error as Error).message}` });
    }
  });

  return httpServer;
}
