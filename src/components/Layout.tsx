
import React from 'react';
import Navigation from './Navigation';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-web3-soft-blue to-web3-light-purple">
      <div className="container mx-auto px-4 py-12">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-web3-deep-blue mb-2">
            Web3 Name Discoverer
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Resolve domain names to email addresses and cryptocurrency addresses using Space ID Web3 Name SDK
          </p>
        </header>
        
        <Navigation />
        
        <main>{children}</main>
        
        <footer className="mt-20 text-center text-gray-500 text-sm">
          <p>Built with Space ID Web3 Name SDK</p>
        </footer>
      </div>
    </div>
  );
};

export default Layout;
