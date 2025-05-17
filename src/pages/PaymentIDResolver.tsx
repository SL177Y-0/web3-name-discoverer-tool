import React, { useState } from 'react';
import DomainSearch from '@/components/DomainSearch';
import ResultModal from '@/components/ResultModal';
import { Web3NameService } from '@/services/Web3NameSDK';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Copy, AtSign } from 'lucide-react';
import { copyToClipboard } from '@/utils/clipboard';

const PaymentIDResolver = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentId, setPaymentId] = useState('');
  const [addresses, setAddresses] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (input: string) => {
    // Enforce that input contains @ to be a valid Payment ID
    if (!input.includes('@')) {
      setError('Please enter a valid Payment ID (e.g., username@domain)');
      setIsModalOpen(true);
      return;
    }

    setIsLoading(true);
    setError(null);
    setPaymentId(input);
    
    try {
      const addressResults = await Web3NameService.getAllAddresses(input);
      
      setAddresses(addressResults);
      setIsModalOpen(true);
      
      if (Object.keys(addressResults).length === 0) {
        setError(`No addresses found for ${input}. Please check if the Payment ID is correct.`);
      }
    } catch (err) {
      console.error('Error resolving addresses:', err);
      setError(`Failed to resolve Payment ID: ${input}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyAddress = async (address: string, network: string) => {
    await copyToClipboard(address, `${network} address`);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-web3-purple/10 rounded-full mb-4">
          <AtSign className="h-8 w-8 text-web3-purple" />
        </div>
        <h2 className="text-2xl font-bold text-web3-deep-blue mb-2">Payment ID Resolver</h2>
        <p className="text-gray-600 max-w-md mx-auto">
          Find all cryptocurrency addresses associated with a Payment ID like username@domain.
        </p>
      </div>
      
      <DomainSearch 
        onSearch={handleSearch} 
        isLoading={isLoading} 
        placeholder="Enter a Payment ID (e.g., username@binance)"
      />
      
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>A Payment ID is a human-readable identifier for sending crypto across multiple chains.</p>
        <p className="mt-1">Examples: john@binance, alice@coinbase, bob@metamask</p>
      </div>
      
      <ResultModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={`Crypto Addresses for ${paymentId}`}
      >
        {error ? (
          <div className="text-center py-4">
            <div className="mb-3 text-red-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-700">{error}</p>
          </div>
        ) : Object.keys(addresses).length > 0 ? (
          <div className="py-2">
            <h3 className="text-lg font-medium text-gray-900 mb-4 text-center">
              {Object.keys(addresses).length} Addresses Found
            </h3>
            
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {Object.entries(addresses).map(([network, address], index) => (
                <div key={network} className="group">
                  {index > 0 && <Separator className="my-3" />}
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-web3-deep-blue">{network}</h4>
                      <p className="text-sm text-gray-500 break-all mt-1">{address}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopyAddress(address, network)}
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            <p className="text-sm text-gray-500 mt-6 text-center">
              These addresses were found in the records for {paymentId}.
            </p>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-700">Processing your request...</p>
          </div>
        )}
      </ResultModal>
    </div>
  );
};

export default PaymentIDResolver; 