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
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DbConnection, AppSettings, DbConnectionForm } from '@/types/database';
import { useDatabaseContext } from '@/context/DatabaseContext';
import { useSettings } from '@/hooks/useDatabase';

interface SettingsProps {
  activeConnection: DbConnection | null;
}

const Settings: React.FC<SettingsProps> = ({ activeConnection }) => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [settings, setSettings] = useState<AppSettings>({
    autoRefresh: true,
    saveHistory: true,
    rowsPerPage: 25
  });
  
  // Initialize the form data with the active connection details
  const [connectionForm, setConnectionForm] = useState<DbConnectionForm>({
    name: '',
    host: '',
    port: '',
    database: '',
    username: '',
    password: '',
    secure: false
  });

  // Initialize useSettings hook with the active connection ID
  const {
    updateConnection,
    isUpdatingConnection,
    testUpdatedConnection,
    isTestingConnection,
    testConnectionResult
  } = useSettings(activeConnection?.id);

  // Update the form when the active connection changes
  useEffect(() => {
    if (activeConnection) {
      setConnectionForm({
        name: activeConnection.name,
        host: activeConnection.host,
        port: activeConnection.port,
        database: activeConnection.database,
        username: activeConnection.username,
        password: activeConnection.password,
        secure: activeConnection.secure
      });
    }
  }, [activeConnection]);

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

  // Handle form field changes
  const handleConnectionFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setConnectionForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
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

  // Handle edit connection dialog open
  const handleEditConnection = () => {
    console.log('Opening edit connection dialog');
    setIsEditDialogOpen(true);
  };

  // Handle testing the connection
  const handleTestConnection = () => {
    console.log('Testing connection with:', connectionForm);
    testUpdatedConnection(connectionForm);
  };

  // Handle saving the connection changes
  const handleSaveConnection = () => {
    console.log('Saving connection changes:', connectionForm);
    updateConnection(connectionForm);
    setIsEditDialogOpen(false);
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

      {/* Edit Connection Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md md:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Database Connection</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Connection Name
              </Label>
              <Input
                id="name"
                name="name"
                value={connectionForm.name}
                onChange={handleConnectionFormChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="host" className="text-right">
                Host
              </Label>
              <Input
                id="host"
                name="host"
                value={connectionForm.host}
                onChange={handleConnectionFormChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="port" className="text-right">
                Port
              </Label>
              <Input
                id="port"
                name="port"
                value={connectionForm.port}
                onChange={handleConnectionFormChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="database" className="text-right">
                Database
              </Label>
              <Input
                id="database"
                name="database"
                value={connectionForm.database}
                onChange={handleConnectionFormChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                Username
              </Label>
              <Input
                id="username"
                name="username"
                value={connectionForm.username}
                onChange={handleConnectionFormChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={connectionForm.password}
                onChange={handleConnectionFormChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="secure" className="text-right">
                Secure Connection
              </Label>
              <div className="col-span-3 flex items-center">
                <Checkbox
                  id="secure"
                  name="secure"
                  checked={connectionForm.secure}
                  onCheckedChange={(checked) => {
                    setConnectionForm(prev => ({ ...prev, secure: checked === true }));
                  }}
                />
                <Label htmlFor="secure" className="ml-2">
                  Use SSL/TLS
                </Label>
              </div>
            </div>
            
            {testConnectionResult && (
              <div className={`p-3 rounded-md ${testConnectionResult.success ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                {testConnectionResult.success ? 'Connection successful!' : `Connection failed: ${testConnectionResult.message}`}
              </div>
            )}
          </div>
          <DialogFooter className="sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={handleTestConnection}
              disabled={isTestingConnection}
            >
              {isTestingConnection ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Test Connection
            </Button>
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                onClick={handleSaveConnection}
                disabled={isUpdatingConnection}
              >
                {isUpdatingConnection ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save Changes
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Settings;
