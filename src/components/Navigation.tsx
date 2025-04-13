
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const Navigation = () => {
  const location = useLocation();
  
  return (
    <nav className="flex justify-center mb-8">
      <div className="bg-web3-light-purple/20 backdrop-blur-sm rounded-full p-1.5 flex space-x-1">
        <Link
          to="/"
          className={cn(
            "px-6 py-2 rounded-full transition-all duration-200 hover:text-web3-purple",
            location.pathname === '/' ? "bg-white text-web3-purple shadow-sm" : "text-gray-600"
          )}
        >
          Email Resolver
        </Link>
        
        <Link
          to="/crypto"
          className={cn(
            "px-6 py-2 rounded-full transition-all duration-200 hover:text-web3-purple",
            location.pathname === '/crypto' ? "bg-white text-web3-purple shadow-sm" : "text-gray-600"
          )}
        >
          Crypto Addresses
        </Link>
      </div>
    </nav>
  );
};

export default Navigation;
