import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  testDatabaseConnection, 
  saveConnection, 
  fetchTables, 
  fetchTableData, 
  fetchTableColumns,
  insertRow,
  updateRow,
  deleteRow,
  getActivityLogs
} from '@/utils/database';
import { DbConnectionForm, TableDataResponse } from '@/types/database';

export const useSetupWizard = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Test connection mutation
  const testConnectionMutation = useMutation({
    mutationFn: (connectionData: DbConnectionForm) => testDatabaseConnection(connectionData),
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: 'Connection successful',
          description: 'Successfully connected to the database',
          variant: 'default',
        });
      } else {
        toast({
          title: 'Connection failed',
          description: data.message || 'Failed to connect to the database',
          variant: 'destructive',
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Connection failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Save connection mutation
  const saveConnectionMutation = useMutation({
    mutationFn: (connectionData: DbConnectionForm) => saveConnection(connectionData),
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: 'Connection saved',
          description: 'Database connection has been saved successfully',
          variant: 'default',
        });
        queryClient.invalidateQueries({ queryKey: ['/api/connections'] });
      } else {
        toast({
          title: 'Failed to save connection',
          description: data.message || 'An error occurred while saving the connection',
          variant: 'destructive',
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to save connection',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Check setup status
  const { data: setupStatus, isLoading: isCheckingSetup } = useQuery({
    queryKey: ['/api/setup/status'],
  });
  
  return {
    isSetupComplete: setupStatus?.isComplete || false,
    isCheckingSetup,
    testConnection: testConnectionMutation.mutate,
    saveConnection: saveConnectionMutation.mutate,
    isTestingConnection: testConnectionMutation.isPending,
    isSavingConnection: saveConnectionMutation.isPending,
    testConnectionResult: testConnectionMutation.data,
    saveConnectionResult: saveConnectionMutation.data,
  };
};

export const useTableManager = (connectionId: number | undefined, tableName: string | undefined) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Get tables for a connection
  const {
    data: tables,
    isLoading: isLoadingTables,
    error: tablesError,
  } = useQuery({
    queryKey: ['/api/connections', connectionId, 'tables'],
    enabled: !!connectionId,
  });
  
  // Get columns for a table
  const {
    data: columns,
    isLoading: isLoadingColumns,
    error: columnsError,
  } = useQuery({
    queryKey: ['/api/connections', connectionId, 'tables', tableName, 'columns'],
    enabled: !!connectionId && !!tableName,
  });
  
  // Get data for a table
  const {
    data: tableData,
    isLoading: isLoadingTableData,
    error: tableDataError,
    refetch: refetchTableData,
  } = useQuery<TableDataResponse>({
    queryKey: ['/api/connections', connectionId, 'tables', tableName, 'data', page, pageSize, search, sortColumn, sortDirection],
    enabled: !!connectionId && !!tableName,
  });
  
  // Insert row mutation
  const insertRowMutation = useMutation({
    mutationFn: (data: Record<string, any>) => {
      if (!connectionId || !tableName) {
        throw new Error('Connection ID and table name are required');
      }
      return insertRow(connectionId, tableName, data);
    },
    onSuccess: () => {
      toast({
        title: 'Row inserted',
        description: 'The row has been inserted successfully',
        variant: 'default',
      });
      refetchTableData();
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to insert row',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Update row mutation
  const updateRowMutation = useMutation({
    mutationFn: ({ primaryKey, primaryKeyValue, data }: { primaryKey: string; primaryKeyValue: any; data: Record<string, any> }) => {
      if (!connectionId || !tableName) {
        throw new Error('Connection ID and table name are required');
      }
      return updateRow(connectionId, tableName, primaryKey, primaryKeyValue, data);
    },
    onSuccess: () => {
      toast({
        title: 'Row updated',
        description: 'The row has been updated successfully',
        variant: 'default',
      });
      refetchTableData();
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to update row',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Delete row mutation
  const deleteRowMutation = useMutation({
    mutationFn: ({ primaryKey, primaryKeyValue }: { primaryKey: string; primaryKeyValue: any }) => {
      if (!connectionId || !tableName) {
        throw new Error('Connection ID and table name are required');
      }
      return deleteRow(connectionId, tableName, primaryKey, primaryKeyValue);
    },
    onSuccess: () => {
      toast({
        title: 'Row deleted',
        description: 'The row has been deleted successfully',
        variant: 'default',
      });
      refetchTableData();
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to delete row',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Get activity logs for a connection
  const {
    data: activityLogs,
    isLoading: isLoadingActivityLogs,
    error: activityLogsError,
  } = useQuery({
    queryKey: ['/api/connections', connectionId, 'activity'],
    enabled: !!connectionId,
  });
  
  // Handle pagination
  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);
  
  // Handle page size change
  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1); // Reset to first page when changing page size
  }, []);
  
  // Handle search
  const handleSearch = useCallback((searchTerm: string) => {
    setSearch(searchTerm);
    setPage(1); // Reset to first page when searching
  }, []);
  
  // Handle sort
  const handleSort = useCallback((column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
    setPage(1); // Reset to first page when sorting
  }, [sortColumn, sortDirection]);
  
  return {
    tables,
    columns,
    tableData,
    activityLogs,
    isLoadingTables,
    isLoadingColumns,
    isLoadingTableData,
    isLoadingActivityLogs,
    tablesError,
    columnsError,
    tableDataError,
    activityLogsError,
    page,
    pageSize,
    search,
    sortColumn,
    sortDirection,
    handlePageChange,
    handlePageSizeChange,
    handleSearch,
    handleSort,
    insertRow: insertRowMutation.mutate,
    updateRow: updateRowMutation.mutate,
    deleteRow: deleteRowMutation.mutate,
    isInsertingRow: insertRowMutation.isPending,
    isUpdatingRow: updateRowMutation.isPending,
    isDeletingRow: deleteRowMutation.isPending,
    refetchTableData,
  };
};

export const useDashboard = (connectionId: number | undefined) => {
  const [stats, setStats] = useState({
    totalTables: 0,
    databaseSize: '0 MB',
    totalRows: 0,
  });
  
  // Get tables for a connection
  const { data: tables, isLoading: isLoadingTables } = useQuery({
    queryKey: ['/api/connections', connectionId, 'tables'],
    enabled: !!connectionId,
  });
  
  // Get activity logs for a connection
  const { data: activityLogs, isLoading: isLoadingActivityLogs } = useQuery({
    queryKey: ['/api/connections', connectionId, 'activity'],
    enabled: !!connectionId,
  });
  
  // Calculate stats based on tables data
  useEffect(() => {
    if (tables && Array.isArray(tables)) {
      setStats(prev => ({
        ...prev,
        totalTables: tables.length,
      }));
    }
  }, [tables]);
  
  // Dummy function to calculate database size - in a real app this would come from the backend
  const calculateDatabaseSize = useCallback(() => {
    return '256 MB';
  }, []);
  
  // Dummy function to calculate total rows - in a real app this would come from the backend
  const calculateTotalRows = useCallback(() => {
    return 28429;
  }, []);
  
  // Update stats with calculated values
  useEffect(() => {
    setStats(prev => ({
      ...prev,
      databaseSize: calculateDatabaseSize(),
      totalRows: calculateTotalRows(),
    }));
  }, [calculateDatabaseSize, calculateTotalRows]);
  
  return {
    stats,
    activityLogs,
    isLoadingTables,
    isLoadingActivityLogs,
  };
};
