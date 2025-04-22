import { 
  users, type User, type InsertUser,
  dbConnections, type DbConnection, type InsertDbConnection,
  dbTables, type DbTable, type InsertDbTable,
  dbColumns, type DbColumn, type InsertDbColumn,
  activityLogs, type ActivityLog, type InsertActivityLog,
  appSettings, type AppSetting, type InsertAppSetting
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";
import { Logger } from "./utils/migrations";

// Storage interface for database operations
export interface IStorage {
  // User methods (original from template)
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // DB Connection methods
  getConnections(): Promise<DbConnection[]>;
  getConnection(id: number): Promise<DbConnection | undefined>;
  createConnection(connection: InsertDbConnection): Promise<DbConnection>;
  updateConnection(id: number, connection: Partial<InsertDbConnection>): Promise<DbConnection | undefined>;
  deleteConnection(id: number): Promise<boolean>;
  testConnection(connection: InsertDbConnection): Promise<boolean>;
  activateConnection(id: number): Promise<DbConnection | undefined>;
  getActiveConnection(): Promise<DbConnection | undefined>;
  
  // Table methods
  getTables(connectionId: number): Promise<DbTable[]>;
  getTable(id: number): Promise<DbTable | undefined>;
  getTableByName(connectionId: number, name: string, schema?: string): Promise<DbTable | undefined>;
  createTable(table: InsertDbTable): Promise<DbTable>;
  updateTable(id: number, table: Partial<InsertDbTable>): Promise<DbTable | undefined>;
  deleteTable(id: number): Promise<boolean>;
  
  // Column methods
  getColumns(tableId: number): Promise<DbColumn[]>;
  getColumn(id: number): Promise<DbColumn | undefined>;
  createColumn(column: InsertDbColumn): Promise<DbColumn>;
  updateColumn(id: number, column: Partial<InsertDbColumn>): Promise<DbColumn | undefined>;
  deleteColumn(id: number): Promise<boolean>;
  
  // Activity Log methods
  createActivityLog(log: InsertActivityLog): Promise<ActivityLog>;
  getActivityLogs(connectionId: number, limit?: number): Promise<ActivityLog[]>;
  
  // App Settings methods
  getSetting(key: string): Promise<AppSetting | undefined>;
  setSetting(key: string, value: any): Promise<AppSetting>;
  
  // Raw SQL execution
  executeRawQuery(connectionId: number, sql: string, params?: any[]): Promise<any>;
  
  // Database schema introspection
  fetchDatabaseTables(connectionId: number): Promise<string[]>;
  fetchTableColumns(connectionId: number, tableName: string): Promise<any[]>;
  fetchTableData(connectionId: number, tableName: string, page?: number, pageSize?: number): Promise<any>;
  
  // Data manipulation operations
  insertRow(connectionId: number, tableName: string, data: Record<string, any>): Promise<any>;
  updateRow(connectionId: number, tableName: string, primaryKey: string, primaryKeyValue: any, data: Record<string, any>): Promise<any>;
  deleteRow(connectionId: number, tableName: string, primaryKey: string, primaryKeyValue: any): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User methods (original from template)
  async getUser(id: number): Promise<User | undefined> {
    console.log(`Getting user with id: ${id}`);
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    console.log(`Getting user with username: ${username}`);
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    console.log(`Creating new user: ${insertUser.username}`);
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
  
  // DB Connection methods
  async getConnections(): Promise<DbConnection[]> {
    console.log('Getting all database connections');
    return await db.select().from(dbConnections);
  }
  
  async getConnection(id: number): Promise<DbConnection | undefined> {
    console.log(`Getting connection with id: ${id}`);
    const [connection] = await db.select().from(dbConnections).where(eq(dbConnections.id, id));
    return connection;
  }
  
  async createConnection(connection: InsertDbConnection): Promise<DbConnection> {
    console.log(`Creating new database connection: ${connection.name}`);
    const [newConnection] = await db
      .insert(dbConnections)
      .values({
        ...connection,
        updatedAt: new Date()
      })
      .returning();
    return newConnection;
  }
  
  async updateConnection(id: number, connection: Partial<InsertDbConnection>): Promise<DbConnection | undefined> {
    console.log(`Updating connection with id: ${id}`);
    const [updatedConnection] = await db
      .update(dbConnections)
      .set({
        ...connection,
        updatedAt: new Date()
      })
      .where(eq(dbConnections.id, id))
      .returning();
    return updatedConnection;
  }
  
  async deleteConnection(id: number): Promise<boolean> {
    console.log(`Deleting connection with id: ${id}`);
    const result = await db
      .delete(dbConnections)
      .where(eq(dbConnections.id, id))
      .returning({ id: dbConnections.id });
    return result.length > 0;
  }
  
  async testConnection(connection: InsertDbConnection): Promise<boolean> {
    // This would use the database module's test connection function
    console.log(`Testing connection to ${connection.host}:${connection.port}/${connection.database}`);
    try {
      // This is a placeholder - in a real implementation, we would need to create a test connection
      // to the provided database
      return true;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }
  
  async activateConnection(id: number): Promise<DbConnection | undefined> {
    console.log(`Activating connection with id: ${id}`);
    // First, deactivate all connections
    await db
      .update(dbConnections)
      .set({ isActive: false })
      .where(eq(dbConnections.isActive, true));
    
    // Then, activate the specified connection
    const [activated] = await db
      .update(dbConnections)
      .set({ isActive: true, updatedAt: new Date() })
      .where(eq(dbConnections.id, id))
      .returning();
    
    return activated;
  }
  
  async getActiveConnection(): Promise<DbConnection | undefined> {
    console.log('Getting active database connection');
    const [active] = await db
      .select()
      .from(dbConnections)
      .where(eq(dbConnections.isActive, true));
    
    return active;
  }
  
  // Table methods
  async getTables(connectionId: number): Promise<DbTable[]> {
    console.log(`Getting tables for connection id: ${connectionId}`);
    return await db
      .select()
      .from(dbTables)
      .where(eq(dbTables.connectionId, connectionId));
  }
  
  async getTable(id: number): Promise<DbTable | undefined> {
    console.log(`Getting table with id: ${id}`);
    const [table] = await db
      .select()
      .from(dbTables)
      .where(eq(dbTables.id, id));
    
    return table;
  }
  
  async getTableByName(connectionId: number, name: string, schema: string = 'public'): Promise<DbTable | undefined> {
    console.log(`Getting table ${schema}.${name} for connection id: ${connectionId}`);
    const [table] = await db
      .select()
      .from(dbTables)
      .where(
        and(
          eq(dbTables.connectionId, connectionId),
          eq(dbTables.name, name),
          eq(dbTables.schema, schema)
        )
      );
    
    return table;
  }
  
  async createTable(table: InsertDbTable): Promise<DbTable> {
    console.log(`Creating new table: ${table.schema}.${table.name}`);
    const [newTable] = await db
      .insert(dbTables)
      .values({
        ...table,
        updatedAt: new Date()
      })
      .returning();
    
    return newTable;
  }
  
  async updateTable(id: number, table: Partial<InsertDbTable>): Promise<DbTable | undefined> {
    console.log(`Updating table with id: ${id}`);
    const [updatedTable] = await db
      .update(dbTables)
      .set({
        ...table,
        updatedAt: new Date()
      })
      .where(eq(dbTables.id, id))
      .returning();
    
    return updatedTable;
  }
  
  async deleteTable(id: number): Promise<boolean> {
    console.log(`Deleting table with id: ${id}`);
    const result = await db
      .delete(dbTables)
      .where(eq(dbTables.id, id))
      .returning({ id: dbTables.id });
    
    return result.length > 0;
  }
  
  // Column methods
  async getColumns(tableId: number): Promise<DbColumn[]> {
    console.log(`Getting columns for table id: ${tableId}`);
    return await db
      .select()
      .from(dbColumns)
      .where(eq(dbColumns.tableId, tableId));
  }
  
  async getColumn(id: number): Promise<DbColumn | undefined> {
    console.log(`Getting column with id: ${id}`);
    const [column] = await db
      .select()
      .from(dbColumns)
      .where(eq(dbColumns.id, id));
    
    return column;
  }
  
  async createColumn(column: InsertDbColumn): Promise<DbColumn> {
    console.log(`Creating new column: ${column.name}`);
    const [newColumn] = await db
      .insert(dbColumns)
      .values({
        ...column,
        updatedAt: new Date()
      })
      .returning();
    
    return newColumn;
  }
  
  async updateColumn(id: number, column: Partial<InsertDbColumn>): Promise<DbColumn | undefined> {
    console.log(`Updating column with id: ${id}`);
    const [updatedColumn] = await db
      .update(dbColumns)
      .set({
        ...column,
        updatedAt: new Date()
      })
      .where(eq(dbColumns.id, id))
      .returning();
    
    return updatedColumn;
  }
  
  async deleteColumn(id: number): Promise<boolean> {
    console.log(`Deleting column with id: ${id}`);
    const result = await db
      .delete(dbColumns)
      .where(eq(dbColumns.id, id))
      .returning({ id: dbColumns.id });
    
    return result.length > 0;
  }
  
  // Activity Log methods
  async createActivityLog(log: InsertActivityLog): Promise<ActivityLog> {
    console.log(`Creating activity log for connection id: ${log.connectionId}, operation: ${log.operation}`);
    const [newLog] = await db
      .insert(activityLogs)
      .values(log)
      .returning();
    
    return newLog;
  }
  
  async getActivityLogs(connectionId: number, limit: number = 10): Promise<ActivityLog[]> {
    console.log(`Getting activity logs for connection id: ${connectionId}, limit: ${limit}`);
    return await db
      .select()
      .from(activityLogs)
      .where(eq(activityLogs.connectionId, connectionId))
      .orderBy(desc(activityLogs.createdAt))
      .limit(limit);
  }
  
  // App Settings methods
  async getSetting(key: string): Promise<AppSetting | undefined> {
    console.log(`Getting setting with key: ${key}`);
    const [setting] = await db
      .select()
      .from(appSettings)
      .where(eq(appSettings.key, key));
    
    return setting;
  }
  
  async setSetting(key: string, value: any): Promise<AppSetting> {
    console.log(`Setting key: ${key}`);
    
    // Check if setting exists
    const existingSetting = await this.getSetting(key);
    
    if (existingSetting) {
      // Update existing setting
      const [updatedSetting] = await db
        .update(appSettings)
        .set({
          value,
          updatedAt: new Date()
        })
        .where(eq(appSettings.key, key))
        .returning();
      
      return updatedSetting;
    } else {
      // Create new setting
      const [newSetting] = await db
        .insert(appSettings)
        .values({
          key,
          value
        })
        .returning();
      
      return newSetting;
    }
  }
  
  // Raw SQL execution
  async executeRawQuery(connectionId: number, query: string, params: any[] = []): Promise<any> {
    console.log(`Executing raw query for connection id: ${connectionId}`);
    console.log(`Query: ${query}`);
    console.log(`Params: ${JSON.stringify(params)}`);
    
    try {
      // For this implementation we are using the same database connection for simplicity
      // In a real application, we would need to use the connectionId to connect to the right database
      const result = await db.execute(sql.raw(query, params));
      
      // Log the activity
      await this.createActivityLog({
        connectionId,
        operation: query.trim().split(/\s+/)[0].toUpperCase(),
        details: query,
        status: 'SUCCESS',
      });
      
      return result;
    } catch (error) {
      console.error('Query execution failed:', error);
      
      // Log the error
      await this.createActivityLog({
        connectionId,
        operation: query.trim().split(/\s+/)[0].toUpperCase(),
        details: query,
        status: 'ERROR',
        metadata: { error: (error as Error).message }
      });
      
      throw error;
    }
  }
  
  // Database schema introspection
  async fetchDatabaseTables(connectionId: number): Promise<string[]> {
    console.log(`Fetching tables for connection id: ${connectionId}`);
    
    try {
      const result = await this.executeRawQuery(
        connectionId,
        `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        ORDER BY table_name
        `
      );
      
      return result.rows.map((row: any) => row.table_name);
    } catch (error) {
      console.error('Failed to fetch database tables:', error);
      throw error;
    }
  }
  
  async fetchTableColumns(connectionId: number, tableName: string): Promise<any[]> {
    console.log(`Fetching columns for table ${tableName}, connection id: ${connectionId}`);
    
    try {
      const result = await this.executeRawQuery(
        connectionId,
        `
        SELECT 
          column_name, 
          data_type, 
          is_nullable, 
          column_default,
          (
            SELECT constraint_type 
            FROM information_schema.table_constraints tc
            JOIN information_schema.constraint_column_usage ccu
              ON tc.constraint_name = ccu.constraint_name
            WHERE tc.table_name = c.table_name
            AND ccu.column_name = c.column_name
            AND constraint_type = 'PRIMARY KEY'
          ) as primary_key
        FROM information_schema.columns c
        WHERE table_name = $1
        ORDER BY ordinal_position
        `,
        [tableName]
      );
      
      return result.rows;
    } catch (error) {
      console.error(`Failed to fetch columns for table ${tableName}:`, error);
      throw error;
    }
  }
  
  async fetchTableData(connectionId: number, tableName: string, page: number = 1, pageSize: number = 10): Promise<any> {
    console.log(`Fetching data for table ${tableName}, connection id: ${connectionId}, page: ${page}, pageSize: ${pageSize}`);
    
    const offset = (page - 1) * pageSize;
    
    try {
      // First, get the count of total rows
      const countResult = await this.executeRawQuery(
        connectionId,
        `SELECT COUNT(*) as total FROM ${tableName}`
      );
      
      const total = parseInt(countResult.rows[0].total);
      
      // Then get the paginated data
      const dataResult = await this.executeRawQuery(
        connectionId,
        `SELECT * FROM ${tableName} LIMIT $1 OFFSET $2`,
        [pageSize, offset]
      );
      
      return {
        data: dataResult.rows,
        pagination: {
          total,
          page,
          pageSize,
          totalPages: Math.ceil(total / pageSize)
        }
      };
    } catch (error) {
      console.error(`Failed to fetch data for table ${tableName}:`, error);
      throw error;
    }
  }
  
  // Data manipulation operations
  async insertRow(connectionId: number, tableName: string, data: Record<string, any>): Promise<any> {
    console.log(`Inserting row into table ${tableName}, connection id: ${connectionId}`);
    console.log(`Data: ${JSON.stringify(data)}`);
    
    // Extract column names and values
    const columns = Object.keys(data);
    const values = Object.values(data);
    const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');
    
    try {
      const result = await this.executeRawQuery(
        connectionId,
        `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders}) RETURNING *`,
        values
      );
      
      Logger.success(`Row inserted into ${tableName} successfully`);
      return result.rows[0];
    } catch (error) {
      Logger.error(`Failed to insert row into ${tableName}:`, error);
      throw error;
    }
  }
  
  async updateRow(connectionId: number, tableName: string, primaryKey: string, primaryKeyValue: any, data: Record<string, any>): Promise<any> {
    console.log(`Updating row in table ${tableName} where ${primaryKey} = ${primaryKeyValue}, connection id: ${connectionId}`);
    console.log(`Data: ${JSON.stringify(data)}`);
    
    // Extract column names and values, excluding the primary key
    const columns = Object.keys(data).filter(col => col !== primaryKey);
    const values = columns.map(col => data[col]);
    
    // Generate SET clause
    const setClause = columns.map((col, index) => `${col} = $${index + 1}`).join(', ');
    
    try {
      const result = await this.executeRawQuery(
        connectionId,
        `UPDATE ${tableName} SET ${setClause} WHERE ${primaryKey} = $${columns.length + 1} RETURNING *`,
        [...values, primaryKeyValue]
      );
      
      Logger.success(`Row updated in ${tableName} successfully`);
      return result.rows[0];
    } catch (error) {
      Logger.error(`Failed to update row in ${tableName}:`, error);
      throw error;
    }
  }
  
  async deleteRow(connectionId: number, tableName: string, primaryKey: string, primaryKeyValue: any): Promise<boolean> {
    console.log(`Deleting row from table ${tableName} where ${primaryKey} = ${primaryKeyValue}, connection id: ${connectionId}`);
    
    try {
      const result = await this.executeRawQuery(
        connectionId,
        `DELETE FROM ${tableName} WHERE ${primaryKey} = $1 RETURNING ${primaryKey}`,
        [primaryKeyValue]
      );
      
      Logger.success(`Row deleted from ${tableName} successfully`);
      return result.rows.length > 0;
    } catch (error) {
      Logger.error(`Failed to delete row from ${tableName}:`, error);
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();
