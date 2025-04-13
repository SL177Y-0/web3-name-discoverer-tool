
import React, { useState } from 'react';
import DomainSearch from '@/components/DomainSearch';
import ResultModal from '@/components/ResultModal';
import { Web3NameService } from '@/services/Web3NameSDK';
import { Button } from '@/components/ui/button';
import { Mail, Copy } from 'lucide-react';
import { copyToClipboard } from '@/utils/clipboard';
import { useToast } from '@/hooks/use-toast';

const EmailResolver = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [domain, setDomain] = useState('');
  const [email, setEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSearch = async (domainName: string) => {
    setIsLoading(true);
    setError(null);
    setDomain(domainName);
    
    try {
      const emailResult = await Web3NameService.getEmail(domainName);
      
      setEmail(emailResult);
      setIsModalOpen(true);
      
      if (!emailResult) {
        setError(`No email record found for ${domainName}`);
      }
    } catch (err) {
      console.error('Error resolving email:', err);
      setError(`Failed to resolve domain ${domainName}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyEmail = async () => {
    if (email) {
      await copyToClipboard(email, 'Email address');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-web3-purple/10 rounded-full mb-4">
          <Mail className="h-8 w-8 text-web3-purple" />
        </div>
        <h2 className="text-2xl font-bold text-web3-deep-blue mb-2">Email Address Resolver</h2>
        <p className="text-gray-600 max-w-md mx-auto">
          Enter a Web3 domain name to find its associated email address.
        </p>
      </div>
      
      <DomainSearch onSearch={handleSearch} isLoading={isLoading} />
      
      <ResultModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={`Email Result for ${domain}`}
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
        ) : email ? (
          <div className="text-center py-4">
            <div className="mb-6">
              <Mail className="h-12 w-12 mx-auto text-web3-purple mb-2" />
              <h3 className="text-lg font-medium text-gray-900">Email Found</h3>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between mb-6">
              <div className="font-medium text-gray-800 break-all">{email}</div>
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyEmail}
                className="flex-shrink-0 ml-2"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            
            <p className="text-sm text-gray-500">
              This email address was found in the records for {domain}.
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

export default EmailResolver;
