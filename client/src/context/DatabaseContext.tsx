import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DbConnection } from '@/types/database';

interface DatabaseContextType {
  activeConnection: DbConnection | null;
  setActiveConnection: (connection: DbConnection | null) => void;
  isLoading: boolean;
  error: Error | null;
}

const DatabaseContext = createContext<DatabaseContextType>({
  activeConnection: null,
  setActiveConnection: () => {},
  isLoading: false,
  error: null
});

export const useDatabaseContext = () => useContext(DatabaseContext);

interface DatabaseProviderProps {
  children: React.ReactNode;
}

export const DatabaseProvider: React.FC<DatabaseProviderProps> = ({ children }) => {
  const [activeConnection, setActiveConnection] = useState<DbConnection | null>(null);

  // Fetch active connection from the API
  const { 
    data: connectionData, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['/api/connections/active'],
    retry: false
  });

  // Update active connection when data is loaded
  useEffect(() => {
    if (connectionData) {
      console.log('Active connection loaded:', connectionData);
      setActiveConnection(connectionData);
    }
  }, [connectionData]);

  const value = {
    activeConnection,
    setActiveConnection,
    isLoading,
    error: error as Error | null
  };

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
};
