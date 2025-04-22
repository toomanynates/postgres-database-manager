import React, { useEffect } from 'react';
import Dashboard from '@/components/Dashboard';
import { useDatabaseContext } from '@/context/DatabaseContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const Home: React.FC = () => {
  const { toast } = useToast();
  const { activeConnection, isLoading, error } = useDatabaseContext();

  // Show error toast if connection retrieval fails
  useEffect(() => {
    if (error) {
      toast({
        title: 'Connection error',
        description: error.message,
        variant: 'destructive',
      });
    }
  }, [error, toast]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <span className="ml-3 text-lg">Loading connection data...</span>
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

  return <Dashboard connectionId={activeConnection.id} />;
};

export default Home;
