import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Menu, X, Database } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  isSetupComplete: boolean;
  isConnected: boolean;
}

const Header: React.FC<HeaderProps> = ({ isSetupComplete, isConnected }) => {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
            
            {/* Desktop Navigation Links - Only visible if setup is complete */}
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
          
          <div className="flex items-center">
            {/* Connection Status - Only visible if setup is complete on desktop */}
            {isSetupComplete && (
              <div className="hidden sm:flex sm:items-center mr-4">
                <span className="flex items-center space-x-1">
                  <span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-success' : 'bg-error'}`}></span>
                  <span className="text-sm text-neutral-500">{isConnected ? 'Connected' : 'Disconnected'}</span>
                </span>
              </div>
            )}
            
            {/* Mobile Hamburger Menu - Only visible if setup is complete */}
            {isSetupComplete && (
              <div className="flex sm:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="px-2">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link href="/" className="w-full cursor-pointer">
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/table-manager" className="w-full cursor-pointer">
                        Table Manager
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="w-full cursor-pointer">
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-default">
                      <div className="flex items-center space-x-2">
                        <span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-success' : 'bg-error'}`}></span>
                        <span className="text-sm">{isConnected ? 'Connected' : 'Disconnected'}</span>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
