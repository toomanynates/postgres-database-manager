import React from 'react';
import { Link, useLocation } from 'wouter';

interface HeaderProps {
  isSetupComplete: boolean;
  isConnected: boolean;
}

const Header: React.FC<HeaderProps> = ({ isSetupComplete, isConnected }) => {
  const [location] = useLocation();

  console.log('Current path:', location);
  console.log('Setup complete:', isSetupComplete);
  console.log('Connected:', isConnected);

  return (
    <header className="bg-white border-b border-neutral-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-primary font-bold text-xl">DB Manager</span>
            </div>
            
            {/* Navigation Links - Only visible if setup is complete */}
            {isSetupComplete && (
              <nav className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link href="/" className={`${location === '/' ? 'border-primary text-neutral-700' : 'border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}>
                  Dashboard
                </Link>
                <Link href="/table-manager" className={`${location === '/table-manager' ? 'border-primary text-neutral-700' : 'border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}>
                  Table Manager
                </Link>
                <Link href="/settings" className={`${location === '/settings' ? 'border-primary text-neutral-700' : 'border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}>
                  Settings
                </Link>
              </nav>
            )}
          </div>
          
          {/* Connection Status - Only visible if setup is complete */}
          {isSetupComplete && (
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <span className="flex items-center space-x-1">
                <span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-success' : 'bg-error'}`}></span>
                <span className="text-sm text-neutral-500">{isConnected ? 'Connected' : 'Disconnected'}</span>
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
