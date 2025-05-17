import React from 'react';
import { NavLink } from 'react-router-dom';
import { Blocks, Mail, AtSign } from 'lucide-react';

const Navigation = () => {
  return (
    <nav className="py-4 px-6 border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xl font-bold text-web3-deep-blue">Web3 Name Resolver</span>
        </div>
        
        <div className="flex items-center space-x-1">
          <NavLink 
            to="/" 
            className={({ isActive }) => 
              `px-3 py-2 rounded-md text-sm font-medium ${
                isActive ? 'bg-web3-purple text-white' : 'text-gray-600 hover:bg-gray-100'
              }`
            }
            end
          >
            Home
          </NavLink>
          
          <NavLink 
            to="/crypto" 
            className={({ isActive }) => 
              `px-3 py-2 rounded-md text-sm font-medium flex items-center ${
                isActive ? 'bg-web3-purple text-white' : 'text-gray-600 hover:bg-gray-100'
              }`
            }
          >
            <Blocks className="mr-1 h-4 w-4" />
            Crypto Addresses
          </NavLink>
          
          <NavLink 
            to="/email-resolver" 
            className={({ isActive }) => 
              `px-3 py-2 rounded-md text-sm font-medium flex items-center ${
                isActive ? 'bg-web3-purple text-white' : 'text-gray-600 hover:bg-gray-100'
              }`
            }
          >
            <Mail className="mr-1 h-4 w-4" />
            Email Resolver
          </NavLink>

          <NavLink 
            to="/payment-id" 
            className={({ isActive }) => 
              `px-3 py-2 rounded-md text-sm font-medium flex items-center ${
                isActive ? 'bg-web3-purple text-white' : 'text-gray-600 hover:bg-gray-100'
              }`
            }
          >
            <AtSign className="mr-1 h-4 w-4" />
            Payment ID
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
