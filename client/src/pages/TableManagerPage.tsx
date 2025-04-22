import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import TableManager from '@/components/TableManager';
import { useDatabaseContext } from '@/context/DatabaseContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const TableManagerPage: React.FC = () => {
  const { toast } = useToast();
  const { activeConnection, isLoading, error } = useDatabaseContext();
  const [selectedTable, setSelectedTable] = useState<string | null>(null);

  // Handle table selection from sidebar
  const handleTableSelect = (tableName: string) => {
    console.log('Selected table:', tableName);
    setSelectedTable(tableName);
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <span className="ml-3 text-lg">Loading connection data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-medium text-error mb-2">Connection Error</h2>
          <p className="text-neutral-500">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!activeConnection) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-medium text-neutral-700 mb-2">No active database connection</h2>
          <p className="text-neutral-500">Please go to Settings to configure a database connection</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex">
      <Sidebar onTableSelect={handleTableSelect} />
      <TableManager connectionId={activeConnection.id} />
    </div>
  );
};

export default TableManagerPage;
