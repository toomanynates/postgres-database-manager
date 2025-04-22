import React, { useState } from 'react';
import { useSetupWizard } from '@/hooks/useDatabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';
import { DbConnectionForm } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

interface SetupWizardProps {
  onComplete: () => void;
}

const SetupWizard: React.FC<SetupWizardProps> = ({ onComplete }) => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<DbConnectionForm>({
    name: 'My Database',
    host: 'localhost',
    port: '5432',
    database: '',
    username: '',
    password: '',
    storeSecurely: true,
    setActive: true
  });
  const [connectionVerified, setConnectionVerified] = useState(false);
  
  const {
    testConnection,
    saveConnection,
    isTestingConnection,
    isSavingConnection,
    testConnectionResult
  } = useSetupWizard();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleNextStep = () => {
    console.log('Moving to next step, current step:', currentStep);
    
    // Validate current step
    if (currentStep === 1) {
      if (!formData.host || !formData.port || !formData.database) {
        toast({
          title: 'Validation error',
          description: 'Please fill in all required fields.',
          variant: 'destructive',
        });
        return;
      }
    } else if (currentStep === 2) {
      if (!formData.username) {
        toast({
          title: 'Validation error',
          description: 'Username is required.',
          variant: 'destructive',
        });
        return;
      }
    }
    
    // If current step is 2, test the connection before proceeding
    if (currentStep === 2) {
      testConnection(formData);
      // We'll move to step 3 once connection is verified in useEffect below
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePreviousStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleFinishSetup = async () => {
    console.log('Finishing setup with data:', formData);
    saveConnection(formData);
    onComplete();
  };
  
  // Check for test connection result
  React.useEffect(() => {
    if (testConnectionResult && testConnectionResult.success) {
      setConnectionVerified(true);
      setCurrentStep(3);
    }
  }, [testConnectionResult]);

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-neutral-700 text-center mb-6">
            Database Connection Setup
          </h3>
          
          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            <ol className="flex items-center w-full max-w-md">
              <li className="flex items-center">
                <span className={`flex items-center justify-center w-8 h-8 rounded-full shrink-0 text-white ${currentStep >= 1 ? 'bg-primary' : 'bg-neutral-200 text-neutral-700'}`}>
                  1
                </span>
                <span className="ml-2 text-sm font-medium text-neutral-700">Connection</span>
                <div className="w-full bg-neutral-200 h-0.5 ml-2 mr-2"></div>
              </li>
              <li className="flex items-center">
                <span className={`flex items-center justify-center w-8 h-8 rounded-full shrink-0 ${currentStep >= 2 ? 'bg-primary text-white' : 'bg-neutral-200 text-neutral-700'}`}>
                  2
                </span>
                <span className={`ml-2 text-sm font-medium ${currentStep >= 2 ? 'text-neutral-700' : 'text-neutral-500'}`}>Credentials</span>
                <div className="w-full bg-neutral-200 h-0.5 ml-2 mr-2"></div>
              </li>
              <li className="flex items-center">
                <span className={`flex items-center justify-center w-8 h-8 rounded-full shrink-0 ${currentStep >= 3 ? 'bg-primary text-white' : 'bg-neutral-200 text-neutral-700'}`}>
                  3
                </span>
                <span className={`ml-2 text-sm font-medium ${currentStep >= 3 ? 'text-neutral-700' : 'text-neutral-500'}`}>Verification</span>
              </li>
            </ol>
          </div>
          
          {/* Step 1: Connection Details */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Connection Name</Label>
                <Input 
                  type="text" 
                  id="name" 
                  name="name" 
                  value={formData.name}
                  onChange={handleInputChange}
                  className="mt-1" 
                  placeholder="My Database Connection" 
                />
              </div>
              <div>
                <Label htmlFor="host">Host</Label>
                <Input 
                  type="text" 
                  id="host" 
                  name="host" 
                  value={formData.host}
                  onChange={handleInputChange}
                  className="mt-1" 
                  placeholder="localhost" 
                />
              </div>
              <div>
                <Label htmlFor="port">Port</Label>
                <Input 
                  type="text" 
                  id="port" 
                  name="port" 
                  value={formData.port}
                  onChange={handleInputChange}
                  className="mt-1" 
                  placeholder="5432" 
                />
              </div>
              <div>
                <Label htmlFor="database">Database</Label>
                <Input 
                  type="text" 
                  id="database" 
                  name="database" 
                  value={formData.database}
                  onChange={handleInputChange}
                  className="mt-1"
                />
              </div>
            </div>
          )}
          
          {/* Step 2: Credentials */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input 
                  type="text" 
                  id="username" 
                  name="username" 
                  value={formData.username}
                  onChange={handleInputChange}
                  className="mt-1" 
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input 
                  type="password" 
                  id="password" 
                  name="password" 
                  value={formData.password}
                  onChange={handleInputChange}
                  className="mt-1" 
                />
              </div>
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <Checkbox 
                    id="storeSecurely" 
                    checked={formData.storeSecurely}
                    onCheckedChange={(checked) => handleCheckboxChange('storeSecurely', checked as boolean)} 
                  />
                </div>
                <div className="ml-3 text-sm">
                  <Label htmlFor="storeSecurely" className="font-medium text-neutral-700">Store credentials securely</Label>
                  <p className="text-neutral-500">Saves to a local secrets file with encryption</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Step 3: Verification */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="bg-neutral-100 p-4 rounded-md">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-neutral-700">Connection Summary</h4>
                    <div className="mt-2 text-sm text-neutral-500 space-y-1">
                      <p>Host: <span className="text-neutral-700">{formData.host}</span></p>
                      <p>Port: <span className="text-neutral-700">{formData.port}</span></p>
                      <p>Database: <span className="text-neutral-700">{formData.database}</span></p>
                      <p>Username: <span className="text-neutral-700">{formData.username}</span></p>
                      <p>Store credentials: <span className="text-neutral-700">{formData.storeSecurely ? 'Yes' : 'No'}</span></p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center">
                {/* Loading spinner during verification */}
                {isTestingConnection ? (
                  <div className="flex items-center">
                    <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" />
                    <span className="text-sm text-neutral-700">Testing connection...</span>
                  </div>
                ) : (
                  /* Success message */
                  connectionVerified && (
                    <div className="flex items-center text-success">
                      <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Connection successful! Database connected.</span>
                    </div>
                  )
                )}
              </div>
            </div>
          )}
          
          {/* Navigation Buttons */}
          <div className="mt-6 flex justify-between">
            <Button
              variant="outline"
              onClick={handlePreviousStep}
              disabled={currentStep === 1 || isTestingConnection || isSavingConnection}
              className={currentStep > 1 ? 'block' : 'hidden'}
            >
              Previous
            </Button>
            <div>
              {currentStep < 3 ? (
                <Button
                  onClick={handleNextStep}
                  disabled={isTestingConnection}
                  className="ml-3"
                >
                  {isTestingConnection && currentStep === 2 && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Next
                </Button>
              ) : (
                <Button
                  onClick={handleFinishSetup}
                  disabled={isSavingConnection || !connectionVerified}
                  className="ml-3"
                >
                  {isSavingConnection && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Finish Setup
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetupWizard;
