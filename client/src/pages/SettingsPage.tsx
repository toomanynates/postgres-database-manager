import React from 'react';
import Settings from '@/components/Settings';
import { useDatabaseContext } from '@/context/DatabaseContext';
import { Loader2 } from 'lucide-react';

const SettingsPage: React.FC = () => {
  const { activeConnection, isLoading, error } = useDatabaseContext();

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

  return <Settings activeConnection={activeConnection} />;
};

export default SettingsPage;
