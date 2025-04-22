export interface DbConnection {
  id: number;
  name: string;
  host: string;
  port: string;
  database: string;
  username: string;
  password: string;
  secure: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DbConnectionForm {
  name: string;
  host: string;
  port: string;
  database: string;
  username: string;
  password: string;
  secure?: boolean;
  storeSecurely?: boolean;
  setActive?: boolean;
}

export interface DbTable {
  id: number;
  connectionId: number;
  name: string;
  schema: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DbColumn {
  id: number;
  tableId: number;
  name: string;
  type: string;
  nullable: boolean;
  isPrimary: boolean;
  isUnique: boolean;
  defaultValue?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: number;
  connectionId: number;
  tableId?: number;
  operation: string;
  details?: string;
  status: 'SUCCESS' | 'ERROR';
  userId?: number;
  metadata?: any;
  createdAt: string;
}

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface TableDataResponse {
  data: any[];
  pagination: Pagination;
}

export interface AppSettings {
  autoRefresh: boolean;
  saveHistory: boolean;
  rowsPerPage: number;
}

export interface DatabaseStats {
  totalTables: number;
  databaseSize: string;
  totalRows: number;
}
