import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DbConnection, AppSettings } from '@/types/database';
import { useDatabaseContext } from '@/context/DatabaseContext';

interface SettingsProps {
  activeConnection: DbConnection | null;
}

const Settings: React.FC<SettingsProps> = ({ activeConnection }) => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<AppSettings>({
    autoRefresh: true,
    saveHistory: true,
    rowsPerPage: 25
  });

  // Handle settings change
  const handleAutoRefreshChange = (checked: boolean) => {
    setSettings(prev => ({ ...prev, autoRefresh: checked }));
  };

  const handleSaveHistoryChange = (checked: boolean) => {
    setSettings(prev => ({ ...prev, saveHistory: checked }));
  };

  const handleRowsPerPageChange = (value: string) => {
    setSettings(prev => ({ ...prev, rowsPerPage: parseInt(value) }));
  };

  // Handle save settings
  const handleSaveSettings = async () => {
    console.log('Saving settings:', settings);
    setIsSaving(true);
    
    try {
      // In a real app, we would send this to the backend
      // For now, we just simulate a successful save
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast({
        title: 'Settings saved',
        description: 'Your settings have been saved successfully',
        variant: 'default',
      });
    } catch (error) {
      toast({
        title: 'Failed to save settings',
        description: (error as Error).message,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle edit connection
  const handleEditConnection = () => {
    console.log('Edit connection');
    toast({
      title: 'Edit connection',
      description: 'This feature is not implemented in the current version',
    });
  };

  return (
    <div className="flex-1 overflow-auto p-6">
      <h1 className="text-2xl font-semibold text-neutral-700 mb-6">Settings</h1>
      
      <Card className="mb-6">
        <CardContent className="p-0">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-neutral-700">Database Connection</h3>
            <p className="mt-1 max-w-2xl text-sm text-neutral-500">Current connection details and configuration.</p>
          </div>
          <div className="border-t border-neutral-200 px-4 py-5 sm:px-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
              {activeConnection ? (
                <>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-neutral-500">Host</dt>
                    <dd className="mt-1 text-sm text-neutral-900">{activeConnection.host}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-neutral-500">Port</dt>
                    <dd className="mt-1 text-sm text-neutral-900">{activeConnection.port}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-neutral-500">Database</dt>
                    <dd className="mt-1 text-sm text-neutral-900">{activeConnection.database}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-neutral-500">User</dt>
                    <dd className="mt-1 text-sm text-neutral-900">{activeConnection.username}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-neutral-500">Connection Status</dt>
                    <dd className="mt-1 text-sm text-success flex items-center">
                      <span className="h-2 w-2 rounded-full bg-success mr-1.5"></span>
                      Connected
                    </dd>
                  </div>
                  <div className="sm:col-span-2">
                    <Button
                      onClick={handleEditConnection}
                      variant="default"
                      size="sm"
                    >
                      Edit Connection
                    </Button>
                  </div>
                </>
              ) : (
                <div className="sm:col-span-2">
                  <p className="text-neutral-500">No active connection</p>
                </div>
              )}
            </dl>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-neutral-700">Application Settings</h3>
            <p className="mt-1 max-w-2xl text-sm text-neutral-500">Configure application behavior.</p>
          </div>
          <div className="border-t border-neutral-200 px-4 py-5 sm:px-6">
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <Checkbox
                    id="auto_refresh"
                    checked={settings.autoRefresh}
                    onCheckedChange={handleAutoRefreshChange}
                  />
                </div>
                <div className="ml-3 text-sm">
                  <Label htmlFor="auto_refresh" className="font-medium text-neutral-700">Auto-refresh data</Label>
                  <p className="text-neutral-500">Automatically refresh table data every minute</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <Checkbox
                    id="save_history"
                    checked={settings.saveHistory}
                    onCheckedChange={handleSaveHistoryChange}
                  />
                </div>
                <div className="ml-3 text-sm">
                  <Label htmlFor="save_history" className="font-medium text-neutral-700">Save query history</Label>
                  <p className="text-neutral-500">Keep a history of executed database operations</p>
                </div>
              </div>
              
              <div>
                <Label htmlFor="rows_per_page" className="block text-sm font-medium text-neutral-700">Rows per page</Label>
                <Select 
                  value={settings.rowsPerPage.toString()}
                  onValueChange={handleRowsPerPageChange}
                >
                  <SelectTrigger className="mt-1 w-full">
                    <SelectValue placeholder="Select rows per page" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-end">
                <Button 
                  onClick={handleSaveSettings}
                  disabled={isSaving}
                >
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Settings
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
