import { apiRequest } from '@/lib/queryClient';
import { DbConnectionForm, TableDataResponse, DbConnection } from '@/types/database';

export const testDatabaseConnection = async (connectionData: DbConnectionForm) => {
  console.log('Testing database connection:', connectionData);
  
  try {
    const response = await apiRequest('POST', '/api/setup/test-connection', connectionData);
    const result = await response.json();
    console.log('Connection test result:', result);
    return result;
  } catch (error) {
    console.error('Connection test failed:', error);
    throw error;
  }
};

export const saveConnection = async (connectionData: DbConnectionForm) => {
  console.log('Saving database connection:', connectionData);
  
  try {
    const response = await apiRequest('POST', '/api/setup/save-connection', connectionData);
    const result = await response.json();
    console.log('Connection saved:', result);
    return result;
  } catch (error) {
    console.error('Failed to save connection:', error);
    throw error;
  }
};

export const fetchTables = async (connectionId: number) => {
  console.log('Fetching tables for connection:', connectionId);
  
  try {
    const response = await apiRequest('GET', `/api/connections/${connectionId}/tables`);
    const result = await response.json();
    console.log('Tables fetched:', result);
    return result;
  } catch (error) {
    console.error('Failed to fetch tables:', error);
    throw error;
  }
};

export const fetchTableColumns = async (connectionId: number, tableName: string) => {
  console.log(`Fetching columns for table ${tableName}, connection:`, connectionId);
  
  try {
    const response = await apiRequest('GET', `/api/connections/${connectionId}/tables/${tableName}/columns`);
    const result = await response.json();
    console.log('Columns fetched:', result);
    return result;
  } catch (error) {
    console.error('Failed to fetch columns:', error);
    throw error;
  }
};

export const fetchTableData = async (
  connectionId: number, 
  tableName: string, 
  page: number = 1, 
  pageSize: number = 10
): Promise<TableDataResponse> => {
  console.log(`Fetching data for table ${tableName}, connection: ${connectionId}, page: ${page}, pageSize: ${pageSize}`);
  
  try {
    const response = await apiRequest('GET', `/api/connections/${connectionId}/tables/${tableName}/data?page=${page}&pageSize=${pageSize}`);
    const result = await response.json();
    console.log('Table data fetched:', result);
    return result;
  } catch (error) {
    console.error('Failed to fetch table data:', error);
    throw error;
  }
};

export const insertRow = async (connectionId: number, tableName: string, data: Record<string, any>) => {
  console.log(`Inserting row into table ${tableName}, connection:`, connectionId);
  
  try {
    const response = await apiRequest('POST', `/api/connections/${connectionId}/tables/${tableName}/rows`, data);
    const result = await response.json();
    console.log('Row inserted:', result);
    return result;
  } catch (error) {
    console.error('Failed to insert row:', error);
    throw error;
  }
};

export const updateRow = async (
  connectionId: number, 
  tableName: string, 
  primaryKey: string, 
  primaryKeyValue: any, 
  data: Record<string, any>
) => {
  console.log(`Updating row in table ${tableName} where ${primaryKey} = ${primaryKeyValue}, connection:`, connectionId);
  
  try {
    const response = await apiRequest(
      'PUT', 
      `/api/connections/${connectionId}/tables/${tableName}/rows/${primaryKey}/${primaryKeyValue}`, 
      data
    );
    const result = await response.json();
    console.log('Row updated:', result);
    return result;
  } catch (error) {
    console.error('Failed to update row:', error);
    throw error;
  }
};

export const deleteRow = async (
  connectionId: number, 
  tableName: string, 
  primaryKey: string, 
  primaryKeyValue: any
) => {
  console.log(`Deleting row from table ${tableName} where ${primaryKey} = ${primaryKeyValue}, connection:`, connectionId);
  
  try {
    const response = await apiRequest(
      'DELETE', 
      `/api/connections/${connectionId}/tables/${tableName}/rows/${primaryKey}/${primaryKeyValue}`
    );
    const result = await response.json();
    console.log('Row deleted:', result);
    return result;
  } catch (error) {
    console.error('Failed to delete row:', error);
    throw error;
  }
};

export const executeQuery = async (connectionId: number, query: string, params: any[] = []) => {
  console.log(`Executing query for connection ${connectionId}:`, query);
  
  try {
    const response = await apiRequest('POST', '/api/query', { connectionId, query, params });
    const result = await response.json();
    console.log('Query executed:', result);
    return result;
  } catch (error) {
    console.error('Query execution failed:', error);
    throw error;
  }
};

export const getActivityLogs = async (connectionId: number, limit: number = 10) => {
  console.log(`Getting activity logs for connection ${connectionId}, limit: ${limit}`);
  
  try {
    const response = await apiRequest('GET', `/api/connections/${connectionId}/activity?limit=${limit}`);
    const result = await response.json();
    console.log('Activity logs fetched:', result);
    return result;
  } catch (error) {
    console.error('Failed to fetch activity logs:', error);
    throw error;
  }
};

export const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date);
};
