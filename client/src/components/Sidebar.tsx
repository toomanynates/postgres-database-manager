import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { fetchTables } from '@/utils/database';
import { useDatabaseContext } from '@/context/DatabaseContext';

interface SidebarProps {
  onTableSelect: (tableName: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onTableSelect }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { activeConnection } = useDatabaseContext();
  const [selectedTable, setSelectedTable] = useState<string | null>(null);

  // Fetch tables for active connection
  const { 
    data: tables, 
    isLoading: isLoadingTables,
    error: tablesError,
    refetch: refetchTables
  } = useQuery({
    queryKey: ['/api/connections', activeConnection?.id, 'tables'],
    enabled: !!activeConnection?.id,
  });

  // Handle table refresh
  const handleRefreshTables = () => {
    console.log('Refreshing tables');
    refetchTables();
  };

  // Handle create table (not implemented in this version)
  const handleCreateTable = () => {
    console.log('Create table clicked');
    toast({
      title: 'Create table',
      description: 'This feature is not implemented in the current version',
    });
  };

  // Handle table selection
  const handleTableSelect = (tableName: string) => {
    setSelectedTable(tableName);
    onTableSelect(tableName);
  };

  // Display error toast if tables fetch fails
  useEffect(() => {
    if (tablesError) {
      toast({
        title: 'Failed to load tables',
        description: (tablesError as Error).message,
        variant: 'destructive',
      });
    }
  }, [tablesError, toast]);

  return (
    <div className="w-64 bg-white border-r border-neutral-200 shadow-sm hidden md:block">
      <div className="h-full flex flex-col">
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <div className="flex-shrink-0 px-4">
            <h2 className="text-lg font-medium text-neutral-700 mb-4">Database Browser</h2>
          </div>
          <nav className="mt-5 flex-1 px-2 space-y-1">
            {isLoadingTables ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : tables && tables.length > 0 ? (
              tables.map((table: string) => (
                <a
                  key={table}
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleTableSelect(table);
                  }}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    selectedTable === table
                      ? 'bg-neutral-100 text-primary'
                      : 'text-neutral-700 hover:text-primary hover:bg-neutral-100'
                  }`}
                >
                  <svg
                    className={`mr-3 h-5 w-5 ${
                      selectedTable === table ? 'text-primary' : 'text-neutral-400 group-hover:text-primary'
                    }`}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7C5 4 4 5 4 7z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h16" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 4v6" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 4v6" />
                  </svg>
                  <span>{table}</span>
                </a>
              ))
            ) : (
              <div className="text-center py-4 text-neutral-500">No tables found</div>
            )}
          </nav>
        </div>
        <div className="flex-shrink-0 flex border-t border-neutral-200 p-4">
          <div className="flex-shrink-0 w-full flex justify-between">
            <Button
              variant="link"
              className="text-sm text-primary hover:text-primary-dark flex items-center"
              onClick={handleRefreshTables}
              disabled={isLoadingTables || !activeConnection}
            >
              {isLoadingTables ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <svg
                  className="h-4 w-4 mr-1"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              )}
              Refresh
            </Button>
            <Button
              variant="link"
              className="text-sm text-primary hover:text-primary-dark flex items-center"
              onClick={handleCreateTable}
              disabled={!activeConnection}
            >
              <svg
                className="h-4 w-4 mr-1"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Table
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
