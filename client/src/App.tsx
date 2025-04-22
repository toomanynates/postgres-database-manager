import { useState, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import TableManagerPage from "@/pages/TableManagerPage";
import SettingsPage from "@/pages/SettingsPage";
import Header from "@/components/Header";
import SetupWizard from "@/components/SetupWizard";
import { DatabaseProvider } from "@/context/DatabaseContext";

function App() {
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  
  // Check if setup is complete
  useEffect(() => {
    const checkSetupStatus = async () => {
      try {
        const response = await fetch("/api/setup/status");
        const data = await response.json();
        console.log("Setup status:", data);
        setIsSetupComplete(data.isComplete);
        
        if (data.isComplete) {
          setIsConnected(true);
        }
      } catch (error) {
        console.error("Failed to check setup status:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkSetupStatus();
  }, []);
  
  const handleSetupComplete = () => {
    console.log("Setup completed");
    setIsSetupComplete(true);
    setIsConnected(true);
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <QueryClientProvider client={queryClient}>
      <DatabaseProvider>
        <TooltipProvider>
          <div className="min-h-screen flex flex-col bg-neutral-100">
            <Header isSetupComplete={isSetupComplete} isConnected={isConnected} />
            
            <main className="flex-grow flex">
              {!isSetupComplete ? (
                <SetupWizard onComplete={handleSetupComplete} />
              ) : (
                <Switch>
                  <Route path="/" component={Home} />
                  <Route path="/table-manager" component={TableManagerPage} />
                  <Route path="/settings" component={SettingsPage} />
                  <Route component={NotFound} />
                </Switch>
              )}
            </main>
            
            <Toaster />
          </div>
        </TooltipProvider>
      </DatabaseProvider>
    </QueryClientProvider>
  );
}

export default App;
